// Supabase-backed persistence for /canvas.
//
// tldraw splits a snapshot in two (see https://tldraw.dev/docs/persistence):
//   - `document` — shapes, pages, bindings. Shared, so it lives in Postgres.
//   - `session`  — camera position, selection, UI state. Per browser, so it
//                  stays in localStorage; syncing it would yank the viewport
//                  around whenever another device moved.
//
// Pasted images don't belong in the JSON (a snapshot full of base64 would blow
// past the row size in a hurry), so they go to Supabase Storage and the
// document only holds their URL.
import { createClient } from '@supabase/supabase-js';
import {
  uniqueId,
  type TLAssetStore,
  type TLSessionStateSnapshot,
  type TLStoreSnapshot,
} from 'tldraw';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

/** Row id in canvas_documents. One row = one canvas; this site has a single one. */
const DOCUMENT_ID = 'main';
const BUCKET = 'canvas-assets';
const SESSION_STORAGE_KEY = 'canvas-session';

/** Matches the bucket's file_size_limit, so oversized files fail here with a
 *  readable message instead of a 413 from the storage API. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        // Keep the owner signed in across visits, and pick the session up out
        // of the URL when they come back from a magic link.
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Whether the signed-in user is on the canvas_editors allowlist. Asked up
 * front so the canvas can open read-only rather than letting someone draw and
 * only then discovering the write is refused.
 *
 * Being signed in is not enough on its own: anyone can create an account
 * through the public auth endpoint, so the allowlist is the real gate (see
 * supabase/migrations/0002_canvas_policies.sql).
 */
export async function canEditCanvas(): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('is_canvas_editor');
  if (error) return false;
  return data === true;
}

/** Loads the shared document half of the snapshot. `null` = nothing saved yet. */
export async function loadDocument(): Promise<TLStoreSnapshot | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('canvas_documents')
    .select('document')
    .eq('id', DOCUMENT_ID)
    .maybeSingle();

  if (error) throw new Error(`Couldn't load the canvas: ${error.message}`);
  return (data?.document as TLStoreSnapshot | undefined) ?? null;
}

export async function saveDocument(document: TLStoreSnapshot): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('canvas_documents').upsert(
    {
      id: DOCUMENT_ID,
      document,
      schema_version: document.schema?.schemaVersion ?? null,
    },
    { onConflict: 'id' },
  );

  if (error) throw new Error(error.message);
}

// ── Session state (camera, selection) — local to this browser ──────────────

export function loadSession(): TLSessionStateSnapshot | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    // This is fed straight into tldraw's store, which throws on a malformed
    // session and would take the whole canvas down with it. `version` is the
    // one field tldraw guarantees, so it's the cheap sanity check; anything
    // that fails it is treated as no saved camera at all.
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as { version?: unknown }).version !== 'number'
    ) {
      return null;
    }
    return parsed as TLSessionStateSnapshot;
  } catch {
    // Private windows and cleared site data both land here; a missing camera
    // position just means the canvas opens at the origin.
    return null;
  }
}

export function saveSession(session: unknown): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Not worth surfacing — the document itself is safely on the server.
  }
}

// ── Images and video, via Supabase Storage ─────────────────────────────────

/**
 * tldraw calls `upload` when a file is pasted or dropped, and `resolve` every
 * time it needs a URL to render one. See https://tldraw.dev/examples/hosted-images.
 */
export const assetStore: TLAssetStore = {
  async upload(_asset, file) {
    if (!supabase) throw new Error('Canvas storage is not configured.');

    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error(
        `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${
          MAX_UPLOAD_BYTES / 1024 / 1024
        } MB.`,
      );
    }

    // Keep a readable name for debugging in the Supabase dashboard, but strip
    // it to characters that are safe in an object key.
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '-').slice(-60);
    const objectName = `${uniqueId()}-${safeName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(objectName, file, {
        contentType: file.type || 'application/octet-stream',
        cacheControl: '31536000',
        upsert: false,
      });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    // A public URL rather than a signed one: these URLs are baked into the
    // saved document, and a signed URL would expire while the shape lives on.
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectName);
    return { src: data.publicUrl };
  },

  resolve(asset) {
    return asset.props.src;
  },

  // Deliberately no `remove`: deleting a shape is undoable, and dropping the
  // object from the bucket would leave the undone shape pointing at a 404.
};
