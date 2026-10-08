// Makes every image in a post body open in a lightbox. Markdown images are
// plain <img> tags rendered at build time, so rather than wrapping each one,
// this island finds them in `.prose` once it hydrates and listens for clicks.
// Images inside links are left alone so the link still wins.
import { useEffect, useState } from 'react';
import Lightbox, { type SlideImage } from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';

/** Closed. The lightbox reads `index >= 0` as open. */
const CLOSED = -1;

const SELECTOR = '.prose img:not(a img)';

export default function ProseLightbox() {
  const [slides, setSlides] = useState<SlideImage[]>([]);
  const [open, setOpen] = useState(CLOSED);

  useEffect(() => {
    const images = Array.from(document.querySelectorAll<HTMLImageElement>(SELECTOR));

    setSlides(
      images.map((img) => ({
        // Astro's optimised markdown images keep the original's width, so the
        // rendered src is already the largest version there is.
        src: img.currentSrc || img.src,
        alt: img.alt,
        // The figcaption already shows the alt text under the photo; repeat
        // it in the lightbox so the context comes along.
        description: img.alt || undefined,
        width: img.naturalWidth || Number(img.getAttribute('width')) || undefined,
        height: img.naturalHeight || Number(img.getAttribute('height')) || undefined,
      })),
    );

    const handlers = images.map((img, index) => {
      const onClick = () => setOpen(index);
      img.addEventListener('click', onClick);
      img.dataset.lightbox = '';
      return () => {
        img.removeEventListener('click', onClick);
        delete img.dataset.lightbox;
      };
    });
    return () => handlers.forEach((off) => off());
  }, []);

  return (
    <Lightbox
      open={open >= 0}
      index={open < 0 ? 0 : open}
      close={() => setOpen(CLOSED)}
      slides={slides}
      plugins={[Zoom, Captions]}
      animation={{ fade: 250, swipe: 400 }}
      carousel={{ padding: '3%', finite: true }}
      captions={{ descriptionTextAlign: 'center' }}
      // One image: no arrows to page through.
      render={slides.length <= 1 ? { buttonPrev: () => null, buttonNext: () => null } : undefined}
      styles={{
        container: { backgroundColor: 'rgba(8, 8, 8, 0.94)' },
      }}
    />
  );
}
