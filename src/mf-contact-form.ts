import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { sharedStyles } from './shared-styles.ts';

/**
 * Contact form. Submitting does nothing yet.
 * TODO(matt): send submissions to a mail service.
 */
@customElement('mf-contact-form')
export class MfContactForm extends LitElement {
  private onSubmit(e: SubmitEvent) {
    e.preventDefault();
  }

  render() {
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
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'mf-contact-form': MfContactForm;
  }
}
