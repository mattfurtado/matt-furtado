import { LitElement, css, html, svg } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { sharedStyles } from './shared-styles.ts';

type Theme = 'light' | 'dark';

const THEME_KEY = 'mf-theme';
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

// Must match the colors in index.html's theme script.
const BROWSER_BAR = { light: '#f5efe6', dark: '#1f1a17' };

const sunIcon = svg`<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>`;
const moonIcon = svg`<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"></path>`;

/** The theme on screen: the visitor's saved choice, else their system setting. */
function currentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === 'light' || chosen === 'dark') return chosen;
  return systemDark.matches ? 'dark' : 'light';
}

/** Switches between light and dark mode and remembers the choice. */
@customElement('mf-theme-toggle')
export class MfThemeToggle extends LitElement {
  @state() private theme: Theme = currentTheme();

  private onSystemChange = () => {
    this.theme = currentTheme();
    this.updateBrowserBar();
  };

  connectedCallback() {
    super.connectedCallback();
    systemDark.addEventListener('change', this.onSystemChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    systemDark.removeEventListener('change', this.onSystemChange);
  }

  private updateBrowserBar() {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BROWSER_BAR[this.theme]);
  }

  private toggle() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = this.theme;
    try {
      localStorage.setItem(THEME_KEY, this.theme);
    } catch {
      // Storage blocked: the theme still applies for this visit.
    }
    this.updateBrowserBar();
  }

  render() {
    const dark = this.theme === 'dark';
    return html`
      <button
        @click=${this.toggle}
        aria-label=${dark ? 'Switch to light mode' : 'Switch to dark mode'}
        title=${dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          ${dark ? moonIcon : sunIcon}
        </svg>
      </button>
    `;
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        position: absolute;
        top: 16px;
        right: 16px;
        z-index: 5;
      }

      button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        padding: 0;
        border: 0;
        border-radius: 50%;
        background: none;
        color: var(--ink);
        cursor: pointer;
      }

      button:hover {
        color: var(--accent);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'mf-theme-toggle': MfThemeToggle;
  }
}
