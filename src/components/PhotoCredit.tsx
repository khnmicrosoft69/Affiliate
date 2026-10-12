// The small "Photo: name · license" line under a product photo.
// Creative Commons photos (CC BY, CC BY-SA) must credit the photographer,
// name the license and link to the source. This does all three.
import type { Product } from '../lib/match';

interface Props {
  product: Product;
}

export default function PhotoCredit({ product }: Props) {
  const credit = product.imageCredit;
  if (!product.image || !credit) return null;
  return (
    <p className="photo-credit">
      Photo:{' '}
      <a href={credit.source} target="_blank" rel="noopener">
        {credit.author}
      </a>{' '}
      · {credit.license}
    </p>
  );
}
