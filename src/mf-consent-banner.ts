import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { sharedStyles } from './shared-styles.ts';
import {
  analyticsEnabled,
  consentPreview,
  consentRequired,
  savedConsent,
  setConsent,
  type Consent,
} from './analytics.ts';

/** Fired on window to reopen the banner, e.g. from a "Cookie settings" link. */
export const OPEN_CONSENT_EVENT = 'mf:open-consent';

/**
 * Asks visitors whether Google Analytics may set cookies. Opens on its own
 * only for visitors in opt-in regions who haven't chosen yet; anyone can
 * open it from "Cookie settings" in the footer.
 */
@customElement('mf-consent-banner')
export class MfConsentBanner extends LitElement {
  @state() private open = consentPreview;

  private reopen = () => {
    this.open = true;
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener(OPEN_CONSENT_EVENT, this.reopen);
    if (!this.open && analyticsEnabled && savedConsent() === null) {
      consentRequired().then((required) => {
        if (required) this.open = true;
      });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(OPEN_CONSENT_EVENT, this.reopen);
  }

  private choose(consent: Consent) {
    setConsent(consent);
    this.open = false;
  }

  render() {
    if (!this.open) return null;
    return html`
      <section aria-label="Cookie consent">
        <p>
          This site uses Google Analytics cookies to understand how visitors use it.
          You can accept or decline.
        </p>
        <div class="actions">
          <button @click=${() => this.choose('denied')}>Decline</button>
          <button @click=${() => this.choose('granted')}>Accept</button>
        </div>
      </section>
    `;
  }

  static styles = [
    sharedStyles,
    css`
      section {
        position: fixed;
        z-index: 10;
        left: 16px;
        right: 16px;
        bottom: 16px;
        max-width: 648px;
        margin: 0 auto;
        padding: 16px 20px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px 24px;
        background: var(--field);
        border: 1px solid var(--line);
        border-radius: 16px;
        box-shadow: 0 8px 24px var(--shadow);
      }

      p {
        flex: 1 1 280px;
        font-size: 16px;
        line-height: 1.5;
      }

      .actions {
        display: flex;
        gap: 8px;
      }

      /* Both choices get equal weight, as consent rules expect. */
      button {
        font: inherit;
        font-size: 16px;
        font-weight: 500;
        min-height: 44px;
        padding: 0 20px;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--ground);
        color: var(--ink);
        cursor: pointer;
      }

      button:hover {
        border-color: var(--accent);
        color: var(--accent);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'mf-consent-banner': MfConsentBanner;
  }
}
