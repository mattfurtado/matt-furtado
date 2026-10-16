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

    const first = toMonths(this.roles[0].start);
    const now = currentMonth();
    const span = now - first;
    const firstYear = Math.floor(first / 12);
    const lastYear = Math.floor(now / 12);
    const ticks = [];
    for (let y = firstYear + 1; y <= lastYear; y++) {
      if ((y - firstYear) % 5 === 0 && (y * 12 - first) / span < 0.92) ticks.push(y);
    }

    const role = this.roles[this.active];

    return html`
      <div class="rail" role="group" aria-label="Roles at HubSpot, 2011 to today" @keydown=${this.onKeydown}>
        ${this.roles.map((r, i) => {
          const end = r.end ? toMonths(r.end) : now;
          const width = ((end - toMonths(r.start)) / span) * 100;
          return html`
            <button
              class="segment"
              style="flex-basis:${width}%"
              aria-pressed=${i === this.active}
              aria-label="${r.title}, ${r.team}"
              tabindex=${i === this.active ? 0 : -1}
              @click=${() => this.select(i)}
            ></button>
          `;
        })}
      </div>
      <div class="axis" aria-hidden="true">
        <span style="left:0">${firstYear}</span>
        ${ticks.map(
          (y) =>
            html`<span style="left:${((y * 12 - first) / span) * 100}%">${y}</span>`,
        )}
      </div>

      <div class="detail" aria-live="polite">
        <p class="title">${role.title}<span class="team">, ${role.team}</span></p>
        <p class="dates">
          ${formatMonth(role.start)} to ${role.end ? formatMonth(role.end) : 'today'}
        </p>
        <p class="summary">${role.summary}</p>
      </div>
      <p class="hint">Choose a segment to see each role.</p>
    `;
  }

  static styles = [
    sharedStyles,
    css`
      .rail {
        display: flex;
        gap: 4px;
        height: 44px;
      }

      .segment {
        appearance: none;
        border: 0;
        padding: 0;
        min-width: 12px;
        background: var(--line);
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 160ms ease;
      }

      .segment:hover {
        background: #c4b29f;
      }

      .segment[aria-pressed='true'] {
        background: var(--accent);
      }

      .axis {
        position: relative;
        height: 20px;
        margin-top: 8px;
        font-size: 12px;
        color: var(--ink-soft);
        font-variant-numeric: tabular-nums;
      }

      .axis span {
        position: absolute;
        top: 0;
      }

      .detail {
        margin-top: 20px;
        min-height: 152px;
      }

      .title {
        font-family: var(--serif);
        font-size: 24px;
        line-height: 1.3;
      }

      .team {
        color: var(--ink-soft);
      }

      .dates {
        margin-top: 4px;
        font-size: 12px;
        color: var(--ink-soft);
      }

      .summary {
        margin-top: 12px;
      }

      .hint {
        font-size: 12px;
        color: var(--ink-soft);
      }

      @media (prefers-reduced-motion: reduce) {
        .segment {
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
