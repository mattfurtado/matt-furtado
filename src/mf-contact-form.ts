import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { sharedStyles } from './shared-styles.ts';

/**
 * Contact form. Until an email service is wired up, submitting opens the
 * visitor's email app with the message filled in.
 */
@customElement('mf-contact-form')
export class MfContactForm extends LitElement {
  @property() email = '';

  @state() private opened = false;

  private onSubmit(e: SubmitEvent) {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const name = String(data.get('name') ?? '');
    const from = String(data.get('email') ?? '');
    const message = String(data.get('message') ?? '');
    const params = new URLSearchParams({
      subject: `Hello from ${name}`,
      body: `${message}\n\n${name}\n${from}`,
    });
    window.location.href = `mailto:${this.email}?${params.toString().replace(/\+/g, '%20')}`;
    this.opened = true;
  }

  render() {
    if (this.opened) {
      return html`
        <div class="status" role="status">
          <p>Your email app should now be open with your message. Send it from there and I'll get back to you soon.</p>
        </div>
      `;
    }

    return html`
      <form @submit=${this.onSubmit}>
        <div class="row">
          <label>Name <input type="text" name="name" required autocomplete="name" /></label>
          <label>Email <input type="email" name="email" required autocomplete="email" /></label>
        </div>
        <label>Message <textarea name="message" rows="5" required></textarea></label>
        <div><button type="submit">Send message</button></div>
      </form>
    `;
  }

  static styles = [
    sharedStyles,
    css`
      form {
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

      .status {
        padding: 24px;
        border-radius: 16px;
        background: var(--fill);
      }

      .status p {
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
