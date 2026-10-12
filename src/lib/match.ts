// The "brain" of the finder. Works for ANY category:
//  1. FILTER: remove products that break a "must have" (or the budget).
//  2. SCORE:  give each remaining product 0–100 based on how well it fits.
//  3. SORT:   best score first; if tied, cheaper first.
//  4. EXPLAIN: write short reasons (✓) and trade-offs (✗).
import { formatPrice, getCountry } from './countries';
import { formatSpec, getCategory, type Requirement, type SpecDef } from './categories';

export type SpecValue = number | string | boolean | string[];

export interface Product {
  id: string;
  category: string;
  country: string;
  store: string;
  name: string;
  price: number;
  link: string;
  lastChecked: string;
  image?: string; // photo address; if missing, a category drawing is shown instead
  imageCredit?: { author: string; license: string; source: string }; // photographer credit
  review: string; // short honest review ("Our take")
  pros: string[];
  cons: string[]; // always at least one
  specs: Record<string, SpecValue | undefined>;
}

// Everything the user told us.
export interface Needs {
  country: string;
  category: string;
  budget: number | null; // null = no limit
  reqs: Record<string, Requirement>; // spec key → what they want
}

export interface Match {
  product: Product;
  score: number; // 0–100
  reasons: string[]; // ✓ why it fits
  tradeoffs: string[]; // ✗ "nice to have" wishes it misses
}

// Is this requirement actually filled in? (An empty one is ignored.)
export function isActive(req: Requirement | undefined): req is Requirement {
  if (!req) return false;
  return req.min !== undefined || req.max !== undefined || (req.anyOf?.length ?? 0) > 0 || req.want !== undefined;
}

// Does ONE spec value satisfy ONE requirement?
// "partial" = how close it got (0 to 1), used for "nice to have" scoring.
function check(def: SpecDef, value: SpecValue | undefined, req: Requirement): { ok: boolean; partial: number } {
  if (value === undefined) return { ok: false, partial: 0 }; // unknown = doesn't count
  if (def.kind === 'number' && typeof value === 'number') {
    if (req.min !== undefined && value < req.min) return { ok: false, partial: value / req.min };
    if (req.max !== undefined && value > req.max) return { ok: false, partial: req.max / value };
    return { ok: true, partial: 1 };
  }
  if (def.kind === 'boolean') {
    const ok = value === req.want;
    return { ok, partial: ok ? 1 : 0 };
  }
  // choice: OK if ANY of the product's values is one the user picked
  const values = Array.isArray(value) ? value : [String(value)];
  const ok = values.some((v) => req.anyOf?.includes(v));
  return { ok, partial: ok ? 1 : 0 };
}

// Smallest and largest value of each number spec, so we can tell
// how good a value is compared with the other products (0 = worst, 1 = best).
type Ranges = Record<string, { lo: number; hi: number }>;

function getRanges(products: Product[], specs: SpecDef[]): Ranges {
  const ranges: Ranges = {};
  for (const def of specs) {
    if (def.kind !== 'number') continue;
    const values = products.map((p) => p.specs[def.key]).filter((v): v is number => typeof v === 'number');
    if (values.length > 0) ranges[def.key] = { lo: Math.min(...values), hi: Math.max(...values) };
  }
  return ranges;
}

function position(def: SpecDef, value: SpecValue | undefined, ranges: Ranges): number | null {
  const range = ranges[def.key];
  if (def.kind !== 'number' || def.better === 'none' || typeof value !== 'number' || !range) return null;
  if (range.hi === range.lo) return 1;
  const pos = (value - range.lo) / (range.hi - range.lo);
  return def.better === 'higher' ? pos : 1 - pos;
}

// Text like "at least 16 GB" or "Black or White", used in trade-offs.
function describeWish(def: SpecDef, req: Requirement): string {
  if (req.anyOf) return req.anyOf.join(' or ');
  if (req.want !== undefined) return req.want ? 'Yes' : 'No';
  const parts: string[] = [];
  if (req.min !== undefined) parts.push(`at least ${formatSpec(def, req.min)}`);
  if (req.max !== undefined) parts.push(`at most ${formatSpec(def, req.max)}`);
  return parts.join(' and ');
}

export function findMatches(products: Product[], needs: Needs): Match[] {
  const category = getCategory(needs.category);
  const country = getCountry(needs.country);

  // Only products from the chosen category and country.
  const pool = products.filter((p) => p.category === category.id && p.country === country.code);
  const ranges = getRanges(pool, category.specs);

  // The requirements the user actually filled in, paired with their spec definition.
  const active = Object.entries(needs.reqs)
    .map(([key, req]) => ({ def: category.specs.find((s) => s.key === key), req }))
    .filter((a): a is { def: SpecDef; req: Requirement } => a.def !== undefined && isActive(a.req));

  const matches: Match[] = [];

  for (const p of pool) {
    // ---- 1. FILTER ----
    if (needs.budget !== null && p.price > needs.budget) continue;
    const results = active.map((a) => ({ ...a, value: p.specs[a.def.key], ...check(a.def, p.specs[a.def.key], a.req) }));
    if (results.some((r) => r.req.importance === 'must' && !r.ok)) continue;

    // ---- 2. SCORE ----
    let points: number[];
    if (results.length > 0) {
      points = results.map((r) => {
        if (!r.ok) return 0.8 * r.partial; // missed a "nice to have": partial credit
        // Met it. For numbers, a bit extra for being better than the others.
        const pos = position(r.def, r.value, ranges);
        return pos === null ? 1 : 0.8 + 0.2 * pos;
      });
    } else {
      // Nothing picked yet: rank by overall specs ("best all-rounder").
      points = category.specs
        .map((def) => position(def, p.specs[def.key], ranges))
        .filter((pos): pos is number => pos !== null);
    }
    const average = points.length > 0 ? points.reduce((a, b) => a + b, 0) / points.length : 0;

    // ---- 4. EXPLAIN ----
    const reasons: string[] = [];
    const tradeoffs: string[] = [];
    if (needs.budget !== null) {
      const spare = needs.budget - p.price;
      reasons.push(spare > 0 ? `Fits your budget with ${formatPrice(spare, country)} to spare` : 'Fits your budget exactly');
    }
    for (const r of results) {
      // For choices, only mention the values the user picked (e.g. "Color: Black").
      const shown = r.ok && r.req.anyOf && Array.isArray(r.value) ? r.value.filter((v) => r.req.anyOf!.includes(v)) : r.value;
      const text = `${r.def.label}: ${formatSpec(r.def, shown)}`;
      if (r.ok) reasons.push(text);
      else tradeoffs.push(`${text} (you preferred ${describeWish(r.def, r.req)})`);
    }
    if (results.length === 0) {
      // Point out its standout specs instead.
      for (const def of category.specs) {
        const pos = position(def, p.specs[def.key], ranges);
        if (pos !== null && pos >= 0.75 && reasons.length < 3) {
          reasons.push(`${def.label}: ${formatSpec(def, p.specs[def.key])} (one of the best here)`);
        }
      }
    }

    matches.push({ product: p, score: Math.round(average * 100), reasons, tradeoffs });
  }

  // ---- 3. SORT ----
  return matches.sort((a, b) => b.score - a.score || a.product.price - b.product.price);
}
