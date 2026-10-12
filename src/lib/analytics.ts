// Sends "events" (things users do) to Google Analytics 4.
// GA4 also records each visitor's country by itself, so you can see where
// your visitors come from even if they never use the finder.
//
// It only works after you add your GA4 Measurement ID (see README, section 8).
// Until then, events are just printed in the browser console during `npm run dev`.

// Tells TypeScript that window.gtag may exist (Google's script adds it).
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, params: Record<string, string | number> = {}): void {
  if (typeof window === 'undefined') return; // during the build there's no browser
  if (window.gtag) {
    window.gtag('event', event, params);
  } else if (import.meta.env.DEV) {
    console.info('[track]', event, params);
  }
}
