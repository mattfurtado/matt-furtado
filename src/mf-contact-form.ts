import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { sharedStyles } from './shared-styles.ts';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/** Contact form that posts to the /api/contact function. */
@customElement('mf-contact-form')
export class MfContactForm extends LitElement {
  /** Shown as a fallback when sending fails. */
  @property() email = '';

  /** Linked once the message is sent. */
  @property() resume = '';

  @state() private status: Status = 'idle';
  @state() private error = '';

  // One id per version of the message, so a retry of the same message is
  // never sent twice, but an edited message is treated as new.
  private submissionId: string | null = null;

  private onInput() {
    this.submissionId = null;
  }

  private async onSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (this.status === 'sending') return;

    const form = e.target as HTMLFormElement;
    this.submissionId ??= crypto.randomUUID();
    const data = Object.fromEntries(new FormData(form));

    this.status = 'sending';
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: this.submissionId }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) throw new Error(result.error ?? 'Your message couldn’t be sent.');
      this.status = 'sent';
      this.submissionId = null;
    } catch (err) {
      this.error =
        err instanceof TypeError
          ? 'Your message couldn’t be sent. Check your connection and try again.'
          : (err as Error).message;
      this.status = 'error';
    }
  }

  render() {
    if (this.status === 'sent') {
      return html`
        <div class="status" role="status">
          <p class="thanks">Thanks for reaching out. I’ll get back to you soon.</p>
          ${this.resume
            ? html`<p>
                In the meantime, here’s my
                <a href=${this.resume} target="_blank" rel="noopener noreferrer"
                  >resume<span class="visually-hidden"> (opens in a new tab)</span></a
                >.
              </p>`
            : null}
        </div>
      `;
    }

    const sending = this.status === 'sending';
    return html`
      <form @submit=${this.onSubmit} @input=${this.onInput} aria-busy=${sending}>
        <fieldset ?disabled=${sending}>
          <div class="row">
            <label>Name <input type="text" name="name" required maxlength="200" autocomplete="name" /></label>
            <label>Email <input type="email" name="email" required maxlength="320" autocomplete="email" /></label>
          </div>
          <label>Message <textarea name="message" rows="5" required maxlength="5000"></textarea></label>
          <div class="trap" aria-hidden="true">
            <label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
          </div>
          ${this.status === 'error'
            ? html`<p class="error" role="alert">
                ${this.error} You can also email me at
                <a href="mailto:${this.email}">${this.email}</a>.
              </p>`
            : null}
          <div>
            <button type="submit">
              ${sending ? html`<span class="spinner" aria-hidden="true"></span>Sending…` : 'Send message'}
            </button>
          </div>
        </fieldset>
      </form>
    `;
  }

  static styles = [
    sharedStyles,
    css`
      fieldset {
        margin: 0;
        padding: 0;
        border: 0;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 16px;
        font-weight: 500;
      }

      input,
      textarea {
        font: inherit;
        font-size: 16px;
        font-weight: 400;
        padding: 12px 16px;
        border: 1px solid var(--line);
        border-radius: 12px;
        background: var(--field);
        color: var(--ink);
      }

      input {
        min-height: 44px;
      }

      textarea {
        resize: vertical;
      }

      input:focus,
      textarea:focus {
        outline: 2px solid var(--accent);
        outline-offset: 1px;
      }

      button {
        font: inherit;
        min-height: 48px;
        padding: 0 28px;
        border: 0;
        border-radius: 999px;
        background: var(--accent);
        color: var(--on-accent);
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
      }

      button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      fieldset:disabled input,
      fieldset:disabled textarea {
        opacity: 0.6;
      }

      fieldset:disabled button {
        cursor: progress;
      }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: spin 800ms linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .spinner {
          animation-duration: 2400ms;
        }
      }

      /* Hidden from people; bots that fill every field get filtered out. */
      .trap {
        position: absolute;
        left: -9999px;
      }

      .error {
        color: var(--label);
      }

      .status {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 24px;
        border-radius: 16px;
        background: var(--fill);
      }

      .thanks {
        font-family: var(--serif);
        font-size: 20px;
        line-height: 1.4;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'mf-contact-form': MfContactForm;
  }
}
