# surinamebusiness.com

Tools, data, tenders and jobs for working and doing business in Suriname. Dutch at `/`, English at `/en/`.

Fully independent site: own repo, own data pipeline, own Cloudflare account. It shares no files, data or workers with any other site.

## How it works

- `fetch.py` pulls public data into `data/live/` (exchange rates from CME, tenders from gov.sr, Staatsolie, IDB and World Bank, government vacancies, business headlines from publisher RSS). A failing source keeps its last known good file; the site shows its age.
- `facts.py` holds hand-checked values (tax brackets, minimum wage, VAT, holidays, GranMorgu facts), each with source and check date. Review every January and when a decree changes.
- `build.py` renders `templates/pages/*.html` in both languages into `_site/` with sitemap, robots, schema and hreflang.
- `.github/workflows/site.yml` runs fetch + build every 30 minutes and on every push, and deploys to GitHub Pages.

## Free tools (tools_meta.py)

`tools_meta.py` registers the free business tools (invoice, quote, receipt, payslip, VAT register, pricing, import cost, loan, PDF and image tools, QR and barcodes, and more). Each tool is `templates/pages/<key>.html` (extends `templates/tool_base.html`) with its script in `assets/tools/`. `site_config.py` adds them to `PAGES`; the hub is `/tools` (`/en/tools`). Everything runs in the browser: nothing is uploaded, and per-visitor conveniences (business details, invoice number, VAT register) live in the visitor's local storage only. Two libraries load from jsDelivr with a pinned version and SRI hash: pdf-lib 1.17.1 (MIT) on the PDF tools page and qrcode-generator 1.4.4 (MIT) on the QR, WhatsApp link and business card pages. Leave-law values live in `facts.LEAVE`, cash denominations in `facts.CASH`.

## Guides and resources (guides_meta.py, guides_content.py, resources_data.py)

Long-form guides are `templates/pages/<key>.html` (prose, both languages, a `.tldr` summary, `ol.steps`, `ul.check`, `.tbl.stack.tx` tables). `guides_meta.NEW` registers guides added on 21 Oct 2026 (licences, biztax, employer, dismissal, export, invest, trademark, finance, bookkeeping, resources) in `PAGES`; `guides_content.ENTRIES` holds label, title, description and FAQ per guide (rendered under the page with FAQPage schema). Every guide lists its sources and a "checked on" date: re-check the figures (APF premium, FVO, BZV, fees, the export currency rule) every January and when a decree changes.

`resources_data.py` is the directory behind `/instanties-en-links` (`/en/business-resources`): 175 institutions in 14 groups with official site, deep links, phone and address. Links were checked from a PC in Suriname on 21 Oct 2026; re-check twice a year.

## Vacancy board (worker/)

Employers post vacancies themselves at `/vacature-plaatsen` (`/en/post-a-job`). The backend is the Cloudflare Worker `sb-jobs` on the **Suriname Business** Cloudflare account (never the Explore account), with D1 (`sb-jobs`), KV (`sb-jobs-files`, PDFs) and Turnstile.

Flow: form → Turnstile + validation → employer confirms email → admin gets a review mail (approve / reject) → `fetch.py` pulls `/api/jobs/public` every 30 minutes (or right away when `GH_TOKEN` is set) → `build.py` renders one page per vacancy with JobPosting schema, in the language of the ad (`/vacature/<slug>` or `/en/job/<slug>`). Candidates apply directly with the employer: no CVs pass through this site. Employers get a manage link to close the ad early. A daily cron expires ads after the closing date, deletes unconfirmed submissions after 3 days and ended ads (with contact details) after 90 days.

Admin queue: the link at the bottom of every review mail (`/api/admin?sig=...`).

Deploy (from `worker/`): `wrangler d1 create sb-jobs`, put the id in `wrangler.toml`, `wrangler d1 execute sb-jobs --remote --file schema.sql`, `wrangler kv namespace create sb-jobs-files` (id into `wrangler.toml`), `wrangler secret put ADMIN_SECRET | TURNSTILE_SECRET | RESEND_API_KEY [| GH_TOKEN]`, `wrangler deploy`. Set `JOBS_API` and `TURNSTILE_SITEKEY` in `site_config.py`.

Local test: `.dev.vars` with `ADMIN_SECRET`, `TURNSTILE_SECRET=1x0000000000000000000000000000000AA`, `MAIL_LOG=1`; `wrangler dev`; then `JOBS_API=http://localhost:8787 TURNSTILE_SITEKEY=1x00000000000000000000AA python fetch.py && python build.py`.

## Editorial filters (quality.py)

Applied at build time; fetch.py still stores everything. Business news only shows headlines about Suriname: world news from the local papers' feeds (China, Colombia, Venezuela...) and crime reports are left out unless the headline also names Suriname (Guyana is allowed on the oil list). Tenders that a buyer re-posts (an AMENDMENT prefix or a corrected typo, at most 4 characters apart, same buyer) are folded into the newest one with a "Bijgewerkt" label.

## Directory listings (sb-api `/listing`)

Businesses add themselves or correct their entry at `/bedrijf-aanmelden` (`/en/add-your-business`; a company page links there with `?b=<slug>&n=<name>`). No account needed; honeypot plus 3 submissions per IP per day (10 when signed in) and 60 pending in total. A submission is stored as admin content of kind `company`, status draft, marked "wacht op controle", and the admin gets an email. In Beheer > Inhoud the admin checks it (call or WhatsApp), sets Live and saves; the next build merges it into the directory (`build.merge_listings`): with `replaces` it updates that OpenStreetMap entry, otherwise it becomes a new entry with its own page. Submitter name, email and the IP hash never leave the API (`/public/content` strips them).

