// Google Analytics 4. Loads only in production builds with a measurement ID,
// so local development never sends data.

import { OPT_IN_REGIONS } from '../shared/consent-regions.ts';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const measurementId: string | undefined = import.meta.env.VITE_GA_MEASUREMENT_ID;

/** True when this build sends data to Google Analytics. */
export const analyticsEnabled = import.meta.env.PROD && Boolean(measurementId);

/**
 * Add ?consent to the URL to show the consent banner and the footer's
 * "Cookie settings" link, even locally where analytics is off.
 */
export const consentPreview = new URLSearchParams(location.search).has('consent');

/** Whether the consent banner and its footer link should be available. */
export const consentUiEnabled = analyticsEnabled || consentPreview;

export type Consent = 'granted' | 'denied';

const CONSENT_KEY = 'mf-analytics-consent';


/** The visitor's saved choice, or null if they haven't chosen yet. */
export function savedConsent(): Consent | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

const REGION_KEY = 'mf-consent-required';

/**
 * Whether this visitor's country needs opt-in consent, asked of /api/region
 * once per browser session. Any failure counts as yes, to be safe.
 */
export async function consentRequired(): Promise<boolean> {
  try {
    const cached = sessionStorage.getItem(REGION_KEY);
    if (cached !== null) return cached === 'true';
  } catch {
    // Storage blocked: ask the server.
  }
  try {
    const res = await fetch('/api/region');
    const { consentRequired } = await res.json();
    const required = consentRequired !== false;
    try {
      sessionStorage.setItem(REGION_KEY, String(required));
    } catch {
      // Storage blocked: fine, we'll ask again next page load.
    }
    return required;
  } catch {
    return true;
  }
}

/** Saves the visitor's choice and applies it to Google Analytics. */
export function setConsent(consent: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, consent);
  } catch {
    // Storage blocked: the choice still applies for this visit.
  }
  window.gtag?.('consent', 'update', { analytics_storage: consent });
}

/** Sends a GA4 event. Does nothing when analytics isn't loaded. */
export function track(name: string, params: Record<string, string | number | boolean> = {}) {
  window.gtag?.('event', name, params);
}

/** Describes where a click happened, using the nearest section's heading id. */
function sectionOf(path: EventTarget[]) {
  for (const node of path) {
    if (!(node instanceof HTMLElement)) continue;
    if (node.tagName === 'SECTION') return node.getAttribute('aria-labelledby') ?? 'section';
    if (node.tagName === 'HEADER' || node.tagName === 'FOOTER') return node.tagName.toLowerCase();
  }
  return 'page';
}

/**
 * Tracks clicks on links and buttons. GA's built-in outbound link tracking
 * can't see inside shadow DOM, so this reads the event's composed path.
 */
function onClick(event: MouseEvent) {
  const path = event.composedPath();
  const el = path.find(
    (node): node is HTMLAnchorElement | HTMLButtonElement =>
      node instanceof HTMLAnchorElement || node instanceof HTMLButtonElement,
  );
  if (!el) return;

  const params: Record<string, string | boolean> = {
    element_type: el instanceof HTMLAnchorElement ? 'link' : 'button',
    element_text: (el.getAttribute('aria-label') ?? el.textContent ?? '')
      .replace(/\s*\(opens in a new tab\)/, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100),
    section: sectionOf(path),
  };
  if (el instanceof HTMLAnchorElement) {
    params.link_url = el.href;
    params.outbound = el.hostname !== location.hostname;
  }
  track('element_click', params);
}

export function initAnalytics() {
  if (!analyticsEnabled) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js expects the arguments object itself, not an array.
    window.dataLayer.push(arguments);
  };

  // Consent Mode v2. Ad features stay off everywhere. Analytics cookies are
  // opt-in in OPT_IN_REGIONS and on by default elsewhere, where visitors can
  // still decline. Both defaults must be set before 'config'.
  const noAds = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
  window.gtag('consent', 'default', {
    ...noAds,
    analytics_storage: 'denied',
    region: OPT_IN_REGIONS,
    wait_for_update: 500,
  });
  window.gtag('consent', 'default', { ...noAds, analytics_storage: 'granted' });
  const consent = savedConsent();
  if (consent) window.gtag('consent', 'update', { analytics_storage: consent });

  window.gtag('js', new Date());
  window.gtag('config', measurementId); // also sends the page_view

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.append(script);

  document.addEventListener('click', onClick, { capture: true });
}
