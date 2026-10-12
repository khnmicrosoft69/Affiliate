# SpecFinder: gadget & tech accessories finder (Philippines)

Users choose a category (laptops including MacBooks, tablets, earbuds, monitors, plus everyday accessories: keyboards, mice, power banks, chargers, smartwatches, speakers, USB hubs, flash drives and laptop bags). Then they set a budget and any specs, style, form factor or color they care about. The site removes products that don't fit, ranks the rest, and explains why each one fits. Money comes from Shopee and Lazada (Involve Asia) affiliate links. Every product has a `country` label, so more countries can be added later.

> "SpecFinder" is a placeholder name. Change it in `src/lib/site.ts`, and check that your new name isn't already someone else's brand.

---

## 1. The tools (and what they are)

| Tool | What it is | Why we use it |
|---|---|---|
| **Node.js** | Runs JavaScript on your computer (not only in a browser) | Astro needs it to build the site |
| **npm** | Node's "app store" for code libraries | Installs Astro, React, etc. into `node_modules/` |
| **Astro** | A website builder | Turns pages into plain, fast HTML, which is great for Google (SEO) |
| **React** | A library for interactive UI | The finder form updates results instantly |
| **TypeScript** | JavaScript + **types** (labels like "this is a number") | Catches mistakes *before* the site runs |
| **Zod** (built into Astro) | A data checker | Stops the build if a product file has a typo |

**Static site** = the whole site is built ahead of time into plain files (`dist/`). There's no server code, so it can be hosted free on Netlify or Vercel.

## 2. Run it on your computer

Run these in the project folder:

```bash
npm install        # first time only: downloads the libraries
npm run dev        # starts a local site at http://localhost:4321 (auto-refreshes on save)
npm run check      # TypeScript checks your code for mistakes
npm run build      # builds the final site into the dist/ folder
```

If you add a new category file and the dev server doesn't see it, stop it (Ctrl + C) and run `npm run dev` again.

## 3. Map of the project

```
src/
  data/products/<category>.json ← YOUR PRODUCTS, one file per category (edit by hand)
  lib/
    categories.ts               ← every category, its specs and its quick picks ⭐
    match.ts                    ← THE BRAIN: filter → score → sort → reasons
    countries.ts                ← supported countries, currency, price formatting
    products.ts                 ← loads all category files into one list
    site.ts                     ← site name, your name, contact email (change these!)
    guides.ts                   ← list of guide pages (shown on / and /guides/)
    analytics.ts                ← sends events to Google Analytics (section 8)
  content.config.ts             ← checks every product against its category's specs
  components/
    Finder.tsx                  ← React form + live results (runs in the browser)
    SpecInput.tsx               ← one form row for one spec (number / choice / yes-no)
    CountryRequest.tsx          ← "My country isn't listed" box
    ResultCard.tsx              ← how one product result looks
  layouts/BaseLayout.astro      ← shared <head> (SEO tags), header, footer
  pages/                        ← every file here becomes a web page
    index.astro                       → /         landing page (static, very fast)
    find.astro                        → /find/    the finder tool
    guides/index.astro                → /guides/  list of all guides
    privacy.astro                     → /privacy/ privacy policy (required by Google Analytics)
    about.astro                       → /about/   who you are + how picks are ranked
    contact.astro                     → /contact/ your contact email
    guides/best-laptops-for-cs-students.astro → /guides/best-laptops-for-cs-students/
    guides/best-laptops-under-30000.astro     → /guides/best-laptops-under-30000/
  styles/global.css             ← site-wide colors, fonts, layout (light + dark mode)
public/                         ← copied as-is: robots.txt, favicon.svg
astro.config.mjs                ← site address + integrations (React, sitemap)
```

### Categories and specs (`src/lib/categories.ts`)
Everything starts here. Each category lists its **specs**. There are 3 kinds:

