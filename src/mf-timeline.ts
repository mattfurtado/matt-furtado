import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { sharedStyles } from './shared-styles.ts';
import type { Role } from './content.ts';

const toMonths = (iso: string) => {
  const [y, m] = iso.split('-').map(Number);
  return y * 12 + (m - 1);
};

const currentMonth = () => {
  const d = new Date();
  return d.getFullYear() * 12 + d.getMonth();
};

const formatMonth = (iso: string) =>
  new Date(`${iso}-15`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

/**
 * A proportional rail of roles. Each segment's width is its tenure;
 * choosing one reveals what that role was about.
 */
@customElement('mf-timeline')
export class MfTimeline extends LitElement {
  @property({ attribute: false }) roles: Role[] = [];

  @state() private selected = -1;

  private get active() {
    return this.selected < 0 ? this.roles.length - 1 : this.selected;
  }

  private select(i: number) {
    this.selected = i;
  }

  private onKeydown(e: KeyboardEvent) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = Math.min(
      this.roles.length - 1,
      Math.max(0, this.active + step),
    );
    this.select(next);
    this.renderRoot
      .querySelectorAll<HTMLButtonElement>('.segment')
      [next]?.focus();
  }

  render() {
    if (!this.roles.length) return null;

    const now = currentMonth();
    // Columns share space by tenure, but never shrink below a tappable width.
    const columns = this.roles
      .map((r) => {
        const months = (r.end ? toMonths(r.end) : now) - toMonths(r.start);
        return `minmax(44px, ${months}fr)`;
      })
      .join(' ');

    const role = this.roles[this.active];

    return html`
      <div
        class="rail"
        role="group"
        aria-label="Roles at HubSpot, 2011 to today"
        style="grid-template-columns:${columns}"
        @keydown=${this.onKeydown}
      >
        ${this.roles.map(
          (r, i) => html`
            <button
              class="segment"
              aria-pressed=${i === this.active}
              aria-label="${r.title}, ${r.team}, from ${formatMonth(r.start)}"
              tabindex=${i === this.active ? 0 : -1}
              @click=${() => this.select(i)}
            >
              <span class="bar"></span>
              <span class="year" aria-hidden="true">${r.start.slice(0, 4)}</span>
            </button>
          `,
        )}
      </div>

      <div class="detail" aria-live="polite">
        <p class="title">${role.title}</p>
        <p class="team">${role.team}</p>
        <p class="dates">
          ${formatMonth(role.start)} to ${role.end ? formatMonth(role.end) : 'today'}
        </p>
        <p class="summary">${role.summary}</p>
      </div>
    `;
  }

  static styles = [
    sharedStyles,
    css`
      .rail {
        display: grid;
        gap: 4px;
      }

      .segment {
        appearance: none;
        border: 0;
        padding: 0;
        background: none;
        font: inherit;
        color: var(--ink-soft);
        text-align: left;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 8px;
        border-radius: 8px;
      }

      .bar {
        display: block;
        height: 44px;
        border-radius: 8px;
        background: var(--line);
        transition: background-color 160ms ease;
      }

      .year {
        font-size: 12px;
        font-variant-numeric: tabular-nums;
      }

      .segment:hover .bar {
        background: var(--line-strong);
      }

      .segment:hover .year {
        color: var(--ink);
      }

      .segment[aria-pressed='true'] .bar {
        background: var(--accent);
      }

      .segment[aria-pressed='true'] .year {
        color: var(--ink);
        font-weight: 600;
      }

      .detail {
        margin-top: 20px;
        min-height: 176px;
      }

      .title {
        font-family: var(--serif);
        font-size: 24px;
        line-height: 1.3;
      }

      .team {
        margin-top: 4px;
      }

      .dates {
        margin-top: 4px;
        font-size: 14px;
        color: var(--ink-soft);
      }

      .summary {
        margin-top: 12px;
      }

      @media (prefers-reduced-motion: reduce) {
        .bar {
          transition: none;
        }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'mf-timeline': MfTimeline;
  }
}
