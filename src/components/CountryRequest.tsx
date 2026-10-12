// A small box where visitors from other countries tell us where they are.
// Each answer is sent to Google Analytics as a "country_request" event,
// so you can see which country to add next (see README, section 8).
import { useState } from 'react';
import { REQUESTABLE_COUNTRIES } from '../lib/countries';
import { track } from '../lib/analytics';

interface Props {
  onClose: () => void;
}

// Intl.DisplayNames turns a code like "SG" into a name like "Singapore".
const names = new Intl.DisplayNames(['en'], { type: 'region' });
const OPTIONS = REQUESTABLE_COUNTRIES.map((code) => ({ code, name: names.of(code) ?? code })).sort((a, b) =>
  a.name.localeCompare(b.name),
);

export default function CountryRequest({ onClose }: Props) {
  const [picked, setPicked] = useState('');
  const [sent, setSent] = useState(false);

  function send() {
    if (!picked) return;
    track('country_request', { requested_country: picked });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="country-request">
        <p>
          Thanks! We've noted that you'd like {picked === 'OTHER' ? 'your country' : names.of(picked)}. The more requests a country gets,
          the sooner we add it.
        </p>
        <button type="button" className="link-button" onClick={onClose}>
          Back to the finder
        </button>
      </div>
    );
  }

  return (
    <div className="country-request">
      <label htmlFor="request-country">We're not in your country yet. Where are you?</label>
      <div className="request-row">
        <select id="request-country" value={picked} onChange={(e) => setPicked(e.target.value)}>
          <option value="">Choose your country</option>
          {OPTIONS.map((o) => (
            <option key={o.code} value={o.code}>
              {o.name}
            </option>
          ))}
          <option value="OTHER">Somewhere else</option>
        </select>
        <button type="button" className="small-button" onClick={send} disabled={!picked}>
          Request it
        </button>
      </div>
      <button type="button" className="link-button" onClick={onClose}>
        Cancel
      </button>
    </div>
  );
}
