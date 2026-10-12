// Astro settings for the whole project.
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Your live address. Used for canonical/og:url tags, the sitemap and robots.txt.
  // If you get a custom domain later, change it here (and in public/robots.txt).
  site: 'https://specfinder-roan.vercel.app',

  // react(): lets us use React components (.tsx) inside Astro pages.
  // sitemap(): creates sitemap-index.xml automatically on every build.
  integrations: [react(), sitemap()],
});
