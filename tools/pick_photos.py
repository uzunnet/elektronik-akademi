# -*- coding: utf-8 -*-
"""Elle secilmis Commons dosyalarini indirir (tam baslik ile)."""
import json, os, re, time, urllib.parse, urllib.request

DIR = r"F:\360\ElektronikAkademi\img\components"
CRED = os.path.join(DIR, "credits.json")
UA = "ElektronikAkademi/1.0 (ogrenme amacli; yerel)"

PICKS = [
 ("supercap",  "File:Supercapacitor - ultracapacitor products of SECH SA.jpg"),
 ("scr",       "File:60857 RCA silicon thyristor.jpg"),
 ("reg7805",   "File:7809 (OnSemi) 02.jpg"),
 ("bridge",    "File:GBL04 diode bridge.jpg"),
 ("capacitor", "File:Soviet ceramic disc capacitors 01.jpg"),
]
REMOVE = ["triac"]  # yanlis eslesme -> kaldir

def clean(s):
    if not s: return ""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s)).strip()

def api_title(title):
    q = urllib.parse.quote(title)
    url = ("https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=%s"
           "&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=640" % q)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))

def fetch(title):
    d = 8
    for _ in range(6):
        try:
            return api_title(title)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print("   429 bekle", d); time.sleep(d); d = min(d*2, 90)
            else:
                print("   HTTP", e.code); time.sleep(3)
        except Exception as e:
            print("   HATA", e); time.sleep(3)
    return None

def dl(url, path):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
        f.write(r.read())

def main():
    creds = json.load(open(CRED, encoding="utf-8"))
    bykey = {c["key"]: c for c in creds}
    for k in REMOVE:
        for e in ("jpg","png"):
            p = os.path.join(DIR, "%s.%s" % (k, e))
            if os.path.exists(p): os.remove(p)
        bykey.pop(k, None)
        print("KALDIRILDI", k)
    for key, title in PICKS:
        d = fetch(title)
        if not d: print("YOK", key); continue
        page = list(d.get("query", {}).get("pages", {}).values())[0]
        ii = (page.get("imageinfo") or [None])[0]
        if not ii: print("imageinfo yok", key); continue
        url = ii.get("thumburl") or ii.get("url")
        ext = "png" if "png" in ii.get("mime","") else "jpg"
        for e in ("jpg","png"):
            p = os.path.join(DIR, "%s.%s" % (key, e))
            if os.path.exists(p): os.remove(p)
        dl(url, os.path.join(DIR, "%s.%s" % (key, ext)))
        em = ii.get("extmetadata", {})
        bykey[key] = {"key": key, "file": "%s.%s" % (key, ext),
                      "artist": clean((em.get("Artist") or {}).get("value")),
                      "license": (em.get("LicenseShortName") or {}).get("value",""),
                      "source": ii.get("descriptionurl","")}
        print("OK %-10s [%s] %s" % (key, bykey[key]["license"], page.get("title","")[:45]))
        time.sleep(2.2)
    json.dump(list(bykey.values()), open(CRED,"w",encoding="utf-8"), ensure_ascii=False, indent=1)
    print("toplam", len(bykey))

if __name__ == "__main__":
    main()
