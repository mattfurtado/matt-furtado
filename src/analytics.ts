// Google Analytics 4. Loads only in production builds with a measurement ID,
// so local development never sends data.

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const measurementId: string | undefined = import.meta.env.VITE_GA_MEASUREMENT_ID;

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
  if (!import.meta.env.PROD || !measurementId) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js expects the arguments object itself, not an array.
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId); // also sends the page_view

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.append(script);

  document.addEventListener('click', onClick, { capture: true });
}
