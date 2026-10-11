# -*- coding: utf-8 -*-
"""Wikimedia Commons'tan telifsiz elektronik parca fotograflari indirir.
Lisansa uygun (CC0/CC BY/CC BY-SA) gorseller; kucuk (640px) surum kaydedilir.
"""
import json, os, time, urllib.parse, urllib.request, glob, sys

DIR = r"F:\360\ElektronikAkademi\img\components"
os.makedirs(DIR, exist_ok=True)
CRED = os.path.join(DIR, "credits.json")
UA = "ElektronikAkademi/1.0 (ogrenme amacli; yerel)"

ITEMS = [
    ("relay", "relay electronic SPDT"),
    ("mcu", "ATmega328 microcontroller chip"),
    ("optocoupler", "optocoupler PC817"),
    ("pushbutton", "tactile push button switch"),
    ("schottky", "schottky diode"),
    ("film-cap", "film capacitor"),
    ("tantalum", "tantalum capacitor"),
    ("smd-resistor", "SMD resistor 0805"),
    ("smd-cap", "surface mount ceramic capacitor"),
    ("trim-pot", "trimmer potentiometer"),
    ("dip-switch", "DIP switch"),
    ("reed-relay", "reed relay"),
    ("ssr", "solid state relay"),
    ("tl431", "TL431 voltage reference"),
    ("ne555", "NE555 timer IC"),
    ("logic74", "74HC logic gate integrated circuit"),
    ("shiftreg", "74HC595 shift register"),
    ("arduino", "Arduino Uno board"),
    ("esp32", "ESP32 development board"),
    ("stm32", "STM32 microcontroller board"),
    ("rpi", "Raspberry Pi board"),
    ("sevenseg", "7 segment display"),
    ("lcd1602", "1602 LCD display module"),
    ("connector", "pin header connector"),
    ("usbconn", "USB connector plug"),
    ("dcjack", "DC power jack"),
    ("motor", "small DC motor"),
    ("servo", "servo motor"),
    ("stepper", "stepper motor"),
    ("fan", "computer cooling fan"),
    ("heatsink", "aluminium heatsink"),
    ("thermalpaste", "thermal paste"),
    ("jumper", "jumper wires breadboard"),
    ("probe", "oscilloscope probe"),
    ("benchpsu", "bench lab power supply"),
    ("fungen", "function generator"),
    ("hotair", "hot air soldering station"),
    ("solderwire", "solder wire tin"),
    ("flux", "soldering flux"),
    ("desolder", "desoldering pump"),
    ("tweezers", "electronics tweezers"),
    ("esdstrap", "antistatic wrist strap"),
    ("lm35", "LM35 temperature sensor"),
    ("hcsr04", "ultrasonic sensor HC-SR04"),
    ("pir", "PIR motion sensor"),
    ("mpu6050", "MPU-6050 accelerometer module"),
    ("solar", "solar cell panel"),
    ("peltier", "Peltier thermoelectric module"),
    ("supercap", "supercapacitor"),
    ("relaymod", "relay module board"),
]

def load_credits():
    if os.path.exists(CRED):
        try:
            return json.load(open(CRED, encoding="utf-8"))
        except Exception:
            return []
    return []

def existing_keys():
    keys = set()
    for f in glob.glob(os.path.join(DIR, "*")):
        b = os.path.basename(f)
        if b == "credits.json": continue
        keys.add(b.rsplit(".", 1)[0])
    return keys

def api_search(term):
    q = urllib.parse.quote("filetype:bitmap " + term)
    url = ("https://commons.wikimedia.org/w/api.php?action=query&format=json"
           "&generator=search&gsrsearch=%s&gsrnamespace=6&gsrlimit=8"
           "&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=640" % q)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))

def download(url, path):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
        f.write(r.read())

def clean(s):
    import re
    if not s: return ""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s)).strip()

def get_with_backoff(term):
    delay = 8
    for attempt in range(6):
        try:
            return api_search(term)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print("   429 -> %.0fs bekle" % delay); time.sleep(delay); delay = min(delay * 2, 90)
            else:
                print("   HTTP %s" % e.code); time.sleep(3)
        except Exception as e:
            print("   HATA %s" % e); time.sleep(3)
    return None

def main():
    have = existing_keys()
    credits = load_credits()
    cred_keys = {c.get("key") for c in credits}
    added = 0
    for key, term in ITEMS:
        if key in have:
            continue
        data = get_with_backoff(term)
        picked = None
        if data and data.get("query", {}).get("pages"):
            pages = sorted(data["query"]["pages"].values(), key=lambda p: p.get("index", 99))
            for p in pages:
                ii = (p.get("imageinfo") or [None])[0]
                if ii and ii.get("mime", "").startswith("image/") and ("jpeg" in ii["mime"] or "png" in ii["mime"]):
                    picked = ii; break
        if not picked:
            print("YOK  %s" % key); time.sleep(2.0); continue
        url = picked.get("thumburl") or picked.get("url")
        ext = "png" if "png" in picked["mime"] else "jpg"
        out = os.path.join(DIR, "%s.%s" % (key, ext))
        try:
            download(url, out)
        except Exception as e:
            print("INDIREMEDI %s : %s" % (key, e)); time.sleep(2.0); continue
        em = picked.get("extmetadata", {})
        rec = {
            "key": key,
            "file": "%s.%s" % (key, ext),
            "artist": clean((em.get("Artist") or {}).get("value")),
            "license": (em.get("LicenseShortName") or {}).get("value", ""),
            "source": picked.get("descriptionurl", "")
        }
        if key not in cred_keys:
            credits.append(rec); cred_keys.add(key)
        print("OK   %-14s [%s]" % (key, rec["license"]))
        added += 1
        time.sleep(2.2)
    json.dump(credits, open(CRED, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("--- eklendi: %d, toplam kayit: %d ---" % (added, len(credits)))

if __name__ == "__main__":
    main()
