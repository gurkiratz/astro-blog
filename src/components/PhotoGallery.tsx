// An album's photos, laid out in justified rows and openable as a lightbox.
// One click (or tap) opens the preview; the arrow keys page through it.
import { useState } from 'react';
import { RowsPhotoAlbum, type Photo } from 'react-photo-album';
import Lightbox from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'react-photo-album/rows.css';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import type { AlbumPhoto } from '../lib/cloudinary';

interface Props {
  photos: AlbumPhoto[];
}

/** Closed. The lightbox reads `index >= 0` as open. */
const CLOSED = -1;

/** Rows this tall read as a contact sheet on a phone and as prints on a
    desktop; the album fills whatever width it is given either way. */
function targetRowHeight(containerWidth: number) {
  if (containerWidth < 480) return 140;
  if (containerWidth < 900) return 200;
  return 260;
}

export default function PhotoGallery({ photos }: Props) {
  const [open, setOpen] = useState(CLOSED);

  const slides = photos.map((photo) => ({
    // The largest rendition we asked Cloudinary for — the last srcSet entry
    // is always the original's own width.
    src: photo.srcSet[photo.srcSet.length - 1]!.src,
    alt: photo.alt,
    width: photo.width,
    height: photo.height,
    srcSet: photo.srcSet,
  }));

  const albumPhotos: Photo[] = photos.map((photo) => ({
    key: photo.id,
    src: photo.src,
    alt: photo.alt,
    width: photo.width,
    height: photo.height,
    srcSet: photo.srcSet,
  }));

  return (
    <div className="photo-gallery">
      <RowsPhotoAlbum
        photos={albumPhotos}
        targetRowHeight={targetRowHeight}
        spacing={14}
        // The white mat around each frame. `padding` is what the album puts
        // between the photo and its own box, which the CSS then paints.
        padding={6}
        sizes={{ size: 'min(100vw - 3rem, 64rem)' }}
        onClick={({ index }) => setOpen(index)}
      />

      <Lightbox
        open={open >= 0}
        index={open < 0 ? 0 : open}
        close={() => setOpen(CLOSED)}
        slides={slides}
        plugins={[Zoom, Counter]}
        // Preview on macOS fades the image up over a dimmed desktop.
        animation={{ fade: 250, swipe: 400 }}
        carousel={{ padding: '3%', finite: true }}
        counter={{ container: { style: { top: 'unset', bottom: 0 } } }}
        styles={{
          container: { backgroundColor: 'rgba(8, 8, 8, 0.94)' },
        }}
      />
    </div>
  );
}
