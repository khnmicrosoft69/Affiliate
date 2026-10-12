// The interactive finder: pick a country and a category, then any specs.
// The form is built automatically from src/lib/categories.ts, so new
// categories and specs show up here without changing this file.
import { useEffect, useState } from 'react';
import { COUNTRIES, DEFAULT_COUNTRY, getCountry, guessCountry } from '../lib/countries';
import { track } from '../lib/analytics';
import { CATEGORIES, getCategory, type Requirement, type SpecDef } from '../lib/categories';
import { findMatches, isActive, type Product } from '../lib/match';
import CountryRequest from './CountryRequest';
import ResultCard from './ResultCard';
import SpecInput from './SpecInput';

interface Props {
  products: Product[]; // every product, handed over by find.astro
}

const COUNTRY_KEY = 'finder-country'; // name used to remember the country
const OTHER = 'other'; // the "My country isn't listed" option in the country menu

export default function Finder({ products }: Props) {
  // "State" = values that can change. When one changes, React redraws the page.
  const [country, setCountry] = useState(DEFAULT_COUNTRY.code);
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const [budget, setBudget] = useState(''); // text from the budget box
  const [reqs, setReqs] = useState<Record<string, Requirement>>({});
  const [presetId, setPresetId] = useState<string | null>(null);
  const [showRequest, setShowRequest] = useState(false); // "My country isn't listed" box
  const [filtersOpen, setFiltersOpen] = useState(false); // phones only: is the filter panel open?

  const category = getCategory(categoryId);
  const countryInfo = getCountry(country);

  // Runs once when the page opens: read answers from the web address
  // (guide pages link to e.g. /find/?category=laptop&preset=coding&budget=30000)
  // and pick the country.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = getCategory(params.get('category') ?? '');
    setCategoryId(cat.id);
    if (params.get('budget')) setBudget(params.get('budget')!);
    const preset = cat.presets.find((p) => p.id === params.get('preset'));
    if (preset) {
      setReqs(structuredClone(preset.reqs)); // structuredClone = make a copy
      setPresetId(preset.id);
    }

    // Which country to start with, in order of priority:
    //   1. ?country=PH in the address   2. what they picked last time
    //   3. a guess from their time zone 4. the default (Philippines)
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(COUNTRY_KEY);
    } catch {
      // Some browsers block storage (private mode). That's fine, just skip it.
    }
    const fromUrl = params.get('country')?.toUpperCase() ?? null;
    const guess = guessCountry();
    const isSupported = (code: string | null) => COUNTRIES.some((c) => c.code === code);
    const [start, source] = isSupported(fromUrl)
      ? [fromUrl!, 'link']
      : isSupported(saved)
        ? [saved!, 'saved']
        : guess
          ? [guess.code, 'time_zone']
          : [DEFAULT_COUNTRY.code, 'default'];
    setCountry(start);

    // Tell Google Analytics which country the finder started in, and why.
    track('finder_open', { country: start, country_source: source, category: cat.id });
  }, []);

  function changeCountry(code: string) {
    if (code === OTHER) {
      setShowRequest(true);
      track('country_menu_other');
      return;
    }
    setShowRequest(false);
    setCountry(code);
    track('country_selected', { country: code });
    try {
      localStorage.setItem(COUNTRY_KEY, code);
    } catch {}
  }

  function changeCategory(id: string) {
    track('category_selected', { country, category: id });
    setCategoryId(id);
    setReqs({}); // specs are different per category, so start fresh
    setPresetId(null);
  }

  function choosePreset(id: string) {
    if (presetId === id) {
      // clicking the active quick pick again turns it off
      setReqs({});
      setPresetId(null);
      return;
    }
    setReqs(structuredClone(category.presets.find((p) => p.id === id)!.reqs));
    setPresetId(id);
  }

  function changeReq(key: string, req: Requirement) {
    setReqs((current) => {
      const next = { ...current };
      if (isActive(req)) next[key] = req;
      else delete next[key]; // emptied → forget it
      return next;
    });
    setPresetId(null); // user customized, so it's no longer exactly the quick pick
  }

  function resetAll() {
    setReqs({});
    setPresetId(null);
    setBudget('');
  }

  // Products the user could see: this category + this country.
  const pool = products.filter((p) => p.category === category.id && p.country === country);

  // Values that actually exist in the products, used to build chips and suggestions.
  function optionsFor(def: SpecDef): string[] {
    const found = new Set<string>();
    for (const p of pool) {
      const v = p.specs[def.key];
      for (const item of Array.isArray(v) ? v : v === undefined ? [] : [String(v)]) found.add(item);
    }
    reqs[def.key]?.anyOf?.forEach((o) => found.add(o)); // keep already-picked ones visible
    // Use the order from categories.ts if there is one, otherwise A→Z.
    return def.kind === 'choice' && def.options
      ? def.options.filter((o) => found.has(o))
      : [...found].sort();
  }
  function suggestionsFor(def: SpecDef): number[] {
    const values = pool.map((p) => p.specs[def.key]).filter((v): v is number => typeof v === 'number');
    return [...new Set(values)].sort((a, b) => a - b);
  }

  // Hide specs that no product in this list has data for (keeps the form short).
  const usableSpecs = category.specs.filter((def) => pool.some((p) => p.specs[def.key] !== undefined));
  const groups = [...new Set(usableSpecs.map((s) => s.group))];

  const budgetNumber = Number(budget);
  const matches = findMatches(products, {
    country,
    category: category.id,
    budget: budget !== '' && budgetNumber > 0 ? budgetNumber : null,
    reqs,
  });
  const activeCount = Object.values(reqs).filter(isActive).length;
  const filterCount = activeCount + (budget !== '' ? 1 : 0);

  // Layout: items on the LEFT, filters on the RIGHT (see .finder in global.css).
  // On phones there's no room for two columns, so the filters hide behind a button.
  return (
    <div className="finder">
      {/* Phones only: the bar with the "Filters" button */}
      <div className="mobile-filter-bar">
        <button
          type="button"
          className="filters-toggle"
          aria-expanded={filtersOpen}
          aria-controls="filters"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          {filtersOpen ? 'Hide filters' : 'Filters'}
          {filterCount > 0 && <span className="badge">{filterCount}</span>}
        </button>
        <span>
          {category.label} · {countryInfo.stores.join(', ')}
        </span>
      </div>

      {/* onSubmit preventDefault: stops the page from reloading when Enter is pressed */}
      <form
        id="filters"
        className={filtersOpen ? 'filters card open' : 'filters card'}
        onSubmit={(e) => e.preventDefault()}
      >
        <h2 className="filters-title">Filters</h2>
        <div className="field">
          <label htmlFor="country">1. Your country</label>
          <select
            id="country"
            value={showRequest ? OTHER : country}
            onChange={(e) => changeCountry(e.target.value)}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
            <option value={OTHER}>My country isn't listed…</option>
          </select>
          {showRequest ? (
            <CountryRequest onClose={() => setShowRequest(false)} />
          ) : (
            <small>Stores: {countryInfo.stores.join(', ')}</small>
          )}
        </div>

        <fieldset className="field">
          <legend>2. What are you looking for?</legend>
          {(['Gadgets', 'Accessories'] as const).map((group) => (
            <div key={group} className="category-group">
              <small>{group}</small>
              <div className="chips">
                {CATEGORIES.filter((c) => c.group === group).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={c.id === category.id ? 'chip on' : 'chip'}
                    aria-pressed={c.id === category.id}
                    onClick={() => changeCategory(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </fieldset>

        <div className="field">
          <label htmlFor="budget">3. Maximum budget ({countryInfo.currency})</label>
          <input
            id="budget"
            type="number"
            inputMode="numeric"
            min={0}
            step={500}
            placeholder={`e.g. ${countryInfo.budgetExample}`}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>

        {category.presets.length > 0 && (
          <div className="field">
            <span className="field-title">4. Quick picks (optional)</span>
            <div className="chips">
              {category.presets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={p.id === presetId ? 'chip on' : 'chip'}
                  aria-pressed={p.id === presetId}
                  onClick={() => choosePreset(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="field">
          <span className="field-title">5. Specs, style & features</span>
          <small>
            Set only what you care about. <b>Must</b> hides products that don't have it.{' '}
            <b>Nice to have</b> just ranks them higher.
          </small>
          {/* key={category.id}: start with fresh (closed) sections when the category changes */}
          <div key={category.id}>
            {groups.map((group, i) => {
              const specs = usableSpecs.filter((s) => s.group === group);
              const setHere = specs.filter((s) => isActive(reqs[s.key])).length;
              return (
                // <details> = a section the user can open and close
                <details key={group} className="spec-group" open={i === 0}>
                  <summary>
                    {group} {setHere > 0 && <span className="badge">{setHere} set</span>}
                  </summary>
                  {specs.map((def) => (
                    <SpecInput
                      key={def.key}
                      def={def}
                      req={reqs[def.key]}
                      options={optionsFor(def)}
                      suggestions={suggestionsFor(def)}
                      onChange={(req) => changeReq(def.key, req)}
                    />
                  ))}
                </details>
              );
            })}
          </div>
        </div>

        {filterCount > 0 && (
          <button type="button" className="link-button" onClick={resetAll}>
            Clear all answers
          </button>
        )}

        {/* Phones only: close the panel and see the items */}
        <button type="button" className="show-results" onClick={() => setFiltersOpen(false)}>
          Show {matches.length} {matches.length === 1 ? 'item' : 'items'}
        </button>
      </form>

      {/* aria-live: screen readers announce when the results change */}
      <section className="results" aria-live="polite">
        <h2 className="results-title">
          {category.label}: {matches.length} of {pool.length} match
        </h2>
        {pool.length === 0 && <p className="empty">No products in this category yet. Check back soon!</p>}
        {pool.length > 0 && matches.length === 0 && (
          <p className="empty">
            Nothing fits every "Must". Try a higher budget, or change some to "Nice to have".
          </p>
        )}
        {matches.map((m, i) => (
          <ResultCard key={m.product.id} match={m} rank={i + 1} />
        ))}
      </section>
    </div>
  );
}
