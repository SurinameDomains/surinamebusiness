-- D1 schema for the surinamebusiness.com vacancy board (sb-jobs worker)
CREATE TABLE IF NOT EXISTS jobs (
  id              TEXT PRIMARY KEY,
  slug            TEXT NOT NULL,
  status          TEXT NOT NULL,            -- unverified | pending | live | rejected | closed | expired
  lang            TEXT NOT NULL,            -- nl | en (language of the ad text)
  title           TEXT NOT NULL,
  employer        TEXT NOT NULL,
  employer_url    TEXT,
  location        TEXT NOT NULL,
  employment_type TEXT NOT NULL,            -- FULL_TIME | PART_TIME | TEMPORARY | CONTRACTOR | INTERN
  description     TEXT NOT NULL,
  salary_min      REAL,
  salary_max      REAL,
  salary_currency TEXT,                     -- SRD | USD | EUR
  salary_period   TEXT,                     -- MONTH | HOUR | YEAR
  deadline        TEXT NOT NULL,            -- YYYY-MM-DD, last day to apply
  apply_email     TEXT,
  apply_url       TEXT,
  pdf_key         TEXT,
  contact_name    TEXT NOT NULL,            -- private
  contact_email   TEXT NOT NULL,            -- private
  contact_phone   TEXT,                     -- private
  verify_hash     TEXT,
  ip_hash         TEXT,
  reject_reason   TEXT,
  created_at      TEXT NOT NULL,
  verified_at     TEXT,
  approved_at     TEXT,
  closed_at       TEXT
);
CREATE INDEX IF NOT EXISTS jobs_status ON jobs(status, deadline);
CREATE INDEX IF NOT EXISTS jobs_ip ON jobs(ip_hash, created_at);
CREATE INDEX IF NOT EXISTS jobs_email ON jobs(contact_email, created_at);
