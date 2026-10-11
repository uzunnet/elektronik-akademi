/* =========================================================================
   Elektronik Akademi — Veri Kısım 2
   SET: Anahtarlamalı Güç (bölüm 2) + Arıza Bulma + Osiloskop + Multimetre + Tamir
   Ayrıca: SETS (paketler), GLOSSARY, TOOL_META
   ========================================================================= */

const MODULES_PART2 = [

  /* ===================== m5 — İZOLASYONLU TOPOLOJİLER ================= */
  {
    id: "m5", set: "anahtarlamali", title: "İzolasyonlu Topolojiler ve Sürme", icon: "🧲",
    desc: "Flyback, yarım/tam köprü, push-pull, tristör inverter, gate driver, bootstrap, triphase.",
    lessons: [
      {
        id: "m5l1", title: "Flyback Topolojisi", video: "Anahtarlamalı • 07",
        content: `
          <p><b>Flyback</b>, en yaygın izolasyonlu, düşük-orta güçlü (&lt;150 W) topolojidir. Şarj aletleri, adaptörler, standby beslemeleri.</p>
          <h4>Çalışma</h4>
          <ul>
            <li>MOSFET iletimde: enerji trafonun <b>primer sargısında</b> manyetik olarak depolanır.</li>
            <li>MOSFET kesimde: enerji <b>sekonder</b> sargıya aktarılır, sekonder diyot iletir.</li>
            <li>Snubber (RCD) primerdeki gerilim sıçramasını söner.</li>
          </ul>
          <div class="callout warn"><b>Sık arıza:</b> primer MOSFET, snubber diyodu/kondansatörü, sekonder çıkış diyodu, feedback (opto/TL431), startup direnci, bulk kondansatör.</div>
          <div class="callout tip"><b>Teşhis:</b> Sekonder çıkış yoksa primer anahtarlama var mı bak (osiloskop, gate). Varsa ama çıkış yoksa sekonder diyot/kondansatör/feedback ara.</div>
        `,
        key: ["Flyback: izolasyonlu, düşük güç.", "İletimde primerde enerji depolar, kesimde sekondere aktarır.", "Snubber sıçramayı söner.", "Arıza: primer MOSFET, opto/TL431, çıkış diyodu."],
        quiz: [
          { q: "Flyback enerjiyi ne zaman sekondere aktarır?", o: ["MOSFET iletimde", "MOSFET kesimde", "Her zaman", "Hiç"], a: 1, e: "Kesim anında aktarır." },
          { q: "Flyback'te tipik feedback elemanı?", o: ["Opamp", "Optokuplör/TL431", "Röle", "Trafo"], a: 1, e: "Opto + TL431." }
        ]
      },
      {
        id: "m5l2", title: "Push-Pull, Yarım ve Tam Köprü", video: "Anahtarlamalı • 08",
        content: `
          <h4>Push-Pull</h4>
          <p>İki anahtar, orta uçlu trafoyu sırayla sürer. Basit ama anahtarlara 2×Vin gerilim biner.</p>
          <h4>Yarım köprü (Half-Bridge)</h4>
          <p>İki anahtar, iki kondansatörle gerilim böler. Trafo primerine ±Vin/2 uygulanır. Orta-yüksek güç.</p>
          <h4>Tam köprü (Full-Bridge)</h4>
          <p>Dört anahtar (H-köprüsü). Trafo primerine tam ±Vin uygulanır; en yüksek güç. Prensip: çapraz anahtarlar birlikte sürülür.</p>
          <div class="callout warn"><b>Her köprü için:</b> dead-time zorunlu. Ayrıca <b>gate driver + bootstrap</b> ve bazen <b>izolasyonlu gate trafo/opto</b> gerekir.</div>
          <div class="callout info"><b>Triphase (3 fazlı) inverter/doğrultucu:</b> 6 anahtar (veya 6 diyot). Motor sürücüleri ve endüstriyel güçte.</div>
        `,
        key: ["Push-pull: 2 anahtar, orta uçlu trafo.", "Half-bridge: ±Vin/2, 2 anahtar.", "Full-bridge: ±Vin, 4 anahtar.", "Her köprüde dead-time şart."],
        quiz: [
          { q: "Full-bridge'de kaç anahtar?", o: ["1", "2", "4", "6"], a: 2, e: "4 anahtar (H-köprü)." },
          { q: "Triphase inverter kaç anahtar?", o: ["2", "4", "6", "8"], a: 2, e: "6 anahtar." }
        ]
      },
      {
        id: "m5l3", title: "Tristör, Triphase Doğrultucular ve Statik Power", video: "Anahtarlamalı • 09",
        content: `
          <h4>Tristör (SCR)</h4>
          <p>4 katmanlı, <b>tetikleme (gate) ile iletime geçen</b>, ancak akım kesilene kadar iletimde kalan bir elemandır. Yüksek güç kontrolünde kullanılır.</p>
          <ul>
            <li><b>Tristör inverter:</b> DC'yi AC'ye çevirir (yüksek güç).</li>
            <li><b>Line switch + tristör inverter:</b> motor/hız kontrol uygulamaları.</li>
          </ul>
          <h4>Triphase (3 fazlı) doğrultucular</h4>
          <p>6 diyotlu köprü veya tristör köprü; 3 faz AC'yi DC'ye çevirir. Endüstriyel sürücülerin giriş katı.</p>
          <h4>Statik power</h4>
          <p>UPS, statik transfer, kompanzasyon gibi güç elektroniği uygulamaları.</p>
          <div class="callout info"><b>Teşhis:</b> Tristör/SCR arızasında kısa devre (sürekli iletime geçmiş) veya tetiklenmeme görülür. Gate devresini ve snubber'ı kontrol et.</div>
        `,
        key: ["Tristör gate ile tetiklenir, akım kesilene kadar iletir.", "Tristör inverter DC→AC.", "Triphase doğrultucu 3 faz→DC.", "Arıza: sürekli iletim veya tetiklenmeme."],
        quiz: [
          { q: "Tristör nasıl iletime geçer?", o: ["Gerilimle", "Gate tetiklemesiyle", "Isıyla", "Işıkla"], a: 1, e: "Gate sinyaliyle." },
          { q: "Tristör ne zaman keser?", o: ["Gate düşünce", "Akım sıfırlanınca", "Gerilim artınca", "Hiç"], a: 1, e: "Akım kesilince." }
        ]
      },
      {
        id: "m5l4", title: "Gate Driver ve Bootstrap Devresi", video: "Anahtarlamalı • 10",
        content: `
          <p><b>Gate driver</b>, PWM kontrol sinyalini MOSFET/IGBT gate'ini sürecek güçlü ve hızlı bir sinyale çevirir.</p>
          <h4>Neden gerekli?</h4>
          <ul>
            <li>Gate kapasitesini hızlı doldurup boşaltmak (anahtarlama kaybını azaltır).</li>
            <li>High-side MOSFET için gate'i source'un üstüne taşımak.</li>
            <li>Kısa devre/desat koruması.</li>
          </ul>
          <h4>Bootstrap devresi</h4>
          <ul>
            <li>Bir <b>diyot + kondansatör</b> ikilisi.</li>
            <li>Low-side iletimdeyken bootstrap kondansatörü dolar.</li>
            <li>High-side iletiminde bu yüklü kondansatör gate'i besler.</li>
          </ul>
          <div class="callout warn"><b>Sık arıza:</b> Bootstrap diyodu/kondansatörü bozulursa high-side MOSFET sürülemez → yarım köprü çalışmaz. Gate dirençleri de açık devre olabilir.</div>
        `,
        key: ["Gate driver hızlı/güçlü gate sürer.", "Bootstrap = diyot + kondansatör.", "Low-side'da dolan kap high-side'ı besler.", "Arıza: bootstrap diyot/kondansatör, gate direnci."],
        quiz: [
          { q: "Bootstrap devresi neyle beslenir?", o: ["Şebeke", "Low-side iletime geçince dolan kondansatör", "Pil", "Trafo"], a: 1, e: "Low-side iletiminde dolan kap." },
          { q: "Gate driver olmazsa?", o: ["Yavaş/ısınır veya sürülemez", "Hızlı", "Verimli", "Sorun yok"], a: 0, e: "Anahtarlama yavaşlar/olmayabilir." }
        ]
      }
    ]
  },

  /* ===================== m6 — UYGULAMALAR VE ARIZALAR ================= */
  {
    id: "m6", set: "anahtarlamali", title: "Saha Uygulamaları ve Arızalar", icon: "🏭",
    desc: "Standby power, PFC/inverter uygulaması, VCC hot restart, toprak delinmesi, feedback arızaları, TV PSU, welding.",
    lessons: [
      {
        id: "m6l1", title: "Standby Power ve VCC (Hot Restart)", video: "Uygulama • 01",
        content: `
          <h4>Standby power</h4>
          <p>Ana güç kapalıyken kartın küçük bir bölümünü besleyen düşük güçlü beslemedir (kumanda algılama, saat, uyandırma). Genelde küçük bir flyback'tir.</p>
          <h4>VCC ve Hot Restart</h4>
          <ul>
            <li>PWM kontrol IC'sinin beslemesi (<b>VCC</b>) genelde önce <b>startup direnci</b> ile başlar, sonra <b>yardımcı sargı</b> ile beslenir.</li>
            <li><b>Hot restart sorunu:</b> Kart çalışır ama kapatıp hemen açınca başlamaz (VCC kondansatörü/startup yolu yaşlıysa).</li>
          </ul>
          <div class="callout warn"><b>Teşhis:</b> IC açılmıyorsa VCC gerilimini ölç. Startup direnci yüksek değere kaymış veya yardımcı diyot arızalıysa VCC oturmaz → "arada bir çalışıyor" belirtisi.</div>
        `,
        key: ["Standby ayrı küçük beslemedir.", "VCC startup direnci + yardımcı sargı ile beslenir.", "Hot restart: VCC oturmuyor.", "VCC gerilimi ve startup yolunu ölç."],
        quiz: [
          { q: "PWM IC VCC önce nasıl beslenir?", o: ["Sekonderden", "Startup direnciyle", "Pille", "Direkt"], a: 1, e: "Startup direnci başlatır." },
          { q: "Hot restart sorunu genelde?", o: ["Sigorta", "VCC/startup yolu", "Röle", "LED"], a: 1, e: "VCC oturmuyor." }
        ]
      },
      {
        id: "m6l2", title: "PFC ve Inverter Uygulamaları", video: "Uygulama • 02",
        content: `
          <h4>PFC uygulaması</h4>
          <ul>
            <li>Girişte köprü + EMI; ardından boost PFC hattı ~400 V DC üretir.</li>
            <li>PFC kontrol IC'sini besleyen VCC ve feedback bölücüsü kritik.</li>
            <li>PFC MOSFET'i ve boost diyodu en sık arızalanan parçalardır.</li>
          </ul>
          <h4>Inverter uygulaması</h4>
          <p>DC'yi (genelde ~400 V) tekrar AC'ye çevirir (motor sürme, UPS). Half/full bridge + gate driver + bootstrap.</p>
          <div class="callout warn"><b>PFC arızası:</b> PFC çalışmazsa cihaz ya hiç açılmaz ya giriş sigortası/MOSFET yanar. Önce PFC MOSFET, boost diyot ve kontrol IC beslemesini kontrol et.</div>
        `,
        key: ["Aktif PFC boost ile ~400 V üretir.", "PFC MOSFET ve boost diyot sık arızalanır.", "Inverter DC→AC (bridge + gate driver).", "PFC arızasında cihaz açılmaz."],
        quiz: [
          { q: "Aktif PFC çıkışı yaklaşık?", o: ["12 V", "48 V", "~400 V", "1 kV"], a: 2, e: "~400 V DC." },
          { q: "PFC'de en sık arızalanan?", o: ["LED", "PFC MOSFET/boost diyot", "Röle", "Kablo"], a: 1, e: "MOSFET ve boost diyodu." }
        ]
      },
      {
        id: "m6l3", title: "Voltaj Ölçümleri, Toprak Delinmesi, Feedback Arızaları", video: "Uygulama • 03",
        content: `
          <h4>Voltaj ölçümleri</h4>
          <p>Primer taraf (yüksek gerilim) ölçümleri <b>izoleli/diferansiyel prob</b> veya izoleli osiloskopla yapılır. Sıradan topraklı osiloskopla primer ölçmek kısa devre/patlama riskidir.</p>
          <h4>Toprak delinmesi (ground breach)</h4>
          <p>Primer-sekonder izolasyonunun (Y kap, opto, trafo) bozulması; şebeke gerilimi çıkışa/şaseye sızar. <b>Kullanıcı güvenliği tehlikesi.</b> Megger/izolasyon testi ile kontrol edilir.</p>
          <h4>Feedback arızaları</h4>
          <ul>
            <li>Opto/TL431 arızası → çıkış tavan yapar veya sıfırlanır.</li>
            <li>Feedback bölücü direnç kayması → yanlış çıkış gerilimi.</li>
            <li>Referans (TL431) bozulması → kararsız çıkış.</li>
          </ul>
          <div class="callout warn"><b>Belirti-eşleme:</b> Çıkış aşırı yüksek → feedback kopuk. Çıkış sıfır ama primer anahtarlama var → sekonder/feedback. Hiç anahtarlama yok → VCC/startup.</div>
        `,
        key: ["Primer ölçümü izole prob/izoleli skopla.", "Toprak delinmesi güvenlik tehlikesidir.", "Feedback arızası çıkışı tavan/sıfır yapar.", "Belirti → arıza katı eşlemesi yap."],
        quiz: [
          { q: "Primer taraf ölçümü nasıl yapılmalı?", o: ["Normal prob", "İzoleli/diferansiyel prob", "Parmakla", "Multimetre DC"], a: 1, e: "İzole ölçüm gerekir." },
          { q: "Çıkış aşırı yüksekse genelde?", o: ["Sigorta", "Feedback kopuk", "Yük fazla", "Röle"], a: 1, e: "Feedback bilgisi gelmiyor." }
        ]
      },
      {
        id: "m6l4", title: "Flyback Uygulama, TV PSU ve Welding", video: "Uygulama • 04",
        content: `
          <h4>Flyback uygulama</h4>
          <p>Adaptör/şarj cihazı düzeyinde tam arıza akışı: giriş sigortası → bulk → startup/VCC → anahtarlama → sekonder çıkış → feedback.</p>
          <h4>Flyback TV/PSU</h4>
          <p>TV besleme kartları standby + ana besleme + PFC + inverter bölümleri içerir; arıza izolasyonu blok blok yapılır.</p>
          <h4>Welding (kaynak) makinesi</h4>
          <p>Yüksek akım/gerilim; genelde 3 faz doğrultucu + inverter + trafo + sekonder doğrultucu. IGBT/MOSFET ve gate driver arızaları yaygın.</p>
          <div class="callout info"><b>Ortak yaklaşım:</b> Her cihazda blokları ayır (giriş, PFC, anahtarlama, sekonder, kontrol) ve her bloğu tek tek doğrula.</div>
        `,
        key: ["Flyback uygulamada katman katman ilerle.", "TV PSU çok bloklu.", "Welding: 3 faz + inverter + trafo.", "Blokları ayır, tek tek doğrula."],
        quiz: [
          { q: "Welding makinesi tipik olarak?", o: ["Tek diyot", "3 faz doğrultucu+inverter+trafo", "Sadece trafo", "USB"], a: 1, e: "3 faz + inverter + trafo." },
          { q: "Arıza izolasyonunda en iyi yaklaşım?", o: ["Tahmin", "Blok blok doğrulama", "Parça değiştirme", "Sallama"], a: 1, e: "Blok blok ilerle." }
        ]
      }
    ]
  },

  /* ===================== m7 — ARIZA TESPİTİNİN ARKA PLANI ============= */
  {
    id: "m7", set: "ariza", title: "Arıza Tespitinin Arka Planı", icon: "🛠️",
    desc: "Elektronik kart tamirine başlangıç: sistemli arıza tespit mantığı ve check-list.",
    lessons: [
      {
        id: "m7l1", title: "Sistemli Arıza Tespit Mantığı", video: "Arıza • 01",
        content: `
          <p>Profesyonel tamir <b>sistemli bir akış</b> izler. Rastgele parça değiştirmek çözüm değildir.</p>
          <h4>Altın akış</h4>
          <ol>
            <li><b>Belirti:</b> hiç açılmıyor / açılıp kapanıyor / ısınıyor / çıkış yok.</li>
            <li><b>Güç kontrolü:</b> akım sınırlı kaynakla besle, ray gerilimlerini ölç.</li>
            <li><b>Kısa devre kontrolü:</b> hat-hat ve hat-GND direnci.</li>
            <li><b>Görsel kontrol:</b> yanık, şişmiş kap, çatlak/soğuk lehim, oksit.</li>
            <li><b>Blok blok ölçüm:</b> giriş → regülatör → işlemci → çıkış.</li>
            <li><b>Hipotez → test:</b> şüpheli yeri ölç, doğrula, sonra değiştir.</li>
            <li><b>Onarım → doğrulama.</b></li>
          </ol>
          <div class="callout warn"><b>Altın kural:</b> Ölç → düşün → sonra müdahale et. Ölçmeden hiçbir parçayı sökme.</div>
        `,
        key: ["Sistematik akış: belirti→güç→kısa devre→görsel→blok→hipotez.", "Akım sınırlı kaynak kullan.", "Ölçmeden sökme.", "Onarım sonrası doğrula."],
        quiz: [
          { q: "Teşhiste ilk adım?", o: ["Parça sök", "Belirtiyi netleştir", "Lehim yap", "Yazılım"], a: 1, e: "Önce belirti." },
          { q: "Ölçüm öncesi prensip?", o: ["Hızlı ol", "Ölçmeden müdahale etme", "Isıt", "Salla"], a: 1, e: "Ölç meden müdahale yok." }
        ]
      },
      {
        id: "m7l2", title: "Başlangıç Check-List", video: "Arıza • 02",
        content: `
          <p>Kartı eline aldığında müdahaleden önce şu listeyi uygula:</p>
          <h4>☑ Fiziksel ön kontrol</h4>
          <ul>
            <li>Yanık/kararmış bölge, şişmiş elektrolitik, çatlak lehim, eğik bacak.</li>
            <li>Sigorta, varistör (MOV), NTC durumu.</li>
            <li>Soketler ve konektörlerde oksit/gevşeklik.</li>
          </ul>
          <h4>☑ Elektriksel ön kontrol</h4>
          <ul>
            <li>Giriş sigortası süreklilik.</li>
            <li>Ana besleme hattında hat-GND direnci (kısa devre var mı?).</li>
            <li>Anahtarlama MOSFET/çıkış diyodunda D-S/kısa testi (enerjisiz).</li>
          </ul>
          <h4>☑ Enerjili ilk kontrol (akım sınırlı!)</h4>
          <ul>
            <li>Akım sınıra dayanıyor mu? → kısa devre.</li>
            <li>Ray gerilimleri (5V/3,3V/12V) doğru mu?</li>
            <li>Isınan bileşen var mı? (termal kamera)</li>
          </ul>
          <div class="callout tip"><b>Check-list</b> ekranı, bu kontrolü adım adım işaretleyebileceğin interaktif bir liste olarak yakında eklenecek; şimdilik bu bölümü referans al.</div>
        `,
        key: ["Fiziksel + elektriksel + enerjili ön kontrol.", "Sigorta ve kısa devre ilk bakılır.", "Enerjili kontrol akım sınırlı yapılır.", "Isınan bileşen = şüpheli."],
        quiz: [
          { q: "Enerjili ilk kontrolden önce?", o: ["Full güç ver", "Akım sınıra dayanıyor mu bak", "Kartı ısıt", "Yazılım"], a: 1, e: "Kısa devre kontrolü." },
          { q: "Hangi bileşen en önce görsel kontrolden geçer?", o: ["LED", "Şişmiş elektrolitik/yanık", "Direnç", "Yazı"], a: 1, e: "Görsel arıza izleri." }
        ]
      }
    ]
  },

  /* ===================== m8 — VOLTAGE DROP & ENJEKSİYON ============== */
  {
    id: "m8", set: "ariza", title: "Arıza Bulma Teknikleri", icon: "🔎",
    desc: "Voltage drop, kondansatör üzerinden arıza, voltaj enjeksiyonu, devre kartı yorumlama, şema ve BoardView.",
    lessons: [
      {
        id: "m8l1", title: "Voltage Drop Teknikleri", video: "Arıza • 03",
        content: `
          <p><b>Voltage drop (gerilim düşümü) tekniği:</b> bir hat üzerindeki gerilim düşümünü ölçerek o hat üzerindeki sorunlu bileşeni/bağlantıyı bulma yöntemi. Profesyonel tamirin en güçlü aracıdır.</p>
          <h4>Mantık</h4>
          <p>Sağlam bir iletken/kontak üzerinde gerilim düşümü sıfıra yakındır. Bir bağlantıda/yolda gerilim düşümü varsa o noktada direnç (oksit, çatlak, bozuk bileşen) vardır.</p>
          <h4>Nasıl yapılır?</h4>
          <ol>
            <li>Kart enerjili ve yük çeker durumda olmalı.</li>
            <li>Multimetreyi <b>mV/DC</b> kademesine al.</li>
            <li>İki probu hattın iki ucu arasına (paralel) koy.</li>
            <li>Yüksek düşüm görülen segment sorunludur.</li>
          </ol>
          <div class="callout info"><b>Örnek:</b> Sigorta üzerinde normal düşüm ~birkaç mV'dur. Yanlış sigorta veya temassızlık varsa düşüm artar. Sigortayı sökmeden kalitesini anlarsın.</div>
        `,
        key: ["Voltage drop = hat üzerindeki gerilim düşümü.", "Sağlam hat ≈ 0 V düşüm.", "Enerjili + yük altında ölçülür.", "Yüksek düşüm = sorunlu segment."],
        quiz: [
          { q: "Voltage drop ölçümü hangi durumda yapılır?", o: ["Enerjisiz", "Enerjili/yük altında", "Kapalı", "Farketmez"], a: 1, e: "Enerjili ve yük çekerken." },
          { q: "Sağlam bir hatta düşüm?", o: ["Yüksek", "≈ 0 V", "220 V", "Her zaman 5 V"], a: 1, e: "Sağlam hat sıfıra yakın." }
        ]
      },
      {
        id: "m8l2", title: "Kondansatör Üzerinden Arıza Bulma", video: "Arıza • 04",
        content: `
          <p>Kondansatörler (özellikle elektrolitik) yaşlanan ve en sık arızalanan bileşenlerdir. Arızalarını tespit birkaç teknikle yapılır.</p>
          <h4>Belirtiler</h4>
          <ul>
            <li>Şişme, açılma, sızıntı, renk değişimi (üst kısımda kabuk).</li>
            <li>Kapasite düşmesi, <b>ESR yükselmesi</b>, kısa devre/delinme.</li>
          </ul>
          <h4>Test yöntemleri</h4>
          <ul>
            <li><b>ESR metre:</b> En doğru yöntem. Yüksek ESR = arızalı.</li>
            <li><b>Kapasite (LCR) ölçümü:</b> Nominalin altındaysa değiştir.</li>
            <li><b>Voltage drop / ripple:</b> Osiloskopla AC kuplajda ripple'a bak (aşırıysa kap bozuk).</li>
            <li><b>Kısa devre testi (enerjisiz):</b> Tam kısa ise delinmiş.</li>
          </ul>
          <div class="callout tip"><b>Pratik:</b> SMPS'te şüpheli elektrolitikleri <b>sökmeden</b> önce ESR ile ölçebilirsen en hızlısı; değilse devre dışı ölç.</div>
        `,
        key: ["Elektrolitikler en sık arızalanan parçalar.", "ESR yükselmesi kapasite normal olsa bile arıza.", "ESR metre en doğru.", "Ripple aşırıysa kap bozuk."],
        quiz: [
          { q: "Kondansatör arızasında en kritik parametre?", o: ["Renk", "ESR", "Boyut", "Marka"], a: 1, e: "ESR yükselmesi." },
          { q: "Delinmiş kondansatör enerjisiz nasıl görünür?", o: ["Açık", "Kısa devre", "Yüksek direnç", "Fark etmez"], a: 1, e: "Kısa devre gösterir." }
        ]
      },
      {
        id: "m8l3", title: "Voltaj Enjeksiyonu (Voltage Injection)", video: "Arıza • 05",
        content: `
          <p><b>Voltaj enjeksiyonu</b>, kartın çalışmadığı bir noktasına <b>kontrollü, akım sınırlı</b> gerilim uygulayarak arızalı bileşeni (genelde kısa devrelideki) bulma tekniğidir.</p>
          <h4>Kullanım senaryoları</h4>
          <ul>
            <li>Besleme rayında kısa devre var; kart açılmıyor.</li>
            <li>Şüpheli hatta düşük gerilim verip ısınan/duman çıkan bileşeni bulma.</li>
          </ul>
          <h4>Yöntem</h4>
          <ol>
            <li>Akım sınırlı güç kaynağını düşük gerilime (örn. 0,5–1 V) ayarla.</li>
            <li>Multimetre ile kısa devre rayına bağla.</li>
            <li>Akım sınırını düşük tut; kısa devre noktası ısınır.</li>
            <li>Termal kamera ile sıcak bileşeni bul.</li>
          </ol>
          <div class="callout warn"><b>Dikkat:</b> Gerilimi asla kartın nominalinin üstüne çıkarma; doğru akım sınırıyla çalış. Amaç bileşeni bulmak, yakmak değil.</div>
        `,
        key: ["Voltaj enjeksiyonu = kontrollü gerilim verme.", "Kısa devreli bileşeni ısıtarak bulur.", "Akım sınırı düşük tutulur.", "Termal kamera ile sıcak nokta."],
        quiz: [
          { q: "Voltaj enjeksiyonunda akım sınırı?", o: ["Yüksek", "Düşük", "Kapalı", "Farketmez"], a: 1, e: "Düşük tutulur." },
          { q: "Enjeksiyon kime ile kısa devreli bileşen bulunur?", o: ["Sesle", "Isınma/termal", "Renkle", "Kokuyla"], a: 1, e: "Isınan bileşen." }
        ]
      },
      {
        id: "m8l4", title: "Devre Kartı Yorumlama ve Şema Kullanımı", video: "Arıza • 06",
        content: `
          <h4>Devre kartı yorumlama</h4>
          <ul>
            <li>Besleme alanını (input/EMI/PFC/regülatör) ve kontrol alanını (MCU/driver) ayır.</li>
            <li>Referans (R10, C23, U5) ve değerlerden devreyi oku.</li>
            <li>GND ve besleme düzlemlerini test noktalrından takip et.</li>
            <li><b>BoardView (.brd/.cad):</b> katmanları, ağ (net) bağlantılarını ve component yerleşimini gösterir; kart yorumlamayı hızlandırır.</li>
          </ul>
          <h4>Şema kullanımı</h4>
          <ul>
            <li>Şema, bileşenlerin nasıl bağlandığını gösterir; ölçüm yaparken "bu net nereye gidiyor?" sorusunu yanıtlar.</li>
            <li>Net isimleri (VCC, GND, SDA) ile ölçüm noktalarını eşleştir.</li>
            <li>Şema + boardview + multimetre = hızlı arıza.</li>
          </ul>
          <div class="callout info"><b>BoardView avantajı:</b> Kart üzerindeki component'i tıklayınca net ve komşu bağlantıları görürsün; kısa devre/kopuk hattı bulmak çok hızlanır.</div>
        `,
        key: ["Kartı besleme/kontrol alanına ayır.", "Referans ve net isimlerini kullan.", "BoardView net ve katman gösterir.", "Şema + boardview + multimetre."],
        quiz: [
          { q: "BoardView ne sağlar?", o: ["Renk", "Katman ve net bağlantıları", "Yazılım", "Güç"], a: 1, e: "Net/katman görünürlüğü." },
          { q: "Şema kullanımının amacı?", o: ["Süsleme", "Bağlantıları görmek", "Isı", "Renk"], a: 1, e: "Net bağlantılarını gösterir." }
        ]
      }
    ]
  },

  /* ===================== m9 — OSİLOSKOP TEMELLERİ ==================== */
  {
    id: "m9", set: "osiloskop", title: "Osiloskop Temelleri", icon: "📟",
    desc: "Osiloskop nedir, nasıl çalışır: sample rate, time/volt div, Vpp, Vmax, Vrms, duty cycle, trigger, AC kuplaj.",
    lessons: [
      {
        id: "m9l1", title: "Osiloskop Nedir, Nasıl Çalışır?", video: "Osiloskop • 01",
        content: `
          <p>Osiloskop, gerilimin <b>zaman içindeki değişimini grafik olarak</b> gösterir. Multimetre DC/sabit şeyleri ölçerken osiloskop dalga şeklini, gürültüyü ve ani olayları gösterir.</p>
          <h4>Ana kontroller</h4>
          <ul>
            <li><b>Volts/div:</b> dikey ölçek.</li>
            <li><b>Time/div:</b> yatay ölçek.</li>
            <li><b>Trigger:</b> dalgayı sabit tutar.</li>
            <li><b>Prob (1x/10x):</b> 10x prob gerilimi 10'a böler.</li>
          </ul>
          <h4>Sample rate (örnekleme hızı)</h4>
          <p>Saniyede alınan örnek sayısıdır. <b>Nyquist:</b> ölçülecek en yüksek frekansın en az 2 katı örnekleme gerekir; pratikte 5-10 kat tercih edilir.</p>
          <div class="callout warn"><b>Bandwidth:</b> Osiloskobun bant genişliği ölçülen sinyalin frekansından yüksek olmalı; yoksa genlik ve kenarlar yanlış görünür.</div>
        `,
        key: ["Osiloskop gerilimin zaman grafiğini verir.", "Volts/div ve time/div ölçek.", "10x prob değeri 10'a böler.", "Nyquist: fmax'in ≥2 katı örnekleme."],
        quiz: [
          { q: "Dikey ölçeği ne belirler?", o: ["Time/div", "Volts/div", "Trigger", "Coupling"], a: 1, e: "Volts/div." },
          { q: "10x prob ile ekran değeri?", o: ["Aynı", "×10", "÷10", "×2"], a: 1, e: "Gerçek değer 10 ile çarpılır." }
        ]
      },
      {
        id: "m9l2", title: "Time/Volt Div, Alternans, Vpp-Vmax-Vrms", video: "Osiloskop • 02",
        content: `
          <h4>Ölçek okuma</h4>
          <p>Kare sayısı × ölçek = gerçek değer. Örn. 2 div yükseklik, 2 V/div → 4 V.</p>
          <h4>Temel büyüklükler</h4>
          <table class="tbl">
            <tr><th>Terim</th><th>Anlam</th></tr>
            <tr><td>Vpp</td><td>Tepe-tepe gerilim (en yüksek − en düşük)</td></tr>
            <tr><td>Vmax</td><td>En yüksek tepe</td></tr>
            <tr><td>Vrms</td><td>Etkin (RMS) gerilim</td></tr>
          </table>
          <p>Sinüs için: <b>Vrms ≈ Vpp / (2√2)</b> (yaklaşık).</p>
          <h4>Periyot ve frekans</h4>
          <p>Bir tam dalga (alternans/periyot) süresi T; <b>f = 1/T</b>.</p>
          <div class="formula">f = 1 / T</div>
          <div class="callout info">PWM/kare dalgada <b>duty cycle</b> = yüksek sürenin periyoda oranı; osiloskopta doğrudan ölçülür.</div>
        `,
        key: ["Kare × ölçek = gerçek değer.", "Vpp = tepe-tepe.", "Vrms ≈ Vpp/(2√2) (sinüs).", "f = 1/T; duty cycle ölçülür."],
        quiz: [
          { q: "Sinüs için Vrms ≈ ?", o: ["Vpp/2", "Vpp/(2√2)", "Vpp×2", "Vpp"], a: 1, e: "Vpp/(2√2)." },
          { q: "Periyot T=2 ms ise f?", o: ["2 Hz", "50 Hz", "500 Hz", "2 kHz"], a: 2, e: "f=1/0,002=500 Hz." }
        ]
      },
      {
        id: "m9l3", title: "Trigger Edge ve AC Kuplaj", video: "Osiloskop • 03",
        content: `
          <h4>Trigger (tetikleme)</h4>
          <ul>
            <li><b>Edge (kenar):</b> yükselen veya düşen kenarda tetikleme.</li>
            <li><b>Level:</b> tetikleme seviyesi.</li>
            <li><b>Mode:</b> Auto / Normal (tek seferlik olaylar için Single).</li>
          </ul>
          <p>Trigger olmazsa dalga ekranda kayar; doğru trigger ayarı dalgayı sabitler.</p>
          <h4>Kuplaj (Coupling)</h4>
          <ul>
            <li><b>DC:</b> hem DC hem AC bileşeni gösterir.</li>
            <li><b>AC:</b> DC bileşeni bloklar (ripple ve gürültü görünür).</li>
            <li><b>GND:</b> referans sıfır çizgisi.</li>
          </ul>
          <div class="callout tip"><b>Pratik:</b> Besleme rayındaki <b>ripple</b>'ı görmek için AC kuplaj + volt/div küçük + time/div hızlı kullan. Böylece küçük dalgalanmalar da görünür.</div>
        `,
        key: ["Trigger dalgayı sabitler; edge+level.", "AC kuplaj DC'yi bloklar, ripple görünür.", "DC kuplaj hem AC hem DC.", "Ripple için AC kuplaj kullan."],
        quiz: [
          { q: "Ripple görmek için hangi kuplaj?", o: ["DC", "AC", "GND", "Farketmez"], a: 1, e: "AC kuplaj DC'yi bloklar." },
          { q: "Trigger level ne yapar?", o: ["Genlik", "Tetikleme seviyesi", "Frekans", "Kuplaj"], a: 1, e: "Dalganın sabitlendiği seviye." }
        ]
      }
    ]
  },

  /* ===================== m10 — GRAFİK ANALİZİ ======================== */
  {
    id: "m10", set: "osiloskop", title: "Grafik Analizi ve Uygulama", icon: "📈",
    desc: "AC sinyal ölçümleri, parazit tarama, buck/boost grafikleri, anahtarlama süreleri, converter ve SMPS grafik analizi.",
    lessons: [
      {
        id: "m10l1", title: "AC Sinyal Ölçümleri ve Parazit Tarama", video: "Osiloskop • 04",
        content: `
          <h4>AC sinyal ölçümleri</h4>
          <ul>
            <li>Genlik, periyot, frekans, duty cycle, faz.</li>
            <li>Kristal/osilatör, PWM, haberleşme (UART/I2C/SPI), sensör sinyali.</li>
          </ul>
          <h4>Parazit (gürültü) tarama</h4>
          <ul>
            <li>Yükselen/düşen kenarlarda <b>ringing / overshoot</b> (aşırı sıçrama) bobin/parazitik kapasiteden.</li>
            <li>Hat üzerindeki <b>glitch</b>'ler kısa/uzun, temassızlık veya EMI kaynaklı.</li>
            <li>Gürültülü sinyal → filtre, ekranlama, snubber, topraklama ile düzeltme.</li>
          </ul>
          <div class="callout info"><b>Prob tekniği:</b> Probun toprak klipsini kısa tut. Uzun toprak teli halka oluşturup sahte gürültü/ringing üretir. Kısa yay toprak bağlantı kullan.</div>
        `,
        key: ["AC ölçüm: genlik, periyot, frekans, duty, faz.", "Ringing/overshoot parazitik elemanlardan.", "Glitch temassızlık/EMI kaynaklı.", "Kısa toprak bağlantı ile ölç."],
        quiz: [
          { q: "Sahte gürültüyü önlemek için prob nasıl?", o: ["Uzun toprak", "Kısa toprak bağlantı", "Topraksız", "10x"], a: 1, e: "Kısa yay toprak." },
          { q: "Ringing nedeni?", o: ["DC", "Parazitik L ve C", "Sigorta", "Yazı"], a: 1, e: "Parazitik bobin/kap." }
        ]
      },
      {
        id: "m10l2", title: "Dönüştürücü ve Anahtarlama Grafikleri", video: "Osiloskop • 05",
        content: `
          <h4>Buck/Boost grafikleri</h4>
          <ul>
            <li>Anahtarlama düğümü (switch node) gerilimi: kare dalga + ringing.</li>
            <li>Bobin akımı: testere dişi (üçgen) dalga.</li>
            <li>Gate sinyali: PWM.</li>
          </ul>
          <h4>Yarı iletkenlerde anahtarlama süreleri</h4>
          <ul>
            <li><b>Ton / Toff:</b> iletime geçme/kapanma süreleri.</li>
            <li><b>tr / tf:</b> yükselme/düşme süreleri.</li>
            <li>Uzun süreler → anahtarlama kaybı ve ısı.</li>
          </ul>
          <h4>Power converter grafikleri</h4>
          <p>Ripple, verim, ısınma ve stabilite osiloskopla izlenir; kararsız (salınan) çıkış feedback sorununa işaret eder.</p>
          <div class="callout warn"><b>Sık teşhis:</b> Switch node'da aşırı ringing/overshoot → snubber veya gate direnci sorunu. Ölü zaman yordamıyla shoot-through aranır.</div>
        `,
        key: ["Switch node kare dalga + ringing.", "Bobin akımı testere dişi.", "Ton/Toff ve tr/tf anahtarlama kaybını belirler.", "Kararsız çıkış = feedback sorunu."],
        quiz: [
          { q: "Bobin akımı grafiği nasıl görünür?", o: ["Sinüs", "Testere dişi", "Sabit", "Kare"], a: 1, e: "Üçgen/testere." },
          { q: "Aşırı ringing/overshoot nedeni?", o: ["Snubber/gate direnci", "Sigorta", "LED", "Röle"], a: 0, e: "Snubber ve gate direnci." }
        ]
      },
      {
        id: "m10l3", title: "Data Grafikleri ve SMPS Grafik Analizi", video: "Osiloskop • 06",
        content: `
          <h4>Data grafikleri analizi</h4>
          <ul>
            <li>Haberleşme hatlarında bit zamanı ve seviye (I2C/UART/SPI) doğrulanır.</li>
            <li>ADC/sensör çıkışında doğrusallık ve gürültü izlenir.</li>
            <li>Kenarlarda jitter (zaman titremesi) ve glitch aranır.</li>
          </ul>
          <h4>SMPS grafik analizi</h4>
          <ul>
            <li><b>Çıkış ripple:</b> kabul edilebilir mi? Büyükse çıkış kondansatörü/ESR.</li>
            <li><b>Switch node:</b> PWM + ringing.</li>
            <li><b>Yumuşak başlatma (soft-start):</b> çıkış yavaş mı yükseliyor?</li>
            <li><b>Aşırı yük:</b> akım sınırı devreye giriyor mu (darbe daralması)?</li>
          </ul>
          <div class="callout tip"><b>Altın yaklaşım:</b> Bir grafik aldığında önce besleme, sonra anahtarlama, en son sinyal katına bak. Grafiği ölçüm noktasıyla birlikte kaydet; arıza öncesi/sonrası karşılaştır.</div>
        `,
        key: ["Data grafikleri: bit zamanı, seviye, jitter.", "SMPS grafiği: ripple, switch node, soft-start.", "Önce besleme → anahtarlama → sinyal.", "Referans grafikleri karşılaştır."],
        quiz: [
          { q: "SMPS çıkış ripple büyükse?", o: ["Sigorta", "Çıkış kondansatörü/ESR", "LED", "Röle"], a: 1, e: "Çıkış kap/ESR kontrol." },
          { q: "Grafik analizinde önce neye bakılır?", o: ["Sinyal", "Besleme", "Renk", "Kasa"], a: 1, e: "Önce besleme." }
        ]
      }
    ]
  },

  /* ===================== m11 — MULTİMETRE ÖLÇÜM REHBERİ ============== */
  {
    id: "m11", set: "multimetre", title: "Multimetre Ölçüm Rehberi", icon: "🔬",
    desc: "Tüm kademeler; direnç, diyot, transistör, MOSFET, kondansatör ölçüm yöntemleri ve pratik ipuçları.",
    lessons: [
      {
        id: "m11l1", title: "Kademeler ve Doğru Kullanım", video: "Multimetre • 01",
        content: `
          <table class="tbl">
            <tr><th>Mod</th><th>Ölçüm</th><th>Bağlantı</th></tr>
            <tr><td>V⎓</td><td>DC gerilim</td><td>Paralel</td></tr>
            <tr><td>V∼</td><td>AC gerilim</td><td>Paralel</td></tr>
            <tr><td>Ω</td><td>Direnç</td><td>Enerjisiz, dışta</td></tr>
            <tr><td>🔔</td><td>Süreklilik</td><td>Kısa test</td></tr>
            <tr><td>→|</td><td>Diyot</td><td>İki yön</td></tr>
            <tr><td>A</td><td>Akım</td><td>Seri</td></tr>
          </table>
          <div class="callout warn"><b>Güvenlik:</b> Direnç/süreklilik <b>enerjisiz</b>; akım ölçümü <b>seri</b>. Yanlış mod sigortayı yakar.</div>
          <h4>Pratik kurallar</h4>
          <ul>
            <li>Bilinmeyen gerilimde en yüksek kademeden başla.</li>
            <li>Enerjili hatta direnç ölçme.</li>
            <li>Devre içi ölçümde paralel yollar sonucu etkiler; şüphede bileşeni sök.</li>
          </ul>
        `,
        key: ["V paralel, A seri.", "Direnç enerjisiz.", "En yüksek kademeden başla.", "Devre içi ölçüm yanıltabilir."],
        quiz: [
          { q: "Direnç ölçümü hangi durumda?", o: ["Enerjili", "Enerjisiz", "Farketmez", "Kısmen"], a: 1, e: "Enerjisiz." },
          { q: "Akım ölçümü bağlantısı?", o: ["Paralel", "Seri", "GND", "Yok"], a: 1, e: "Seri." }
        ]
      },
      {
        id: "m11l2", title: "Eleman Ölçümleri: Diyot, Transistör, MOSFET", video: "Multimetre • 02",
        content: `
          <h4>Diyot</h4>
          <p>Diyot modu: ileri yönde ~0,5–0,7 V düşüm = sağlam; iki yönde 0 (kısa) veya iki yönde açık = arızalı.</p>
          <h4>Transistör (BJT)</h4>
          <ul>
            <li>B-E ve B-C kavşakları diyot gibi ölçülür (~0,7 V ileri).</li>
            <li>C-E arası kısa ise bozuk.</li>
            <li>NPN/PNP yönleri ters.</li>
          </ul>
          <h4>MOSFET</h4>
          <ul>
            <li>D-S arası kısa (0 Ω) = bozuk (en yaygın).</li>
            <li>G hiç ölçülmez (kapasitif; kapı yüklü kalabilir).</li>
            <li>Arızalı MOSFET bazen patlar/kısa kalır.</li>
          </ul>
          <div class="callout tip"><b>Bileşen numarası:</b> Kart üzerindeki "Q" (transistör/MOSFET), "D" (diyot), "C" (kondansatör), "U" (IC), "R" (direnç), "L" (bobin), "F" (sigorta) işaretleri kimi gösterir.</div>
        `,
        key: ["Diyot: tek yön ~0,7 V.", "BJT: B-E/B-C diyot gibi; C-E kısa = bozuk.", "MOSFET: D-S kısa en yaygın arıza.", "Referans harfleri: Q/D/C/U/R/L/F."],
        quiz: [
          { q: "MOSFET arızasında en yaygın ölçüm?", o: ["G açık", "D-S kısa", "B-E", "Kapasite 0"], a: 1, e: "D-S kısa devre." },
          { q: "'U' referansı neyi gösterir?", o: ["Direnç", "Kondansatör", "Entegre (IC)", "Diyot"], a: 2, e: "U = IC." }
        ]
      },
      {
        id: "m11l3", title: "Kondansatör/ESR ve Sinyal Ölçümleri", video: "Multimetre • 03",
        content: `
          <h4>Kondansatör</h4>
          <ul>
            <li>Kapasite modu: nominalin altında → değiştir.</li>
            <li><b>ESR:</b> ESR metre ile; yüksekse arızalı.</li>
            <li>Direnç modunda sürekli düşük direnç = delinmiş.</li>
          </ul>
          <h4>Frekans / duty (bazı multimetreler)</h4>
          <ul>
            <li>Hz kademesi: PWM/frekans ölçümü (osiloskop tercih).</li>
            <li>Duty %: kare dalga oranı.</li>
          </ul>
          <h4>Sıcaklık / süreklilik / diyot testleri</h4>
          <ul>
            <li>Süreklilik: kopuk hat, sigorta, bobin.</li>
            <li>Sıcaklık (termokupl prob): komponent sıcaklığı.</li>
          </ul>
          <div class="callout info"><b>True RMS:</b> Düzgün olmayan (bozuk) dalga şekillerinde doğru ölçüm için True-RMS multimetre gerekir.</div>
        `,
        key: ["Kapasite nominalin altı = değiştir.", "ESR yüksek = arızalı.", "Süreklilik kopuk hat için.", "Bozuk dalgada True RMS gerekir."],
        quiz: [
          { q: "Kondansatör sağlamlığı için en iyi parametre?", o: ["Renk", "ESR", "Boyut", "Marka"], a: 1, e: "ESR." },
          { q: "Bozuk dalga şeklinde hangi multimetre?", o: ["Normal", "True RMS", "Analog", "Hiç"], a: 1, e: "True RMS." }
        ]
      }
    ]
  },

  /* ===================== m12 — KART TAMİRİNE BAŞLANGIÇ =============== */
  {
    id: "m12", set: "tamir", title: "Kart Tamirine Başlangıç Rehberi", icon: "🧰",
    desc: "Sistemli ön hazırlık, check-list ve ilk kontrol adımları — FixBoard mantığı.",
    lessons: [
      {
        id: "m12l1", title: "Ön Hazırlık ve Güvenli Ortam", video: "Tamir • 01",
        content: `
          <p>Tamirin yarısı doğru ortam ve hazırlıktır.</p>
          <h4>Ekipman</h4>
          <ul>
            <li>Akım sınırlı güç kaynağı, multimetre, (mümkünse) osiloskop.</li>
            <li>Sıcaklık ayarlı havya + flux + lehim.</li>
            <li>ESD bileklik, termal kamera/termometre.</li>
            <li>İzopropil alkol, fırça, büyüteç/lup.</li>
          </ul>
          <h4>Ortam ve güvenlik</h4>
          <ul>
            <li>İyi aydınlatma, sabit çalışma tezgahı, ESD korumalı.</li>
            <li>Büyük kondansatörleri deşarj et.</li>
            <li>Kartın besleme şemasını not al.</li>
          </ul>
          <div class="callout warn"><b>Altın kural:</b> Müdahaleden önce kartın nasıl besleneceğini, hangi ray gerilimlerinin olması gerektiğini netleştir.</div>
        `,
        key: ["Doğru ekipman + ESD ortam.", "Kondansatörleri deşarj et.", "Besleme şemasını netleştir."],
        quiz: [
          { q: "Tamir ortamında olması gereken?", o: ["Halı", "ESD korumalı/aydınlık", "Nemli", "Karanlık"], a: 1, e: "Statik ve iyi ışık." },
          { q: "Karta müdahaleden önce?", o: ["Deşarj", "Isıt", "Salla", "Boya"], a: 0, e: "Kondansatörleri deşarj et." }
        ]
      },
      {
        id: "m12l2", title: "Sistemli İlk Kontroller (Check-List)", video: "Tamir • 02",
        content: `
          <p>Kart tamirine başlarken sırayla uygulanacak kontroller:</p>
          <h4>1. Gözle muayene</h4>
          <ul>
            <li>Yanık/kararmış bölge, patlamış/şişmiş kondansatör, çatlak lehim.</li>
            <li>Soket gevşekliği, eğik bacak, giren sıvı/oksit.</li>
          </ul>
          <h4>2. Sigorta ve koruma</h4>
          <ul>
            <li>Giriş sigortası süreklilik, varistör (MOV), NTC.</li>
          </ul>
          <h4>3. Kısa devre taraması (enerjisiz)</h4>
          <ul>
            <li>Ana ray – GND direnci (çok düşük = kısa devre).</li>
            <li>Anahtarlama MOSFET / çıkış diyodu kısa testi.</li>
          </ul>
          <h4>4. Enerjili ilk kontrol (akım sınırlı)</h4>
          <ul>
            <li>Akım sınıra dayanıyor mu? Ray gerilimleri doğru mu? Isınma var mı?</li>
          </ul>
          <div class="callout tip"><b>Sonraki adım:</b> Bu kontrollerden sonra belirtiye göre ilgili blok (giriş, PFC, SMPS, kontrol) üzerinde voltage-drop / enjeksiyon tekniklerine geç.</div>
        `,
        key: ["Gözle muayene → sigorta → kısa devre → enerjili kontrol.", "Kısa devreyi enerjisiz ara.", "Enerjiliyi akım sınırlı yap.", "Sonra belirtiye göre bloğa in."],
        quiz: [
          { q: "Kısa devre taraması hangi durumda?", o: ["Enerjili", "Enerjisiz", "Farketmez", "Açık"], a: 1, e: "Enerjisiz." },
          { q: "İlk kontrol sırası?", o: ["Göz→sigorta→kısa devre", "Kısa→göz→sigorta", "Farketmez", "Sadece ölçüm"], a: 0, e: "Önce gözle, sonra sigorta, sonra kısa devre." }
        ]
      },
      {
        id: "m12l3", title: "Belirtiye Göre Yönlendirme", video: "Tamir • 03",
        content: `
          <p>Belirtiden arıza katına hızlı haritalama:</p>
          <table class="tbl">
            <tr><th>Belirti</th><th>Muhtemel kat</th></tr>
            <tr><td>Hiç açılmıyor, sigorta atık</td><td>Giriş, kısa devre, köprü/PFC MOSFET</td></tr>
            <tr><td>Açılıp hemen kapanıyor</td><td>Feedback, aşırı akım koruması, VCC</td></tr>
            <tr><td>Standby var, açılmıyor</td><td>Ana besleme, PFC, anahtarlama</td></tr>
            <tr><td>Çıkış yüksek</td><td>Feedback kopuk (opto/bölücü)</td></tr>
            <tr><td>Aşırı ısınma</td><td>Kısa devreli bileşen, aşırı yük, kap ESR</td></tr>
            <tr><td>Kararsız/salınan çıkış</td><td>Feedback filtre, VCC, kompansasyon</td></tr>
          </table>
          <h4>Genel yönlendirme</h4>
          <ol>
            <li>Belirti → kat.</li>
            <li>Kat içinde voltage drop / enjeksiyon.</li>
            <li>Şüpheliyi ölç → doğrula → değiştir.</li>
            <li>Onarım sonrası doğrula ve test et.</li>
          </ol>
          <div class="callout warn"><b>Tekrar bozuluyorsa:</b> kök nedeni bul (ters gerilim, aşırı akım, ısı, yanlış değer). Parçayı değiştirmek kök nedeni çözmez.</div>
        `,
        key: ["Belirti → muhtemel kat haritası.", "Kat içinde voltage drop/enjeksiyon.", "Ölç→doğrula→değiştir→test.", "Tekrar bozuluyorsa kök nedeni ara."],
        quiz: [
          { q: "Çıkış aşırı yüksekse hangi kat?", o: ["Giriş", "Feedback", "Trafo", "LED"], a: 1, e: "Feedback kopuk." },
          { q: "Aynı parça tekrar bozulursa?", o: ["Büyük tak", "Kök nedeni bul", "Tel köprüle", "At"], a: 1, e: "Kök neden." }
        ]
      }
    ]
  },

  /* ===================== m13 — HABERLEŞME PROTOKOLLERİ =============== */
  {
    id: "m13", set: "temel", title: "Haberleşme Protokolleri", icon: "📡",
    desc: "UART, I2C, SPI, CAN — kart-arası haberleşme, seviye çevirici ve izolasyon.",
    lessons: [
      {
        id: "m13l1", title: "UART / RS-232 / RS-485", video: "Haberleşme • 01",
        content: `
          <p><b>UART</b>, iki cihaz arasında nokta-nokta asenkron seri haberleşmedir. <b>Baud hızı</b> iki tarafta eşit olmalıdır.</p>
          <ul>
            <li><b>TX</b> (gönderici) ve <b>RX</b> (alıcı) hatları; çapraz bağlanır (A'nın TX'i → B'nin RX'i).</li>
            <li>Ortak <b>GND</b> şarttır.</li>
          </ul>
          <h4>RS-232 / RS-485</h4>
          <ul>
            <li><b>RS-232:</b> ±voltaj seviyeleri, nokta-nokta, kısa mesafe.</li>
            <li><b>RS-485:</b> <b>Diferansiyel</b> (A/B), çok cihaz (bus), gürültüye dayanıklı, uzun mesafe (endüstri).</li>
          </ul>
          <div class="callout info"><b>Teşhis:</b> Haberleşmiyorsa TX pininde osiloskopla dalga ara. Dalga yoksa MCU göndermiyor; varsa baud/kablo/alıcı sorunu. RS-485'te A-B arası 120 Ω sonlandırma kontrol et.</div>
        `,
        key: ["UART asenkron, nokta-nokta, baud eşit.", "TX↔RX çapraz bağlanır.", "RS-485 diferansiyel ve çok cihazlı.", "Haberleşme sorununda TX dalgasını osiloskopla ara."],
        quiz: [
          { q: "UART'ta iki cihaz nasıl bağlanır?", o: ["TX-TX", "TX-RX çapraz", "Sadece GND", "Paralel"], a: 1, e: "Birinin TX'i diğerinin RX'ine." },
          { q: "Uyumsuzlukta ilk bakılan?", o: ["Renk", "Baud hızı", "Kasa", "Isı"], a: 1, e: "Baud eşit değilse veri bozulur." }
        ]
      },
      {
        id: "m13l2", title: "I2C Bus", video: "Haberleşme • 02",
        content: `
          <p><b>I2C</b>, 2 hatlı (SDA=veri, SCL=saat) çok cihazlı seri bus'tır. Her cihazın bir <b>adresi</b> vardır.</p>
          <ul>
            <li><b>Pull-up direnç</b> (genelde 4,7 kΩ) hat başına zorunludur.</li>
            <li>Hat boşta yüksek (3,3/5 V) kalır; cihaz hattı aşağı çeker.</li>
            <li>Kısa mesafe; sensör, EEPROM, RTC için ideal.</li>
          </ul>
          <div class="callout warn"><b>Sık arıza:</b> Pull-up eksik/arızalı → hat çöker. SDA/SCL kısa devre olursa cihazlar hiç açılmaz. Osiloskopla SDA/SCL'de kare dalga ara.</div>
        `,
        key: ["I2C: SDA + SCL, adresli, çok cihaz.", "Pull-up direnç zorunlu.", "Eksikse hat çöker.", "SDA/SCL'de kare dalga ara."],
        quiz: [
          { q: "I2C'de kaç hat?", o: ["1", "2", "4", "8"], a: 1, e: "SDA ve SCL." },
          { q: "I2C'de zorunlu eleman?", o: ["Kondansatör", "Pull-up direnç", "Diyot", "Bobin"], a: 1, e: "Açık kolektör → pull-up." }
        ]
      },
      {
        id: "m13l3", title: "SPI Bus", video: "Haberleşme • 03",
        content: `
          <p><b>SPI</b>, 4 hatlı (SCK, MOSI, MISO, CS) hızlı seri bus'tır.</p>
          <ul>
            <li>Her slave için ayrı <b>CS (chip select)</b> hattı.</li>
            <li>I2C'den <b>daha hızlı</b> (10+ Mbit); Flash, ekran, ADC için.</li>
            <li>Full-duplex (aynı anda gönder/al).</li>
          </ul>
          <table class="tbl">
            <tr><th></th><th>I2C</th><th>SPI</th></tr>
            <tr><td>Hat</td><td>2 (SDA/SCL)</td><td>4 (SCK/MOSI/MISO/CS)</td></tr>
            <tr><td>Hız</td><td>Orta</td><td>Yüksek</td></tr>
            <tr><td>Çok cihaz</td><td>Adresle</td><td>CS ile</td></tr>
          </table>
          <div class="callout info"><b>Teşhis:</b> SPI çalışmıyorsa CS hattını ve SCK saatini kontrol et; CS yanlış slave'e gidiyorsa veri gelmez.</div>
        `,
        key: ["SPI 4 hat: SCK/MOSI/MISO/CS.", "Her slave'e ayrı CS.", "I2C'den hızlı, full-duplex.", "Teşhiste CS ve SCK kontrol."],
        quiz: [
          { q: "SPI'de slave seçimi?", o: ["SDA", "CS", "MOSI", "SCK"], a: 1, e: "CS/SS ile." },
          { q: "SPI kaç hatlı?", o: ["1", "2", "4", "3"], a: 2, e: "SCK/MOSI/MISO/CS." }
        ]
      },
      {
        id: "m13l4", title: "CAN, Seviye Çevirici ve İzolasyon", video: "Haberleşme • 04",
        content: `
          <p><b>CAN</b>, otomotiv/endüstriyel <b>diferansiyel</b> bus'tır (CANH/CANL). Çok master'lı, hata toleranslı.</p>
          <ul>
            <li>Bus uçlarında <b>120 Ω</b> sonlandırma (toplamda 60 Ω).</li>
            <li>Mesajlar ID ile önceliklendirilir; hata tekrar gönderim var.</li>
          </ul>
          <h4>Seviye çevirici</h4>
          <p>3,3 V mantık ile 5 V cihazı bağlamak için <b>seviye çevirici</b> (MOSFET'li çift yönlü) gerekir; yoksa çip zarar görür.</p>
          <h4>İzolasyon</h4>
          <p>Optokuplör veya dijital izolatör ile farklı beslemeli/gürültülü devreler ayrılır (galvanik izolasyon).</p>
          <div class="callout info"><b>Teşhis:</b> CAN'da iletişim yoksa önce 120 Ω sonlandırma ve hat kısa devresini kontrol et.</div>
        `,
        key: ["CAN diferansiyel, çok master'lı, 120 Ω sonlandırma.", "Seviye çevirici 3,3↔5 V uyum sağlar.", "Optokuplör/izolatör galvanik izolasyon.", "CAN sorununda sonlandırma+hat."],
        quiz: [
          { q: "CAN sonlandırma direnci?", o: ["50 Ω", "120 Ω", "220 Ω", "1 kΩ"], a: 1, e: "Her uçta 120 Ω." },
          { q: "3,3 V ↔ 5 V bağlamak için?", o: ["Direnç", "Seviye çevirici", "Diyot", "Bobin"], a: 1, e: "Aksi halde çip zarar görür." }
        ]
      }
    ]
  },

  /* ===================== m14 — ANALOG & SENSÖRLER =================== */
  {
    id: "m14", set: "temel", title: "Analog Elektronik ve Sensörler", icon: "📈",
    desc: "Op-amp uygulamaları, filtreler, sensör zinciri, referans ve sabit akım kaynağı.",
    lessons: [
      {
        id: "m14l1", title: "Op-amp Uygulamaları", video: "Analog • 01",
        content: `
          <p>Op-amp'in görevi çevresindeki direnç/kondansatörlerle belirlenir.</p>
          <ul>
            <li><b>Gerilim izleyici:</b> kazanç 1, tampon.</li>
            <li><b>Ters çeviren:</b> kazanç −Rf/Rin.</li>
            <li><b>Ters çevirmeyen:</b> kazanç 1 + Rf/Rin.</li>
            <li><b>Integral/türev:</b> geri beslemede kondansatör (sinyal işleme).</li>
            <li><b>Karşılaştırıcı / Schmitt:</b> pozitif geri besleme ile histerezis (gürültüye bağışıklı).</li>
          </ul>
          <div class="callout info"><b>Teşhis:</b> Geri beslemeli op-amp'te girişler ≈ eşit olmalı. Değilse besleme, direnç veya çip arızalıdır.</div>
        `,
        key: ["Kazanç dirençlerle ayarlanır.", "İzleyici/ters/ters-olmayan/integral.", "Schmitt histerezis verir.", "Girişler eşit değilse arıza ara."],
        quiz: [
          { q: "Ters çevirmeyen yükselteç kazancı?", o: ["−Rf/Rin", "1+Rf/Rin", "Rf×Rin", "1"], a: 1, e: "1 + Rf/Rin." },
          { q: "Gürültüye bağışıklı karşılaştırıcı?", o: ["İzleyici", "Schmitt trigger", "Regülatör", "Filtre"], a: 1, e: "Pozitif geri besleme (histerezis)." }
        ]
      },
      {
        id: "m14l2", title: "Filtreler ve Frekans", video: "Analog • 02",
        content: `
          <p>Filtre bazı frekansları geçirir, bazılarını bastırır.</p>
          <ul>
            <li><b>Alçak geçiren (LPF):</b> düşüğü geçirir.</li>
            <li><b>Yüksek geçiren (HPF):</b> yükseği geçirir.</li>
            <li><b>Bant geçiren (BPF) / bant durduran (notch).</b></li>
          </ul>
          <div class="formula">fc = 1 / (2πRC)</div>
          <p><b>LC filtre:</b> bobin + kondansatör; <b>Sallen-Key:</b> op-amp'lı aktif filtre (dik geçiş).</p>
          <div class="callout tip"><b>Neden önemli?</b> ADC öncesi LPF <b>alias</b>'ı önler; besleme/EMC filtreleri gürültüyü bastırır.</div>
        `,
        key: ["LPF/HPF/BPF/notch.", "fc = 1/(2πRC).", "LC pasif, Sallen-Key aktif.", "ADC öncesi LPF alias önler."],
        quiz: [
          { q: "Alçak geçiren filtre neyi geçirir?", o: ["Yüksek f", "Düşük f", "Sadece DC", "Hiçbiri"], a: 1, e: "Düşük frekansları." },
          { q: "R=1k, C=160nF → fc ≈ ?", o: ["1 Hz", "100 Hz", "1 kHz", "10 kHz"], a: 2, e: "≈1 kHz." }
        ]
      },
      {
        id: "m14l3", title: "Sensörler ve Sinyal Zinciri", video: "Analog • 03",
        content: `
          <p>Sensörler fiziksel büyüklüğü elektriğe çevirir. Tipik zincir: <b>sensör → şartlandırma → ADC → MCU</b>.</p>
          <ul>
            <li><b>NTC / PT100:</b> sıcaklık → direnç.</li>
            <li><b>Termokupul:</b> yüksek sıcaklık → mV.</li>
            <li><b>Strain gauge / yük hücresi:</b> gerilme → köprü gerilimi (µV).</li>
            <li><b>Hall:</b> akım/manyetik → gerilim.</li>
          </ul>
          <p><b>Wheatstone köprüsü</b> ile çok küçük fark gerilimi ölçülür; <b>enstrümantasyon yükselteci (INA)</b> ile çok yükseltilir.</p>
          <div class="callout warn"><b>Arıza:</b> Sensör okuması saçmalıyorsa önce bağlantı, referans ve şartlandırma dirençlerini kontrol et; sensörü değiştirmeden zinciri doğrula.</div>
        `,
        key: ["Zincir: şartlandırma → ADC → MCU.", "NTC/PT100/termokupul/strain/Hall.", "Küçük sinyal köprü + INA ile.", "Önce zinciri, sonra sensörü değiştir."],
        quiz: [
          { q: "NTC çıkışı?", o: ["Gerilim", "Direnç", "Akım", "Frekans"], a: 1, e: "Sıcaklıkla değişen direnç." },
          { q: "Küçük köprü sinyali hangi yapıyla?", o: ["Röle", "INA/köprü yükselteci", "Diyot", "Kondansatör"], a: 1, e: "Enstrümantasyon yükselteci." }
        ]
      },
      {
        id: "m14l4", title: "Gerilim Referansı ve Sabit Akım", video: "Analog • 04",
        content: `
          <h4>Gerilim referansı</h4>
          <p><b>TL431</b>, ayarlanabilir referanstır: <b>Vout = 2,5 × (1 + R1/R2)</b>. SMPS feedback ve ölçüm referansında kullanılır.</p>
          <h4>Sabit akım kaynağı</h4>
          <p>Transistör + referans (zener/LED) ile yükten bağımsız sabit akım üretilir: <b>I ≈ Vref / Re</b>. LED sürme ve akım ölçümünde kullanılır.</p>
          <h4>Akım ölçümü (shunt)</h4>
          <p>Küçük bir <b>shunt direnci</b> üzerindeki gerilim düşümü ölçülerek akım bulunur (I = Vshunt/Rshunt).</p>
          <div class="callout info"><b>Teşhis:</b> Referans kayması tüm ölçüm/çıkışı bozar. TL431 ve feedback bölücü dirençlerini kontrol et.</div>
        `,
        key: ["TL431: Vout = 2,5×(1+R1/R2).", "Sabit akım: I ≈ Vref/Re.", "Akım ölçümü shunt ile.", "Referans kayması her şeyi bozar."],
        quiz: [
          { q: "TL431 referansı kaç volttur (iç)?", o: ["1,2 V", "2,5 V", "3,3 V", "5 V"], a: 1, e: "2,5 V." },
          { q: "Akım ölçümü nasıl yapılır?", o: ["Shunt gerilimi", "Renk", "Sıcaklık", "Frekans"], a: 0, e: "Shunt üzerindeki düşüm." }
        ]
      }
    ]
  }
];

