/* =========================================================================
   Elektronik Akademi — Hesaplayıcı Araçları
   Her araç: render(container) ile DOM'a çizilir.
   ========================================================================= */

const Eng = {
  // 1234.5 -> "1.23 k"
  fmt(v) {
    if (v === 0 || !isFinite(v)) return String(v);
    const a = Math.abs(v);
    const units = [
      [1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""],
      [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"]
    ];
    for (const [m, p] of units) {
      if (a >= m) {
        const n = v / m;
        return (Math.round(n * 1000) / 1000) + " " + p;
      }
    }
    return v.toExponential(3);
  },
  num(s) {
    if (s === "" || s == null) return NaN;
    s = String(s).replace(",", ".").trim().toUpperCase();
    const m = s.match(/^(-?[\d.]+)\s*(G|M|K|M?|m|u|µ|n|p)?/);
    if (!m) return NaN;
    let v = parseFloat(m[1]);
    const p = m[2];
    const mult = { "G": 1e9, "M": 1e6, "K": 1e3, "": 1, "M?": 1, "m": 1e-3, "u": 1e-6, "µ": 1e-6, "n": 1e-9, "p": 1e-12 };
    if (p && mult[p] != null) v *= mult[p];
    return v;
  }
};

function el(html) { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; }
function field(label, id, placeholder) {
  return `<label class="calc-field"><span>${label}</span><input id="${id}" type="text" inputmode="decimal" placeholder="${placeholder || ""}"></label>`;
}
function outBox(id) { return `<div class="calc-out" id="${id}"></div>`; }

const CALCULATORS = {

  /* --------------------------- OHM KANUNU --------------------------- */
  ohm(container) {
    container.appendChild(el(`
      <div class="calc">
        <p class="calc-hint">İki değeri gir, üçüncüsü hesaplanır. (V = I × R)</p>
        ${field("Gerilim V (Volt)", "ohm-v", "örn. 12")}
        ${field("Akım I (Amper)", "ohm-i", "örn. 0.02")}
        ${field("Direnç R (Ohm)", "ohm-r", "örn. 470")}
        ${outBox("ohm-out")}
        <button class="btn primary" id="ohm-go">Hesapla</button>
      </div>`));
    const go = () => {
      const V = Eng.num(document.getElementById("ohm-v").value);
      const I = Eng.num(document.getElementById("ohm-i").value);
      const R = Eng.num(document.getElementById("ohm-r").value);
      let res = "";
      if (!isNaN(V) && !isNaN(I)) { res = `R = V / I = <b>${Eng.fmt(V / I)}Ω</b>`; document.getElementById("ohm-r").value = Eng.fmt(V / I).replace(" ", ""); }
      else if (!isNaN(V) && !isNaN(R)) { res = `I = V / R = <b>${Eng.fmt(V / R)}A</b>`; document.getElementById("ohm-i").value = Eng.fmt(V / R).replace(" ", ""); }
      else if (!isNaN(I) && !isNaN(R)) { res = `V = I × R = <b>${Eng.fmt(I * R)}V</b>`; document.getElementById("ohm-v").value = Eng.fmt(I * R).replace(" ", ""); }
      else res = `<span class="bad">En az iki değer gir.</span>`;
      document.getElementById("ohm-out").innerHTML = res;
    };
    container.querySelector("#ohm-go").onclick = go;
  },

  /* ----------------------------- GÜÇ ------------------------------ */
  power(container) {
    container.appendChild(el(`
      <div class="calc">
        <p class="calc-hint">Gerilim ve akımı gir → güç hesaplanır. (P = V × I)</p>
        ${field("Gerilim V (Volt)", "p-v", "örn. 24")}
        ${field("Akım I (Amper)", "p-i", "örn. 0.5")}
        ${field("Direnç R (Ohm, opsiyonel)", "p-r", "örn. 48")}
        ${outBox("p-out")}
        <button class="btn primary" id="p-go">Hesapla</button>
      </div>`));
    container.querySelector("#p-go").onclick = () => {
      const V = Eng.num(document.getElementById("p-v").value);
      const I = Eng.num(document.getElementById("p-i").value);
      const R = Eng.num(document.getElementById("p-r").value);
      let lines = [];
      if (!isNaN(V) && !isNaN(I)) lines.push(`P = V × I = <b>${Eng.fmt(V * I)}W</b>`);
      if (!isNaN(I) && !isNaN(R)) lines.push(`P = I² × R = <b>${Eng.fmt(I * I * R)}W</b>`);
      if (!isNaN(V) && !isNaN(R)) lines.push(`P = V² / R = <b>${Eng.fmt(V * V / R)}W</b>`);
      document.getElementById("p-out").innerHTML = lines.length ? lines.join("<br>") : `<span class="bad">V veya I gir.</span>`;
    };
  },

  /* ------------------------ DİRENÇ RENK KODU ----------------------- */
  resistor(container) {
    const colors = [
      ["Siyah", "#111", 0, 1], ["Kahve", "#6b4423", 1, 10], ["Kırmızı", "#d32", 2, 100],
      ["Turuncu", "#e80", 3, 1e3], ["Sarı", "#dd0", 4, 1e4], ["Yeşil", "#2a2", 5, 1e5],
      ["Mavi", "#24d", 6, 1e6], ["Mor", "#a3c", 7, 1e7], ["Gri", "#888", 8, 1e8], ["Beyaz", "#eee", 9, 1e9]
    ];
    const opts = (n) => colors.slice(0, n).map((c, i) => `<option value="${i}">${c[0]}</option>`).join("");
    container.appendChild(el(`
      <div class="calc">
        <p class="calc-hint">4 bantlı direnç. Renkleri seç → değer okunur.</p>
        <label class="calc-field"><span>1. Bant</span><select id="r1">${opts(10)}</select></label>
        <label class="calc-field"><span>2. Bant</span><select id="r2">${opts(10)}</select></label>
        <label class="calc-field"><span>3. Bant (çarpan)</span><select id="r3">${colors.map((c, i) => `<option value="${i}">${c[0]} (×${Eng.fmt(c[3]).replace(" ", "")})</option>`).join("")}</select></label>
        <label class="calc-field"><span>Tolerans</span><select id="r4">
          <option value="1">Kahve (±%1)</option><option value="2">Kırmızı (±%2)</option>
          <option value="5" selected>Altın (±%5)</option><option value="10">Gümüş (±%10)</option></select></label>
        ${outBox("r-out")}
      </div>`));
    const calc = () => {
      const d1 = +container.querySelector("#r1").value;
      const d2 = +container.querySelector("#r2").value;
      const mult = colors[+container.querySelector("#r3").value][3];
      const tol = +container.querySelector("#r4").value;
      const val = (d1 * 10 + d2) * mult;
      const bands = [colors[d1][1], colors[d2][1], colors[+container.querySelector("#r3").value][1]];
      container.querySelector("#r-out").innerHTML =
        `<div class="r-preview">${bands.map(c => `<span style="background:${c}"></span>`).join("")}</div>` +
        `Değer: <b>${Eng.fmt(val)}Ω</b> &nbsp; (±%${tol})<br>Tolerans aralığı: ${Eng.fmt(val * (1 - tol / 100))}–${Eng.fmt(val * (1 + tol / 100))}Ω`;
    };
    container.querySelectorAll("select").forEach(s => s.onchange = calc);
    calc();
  },

  /* --------------------------- GERİLİM BÖLÜCÜ ---------------------- */
  divider(container) {
    container.appendChild(el(`
      <div class="calc">
        <p class="calc-hint">Vout = Vin × R2 / (R1 + R2). R2 GND'ye bağlı dirençtir.</p>
        ${field("Vin (Volt)", "d-vin", "örn. 12")}
        ${field("R1 (üst, Ohm)", "d-r1", "örn. 10k")}
        ${field("R2 (alt/GND, Ohm)", "d-r2", "örn. 4.7k")}
        ${outBox("d-out")}
        <button class="btn primary" id="d-go">Hesapla</button>
      </div>`));
    container.querySelector("#d-go").onclick = () => {
      const Vin = Eng.num(document.getElementById("d-vin").value);
      const R1 = Eng.num(document.getElementById("d-r1").value);
      const R2 = Eng.num(document.getElementById("d-r2").value);
      const o = document.getElementById("d-out");
      if ([Vin, R1, R2].some(isNaN)) { o.innerHTML = `<span class="bad">Tüm değerleri gir.</span>`; return; }
      const Vout = Vin * R2 / (R1 + R2);
      const I = Vin / (R1 + R2);
      o.innerHTML = `Vout = <b>${Eng.fmt(Vout)}V</b><br>Bölücü akımı: ${Eng.fmt(I)}A<br>Güç (R1+R2 toplam): ${Eng.fmt(Vin * I)}W`;
    };
  },

  /* ----------------------------- LED ------------------------------- */
  led(container) {
    container.appendChild(el(`
      <div class="calc">
        <p class="calc-hint">R = (Vkaynak − Vf) / I. LED'i korumak için seri direnç seç.</p>
        ${field("Vkaynak (Volt)", "l-vs", "örn. 5")}
        ${field("LED Vf (Volt) — kırmızı 2, mavi/beyaz 3.2", "l-vf", "örn. 2")}
        ${field("LED akımı I (mA)", "l-i", "örn. 15")}
        ${outBox("l-out")}
        <button class="btn primary" id="l-go">Hesapla</button>
      </div>`));
    container.querySelector("#l-go").onclick = () => {
      const Vs = Eng.num(document.getElementById("l-vs").value);
      const Vf = Eng.num(document.getElementById("l-vf").value);
      const I = Eng.num(document.getElementById("l-i").value) / 1000;
      const o = document.getElementById("l-out");
      if ([Vs, Vf, I].some(isNaN) || I <= 0) { o.innerHTML = `<span class="bad">Değerleri gir.</span>`; return; }
      if (Vs <= Vf) { o.innerHTML = `<span class="bad">Vkaynak, Vf'ten büyük olmalı.</span>`; return; }
      const R = (Vs - Vf) / I;
      const P = (Vs - Vf) * I;
      const std = [10, 22, 33, 47, 68, 100, 150, 220, 330, 470, 680, 1000, 1500, 2200, 3300, 4700];
      const near = std.find(s => s >= R) || Math.ceil(R);
      o.innerHTML = `Seri direnç: <b>${Eng.fmt(R)}Ω</b><br>Direnç gücü: ${Eng.fmt(P)}W → en az <b>${Eng.fmt(P * 2)}W</b> seç<br>Standart değer önerisi: <b>${Eng.fmt(near)}Ω</b>`;
    };
  },

  /* --------------------------- RC ZAMAN ---------------------------- */
  rc(container) {
    container.appendChild(el(`
      <div class="calc">
        <p class="calc-hint">τ = R × C. Ayrıca RC kesim frekansı hesaplanır.</p>
        ${field("Direnç R (Ohm)", "rc-r", "örn. 10k")}
        ${field("Kondansatör C (Farad)", "rc-c", "örn. 100u")}
        ${outBox("rc-out")}
        <button class="btn primary" id="rc-go">Hesapla</button>
      </div>`));
    container.querySelector("#rc-go").onclick = () => {
      const R = Eng.num(document.getElementById("rc-r").value);
      const C = Eng.num(document.getElementById("rc-c").value);
      const o = document.getElementById("rc-out");
      if ([R, C].some(isNaN)) { o.innerHTML = `<span class="bad">R ve C gir.</span>`; return; }
      const tau = R * C;
      const fc = 1 / (2 * Math.PI * tau);
      o.innerHTML = `Zaman sabiti τ = <b>${Eng.fmt(tau)}s</b><br>1τ (≈%63): ${Eng.fmt(tau)}s &nbsp; 5τ (≈%100): ${Eng.fmt(5 * tau)}s<br>Kesim frekansı fc ≈ <b>${Eng.fmt(fc)}Hz</b>`;
    };
  },

  /* ---------------------- SERİ/PARALEL DİRENÇ ---------------------- */
  series(container) {
    container.appendChild(el(`
      <div class="calc">
        <p class="calc-hint">Değerleri virgülle ayır. Seri: toplam; Paralel: ters toplam.</p>
        ${field("Dirençler (Ω)", "s-list", "örn. 100, 220, 470")}
        ${outBox("s-out")}
      </div>`));
    const calc = () => {
      const raw = document.getElementById("s-list").value;
      const vals = raw.split(/[,;\s]+/).map(Eng.num).filter(v => !isNaN(v) && v > 0);
      const o = document.getElementById("s-out");
      if (!vals.length) { o.innerHTML = `<span class="bad">Değer gir.</span>`; return; }
      const sum = vals.reduce((a, b) => a + b, 0);
      const inv = vals.reduce((a, b) => a + 1 / b, 0);
      o.innerHTML = `Adet: ${vals.length}<br>Seri toplam: <b>${Eng.fmt(sum)}Ω</b><br>Paralel eşdeğer: <b>${Eng.fmt(1 / inv)}Ω</b>`;
    };
    document.getElementById("s-list").oninput = calc;
    calc();
  },

  /* -------------------------- BİRİM ÇEVİRİCİ ----------------------- */
  unit(container) {
    container.appendChild(el(`
      <div class="calc">
        <p class="calc-hint">Önekli değer gir (örn. 4k7, 100n, 2M2) → tüm birimler.</p>
        ${field("Değer", "u-in", "örn. 4k7 veya 100n")}
        ${outBox("u-out")}
      </div>`));
    const calc = () => {
      let s = document.getElementById("u-in").value.trim().replace(",", ".");
      // 4k7 / 2M2 tipini destekle
      s = s.replace(/([kKmMµunpG])(\d+)$/, "$1.$2");
      const v = Eng.num(s);
      const o = document.getElementById("u-out");
      if (isNaN(v)) { o.innerHTML = `<span class="bad">Geçerli değer gir.</span>`; return; }
      o.innerHTML = ["G","M","k","","m","µ","n","p"].map((p, i) => {
        const mult = [1e9,1e6,1e3,1,1e-3,1e-6,1e-9,1e-12][i];
        return `${(v/mult).toPrecision(4).replace(/\.?0+$/,"")} ${p}`;
      }).join(" &nbsp;·&nbsp; ");
    };
    document.getElementById("u-in").oninput = calc;
  }
};

function renderTool(id, container) {
  container.innerHTML = "";
  if (CALCULATORS[id]) CALCULATORS[id](container);
}
