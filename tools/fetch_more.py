# -*- coding: utf-8 -*-
"""Ek parca/modul/ekipman fotograflari (Wikimedia Commons)."""
import json, os, re, time, urllib.parse, urllib.request

DIR = r"F:\360\ElektronikAkademi\img\components"
CRED = os.path.join(DIR, "credits.json")
UA = "ElektronikAkademi/1.0 (ogrenme amacli; yerel)"

ITEMS = [
    ("optocoupler", "optocoupler component 4N35"),
    ("buckmodule", "buck converter module DC-DC"),
    ("boostmodule", "boost converter module DC-DC"),
    ("tp4056", "TP4056 lithium battery charger module"),
    ("lm317", "LM317 adjustable voltage regulator"),
    ("lm358", "LM358 operational amplifier chip"),
    ("uln2003", "ULN2003 darlington array chip"),
    ("arduino-nano", "Arduino Nano board"),
    ("esp8266", "ESP8266 WiFi module board"),
    ("motherboard", "computer motherboard"),
    ("tvboard", "television circuit board power supply"),
    ("thermalcam", "thermal imaging camera"),
    ("lcrmeter", "LCR meter"),
    ("clampmeter", "clamp meter"),
]

def clean(s):
    return re.sub(r"\s+"," ",re.sub(r"<[^>]+>","",s)).strip() if s else ""

def api(term):
    q = urllib.parse.quote("filetype:bitmap " + term)
    url = ("https://commons.wikimedia.org/w/api.php?action=query&format=json"
           "&generator=search&gsrsearch=%s&gsrnamespace=6&gsrlimit=10"
           "&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=640" % q)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))

def fetch(term):
    d = 8
    for _ in range(6):
        try:
            return api(term)
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
    for key, term in ITEMS:
        if key in bykey and os.path.exists(os.path.join(DIR, bykey[key]["file"])):
            continue
        data = fetch(term)
        if not data or not data.get("query", {}).get("pages"):
            print("YOK ", key); time.sleep(2); continue
        pages = sorted(data["query"]["pages"].values(), key=lambda p: p.get("index", 99))
        picked = None
        for p in pages:
            ii = (p.get("imageinfo") or [None])[0]
            if ii and ii.get("mime","") in ("image/jpeg","image/png"):
                picked = (p, ii); break
        if not picked:
            print("YOK ", key); time.sleep(2); continue
        p, ii = picked
        url = ii.get("thumburl") or ii.get("url")
        ext = "png" if "png" in ii["mime"] else "jpg"
        for e in ("jpg","png"):
            old = os.path.join(DIR, "%s.%s" % (key, e))
            if os.path.exists(old): os.remove(old)
        dl(url, os.path.join(DIR, "%s.%s" % (key, ext)))
        em = ii.get("extmetadata", {})
        bykey[key] = {"key": key, "file": "%s.%s" % (key, ext),
                      "artist": clean((em.get("Artist") or {}).get("value")),
                      "license": (em.get("LicenseShortName") or {}).get("value",""),
                      "source": ii.get("descriptionurl","")}
        print("OK  %-12s [%s]" % (key, bykey[key]["license"])); time.sleep(2.2)
    json.dump(list(bykey.values()), open(CRED,"w",encoding="utf-8"), ensure_ascii=False, indent=1)
    print("toplam", len(bykey))

if __name__ == "__main__":
    main()
