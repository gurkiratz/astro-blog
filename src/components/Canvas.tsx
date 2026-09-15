// The /canvas island: a tldraw infinite canvas backed by Supabase.
//
// Public to read, owner to edit — visitors get the document in tldraw's
// read-only mode, and the write path is gated by RLS on the server regardless
// of what this file does (supabase/migrations/0002_canvas_policies.sql).
//
// Everything here is client-only (see canvas.astro) — tldraw measures the DOM
// on mount, so there is nothing useful to server-render.
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Tldraw,
  getSnapshot,
  type Editor,
  type TLEditorComponents,
  type TLEditorSnapshot,
  type TLStoreSnapshot,
} from 'tldraw';
import 'tldraw/tldraw.css';
import CanvasSignIn from './CanvasSignIn';
import {
  assetStore,
  canEditCanvas,
  isConfigured,
  loadDocument,
  loadSession,
  saveDocument,
  saveSession,
  supabase,
} from '../lib/canvas-store';

/** How long to sit idle before writing. Long enough that a stroke is one save. */
const SAVE_DEBOUNCE_MS = 800;
/** …but never hold edits longer than this, however continuously they arrive. */
const SAVE_MAX_WAIT_MS = 5000;
const SESSION_DEBOUNCE_MS = 500;

const components: TLEditorComponents = {
  // No canvas background of tldraw's own — the site's background (flat color,
  // image, or video, depending on the active theme) shows straight through.
  Background: null,
};

/**
 * The site's palette is driven by `data-theme="dark|light"` on <html>, set by
 * ThemeBootstrap before first paint and updated on every theme switch. Mirror
 * it into tldraw so its UI chrome follows along.
 */
function useSiteColorScheme(): 'dark' | 'light' {
  const [scheme, setScheme] = useState<'dark' | 'light'>(() =>
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
  );

  useEffect(() => {
    const root = document.documentElement;
    const read = () =>
      setScheme(root.dataset.theme === 'light' ? 'light' : 'dark');

    // An attribute observer rather than a `themechange` listener: it catches
    // the pre-paint bootstrap and the astro:after-swap re-apply too, and it
    // can't race ThemeBootstrap's own handler.
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    read();

    return () => observer.disconnect();
  }, []);

  return scheme;
}

/**
 * Tracks the Supabase session and whether that user may write to the canvas.
 * `onSignedIn` fires only for a fresh sign-in — not for a session restored on
 * page load, which arrives as `INITIAL_SESSION`.
 */
function useCanvasAuth(onSignedIn: () => void) {
  const [email, setEmail] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  // Kept in a ref so the subscription below doesn't need re-creating (and
  // re-firing) every time the parent re-renders with a new callback.
  const onSignedInRef = useRef(onSignedIn);
  onSignedInRef.current = onSignedIn;

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    const apply = async (address: string | null) => {
      if (cancelled) return;
      setEmail(address);
      // Ask the server, don't infer from "is signed in" — anyone can sign up.
      const allowed = address ? await canEditCanvas() : false;
      if (!cancelled) setCanEdit(allowed);
    };

    // Fires once with the current session (including one just picked up out
    // of a magic-link URL), then again on every sign-in and sign-out.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      void apply(session?.user.email ?? null);
      if (event === 'SIGNED_IN') onSignedInRef.current();
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  return { email, canEdit };
}

type SaveState =
  | { status: 'idle' }
  | { status: 'saving' }
  | { status: 'error'; message: string };

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; snapshot?: TLEditorSnapshot | TLStoreSnapshot };

