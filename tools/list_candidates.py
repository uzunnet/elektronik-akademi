# -*- coding: utf-8 -*-
import json, sys, time, urllib.parse, urllib.request
UA = "ElektronikAkademi/1.0 (ogrenme amacli; yerel)"
def api(term):
    q = urllib.parse.quote("filetype:bitmap " + term)
    url = ("https://commons.wikimedia.org/w/api.php?action=query&format=json"
           "&generator=search&gsrsearch=%s&gsrnamespace=6&gsrlimit=10"
           "&prop=imageinfo&iiprop=url|mime&iiurlwidth=640" % q)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))
terms = sys.argv[1:]
for t in terms:
    print("=== %s ===" % t)
    try:
        d = api(t)
        pages = sorted(d.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 99))
        for p in pages:
            ii = (p.get("imageinfo") or [{}])[0]
            print("  %-60s %s" % (p.get("title", "")[:58], ii.get("mime", "")))
    except Exception as e:
        print("  HATA", e)
    time.sleep(2)
