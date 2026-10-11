# -*- coding: utf-8 -*-
"""credits.json -> js/photos.js  (Turkce adlar + gruplar)"""
import json, os

ROOT = r"F:\360\ElektronikAkademi"
CRED = os.path.join(ROOT, "img", "components", "credits.json")
OUT = os.path.join(ROOT, "js", "photos.js")

TITLES = {
 "resistor":"Direnç (axial)","capacitor":"Seramik kondansatör","elec-cap":"Elektrolitik kondansatör",
 "film-cap":"Film kondansatör","tantalum":"Tantal kondansatör","smd-resistor":"SMD direnç","smd-cap":"SMD kondansatör",
 "inductor":"Bobin (indüktör)","transformer":"Transformatör","crystal":"Kristal osilatör","pot":"Potansiyometre",
 "trim-pot":"Trimpot (ayarlı direnç)","varistor":"Varistör (MOV)","thermistor":"Termistör (NTC)","supercap":"Süper kondansatör",
 "diode":"Doğrultma diyodu","schottky":"Schottky diyot","zener":"Zener diyot","led":"LED (5 mm)","photodiode":"Fotodiyot",
 "bjt":"Transistör (BJT, TO-92)","mosfet":"MOSFET / güç transistörleri","igbt":"IGBT modül","triac":"Triyak","scr":"Tristör (SCR)",
 "opamp":"Op-amp (işlemsel yükselteç)","reg7805":"Voltaj regülatörü (TO-220)","tl431":"TL431 gerilim referansı","ne555":"NE555 zamanlayıcı",
 "ic-dip":"DIP entegre (IC)","mcu":"Mikrodenetleyici (ATmega)","shiftreg":"74HC595 kaydırma kaydedicisi",
 "arduino":"Arduino Uno","esp32":"ESP32 geliştirme kartı","stm32":"STM32 kartı","rpi":"Raspberry Pi",
 "sevenseg":"7-segment gösterge","connector":"Pin header konnektör","usbconn":"USB konnektör","dcjack":"DC güç jakı",
 "motor":"DC motor","servo":"Servo motor","stepper":"Step (adım) motoru","fan":"Soğutma fanı","speaker":"Hoparlör","buzzer":"Buzzer",
 "switch":"Anahtar (toggle)","pushbutton":"Buton (tactile)","dip-switch":"DIP switch","reed-relay":"Reed röle",
 "ssr":"Katı hal rölesi (SSR)","relaymod":"Röle modülü","bridge":"Köprü doğrultucu","fuse":"Sigorta (cam)",
 "breadboard":"Breadboard (test kartı)","pcb":"Baskı devre kartı (PCB)","multimeter":"Dijital multimetre","oscilloscope":"Osiloskop",
 "solder":"Havya (lehim makinesi)","hotair":"Sıcak hava istasyonu","solderwire":"Lehim teli","flux":"Lehim flux",
 "desolder":"Lehim sökme pompası","tweezers":"Elektronik cımbız","esdstrap":"ESD (antistatik) bileklik","probe":"Osiloskop probu",
 "jumper":"Jumper kablolar","fungen":"Sinyal üreteci","heatsink":"Soğutucu (heatsink)","thermalpaste":"Termal macun","battery":"9V pil",
 "lm35":"LM35 sıcaklık sensörü","hcsr04":"HC-SR04 ultrasonik sensör","pir":"PIR hareket sensörü","mpu6050":"MPU-6050 ivme/jiro",
 "solar":"Güneş paneli (hücre)","peltier":"Peltier modül (TEC)",
 "optocoupler":"Optokuplör","buckmodule":"Buck dönüştürücü modülü","boostmodule":"Boost dönüştürücü modülü",
 "tp4056":"TP4056 şarj modülü","lm317":"LM317 ayarlı regülatör","lm358":"LM358 op-amp","uln2003":"ULN2003 sürücü",
 "arduino-nano":"Arduino Nano","esp8266":"ESP8266 WiFi modülü","motherboard":"Anakart","tvboard":"TV besleme kartı",
 "thermalcam":"Termal kamera","lcrmeter":"LCR metre","clampmeter":"Pens ampermetre"
}

GROUPS = [
 ("Pasif Bileşenler", ["resistor","capacitor","elec-cap","film-cap","tantalum","smd-resistor","smd-cap","inductor","transformer","crystal","pot","trim-pot","varistor","thermistor","supercap"]),
 ("Yarıiletkenler", ["diode","schottky","zener","led","photodiode","bjt","mosfet","igbt","triac","scr","opamp","reg7805","tl431","lm317","lm358","ne555","ic-dip","mcu","shiftreg","uln2003","optocoupler"]),
 ("Modüller & Sensörler", ["arduino","arduino-nano","esp32","esp8266","stm32","rpi","hcsr04","pir","mpu6050","lm35","relaymod","sevenseg","connector","usbconn","dcjack","solar","peltier","buckmodule","boostmodule","tp4056"]),
 ("Kartlar & Sistem", ["motherboard","tvboard"]),
 ("Motor & Ses", ["motor","servo","stepper","fan","speaker","buzzer"]),
 ("Anahtarlama & Koruma", ["switch","pushbutton","dip-switch","reed-relay","ssr","bridge","fuse"]),
 ("Ekipman & Sarf", ["breadboard","pcb","multimeter","oscilloscope","solder","hotair","solderwire","flux","desolder","tweezers","esdstrap","probe","jumper","fungen","heatsink","thermalpaste","battery","thermalcam","lcrmeter","clampmeter"])
]

def js_str(s):
    return json.dumps(s, ensure_ascii=False)

def main():
    creds = json.load(open(CRED, encoding="utf-8"))
    bykey = {c["key"]: c for c in creds}
    lines = []
    lines.append("/* Elektronik Akademi - Parca Fotograflari (otomatik uretildi)")
    lines.append("   Kaynak: Wikimedia Commons. Lisanslar credits.json / ekranda gosterilir. */")
    lines.append("const PHOTOS = {")
    for k, c in bykey.items():
        t = TITLES.get(k, k)
        f = "img/components/" + c["file"]
        lines.append('  %s: { f: %s, t: %s, lic: %s, src: %s },'
                     % (js_str(k), js_str(f), js_str(t), js_str(c.get("license","")), js_str(c.get("source",""))))
    lines.append("};")
    lines.append("")
    lines.append("const PHOTO_GROUPS = [")
    for name, keys in GROUPS:
        present = [k for k in keys if k in bykey]
        lines.append('  { name: %s, keys: [%s] },' % (js_str(name), ", ".join(js_str(k) for k in present)))
    lines.append("];")
    open(OUT, "w", encoding="utf-8").write("\n".join(lines) + "\n")
    print("yazildi:", OUT, "kayit:", len(bykey))

if __name__ == "__main__":
    main()

