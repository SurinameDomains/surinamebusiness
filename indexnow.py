"""Post the pages that changed in the last build to IndexNow (Bing, Yandex, Seznam, Naver).

Runs in the workflow after the deploy, so search engines fetch the new version. Never fails the run.
Google does not use IndexNow; it reads sitemap.xml (submitted in Search Console) and the honest lastmod.
"""
import json
import os
import sys
import urllib.request

from site_config import INDEXNOW_KEY, SITE_URL

ROOT = os.path.dirname(os.path.abspath(__file__))


def main():
    try:
        q = json.load(open(os.path.join(ROOT, "data", "live", "indexnow_queue.json"), encoding="utf-8"))
    except Exception as e:
        print("no queue:", e)
        return
    urls = q.get("urls") or []
    if not urls:
        print("nothing changed")
        return
    host = SITE_URL.split("://", 1)[1].strip("/")
    body = json.dumps({"host": host, "key": INDEXNOW_KEY, "keyLocation": f"{SITE_URL}/{INDEXNOW_KEY}.txt",
                       "urlList": urls[:10000]}).encode()
    req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body, method="POST",
                                 headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print(f"IndexNow: {len(urls)} urls, HTTP {r.status}")
    except urllib.error.HTTPError as e:
        print(f"IndexNow: HTTP {e.code} {e.read()[:200]!r}")
    except Exception as e:
        print("IndexNow failed:", e)


if __name__ == "__main__":
    main()
    sys.exit(0)
