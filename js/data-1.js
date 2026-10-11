/* =========================================================================
   Elektronik Akademi — Veri Kısım 1
   SET: Temel Elektronik + Güç Elektroniği + Anahtarlamalı Güç (bölüm 1)
   ========================================================================= */

const MODULES_PART1 = [

  /* ===================== m0 — TEMEL KAVRAMLAR ========================= */
  {
    id: "m0", set: "temel", title: "Temel Kavramlar ve Güvenlik", icon: "⚡",
    desc: "Elektriğin doğası, gerilim-akım-direnç, Ohm kanunu ve güvenlik.",
    lessons: [
      {
        id: "m0l1", title: "Elektrik Nedir?", video: "Temel Elektronik • 01",
        content: `
          <p>Elektrik, atomların yapı taşı olan <b>elektronların hareketinden</b> doğar. Atomun çekirdeğinde proton (+) ve nötron vardır; etrafında elektronlar (−) döner.</p>
          <p>Dış yörüngedeki elektronları serbest kalan malzemeler <b>iletken</b> (bakır, gümüş, altın); elektronları sıkı tutanlar <b>yalıtkan</b> (plastik, cam, hava)'dır.</p>
          <h4>Akım</h4>
          <p>Serbest elektronların belirli bir yönde toplu hareketine <b>elektrik akımı</b> denir. Elektronlar enerji taşır; ampulün yanması bu enerjinin ısıya/ışığa dönüşmesidir.</p>
          <div class="callout info"><b>Su benzetmesi:</b> Gerilim = su basıncı, akım = borudan geçen su, direnç = borunun darlığı.</div>
          <h4>AC ve DC</h4>
          <ul>
            <li><b>DC (doğru akım):</b> yön sabit — pil, akü, güç kaynağı.</li>
            <li><b>AC (alternatif akım):</b> yön değişir — şebeke 50 Hz.</li>
          </ul>
          <p>Devre kartları temelde DC ile çalışır; şebeke AC'si kartın güç katında doğrultulur.</p>
        `,
        key: ["Elektrik = elektronların hareketi.", "İletken geçirir, yalıtkan geçirmez.", "AC yön değiştirir, DC sabittir.", "Kartlar DC ile çalışır."],
        quiz: [
          { q: "Elektrik akımı nedir?", o: ["Atom titreşimi", "Serbest elektronların yönlü hareketi", "Manyetik alan", "Isı"], a: 1, e: "Akım serbest elektronların yönlü hareketidir." },
          { q: "Hangisi iyi iletkendir?", o: ["Cam", "Kuru tahta", "Bakır", "Plastik"], a: 2, e: "Bakır mükemmel bir iletkendir." },
          { q: "Şebeke gerilimi nasıl bir akımdır?", o: ["DC", "AC", "Sabit", "Statik"], a: 1, e: "Şebeke alternatif akımdır (50 Hz)." }
        ]
      },
      {
        id: "m0l2", title: "Gerilim, Akım ve Direnç", video: "Temel Elektronik • 02",
        content: `
          <table class="tbl">
            <tr><th>Büyüklük</th><th>Sembol</th><th>Birim</th><th>Anlamı</th></tr>
            <tr><td>Gerilim</td><td>V</td><td>Volt (V)</td><td>Elektronları iten basınç</td></tr>
            <tr><td>Akım</td><td>I</td><td>Amper (A)</td><td>Saniyede geçen yük</td></tr>
            <tr><td>Direnç</td><td>R</td><td>Ohm (Ω)</td><td>Akıma karşı zorluk</td></tr>
          </table>
          <p><b>Gerilim</b> iki nokta arasında ölçülür ve multimetre <b>paralel</b> bağlanır. <b>Akım</b> ise devreye <b>seri</b> bağlanarak ölçülür.</p>
          <div class="callout warn"><b>Kritik:</b> Akım ölçerken multimetreyi seri bağla; paralel bağlarsan kısa devre yapar.</div>
          <p><b>Direnç</b> akımı sınırlar ve enerjiyi ısıya çevirir; elektronikte en çok kullanılan bileşendir.</p>
        `,
        key: ["V=Volt, I=Amper, R=Ohm.", "Gerilim paralel ölçülür.", "Akım seri ölçülür.", "Direnç akımı sınırlar."],
        quiz: [
          { q: "Akımın birimi?", o: ["Volt", "Ohm", "Amper", "Watt"], a: 2, e: "Akım Amper (A) ile ölçülür." },
          { q: "Gerilim nasıl ölçülür?", o: ["Seri", "Paralel", "Toprak", "Bağlanmaz"], a: 1, e: "Gerilim paralel ölçülür." },
          { q: "Direncin birimi?", o: ["Amper", "Volt", "Ohm (Ω)", "Farad"], a: 2, e: "Direnç Ohm (Ω)'dur." }
        ]
      },
      {
        id: "m0l3", title: "Ohm Kanunu ve Güç", video: "Temel Elektronik • 03",
        content: `
          <div class="formula">V = I × R</div>
          <p>Üç kullanım: <b>V=I×R</b>, <b>I=V/R</b>, <b>R=V/I</b>.</p>
          <p><b>Örnek:</b> 12 V, 1 kΩ → I = 0,012 A = 12 mA.</p>
          <h4>Güç</h4>
          <div class="formula">P = V × I = I² × R = V² / R</div>
          <p>Direnç seçerken hem omaj hem <b>güç (W)</b> değerine bakılır. Aşırı güç direnci yakar.</p>
          <div class="callout tip">Araç menüsündeki <b>Ohm Kanunu</b> ve <b>Güç</b> hesaplayıcılarını kullan.</div>
        `,
        key: ["V = I×R.", "P = V×I = I²R = V²/R.", "Direncin gücü de önemli.", "Aşırı güç = yanan bileşen."],
        quiz: [
          { q: "10 V, 500 Ω → akım?", o: ["5 A", "0,5 A", "50 mA", "20 mA"], a: 3, e: "I=10/500=0,02 A=20 mA." },
          { q: "24 V × 0,5 A = ?", o: ["12 W", "48 W", "24 W", "0,5 W"], a: 0, e: "P=24×0,5=12 W." },
          { q: "220 Ω'da 0,1 A → gerilim?", o: ["2,2 V", "22 V", "0,22 V", "220 V"], a: 1, e: "V=0,1×220=22 V." }
        ]
      },
      {
        id: "m0l4", title: "Güvenlik: Elektrik ve ESD", video: "Temel Elektronik • 04",
        content: `
          <h4>⚡ Sana zarar verenler</h4>
          <ul>
            <li><b>220 V AC</b> ve <b>SMPS kondansatörleri:</b> güç kesilse bile 300+ V DC tutar. Ölçmeden önce deşarj et.</li>
            <li>Tek elle çalış, yalıtımlı alet kullan.</li>
          </ul>
          <h4>🧲 Devreye zarar verenler</h4>
          <ul>
            <li><b>ESD (statik):</b> mikrodenetleyicileri öldürür → ESD bileklik.</li>
            <li><b>Ters polarite:</b> çipi yakar.</li>
            <li><b>Kısa devre & yüksek havya sıcaklığı.</b></li>
          </ul>
          <div class="callout warn"><b>Altın kural:</b> Güç kes → deşarj et → ölç/onar.</div>
        `,
        key: ["Kapsitörler güç kesilse bile yüklüdür.", "ESD bileklik çipi korur.", "Ters polarite yakar.", "Güç kes → deşarj → ölç."],
        quiz: [
          { q: "SMPS kondansatörü neden tehlikeli?", o: ["Soğukken patlar", "Güç kesilse bile yüklü kalır", "Akım üretir", "Statik yapar"], a: 1, e: "Kondansatörler yük tutmaya devam eder." },
          { q: "ESD bileklik ne yapar?", o: ["Elleri ısıtır", "Statik yükü boşaltır", "Ölçer", "Lehim eritir"], a: 1, e: "Statik yükü güvenle toprağa verir." },
          { q: "Karta müdahaleden önce?", o: ["Prob değdir", "Güç kes + deşarj", "Havya aç", "Çip sök"], a: 1, e: "Önce gücü kes, deşarj et." }
        ]
      }
    ]
  },

  /* ===================== m1 — TEMEL BİLEŞENLER ======================= */
  {
    id: "m1", set: "temel", title: "Temel Elektronik Bileşenleri", icon: "🔩",
    desc: "Direnç, kondansatör, bobin/filtre, diyot, zener, transformatör, transistör, MOSFET, röle, opamp, lojik/MCU.",
    lessons: [
      {
        id: "m1l1", title: "Dirençler ve Renk Kodu", video: "TV-01",
        content: `
          <p><b>Direnç</b> akımı sınırlar. Değeri <b>renk bantlarıyla</b> okunur.</p>
          <table class="tbl">
            <tr><th>Renk</th><th>Rakam</th><th>Çarpan</th></tr>
            <tr><td>Siyah</td><td>0</td><td>×1</td></tr>
            <tr><td>Kahve</td><td>1</td><td>×10</td></tr>
            <tr><td>Kırmızı</td><td>2</td><td>×100</td></tr>
            <tr><td>Turuncu</td><td>3</td><td>×1k</td></tr>
            <tr><td>Sarı</td><td>4</td><td>×10k</td></tr>
            <tr><td>Yeşil</td><td>5</td><td>×100k</td></tr>
            <tr><td>Mavi</td><td>6</td><td>×1M</td></tr>
            <tr><td>Altın</td><td>—</td><td>×0,1 (±%5)</td></tr>
          </table>
          <p><b>1-2. bant</b> rakam, <b>3. bant</b> çarpan, <b>4. bant</b> tolerans.</p>
          <p><b>Kahve-Siyah-Kırmızı-Altın</b> → 10×100 = <b>1 kΩ ±%5</b>.</p>
          <p>SMD'de rakam: <b>103</b> = 10×10³ = 10 kΩ.</p>
          <div class="callout tip">Araç → <b>Direnç Renk Kodu</b> hesaplayıcı.</div>
        `,
        key: ["4 bant: 2 rakam + çarpan + tolerans.", "1kΩ = kahve-siyah-kırmızı.", "SMD 103 = 10 kΩ."],
        quiz: [
          { q: "Kahve-Siyah-Kırmızı-Altın nedir?", o: ["100 Ω", "1 kΩ", "10 kΩ", "100 kΩ"], a: 1, e: "10×100=1000 Ω." },
          { q: "'472' SMD direnç?", o: ["472 Ω", "4,7 kΩ", "47 kΩ", "472 kΩ"], a: 1, e: "47×10²=4700 Ω." }
        ]
      },
      {
        id: "m1l2", title: "Kondansatörler", video: "TV-02",
        content: `
          <p><b>Kondansatör</b> yük depolar. Birim <b>Farad (F)</b>; pratikte µF, nF, pF.</p>
          <ul>
            <li><b>Kutupsuz</b> (seramik/film): yön önemsiz, küçük değer.</li>
            <li><b>Kutuplu</b> (elektrolitik/tantal): + / − var, büyük değer, filtre.</li>
          </ul>
          <div class="callout warn">Elektrolitik ters bağlanırsa <b>şişer, patlar</b>. Uzun bacak (+), gövde şeridi (−).</div>
          <h4>Görevleri</h4>
          <ul><li>Filtreleme (dalgalanma),</li><li>Kuplaj (AC geçir, DC blokla),</li><li>Zamanlama (RC),</li><li>Decoupling (çip besleme gürültüsü).</li></ul>
        `,
        key: ["Birim F; pratikte µ/n/pF.", "Elektrolitik kutuplu.", "Filtre/kuplaj/zamanlama/decoupling."],
        quiz: [
          { q: "1 µF kaç nF?", o: ["10", "100", "1000", "10000"], a: 2, e: "1 µF = 1000 nF." },
          { q: "Çip yanındaki küçük kondansatör görevi?", o: ["Zamanlama", "Decoupling", "Güç", "Sınırlama"], a: 1, e: "Decoupling gürültüyü emer." }
        ]
      },
      {
        id: "m1l3", title: "Bobinler ve Filtreler", video: "TV-03",
        content: `
          <p><b>Bobin</b> manyetik alanda enerji depolar. Birim <b>Henry (H)</b>; µH, mH yaygın.</p>
          <ul>
            <li>Akımın <b>değişimine</b> direnir (akım ani değişemez).</li>
            <li>DC geçirir, yüksek frekansı zor geçirir.</li>
            <li>Akım kesilince ters gerilim (back-EMF) üretir → flyback diyot.</li>
          </ul>
          <h4>Filtreler</h4>
          <p>Bobin + kondansatör (LC) gürültü ve dalgalanmayı süzer. EMI filtreleri giriş katında bulunur.</p>
          <div class="callout info"><b>Trafo:</b> AC'yi manyetik kuplajla yükseltir/düşürür. DC trafoya uygulanırsa bobin yanar.</div>
        `,
        key: ["Bobin enerjiyi manyetik alanda depolar.", "Akım ani değişemez, ters gerilim üretir.", "LC filtre gürültüyü süzer."],
        quiz: [
          { q: "Bobinin birimi?", o: ["Farad", "Henry (H)", "Ohm", "Tesla"], a: 1, e: "İndüktans Henry ile ölçülür." },
          { q: "Röle bobini neden diyotla korunur?", o: ["Akım artırmak", "Ters gerilimi sönümlemek", "Gerilim bölmek", "Filtre"], a: 1, e: "Flyback diyot ters gerilimi sönümler." }
        ]
      },
      {
        id: "m1l4", title: "Diyotlar ve Doğrultma", video: "TV-04",
        content: `
          <p><b>Diyot</b> akımı tek yönde geçirir. Anot (+) / katot (−); sembolde <b>çizgi = katot</b>.</p>
          <h4>Kullanımlar</h4>
          <ul>
            <li><b>Doğrultma:</b> AC → DC (yarım dalga / tam dalga / köprü).</li>
            <li><b>Ters polarite koruması.</b></li>
            <li><b>Flyback</b> (bobin/röle).</li>
            <li><b>Schottky:</b> düşük Vf (~0,3 V), SMPS'te tercih.</li>
          </ul>
          <h4>Parametreler</h4>
          <ul><li>Vf: Si ~0,7 V, Schottky ~0,3 V.</li><li>Vr: ters dayanım.</li><li>If: sürekli akım.</li></ul>
          <h4>Köprü doğrultucu</h4>
          <p>4 diyot; her iki yarım dalgayı kullanır. Çıkışa bulk kondansatör konur (ripple azaltma).</p>
          <div class="callout tip"><b>Test:</b> Diyot modunda ileri ~0,5–0,7 V = sağlam; iki yön 0 = kısa.</div>
        `,
        key: ["Diyot tek yön iletir; çizgi = katot.", "Doğrultma/ters polarite/flyback.", "Si 0,7 V, Schottky 0,3 V.", "Köprü = 4 diyot."],
        quiz: [
          { q: "Si diyot ileri düşümü?", o: ["0,1 V", "0,3 V", "0,7 V", "5 V"], a: 2, e: "Silisyum ~0,7 V." },
          { q: "Köprüde kaç diyot?", o: ["1", "2", "3", "4"], a: 3, e: "Köprü doğrultucu 4 diyottur." }
        ]
      },
      {
        id: "m1l5", title: "Zener Diyot ve Gerilim Referansı", video: "TV-05",
        content: `
          <p><b>Zener diyot</b>, ters yönde belirli bir gerilimde iletime geçer ve o gerilimi <b>sabit tutar</b>. Gerilim referansı ve koruma için kullanılır.</p>
          <ul>
            <li><b>Vz:</b> zener gerilimi (örn. 5,1 V, 12 V).</li>
            <li>Ters polaritede (katodu +'ya) bağlanır.</li>
            <li>Seri direnç ile akımı sınırlanır.</li>
          </ul>
          <h4>Kullanım alanları</h4>
          <ul>
            <li>Basit gerilim regülasyonu (küçük yük).</li>
            <li>Clamp / aşırı gerilim koruması.</li>
            <li>Op-amp referans, karşılaştırıcı eşiği.</li>
            <li><b>TVS diyot:</b> yıldırım/darbe koruması (zenere benzer).</li>
          </ul>
          <div class="callout info"><b>Teşhis:</b> Zener de normal diyot gibi test edilir; ileri yönde ~0,7 V, ters yönde ölçüm aleti gerilimine göre yüksek direnç gösterir (kısa değilse sağlam olabilir).</div>
        `,
        key: ["Zener ters yönde sabit gerilim tutar.", "Vz = zener gerilimi.", "Seri direnç şart.", "Koruma/referans için."],
        quiz: [
          { q: "Zener diyot ne yapar?", o: ["Akım üretir", "Ters yönde gerilimi sabitler", "Frekansı ayarlar", "Isı üretir"], a: 1, e: "Zener ters yönde Vz'de sabitler." },
          { q: "Zener nasıl bağlanır?", o: ["İleri", "Ters (katot +'ya)", "Paralel GND", "Farketmez"], a: 1, e: "Zener regülasyon için ters bağlanır." }
        ]
      },
      {
        id: "m1l6", title: "Transformatörler", video: "TV-06",
        content: `
          <p><b>Transformatör</b> iki (veya daha fazla) sargıyı ortak bir manyetik çekirdek üzerinde birleştirir. AC gerilimi dönüştürür ve <b>galvanik izolasyon</b> sağlar.</p>
          <div class="formula">V1 / V2 = N1 / N2</div>
          <p>Akımlar ters orantılı: I1×V1 ≈ I2×V2 (ideal).</p>
          <h4>Tipler</h4>
          <ul>
            <li><b>Şebeke (50 Hz):</b> büyük, ağır çekirdek.</li>
            <li><b>Yüksek frekans (SMPS):</b> ferrit çekirdek, küçük/hafif.</li>
            <li><b>Akım trafosu, pulse trafo, gate drive trafo.</b></li>
          </ul>
          <div class="callout warn"><b>Kritik:</b> Trafo <b>sadece AC</b> ile çalışır; DC uygulanırsa sargı yanar (tetiklenen akım). İzolasyon bozulursa güvenlik tehlikesi.</div>
          <div class="callout tip"><b>Teşhis:</b> Sargılar süreklilik modu; kopuk sargı = açık devre. Primer-sekonder arası (ve çekirdeğe karşı) izolasyon megohmmeter ile test edilir.</div>
        `,
        key: ["V1/V2 = N1/N2.", "İzolasyon sağlar.", "Sadece AC ile çalışır.", "Sargıları süreklilikle test et."],
        quiz: [
          { q: "Trafo gerilimi neye göre dönüştürür?", o: ["Kablo", "Sarım oranı", "Renk", "Sıcaklık"], a: 1, e: "V1/V2 = N1/N2." },
          { q: "Trafo DC ile çalışır mı?", o: ["Evet", "Hayır, sargı yanar", "Bazen", "Farketmez"], a: 1, e: "DC trafoda aşırı akım yapar." }
        ]
      },
      {
        id: "m1l7", title: "Transistörler (BJT)", video: "TV-07",
        content: `
          <p><b>BJT</b> (NPN/PNP), <b>akımla</b> kontrol edilen bir yükselteç/anahtardır.</p>
          <ul>
            <li>Uçlar: <b>B</b>ase (B), <b>C</b>ollector (C), <b>E</b>mitter (E).</li>
            <li>Küçük I<sub>B</sub>, büyük I<sub>C</sub>'yi kontrol eder: I<sub>C</sub> ≈ β·I<sub>B</sub> (β~100).</li>
            <li>Anahtar modu: <b>doyum</b> (iletim) veya <b>kesim</b> (kapalı).</li>
          </ul>
          <h4>Kullanım</h4>
          <ul>
            <li>Röle/LED/motor sürme (anahtar).</li>
            <li>Küçük sinyal yükseltme.</li>
            <li>Baz direnci ile akım sınırlama şart.</li>
          </ul>
          <h4>Teşhis (multimetre diyot modu)</h4>
          <ul>
            <li>NPN: B→E ve B→C ileri ~0,7 V; tersleri açık.</li>
            <li>C-E arası kısa ise bozuk.</li>
          </ul>
        `,
        key: ["BJT akımla kontrol edilir.", "B, C, E uçları.", "Baz direnci şart.", "B-E / B-C diyot gibi test edilir."],
        quiz: [
          { q: "BJT hangi büyüklükle kontrol edilir?", o: ["Gerilim", "Baz akımı", "Frekans", "Isı"], a: 1, e: "BJT baz akımıyla kontrol edilir." },
          { q: "NPN transistör sağlamlık testi?", o: ["C-E 0 Ω", "B-E ~0,7 V, B-C ~0,7 V", "İki uçta 5 V", "Farketmez"], a: 1, e: "Baz-kolektör/emiter diyot gibi ölçülür." }
        ]
      },
      {
        id: "m1l8", title: "MOSFET'ler", video: "TV-08",
        content: `
          <p><b>MOSFET</b>, <b>gerilimle</b> kontrol edilen, düşük kayıplı bir anahtardır. Güç elektroniğinin ana bileşenidir.</p>
          <ul>
            <li>Uçlar: <b>G</b>ate (G), <b>D</b>rain (D), <b>S</b>ource (S).</li>
            <li>V<sub>GS</sub> eşiği aşınca D-S iletir.</li>
            <li><b>R<sub>DS(on)</sub>:</b> iletim direnci (küçük iyi).</li>
            <li>Yüksek frekans, yüksek verim.</li>
          </ul>
          <h4>N-kanal / P-kanal</h4>
          <p>N-kanal: gate gerilimi source'a göre + olunca iletir. Yüksek taraf (high-side) sürmede <b>gate driver / bootstrap</b> gerekir.</p>
          <div class="callout warn"><b>Sık arıza:</b> Güç MOSFET'i genelde <b>D-S kısa devre</b> modunda bozulur. Ölçerken enerjisiz test et.</div>
        `,
        key: ["MOSFET gerilimle kontrol edilir.", "G, D, S uçları.", "R_DS(on) iletim direncidir.", "Arıza çoğu kez D-S kısa."],
        quiz: [
          { q: "MOSFET uçları?", o: ["B,C,E", "G,D,S", "A,K", "Giriş,Çıkış"], a: 1, e: "Gate, Drain, Source." },
          { q: "R_DS(on) ne ifade eder?", o: ["Ters dayanım", "İletim direnci", "Gate kapasitesi", "Hız"], a: 1, e: "İletimdeki dirençtir." }
        ]
      },
      {
        id: "m1l9", title: "Röleler ve Anahtarlama", video: "TV-09",
        content: `
          <p><b>Röle</b>, küçük bir sinyalle (bobin) büyük bir yükü (kontak) anahtarlayan elektromekanik elemandır ve izolasyon sağlar.</p>
          <ul>
            <li><b>Bobin:</b> küçük akımla çeker.</li>
            <li><b>Kontak:</b> NO (normal açık) / NC (normal kapalı) / COM.</li>
            <li>Bobin paralelinde <b>flyback diyot</b> olmalı.</li>
          </ul>
          <h4>Röle sürme</h4>
          <p>MCU pini doğrudan bobini süremez (akım yetersiz). Bir <b>transistör/MOSFET</b> ile sürülür; bobin diyotla korunur.</p>
          <div class="callout tip"><b>SSR:</b> Katı hal rölesi (Solid State Relay) yarı iletkenli, sessiz ve hızlıdır; mekanik kontağı yoktur.</div>
        `,
        key: ["Röle küçük sinyalle büyük yükü sürer + izolasyon.", "NO/NC/COM kontak.", "Bobine flyback diyot şart.", "MCU röleyi transistörle sürer."],
        quiz: [
          { q: "Röle bobin paralelinde ne olmalı?", o: ["Kondansatör", "Flyback diyot", "Direnç", "Hiçbiri"], a: 1, e: "Ters gerilim için diyot." },
          { q: "MCU röleyi nasıl sürer?", o: ["Doğrudan pin", "Transistörle", "Kondansatörle", "Farketmez"], a: 1, e: "Transistör/MOSFET ile sürülür." }
        ]
      },
      {
        id: "m1l10", title: "Op-Amp ve Karşılaştırıcılar", video: "TV-10",
        content: `
          <p><b>Op-amp</b> yüksek kazançlı diferansiyel yükselteçtir; çevresel dirençlerle görevi belirlenir.</p>
          <h4>İki kural (geri beslemeli)</h4>
          <ol><li>Girişler ≈ eşit (sanal kısa devre).</li><li>Girişlere akım akmaz.</li></ol>
          <h4>Yapılar</h4>
          <ul>
            <li>Gerilim izleyici (tampon).</li>
            <li>Ters çeviren yükselteç: <b>−Rf/Rin</b>.</li>
            <li><b>Karşılaştırıcı:</b> iki gerilimi kıyaslar, çıkışı raya sürer.</li>
          </ul>
          <div class="callout info"><b>Teşhis:</b> Geri beslemeli op-amp'te giriş gerilimleri eşit olmalı. Değilse besleme, direnç veya çip arızalıdır.</div>
        `,
        key: ["Geri beslemede girişler ≈ eşit.", "Kazanç dirençlerle ayarlanır.", "Karşılaştırıcı iki gerilimi kıyaslar."],
        quiz: [
          { q: "İdeal op-amp girişleri arası gerilim?", o: ["Sonsuz", "≈0", "5 V", "Vcc"], a: 1, e: "Sanal kısa devre." },
          { q: "Ters çeviren yükselteç kazancı?", o: ["Rin/Rf", "−Rf/Rin", "Rf+Rin", "1"], a: 1, e: "−Rf/Rin." }
        ]
      },
      {
        id: "m1l11", title: "Lojik Kapılar, PWM ve MCU Mantığı", video: "TV-11",
        content: `
          <p>Dijital dünyada iki seviye vardır: <b>0</b> ve <b>1</b>.</p>
          <table class="tbl">
            <tr><th>Kapı</th><th>Çıkış 1 ise…</th></tr>
            <tr><td>AND</td><td>Tüm girişler 1</td></tr>
            <tr><td>OR</td><td>En az bir giriş 1</td></tr>
            <tr><td>NOT</td><td>Girişin tersi</td></tr>
            <tr><td>NAND</td><td>AND'in tersi (evrensel)</td></tr>
            <tr><td>XOR</td><td>Girişler farklı</td></tr>
          </table>
          <h4>PWM</h4>
          <p>Pini hızlı aç/kapa yaparak "analog hissi" verir. <b>Duty-cycle</b> ortalamayı belirler (%0 kapalı, %100 açık). LED parlaklık, motor hızı, SMPS kontrolü.</p>
          <h4>MCU mantığı ve Feedback</h4>
          <p>MCU; <b>GPIO</b> ile giriş okur/çıkış sürer, <b>ADC</b> ile analog ölçer, <b>PWM</b> ile sürer. <b>Feedback (geri besleme):</b> çıkışı ölçüp girişe göre düzeltme — SMPS ve kontrol sistemlerinin temeli.</p>
          <div class="callout info"><b>Neden önemli?</b> SMPS'in çıkışı sabit tutması feedback (geri besleme) döngüsü sayesindedir. Feedback koparsa çıkış ya sıfırlanır ya tavan yapar.</div>
        `,
        key: ["AND/OR/NOT/NAND/XOR temel kapılar.", "PWM duty-cycle ile ortalama verir.", "MCU: GPIO + ADC + PWM.", "Feedback çıkışı sabit tutar."],
        quiz: [
          { q: "Hangi kapı sadece tüm girişler 1 iken 1?", o: ["OR", "AND", "XOR", "NOT"], a: 1, e: "AND." },
          { q: "PWM'de parlaklığı ne belirler?", o: ["Frekans", "Duty-cycle", "Gerilim", "Direnç"], a: 1, e: "Duty-cycle ortalamayı belirler." },
          { q: "SMPS çıkışını sabit tutan nedir?", o: ["Bobin", "Feedback döngüsü", "Diyot", "Fitil"], a: 1, e: "Geri besleme döngüsü." }
        ]
      }
    ]
  },

  /* ===================== m2 — DEVRE ANALİZİ ========================== */
  {
    id: "m2", set: "temel", title: "Devre Analizi", icon: "📐",
    desc: "Seri/paralel, Kirchhoff, gerilim bölücü, RC/RL ve zaman sabiti.",
    lessons: [
      {
        id: "m2l1", title: "Seri ve Paralel Bağlama", video: "Temel • Analiz-1",
        content: `
          <h4>Seri</h4>
          <p>Akım aynı, gerilimler toplanır: <b>R = R1 + R2 + …</b></p>
          <h4>Paralel</h4>
          <p>Gerilim aynı, akımlar toplanır: <b>1/R = 1/R1 + 1/R2 + …</b></p>
          <p>İki direnç: <b>R = (R1×R2)/(R1+R2)</b>.</p>
          <p><b>Örnek:</b> 100∥100 = 50 Ω.</p>
          <div class="callout info">Kartta yanan bir direncin değerini, paralel/seri komşularından tahmin edebilirsin.</div>
        `,
        key: ["Seri: akım aynı, direnç toplanır.", "Paralel: gerilim aynı, ters direnç toplanır.", "İki paralel: (R1R2)/(R1+R2)."],
        quiz: [
          { q: "1k + 1k seri = ?", o: ["500 Ω", "1 kΩ", "2 kΩ", "1 MΩ"], a: 2, e: "2 kΩ." },
          { q: "100∥100 = ?", o: ["200", "100", "50", "25"], a: 2, e: "50 Ω." }
        ]
      },
      {
        id: "m2l2", title: "Kirchhoff ve Teoremler", video: "Temel • Analiz-2",
        content: `
          <h4>KCL (akım)</h4>
          <p>Düğüme giren akım = çıkan akım (ΣI=0).</p>
          <h4>KVL (gerilim)</h4>
          <p>Kapalı çevrimde ΣV = 0.</p>
          <h4>Süperpozisyon</h4>
          <p>Çok kaynaklı lineer devrede her kaynağı tek tek ele alıp topla.</p>
          <h4>Thevenin / Norton</h4>
          <p>Karmaşık alt devreyi eşdeğer kaynak + direnç ile göster.</p>
          <div class="callout info">Ölçümle teorinin uyuşmadığı yer = arıza şüphesi.</div>
        `,
        key: ["KCL: giren = çıkan.", "KVL: çevrimde ΣV=0.", "Thevenin/Norton eşdeğerleme."],
        quiz: [
          { q: "KCL ne der?", o: ["Gerilim toplanır", "Giren akım = çıkan", "Direnç sabit", "Güç korunur"], a: 1, e: "Düğümde ΣI=0." },
          { q: "Kapalı çevrimde ΣV=0 hangi kanun?", o: ["Ohm", "KVL", "KCL", "Watt"], a: 1, e: "KVL." }
        ]
      },
      {
        id: "m2l3", title: "Gerilim Bölücü", video: "Temel • Analiz-3",
        content: `
          <div class="formula">Vout = Vin × R2 / (R1 + R2)</div>
          <p>R2, GND'ye bağlı alt dirençtir; Vout onun üzerindedir.</p>
          <p><b>Örnek:</b> 12 V, R1=10k, R2=4,7k → 3,84 V.</p>
          <h4>Kullanım</h4>
          <ul><li>Sensör gerilimini ADC aralığına indirme.</li><li>Baz/gate öngerilimi.</li><li>Feedback bölücü (SMPS çıkış ayarı!).</li></ul>
          <div class="callout warn">Akım çeken yüke gerilim bölücüyle besleme yapma; yük gerilimi düşürür. Regülatör kullan.</div>
        `,
        key: ["Vout = Vin × R2/(R1+R2).", "R2 alttaki direnç.", "SMPS feedback bölücüsü."],
        quiz: [
          { q: "R1=R2=1k, Vin=10 V → Vout?", o: ["10", "5", "2,5", "0"], a: 1, e: "5 V." },
          { q: "Feedback bölücü nerede?", o: ["SMPS çıkış ayarı", "LED", "Röle", "Trafo"], a: 0, e: "SMPS geri beslemesinde." }
        ]
      },
      {
        id: "m2l4", title: "RC / RL ve Zaman Sabiti", video: "Temel • Analiz-4",
        content: `
          <div class="formula">τ = R × C</div>
          <p>1τ=%63, 3τ=%95, 5τ≈%100 dolu.</p>
          <p><b>Örnek:</b> 10k × 100µF = 1 s.</p>
          <p>Güç kesilince kondansatör direnç üzerinden boşalır (LED bir süre yanar).</p>
          <p><b>RL:</b> τ = L/R.</p>
          <div class="callout info">Her sayısal girişte gecikme/bounce bastırma RC ile yapılır.</div>
        `,
        key: ["τ = R×C.", "5τ ≈ tam şarj.", "RL: τ = L/R.", "Gecikme/bounce bastırma."],
        quiz: [
          { q: "1k × 1µF → τ?", o: ["1 ms", "10 ms", "1 s", "0,1 s"], a: 0, e: "1 ms." },
          { q: "1τ sonunda % kaç dolu?", o: ["37", "50", "63", "95"], a: 2, e: "%63." }
        ]
      }
    ]
  },

  /* ===================== m3 — GÜÇ ELEKTRONİĞİ ======================== */
  {
    id: "m3", set: "guc", title: "Güç Elektroniği: Besleme Yöntemleri", icon: "🔌",
    desc: "Direnç/trafo/regülatör ile besleme, SMPS mantığı, HV power, topolojiler, HS/LS MOSFET.",
    lessons: [
      {
        id: "m3l1", title: "Direnç ile Besleme ve Doğrultma", video: "Güç • 01",
        content: `
          <p>En basit gerilim düşürme yöntemi: <b>seri direnç</b> veya <b>zener</b>. Ama verimsizdir ve ısı üretir.</p>
          <ul>
            <li>Seri direnç: sabit akım çeken küçük yüklerde.</li>
            <li>Zener + direnç: kaba regülasyon.</li>
            <li>Sorun: yük değişince gerilim oynar, ısı yüksek.</li>
          </ul>
          <h4>Doğrultma zinciri</h4>
          <ol>
            <li>Sigorta + EMI filtre.</li>
            <li>Köprü doğrultucu → titreşimli DC.</li>
            <li>Bulk kondansatör → ~325 V DC (220 V AC).</li>
            <li>Düşürme (trafo/anahtarlama).</li>
          </ol>
          <div class="callout warn">Bu katın kondansatörleri 300+ V tutar; ölçmeden önce deşarj et.</div>
        `,
        key: ["Seri direnç/zener: basit ama verimsiz.", "Doğrultma: sigorta→köprü→bulk.", "Bulk çıkışı ~325 V DC.", "Yüksek gerilim — deşarj et."],
        quiz: [
          { q: "220 V AC doğrultulup filtre edilince?", o: ["220", "280", "325", "400 V DC"], a: 2, e: "~325 V DC." },
          { q: "Direnç ile beslemenin sorunu?", o: ["Pahalı", "Verimsiz/ısınır", "Yavaş", "Gürültülü"], a: 1, e: "Fazla gerilimi ısıya çevirir." }
        ]
      },
      {
        id: "m3l2", title: "Transformatör ile Besleme", video: "Güç • 02",
        content: `
          <p>Klasik lineer besleme: <b>şebeke trafosu → doğrultma → filtre → regülatör</b>.</p>
          <ul>
            <li>Trafo gerilimi düşürür + izolasyon sağlar.</li>
            <li>Köprü + bulk kondansatör DC üretir.</li>
            <li>Lineer regülatör sabitler.</li>
          </ul>
          <h4>Avantaj / Dezavantaj</h4>
          <ul>
            <li><b>+</b> Düşük gürültü, basit, dayanıklı.</li>
            <li><b>−</b> Büyük/ağır trafo, düşük verim, ısı.</li>
          </ul>
          <div class="callout info">SMPS'e göre hacim ve verim dezavantajı vardır ama gürültü açısından hâlâ çok temizdir.</div>
        `,
        key: ["Lineer besleme: trafo→doğrultma→regülatör.", "Trafo izolasyon + düşürme.", "Temiz ama hacimli/verimsiz."],
        quiz: [
          { q: "Lineer beslemede trafo ne yapar?", o: ["Doğrultur", "Düşürür+izole", "Filtreler", "Regüle"], a: 1, e: "Düşürür ve izolasyon sağlar." },
          { q: "Lineer beslemenin dezavantajı?", o: ["Gürültü", "Hacim/verim", "Dayanıksız", "Pahalı"], a: 1, e: "Büyük trafo, düşük verim." }
        ]
      },
      {
        id: "m3l3", title: "Voltaj Regülatörü ile Besleme", video: "Güç • 03",
        content: `
          <p><b>Lineer regülatör</b> fazla gerilimi ısıya atarak sabit çıkış verir.</p>
          <ul>
            <li><b>78xx</b> (7805=5 V, 7812=12 V), <b>79xx</b> (negatif).</li>
            <li><b>LM317</b> (ayarlanabilir), <b>LDO</b> (düşük drop-out).</li>
          </ul>
          <div class="formula">P<sub>ısı</sub> = (Vin − Vout) × I</div>
          <p><b>Örnek:</b> 12→5 V, 0,5 A → 3,5 W ısı → soğutucu.</p>
          <div class="callout info">Girişe ve çıkışa yakın kondansatör koy; eksikse regülatör salınır.</div>
          <p>Verim ≈ Vout/Vin; yüksek akımda SMPS tercih edilir.</p>
        `,
        key: ["Lineer regülatör fazlayı ısıya çevirir.", "P_ısı = (Vin−Vout)×I.", "78xx/79xx/LM317/LDO.", "Yüksek akımda SMPS."],
        quiz: [
          { q: "12→5 V, 0,5 A lineer ısısı?", o: ["2,5 W", "3,5 W", "6 W", "0,5 W"], a: 1, e: "3,5 W." },
          { q: "7805 çıkışı?", o: ["3,3 V", "5 V", "9 V", "12 V"], a: 1, e: "+5 V." }
        ]
      },
      {
        id: "m3l4", title: "SMPS Çalışma Mantığı", video: "Güç • 04",
        content: `
          <p><b>SMPS</b> gerilimi yüksek frekansta (tens–yüzlerce kHz) anahtarlayarak verimli dönüşüm yapar (%85–95).</p>
          <h4>Temel bloklar</h4>
          <ul>
            <li><b>Giriş + EMI filtre + PFC.</b></li>
            <li><b>Anahtarlama MOSFET'i + PWM kontrol IC.</b></li>
            <li><b>Trafo (izolasyonlu) veya bobin (izolasyonsuz).</b></li>
            <li><b>Çıkış doğrultma (Schottky/senkron) + filtre.</b></li>
            <li><b>Feedback (optokuplör/gerilim bölücü).</b></li>
          </ul>
          <p>Buck için <b>Vout ≈ Vin × D</b>; D duty-cycle.</p>
          <div class="callout warn">SMPS arızasında önce: anahtarlama MOSFET'i, çıkış diyodu, feedback bölücüsü ve PWM IC beslemesi kontrol edilir.</div>
        `,
        key: ["SMPS yüksek frekansta anahtarlar; yüksek verim.", "Bloklar: EMI/PFC, switch, trafo/bobin, çıkış, feedback.", "Vout≈Vin×D (buck).", "Arızada switch+feedback+çıkış diyodu."],
        quiz: [
          { q: "SMPS neden verimli?", o: ["Az ısı", "Yüksek frekansta anahtarlama", "Büyük trafo", "Direnç"], a: 1, e: "Anahtarlamalı çalışır." },
          { q: "Buck için Vout?", o: ["Vin×D", "Vin/D", "Vin+D", "Vin−D"], a: 0, e: "Vout≈Vin×D." }
        ]
      },
      {
        id: "m3l5", title: "HV Power ve Power Converter Topolojileri", video: "Güç • 05",
        content: `
          <h4>HV (yüksek gerilim) power</h4>
          <p>TV/monitör, inverter, welding gibi cihazlarda yüzlerce–binlerce volt üretilir. İzolasyon, krepaj mesafesi, X/Y kondansatörleri ve deşarj güvenliği kritiktir.</p>
          <h4>$Topoloji$ seçimi</h4>
          <table class="tbl">
            <tr><th>Topoloji</th><th>Özellik</th><th>Güç aralığı</th></tr>
            <tr><td>Buck/Boost</td><td>İzolasyonsuz</td><td>Düşük-orta</td></tr>
            <tr><td>Flyback</td><td>İzolasyonlu, basit</td><td>&lt;150 W</td></tr>
            <tr><td>Forward</td><td>İzolasyonlu</td><td>orta</td></tr>
            <tr><td>Half-Bridge</td><td>İzolasyonlu</td><td>orta-yüksek</td></tr>
            <tr><td>Full-Bridge</td><td>İzolasyonlu</td><td>yüksek</td></tr>
            <tr><td>Push-Pull</td><td>İzolasyonlu</td><td>orta-yüksek</td></tr>
          </table>
          <div class="callout info">Topoloji; güç, gerilim oranı, izolasyon ve maliyete göre seçilir.</div>
        `,
        key: ["HV'de izolasyon ve mesafe kritik.", "Flyback düşük güç izolasyonlu.", "Half/Full-Bridge yüksek güç.", "Topoloji güç+izolasyona göre seçilir."],
        quiz: [
          { q: "İzolasyonlu, düşük güçlü tipik topoloji?", o: ["Buck", "Flyback", "Boost", "LDO"], a: 1, e: "Flyback." },
          { q: "HV devrelerde kritik olan?", o: ["Renk", "İzolasyon/krepaj mesafesi", "Ağırlık", "Marka"], a: 1, e: "İzolasyon ve mesafe." }
        ]
      },
      {
        id: "m3l6", title: "HS/LS MOSFET Topolojileri", video: "Güç • 06",
        content: `
          <p>Yüksek taraf (high-side) ve alçak taraf (low-side) MOSFET sürme, köprü devrelerinin temelidir.</p>
          <ul>
            <li><b>Low-side:</b> MOSFET yükün altında, source GND'ye bağlı. Sürme kolay.</li>
            <li><b>High-side:</b> MOSFET yükün üstünde, source yüzen (floating). Sürme için <b>gate driver + bootstrap</b> gerekir.</li>
          </ul>
          <h4>Neden gate driver?</h4>
          <ul>
            <li>Gate kapasitesini hızlı şarj/deşarj etmek (anahtarlama hızı).</li>
            <li>High-side için source'un üstüne gerilim üretmek (bootstrap kondansatör).</li>
            <li>Kısa devre/kısa devre anında koruma.</li>
          </ul>
          <div class="callout warn"><b>Dead-time:</b> Half/Full-bridge'de HS ve LS MOSF'lar aynı anda iletime geçerse <b>shoot-through</b> kısa devresi olur ve yanarlar. Bu yüzden ölü zaman (dead-time) konur.</div>
        `,
        key: ["Low-side sürme kolay, high-side bootstrap ister.", "Gate driver anahtarlamayı hızlandırır.", "Shoot-through = HS+LS aynı anda → yanar.", "Dead-time koruma."],
        quiz: [
          { q: "High-side MOSFET sürmek için ne gerekir?", o: ["Kondansatör", "Gate driver+bootstrap", "Diode", "Röle"], a: 1, e: "Yüzen source için bootstrap gerekir." },
          { q: "Shoot-through nedir?", o: ["Aşırı yük", "HS+LS aynı anda iletim (kısa devre)", "Aşırı gerilim", "Feedback"], a: 1, e: "İki anahtarın çakışması." }
        ]
      },
      {
        id: "m3l7", title: "Uygulamalı Güç Elektroniği", video: "Güç • Uygulama 1-2-3",
        content: `
          <p>Teoriyi sahaya indir: gerçek devrelerde ölçüm ve doğrulama.</p>
          <h4>Uygulama akışı</h4>
          <ol>
            <li>Şemayı okuyup besleme yolunu çıkar.</li>
            <li>Akım sınırlı güç kaynağıyla besle.</li>
            <li>Doğrultucu çıkışını, regülatör çıkışını ölç.</li>
            <li>Osiloskopla anahtarlama dalgasını izle.</li>
            <li>Yük altında verim ve ısınmayı kontrol et.</li>
          </ol>
          <div class="callout tip"><b>Her zaman:</b> önce gerilim — sonra akım — sonra osiloskop. Ölçüm sırası karıştırılırsa hem zaman kaybedilir hem kart zarar görür.</div>
        `,
        key: ["Şema → besleme yolu.", "Akım sınırlı kaynak şart.", "Gerilim→akım→osiloskop sırası.", "Yük altında doğrula."],
        quiz: [
          { q: "Ölçüm sırası hangisi doğru?", o: ["Akım→gerilim→osiloskop", "Gerilim→akım→osiloskop", "Osiloskop→akım→gerilim", "Farketmez"], a: 1, e: "Gerilim, akım, sonra dalga." },
          { q: "Kart beslenirken ne kullanılır?", o: ["USB", "Akım sınırlı güç kaynağı", "Pil", "Adaptör"], a: 1, e: "Akım sınırlı kaynak." }
        ]
      }
    ]
  },

  /* ===================== m4 — ANAHTARLAMALI DÖNÜŞTÜRÜCÜLER =========== */
  {
    id: "m4", set: "anahtarlamali", title: "Anahtarlamalı Dönüştürücüler", icon: "🔄",
    desc: "AC'de bobin/davranış, skin effect, frekans/duty cycle, EMI filtre, buck/boost, PFC, akım limitleme, optokuplör.",
    lessons: [
      {
        id: "m4l1", title: "Bobin ve Kondansatörün Dinamik Davranışı", video: "Anahtarlamalı • 01",
        content: `
          <h4>Bobin (indüktör)</h4>
          <p>Akımı ani değiştirmek istemez. Akımı kesince ters gerilim üretir (v = −L·di/dt). Bu yüzden <b>flyback diyot</b> ve <b>snubber</b> gerekir.</p>
          <h4>Kondansatör</h4>
          <p>Gerilimi ani değiştirmek istemez (i = C·dv/dt). Ani yüklenmelerde gerilimi tutar.</p>
          <h4>AC'de davranış</h4>
          <ul>
            <li>Bobin AC'yi frekansa göre zorlaştırır: <b>X<sub>L</sub> = 2πfL</b>.</li>
            <li>Kondansatör AC'yi kolayca geçirir: <b>X<sub>C</sub> = 1/(2πfC)</b>.</li>
          </ul>
          <div class="callout info">Bu iki zıt davranış, LC filtre ve SMPS'in temelidir.</div>
        `,
        key: ["Bobin akımı ani değiştirmez, ters gerilim üretir.", "Kondansatör gerilimi ani değiştirmez.", "X_L=2πfL, X_C=1/(2πfC)."],
        quiz: [
          { q: "Bobin akımı kesildiğinde ne üretir?", o: ["Isı", "Ters gerilim", "Statik", "Işık"], a: 1, e: "Back-EMF." },
          { q: "X_C hangi ifade?", o: ["2πfL", "1/(2πfC)", "fC", "RC"], a: 1, e: "1/(2πfC)." }
        ]
      },
      {
        id: "m4l2", title: "Skin Effect, Frekans ve Duty Cycle", video: "Anahtarlamalı • 02",
        content: `
          <h4>Skin effect</h4>
          <p>Yüksek frekansta akım iletkenin <b>yüzeyinden</b> akmaya başlar; etkin kesit azalır, direnç artar. Bu yüzden yüksek frekanslı SMPS'te <b>Litz teli</b> ve geniş bakır alanı kullanılır.</p>
          <h4>Frekans</h4>
          <p>Daha yüksek frekans → daha küçük trafo ve kondansatör, ama anahtarlama kayıpları (switching loss) ve EMI artar.</p>
          <h4>Duty cycle (D)</h4>
          <div class="formula">D = Ton / (Ton + Toff)</div>
          <p>Buck: Vout≈Vin×D. Boost: Vout≈Vin/(1−D).</p>
          <div class="callout warn">D %100'e yaklaşırsa boost'ta gerilim kontrolsüz yükselir; bu yüzden sınırlama (limit) konur.</div>
        `,
        key: ["Skin effect yüksek frekansta direnci artırır.", "Yüksek f: küçük boyut, fazla kayıp/EMI.", "D=Duty cycle; buck/boost formülleri.", "D sınırlanmalı."],
        quiz: [
          { q: "Skin effect ne yapar?", o: ["Gerilim artırır", "Akımı yüzeye iter, direnci artırır", "Filtreler", "Soğutur"], a: 1, e: "Kesit azalır, direnç artar." },
          { q: "Buck Vout?", o: ["Vin×D", "Vin/(1−D)", "Vin+D", "D/Vin"], a: 0, e: "Vout≈Vin×D." }
        ]
      },
      {
        id: "m4l3", title: "EMI Filtre ve Kuplaj Kondansatörleri", video: "Anahtarlamalı • 03",
        content: `
          <h4>EMI filtre</h4>
          <p>Sürücülerin ve SMPS'in ürettiği yüksek frekanslı gürültünün şebekeye kaçmasını engeller.</p>
          <ul>
            <li><b>X kondansatörü:</b> hat-hat arası (L-N).</li>
            <li><b>Y kondansatörü:</b> hat-toprak arası (L/N-PE).</li>
            <li><b>Common-mode choke:</b> ortak mod gürültüyü bastırır.</li>
          </ul>
          <h4>Kuplaj kondansatörleri</h4>
          <p>Sinyal yollarında DC'yi bloklar, AC'yi geçirir; ölçüm ve amplifikatör girişlerinde kullanılır.</p>
          <div class="callout info">X/Y kondansatörleri güvenlik sertifikalıdır (X1/X2, Y1/Y2); sıradan kondansatör takılamaz.</div>
        `,
        key: ["EMI filtre şebekeye gürültü kaçışını engeller.", "X: hat-hat, Y: hat-toprak.", "Common-mode choke.", "X/Y güvenlik sertifikalı."],
        quiz: [
          { q: "Y kondansatörü nereye bağlanır?", o: ["Hat-hat", "Hat-toprak", "Sadece GND", "Şase"], a: 1, e: "Hat ile toprak arası." },
          { q: "EMI filtre ne yapar?", o: ["Gerilim artırır", "Yüksek frekans gürültüyü bastırır", "Akım sınırlar", "Isıtır"], a: 1, e: "Gürültüyü süzer." }
        ]
      },
      {
        id: "m4l4", title: "Buck / Boost / Buck-Boost Converter", video: "Anahtarlamalı • 04",
        content: `
          <table class="tbl">
            <tr><th>Tip</th><th>Vin→Vout</th><th>Örnek</th></tr>
            <tr><td>Buck</td><td>Vin &gt; Vout</td><td>12→5 V</td></tr>
            <tr><td>Boost</td><td>Vin &lt; Vout</td><td>3,7→12 V</td></tr>
            <tr><td>Buck-Boost</td><td>her ikisi</td><td>değişken kaynak</td></tr>
          </table>
          <h4>Buck yapısı</h4>
          <ul>
            <li>MOSFET anahtar</li>
            <li>Freewheel diyot / senkron MOSFET</li>
            <li>Bobin (enerji depolar)</li>
            <li>Kontrol IC (feedback)</li>
          </ul>
          <div class="callout warn"><b>Sık arıza:</b> switch MOSFET, çıkış diyodu, feedback bölücüsü ve bootstrap kondansatörü.</div>
        `,
        key: ["Buck düşürür, boost yükseltir, buck-boost her ikisi.", "Buck: MOSFET+diyot+bobin+kontrol.", "Sık arıza: switch/çıkış diyodu/feedback."],
        quiz: [
          { q: "5 V→12 V hangi tip?", o: ["Buck", "Boost", "Lineer", "LDO"], a: 1, e: "Boost." },
          { q: "Freewheel diyotun görevi?", o: ["Yükseltme", "Anahtar kapalıyken bobin akımına yol", "Filtre", "Sınırlama"], a: 1, e: "Bobin akımını döndürür." }
        ]
      },
      {
        id: "m4l5", title: "PFC ve Akım Sınırlama", video: "Anahtarlamalı • 05",
        content: `
          <h4>PFC (Power Factor Correction)</h4>
          <p>Giriş akımını gerilimle aynı faza getirir; güç faktörünü düzeltir.</p>
          <ul>
            <li><b>Pasif:</b> bobin + kondansatör.</li>
            <li><b>Aktif:</b> boost hattı, girişi ~400 V DC'ye çıkarır.</li>
          </ul>
          <p>Yüksek güçlü cihazlarda yasal zorunludur; PFC çalışmazsa cihaz açılmaz/sigorta yanar.</p>
          <h4>Akım sınırlama</h4>
          <ul>
            <li><b>NTC inrush limiter:</b> açılışta ani akımı sınırlar.</li>
            <li><b>Aktif inrush (MOSFET + direnç):</b> yumuşak başlatma.</li>
            <li><b>Akım trafosu / shunt + karşılaştırıcı:</b> aşırı akım koruması.</li>
          </ul>
          <div class="callout info">İnrush akımı, büyük bulk kondansatörün ilk şarj anında çektiği dev akımdır; sigortayı yakmaması için sınırlanır.</div>
        `,
        key: ["PFC akım fazını düzeltir; yüksek güçte zorunlu.", "Aktif PFC boost ile ~400 V.", "İnrush akımı NTC/aktif devreyle sınırlanır.", "Shunt/akım trafosu koruma."],
        quiz: [
          { q: "PFC amacı?", o: ["Gerilim düşürmek", "Güç faktörünü düzeltmek", "Akım sınırlamak", "Frekans"], a: 1, e: "Akım-gerilim fazını düzeltir." },
          { q: "İnrush akımı neden sınırlanır?", o: ["Gürültü", "Sigortayı yakmamak", "Verim", "Isı"], a: 1, e: "Açılıştaki dev akım için." }
        ]
      },
      {
        id: "m4l6", title: "Optokuplör ve İzolasyon", video: "Anahtarlamalı • 06",
        content: `
          <p><b>Optokuplör</b>, bir LED ile bir fototransistörü kullanarak iki devreyi <b>ışıkla</b> ve <b>galvanik olarak izole</b> şekilde bağlar.</p>
          <ul>
            <li>Primer (yüksek gerilim) ve sekonder (düşük gerilim) arasında izolasyon.</li>
            <li>SMPS feedback'inde çıkış gerilimini primerdeki PWM IC'ye bildirir.</li>
            <li>Dijital izolasyon, gate drive, sinyal ayırma.</li>
          </ul>
          <div class="callout warn"><b>Sık arıza:</b> Optokuplörün LED'i yaşlandıkça zayıflar/kopar → feedback bozulur → SMPS çıkışı ya tavan yapar ya sıfırlanır. Opto çevresindeki feedback dirençleriyle birlikte test et.</div>
        `,
        key: ["Optokuplör ışıkla galvanik izolasyon sağlar.", "SMPS feedback'inde kullanılır.", "Yaşlanan opto feedback'i bozar.", "Feedback dirençleriyle birlikte test et."],
        quiz: [
          { q: "Optokuplör ne sağlar?", o: ["Yükseltme", "Galvanik izolasyon", "Filtre", "Isı"], a: 1, e: "Işıkla izolasyon." },
          { q: "Optokuplör SMPS'te ne için?", o: ["Güç", "Feedback", "Filtre", "Doğrultma"], a: 1, e: "Çıkışı primere bildirir." }
        ]
      }
    ]
  }
];
