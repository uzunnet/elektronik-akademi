/* =========================================================================
   Elektronik Akademi — Şekil Kütüphanesi (figures.js)
   Parça sembolleri, gerçek görünüm, bacak (pinout) diyagramları ve blok şemalar.
   Hepsi çevrimdışı SVG. Derslerde ve "Şekiller" galerisinde kullanılır.
   ========================================================================= */
(function (root) {

  const T = '#cdd9e8', RED = '#e0342c', GRN = '#2cc6a0', AMB = '#e0a52c', BLU = '#43d9ff', MUT = '#8ba0ba';
  const sv = (w, h, inner) => `<svg class="fig-svg" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img">${inner}</svg>`;
  const txt = (x, y, s, fill, size, anchor) => `<text x="${x}" y="${y}" fill="${fill || T}" font-size="${size || 12}" font-family="Segoe UI,sans-serif" text-anchor="${anchor || 'middle'}">${s}</text>`;
  const ln = (x1, y1, x2, y2, c, w) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c || T}" stroke-width="${w || 2}"/>`;
  const rc = (x, y, w, h, f, s, rx) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx == null ? 4 : rx}" fill="${f || 'none'}" stroke="${s || T}" stroke-width="2"/>`;
  const ci = (cx, cy, r, f, s) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f || 'none'}" stroke="${s || T}" stroke-width="2"/>`;

  const FIG = {

    /* ---------------------------- DİRENÇ ---------------------------- */
    resistor: { cat: "Bileşenler", t: "Direnç — sembol, gerçek görünüm ve renk kodu", g: sv(420, 240, `
      ${ln(20,70,90,70)}${rc(90,50,130,40,'#d9c9a3','#9c8a5f',6)}${ln(220,70,300,70)}
      <rect x="112" y="50" width="12" height="40" fill="#6b4423"/><rect x="138" y="50" width="12" height="40" fill="#111"/>
      <rect x="164" y="50" width="12" height="40" fill="#d32"/><rect x="204" y="50" width="12" height="40" fill="#d4af37"/>
      ${txt(118,38,'1')}${txt(144,38,'0')}${txt(170,38,'×100')}${txt(210,38,'±%5')}
      ${txt(160,112,'R = 1 kΩ ±%5  (kahve-siyah-kırmızı-altın)')}
      ${ln(40,140,380,140,MUT,1)}
      ${txt(160,20,'Renk bantları',MUT,12)}
      ${txt(210,175,'Sembol:',MUT,12)}${ln(330,168,380,168)}${rc(345,158,20,20)}${ln(380,168,410,168)}
      ${txt(210,205,'• Uç yoktur, yön önemsiz (kutupsuz)')}
      ${txt(210,225,'• SMD: üzerindeki rakam = değer (103 = 10 kΩ)')}
    `) },

    /* -------------------------- KONDANSATÖR ------------------------- */
    capacitor: { cat: "Bileşenler", t: "Kondansatör — kutupsuz ve kutuplu (elektrolitik)", g: sv(440, 250, `
      ${txt(110,24,'KUTUPSUZ (seramik/film)')}
      ${ln(60,80,90,80)}${ln(90,50,90,110,T,4)}${ln(106,50,106,110,T,4)}${ln(106,80,136,80)}
      ${txt(98,135,'yön önemsiz')}
      ${ln(230,10,230,230,MUT,1)}
      ${txt(340,24,'KUTUPLU (elektrolitik)')}
      ${ln(270,80,300,80)}${ln(300,50,300,110,T,4)}
      <path d="M316,50 q14,30 0,60" fill="none" stroke="${T}" stroke-width="4"/>${ln(330,80,360,80)}
      ${txt(292,40,'+',GRN,18)}${txt(326,40,'−',RED,18)}
      ${txt(340,135,'uzun bacak = +')}
      ${txt(340,158,'gövdedeki şerit = −')}
      ${txt(220,200,'Polarite ters bağlanırsa ŞİŞER ve PATLAR!')}
      ${txt(220,222,'Görev: filtreleme, kuplaj, zamanlama, decoupling')}
    `) },

    /* ---------------------------- BOBİN ----------------------------- */
    inductor: { cat: "Bileşenler", t: "Bobin (indüktör) — sembol ve gerçek görünüm", g: sv(420, 200, `
      ${ln(30,70,110,70)}
      <path d="M110,70 a15,15 0 0 1 30,0 M140,70 a15,15 0 0 1 30,0 M170,70 a15,15 0 0 1 30,0 M200,70 a15,15 0 0 1 30,0" fill="none" stroke="${T}" stroke-width="2"/>
      ${ln(230,70,310,70)}
      ${txt(170,105,'Bobin sembolü')}
      ${txt(210,150,'• Akım değişimine karşı koyar (akım ani değişemez)')}
      ${txt(210,172,'• Akım kesilince ters gerilim üretir → flyback diyot')}
      ${txt(210,194,'• SMPS, filtre ve trafoda kullanılır. Birim: Henry (H)')}
    `) },

    /* -------------------------- TRANSFORMATÖR ----------------------- */
    transformer: { cat: "Bileşenler", t: "Transformatör — primer/sekonder ve izolasyon", g: sv(520, 210, `
      ${ln(60,50,60,150)}${ln(90,50,90,150)}
      ${ln(150,50,150,150)}${ln(180,50,180,150)}
      ${ln(90,100,150,100,MUT,1)}
      ${ln(20,100,60,100)}${ln(180,100,220,100)}
      ${txt(60,180,'Primer')}${txt(180,180,'Sekonder')}
      <rect x="112" y="50" width="6" height="100" fill="${MUT}"/><rect x="122" y="50" width="6" height="100" fill="${MUT}"/>
      ${txt(360,60,'V1/V2 = N1/N2',AMB,14)}
      ${txt(360,110,'• Gerilimi yükseltir/düşürür')}
      ${txt(360,135,'• Galvanik İZOLASYON sağlar')}
      ${txt(360,160,'• SADECE AC ile çalışır (DC bobini yakar)')}
    `) },

    /* ---------------------------- DİYOT ----------------------------- */
    diode: { cat: "Yarıiletken", t: "Diyot — A(anot) ve K(katot), akım yönü", g: sv(420, 200, `
      ${ln(30,80,150,80)}
      <polygon points="150,60 150,100 190,80" fill="${T}"/>
      ${ln(190,55,190,105,T,4)}${ln(190,80,310,80)}
      ${txt(120,110,'A (anot +)',GRN,13)}${txt(230,110,'K (katot −)',RED,13)}
      <path d="M240,55 l22,-14 M240,55 l0,26" stroke="${AMB}" stroke-width="2" fill="none" marker-end=""/>
      ${txt(300,45,'akım yönü →',AMB,12)}
      ${txt(210,150,'Silisyum Vf ≈ 0,7 V   Schottky ≈ 0,3 V')}
      ${txt(210,175,'Sağlamlık: ileri ~0,7 V; iki yön 0 = kısa devre (arızalı)')}
    `) },

    /* ---------------------------- ZENER ----------------------------- */
    zener: { cat: "Yarıiletken", t: "Zener diyot — ters bağlanır, gerilimi sabitler", g: sv(420, 190, `
      ${ln(40,80,150,80)}
      <polygon points="150,60 150,100 195,80" fill="${T}"/>
      <path d="M195,55 l0,50 M195,55 l14,-10 M195,105 l-14,10" fill="none" stroke="${T}" stroke-width="3"/>
      ${ln(195,80,330,80)}
      ${txt(180,120,'katot üst uç',MUT,12)}
      ${txt(210,155,'Ters polaritede Vz değerinde gerilimi sabitler.')}
      ${txt(210,178,'Kullanım: gerilim referansı, aşırı gerilim koruması (TVS).')}
    `) },

    /* ----------------------------- LED ------------------------------ */
    led: { cat: "Bileşenler", t: "LED — bacaklar (+ uzun / − kısa), düz kenar", g: sv(430, 220, `
      ${ln(30,70,120,70)}<polygon points="120,50 120,90 160,70" fill="${RED}"/>${ln(160,45,160,95,RED,4)}${ln(160,70,300,70)}
      <path d="M170,45 l16,-14 M182,58 l16,-14" stroke="${AMB}" stroke-width="2" fill="none"/>
      ${txt(90,100,'+ (uzun bacak)',GRN,12)}${txt(230,100,'− (kısa bacak)',RED,12)}
      ${txt(215,150,'• Uzun bacak = + (anot), kabaca baklava düz kenarı = −')}
      ${txt(215,174,'• Her LED seri DİRENÇ ister: R = (Vkaynak − Vf) / I')}
      ${txt(215,198,'• Kırmızı Vf ≈ 2 V, mavi/beyaz ≈ 3,2 V')}
    `) },

    /* ---------------------------- BJT ------------------------------- */
    bjt: { cat: "Yarıiletken", t: "Transistör (BJT) — E/B/C bacakları ve sembol", g: sv(520, 240, `
      ${txt(110,24,'TO-92 paket (düz taraf sana bakıyor)')}
      <path d="M70,60 a55,55 0 0 0 0,110 Z" fill="#1b2534" stroke="${T}" stroke-width="2"/>
      ${ln(60,170,60,210)}${ln(90,170,90,210)}${ln(120,170,120,210)}
      ${txt(60,228,'E',GRN,14)}${txt(90,228,'B',AMB,14)}${txt(120,228,'C',RED,14)}
      ${ln(240,10,240,230,MUT,1)}
      ${txt(340,40,'NPN sembolü')}
      ${ci(340,120,42)}
      ${ln(318,80,318,160,T,4)}
      ${ln(318,100,365,75)}${ln(318,140,365,165)}
      ${txt(300,80,'B',AMB,13)}${txt(372,70,'C',RED,13)}${txt(372,172,'E',GRN,13)}
      <polygon points="365,155 352,150 356,163" fill="${GRN}"/>
      ${txt(340,225,'Küçük baz akımı (I_B) → büyük kolektör akımı (I_C)')}
    `) },

    /* --------------------------- MOSFET ----------------------------- */
    mosfet: { cat: "Yarıiletken", t: "MOSFET — G/D/S bacakları ve sembol", g: sv(520, 250, `
      ${txt(110,24,'TO-220 (ön görünüş)')}
      ${rc(55,50,110,120,'#1b2534','#cdd9e8',8)}
      ${rc(70,28,80,24,'#2d3b52','#cdd9e8',4)}
      ${txt(110,44,'metal sekme',MUT,11)}
      ${ln(75,170,75,205)}${ln(110,170,110,205)}${ln(145,170,145,205)}
      ${txt(75,222,'G',GRN,14)}${txt(110,222,'D',RED,14)}${txt(145,222,'S',AMB,14)}
      ${ln(240,10,240,245,MUT,1)}
      ${txt(340,40,'N-kanal sembolü')}
      ${ln(300,70,340,70)}${txt(288,74,'G',GRN,12)}
      ${ln(340,60,340,180,T,3)}
      ${ln(360,70,360,180,T,3)}
      ${ln(340,80,360,80)}${ln(340,100,360,100)}${ln(340,140,360,140)}${ln(340,160,360,160)}
      ${ln(360,80,400,60)}${txt(406,58,'D',RED,12)}
      ${ln(360,160,400,180)}${txt(406,184,'S',AMB,12)}
      ${ln(360,120,400,120)}<polygon points="376,120 388,114 388,126" fill="${T}"/>
      ${txt(340,215,'Gerilimle (V_GS) kontrol edilir. Arıza: D-S kısa.')}
      ${txt(340,238,'R_DS(on) küçük = az kayıp = az ısı')}
    `) },

    /* ---------------------------- RÖLE ------------------------------ */
    relay: { cat: "Bileşenler", t: "Röle — bobin ve COM/NO/NC kontaklar", g: sv(440, 230, `
      ${rc(40,70,90,80,'#1b2534','#cdd9e8',6)}
      <path d="M60,90 a10,14 0 0 1 0,0 M60,90 l0,40 M75,90 l0,40" stroke="${T}" stroke-width="2" fill="none"/>
      ${txt(85,120,'bobin',MUT,12)}
      ${ln(20,110,40,110)}${ln(130,110,150,110)}
      ${txt(20,100,'A',GRN,12)}${txt(150,100,'B',RED,12)}
      ${ln(230,70,230,180,T,2)}
      ${ci(230,70,4,MUT)}${ci(230,170,4,MUT)}
      ${ln(230,70,290,60)}
      ${txt(300,60,'COM',13)}
      ${ci(230,170,4,MUT)}${ln(230,170,300,140)}${txt(310,140,'NO',13)}
      ${ln(230,190,300,190)}${txt(310,190,'NC',13)}
      ${txt(220,215,'Bobin enerjilenince COM, NO kontağına geçer. Bobine flyback diyot şart.')}
    `) },

    /* --------------------------- OP-AMP ----------------------------- */
    opamp: { cat: "Analog", t: "Op-amp — girişler, çıkış, besleme bacakları", g: sv(420, 230, `
      <polygon points="120,40 120,200 280,120" fill="#1b2534" stroke="${T}" stroke-width="2"/>
      ${ln(60,80,120,80)}${txt(70,72,'−',RED,18)}
      ${ln(60,160,120,160)}${txt(70,152,'+',GRN,18)}
      ${ln(280,120,360,120)}${txt(340,112,'Çıkış',T,12)}
      ${ln(200,30,200,40)}${txt(200,24,'V+',AMB,12)}
      ${ln(200,200,200,210)}${txt(200,224,'V−',MUT,12)}
      ${txt(200,140,'+',AMB,12)}
      ${txt(210,60,'İki kural:',MUT,12)}
      ${txt(210,78,'1) girişler ≈ eşit')}
      ${txt(210,96,'2) girişe akım akmaz')}
    `) },

    /* --------------------- 7805 REGÜLATÖR --------------------------- */
    reg7805: { cat: "Güç", t: "7805 regülatör — IN / GND / OUT bacakları", g: sv(440, 230, `
      ${rc(120,50,200,90,'#1b2534','#cdd9e8',8)}
      ${txt(220,72,'7805',T,18)}${txt(220,98,'+5V regülatör',MUT,12)}
      ${rc(160,50,8,10,'#2d3b52')}${rc(216,50,8,10,'#2d3b52')}${rc(272,50,8,10,'#2d3b52')}
      ${ln(164,140,164,185)}${ln(220,140,220,185)}${ln(276,140,276,185)}
      ${txt(164,205,'1  IN',GRN,12)}${txt(220,205,'2  GND',MUT,12)}${txt(276,205,'3  OUT',RED,12)}
      ${txt(140,185,'(giriş)',MUT,10)}${txt(276,185,'(çıkış)',MUT,10)}
      ${txt(220,222,'Fazla gerilim ısıya dönüşür:  P = (Vin−Vout)×I',MUT,11)}
    `) },

    /* -------------------------- LOJİK KAPILAR ----------------------- */
    logic: { cat: "Dijital", t: "Lojik kapı sembolleri — AND, OR, NOT, NAND", g: sv(460, 220, `
      ${txt(80,28,'AND')}<path d="M50,50 h40 a30,30 0 0 1 0,60 h-40 Z" fill="none" stroke="${T}" stroke-width="2"/>${ln(20,65,50,65)}${ln(20,95,50,95)}${ln(120,80,150,80)}
      ${txt(210,28,'OR')}<path d="M180,50 q25,30 0,60 q40,0 60,-30 q-20,-30 -60,-30 Z" fill="none" stroke="${T}" stroke-width="2"/>${ln(150,65,182,65)}${ln(150,95,182,95)}${ln(242,80,270,80)}
      ${txt(340,28,'NOT')}<polygon points="310,50 310,110 360,80" fill="none" stroke="${T}" stroke-width="2"/>${ci(367,80,7)}${ln(285,80,310,80)}${ln(374,80,400,80)}
      ${txt(80,140,'NAND')}<path d="M50,160 h40 a30,30 0 0 1 0,60 h-40 Z" fill="none" stroke="${T}" stroke-width="2"/>${ci(122,190,7)}${ln(20,175,50,175)}${ln(20,205,50,205)}${ln(132,190,160,190)}
      ${txt(230,150,'NAND evrenseldir:')}
      ${txt(230,172,'Sadece NAND ile tüm')}
      ${txt(230,192,'diğer kapılar kurulur.')}
    `) },

    /* ----------------------- KÖPRÜ DOĞRULTUCU ----------------------- */
    bridge: { cat: "Güç", t: "Köprü doğrultucu — ~ , ~ , + , − uçları", g: sv(400, 240, `
      <polygon points="200,40 320,120 200,200 80,120" fill="none" stroke="${T}" stroke-width="1.5"/>
      <polygon points="150,90 190,70 190,110" fill="${T}" transform="rotate(45 170 90)"/>
      ${txt(200,30,'~',AMB,22)}${txt(200,222,'~',AMB,22)}
      ${txt(330,124,'+',GRN,22)}${txt(66,124,'−',RED,22)}
      ${txt(200,120,'AC girer, iki uçtan DC çıkar')}
      ${txt(200,150,'Dört diyot: her iki yarım dalga kullanılır')}
      ${txt(200,175,'Çıkışa büyük kondansatör → dalgalanma azalır')}
    `) },

    /* ------------------------- MİKRODENETLEYİCİ --------------------- */
    mcu: { cat: "Dijital", t: "Mikrodenetleyici — kritik bacaklar", g: sv(440, 250, `
      ${rc(130,60,180,130,'#1b2534','#cdd9e8',8)}
      ${txt(220,120,'MCU',T,20)}${txt(220,142,'(CPU+Flash+RAM)',MUT,11)}
      ${ln(130,90,110,90)}${txt(108,94,'VDD',GRN,12,'end')}
      ${ln(130,120,110,120)}${txt(108,124,'VSS/GND',MUT,12,'end')}
      ${ln(130,150,110,150)}${txt(108,154,'NRST',AMB,12,'end')}
      ${ln(130,180,110,180)}${txt(108,184,'BOOT0',RED,12,'end')}
      ${ln(310,90,330,90)}${txt(334,94,'XTAL',BLU,12,'start')}
      ${ln(310,120,330,120)}${txt(334,124,'SWD',GRN,12,'start')}
      ${ln(310,150,330,150)}${txt(334,154,'GPIO',T,12,'start')}
      ${ln(310,180,330,180)}${txt(334,184,'ADC/PWM',T,12,'start')}
      ${txt(220,225,'Çalışmıyorsa önce: besleme, NRST ve XTAL kontrol et')}
    `) },

    /* --------------------------- SMPS BLOK -------------------------- */
    smps: { cat: "Güç", t: "SMPS blok şeması — girişten çıkışa", g: sv(560, 220, `
      ${rc(10,50,80,50,'#1b2534','#cdd9e8',6)}${txt(50,80,'Şebeke',T,11)}
      ${rc(110,50,80,50,'#1b2534','#cdd9e8',6)}${txt(150,72,'EMI',T,11)}${txt(150,88,'Filtre',T,11)}
      ${rc(210,50,80,50,'#1b2534','#cdd9e8',6)}${txt(250,72,'Doğrultucu',T,11)}${txt(250,88,'+Bulk',T,11)}
      ${rc(310,50,90,50,'#2a2030','#e0342c',6)}${txt(355,72,'Anahtar+Trafo',RED,11)}${txt(355,88,'MOSFET/PWM',MUT,10)}
      ${rc(420,50,80,50,'#1b2534','#cdd9e8',6)}${txt(460,72,'Sekonder',T,11)}${txt(460,88,'Doğr.+Filtre',T,11)}
      ${ln(90,75,110,75)}${ln(190,75,210,75)}${ln(290,75,310,75)}${ln(400,75,420,75)}${ln(500,75,545,75)}
      ${txt(545,70,'DC',GRN,12)}
      <path d="M460,150 L460,170 L355,170 L355,105" fill="none" stroke="${AMB}" stroke-width="2"/>
      <polygon points="355,105 349,117 361,117" fill="${AMB}"/>
      ${txt(410,165,'Feedback (optokuplör/bölücü)',AMB,11)}
      ${txt(275,205,'Çıkış yoksa: anahtarlama MOSFET, çıkış diyodu ve feedback ara')}
    `) },

    /* --------------------------- BUCK ------------------------------- */
    buck: { cat: "Güç", t: "Buck dönüştürücü — çalışma prensibi", g: sv(500, 220, `
      ${txt(40,120,'Vin',GRN,12)}
      ${ln(60,110,90,110)}
      ${rc(90,95,50,30,'#2a2030',RED,4)}${txt(115,115,'SW',RED,11)}
      ${ln(140,110,200,110)}
      ${ci(200,110,4,AMB)}
      <polygon points="185,155 185,175 215,175 215,155" fill="none" stroke="${T}" stroke-width="2"/>${txt(200,195,'D',T,12)}
      <polygon points="188,150 212,150 200,172" fill="${T}"/>${ln(200,110,200,150)}${ln(200,180,200,200)}${ln(200,200,200,205)}
      ${ln(200,110,250,110)}
      <path d="M250,110 a14,14 0 0 1 28,0 a14,14 0 0 1 28,0" fill="none" stroke="${T}" stroke-width="2"/>${txt(278,145,'L',T,12)}
      ${ln(306,110,360,110)}
      ${ci(360,110,4,GRN)}
      <rect x="345" y="130" width="6" height="40" fill="${T}"/><rect x="369" y="130" width="6" height="40" fill="${T}"/>${txt(360,190,'C',T,12)}
      ${ln(360,110,360,130)}${ln(360,170,360,200)}
      ${rc(420,140,40,40,'#1b2534','#cdd9e8',4)}${txt(440,165,'Yük',T,11)}
      ${ln(360,110,440,110)}${ln(440,110,440,140)}${ln(440,180,440,200)}${ln(360,200,200,200)}
      ${txt(250,60,'Vout ≈ Vin × Duty',AMB,13)}
      ${txt(250,35,'MOSFET hızlı aç/kapa → bobin süzer → düşük çıkış')}
    `) },

    /* ------------------------ GERİLİM BÖLÜCÜ ------------------------ */
    divider: { cat: "Analiz", t: "Gerilim bölücü — Vout = Vin × R2/(R1+R2)", g: sv(380, 230, `
      ${txt(60,40,'Vin',GRN,13)}
      ${ln(110,50,110,80)}${rc(90,80,40,50,'#d9c9a3','#9c8a5f',4)}${txt(150,110,'R1',T,12)}
      ${ln(110,130,110,160)}${ci(110,160,4,AMB)}
      ${ln(110,160,110,185)}${rc(90,185,40,45,'#d9c9a3','#9c8a5f',4)}${txt(150,210,'R2',T,12)}
      ${ln(110,230,110,245)}${ln(90,245,130,245)}${ln(100,252,120,252)}${ln(105,258,115,258)}
      ${ln(110,160,250,160)}${txt(300,164,'Vout',GRN,13)}
      ${txt(230,60,'R2 = GND tarafındaki direnç')}
      ${txt(230,95,'Yük çekilirse çıkış düşer →')}
      ${txt(230,120,'regülatör kullan')}
    `) },

    /* ---------------------- SERİ / PARALEL -------------------------- */
    seriesparalel: { cat: "Analiz", t: "Seri ve paralel bağlama", g: sv(470, 210, `
      ${txt(100,28,'SERİ')}${txt(360,28,'PARALEL')}
      ${ln(30,60,60,60)}${rc(60,50,40,20,'#d9c9a3','#9c8a5f',3)}${ln(100,60,140,60)}${rc(140,50,40,20,'#d9c9a3','#9c8a5f',3)}${ln(180,60,210,60)}
      ${ln(30,60,30,120)}${ln(210,60,210,120)}${ln(30,120,210,120)}
      ${txt(120,90,'R = R1 + R2',AMB,12)}
      ${txt(120,150,'Akım aynı, gerilim bölünür',MUT,11)}
      ${ln(260,60,290,60)}${ln(290,60,290,120)}${ln(260,120,290,120)}
      ${rc(300,55,40,12,'#d9c9a3','#9c8a5f',3)}${rc(300,113,40,12,'#d9c9a3','#9c8a5f',3)}
      ${ln(300,61,340,61)}${ln(340,61,340,119)}${ln(300,119,340,119)}${ln(260,90,300,90)}${ln(340,90,380,90)}
      ${txt(360,90,'R=1/R1+1/R2',AMB,12)}
      ${txt(310,150,'Gerilim aynı, akım bölünür',MUT,11)}
      ${txt(235,185,'Seri: dirençler toplanır · Paralel: eşdeğer küçülür')}
    `) },

    /* -------------------- DOĞRULTMA DALGA ŞEKLİ --------------------- */
    rectwave: { cat: "Güç", t: "Yarım dalga doğrultma — giriş/çıkış dalgası", g: sv(480, 210, `
      ${ln(30,120,450,120,MUT,1)}
      <path d="M30,120 q25,-45 50,0 q25,45 50,0 q25,-45 50,0 q25,45 50,0 q25,-45 50,0 q25,45 50,0 q25,-45 50,0 q25,45 50,0" fill="none" stroke="${AMB}" stroke-width="2"/>
      ${txt(240,30,'AC giriş (sinüs)',AMB,12)}
      ${txt(240,185,'Çıkış: sadece pozitif yarım dalgalar (diyot)',GRN,12)}
      <path d="M30,180 q25,-45 50,0 l50,0 q25,-45 50,0 l50,0 q25,-45 50,0 l50,0 q25,-45 50,0 l50,0" fill="none" stroke="${GRN}" stroke-width="2"/>
    `) },

    /* ----------------------- RC ZAMAN SABİTİ ------------------------ */
    rc: { cat: "Analiz", t: "RC devresi — kondansatörün şarj eğrisi (τ=R×C)", g: sv(470, 210, `
      ${ln(30,80,70,80)}${rc(70,68,40,24,'#d9c9a3','#9c8a5f',3)}${ln(110,80,180,80)}
      ${ln(180,80,180,110)}<rect x="172" y="110" width="6" height="34" fill="${T}"/><rect x="190" y="110" width="6" height="34" fill="${T}"/>${ln(188,127,230,127)}
      ${ln(180,144,180,170)}${ln(30,170,230,170)}${ln(30,80,30,170)}
      ${txt(50,60,'V',GRN,12)}
      ${ln(270,30,270,180,MUT,1)}${ln(270,180,450,180,MUT,1)}
      <path d="M270,180 Q300,180 320,90 T450,40" fill="none" stroke="${GRN}" stroke-width="2.5"/>
      ${txt(360,40,'Vs (tam dolu)',MUT,11)}
      ${txt(330,150,'1τ=%63, 5τ≈%100',AMB,12)}
      ${txt(360,200,'Yatay: zaman, Dikey: kondansatör gerilimi',MUT,10)}
    `) },

    /* ------------------- POTANSİYOMETRE ----------------------------- */
    potentiometer: { cat: "Bileşenler", t: "Potansiyometre — 3 bacak (uç-uç + orta/sürgü)", g: sv(420, 200, `
      ${ln(40,80,110,80)}${rc(110,60,90,40,'#d9c9a3','#9c8a5f',4)}${ln(200,80,300,80)}
      ${txt(110,45,'1')}${txt(200,45,'3')}
      <path d="M155,30 l0,28 M147,58 l16,0" stroke="${T}" stroke-width="2" fill="none"/>
      ${txt(155,22,'2 (orta / sürgü)',AMB,11)}
      ${txt(210,120,'1-3: sabit uçlar (toplam direnç)')}
      ${txt(210,145,'2: sürgü — uçlara göre değişken gerilim')}
      ${txt(210,170,'Ses seviyesi, ayar düğmesi, referans için kullanılır.')}
    `) },

    /* ------------------- SENSÖRLER (NTC/VDR/LDR) -------------------- */
    sensors: { cat: "Bileşenler", t: "Değişken dirençler — NTC, VDR (varistör), LDR", g: sv(460, 210, `
      ${txt(80,26,'NTC (termistör)')}${ln(40,70,150,70)}${rc(70,55,50,30,'#d9c9a3','#9c8a5f',3)}
      <path d="M95,95 l-14,22" stroke="${T}" stroke-width="2"/><path d="M95,95 h16 M88,110 h16" stroke="${T}" stroke-width="2"/>
      ${txt(95,150,'ısındıkça direnç düşer',MUT,11)}
      ${txt(320,26,'VDR (varistör)')}${ln(260,70,380,70)}${rc(300,55,40,30,'#d9c9a3','#9c8a5f',3)}
      <path d="M300,55 l40,30 M340,55 l-40,30" stroke="${T}" stroke-width="2"/>
      ${txt(320,150,'gerilim artınca iletime geçer',MUT,11)}
      ${txt(190,192,'LDR: ışıkta direnç düşer (foto-direnç)')}
    `) },

    /* ------------------- SİGORTA / PİL ------------------------------ */
    fuse: { cat: "Bileşenler", t: "Sigorta — devreye seri, aşırı akımda atar", g: sv(420, 180, `
      ${ln(40,80,110,80)}${rc(110,62,120,36,'#1b2534','#cdd9e8',18)}<line x1="120" y1="80" x2="220" y2="80" stroke="${T}" stroke-width="2"/>${ln(230,80,300,80)}
      ${txt(170,120,'cam tüp + iletken tel')}
      ${txt(210,150,'Seri bağlanır. Yanınca önce nedeni ara, TEL TAKMA!')}
    `) },

    battery: { cat: "Bileşenler", t: "Pil/akü — polarite (+ / −)", g: sv(420, 180, `
      ${ln(60,90,120,90)}${ln(120,60,120,120,T,4)}${ln(136,74,136,106,T,2)}${ln(152,60,152,120,T,4)}${ln(168,74,168,106,T,2)}${ln(184,60,184,120,T,4)}${ln(200,74,200,106,T,2)}${ln(200,90,260,90)}
      ${txt(120,140,'+',GRN,16)}${txt(200,140,'−',RED,16)}
      ${txt(300,60,'Uzun çizgi = +')}${txt(300,85,'Kısa çizgi = −')}
      ${txt(210,165,'Ters bağlarsan devre zarar görür.')}
    `) },

    /* ------------------- ANAHTAR ÇEŞİTLERİ -------------------------- */
    switches: { cat: "Bileşenler", t: "Anahtar çeşitleri — SPST, SPDT, buton", g: sv(460, 200, `
      ${txt(80,26,'SPST (basit)')}${ln(30,70,70,70)}${ci(70,70,3,T)}${ci(110,70,3,T)}${ln(70,70,108,54)}${ln(110,70,150,70)}
      ${txt(80,100,'aç/kapa')}
      ${txt(250,26,'SPDT (iki yollu)')}${ln(250,50,290,50)}${ci(290,50,3,T)}${ci(290,90,3,T)}${ci(290,130,3,T)}
      ${ln(290,90,335,50)}${ln(290,90,335,130)}${ln(200,90,290,90)}
      ${txt(250,155,'COM → A veya B')}
      ${txt(400,26,'Buton')}${ln(360,70,400,70)}${ci(400,70,3,T)}${ci(440,70,3,T)}${ln(400,70,438,58)}${txt(420,58,'⌐')}
      ${txt(400,100,'basınca iletir')}
    `) },

    /* ------------------- OPTOKUPLÖR -------------------------------- */
    optocoupler: { cat: "Yarıiletken", t: "Optokuplör — LED + fototransistör (ışıkla izolasyon)", g: sv(460, 210, `
      ${rc(30,50,140,110,'#1b2534','#cdd9e8',6)}
      <polygon points="70,90 70,120 100,105" fill="${RED}"/><line x1="100" y1="88" x2="100" y2="122" stroke="${T}" stroke-width="3"/>${ln(140,105,170,105)}
      <path d="M108,95 l22,-8 M108,115 l22,8" stroke="${AMB}" stroke-width="2" fill="none"/>
      ${txt(100,45,'giriş LED',MUT,11)}
      ${rc(210,50,140,110,'#1b2534','#cdd9e8',6)}
      ${ln(240,80,270,80,T,3)}${ln(255,72,255,104)}<line x1="270" y1="80" x2="290" y2="70" stroke="${T}" stroke-width="2"/><line x1="270" y1="80" x2="290" y2="118" stroke="${T}" stroke-width="2"/>
      ${txt(275,45,'fototransistör',MUT,11)}
      ${txt(230,150,'ışıkla bağlanır →')}${txt(230,170,'galvanik İZOLASYON')}
      ${txt(230,192,'SMPS feedback, dijital izolasyon')}
    `) },

    /* ------------------- TRİYAK / TRİSTÖR -------------------------- */
    thyristors: { cat: "Yarıiletken", t: "Tristör (SCR) ve Triyak — tetikleme bacaklı", g: sv(460, 210, `
      ${txt(110,26,'SCR (tristör)')}
      ${ln(40,80,100,80)}<polygon points="100,60 100,100 140,80" fill="${T}"/><line x1="140" y1="55" x2="140" y2="105" stroke="${T}" stroke-width="3"/>${ln(140,80,220,80)}
      ${ln(120,100,110,120)}${txt(90,138,'G (gate)',AMB,12)}${txt(70,70,'A',GRN,12)}${txt(200,70,'K',RED,12)}
      ${txt(110,178,'Gate tetiklenince iletir;')}${txt(110,196,'akım kesilene kadar kalır.',MUT,11)}
      ${ln(240,10,240,200,MUT,1)}
      ${txt(360,26,'TRİYAK')}
      ${ln(290,70,340,70)}<polygon points="340,55 340,85 370,70" fill="${T}"/><line x1="370" y1="50" x2="370" y2="90" stroke="${T}" stroke-width="3"/>${ln(370,70,440,70)}
      <polygon points="370,90 370,120 340,105" fill="${T}"/><line x1="340" y1="95" x2="340" y2="115" stroke="${T}" stroke-width="3"/>${ln(340,105,290,105)}${ln(370,105,440,105)}
      ${txt(355,140,'G',AMB,12)}
      ${txt(360,178,'İki yönde iletir.')}${txt(360,196,'AC kontrol, dimmer.',MUT,11)}
    `) },

    /* ------------------- KRİSTAL -------------------------------- */
    crystal: { cat: "Bileşenler", t: "Kristal osilatör — 2 bacaklı, MCU saati", g: sv(420, 190, `
      ${ln(50,80,120,80)}<line x1="120" y1="55" x2="120" y2="105" stroke="${T}" stroke-width="3"/><rect x="138" y="58" width="34" height="44" fill="#1b2534" stroke="${T}" stroke-width="2"/><line x1="190" y1="55" x2="190" y2="105" stroke="${T}" stroke-width="3"/>${ln(190,80,280,80)}
      ${txt(210,150,'MCU saat üretir. Sinyal yoksa çip çalışmaz.')}
      ${txt(210,172,'Osiloskopla 10x probla ölçülür.')}
    `) },

    /* ------------------- BOOST -------------------------------- */
    boost: { cat: "Güç", t: "Boost dönüştürücü — yükseltici", g: sv(500, 210, `
      ${txt(40,110,'Vin',GRN,12)}${ln(60,100,90,100)}
      <path d="M90,100 a14,14 0 0 1 28,0" fill="none" stroke="${T}" stroke-width="2"/>${txt(104,138,'L',T,12)}
      ${ln(118,100,170,100)}
      <rect x="155" y="78" width="6" height="44" fill="${T}"/><rect x="179" y="78" width="6" height="44" fill="${T}"/>${txt(170,138,'C',T,12)}
      ${ln(170,100,170,78)}${ln(130,100,130,150)}${ci(130,150,3,AMB)}
      ${rc(110,150,40,30,'#2a2030',RED,4)}${txt(130,170,'SW',RED,11)}
      ${ln(130,180,130,200)}${ln(130,150,170,150)}${ln(170,150,200,150)}
      <polygon points="200,140 240,140 220,160" fill="${T}" transform="rotate(90 220 150)"/>${txt(220,175,'D',T,12)}
      ${ln(170,122,170,150)}${ln(170,150,200,150)}
      ${ln(230,150,230,90)}${ln(230,90,300,90)}
      ${rc(300,70,40,40,'#1b2534','#cdd9e8',4)}${txt(320,95,'Yük',T,11)}
      ${ln(300,90,300,120)}${ln(320,110,320,150)}${ln(230,150,320,150)}${ln(170,200,320,200)}${ln(320,110,320,200)}
      ${txt(140,45,'Vout > Vin (Duty ile ayarlanır)',AMB,12)}
    `) },

    /* ------------------- TAM DALGA DOĞRULTMA ------------------------ */
    fullwave: { cat: "Güç", t: "Tam dalga (köprü) doğrultma + filtre", g: sv(500, 210, `
      ${txt(60,30,'AC giriş')}${ln(30,60,60,60)}${ln(60,60,60,120)}
      <polygon points="200,40 300,100 200,160 100,100" fill="none" stroke="${T}" stroke-width="1.5"/>
      ${txt(200,32,'~',AMB,16)}${txt(320,104,'+',GRN,16)}${txt(80,104,'−',RED,16)}
      ${ln(60,60,100,100)}${ln(300,100,360,100)}
      ${ln(360,100,360,60)}<rect x="342" y="60" width="6" height="34" fill="${T}"/><rect x="366" y="60" width="6" height="34" fill="${T}"/>${txt(360,112,'C (filtre)',T,11)}
      ${ln(360,94,360,140)}${rc(400,120,50,40,'#1b2534','#cdd9e8',4)}${txt(425,145,'Yük',T,11)}
      ${ln(360,100,425,100)}${ln(425,100,425,120)}${ln(425,160,360,160)}${ln(360,160,360,140)}
      ${txt(200,190,'Her iki yarım dalga kullanılır; C çıkışı düzler.')}
    `) },

    /* ------------------- H-KÖPRÜ -------------------------------- */
    hbridge: { cat: "Güç", t: "H-köprü — motor ileri/geri sürme", g: sv(460, 220, `
      ${ln(60,40,400,40)}${ln(60,180,400,180)}
      ${txt(60,30,'+',GRN,14)}${txt(400,30,'+',GRN,14)}${txt(60,200,'−',RED,14)}${txt(400,200,'−',RED,14)}
      ${rc(100,30,60,30,'#1b2534','#cdd9e8',4)}${txt(130,20,'S1',T,11)}
      ${rc(300,30,60,30,'#1b2534','#cdd9e8',4)}${txt(330,20,'S3',T,11)}
      ${rc(100,160,60,30,'#1b2534','#cdd9e8',4)}${txt(130,205,'S2',T,11)}
      ${rc(300,160,60,30,'#1b2534','#cdd9e8',4)}${txt(330,205,'S4',T,11)}
      ${ln(130,60,130,160)}${ln(330,60,330,160)}
      ${ci(230,110,26,'#1b2534',T)}${txt(230,114,'M',T,16)}
      ${ln(130,110,204,110)}${ln(256,110,330,110)}
      ${txt(230,150,'S1+S4 → ileri  ·  S2+S3 → geri')}
      ${txt(230,178,'DC motor yön kontrolü (shoot-through\'a dikkat)')}
    `) },

    /* ------------------- NON-INVERTING OPAMP ------------------------ */
    opampNon: { cat: "Analog", t: "Op-amp yükselteç — kazanç = 1 + Rf/Rin", g: sv(440, 210, `
      <polygon points="140,50 140,170 280,110" fill="#1b2534" stroke="${T}" stroke-width="2"/>
      ${txt(155,95,'−',RED,16)}${txt(155,140,'+',GRN,16)}
      ${ln(60,90,140,90)}${ln(280,110,360,110)}${txt(345,100,'Vout',T,12)}
      ${ln(60,140,110,140)}${ci(110,140,3,AMB)}${ln(110,140,140,140)}
      ${ln(110,140,110,190)}${ln(60,190,110,190)}${rc(30,180,30,20,'#d9c9a3','#9c8a5f',3)}${txt(45,175,'Rin',T,11)}
      ${ln(110,140,110,60)}${ln(110,60,380,60)}${rc(300,50,50,20,'#d9c9a3','#9c8a5f',3)}${txt(325,45,'Rf',T,11)}
      ${ln(380,60,380,110)}${ci(380,60,3,AMB)}
      ${txt(210,205,'Giriş işareti büyütülür; çıkış fazı aynıdır.',MUT,11)}
    `) },

    /* ======================= EK DEVRE ŞEMALARI ====================== */

    buckboost: { cat: "Güç", t: "Buck-Boost dönüştürücü — yükseltir & düşürür (Vout ters)", g: sv(520, 210, `
      ${txt(30,80,'Vin',GRN,12)}${ln(50,70,80,70)}
      <rect x="80" y="55" width="46" height="30" rx="4" fill="#2a2030" stroke="${RED}" stroke-width="2"/>${txt(103,75,'SW',RED,11)}
      ${ln(126,70,175,70)}${ci(175,70,3,AMB)}
      <path d="M162,110 a13,13 0 0 1 26,0" fill="none" stroke="${T}" stroke-width="2"/>${ln(175,70,175,97)}${ln(175,123,175,150)}${txt(150,140,'L',T,12)}
      ${ln(175,70,215,70)}<polygon points="215,58 215,82 240,70" fill="${T}"/><line x1="240" y1="55" x2="240" y2="85" stroke="${T}" stroke-width="3"/>${ln(240,70,320,70)}
      ${ln(280,70,280,110)}<rect x="272" y="110" width="6" height="30" fill="${T}"/><rect x="296" y="110" width="6" height="30" fill="${T}"/>${txt(284,158,'C',T,12)}
      ${ln(304,125,360,125)}${rc(330,105,46,40,'#1b2534','#cdd9e8',4)}${txt(353,130,'Yük',T,11)}
      ${ln(320,70,353,70)}${ln(353,70,353,105)}${ln(353,145,353,175)}${ln(175,150,353,175)}${ln(353,175,175,175)}${ln(175,150,175,175)}
      ${txt(200,45,'Vout = −Vin × D/(1−D)',AMB,13)}
      ${txt(260,200,'Çıkış polaritesi girişe GÖRE TERS (−)')}
    `) },

    flyback: { cat: "Güç", t: "Flyback SMPS — anahtarlama, izolasyon, feedback", g: sv(540, 220, `
      ${txt(20,90,'AC/DC',MUT,11)}${ln(55,80,90,80)}
      ${ln(110,60,110,140)}${ln(130,60,130,140)}${rc(112,52,18,96,'#243','none',3)}
      ${ln(130,80,170,80)}
      <rect x="150" y="65" width="40" height="30" rx="4" fill="#2a2030" stroke="${RED}" stroke-width="2"/>${txt(170,85,'SW',RED,11)}
      ${ln(170,95,170,150)}${ln(90,150,170,150)}${ln(90,80,90,150)}
      ${ln(80,150,95,150)}${ln(88,158,98,158)}${ln(84,164,94,164)}
      ${ln(135,60,135,25)}${ln(175,25,175,80)}${ln(175,25,175,60)}${ln(175,80,175,80)}
      <path d="M150,20 l10,-14 M162,26 l10,-14" stroke="${AMB}" stroke-width="2" fill="none"/>
      ${txt(255,40,'trafo (izolasyon)',MUT,11)}
      ${ln(175,25,235,25)}<polygon points="235,14 235,36 260,25" fill="${T}"/><line x1="260" y1="12" x2="260" y2="38" stroke="${T}" stroke-width="3"/>${ln(260,25,360,25)}
      ${ln(320,25,320,60)}<rect x="312" y="60" width="6" height="28" fill="${T}"/><rect x="336" y="60" width="6" height="28" fill="${T}"/>${txt(324,104,'C',T,12)}
      ${rc(380,10,60,40,'#1b2534','#cdd9e8',4)}${txt(410,35,'Yük',T,11)}${ln(360,25,380,25)}${ln(380,30,380,30)}
      ${ln(440,30,440,10)}${ln(440,10,320,10)}${ln(320,10,320,25)}${ln(175,80,320,88)}${ln(320,88,320,88)}
      ${ln(360,88,440,88)}${ln(320,88,360,88)}${ln(440,50,440,88)}${ln(440,88,320,88)}
      <path d="M440,88 L440,170 L170,170 L170,150" fill="none" stroke="${AMB}" stroke-width="2"/>
      ${txt(300,165,'Feedback (optokuplör) → çıkışı sabit tutar',AMB,11)}
    `) },

    zenerReg: { cat: "Güç", t: "Zener regülatör — basit gerilim sabitleme", g: sv(460, 200, `
      ${txt(30,80,'Vin',GRN,12)}${ln(50,70,90,70)}${rc(90,58,44,24,'#d9c9a3','#9c8a5f',3)}${txt(112,52,'Rs',T,11)}${ln(134,70,230,70)}
      ${ci(230,70,3,AMB)}${ln(230,70,230,110)}
      <polygon points="230,110 230,140 265,125" fill="${T}" transform="rotate(-90 247 125)"/>
      <path d="M210,110 l0,30 m0,-30 l-12,-8 m0,46 l12,8" fill="none" stroke="${T}" stroke-width="3"/>
      ${ln(230,140,230,160)}${ln(210,160,250,160)}${ln(220,167,240,167)}
      ${ln(230,70,380,70)}${txt(330,62,'Vout ≈ Vz',GRN,12)}
      ${rc(320,80,50,40,'#1b2534','#cdd9e8',4)}${txt(345,105,'Yük',T,11)}${ln(345,70,345,80)}${ln(345,120,345,160)}${ln(230,160,345,160)}
      ${txt(230,190,'Fazla gerilim Rs ve zener üzerinde düşer. Küçük yükler için.')}
    `) },

    linearReg: { cat: "Güç", t: "Lineer regülatör devresi (7805) — giriş/çıkış kondansatörleri", g: sv(500, 200, `
      ${txt(20,90,'Vin',GRN,12)}${ln(50,80,90,80)}
      <rect x="95" y="55" width="6" height="50" fill="${T}"/>${ln(101,80,150,80)}
      ${rc(150,60,120,60,'#1b2534','#cdd9e8',6)}${txt(210,85,'7805',T,16)}${txt(210,105,'IN  GND  OUT',MUT,10)}
      ${ln(270,80,360,80)}
      <rect x="365" y="55" width="6" height="50" fill="${T}"/>${ln(270,115,270,150)}
      ${ln(210,120,210,150)}${ln(101,130,101,150)}${ln(101,150,210,150)}${ln(210,150,270,150)}${ln(270,150,365,150)}${ln(365,150,365,105)}
      ${txt(415,86,'Vout',GRN,12)}${ln(370,80,430,80)}
      ${txt(180,180,'Giriş ve çıkışa kondansatör şart (salınımı önler).',MUT,11)}
    `) },

    voltDoubler: { cat: "Güç", t: "Gerilim katlayıcı (voltage doubler)", g: sv(500, 210, `
      ${txt(40,60,'AC giriş',AMB,11)}${ln(30,90,70,90)}<path d="M50,90 q12,-24 24,0 q12,24 24,0" fill="none" stroke="${AMB}" stroke-width="2" transform="translate(-20,0)"/>${ln(70,90,110,90)}${ci(110,90,3,AMB)}
      ${ln(110,40,110,140)}
      <polygon points="110,40 140,40 125,62" fill="${T}"/>${ln(110,70,160,70)}
      ${ln(140,40,140,40)}
      <polygon points="125,88 110,110 140,110" fill="${T}" transform="rotate(180 125 99)"/>
      ${ln(110,110,160,110)}
      ${ln(160,70,240,70)}<rect x="240" y="55" width="6" height="30" fill="${T}"/><rect x="264" y="55" width="6" height="30" fill="${T}"/>${ln(260,70,260,110)}
      <rect x="240" y="110" width="6" height="30" fill="${T}"/><rect x="264" y="110" width="6" height="30" fill="${T}"/>
      ${ln(160,110,240,110)}${ln(270,70,360,70)}${ln(270,110,360,110)}
      ${txt(310,50,'Vout ≈ 2 × Vtepe',GRN,12)}
      ${rc(360,80,60,40,'#1b2534','#cdd9e8',4)}${txt(390,105,'Yük',T,11)}${ln(360,70,360,80)}${ln(390,80,390,120)}${ln(360,120,390,120)}
      ${txt(250,190,'İki diyot + iki kondansatör gerilimi ikiye katlar.')}
    `) },

    opampInv: { cat: "Analog", t: "Op-amp ters çeviren yükselteç — kazanç = −Rf/Rin", g: sv(460, 200, `
      <polygon points="150,55 150,165 280,110" fill="#1b2534" stroke="${T}" stroke-width="2"/>
      ${txt(165,95,'−',RED,16)}${txt(165,140,'+',GRN,16)}
      ${ln(60,90,110,90)}${rc(60,80,44,20,'#d9c9a3','#9c8a5f',3)}${txt(82,74,'Rin',T,11)}${ci(110,90,3,AMB)}${ln(110,90,150,90)}
      ${ln(110,90,110,145)}${ln(60,145,110,145)}${ln(60,145,60,175)}${ln(40,175,80,175)}
      ${ln(110,90,110,35)}${ln(110,35,360,35)}${rc(280,25,50,20,'#d9c9a3','#9c8a5f',3)}${txt(305,20,'Rf',T,11)}
      ${ln(360,35,360,110)}${ci(360,35,3,AMB)}
      ${ln(60,145,60,175)}${txt(90,150,'GND',MUT,11)}
      ${ln(150,140,120,140)}${ln(120,140,120,145)}
      ${ln(280,110,400,110)}${txt(370,100,'Vout',T,12)}
      ${txt(210,195,'Giriş sinyalinin ters çevrilmiş büyütülmüş hali.',MUT,11)}
    `) },

    sallenkey: { cat: "Analog", t: "Sallen-Key aktif alçak geçiren filtre (2. derece)", g: sv(500, 210, `
      ${txt(20,80,'Vin',AMB,12)}${ln(40,70,80,70)}${rc(80,60,44,20,'#d9c9a3','#9c8a5f',3)}${txt(102,52,'R1',T,11)}${ci(124,70,3,AMB)}
      ${ln(124,70,210,70)}${rc(210,60,44,20,'#d9c9a3','#9c8a5f',3)}${txt(232,52,'R2',T,11)}${ci(254,70,3,AMB)}${ln(254,70,300,70)}
      <polygon points="300,45 300,135 400,90" fill="#1b2534" stroke="${T}" stroke-width="2"/>
      ${txt(312,80,'−',RED,15)}${txt(312,110,'+',GRN,15)}
      ${ln(400,90,470,90)}${txt(450,80,'Vout',T,11)}
      ${ln(124,70,124,90)}<rect x="114" y="90" width="30" height="6" fill="${T}"/>${ln(124,96,124,130)}${ln(124,130,124,150)}${ln(104,150,144,150)}${ln(114,157,134,157)}
      ${ln(254,70,300,70)}${ln(254,70,254,40)}${ln(254,40,430,40)}${ln(430,40,430,90)}
      <rect x="330" y="36" width="6" height="18" fill="${T}"/><rect x="350" y="36" width="6" height="18" fill="${T}"/>${ln(300,45,300,45)}
      ${ln(320,45,330,45)}${ln(356,45,392,45)}
      ${txt(200,195,'İki direnç + iki kondansatör → dik geçişli alçak geçiren filtre (ADC öncesi).',MUT,11)}
    `) },

    lcFilter: { cat: "Analiz", t: "LC alçak geçiren filtre — yüksek frekansı süzer", g: sv(460, 180, `
      ${txt(20,80,'Vin',AMB,12)}${ln(40,70,90,70)}
      <path d="M90,70 a14,14 0 0 1 28,0 a14,14 0 0 1 28,0" fill="none" stroke="${T}" stroke-width="2"/>${txt(118,45,'L',T,12)}
      ${ln(146,70,250,70)}${ci(250,70,3,AMB)}
      <rect x="242" y="90" width="6" height="34" fill="${T}"/><rect x="266" y="90" width="6" height="34" fill="${T}"/>${txt(256,140,'C',T,12)}
      ${ln(250,70,250,90)}${ln(250,124,250,150)}${ln(230,150,270,150)}${ln(240,157,260,157)}
      ${ln(250,70,360,70)}${txt(340,60,'Vout',GRN,12)}
      ${txt(230,175,'Bobin DC\'yi geçirir, kondansatör yüksek frekansı toprağa atar.')}
    `) },

    wheatstone: { cat: "Analiz", t: "Wheatstone köprüsü — hassas direnç ölçümü", g: sv(440, 210, `
      <polygon points="220,40 340,120 220,200 100,120" fill="none" stroke="${T}" stroke-width="1.5"/>
      ${rc(200,55,40,18,'#d9c9a3','#9c8a5f',3)}${txt(220,50,'R1',T,11)}
      ${rc(200,160,40,18,'#d9c9a3','#9c8a5f',3)}${txt(220,192,'R3',T,11)}
      ${rc(120,110,40,18,'#d9c9a3','#9c8a5f',3)}${txt(112,105,'R2',T,11)}
      ${rc(280,110,40,18,'#d9c9a3','#9c8a5f',3)}${txt(330,105,'R4',T,11)}
      ${txt(220,25,'+',GRN,14)}${txt(220,220,'−',RED,14)}
      ${ci(220,120,4,AMB)}${ln(220,120,150,150)}${txt(120,165,'V çıkış ≈ 0',AMB,11)}
      ${txt(220,235,'Denge hâlinde R1/R2 = R3/R4. Sensör/köprü devrelerinin temeli.',MUT,10)}
    `) },

    ne555astable: { cat: "Dijital", t: "NE555 astable — kare dalga (osilatör) üretir", g: sv(500, 210, `
      ${rc(180,60,120,110,'#1b2534','#cdd9e8',6)}${txt(240,80,'555',T,16)}
      ${txt(200,105,'1 GND',MUT,10)}${txt(200,122,'2 TRIG',MUT,10)}${txt(200,139,'3 OUT',MUT,10)}${txt(200,156,'4 RESET',MUT,10)}
      ${txt(280,105,'8 Vcc',MUT,10,'end')}${txt(280,122,'7 DIS',MUT,10,'end')}${txt(280,139,'6 THR',MUT,10,'end')}${txt(280,156,'5 CTRL',MUT,10,'end')}
      ${ln(180,90,120,90)}${txt(60,94,'Vcc',GRN,12)}${rc(120,80,44,20,'#d9c9a3','#9c8a5f',3)}${ln(164,90,180,90)}
      ${ln(300,90,360,90)}${txt(370,94,'Vcc',MUT,11)}
      ${ln(130,90,130,50)}${ln(130,50,300,50)}${ln(300,50,300,90)}
      ${ln(300,105,360,105)}${rc(360,95,44,20,'#d9c9a3','#9c8a5f',3)}${txt(382,90,'R2',T,11)}${ci(340,105,3,AMB)}
      ${ln(340,105,340,140)}<rect x="330" y="140" width="6" height="26" fill="${T}"/><rect x="354" y="140" width="6" height="26" fill="${T}"/>${ln(330,166,330,180)}${ln(310,180,350,180)}
      ${ln(300,105,300,140)}${ln(300,140,330,140)}
      ${ln(300,150,360,150)}${txt(370,146,'OUT',GRN,11)}${ln(360,150,360,150)}
      ${txt(250,200,'Frekans: R1, R2 ve C ile ayarlanır.',MUT,11)}
    `) },

    resetCircuit: { cat: "Dijital", t: "MCU reset devresi (RC + buton)", g: sv(460, 200, `
      ${txt(40,50,'VDD',GRN,12)}${ln(60,60,60,90)}${rc(60,90,44,20,'#d9c9a3','#9c8a5f',3)}${txt(82,84,'R',T,11)}${ln(104,100,200,100)}
      ${ci(200,100,3,AMB)}${txt(220,96,'NRST',AMB,12)}
      ${rc(320,80,60,40,'#1b2534','#cdd9e8',4)}${txt(350,105,'MCU',T,12)}
      ${ln(320,100,300,100)}${ln(200,100,300,100)}
      ${ln(200,100,200,130)}<rect x="190" y="130" width="6" height="26" fill="${T}"/><rect x="214" y="130" width="6" height="26" fill="${T}"/>${ln(200,156,200,175)}${ln(180,175,220,175)}${ln(190,182,210,182)}
      <rect x="120" y="120" width="36" height="26" rx="4" fill="#1b2534" stroke="${T}" stroke-width="2"/>${txt(138,137,'buton',T,10)}
      ${ln(156,133,200,133)}${ln(120,133,90,133)}${ln(90,100,90,133)}${txt(60,128,'SW',MUT,11)}
      ${txt(230,195,'Reset pini düşük seviyede çipi sıfırlar.',MUT,11)}
    `) },

    crystalCircuit: { cat: "Dijital", t: "Kristal bağlantısı (MCU saat) + yük kondansatörleri", g: sv(480, 200, `
      ${rc(300,60,120,90,'#1b2534','#cdd9e8',6)}${txt(360,100,'MCU',T,14)}${txt(360,120,'XTAL',MUT,11)}
      ${ln(300,80,240,80)}${txt(230,76,'OSC1',MUT,11,'end')}${ln(300,120,240,120)}${txt(230,116,'OSC2',MUT,11,'end')}
      ${ln(240,80,200,80)}<line x1="200" y1="60" x2="200" y2="100" stroke="${T}" stroke-width="3"/><rect x="184" y="66" width="6" height="28" fill="#1b2534" stroke="${T}" stroke-width="2"/><line x1="184" y1="60" x2="184" y2="120" stroke="${T}" stroke-width="3"/>
      <rect x="178" y="86" width="40" height="8" fill="${T}"/>
      ${txt(200,150,'kristal',MUT,11)}
      ${ln(200,80,200,80)}${ln(200,120,200,120)}
      <rect x="150" y="80" width="6" height="34" fill="${T}"/><rect x="174" y="80" width="6" height="34" fill="${T}"/><rect x="198" y="80" width="6" height="34" fill="${T}"/><rect x="222" y="80" width="6" height="34" fill="${T}"/>
      ${ln(153,114,153,160)}${ln(153,160,153,160)}
      ${ln(153,114,153,150)}${ln(153,150,153,150)}${ln(133,150,173,150)}${ln(143,157,163,157)}
      ${txt(230,190,'Kristal + 2 kondansatör (yük kap.) osilatörü kurar. Sinyal yoksa MCU çalışmaz.',MUT,10)}
    `) },

    transistorSwitch: { cat: "Dijital", t: "NPN transistör anahtarı — röle/LED sürme", g: sv(480, 220, `
      ${txt(40,45,'VCC',GRN,12)}${ln(60,55,60,70)}
      ${rc(200,55,70,40,'#1b2534','#cdd9e8',4)}${txt(235,80,'Yük',T,11)}${ln(60,55,200,55)}${ln(270,55,270,55)}
      ${ln(235,95,235,120)}${txt(235,120,'C',RED,12)}
      <circle cx="180" cy="150" r="30" fill="none" stroke="${T}" stroke-width="2"/>
      ${ln(160,130,160,170,T,4)}${ln(160,140,205,120)}${ln(160,160,205,180)}
      <polygon points="205,180 192,182 196,170" fill="${T}"/>
      ${txt(150,145,'B',AMB,12)}
      ${ln(270,55,270,55)}${ln(235,95,235,130)}${ln(235,130,235,130)}
      <polygon points="235,100 235,100 235,100" fill="none"/>
      ${ln(235,100,235,130)}${ln(235,130,205,180)}
      ${ln(160,150,120,150)}${rc(80,140,44,20,'#d9c9a3','#9c8a5f',3)}${txt(102,134,'Rb',T,11)}${ln(40,150,80,150)}${txt(20,154,'GPIO',MUT,11)}
      ${ln(160,170,160,195)}${ln(140,195,180,195)}${ln(150,202,170,202)}
      ${ln(270,55,270,55)}
      ${txt(360,120,'VCC→yük→C, emitter GND. Küçük I_B büyük I_C\'yi açar.',MUT,10)}
      ${txt(360,145,'Rölede bobin paraleline flyback diyot!',RED,10)}
    `) },

    mosfetSwitch: { cat: "Dijital", t: "MOSFET anahtarı (low-side) — gate direnci + pull-down", g: sv(480, 220, `
      ${txt(40,45,'VCC',GRN,12)}${ln(60,55,60,70)}
      ${rc(200,55,70,40,'#1b2534','#cdd9e8',4)}${txt(235,80,'Yük',T,11)}${ln(60,55,200,55)}
      ${ln(235,95,235,120)}${txt(235,120,'D',RED,12)}
      ${ln(300,120,300,180,T,3)}${ln(280,110,300,110)}${ln(280,130,300,130)}${ln(280,150,300,150)}${ln(280,170,300,170)}
      ${ln(235,130,280,150)}${ln(235,120,235,130)}
      ${ln(280,150,240,190)}${txt(240,205,'S',AMB,12)}
      ${ln(300,150,340,150)}${txt(330,145,'G',GRN,12)}
      ${ln(340,150,380,150)}${rc(340,140,40,20,'#d9c9a3','#9c8a5f',3)}${ln(300,150,300,150)}
      ${ln(380,150,420,150)}${txt(425,154,'GPIO',MUT,11)}
      ${rc(360,180,40,20,'#d9c9a3','#9c8a5f',3)}${ln(360,190,360,150)}${txt(378,175,'Rpd',T,10)}${ln(360,200,360,210)}${ln(340,210,380,210)}${ln(350,217,370,217)}
      ${ln(300,150,360,150)}
      ${txt(200,215,'Gate direnci + pull-down şart. Arıza: D-S kısa.',MUT,10)}
    `) },

    powerSyms: { cat: "Dijital", t: "Sema sembolleri — GND, VCC, toprak, bağlantı noktası", g: sv(480, 190, `
      ${txt(80,30,'GND (şase)')}${ln(60,50,100,50)}${ln(70,50,70,70)}${ln(50,70,90,70)}${ln(60,78,80,78)}${ln(65,85,75,85)}
      ${txt(230,30,'VCC / VDD')}${ln(210,50,210,80)}${ln(200,40,220,40)}${txt(212,38,'+',GRN,12)}
      ${txt(380,30,'Toprak (earth)')}${ln(360,50,360,70)}${ln(340,70,380,70)}${ln(348,78,372,78)}${ln(356,86,364,86)}
      ${txt(80,120,'Bağlantı noktası')}${ci(80,150,5,AMB)}${ln(40,150,120,150)}${ln(80,130,80,170)}
      ${txt(230,120,'Net etiketi')}${ln(190,150,270,150)}${txt(230,140,'VCC',AMB,11)}
      ${txt(380,120,'Köşe / tel')}${ln(360,140,400,140)}${ln(400,140,400,170)}
      ${txt(240,185,'Şemada aynı isimli net etiketleri elektriksel olarak bağlıdır.',MUT,10)}
    `) },

    packages: { cat: "Dijital", t: "Entegre paketleri ve pin numaralandırma", g: sv(520, 220, `
      ${txt(80,24,'DIP (ör. 8 bacak)')}
      <rect x="30" y="40" width="110" height="70" rx="5" fill="#1b2534" stroke="${T}" stroke-width="2"/>
      <path d="M70,40 a15,12 0 0 0 30,0" fill="none" stroke="${T}" stroke-width="2"/>
      ${txt(85,58,'1●',MUT,10)}
      ${ln(40,40,40,25)}${ln(60,40,60,25)}${ln(80,40,80,25)}${ln(100,40,100,25)}
      ${ln(40,110,40,125)}${ln(60,110,60,125)}${ln(80,110,80,125)}${ln(100,110,100,125)}
      ${txt(85,145,'pin 1 = köşe',MUT,10)}
      ${txt(300,24,'TO-220 (güç)')}
      <rect x="260" y="45" width="90" height="60" rx="5" fill="#1b2534" stroke="${T}" stroke-width="2"/>
      ${txt(305,80,'metal sekme',MUT,10)}
      ${ln(280,105,280,130)}${ln(305,105,305,130)}${ln(330,105,330,130)}
      ${txt(280,145,'1')}${txt(305,145,'2')}${txt(330,145,'3')}
      ${txt(300,168,'bacaklar: G/D/S veya B/C/E',MUT,10)}
      ${ln(420,20,420,200,MUT,1)}
      ${txt(470,40,'SOT-23 (SMD)')}
      <rect x="440" y="55" width="60" height="45" rx="4" fill="#1b2534" stroke="${T}" stroke-width="2"/>
      ${ln(445,55,445,40)}${ln(470,55,470,40)}${ln(495,100,495,115)}
      ${txt(470,88,'SMD',MUT,10)}
      ${txt(470,150,'1● köşesi',MUT,10)}
      ${txt(260,205,'Kart üzerinde pin 1 genelde nokta/çentik ile işaretlidir.',MUT,10)}
    `) },

    /* ==================== İLERİ DEVRELER ============================ */

    halfBridge: { cat: "Güç", t: "Yarım köprü + gate driver + bootstrap", g: sv(540, 230, `
      ${txt(20,40,'V+ bus',GRN,12)}${ln(60,50,470,50)}
      ${rc(150,60,70,40,'#2a2030',RED,4)}${txt(185,84,'Q1 (HS)',RED,11)}${ln(185,50,185,60)}
      ${ln(185,100,185,125)}${ci(185,125,4,AMB)}${txt(205,122,'çıkış A',AMB,11)}
      ${rc(150,135,70,40,'#2a2030',RED,4)}${txt(185,159,'Q2 (LS)',RED,11)}${ln(185,125,185,135)}
      ${ln(185,175,185,205)}${ln(160,205,210,205)}${ln(172,212,198,212)}
      ${ln(185,125,360,125)}${rc(360,105,70,40,'#1b2534','#cdd9e8',4)}${txt(395,130,'Yük',T,11)}${ln(395,145,395,205)}${ln(185,205,395,205)}
      ${rc(40,80,80,80,'#1b2534','#cdd9e8',6)}${txt(80,116,'Gate',T,10)}${txt(80,130,'Driver',T,10)}
      ${ln(120,95,150,80)}${ln(120,145,150,155)}
      ${ln(280,50,300,50)}<polygon points="300,42 300,58 314,50" fill="${T}"/><line x1="314" y1="40" x2="314" y2="60" stroke="${T}" stroke-width="2"/>${ln(314,50,340,50)}${ln(340,50,340,90)}
      <rect x="332" y="90" width="6" height="26" fill="${T}"/><rect x="352" y="90" width="6" height="26" fill="${T}"/><rect x="340" y="80" width="10" height="6" fill="${T}"/>
      ${ln(340,116,340,150)}${ln(340,150,300,150)}${ln(300,150,300,150)}
      ${txt(300,175,'bootstrap: D + C (HS gate beslemesi)',AMB,11)}
      ${txt(360,205,'Q1+Q2 çakışırsa shoot-through → yanar. Dead-time şart.',MUT,10)}
    `) },

    inverter: { cat: "Güç", t: "İnverter (DC → AC) — H-köprü + LC filtre", g: sv(560, 220, `
      ${txt(20,80,'DC',GRN,11)}${ln(40,70,80,70)}${ln(40,110,80,110)}
      ${rc(80,40,60,26,'#1b2534','#cdd9e8',4)}${txt(110,30,'Q1',T,10)}${rc(200,40,60,26,'#1b2534','#cdd9e8',4)}${txt(230,30,'Q3',T,10)}
      ${rc(80,120,60,26,'#1b2534','#cdd9e8',4)}${txt(110,158,'Q2',T,10)}${rc(200,120,60,26,'#1b2534','#cdd9e8',4)}${txt(230,158,'Q4',T,10)}
      ${ln(80,70,80,40)}${ln(140,53,200,53)}${ln(80,66,80,66)}
      ${ln(110,66,110,120)}${ln(230,53,260,53)}${ln(230,133,260,133)}${ln(80,70,80,66)}${ln(140,53,140,40)}${ln(140,40,200,40)}
      ${ln(80,133,110,133)}${ln(110,146,110,146)}${ln(80,133,80,133)}${ln(140,133,200,133)}${ln(80,120,80,133)}
      ${txt(170,95,'H-köprü',MUT,10)}
      ${ln(260,53,340,53)}<path d="M340,53 a12,12 0 0 1 24,0" fill="none" stroke="${T}" stroke-width="2"/>${txt(352,40,'L',T,11)}${ln(364,53,420,53)}
      <rect x="420" y="70" width="6" height="30" fill="${T}"/><rect x="444" y="70" width="6" height="30" fill="${T}"/>${txt(432,115,'C',T,11)}${ln(432,53,432,70)}${ln(432,100,432,120)}
      ${rc(360,120,70,40,'#1b2534','#cdd9e8',4)}${txt(395,145,'AC Yük',T,11)}${ln(420,53,395,53)}${ln(395,53,395,120)}${ln(395,160,432,160)}${ln(260,133,432,133)}${ln(432,133,432,160)}
      <path d="M470,60 q12,-26 24,0 q12,26 24,0 q12,-26 24,0" fill="none" stroke="${AMB}" stroke-width="2"/>
      ${txt(505,120,'çıkış ~ sinüs',AMB,11)}
      ${txt(280,200,'Anahtarlama + filtre → ~220V AC. Feedback ile gerilim/frekans sabitlenir.',MUT,10)}
    `) },

    opampIntegrator: { cat: "Analog", t: "Op-amp integral alıcı — çıkış = girişin integrali", g: sv(460, 200, `
      <polygon points="150,55 150,165 280,110" fill="#1b2534" stroke="${T}" stroke-width="2"/>
      ${txt(165,95,'−',RED,16)}${txt(165,140,'+',GRN,16)}
      ${ln(60,90,110,90)}${rc(60,80,44,20,'#d9c9a3','#9c8a5f',3)}${txt(82,74,'Rin',T,11)}${ci(110,90,3,AMB)}${ln(110,90,150,90)}
      ${ln(110,90,110,35)}${ln(110,35,360,35)}
      <rect x="250" y="30" width="6" height="10" fill="${T}"/><rect x="270" y="30" width="6" height="10" fill="${T}"/>
      ${ln(200,35,250,35)}${ln(276,35,340,35)}${txt(258,24,'C',T,11)}
      ${ln(360,35,360,110)}${ci(360,35,3,AMB)}
      ${ln(60,140,110,140)}${ln(110,140,110,140)}${ln(110,140,110,170)}${ln(90,170,130,170)}${ln(100,177,120,177)}
      ${ln(280,110,400,110)}${txt(370,100,'Vout',T,12)}
      ${txt(210,195,'Kare dalga girer → üçgen dalga çıkar. İntegral/dönüştürücü devrelerinde.',MUT,11)}
    `) },

    schmitt: { cat: "Analog", t: "Schmitt trigger (histerezisli karşılaştırıcı)", g: sv(520, 210, `
      <polygon points="120,55 120,165 250,110" fill="#1b2534" stroke="${T}" stroke-width="2"/>
      ${txt(135,95,'−',RED,16)}${txt(135,140,'+',GRN,16)}
      ${ln(40,90,120,90)}${txt(30,86,'Vin',MUT,11,'end')}
      ${ln(120,140,160,140)}${ci(160,140,3,AMB)}${ln(160,140,160,185)}${ln(120,185,200,185)}${ln(160,185,160,185)}
      ${ln(120,140,120,140)}${ln(160,140,160,140)}
      ${ln(160,140,160,140)}
      ${ln(250,110,400,110)}${txt(370,100,'Vout',T,12)}
      ${ln(360,110,360,60)}${rc(230,50,90,20,'#d9c9a3','#9c8a5f',3)}${txt(275,44,'R2',T,11)}${ln(320,60,360,60)}
      ${rc(420,80,46,20,'#d9c9a3','#9c8a5f',3)}${txt(443,74,'R1',T,11)}${ln(400,110,420,110)}${ln(466,90,466,110)}${ln(466,110,466,110)}
      ${ln(400,110,400,110)}
      ${txt(210,200,'Pozitif geri besleme: iki eşik → girişteki gürültüye bağışıklı sinyal.',MUT,10)}
    `) },

    currentSource: { cat: "Analog", t: "Sabit akım kaynağı (transistörlü)", g: sv(460, 200, `
      ${txt(30,45,'VCC',GRN,12)}${ln(50,55,60,55)}
      ${rc(150,45,70,40,'#1b2534','#cdd9e8',4)}${txt(185,70,'Yük',T,11)}${ln(60,55,150,55)}
      ${ln(185,85,185,110)}${txt(185,110,'C',RED,12)}
      <circle cx="130" cy="140" r="30" fill="none" stroke="${T}" stroke-width="2"/>
      ${ln(110,120,110,160,T,4)}${ln(110,130,155,110)}${ln(110,150,155,170)}
      ${ln(185,85,185,120)}${ln(185,120,155,170)}
      ${ln(110,140,80,140)}${rc(40,130,40,20,'#d9c9a3','#9c8a5f',3)}${txt(60,124,'Rb',T,11)}${ln(20,140,40,140)}
      ${ln(110,160,110,180)}${rc(100,180,40,14,'#d9c9a3','#9c8a5f',3)}${txt(120,192,'Re',T,11)}${ln(120,194,120,194)}${ln(100,194,100,194)}${ln(90,194,150,194)}
      ${ln(110,140,110,140)}
      ${ln(110,140,110,140)}
      ${txt(300,110,'Re üzerindeki gerilim sabit tutulur,')}
      ${txt(300,135,'I = Vref/Re → yük değişse de akım sabit.')}
    `) },

    tl431ref: { cat: "Analog", t: "TL431 gerilim referansı (feedback)", g: sv(460, 200, `
      ${ln(120,40,120,70)}${rc(80,70,80,20,'#d9c9a3','#9c8a5f',3)}${txt(120,64,'R1',T,11)}${ln(120,90,120,110)}
      <polygon points="100,110 100,160 150,135" fill="#1b2534" stroke="${T}" stroke-width="2"/>${txt(120,140,'TL431',T,10)}
      ${ln(150,135,220,135)}${txt(200,128,'REF',MUT,10)}
      ${ci(120,135,3,AMB)}${ln(120,135,120,110)}
      ${ln(120,160,120,180)}${rc(80,180,80,14,'#d9c9a3','#9c8a5f',3)}${txt(120,206,'R2',T,11)}
      ${ln(120,160,90,160)}${ln(90,160,90,180)}${ln(90,194,90,194)}
      ${ln(120,194,120,194)}${ln(60,194,140,194)}${ln(72,201,128,201)}
      ${txt(230,120,'Vout = 2.5 × (1 + R1/R2)',AMB,12)}
      ${txt(230,145,'SMPS feedback referansı; çıkışı sabitler.')}
    `) },

    darlington: { cat: "Dijital", t: "Darlington çifti — çok yüksek kazanç (β×β)", g: sv(440, 200, `
      <circle cx="120" cy="100" r="30" fill="none" stroke="${T}" stroke-width="2"/>
      ${ln(100,80,100,120,T,3)}${ln(100,88,140,72)}${ln(100,112,140,128)}
      <circle cx="240" cy="100" r="30" fill="none" stroke="${T}" stroke-width="2"/>
      ${ln(220,80,220,120,T,3)}${ln(220,88,260,72)}${ln(220,112,260,128)}
      ${ln(140,128,220,112)}${ln(140,128,180,150)}${ln(120,88,80,88)}${txt(70,80,'B',AMB,12)}
      ${ln(260,128,300,150)}${txt(305,155,'E',AMB,12)}${ln(260,72,300,60)}${txt(305,55,'C',RED,12)}
      ${ln(140,72,140,72)}${ln(140,72,140,72)}${ln(100,88,100,88)}
      ${ln(100,88,80,88)}
      ${txt(190,185,'İki transistör ardışık: kazanç çarpılır (β₁×β₂ ≈ 10.000+). Röle/motor sürme.',MUT,10)}
    `) },

    sevenseg: { cat: "Dijital", t: "7-segment gösterge — segmentler (a–g) ve sürücü", g: sv(460, 220, `
      <rect x="60" y="40" width="120" height="150" rx="8" fill="#1b2534" stroke="${T}" stroke-width="2"/>
      <rect x="80" y="55" width="80" height="10" fill="${RED}" opacity="0.8"/>${txt(120,52,'a',MUT,10)}
      <rect x="172" y="70" width="10" height="60" fill="${RED}" opacity="0.8"/>${txt(190,105,'b',MUT,10)}
      <rect x="172" y="140" width="10" height="60" fill="${RED}" opacity="0.8"/>${txt(190,172,'c',MUT,10)}
      <rect x="80" y="200" width="80" height="10" fill="${RED}" opacity="0.8"/>${txt(120,220,'d',MUT,10)}
      <rect x="58" y="140" width="10" height="60" fill="${RED}" opacity="0.8"/>${txt(48,172,'e',MUT,10)}
      <rect x="58" y="70" width="10" height="60" fill="${RED}" opacity="0.8"/>${txt(48,105,'f',MUT,10)}
      <rect x="80" y="128" width="80" height="10" fill="${RED}" opacity="0.7"/>${txt(120,126,'g',MUT,10)}
      ${txt(120,238,'7-segment (ortak anot/katot)')}
      ${rc(250,60,150,90,'#1b2534','#cdd9e8',6)}${txt(325,90,'BCD→7-seg',T,12)}${txt(325,110,'sürücü (7447…)',MUT,10)}
      ${ln(200,105,250,105)}${txt(225,98,'a-g',MUT,10)}
      ${txt(325,175,'Ortak bacak (COM/CA/CC) besleme kutbuna gider.',MUT,10)}
    `) },

    i2cPullup: { cat: "Dijital", t: "I2C bus — SDA/SCL pull-up dirençleri", g: sv(520, 220, `
      ${txt(30,40,'VCC',GRN,12)}${ln(60,50,60,70)}
      ${rc(40,70,40,20,'#d9c9a3','#9c8a5f',3)}${txt(60,64,'Rp',T,11)}${rc(140,70,40,20,'#d9c9a3','#9c8a5f',3)}${txt(160,64,'Rp',T,11)}
      ${ln(60,90,60,120)}${ln(160,90,160,150)}${ln(60,90,60,120)}
      ${ln(60,50,160,50)}
      ${rc(30,120,80,60,'#1b2534','#cdd9e8',6)}${txt(70,155,'Master',T,11)}${txt(70,172,'(MCU)',MUT,10)}
      ${rc(230,120,100,60,'#1b2534','#cdd9e8',6)}${txt(280,155,'Slave',T,11)}${txt(280,172,'(sensör/EEPROM)',MUT,10)}
      ${ln(110,135,230,135)}${txt(170,128,'SDA',AMB,10)}
      ${ln(110,165,230,165)}${txt(170,182,'SCL',BLU,10)}
      ${ln(60,120,60,135)}${ln(160,150,160,165)}
      ${ln(160,90,160,150)}${ln(60,120,60,120)}
      ${txt(330,135,'Pull-up: hat boşta 3.3/5V\'ta kalır.',MUT,10)}
      ${txt(330,160,'Eksikse hat çöker, cihaz açılmaz.',RED,10)}
      ${txt(300,205,'Çoğu cihaz adresli (7-bit). I2C 2 hat: SDA + SCL.',MUT,10)}
    `) },

    levelShifter: { cat: "Dijital", t: "Seviye çevirici (3.3V ↔ 5V) — MOSFET + pull-up", g: sv(500, 220, `
      ${txt(20,40,'3.3V',GRN,12)}${ln(60,50,60,70)}${rc(45,70,30,18,'#d9c9a3','#9c8a5f',3)}${txt(60,100,'Rp',T,10)}
      ${txt(400,40,'5V',GRN,12)}${ln(440,50,440,70)}${rc(425,70,30,18,'#d9c9a3','#9c8a5f',3)}${txt(440,100,'Rp',T,10)}
      ${ln(60,88,60,150)}${ln(440,88,440,150)}
      ${rc(30,150,70,50,'#1b2534','#cdd9e8',5)}${txt(65,180,'3.3V cihaz',T,10)}
      ${rc(380,150,90,50,'#1b2534','#cdd9e8',5)}${txt(425,180,'5V cihaz',T,10)}
      ${ln(100,175,250,175)}${ln(250,175,380,175)}
      ${ci(250,120,4,AMB)}${ln(250,124,250,175)}
      ${txt(250,112,'G → 3.3V',GRN,10)}
      ${ln(250,50,250,78)}${txt(250,46,'',)}${txt(250,60,'',)}
      ${ln(220,120,250,120)}${ln(250,120,280,120)}
      ${ln(150,175,150,120)}${ln(150,120,220,120)}
      ${txt(250,205,'MOSFET source=3.3V hat, drain=5V hat, gate=3.3V. Her iki taraf pull-up\'lı.',MUT,10)}
    `) }
  };

  root.FIG = FIG;
  root.FIG_CATS = ["Bileşenler", "Yarıiletken", "Güç", "Dijital", "Analog", "Analiz"];
  if (typeof module !== "undefined" && module.exports) module.exports = FIG;
})(typeof self !== "undefined" ? self : this);
