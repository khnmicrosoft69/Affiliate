// Astro settings for the whole project.
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // TODO: change this to your real address after you deploy
  // (e.g. https://your-site.netlify.app). The sitemap needs it.
  site: 'https://example.com',

  // react(): lets us use React components (.tsx) inside Astro pages.
  // sitemap(): creates sitemap-index.xml automatically on every build.
  integrations: [react(), sitemap()],
});
