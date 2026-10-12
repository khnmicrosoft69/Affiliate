// Builds /sitemap.xml: the list of every page, for Google.
// It finds the pages automatically (every .astro file in src/pages),
// so new pages are added to the sitemap without any extra work.
import type { APIRoute } from 'astro';

// import.meta.glob finds files; we only need their names, not their contents.
const pageFiles = Object.keys(import.meta.glob('./**/*.astro'));

// Turns a file name into its web address:
//   './index.astro'        -> '/'
//   './find.astro'         -> '/find/'
//   './guides/index.astro' -> '/guides/'
function toPath(file: string): string {
  const name = file.replace(/^\.\//, '').replace(/\.astro$/, '').replace(/(^|\/)index$/, '');
  return name === '' ? '/' : `/${name}/`;
}

export const GET: APIRoute = ({ site }) => {
  const paths = pageFiles
    .filter((file) => !file.endsWith('404.astro')) // the "not found" page isn't a real page
    .map(toPath)
    .sort();

  const urls = paths
    .map((path) => `  <url><loc>${new URL(path, site).href}</loc></url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
