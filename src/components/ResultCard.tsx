// Shows ONE product result. Used by the Finder (in the browser)
// and by the guide pages (turned into plain HTML at build time).
import { formatPrice, getCountry } from '../lib/countries';
import { formatSpec, getCategory, getSpec } from '../lib/categories';
import type { Match } from '../lib/match';
import PhotoCredit from './PhotoCredit';
import ProductImage from './ProductImage';

interface Props {
  match: Match;
  rank: number; // 1 = best match
  showScore?: boolean;
}

export default function ResultCard({ match, rank, showScore = true }: Props) {
  const { product: p, score, reasons, tradeoffs } = match;
  const country = getCountry(p.country);
  const category = getCategory(p.category);

  // The category's key specs, e.g. "AMD Ryzen 5 · 16 GB · 512 GB · …"
  const summary = category.summary
    .map((key) => {
      const def = getSpec(category, key);
      const value = p.specs[key];
      if (!def || value === undefined) return null;
      if (def.kind === 'boolean') return value ? def.label : null; // show "ANC" only if it has it
      return def.kind === 'number' ? `${def.label} ${formatSpec(def, value)}` : formatSpec(def, value);
    })
    .filter(Boolean)
    .join(' · ');

  const colorDef = getSpec(category, 'color');
  const colors = p.specs.color;

  return (
    <article className="result card">
      <div className="result-media">
        <ProductImage product={p} />
        <PhotoCredit product={p} />
      </div>

      <div className="result-body">
      <div className="result-top">
        <span className="rank">#{rank}</span>
        <h3>{p.name}</h3>
        {showScore && <span className="score">{score}% match</span>}
      </div>

      <p className="price">
        {formatPrice(p.price, country)} <span className="store">on {p.store}</span>
      </p>

      <p className="specs">{summary}</p>
      {colorDef && colors !== undefined && <p className="specs">Colors: {formatSpec(colorDef, colors)}</p>}

      {/* Our honest take, with pros and cons (written by you in the product file) */}
      <div className="review">
        <p>
          <strong>Our take:</strong> {p.review}
        </p>
        <ul className="pros-cons">
          {p.pros.map((pro) => (
            <li key={pro} className="pro">{pro}</li>
          ))}
          {p.cons.map((con) => (
            <li key={con} className="con">{con}</li>
          ))}
        </ul>
      </div>

      {(reasons.length > 0 || tradeoffs.length > 0) && (
        <ul className="reasons">
          {reasons.map((r) => (
            <li key={r} className="yes">{r}</li>
          ))}
          {tradeoffs.map((t) => (
            <li key={t} className="no">{t}</li>
          ))}
        </ul>
      )}

      {/* rel="sponsored nofollow": tells Google this is an affiliate link (required by Google's rules).
          rel="noopener": the store's tab can't control this page (safety).
          target="_blank": opens the store in a new tab so the user keeps their results.
          data-…: details read by the click tracker in BaseLayout.astro (works on every page). */}
      <a
        className="buy"
        href={p.link}
        target="_blank"
        rel="sponsored nofollow noopener"
        data-product-id={p.id}
        data-product-name={p.name}
        data-store={p.store}
        data-category={p.category}
        data-country={p.country}
        data-price={p.price}
        data-rank={rank}
      >
        Buy on {p.store} →
      </a>
      <p className="checked">Price checked {p.lastChecked}</p>
      </div>
    </article>
  );
}
