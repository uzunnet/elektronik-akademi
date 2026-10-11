# -*- coding: utf-8 -*-
"""Belirli parcalar icin dogru fotoğrafi bulup yeniden indirir.
Baslik icinde 'require' deseni gecmeli; 'exclude' desenleri gecmemeli."""
import json, os, re, time, urllib.parse, urllib.request

DIR = r"F:\360\ElektronikAkademi\img\components"
CRED = os.path.join(DIR, "credits.json")
UA = "ElektronikAkademi/1.0 (ogrenme amacli; yerel)"

# key, arama terimi, gerekli regex, yasak regex
FIX = [
 ("supercap", "supercapacitor double layer capacitor module", r"supercap|edlc|double", r"graph|chart|plot|curve|symbol|diagram|circuit|logo"),
 ("triac", "triac TO-220 semiconductor component", r"triac", r"molecul|model|symbol|diagram|atom|ball"),
 ("scr", "thyristor SCR semiconductor stud", r"thyristor|\bSCR\b", r"symbol|diagram|curve|molecul|logo"),
 ("reg7805", "LM7805 voltage regulator TO-220", r"78(05|L05)|voltage regulator|LM78", r"symbol|diagram|schematic|circuit"),
 ("bridge", "bridge rectifier 4 diodes component", r"bridge|rectifier", r"symbol|diagram|schematic|circuit|curve|drawing"),
 ("crystal", "quartz crystal resonator HC-49", r"crystal|quartz|resonator", r"symbol|diagram|logo"),
 ("capacitor", "ceramic disc capacitor small", r"ceramic|capacitor", r"vacuum|transmitter|tube|symbol|diagram"),
]

def clean(s):
    if not s: return ""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s)).strip()

def api(term):
    q = urllib.parse.quote("filetype:bitmap " + term)
    url = ("https://commons.wikimedia.org/w/api.php?action=query&format=json"
           "&generator=search&gsrsearch=%s&gsrnamespace=6&gsrlimit=15"
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
    for key, term, req, ban in FIX:
        data = fetch(term)
        if not data or not data.get("query", {}).get("pages"):
            print("YOK  %s" % key); time.sleep(2); continue
        pages = sorted(data["query"]["pages"].values(), key=lambda p: p.get("index", 99))
        picked = None
        for p in pages:
            title = p.get("title", "")
            ii = (p.get("imageinfo") or [None])[0]
            if not ii or "image/" not in ii.get("mime", ""): continue
            if not ("jpeg" in ii["mime"] or "png" in ii["mime"]): continue
            if re.search(ban, title, re.I): continue
            if not re.search(req, title, re.I): continue
            picked = (p, ii); break
        if not picked:
            print("UYGUN YOK  %s" % key); time.sleep(2); continue
        p, ii = picked
        url = ii.get("thumburl") or ii.get("url")
        ext = "png" if "png" in ii["mime"] else "jpg"
        # eski farkli uzantili dosyayi sil
        for e in ("jpg", "png"):
            old = os.path.join(DIR, "%s.%s" % (key, e))
            if os.path.exists(old): os.remove(old)
        out = os.path.join(DIR, "%s.%s" % (key, ext))
        dl(url, out)
        em = ii.get("extmetadata", {})
        bykey[key] = {"key": key, "file": "%s.%s" % (key, ext),
                      "artist": clean((em.get("Artist") or {}).get("value")),
                      "license": (em.get("LicenseShortName") or {}).get("value", ""),
                      "source": ii.get("descriptionurl", "")}
        print("DUZELTILDI %-10s -> %s  [%s]" % (key, p.get("title","")[:50], bykey[key]["license"]))
        time.sleep(2.2)
    json.dump(list(bykey.values()), open(CRED, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("bitti")

if __name__ == "__main__":
    main()