## Design system (assets/style.css)

- Design v4 (24 Oct 2026), "framed utility": an indigo bar with the wordmark (`assets/wordmark-light.svg`, the SB tile and Source Sans 3 outlines since 25 Oct), a site search with suggestions and today's USD/EUR; a white navigation row (four menus plus Vacatures and Aanbestedingen); a light grey page (`--bg`) with white panels; an indigo footer. One sans, **Source Sans 3** (self-hosted, tabular lining figures), for all text.
- Icons: one distinct 24px line icon per tool and section (`tools_meta.ICONS`, `ICON_OF`, `GROUP_ICON`; templates use `kicon(key)` and `gicon(group)`).
- Colour has a job: indigo for brand, actions and the current place; red #b2341b for urgent deadlines; green for new and verified. Form fields have 3:1 borders (`--field`), focus is a 3px ring, every row and button is at least 44px tall.
- Search: every `form.hs` (header, drawer, home) suggests results while typing from `/assets/search-<lang>.json`; the directory search list is `/assets/companies-<lang>.json`, loaded on first use.
- Icons and PWA: `favicon.svg` and `/favicon.ico` (16, 32, 48) are a bold SB monogram that stays sharp at 16px; `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` and `apple-touch-icon.png` are full-bleed (no transparent corners) with the monogram inside the maskable safe zone, so they fill round and square launcher shapes.
- Checked with axe-core (WCAG 2.2 AA, 0 violations on every page type at 375 and 1366px), html-validate, Lighthouse and a no-overflow test at 320 to 1366px.
- Phones (≤1000px): header is logo + search + menu; the menu is a full-height drawer with search, today's USD/EUR, the four sections as accordions (the current section opens itself), account and language. A fixed bottom tab bar (Home, Tools, Vacatures, Koers, Menu) exposes the main destinations; `--tabbar` pads the body and lifts the toast. Nothing scrolls sideways; tables marked `.stack` become label/value rows.
- Every class name is stable: templates and `assets/*.js` build markup with them (`.card`, `.btn`, `.pill`, `.tbl`, `.calc`, `.result`, `.paper`, `.sba-dlg`, …). Change values, not names.

## Privacy, consent and EU rules (25 Oct 2026)

- Statistics need consent for visitors in the EU/EEA, UK, Switzerland and EU regions overseas (French Guiana, French Antilles, Reunion...). The region is read from the device time zone in `base.html` (unknown zone or plain UTC counts as EU). Until "Akkoord", neither Google Analytics nor Cloudflare Web Analytics loads and no cookie is set. Everyone else is counted as before. The choice lives in localStorage `sb_consent` (12 months accepted, 6 months declined); "Cookie-instellingen" in the footer and on /privacy reopens the bar. Consent Mode v2 defaults are all denied, ads signals are always off.
- The CBvS warm-up ping only runs on devices set to Suriname time.
- /privacy names the controller (Suriname Business, Explore group, Paramaribo), every processing purpose with legal basis and retention, the cookie table, processors (Cloudflare, GitHub, Google), transfers and rights. Keep it in step with any new script, cookie or form the same day.
- /voorwaarden covers user content (vacancies, listings): rules, human review, reasons by email, objections, and a report route (EU Digital Services Act basics). Job and company pages link "Melden" to the contact form with `?melding=<url>`.
- sb-api cron deletes contact messages after 12 months and strips submitter name, email, role and IP hash from listing submissions after 12 months (promised on /privacy).
- GA4 data retention (Admin > Data collection and modification > Data retention): event data 2 months, user data 14 months; /privacy states the 14-month maximum. Keep them in step.

## Logo (25 Oct 2026)

Saffron (#f2b134) square with "SB" in indigo, next to "Suriname Business" in Source Sans 3 Bold. All files are outlines generated from `assets/fonts/SourceSans3.woff2` (fontTools + HarfBuzz): `wordmark-light.svg`, `favicon.svg`, `favicon.ico` (16/32/48), `icon-192/512/512-maskable.png`, `apple-touch-icon.png`, `og.png`, `og-en.png`. The serif wordmark with the coloured full stop was retired as a typical AI-site look.

## Local

```
pip install -r requirements.txt
python fetch.py && python build.py
```

## Annual checklist (January)

- Wage tax tables, tax-free amount, AOV (`facts.TAX`)
- Minimum wage (`facts.MIN_WAGE`)
- Holidays incl. lunar dates (`facts.HOLIDAYS`)
- Bump `facts.CHECKED`

## SEO

- Every page gets one JSON-LD graph: Organization, WebSite, WebPage and a BreadcrumbList built in `render()` from the same `crumbs` the visitor sees, plus page types (WebApplication, FAQPage, LocalBusiness, JobPosting). Never add a BreadcrumbList by hand.
- `lastmod` in the sitemap and `dateModified` are the day the page content last changed (hash per URL in `data/live/page_dates.json`), not the build day. Timestamps that change every build are stripped before hashing (`PAGE_VOLATILE_PATTERNS`).
- IndexNow: `build.py` writes the URLs that changed today to `data/live/indexnow_queue.json` (each URL at most once a day) and the key file `/<INDEXNOW_KEY>.txt`; the `indexnow` job posts them after the deploy (Bing, Yandex, Seznam, Naver). Google reads the sitemap in Search Console.
- Duplicate OpenStreetMap listings (same name, phone or street, within ~300 m) are merged in `companies.normalise`; the old URL becomes a meta-refresh page to the kept listing.