export default function Canvas() {
  const colorScheme = useSiteColorScheme();
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [save, setSave] = useState<SaveState>({ status: 'idle' });

  // The sign-in form is for the owner, not for visitors — see CanvasSignIn.
  const [showSignIn, setShowSignIn] = useState(
    () => new URLSearchParams(window.location.search).has('edit'),
  );

  // Coming back from a magic link lands on ?edit, which has now done its job.
  // Drop it, so what's left is a clean canvas rather than a panel sitting in
  // the corner you're trying to draw in. Visiting ?edit while already signed
  // in still shows the panel — that's how you sign out.
  const handleSignedIn = useCallback(() => {
    setShowSignIn(false);
    const url = new URL(window.location.href);
    if (!url.searchParams.has('edit')) return;
    url.searchParams.delete('edit');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const { email, canEdit } = useCanvasAuth(handleSignedIn);

  const editorRef = useRef<Editor | null>(null);
  // Read inside the save closure, which is created once on mount and would
  // otherwise capture the initial `false`.
  const canEditRef = useRef(canEdit);
  canEditRef.current = canEdit;

  // Fetch before rendering <Tldraw> rather than loading a snapshot into a
  // mounted editor: it avoids a frame of empty canvas, and it keeps the saved
  // document out of the undo history (an undo can't wipe it back to blank).
  useEffect(() => {
    let cancelled = false;

    if (!isConfigured) {
      setLoad({
        status: 'error',
        message:
          'Canvas storage is not configured — PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY are missing.',
      });
      return;
    }

    loadDocument()
      .then((document) => {
        if (cancelled) return;
        const session = loadSession();
        if (!document) {
          // Nothing saved yet: start blank. A session snapshot without a
          // document would point the camera at shapes that don't exist.
          setLoad({ status: 'ready' });
          return;
        }
        setLoad({
          status: 'ready',
          snapshot: session
            ? ({ document, session } as TLEditorSnapshot)
            : document,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoad({
          status: 'error',
          message: error instanceof Error ? error.message : String(error),
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Read-only mode hides every editing tool and blocks document mutations, so
  // a visitor can pan, zoom and select but not change anything. The server
  // would refuse their writes anyway; this keeps them from wasting the effort.
  useEffect(() => {
    editorRef.current?.updateInstanceState({ isReadonly: !canEdit });
  }, [canEdit]);

  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor;
    editor.updateInstanceState({ isReadonly: !canEditRef.current });

    let debounceTimer: number | undefined;
    let maxWaitTimer: number | undefined;
    let sessionTimer: number | undefined;
    // Set while a write is in flight, so a change that lands mid-write queues
    // another pass instead of being swallowed.
    let writing = false;
    let dirty = false;
    let disposed = false;

    const clearTimers = () => {
      window.clearTimeout(debounceTimer);
      window.clearTimeout(maxWaitTimer);
      debounceTimer = undefined;
      maxWaitTimer = undefined;
    };

    const write = async () => {
      clearTimers();
      if (disposed || writing || !canEditRef.current) return;

      writing = true;
      dirty = false;
      setSave({ status: 'saving' });

      try {
        const { document } = getSnapshot(editor.store);
        await saveDocument(document);
        if (!disposed) setSave({ status: 'idle' });
      } catch (error: unknown) {
        dirty = true;
        if (!disposed) {
          setSave({
            status: 'error',
            message: error instanceof Error ? error.message : String(error),
          });
        }
      } finally {
        writing = false;
        // Either a change arrived mid-write or the write failed; try again on
        // the normal debounce rather than hammering the API.
        if (dirty && !disposed) scheduleWrite();
      }
    };

    const scheduleWrite = () => {
      if (!canEditRef.current) return;
      dirty = true;
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(write, SAVE_DEBOUNCE_MS);
      // Continuous drawing keeps resetting the debounce, so cap the wait.
      if (maxWaitTimer === undefined) {
        maxWaitTimer = window.setTimeout(write, SAVE_MAX_WAIT_MS);
      }
    };

    // `source: 'user'` skips changes we applied ourselves; `scope: 'document'`
    // skips camera and selection, which are saved separately below.
    const unlistenDocument = editor.store.listen(scheduleWrite, {
      source: 'user',
      scope: 'document',
    });

    // Camera and selection are per-browser, so they stay in localStorage —
    // syncing them would yank the viewport around when another device moved.
    const unlistenSession = editor.store.listen(
      () => {
        window.clearTimeout(sessionTimer);
        sessionTimer = window.setTimeout(() => {
          saveSession(getSnapshot(editor.store).session);
        }, SESSION_DEBOUNCE_MS);
      },
      { scope: 'session' },
    );

    // A debounced save can still be pending when the tab is closed or hidden,
    // so start it early rather than waiting out the debounce. This is a
    // best-effort head start, not a guarantee: the request can't be awaited
    // during teardown, so a close within the debounce window can still lose
    // the last edit.
    const flush = () => {
      saveSession(getSnapshot(editor.store).session);
      if (dirty) void write();
    };
    // `visibilitychange` covers backgrounding and is the one that fires
    // reliably on mobile; `pagehide` covers an actual close.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      flush();
      disposed = true;
      editorRef.current = null;
      clearTimers();
      window.clearTimeout(sessionTimer);
      unlistenDocument();
      unlistenSession();
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  if (load.status === 'loading') {
    return <p className="canvas-message">Loading canvas…</p>;
  }

  if (load.status === 'error') {
    return <p className="canvas-message">{load.message}</p>;
  }

  return (
    <>
      <Tldraw
        snapshot={load.snapshot}
        assets={assetStore}
        colorScheme={colorScheme}
        components={components}
        onMount={handleMount}
      />
      {showSignIn && <CanvasSignIn email={email} canEdit={canEdit} />}
      {save.status !== 'idle' && (
        <p className="canvas-status" role="status">
          {save.status === 'saving' ? 'Saving…' : `Not saved — ${save.message}`}
        </p>
      )}
    </>
  );
}