| Kind | Example | What the user sees |
|---|---|---|
| `number` | RAM = 16 (GB), weight = 1.4 (kg) | an "at least" or "at most" box (or both, for things like screen size) |
| `choice` | form factor = "Over-ear", color = ["Black", "White"] | clickable chips; pick any of them |
| `boolean` | touchscreen = true | a "Required" checkbox |

For numbers, `better: 'higher'` (RAM) or `'lower'` (weight) tells the ranking which way is better.
Every category automatically gets **Brand** and **Color**. The form only shows specs that at least one product has data for, so it stays short.

**Quick picks** (presets) like "Good for coding" are ready-made sets of answers. The guide pages use them too, so the finder and the guides always rank the same way.

### How the matching works (`src/lib/match.ts`)
For every spec the user fills in, they choose:
- **Must**: products that don't have it are **removed** (filtered out).
- **Nice to have**: products are kept but **ranked lower** if they miss it, and the card shows a ✗ trade-off line.

1. **Filter:** remove products over budget or missing a "Must".
2. **Score:** each filled-in spec gives 0–1 points. Meeting it = 0.8, plus up to 0.2 more for beating the other products. Missing a "nice to have" gives partial credit (e.g. 8GB when you wanted 16GB = 0.4). The average becomes the "% match".
3. **Sort:** highest score first. If two products tie, the cheaper one wins.
4. **Explain:** ✓ reasons for what fits, ✗ for what doesn't.

If the user fills in nothing, products are ranked by overall specs (the "best all-rounder").

Try this: in `categories.ts`, change the laptop "Good for coding" quick pick from `ramGB: nice({ min: 16 })` to `must(...)`. Save, then watch the results change.

### The look
Theme: a calm, focused desk. The colors live at the top of `global.css` as **variables** (e.g. `--accent` = focus green, `--highlight` = highlighter yellow), so changing one line re-colors the whole site. Headings use the **Fraunces** font, which is served from your own site (`@fontsource-variable/fraunces`), so there's no Google Fonts request. The landing page's own styles are in the `<style>` block at the bottom of `index.astro`; Astro "scopes" them, so they only affect that page.

## 4. Add or update a product

Open the category's file, e.g. `src/data/products/tablet.json`, copy an existing product, and change it:
- `id`: unique, lowercase, no spaces (e.g. `ph-redmi-pad-3`)
- `country`: `"PH"`. Every product needs this, so more countries can be added later.
- `link`: the store link (later, your **affiliate link**; see section 5)
- `lastChecked`: today's date, so you know when the price may be outdated
- `review`: 1–2 honest sentences ("Our take"). Base it on the specs and how the product compares with the others, and don't claim you tested it unless you did.
- `pros`: up to 3 short strengths. `cons`: **at least 1** weakness (required, so the site never only praises; this applies to expensive items too).
- `specs`: use the spec names from `categories.ts`. You can leave out any spec you don't know.

- `image` (optional): the product photo. Two ways:
  1. **Your own file:** save it in `public/images/products/` (a square `.webp` or `.jpg` about 600×600 px works best), then write `"image": "/images/products/acer-aspire-lite-14.webp"`.
  2. **A link from your affiliate dashboard:** Shopee and Lazada/Involve Asia give you official product images. Paste that address, e.g. `"image": "https://…"`.

  3. **A free photo from Wikimedia Commons** (commons.wikimedia.org): only use photos of the exact model, and add the credit the license requires:
     ```json
     "imageCredit": { "author": "Rakoon", "license": "CC0", "source": "https://commons.wikimedia.org/wiki/File:…" }
     ```
     It shows as a small "Photo: … · license" line under the picture. 15 sample products already use Commons photos (13 photos) this way.

  Don't copy photos straight off store pages. They're copyrighted, and scraping breaks the stores' rules. If a product has no `image` (or it fails to load), the card shows a clean drawing of the category instead.

⚠️ All products there now are **SAMPLES** with approximate prices and specs and `example.com` links. Replace them with real listings before you launch.

**Mistakes are caught for you.** A typo like `"dpii"` instead of `"dpi"`, a word where a number belongs, or a choice that isn't in the list (e.g. `"formFactor": "Overear"`) stops the dev server and the build with a message like:

```
mouse → ph-logitech-m240 data does not match collection schema.
  specs: Unrecognized key: "dpii"
```

### Add a new category (e.g. phone cases, webcams, cables)
1. In `categories.ts`, copy a category block, then change its `id`, `label`, `group`, `summary`, `specs` and `presets`.
2. Create `src/data/products/<id>.json` containing `[]` (an empty list), then add products.
3. Restart `npm run dev`. The new category shows up in the finder with its own form.

## 5. Real links: when and how (no scraping)

### Updating links and prices with the spreadsheet
Every product currently links to a **store search page** (e.g. Shopee search for "Acer Aspire Lite 14"). Its button says **"Find on Shopee →"** and the price is marked as approximate.
To switch products to exact listings:
1. Open `scripts/product-links.csv` in Excel or Google Sheets.
2. For each product you've found, fill in **Real product link**, **Real price (PHP)** and **Date checked** (you can skip any you haven't done yet).
3. Save it as CSV with the same name, then run:
   ```bash
   python scripts/import_links.py
   ```
   Products with a real link get it, plus the real price and date; their button changes to **"Buy on …"**. The rest keep their search link.
4. Push to GitHub, and Vercel updates the site.


Affiliate programs **review your website before approving you**, so the order is:

1. **Now:** replace the samples with real products and use **normal store links** (just copy the product page address). That's allowed; you just don't earn commission yet.
2. **Deploy** (section 6) so you have a public address.
3. **Apply** using that address:
   - **Philippines, Shopee:** Shopee Affiliate Program, affiliate.shopee.ph
   - **Philippines, Lazada:** sign up at **Involve Asia** (involve.asia), add your website, then apply to the Lazada PH offer.

   Don't apply while the site still shows `SAMPLE` products. Reviewers want to see a real, useful site.
4. **After approval:** in each dashboard, make an affiliate link for each product ("Get link" / link generator) and paste it into that product's `link` field. Nothing else in the code changes.

Approval rules and waiting times vary and can change, so check each program's sign-up page.
Never scrape (automatically copy) prices; both stores' terms forbid it. Later, use their official affiliate APIs or product feeds if you get access.
All buy links already use `rel="sponsored"`, which tells Google they're affiliate links. The footer has the disclosure that affiliate programs and Google expect.

## 6. Deploy for free (Netlify or Vercel)

1. Put the project on **GitHub**:
   ```bash
   git init
   ```
   ```bash
   git add .
   ```
   ```bash
   git commit -m "First version of SpecFinder"
   ```
   Then create an empty repo on github.com and follow its "push an existing repository" steps.
2. **Netlify:** Add new site → Import from GitHub → pick the repo. It detects Astro automatically (build command `npm run build`, publish folder `dist`). **Vercel** works the same way: New Project → import the repo.
3. You'll get an address like `https://your-site.netlify.app`. Put it in **two places**:
   - `astro.config.mjs` → `site: 'https://your-site.netlify.app'`
   - `public/robots.txt` → the `Sitemap:` line
4. Commit and push again. Every push redeploys the site automatically.

## 7. Google Search Console + sitemap

The **sitemap** (`/sitemap-index.xml`) is a list of all your pages for Google. It's **generated automatically** on every build by `@astrojs/sitemap`, so new pages are included without any extra work.

1. Go to search.google.com/search-console → **Add property** → choose **URL prefix** → enter your site address.
2. Verify ownership with the **HTML tag** method: copy the `<meta name="google-site-verification" ...>` tag, paste it into `src/layouts/BaseLayout.astro` inside `<head>`, then push and click **Verify**.
3. Left menu → **Sitemaps** → enter `sitemap-index.xml` → Submit.
4. Use **URL Inspection** on your home page and guides → "Request indexing".
5. Expect a few days to weeks before pages show up. Check **Performance** to see which searches bring visitors.

