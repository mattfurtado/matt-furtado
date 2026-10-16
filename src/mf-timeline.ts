import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { keyed } from 'lit/directives/keyed.js';
import { sharedStyles } from './shared-styles.ts';
import { track } from './analytics.ts';
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

// A swipe must travel this far sideways, and be mostly horizontal, to count.
const SWIPE_MIN_PX = 48;
const SWIPE_RATIO = 1.5;

/**
 * A proportional rail of roles. Each segment's width is its tenure;
 * choosing one reveals what that role was about. On touch screens, swiping
 * left or right moves to the next or previous role.
 */
@customElement('mf-timeline')
export class MfTimeline extends LitElement {
  @property({ attribute: false }) roles: Role[] = [];

  @state() private selected = -1;
  /** Which way the details slide in; none until the visitor changes roles. */
  @state() private direction: 'next' | 'prev' | null = null;

  private swipeStart: { x: number; y: number; id: number } | null = null;

  private get active() {
    return this.selected < 0 ? this.roles.length - 1 : this.selected;
  }

  private select(i: number) {
    if (i === this.active) return;
    this.direction = i > this.active ? 'next' : 'prev';
    this.selected = i;
  }

  /** Moves one role along, staying within the first and last roles. */
  private step(by: number) {
    const next = Math.min(this.roles.length - 1, Math.max(0, this.active + by));
    this.select(next);
    return next;
  }

  private onKeydown(e: KeyboardEvent) {
    const by = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!by) return;
    e.preventDefault();
    const next = this.step(by);
    this.renderRoot.querySelectorAll<HTMLButtonElement>('.segment')[next]?.focus();
  }

  private onPointerDown(e: PointerEvent) {
    if (e.pointerType === 'mouse') return;
    this.swipeStart = { x: e.clientX, y: e.clientY, id: e.pointerId };
  }

  private onPointerUp(e: PointerEvent) {
    const start = this.swipeStart;
    this.swipeStart = null;
    if (!start || start.id !== e.pointerId) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * SWIPE_RATIO) return;

    // Swiping left brings in the next role, like turning a page.
    const before = this.active;
    this.step(dx < 0 ? 1 : -1);
    if (this.active !== before) {
      track('timeline_swipe', { direction: dx < 0 ? 'next' : 'previous', role: this.roles[this.active].title });
    }
  }

  private onPointerCancel() {
    // The browser took over the gesture, e.g. for vertical scrolling.
    this.swipeStart = null;
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
        class="swipe-area"
        @pointerdown=${this.onPointerDown}
        @pointerup=${this.onPointerUp}
        @pointercancel=${this.onPointerCancel}
      >
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
          ${keyed(
            this.active,
            html`<div class="detail-body" data-direction=${this.direction ?? ''}>
              <p class="title">${role.title}</p>
              <p class="team">${role.team}</p>
              <p class="dates">
                ${formatMonth(role.start)} to ${role.end ? formatMonth(role.end) : 'today'}
              </p>
              <p class="summary">${role.summary}</p>
            </div>`,
          )}
        </div>
      </div>
    `;
  }

  static styles = [
    sharedStyles,
    css`
      /* Leave vertical scrolling and pinch-zoom to the browser; horizontal
         swipes come to us as pointer events. */
      .swipe-area {
        touch-action: pan-y pinch-zoom;
      }

      .rail {
        display: grid;
        gap: var(--space-1);
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
        gap: var(--space-2);
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
        font-size: var(--text-xs);
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
        margin-top: var(--space-5);
        min-height: 176px;
      }

      .title {
        font-family: var(--serif);
        font-size: var(--text-xl);
        line-height: 1.3;
      }

      .team {
        margin-top: var(--space-1);
      }

      .dates {
        margin-top: var(--space-1);
        font-size: var(--text-sm);
        color: var(--ink-soft);
      }

      .summary {
        margin-top: var(--space-3);
      }

      .detail-body[data-direction='next'] {
        animation: slide-from-right 200ms ease-out;
      }

      .detail-body[data-direction='prev'] {
        animation: slide-from-left 200ms ease-out;
      }

      @keyframes slide-from-right {
        from {
          opacity: 0;
          transform: translateX(var(--space-4));
        }
      }

      @keyframes slide-from-left {
        from {
          opacity: 0;
          transform: translateX(calc(-1 * var(--space-4)));
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .bar {
          transition: none;
        }

        .detail-body {
          animation: none !important;
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
