import { css } from 'lit';

export const sharedStyles = css`
  :host {
    display: block;
  }

  a {
    color: var(--ink);
  }

  a:hover {
    color: var(--accent);
  }

  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  h2 {
    margin: 0;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--label);
  }

  p {
    margin: 0;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
`;
