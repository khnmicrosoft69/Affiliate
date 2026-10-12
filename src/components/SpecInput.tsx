// One row of the form for ONE spec. It draws the right control for the spec's kind:
//   number  → "at least" / "at most" box (or both for things like screen size)
//   choice  → clickable chips, pick any number of them
//   boolean → a "Required" checkbox
// Once something is filled in, a Must / Nice-to-have switch appears.
import { isActive } from '../lib/match';
import type { Requirement, SpecDef } from '../lib/categories';

interface Props {
  def: SpecDef;
  req: Requirement | undefined;
  options: string[]; // choices that exist in the products (choice specs)
  suggestions: number[]; // values that exist in the products (number specs)
  onChange: (req: Requirement) => void;
}

export default function SpecInput({ def, req, options, suggestions, onChange }: Props) {
  // Start from the current requirement, or a fresh "must" one.
  const current: Requirement = req ?? { importance: 'must' };
  const update = (patch: Partial<Requirement>) => onChange({ ...current, ...patch });

  // Converts the text in a number box to a number (or "nothing" if empty).
  const toNumber = (text: string) => (text === '' ? undefined : Number(text));
  const listId = `list-${def.key}`;

  return (
    <div className="spec">
      <div className="spec-label">
        <span>
          {def.label}
          {def.kind === 'number' && def.unit && <small> ({def.unit})</small>}
        </span>

        {isActive(req) && (
          <span className="importance" role="group" aria-label={`How important is ${def.label}?`}>
            <button
              type="button"
              className={current.importance === 'must' ? 'on' : ''}
              onClick={() => update({ importance: 'must' })}
            >
              Must
            </button>
            <button
              type="button"
              className={current.importance === 'nice' ? 'on' : ''}
              onClick={() => update({ importance: 'nice' })}
            >
              Nice to have
            </button>
          </span>
        )}
      </div>

      {def.kind === 'number' && (
        <div className="number-inputs">
          {def.better !== 'lower' && (
            <input
              type="number"
              inputMode="decimal"
              list={listId}
              placeholder={def.better === 'higher' ? 'at least…' : 'from…'}
              aria-label={`${def.label} minimum`}
              value={current.min ?? ''}
              onChange={(e) => update({ min: toNumber(e.target.value) })}
            />
          )}
          {def.better !== 'higher' && (
            <input
              type="number"
              inputMode="decimal"
              list={listId}
              placeholder={def.better === 'lower' ? 'at most…' : 'to…'}
              aria-label={`${def.label} maximum`}
              value={current.max ?? ''}
              onChange={(e) => update({ max: toNumber(e.target.value) })}
            />
          )}
          {/* datalist = suggestions that pop up while typing */}
          <datalist id={listId}>
            {suggestions.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>
      )}

      {def.kind === 'choice' && (
        <div className="chips">
          {options.map((option) => {
            const picked = current.anyOf?.includes(option) ?? false;
            return (
              <label key={option} className={picked ? 'chip on' : 'chip'}>
                <input
                  type="checkbox"
                  checked={picked}
                  onChange={() =>
                    update({
                      anyOf: picked
                        ? current.anyOf!.filter((o) => o !== option) // remove it
                        : [...(current.anyOf ?? []), option], // add it
                    })
                  }
                />
                {option}
              </label>
            );
          })}
        </div>
      )}

      {def.kind === 'boolean' && (
        <label className="checkbox">
          <input
            type="checkbox"
            checked={current.want === true}
            onChange={(e) => update({ want: e.target.checked ? true : undefined })}
          />
          Required
        </label>
      )}
    </div>
  );
}
