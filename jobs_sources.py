"""Extra job sources for fetch.py. Each function returns a list of job dicts:
{id, source, employer, title, published, deadline, url, location}
Only sources whose robots.txt allows access; titles + links only."""
import datetime as dt
import html
import json
import re
import urllib.parse

UA_BROWSER = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"


def _clean(s):
    s = re.sub(r"<!\[CDATA\[(.*?)\]\]>", r"\1", s or "", flags=re.S)
    s = html.unescape(re.sub(r"<[^>]+>", " ", s or ""))
    return re.sub(r"\s+", " ", s).strip()


def newmont(get):
    h = get("https://jobs.newmont.com/us/en/search-results?keywords=Suriname", headers={"User-Agent": UA_BROWSER})
    m = re.search(r"phApp\.ddo\s*=\s*(\{.*?\});\s*phApp", h, flags=re.S)
    if not m:
        raise ValueError("no ddo")
    d = json.loads(m.group(1))
    jobs = d["eagerLoadRefineSearch"]["data"]["jobs"]
    out = []
    for j in jobs:
        if "suriname" not in (str(j.get("country", "")) + str(j.get("city", ""))).lower():
            continue
        out.append({"id": f"nm-{j['jobId']}", "source": "Newmont", "employer": "Newmont Suriname",
                    "title": _clean(j["title"]), "published": (j.get("postedDate") or "")[:10] or None,
                    "deadline": None, "url": f"https://jobs.newmont.com/us/en/job/{j['jobId']}",
                    "location": j.get("city") or "Suriname"})
    return out


def totalenergies(get):
    x = get("https://jobs.totalenergies.com/en_US/careers/SearchJobs/Suriname/feed/?jobRecordsPerPage=50",
            headers={"User-Agent": UA_BROWSER})
    page = get("https://jobs.totalenergies.com/en_US/careers/SearchJobs/?search=Suriname&jobRecordsPerPage=50",
               headers={"User-Agent": UA_BROWSER})
    # keep only links that the HTML search lists with country Suriname
    ok_links = set()
    for blk in re.split(r'<li[^>]+class="[^"]*list-item[^"]*"', page):
        pass
    for art in re.findall(r"<article.*?</article>", page, flags=re.S):
        if "Suriname" in art:
            for href in re.findall(r'href="([^"]+/JobDetail/[^"]+)"', art):
                ok_links.add(href.split("?")[0])
    out = []
    for it in re.findall(r"<item>(.*?)</item>", x, flags=re.S):
        title = _clean(re.search(r"<title>(.*?)</title>", it, flags=re.S).group(1))
        link = _clean(re.search(r"<link>(.*?)</link>", it, flags=re.S).group(1))
        pub = re.search(r"<pubDate>(.*?)</pubDate>", it, flags=re.S)
        if ok_links and link.split("?")[0] not in ok_links:
            continue
        try:
            from email.utils import parsedate_to_datetime
            p = parsedate_to_datetime(pub.group(1)).date().isoformat() if pub else None
        except Exception:
            p = None
        jid = re.sub(r"\D", "", link.rstrip("/").split("/")[-1]) or link[-12:]
        out.append({"id": f"te-{jid}", "source": "TotalEnergies", "employer": "TotalEnergies EP Suriname",
                    "title": title, "published": p, "deadline": None, "url": link, "location": "Suriname"})
    return out


def undp(get):
    base = "https://estm.fa.em2.oraclecloud.com/hcmRestApi/resources/latest/"
    url = (base + "recruitingCEJobRequisitions?onlyData=true&expand=requisitionList"
           "&finder=findReqs;siteNumber=CX_1,keyword=Suriname,limit=25")
    d = json.loads(get(url, headers={"User-Agent": UA_BROWSER, "Accept": "application/json"}))
    out = []
    for r in (d.get("items") or [{}])[0].get("requisitionList", []):
        if r.get("PrimaryLocationCountry") != "SR":
            continue
        deadline = None
        try:
            det = json.loads(get(base + "recruitingCEJobRequisitionDetails?expand=all&onlyData=true"
                                 f"&finder=ById;Id=%22{r['Id']}%22,siteNumber=CX_1",
                                 headers={"User-Agent": UA_BROWSER, "Accept": "application/json"}))
            deadline = (det["items"][0].get("ExternalPostedEndDate") or "")[:10] or None
        except Exception:
            pass
        out.append({"id": f"undp-{r['Id']}", "source": "UNDP", "employer": "UNDP Suriname",
                    "title": _clean(r["Title"]), "published": (r.get("PostedDate") or "")[:10] or None,
                    "deadline": deadline,
                    "url": f"https://estm.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/requisitions/job/{r['Id']}",
                    "location": r.get("PrimaryLocation") or "Paramaribo"})
    return out


