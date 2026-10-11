# ⚡ Elektronik Akademi

Devre kartı odaklı, sıfırdan profesyonel elektronik öğrenme platformu.
Kurulum gerektirmez, çevrimdışı çalışır. HTML + CSS + JavaScript (vanilla).

## Nasıl çalıştırılır?

**Kolay yol:** `Baslat.bat` dosyasına çift tıkla → tarayıcıda açılır.

**Alternatif:** `index.html` dosyasını çift tıkla (bazı özellikler için sunucu önerilir).

## İçerik

7 set, 15 modül, 66 ders, 137 test sorusu, 82 sözlük terimi, 8 hesaplayıcı, 59 şekil/şema + 90 parça fotoğrafı.

| Set | Modüller | Konular |
|---|---|---|
| Temel Elektronik | m0, m1, m2 | Bileşenler, devre analizi, MCU mantığı |
| Güç Elektroniği | m3 | Besleme yöntemleri, SMPS, topolojiler, HS/LS MOSFET |
| Anahtarlamalı Güç | m4, m5, m6 | Buck/boost, PFC, flyback, köprü, gate driver |
| Arıza Bulma | m7, m8 | Voltage drop, enjeksiyon, şema, BoardView |
| Osiloskop | m9, m10 | Ölçekler, trigger, grafik ve SMPS analizi |
| Multimetre | m11 | Tüm kademeler, diyot/transistör/MOSFET ölçümü |
| Kart Tamiri | m12 | Check-list, belirti haritası, sistematik teşhis |

## 📐 Şekiller, Parça Fotoğrafları & Pinout

Görsel öğrenme: **gerçek parça fotoğrafları** + parça **sembolleri**, **bacak (pinout)** diyagramları,
blok şemalar ve devre şemaları. Derslerin içinde otomatik görünür + **Şekiller** sekmesinde galeri.

- **76 gerçek fotoğraf** (Wikimedia Commons, telifsiz: CC0/CC BY/CC BY-SA — lisans her kartta yazılı):
  direnç, kondansatör, bobin, trafo, diyot, zener, LED, transistör, MOSFET, röle, op-amp, regülatör,
  entegreler, Arduino/ESP32/STM32/Raspberry Pi, sensörler (LM35, HC-SR04, PIR, MPU-6050), motorlar,
  ölçüm cihazları (multimetre, osiloskop), havyadan cımbıza tüm ekipman…
- **59 şekil/şema (SVG, çevrimdışı):** pinout'lar (E/B/C, G/D/S, IN/GND/OUT, COM/NO/NC, A/K), renk kodu,
  kutup, lojik kapılar, op-amp yükselteç, gerilim bölücü, RC, köprü/tam dalga doğrultma, Boost, Buck, H-köprü,
  triyak/tristör/optokuplör sembolleri, SMPS blok şeması…

İndirme scriptleri: `tools/fetch_component_photos.py` (toplu indir), `tools/gen_photos.py`
(photos.js üret), `tools/fix_photos.py` / `tools/pick_photos.py` (düzeltme).

## 🔧 Devre Simülatörü

**Simülatör** sekmesinde hazır devreler başlangıçtan ileri seviyeye kadar hazır:

- **LED + Direnç**, **Seri/Paralel Direnç**, **Gerilim Bölücü**, **Anahtar + Lamba** (DC)
- **RC Şarj (zaman sabiti)**, **Yarım Dalga Doğrultucu**, **Buck Dönüştürücü** (geçici analiz)

Özellikler:
- 🎞 **Akım animasyonu** — yüksek akımda noktalar hızlanır, yön akışı gösterir
- 🎚 **Canlı değer değiştirme** — direnç/kapasitör/gerilim kaydırıcıları; sonuç anında güncellenir
- 🔌 **Sanal multimetre** — iki düğüme tıkla, aralarındaki gerilimi ve bileşen akımını oku
- 📟 **Sanal osiloskop** — dalga şeklini (RC eğrisi, doğrultulmuş sinüs, PWM) canlı çizer
- 💡 **LED parlaması** — akımla orantılı parlaklık

Çözücü, gerçek **MNA (Modified Nodal Analysis)** tabanlıdır; diyot/LED için Newton
iterasyonu, kondansatör/bobin için geçici (transient) analiz kullanır. `js/sim-core.js`
tarayıcıdan bağımsız çalışır (Node.js ile test edilebilir).

Yeni devre eklemek için `js/sim-core.js` içindeki `CIRCUITS` dizisine parça (parts) ve
geometri (geo = [x1,y1,x2,y2]) tanımlı bir nesne ekle.

## 🤖 AI Hoca (Yerel AI — Ollama)

Ayarlar: sağ üstte **AI Hoca → ⚙️ Ayarlar**.

### Kurulum

1. Ollama kur: https://ollama.com
2. Model indir (önerilen):
   ```
   ollama pull qwen2.5:7b
   ```
   **Not:** Kurulu olmayan bir model seçilirse Ollama **404 / "model not found"** döner.
   Uygulama, ayarlardaki model kurulu değilse **kurulu modellerden uygun olanı otomatik seçer**
   ve üstteki **Model** menüsünden istediğini seçebilirsin.
3. **CORS ayarı (önemli):** Ortam değişkeni ekle ve Ollama'yı yeniden başlat:
   ```
   OLLAMA_ORIGINS=*
   ```
   (Windows: Sistem Özellikleri → Ortam Değişkenleri → yeni kullanıcı değişkeni)
4. `Baslat.bat` ile uygulamayı `http://localhost:8080` üzerinden aç (file:// yerine).

### Hangi model? (Türkçe + elektronik için)

| Model | Ne zaman |
|---|---|
| **qwen2.5:7b** ⭐ | En iyi denge (Türkçe + teknik) — **önerilen** |
| qwen2.5:14b | Daha güçlü (16 GB+ RAM/VRAM) |
| qwen3.6:27b / gemma4:26b | Elinde varsa: güçlü genel modeller (büyük, RAM ister) |
| llama3.1:8b | Genel amaçlı, sağlam |
| aya-expanse:8b | Çok dilli, Türkçesi güçlü |
| llama3.2:3b / ornith:9b | Düşük donanım / hız için |

### Bulut API

Ayarlardan **Özel (OpenAI-uyumlu)** seçip Base URL + API anahtarı + model girebilirsin.
OpenAI, DeepSeek, OpenRouter, LM Studio, vLLM... hepsi çalışır.
Anahtar sadece tarayıcında (localStorage) saklanır.

## Dosya yapısı

```
index.html          Arayüz iskeleti
css/style.css       Tema
js/data-1.js        Temel + Güç + Anahtarlamalı modülleri
js/data-2.js        Arıza + Osiloskop + Multimetre + Tamir + Setler + Sözlük
js/tools.js         8 hesaplayıcı
js/ai.js            AI Hoca (Ollama + API)
js/figures.js       Şekil kütüphanesi (sembol + pinout + blok şemalar, SVG)
js/sim-core.js      Devre çözücü motor (MNA + geçici analiz) + hazır devreler
js/sim-view.js      Simülatör arayüzü (SVG şema, animasyon, multimetre, osiloskop)
js/app.js           Motor: navigasyon, ilerleme, quiz
```