/* =========================================================================
   SETLER (Eğitim paketleri) — görseldeki tabloya göre
   ========================================================================= */
const SETS = [
  {
    id: "temel", title: "Temel Elektronik Seti", level: "Başlangıç", color: "#e0342c",
    videos: 17, duration: "2s 30dk", size: "1.62 GB",
    desc: "Elektroniğin temeli: bileşenler, devre analizi ve MCU mantığı.",
    modules: ["m0", "m1", "m2", "m13", "m14"],
    topics: ["Direnç", "Kondansatör", "Bobin & Filtreler", "Diyotlar", "Zener Diyot", "Transformatörler", "Transistörler", "Opamp", "MOSFET", "Röleler", "Power Converter", "PWM Nedir", "Lojik Kapılar", "MCU Cihazı Mantığı", "MCU Feedback"]
  },
  {
    id: "guc", title: "Güç Elektroniği Seti", level: "Orta", color: "#e0a52c",
    videos: 29, duration: "3s 20dk", size: "3.11 GB",
    desc: "Besleme yöntemleri, SMPS mantığı, topolojiler ve HS/LS MOSFET.",
    modules: ["m3"],
    topics: ["Direnç İle Besleme", "Transformatör İle Besleme", "Voltaj Regülatörü İle Besleme", "SMPS Çalışma Mantığı", "HV Power", "Power Converter Topolojileri", "HS LS MOSFET Topolojileri", "Uygulamalı Eğitim 1-2-3"]
  },
  {
    id: "ariza", title: "Arıza Bulma Teknikleri Seti", level: "Orta", color: "#2ca6d8",
    videos: 20, duration: "3s 50dk", size: "1.33 GB",
    desc: "Sistematik teşhis, voltage drop, enjeksiyon, şema ve BoardView.",
    modules: ["m7", "m8"],
    topics: ["Voltage Drop Teknikleri 1-2-3", "Kondansatör Üzerinden Arıza Bulma 1-2", "Voltaj Enjeksiyonu 1-2-3", "Devre Kartı Yorumlama", "Şema Kullanımı 1-2-3", "BoardView Kullanımı", "Arıza Tespitinin Arka Planı"]
  },
  {
    id: "anahtarlamali", title: "Anahtarlamalı Güç Devreleri Seti", level: "İleri", color: "#c9a227",
    videos: 35, duration: "3s 35dk", size: "4.62 GB",
    desc: "Dönüştürücüler, izolasyonlu topolojiler, gate driver ve saha uygulamaları.",
    modules: ["m4", "m5", "m6"],
    topics: ["AC Akımda Bobin", "Akım Kondansatör", "Skin Effect", "Frekans Duty Cycle", "EMI Filtre", "Buck Boost Converter", "Power Factor Correction", "Akım Limitleme", "Optocoupler", "Triphase Doğrultucular", "Kuplaj Kondansatörleri", "Flyback Topolojileri", "Yarım/Tam Köprü", "Push Pull", "Tristör Inverter", "Statik Power", "Gate Driver", "Bootstrap", "Triphase Inverter", "Feedback Arızaları", "SMPS Uygulama"]
  },
  {
    id: "osiloskop", title: "Osiloskop Kullanımı ve Grafik Analizi", level: "Uzman", color: "#8a8a3c",
    videos: 11, duration: "2s 22dk", size: "8.97 GB",
    desc: "Osiloskop sıfırdan ileri: ölçekler, trigger, grafik ve SMPS analizi.",
    modules: ["m9", "m10"],
    topics: ["Osiloskop Nedir", "Sample Rate", "Time/Volt Div", "Alternans", "Vpp/Vmax/Vrms", "Duty Cycle", "Trigger Edge", "AC Kuplaj", "AC Sinyal Ölçümleri", "Parazit Tarama", "Buck/Boost Grafikleri", "Anahtarlama Süreleri", "Power Converter Grafikleri", "SMPS Grafik Analizi"]
  },
  {
    id: "multimetre", title: "Multimetre Ölçüm Rehberi", level: "Başlangıç+", color: "#2cc6a0",
    videos: 0, duration: "Rehber", size: "HTML",
    desc: "Tüm kademeler ve eleman ölçüm yöntemleri (diyot/transistör/MOSFET/kap).",
    modules: ["m11"],
    topics: ["DC/AC Gerilim", "Direnç/Süreklilik", "Diyot Modu", "Transistör Ölçümü", "MOSFET Ölçümü", "Kondansatör/ESR", "True RMS", "Pratik İpuçları"]
  },
  {
    id: "tamir", title: "Kart Tamirine Başlangıç Rehberi", level: "Başlangıç+", color: "#3a7bd5",
    videos: 0, duration: "Rehber", size: "HTML",
    desc: "Sistemli ön hazırlık, check-list ve belirtiye göre yönlendirme.",
    modules: ["m12"],
    topics: ["Ön Hazırlık", "Güvenli Ortam", "Gözle Muayene", "Sigorta/Koruma", "Kısa Devre Taraması", "Enerjili İlk Kontrol", "Belirti Haritası"]
  },
  {
    id: "toplu", title: "Toplu Paket", level: "Paket", color: "#e0342c", isPackage: true,
    videos: 71, duration: "9s 26dk", size: "9.28 GB",
    desc: "Temel + Güç + Arıza Bulma + Anahtarlamalı Güç setleri.",
    includes: ["temel", "guc", "ariza", "anahtarlamali"],
    topics: []
  },
  {
    id: "prime", title: "Prime Paket", level: "Tam Paket", color: "#d4af37", isPackage: true,
    videos: 98, duration: "10s 29dk", size: "10.25 GB",
    desc: "5 temel set: Temel + Güç + Arıza + Anahtarlamalı + Osiloskop.",
    includes: ["temel", "guc", "ariza", "anahtarlamali", "osiloskop"],
    topics: []
  }
];

