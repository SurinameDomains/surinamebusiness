# surinamebusiness.com

Tools, data, tenders and jobs for working and doing business in Suriname. Dutch at `/`, English at `/en/`.

Fully independent site: own repo, own data pipeline, own Cloudflare account. It shares no files, data or workers with any other site.

## How it works

- `fetch.py` pulls public data into `data/live/` (exchange rates from CME, tenders from gov.sr, Staatsolie, IDB and World Bank, government vacancies, business headlines from publisher RSS). A failing source keeps its last known good file; the site shows its age.
- `facts.py` holds hand-checked values (tax brackets, minimum wage, VAT, holidays, GranMorgu facts), each with source and check date. Review every January and when a decree changes.
- `build.py` renders `templates/pages/*.html` in both languages into `_site/` with sitemap, robots, schema and hreflang.
- `.github/workflows/site.yml` runs fetch + build every 30 minutes and on every push, and deploys to GitHub Pages.

## Vacancy board (worker/)

Employers post vacancies themselves at `/vacature-plaatsen` (`/en/post-a-job`). The backend is the Cloudflare Worker `sb-jobs` on the **Suriname Business** Cloudflare account (never the Explore account), with D1 (`sb-jobs`), KV (`sb-jobs-files`, PDFs) and Turnstile.

Flow: form → Turnstile + validation → employer confirms email → admin gets a review mail (approve / reject) → `fetch.py` pulls `/api/jobs/public` every 30 minutes (or right away when `GH_TOKEN` is set) → `build.py` renders one page per vacancy with JobPosting schema, in the language of the ad (`/vacature/<slug>` or `/en/job/<slug>`). Candidates apply directly with the employer: no CVs pass through this site. Employers get a manage link to close the ad early. A daily cron expires ads after the closing date, deletes unconfirmed submissions after 3 days and ended ads (with contact details) after 90 days.

Admin queue: the link at the bottom of every review mail (`/api/admin?sig=...`).

Deploy (from `worker/`): `wrangler d1 create sb-jobs`, put the id in `wrangler.toml`, `wrangler d1 execute sb-jobs --remote --file schema.sql`, `wrangler kv namespace create sb-jobs-files` (id into `wrangler.toml`), `wrangler secret put ADMIN_SECRET | TURNSTILE_SECRET | RESEND_API_KEY [| GH_TOKEN]`, `wrangler deploy`. Set `JOBS_API` and `TURNSTILE_SITEKEY` in `site_config.py`.

Local test: `.dev.vars` with `ADMIN_SECRET`, `TURNSTILE_SECRET=1x0000000000000000000000000000000AA`, `MAIL_LOG=1`; `wrangler dev`; then `JOBS_API=http://localhost:8787 TURNSTILE_SITEKEY=1x00000000000000000000AA python fetch.py && python build.py`.

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