**SEO already built in:** a unique `<title>` and description on each page, a canonical URL, a phone-friendly layout, system fonts, and almost no JavaScript on guide pages, so they load fast.

## 8. See where your visitors come from (Google Analytics)

**Google Analytics 4 (GA4)** is free. It automatically records which **country** (and city) every visitor comes from, so you can see where to expand next. The site also sends these extra **events** (things visitors do):

| Event | When | Useful details |
|---|---|---|
| `finder_open` | someone opens the finder | `country` it started in, `country_source` (`time_zone` guess, `saved`, `link`, `default`) |
| `country_selected` | they switch country | `country` |
| `country_request` | they use "My country isn't listed…" | `requested_country`, e.g. `SG`. **This is your expansion wish list.** |
| `category_selected` | they pick a category | `country`, `category` |
| `buy_click` | they click a **Buy** button (finder **and** guide pages) | `product_name`, `store`, `product_id`, `category`, `price`, `rank`, `page` |

**How the finder picks a country:** a `?country=PH` link first, then the country they chose last time, then a **guess from the device's time zone** (e.g. `Asia/Manila` → Philippines). The guess needs no internet request and no personal data.

### Set it up (about 10 minutes)
1. Go to analytics.google.com → **Start measuring** → create an account and a **property** (your site) → choose **Web** and enter your site address.
2. Copy the **Measurement ID**. It looks like `G-ABC123XYZ`.
3. **On Netlify:** Site configuration → Environment variables → add `PUBLIC_GA_ID` = your ID → redeploy. (On Vercel: Project → Settings → Environment Variables.)
   **On your computer (optional):** copy `.env.example` to a new file called `.env` and fill in the ID.
4. **See countries:** Reports → User attributes → **Demographic details** → Country.
5. **See country requests:** Admin → **Custom definitions** → Create custom dimension → name `Requested country`, scope *Event*, parameter `requested_country`. (Do the same for `country_source`, `category` and `store` if you like.) Then Reports → Engagement → **Events** → `country_request`. Custom dimensions only collect data from the moment you create them, so set them up early.
6. **See which products and stores get Buy clicks:** create custom dimensions for `product_name` and `store` (scope *Event*) the same way. Then Explore → Free form → rows: `Product name`, columns: `Store`, values: Event count, filtered to event name = `buy_click`.

If `PUBLIC_GA_ID` is empty, no tracking code is added to the site. During `npm run dev`, events are printed in the browser console (`[track] ...`) so you can check them.

**Privacy:** GA uses cookies. The `/privacy/` page explains what's collected; put your real contact email in `src/pages/privacy.astro`. If you later target Europe or other places with strict cookie laws, you'll need a cookie consent banner first.

## 9. Roadmap (next steps, one at a time)

- [ ] **Step 2:** Set up Google Analytics (section 8). Replace the samples with real products (start with 10–20 in the categories you know best) and normal store links. Deploy. Set up Search Console. Apply to the affiliate programs.
- [ ] **Step 3:** After approval, swap in affiliate links.
- [ ] **Step 4:** More guide pages, e.g. "Best earbuds under ₱2,000" or "Best budget gaming monitor". Each is a copy of a guide file with a different `category` and `reqs`.
- [ ] **Step 5:** More accessory categories (phone cases, webcams, cables, desk lamps, laptop stands). See section 4.
- [ ] **Step 6:** "Works with your device" checks (e.g. a hub that fits your laptop's ports, a charger strong enough for your laptop).
- [ ] **Step 7:** Add the next country (check GA's `country_request` events first): one entry in `countries.ts` (including its time zones), products with that country code, and its stores' affiliate programs + disclosures.
- [ ] **Step 8 (later):** Too many products to edit by hand? Move them to a small database (e.g. on Render, or Supabase) with a Node or Python backend.
- [ ] **Step 9 (later):** Natural-language search ("cheap earbuds with ANC for commuting"). An AI model turns the sentence into a category + requirements, then the existing `findMatches` does the rest. This needs a small server function so your API key stays secret.
