import { LitElement, css, html, svg } from 'lit';
import { customElement } from 'lit/decorators.js';
import { sharedStyles } from './shared-styles.ts';
import { about, contact, profile, roles } from './content.ts';
import headshot from './assets/headshot.jpg';
import { logo } from './mf-logo.ts';
import './mf-timeline.ts';
import './mf-contact-form.ts';
import { consentUiEnabled, initAnalytics } from './analytics.ts';
import { OPEN_CONSENT_EVENT } from './mf-consent-banner.ts';

initAnalytics();

const linkedinIcon = svg`<rect x="3" y="3" width="18" height="18" rx="3"></rect><line x1="8" y1="10" x2="8" y2="17"></line><circle cx="8" cy="7" r="0.6"></circle><path d="M12 17v-4a2.5 2.5 0 0 1 5 0v4"></path><line x1="12" y1="10" x2="12" y2="17"></line>`;

const githubIcon = svg`<path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"></path>`;

@customElement('mf-home')
export class MfHome extends LitElement {
  private pill(href: string, label: string, icon: ReturnType<typeof svg>) {
    return html`
      <a class="pill" href=${href} target="_blank" rel="me noopener noreferrer">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>
        ${label}<span class="visually-hidden"> (opens in a new tab)</span>
      </a>
    `;
  }

  render() {
    return html`
      <main>
        <header>
          <div class="avatars">
            <div class="avatar badge">${logo}</div>
            <img class="avatar" src=${headshot} alt="Photo of ${profile.name}" width="96" height="96" />
          </div>
          <h1>${profile.name}</h1>
          <p class="tagline">${profile.tagline}</p>
          <nav aria-label="Elsewhere">
            ${this.pill(profile.linkedin, 'LinkedIn', linkedinIcon)}
            ${this.pill(profile.github, 'GitHub', githubIcon)}
          </nav>
        </header>

        <section aria-labelledby="about">
          <h2 id="about">About</h2>
          <p class="lede">${about.lede}</p>
          <p>${about.body}</p>
          <p>${about.personal}</p>
        </section>

        <section aria-labelledby="career">
          <h2 id="career">Fifteen years at HubSpot</h2>
          <mf-timeline .roles=${roles}></mf-timeline>
        </section>

        <section aria-labelledby="contact">
          <h2 id="contact">Say hello</h2>
          <p class="soft">${contact}</p>
          <mf-contact-form .email=${profile.email} .resume=${profile.resume}></mf-contact-form>
        </section>

        <footer>
          <span>© ${new Date().getFullYear()} ${profile.name}</span>
          ${consentUiEnabled
            ? html`<button
                class="link-button"
                @click=${() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
              >
                Cookie settings
              </button>`
            : null}
        </footer>
      </main>
    `;
  }

  static styles = [
    sharedStyles,
    css`
      main {
        max-width: 680px;
        margin: 0 auto;
        padding: 96px 24px 72px;
        display: flex;
        flex-direction: column;
        gap: 72px;
      }

      header,
      section {
        display: flex;
        flex-direction: column;
      }

      header {
        gap: 20px;
      }

      section {
        gap: 16px;
      }

      .avatars {
        display: flex;
        /* Offset the separator border so the logo lines up with the text. */
        margin-left: -4px;
      }

      .avatar {
        display: block;
        width: 96px;
        height: 96px;
        border: 4px solid var(--ground);
        border-radius: 50%;
        object-fit: cover;
      }

      .avatar + .avatar {
        margin-left: -16px;
      }

      .badge {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--accent);
        color: var(--on-accent);
      }

      .logo {
        width: 44px;
      }

      h1 {
        margin: 0;
        font-family: var(--serif);
        font-weight: 400;
        font-size: clamp(40px, 9vw, 52px);
        line-height: 1.1;
        letter-spacing: -0.5px;
      }

      .tagline {
        font-size: 20px;
        color: var(--ink-soft);
      }

      nav {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 4px;
      }

      .pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 44px;
        padding: 0 20px;
        border: 1px solid var(--line);
        border-radius: 999px;
        text-decoration: none;
        font-size: 16px;
        font-weight: 500;
      }

      .lede {
        font-family: var(--serif);
        font-size: clamp(24px, 4.5vw, 28px);
        line-height: 1.4;
      }

      .soft,
      footer {
        color: var(--ink-soft);
      }

      footer {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 16px;
        font-size: 12px;
      }

      .link-button {
        padding: 0;
        border: 0;
        background: none;
        font: inherit;
        color: inherit;
        text-decoration: underline;
        cursor: pointer;
      }

      .link-button:hover {
        color: var(--accent);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'mf-home': MfHome;
  }
}
