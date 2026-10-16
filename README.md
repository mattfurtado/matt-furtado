# mattfurtado.com

Personal site for Matthew Furtado, live at [www.mattfurtado.com](https://www.mattfurtado.com).

![Screenshot of the site](docs/screenshot.png)

## Stack

- **[Lit](https://lit.dev)** web components, written in TypeScript
- **[Vite](https://vite.dev)** for the dev server and production build
- **[Vercel](https://vercel.com)** for hosting, deploying from `main`
- **pnpm** for package management

The site is a single static page. Its only runtime dependency is Lit, and all of its JavaScript comes to about 11 KB gzipped.

## Getting started

```sh
pnpm install
pnpm dev       # start the dev server
pnpm build     # type-check and build to dist/
pnpm preview   # serve the production build
```

## Project layout

```
index.html              Page shell, fonts, and social sharing tags
vite.config.ts          Fills in the site URL for absolute links in index.html
public/                 Favicon and share image, copied as-is
src/
  content.ts            All site copy and career data
  mf-home.ts            Page layout: header, About, timeline, contact
  mf-timeline.ts        Interactive career timeline
  mf-contact-form.ts    Contact form (not wired to a mail service yet)
  mf-logo.ts            MF monogram as an inline SVG
  styles.css            Global color and font tokens
  shared-styles.ts      Link, focus, and heading styles shared by components
  assets/               Images processed by Vite
```

## How it works

**Content is separate from components.** Text, links, and roles live in `src/content.ts`. Most entries are plain strings; entries that need inline links are Lit `html` templates.

**Styling uses CSS custom properties.** Colors and fonts are defined once on `:root` in `src/styles.css`. Those values inherit into each component's shadow DOM, so changing a token updates the whole site. Type is Lora for headings and IBM Plex Sans for body copy. Font sizes and spacing use multiples of 4px, with 14px timeline dates as the one exception.

**The timeline** is a CSS grid with one column per role. Each column is `minmax(44px, <months>fr)`, so widths reflect tenure but never drop below a usable tap target. Each column is a button labeled with the role's start year. Selecting one shows the role's details below the grid, and the left and right arrow keys move between roles.

**Social sharing tags** (Open Graph and Twitter) in `index.html` use a `%SITE_URL%` placeholder. A small plugin in `vite.config.ts` replaces it with `https://www.mattfurtado.com` at build time, because link previews require absolute URLs. The share image is `public/og-image.png` (1200×630).

## To do

- Connect the contact form to a mail service. Submissions currently do nothing; see `onSubmit` in `src/mf-contact-form.ts`.
