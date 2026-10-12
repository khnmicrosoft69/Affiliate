// Shows a product's photo. If there's no photo (or it fails to load),
// it shows a simple drawing of the category instead, so every card has an image.
import { useState } from 'react';
import type { Product } from '../lib/match';

// Line drawings for each category (64×64 grid). "d" is the SVG drawing path.
const DRAWINGS: Record<string, string> = {
  laptop: 'M12 14h40v26H12zM6 44h52l-4 6H10z',
  tablet: 'M17 8h30a5 5 0 015 5v38a5 5 0 01-5 5H17a5 5 0 01-5-5V13a5 5 0 015-5zM30 50h4',
  audio: 'M14 40v-8a18 18 0 0136 0v8M10 38h8v14h-4a4 4 0 01-4-4zM54 38h-8v14h4a4 4 0 004-4z',
  monitor: 'M6 10h52v34H6zM32 44v8M22 54h20',
  keyboard: 'M8 20h48a4 4 0 014 4v18a4 4 0 01-4 4H8a4 4 0 01-4-4V24a4 4 0 014-4zM12 28h4M22 28h4M32 28h4M42 28h4M52 28h0M12 34h4M22 34h4M32 34h4M42 34h4M20 40h24',
  mouse: 'M32 8a12 12 0 0112 12v24a12 12 0 01-24 0V20A12 12 0 0132 8zM32 8v14',
  powerbank: 'M20 8h24a4 4 0 014 4v40a4 4 0 01-4 4H20a4 4 0 01-4-4V12a4 4 0 014-4zM34 20l-6 12h8l-6 12',
  charger: 'M18 22h28v22a6 6 0 01-6 6H24a6 6 0 01-6-6zM26 22V10M38 22V10M32 50v8',
  smartwatch: 'M24 6h16l2 10H22zM24 58h16l2-10H22zM22 16h20a4 4 0 014 4v24a4 4 0 01-4 4H22a4 4 0 01-4-4V20a4 4 0 014-4zM32 26v6l4 3',
  speaker: 'M22 6h20a6 6 0 016 6v40a6 6 0 01-6 6H22a6 6 0 01-6-6V12a6 6 0 016-6zM32 30a9 9 0 110 18 9 9 0 010-18zM32 14a3 3 0 110 6 3 3 0 010-6z',
  hub: 'M10 24h36a4 4 0 014 4v8a4 4 0 01-4 4H10zM50 32h8M16 30v4M24 30v4M32 30h6v4h-6z',
  portable: 'M22 16h20v38a4 4 0 01-4 4H26a4 4 0 01-4-4zM26 16V6h12v10M29 10h2M33 10h2',
  bag: 'M14 22a8 8 0 018-8h20a8 8 0 018 8v30a4 4 0 01-4 4H18a4 4 0 01-4-4zM24 14v-4a4 4 0 014-4h8a4 4 0 014 4v4M22 34h20v10H22z',
};

interface Props {
  product: Product;
  size?: 'large' | 'small'; // large = result cards, small = landing page thumbnail
}

export default function ProductImage({ product, size = 'large' }: Props) {
  const [failed, setFailed] = useState(false); // true if the photo couldn't load
  // "cover" = fill the whole frame (may trim the edges a little).
  // Very wide or very tall photos switch to "contain" so the product isn't cut off.
  const [fit, setFit] = useState<'cover' | 'contain'>('cover');

  // Looks at the photo's real shape and picks "contain" for very wide/tall photos.
  function checkShape(img: HTMLImageElement | null) {
    if (!img || !img.complete || img.naturalWidth === 0) return; // not loaded yet
    const ratio = img.naturalWidth / img.naturalHeight;
    if (ratio > 1.7 || ratio < 0.9) setFit('contain');
  }

  if (product.image && !failed) {
    return (
      <div className={`product-image ${size}`}>
        {/* loading="lazy": only download the photo when it's about to scroll into view (faster page).
            width/height: reserves the space so the page doesn't "jump" while loading. */}
        <img
          src={product.image}
          alt={product.name}
          width={320}
          height={320}
          loading="lazy"
          decoding="async"
          className={fit}
          // ref: runs when the <img> appears, in case the photo had already loaded by then.
          // onLoad: runs when the photo finishes loading later.
          ref={checkShape}
          onLoad={(e) => checkShape(e.currentTarget)}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  const brand = product.specs.brand;
  return (
    <div className={`product-image placeholder ${size}`} role="img" aria-label={product.name}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d={DRAWINGS[product.category] ?? DRAWINGS.laptop} />
      </svg>
      {size === 'large' && typeof brand === 'string' && <span>{brand}</span>}
    </div>
  );
}