def unicef(get):
    h = get("https://jobs.unicef.org/en-us/filter/?location=Suriname", headers={"User-Agent": UA_BROWSER})
    out, seen = [], set()
    for blk in h.split('class="list-view--item')[1:]:
        a = re.search(r'<a[^>]+class="[^"]*job-link[^"]*"[^>]+href="([^"]+)"[^>]*>(.*?)</a>', blk, flags=re.S) \
            or re.search(r'<a[^>]+href="([^"]+)"[^>]+class="[^"]*job-link[^"]*"[^>]*>(.*?)</a>', blk, flags=re.S)
        if not a:
            continue
        loc = re.search(r'class="location"[^>]*>(.*?)</span>', blk, flags=re.S)
        loc = _clean(loc.group(1)) if loc else ""
        if "suriname" not in (loc + a.group(2)).lower() and "paramaribo" not in (loc + a.group(2)).lower():
            continue
        dl = re.search(r'close-date.*?datetime="([0-9-]{10})', blk, flags=re.S)
        url = urllib.parse.urljoin("https://jobs.unicef.org", a.group(1))
        if url in seen:
            continue
        seen.add(url)
        out.append({"id": "unicef-" + re.sub(r"\D", "", url)[-8:], "source": "UNICEF", "employer": "UNICEF",
                    "title": _clean(a.group(2)), "published": None, "deadline": dl.group(1) if dl else None,
                    "url": url, "location": loc or "Paramaribo"})
    return out


def usembassy(get):
    h = get("https://erajobs.state.gov/dos-era/sur/vacancysearch/searchVacancies.hms", headers={"User-Agent": UA_BROWSER})
    out = []
    for blk in re.split(r'<div class="border-bottom', h)[1:]:
        a = re.search(r'<h2[^>]*>\s*<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', blk, flags=re.S)
        if not a:
            continue
        jn = re.search(r"jnum=(\d+)", a.group(1))
        cd = re.search(r"Close Date[^0-9]*(\d{2})/(\d{2})/(\d{4})", _clean(blk))
        deadline = f"{cd.group(3)}-{cd.group(1)}-{cd.group(2)}" if cd else None
        if not jn:
            continue
        out.append({"id": f"usemb-{jn.group(1)}", "source": "US Embassy", "employer": "U.S. Embassy Paramaribo",
                    "title": _clean(a.group(2)), "published": None, "deadline": deadline,
                    "url": f"https://erajobs.state.gov/dos-era/vacancy/viewVacancyDetail.hms?jnum={jn.group(1)}&orgId=174",
                    "location": "Paramaribo"})
    return out


def uncareers(get):
    body = json.dumps({"filterConfig": {"keyword": ""}, "pagination": {"page": 0, "itemPerPage": 500,
                       "sortBy": "startDate", "sortDirection": -1}}).encode()
    d = json.loads(get("https://careers.un.org/api/public/opening/jo/list/filteredV2/en", data=body,
                       headers={"User-Agent": UA_BROWSER, "Content-Type": "application/json"}))
    items = d.get("data", {}).get("list") or d.get("data") or []
    out = []
    for j in items if isinstance(items, list) else []:
        ds = " ".join(x.get("description", "") for x in (j.get("dutyStation") or []))
        if "PARAMARIBO" not in ds.upper():
            continue
        out.append({"id": f"un-{j.get('jobId')}", "source": "UN Careers", "employer": (j.get("dept") or {}).get("name") or "United Nations",
                    "title": _clean(j.get("jobTitle")), "published": (j.get("startDate") or "")[:10] or None,
                    "deadline": (j.get("endDate") or "")[:10] or None,
                    "url": f"https://careers.un.org/jobSearchDescription/{j.get('jobId')}?language=en", "location": "Paramaribo"})
    return out


SOURCES = [("Newmont", newmont), ("TotalEnergies", totalenergies), ("UNDP", undp), ("UNICEF", unicef),
           ("US Embassy", usembassy), ("UN Careers", uncareers)]
