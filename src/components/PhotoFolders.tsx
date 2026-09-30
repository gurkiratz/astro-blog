// The /photos desktop: album folders you can push around like Finder icons.
//
// Positions are the visitor's, not the site's — they live in localStorage, so
// a rearranged desktop survives a reload but never leaves the browser. Until
// something is dragged there are no stored positions at all and the tiles use
// the default grid, which is also what the server renders.
import { useCallback, useEffect, useRef, useState } from "react";
import { navigate } from "astro:transitions/client";

export interface FolderTile {
  slug: string;
  name: string;
  count: number;
}

interface Props {
  albums: FolderTile[];
}

/** Tile footprint, and therefore the default grid's pitch. */
const TILE_W = 132;
const TILE_H = 136;

/** Pointer travel that turns a click into a drag. Below this it's a tap. */
const DRAG_THRESHOLD = 4;

const STORAGE_KEY = "photos:folder-positions";

type Positions = Record<string, { x: number; y: number }>;

function readStored(): Positions {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Positions) : {};
  } catch {
    // Private mode, disabled storage, or something non-JSON left behind.
    return {};
  }
}

function writeStored(positions: Positions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // Not being able to remember the layout is not worth breaking the page.
  }
}

/** Where a tile sits when it has never been dragged. */
function defaultPosition(index: number, columns: number) {
  return {
    x: (index % columns) * TILE_W,
    y: Math.floor(index / columns) * TILE_H,
  };
}

export default function PhotoFolders({ albums }: Props) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [positions, setPositions] = useState<Positions>({});
  /** Which tile is under an active pointer, and where the drag started. */
  const dragRef = useRef<{
    slug: string;
    pointerX: number;
    pointerY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  // A measured width is what switches the tiles from the server-rendered
  // wrapping row to absolute positioning, so this doubles as "mounted".
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    setPositions(readStored());

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(surface);
    return () => observer.disconnect();
  }, []);

  const columns = Math.max(1, Math.floor(width / TILE_W));
  const positioned = width > 0;

  const positionOf = useCallback(
    (slug: string, index: number) =>
      positions[slug] ?? defaultPosition(index, columns),
    [positions, columns]
  );

  const open = useCallback((slug: string) => {
    navigate(`/photos/${slug}/`);
  }, []);

  const handlePointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    slug: string,
    index: number
  ) => {
    // Let the browser keep right-click and middle-click for itself.
    if (event.button !== 0) return;

    const start = positionOf(slug, index);
    dragRef.current = {
      slug,
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: start.x,
      originY: start.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    const dx = event.clientX - drag.pointerX;
    const dy = event.clientY - drag.pointerY;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    drag.moved = true;

    // Keep a tile from being dragged off the left/right edges, where it
    // could only be recovered with the reset button.
    const maxX = Math.max(0, width - TILE_W);
    setPositions((current) => ({
      ...current,
      [drag.slug]: {
        x: Math.min(Math.max(0, drag.originX + dx), maxX),
        y: Math.max(0, drag.originY + dy),
      },
    }));
  };

  const handlePointerUp = (slug: string) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;

    if (drag.moved) {
      setPositions((current) => {
        writeStored(current);
        return current;
      });
      return;
    }

    // A click or tap that never became a drag opens the folder.
    open(slug);
  };

  const reset = () => {
    setPositions({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Same as writeStored: nothing here is worth throwing over.
    }
  };

  const moved = Object.keys(positions).length > 0;

  // Absolute children are out of flow, so the surface needs an explicit
  // height — the taller of the default grid and whatever has been dragged
  // furthest down.
  const rows = Math.max(1, Math.ceil(albums.length / columns));
  const height = positioned
    ? Math.max(
        rows * TILE_H,
        ...albums.map((album, i) => positionOf(album.slug, i).y + TILE_H)
      )
    : undefined;

  return (
    <div className="photo-desktop">
      <div className="photo-desktop-bar">
        <p className="photo-desktop-hint">
          {albums.length} {albums.length === 1 ? "folder" : "folders"} · drag to
          rearrange, click to open
        </p>
        <button
          type="button"
          className="photo-desktop-reset"
          onClick={reset}
          disabled={!moved}
        >
          Reset layout
        </button>
      </div>

      <div
        ref={surfaceRef}
        className="photo-desktop-surface"
        data-positioned={positioned || undefined}
        style={height ? { height } : undefined}
      >
        {albums.map((album, index) => {
          const { x, y } = positionOf(album.slug, index);
          return (
            <button
              key={album.slug}
              type="button"
              className="photo-folder"
              style={
                positioned
                  ? { transform: `translate3d(${x}px, ${y}px, 0)` }
                  : undefined
              }
              onPointerDown={(e) => handlePointerDown(e, album.slug, index)}
              onPointerMove={handlePointerMove}
              onPointerUp={() => handlePointerUp(album.slug)}
              onPointerCancel={() => {
                dragRef.current = null;
              }}
              aria-label={`${album.name}, ${album.count} photos`}
            >
              <FolderIcon />
              <span className="photo-folder-name">{album.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The photos-folder icon, exported from a macOS .icns at 1x and 2x. It is
    decoration: the button's aria-label already names the folder. */
function FolderIcon() {
  return (
    <img
      className="photo-folder-icon"
      src="/photos/folder.png"
      srcSet="/photos/folder.png 1x, /photos/folder@2x.png 2x"
      width={128}
      height={128}
      alt=""
      draggable={false}
    />
  );
}
