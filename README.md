# surinamebusiness.com

Tools, data, tenders and jobs for working and doing business in Suriname. Dutch at `/`, English at `/en/`.

Fully independent site: own repo, own data pipeline, own Cloudflare account. It shares no files, data or workers with any other site.

## How it works

- `fetch.py` pulls public data into `data/live/` (exchange rates from CME, tenders from gov.sr, Staatsolie, IDB and World Bank, government vacancies, business headlines from publisher RSS). A failing source keeps its last known good file; the site shows its age.
- `facts.py` holds hand-checked values (tax brackets, minimum wage, VAT, holidays, GranMorgu facts), each with source and check date. Review every January and when a decree changes.
- `build.py` renders `templates/pages/*.html` in both languages into `_site/` with sitemap, robots, schema and hreflang.
- `.github/workflows/site.yml` runs fetch + build every 30 minutes and on every push, and deploys to GitHub Pages.

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