/* =========================================================================
   SÖZLÜK
   ========================================================================= */
const GLOSSARY = [
  { t: "Gerilim (V)", d: "İki nokta arasındaki potansiyel farkı; Volt." },
  { t: "Akım (I)", d: "Bir iletkenden geçen yük miktarı; Amper." },
  { t: "Direnç (R)", d: "Akıma karşı koyma; Ohm (Ω)." },
  { t: "Güç (P)", d: "P = V×I; Watt (W)." },
  { t: "Ohm Kanunu", d: "V = I × R." },
  { t: "AC", d: "Alternatif akım; yönü periyodik değişir." },
  { t: "DC", d: "Doğru akım; yönü sabit." },
  { t: "ESR", d: "Elektrolitik kondansatörün eşdeğer seri direnci; yükselirse arıza." },
  { t: "ESD", d: "Elektrostatik deşarj; elektroniğe zarar verir." },
  { t: "Ripple", d: "Doğrultulmuş DC'deki dalgalanma." },
  { t: "SMPS", d: "Anahtarlamalı güç kaynağı; yüksek verimli." },
  { t: "PFC", d: "Güç faktörü düzeltme." },
  { t: "Bulk Kondansatör", d: "Doğrultucu çıkışındaki büyük filtre kondansatörü." },
  { t: "Decoupling", d: "Çip besleme yanındaki gürültü emici kondansatör." },
  { t: "Flyback Diyot", d: "Bobin ters gerilimini sönümleyen diyot." },
  { t: "Duty-cycle", d: "PWM'de '1' durumunun periyoda oranı." },
  { t: "Skin Effect", d: "Yüksek frekansta akımın iletken yüzeyinden akması." },
  { t: "Dead-time", d: "Köprü anahtarlarının çakışmasını önleyen ölü zaman." },
  { t: "Shoot-through", d: "HS+LS anahtarın aynı anda iletimi (kısa devre)." },
  { t: "Bootstrap", d: "High-side gate sürmek için diyot+kondansatör devresi." },
  { t: "Voltage Drop", d: "Hat üzerindeki gerilim düşümü ile arıza bulma tekniği." },
  { t: "Voltaj Enjeksiyonu", d: "Kontrollü gerilim verip arızalı bileşeni ısıtarak bulma." },
  { t: "BoardView", d: "Kart katman/ağ bağlantılarını gösteren yazılım." },
  { t: "Sample Rate", d: "Osiloskopta saniyedeki örnekleme sayısı." },
  { t: "Vpp", d: "Tepe-tepe gerilim." },
  { t: "Vrms", d: "Etkin (RMS) gerilim; sinüs için ≈Vpp/(2√2)." },
  { t: "Trigger", d: "Osiloskopta dalgayı sabitleyen tetikleme." },
  { t: "True RMS", d: "Bozuk dalga şekillerinde doğru ölçüm yapan multimetre." },
  { t: "Optokuplör", d: "Işıkla galvanik izolasyon sağlayan eleman." },
  { t: "TL431", d: "Ayarlanabilir gerilim referansı (feedback)." },
  { t: "Snubber", d: "Anahtarlama sıçramasını söndüren RCD/RC ağı." },
  { t: "Inrush", d: "Açılışta çekilen ani yüksek akım." },
  /* ---- İngilizce olması zorunlu terimler (Türkçe açıklamalı) ---- */
  { t: "Voltage (V)", d: "Gerilim. İki nokta arasındaki elektriksel basınç; Volt ile ölçülür." },
  { t: "Current (I)", d: "Akım. İletkenden geçen yük miktarı; Amper ile ölçülür." },
  { t: "Resistor (R)", d: "Direnç. Akımı sınırlayan, en çok kullanılan bileşen; Ohm (Ω)." },
  { t: "Capacitor (C)", d: "Kondansatör. Yük depolayan bileşen; Farad (F)." },
  { t: "Inductor / Coil (L)", d: "Bobin. Manyetik alanda enerji depolayan sarım; Henry (H)." },
  { t: "Diode", d: "Diyot. Akımı tek yönde geçiren yarı iletken." },
  { t: "Zener Diode", d: "Zener diyot. Ters yönde belirli gerilimde sabitler; referans/koruma." },
  { t: "Schottky Diode", d: "Şotki diyot. Düşük gerilim düşümlü hızlı diyot; SMPS'te çıkış doğrultmada." },
  { t: "Transistor (BJT)", d: "Transistör. Küçük akımla büyük akımı kontrol eden anahtar/yükselteç." },
  { t: "Base / Collector / Emitter", d: "BJT'nin üç bacağı: Baz / Kolektör / Emiter." },
  { t: "MOSFET", d: "Gerilimle kontrol edilen alan etkili transistör. Güç anahtarlamanın temeli." },
  { t: "Gate / Drain / Source", d: "MOSFET'in üç bacağı: Kapı (gate) / Oluk (drain) / Kaynak (source)." },
  { t: "IGBT", d: "Yüksek güçte kullanılan, MOSFET+transistör karışımı anahtar." },
  { t: "Duty Cycle", d: "Görev çevrimi. PWM'de 'açık' kalma süresinin periyoda oranı (%)." },
  { t: "Buck Converter", d: "Düşürücü dönüştürücü. Çıkış gerilimi girişten küçüktür (12V→5V)." },
  { t: "Boost Converter", d: "Yükseltici dönüştürücü. Çıkış gerilimi girişten büyüktür (3.7V→12V)." },
  { t: "Buck-Boost", d: "Hem yükseltebilen hem düşürebilen dönüştürücü." },
  { t: "Flyback", d: "İzolasyonlu, düşük-orta güçlü SMPS topolojisi (şarj aletleri)." },
  { t: "Forward", d: "İzolasyonlu, flyback'e benzer topoloji; enerji iletimde aktarılır." },
  { t: "Half / Full Bridge", d: "Yarım / tam köprü. İzolasyonlu anahtarlama topolojileri." },
  { t: "Push-Pull", d: "İki anahtarın orta uçlu trafoyu sırayla sürdüğü topoloji." },
  { t: "Feedback", d: "Geri besleme. Çıkışı ölçüp girişe göre düzeltme; çıkışı sabit tutar." },
  { t: "Optocoupler", d: "Optokuplör. Işıkla devre izolasyonu; SMPS geri beslemesinde." },
  { t: "PWM", d: "Darbe Genişlik Modülasyonu. Hızlı aç/kapa ile 'analog hissi' verme." },
  { t: "Ripple", d: "Dalgalanma. Doğrultulmuş/anahtarlanmış DC'de istenmeyen salınım." },
  { t: "Snubber", d: "Söndürücü. Anahtarlama sıçramasını (ringing) bastıran RCD/RC ağı." },
  { t: "Ringing", d: "İstenmeyen salınım. Anahtarlama kenarlarında zil sesi gibi dalgalanma." },
  { t: "Overshoot", d: "Aşma. Sinyalin hedefin üstüne taşması." },
  { t: "Inrush / Soft-Start", d: "Açılış ani akımı / yumuşak başlatma ile sınırlama." },
  { t: "Bootstrap", d: "Yüksek taraf (high-side) MOSFET'i sürmek için diyot+kondansatör." },
  { t: "High-Side / Low-Side", d: "Yükün üstündeki / altındaki anahtar." },
  { t: "Dead-time", d: "Ölü zaman. Köprüde iki anahtarın çakışmasını önleyen kısa boşluk." },
  { t: "Shoot-through", d: "Köprüde yüksek+alçak anahtarın aynı anda iletime geçmesi (kısa devre)." },
  { t: "LDO", d: "Düşük giriş-çıkış farklı lineer regülatör." },
  { t: "Datasheet", d: "Veri sayfası. Bileşenin tüm teknik değerlerini veren belge." },
  { t: "SMD / Through-hole", d: "Yüzeye monte / delikten geçen montaj tipi." },
  { t: "PCB", d: "Baskı devre kartı. Bileşenlerin üzerine monte edildiği kart." },
  { t: "Pad / Via / Trace", d: "Lehim adası / katmanlar arası geçiş deliği / bakır yol." },
  { t: "Net", d: "Ağ. Kart üzerinde birbiriyle bağlı noktalar (ör. VCC, GND)." },
  { t: "Schematic", d: "Şema. Devrenin bileşen ve bağlantı çizimi." },
  { t: "Cold Joint", d: "Soğuk lehim. Donuk/granüllü, temassızlık yapan lehim." },
  { t: "Pull-up / Pull-down", d: "Giriş pinini tanımlı seviyede tutan direnç." },
  { t: "GPIO", d: "Genel amaçlı giriş/çıkış pini (mikrodenetleyici)." },
  { t: "Firmware / Bootloader", d: "Gömülü yazılım / yazılım güncelleyen küçük program." },
  { t: "UART / SPI / I2C / CAN", d: "Kart-arası haberleşme protokolleri (seri bus'lar)." },
  { t: "BoardView", d: "Kart katmanlarını ve ağ bağlantılarını gösteren yazılım." },
  { t: "Voltage Drop", d: "Gerilim düşümü tekniği. Hat üzerindeki düşümü ölçüp arızayı bulma." },
  { t: "True RMS", d: "Bozuk dalga şekillerinde doğru ölçüm yapan multimetre." },
  { t: "Skin Effect", d: "Yüksek frekansta akımın iletkenin yüzeyinden akması." },
  { t: "PFC (Power Factor Correction)", d: "Güç faktörü düzeltme; giriş akım fazını düzeltir." }
];

/* =========================================================================
   ARAÇLAR
   ========================================================================= */
const TOOL_META = [
  { id: "ohm",      name: "Ohm Kanunu",           desc: "V, I, R ilişkisi", icon: "Ω" },
  { id: "power",    name: "Güç Hesabı",           desc: "P = V×I = I²R = V²/R", icon: "W" },
  { id: "resistor", name: "Direnç Renk Kodu",     desc: "4-bant renk → değer", icon: "🎨" },
  { id: "divider",  name: "Gerilim Bölücü",       desc: "Vout hesaplama", icon: "÷" },
  { id: "led",      name: "LED Direnci",          desc: "Seri direnç seçimi", icon: "💡" },
  { id: "rc",       name: "RC Zaman Sabiti",      desc: "τ = R×C ve kesim f.", icon: "⏱" },
  { id: "series",   name: "Seri/Paralel Direnç",  desc: "Eşdeğer direnç", icon: "🔗" },
  { id: "unit",     name: "Birim Çevirici",       desc: "µ/n/p/m/k/M önekleri", icon: "🔢" }
];
