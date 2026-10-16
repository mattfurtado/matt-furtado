import { defineConfig } from 'vite';

// Social previews and the canonical link need absolute URLs.
const siteUrl = 'https://www.mattfurtado.com';

export default defineConfig({
  plugins: [
    {
      name: 'site-url',
      transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
    },
  ],
});
