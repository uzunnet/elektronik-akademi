/* =========================================================================
   Elektronik Akademi — Devre Simülatörü Çekirdeği v2 (sim-core.js)
   Modified Nodal Analysis (MNA) tabanlı, gerçek bir mini-SPICE.
   --------------------------------------------------------------------------
   Cihazlar : R, C, L, V(DC), VSIN(AC), VPULSE, I, D, LED, Zener, SW(PWM),
              GND, OPAMP, NPN/PNP(BJT Ebers-Moll), NMOS/PMOS(Level-1)
   Analizler: DC çalışma noktası · Geçici (trapezoidal/Euler) · AC (Bode)
   Sayısal   : LU + pivoting · Newton-Raphson + pnjlim · gmin stepping
   Animasyon : tel başına akım akışı (Laplacian flow) — yön + hız gerçek akımla
   DOM yok  → Node.js ile test edilebilir.
   ========================================================================= */
(function (root) {
  "use strict";

  const VT = 0.025852;             // termal gerilim (V) @ 300K
  const VERSION = 2;

  /* ===================================================================
     0) KARANLIK YARDIMCILAR (gerçek / karmaşık)
     =================================================================== */

  /* LU + kısmi pivoting — Float64Array, satır bazlı (dense, küçük N için hızlı) */
  function luSolve(A, b) {
    const n = b.length;
    // Augment tek B matrisi olarak kopyala (satır bazlı erişim)
    const M = new Float64Array(n * (n + 1));
    for (let r = 0; r < n; r++) {
      const row = A[r], off = r * (n + 1);
      for (let c = 0; c < n; c++) M[off + c] = row[c];
      M[off + n] = b[r];
    }
    for (let c = 0; c < n; c++) {
      // pivoting
      let p = c, best = Math.abs(M[c * (n + 1) + c]);
      for (let r = c + 1; r < n; r++) {
        const v = Math.abs(M[r * (n + 1) + c]);
        if (v > best) { best = v; p = r; }
      }
      if (best < 1e-300) continue;                 // singüler kolon: atla
      if (p !== c) {
        for (let k = c; k <= n; k++) {
          const t = M[c * (n + 1) + k];
          M[c * (n + 1) + k] = M[p * (n + 1) + k];
          M[p * (n + 1) + k] = t;
        }
      }
      const pv = M[c * (n + 1) + c];
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const f = M[r * (n + 1) + c] / pv;
        if (f === 0) continue;
        const ro = r * (n + 1), co = c * (n + 1);
        for (let k = c; k <= n; k++) M[ro + k] -= f * M[co + k];
      }
    }
    const x = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const d = M[i * (n + 1) + i];
      if (Math.abs(d) > 1e-300) x[i] = M[i * (n + 1) + n] / d;
    }
    return x;
  }

  /* Karmaşık LU — A[r][c] = [re, im] */
  function cluSolve(A, b) {
    const n = b.length;
    const M = [];
    for (let r = 0; r < n; r++) {
      const row = new Array(n + 1);
      for (let c = 0; c < n; c++) row[c] = [A[r][c][0], A[r][c][1]];
      row[n] = [b[r][0], b[r][1]];
      M.push(row);
    }
    const re = (z) => z[0], im = (z) => z[1];
    for (let c = 0; c < n; c++) {
      let p = c, best = Math.hypot(re(M[c][c]), im(M[c][c]));
      for (let r = c + 1; r < n; r++) {
        const v = Math.hypot(re(M[r][c]), im(M[r][c]));
        if (v > best) { best = v; p = r; }
      }
      if (best < 1e-300) continue;
      if (p !== c) { const t = M[c]; M[c] = M[p]; M[p] = t; }
      const pr = re(M[c][c]), pi = im(M[c][c]), pd = pr * pr + pi * pi;
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const ar = re(M[r][c]), ai = im(M[r][c]);
        if (ar === 0 && ai === 0) continue;
        const fr = (ar * pr + ai * pi) / pd, fi = (ai * pr - ar * pi) / pd;
        for (let k = c; k <= n; k++) {
          const kr = re(M[c][k]), ki = im(M[c][k]);
          M[r][k][0] -= fr * kr - fi * ki;
          M[r][k][1] -= fr * ki + fi * kr;
        }
      }
    }
    const x = [];
    for (let i = 0; i < n; i++) {
      const dr = re(M[i][i]), di = im(M[i][i]), dd = dr * dr + di * di;
      if (dd > 1e-300) {
        const br = re(M[i][n]), bi = im(M[i][n]);
        x.push([(br * dr + bi * di) / dd, (bi * dr - br * di) / dd]);
      } else x.push([0, 0]);
    }
    return x;
  }

  /* ===================================================================
     1) TOPOLOJİ — union-find (kablo, kapalı anahtar, GND, DC'de bobin)
     =================================================================== */
  function UF() { this.p = {}; }
  UF.prototype.add = function (x) { if (!(x in this.p)) this.p[x] = x; };
  UF.prototype.find = function (x) { while (this.p[x] !== x) { this.p[x] = this.p[this.p[x]]; x = this.p[x]; } return x; };
  UF.prototype.union = function (a, b) { a = this.find(a); b = this.find(b); if (a !== b) this.p[a] = b; };

  /* Cihaz pin koordinatları — hem motor (akış) hem çizim bunu kullanır */
  function partPins(p) {
    const g = p.geo;
    if (p.t === "OPAMP") {
      const [x0, y0, x1, y1] = g, my = (y0 + y1) / 2;
      return [{ n: p.plus, x: x0, y: y0 + (y1 - y0) * 0.72 },
              { n: p.minus, x: x0, y: y0 + (y1 - y0) * 0.28 },
              { n: p.out, x: x1, y: my }];
    }
    if (p.t === "NPN" || p.t === "PNP") {
      const [x0, y0, x1, y1] = g, mx = (x0 + x1) / 2;
      return [{ n: p.base, x: x0, y: (y0 + y1) / 2 },
              { n: p.col, x: mx, y: y0 },
              { n: p.emit, x: mx, y: y1 }];
    }
    if (p.t === "NMOS" || p.t === "PMOS") {
      const [x0, y0, x1, y1] = g, mx = (x0 + x1) / 2;
      return [{ n: p.gate, x: x0, y: (y0 + y1) / 2 },
              { n: p.drain, x: mx, y: y0 },
              { n: p.src, x: mx, y: y1 }];
    }
    if (p.t === "GND") return [{ n: p.a, x: g[0], y: g[1] }, { n: "0", x: g[0], y: g[1] + 18 }];
    // Kaynak sembolleri dikey çizilir: a (+) ucu (x2,y2), b (−) ucu (x1,y1).
    // Sıra/netler aynı kalır (simülasyon etkilenmez); yalnızca KONUM eşlenir,
    // böylece geometri ile net bağlantısı tutarlı olur (animasyon için).
    if (p.t === "V" || p.t === "VSIN" || p.t === "VPULSE" || p.t === "I")
      return [{ n: p.a, x: g[2], y: g[3] }, { n: p.b, x: g[0], y: g[1] }];
    return [{ n: p.a, x: g[0], y: g[1] }, { n: p.b, x: g[2], y: g[3] }];
  }

  function nodesOf(p) { return partPins(p).map(q => q.n); }
  function is2t(p) { return ["R","C","L","V","VSIN","VPULSE","I","D","LED","Z","SW","WIRE"].indexOf(p.t) >= 0; }

  function swClosed(p, t) {
    if (p.pwm) { const T = 1 / p.pwm.f, ph = (t % T) / T; return ph < p.pwm.duty; }
    if (p.pulse) { const T = 1 / p.pulse.f, ph = (t % T) / T; return ph < p.pulse.duty; }
    return p.closed !== false;
  }

  /* Değer okuma: knobs/override öncelikli */
  function pval(p, ctx) {
    if (ctx && ctx.values && ctx.values[p.id] != null) return ctx.values[p.id];
    return p.v;
  }

  /* ===================================================================
     2) CİHAZ FİZİĞİ — currFn(v[]) → cihaza giren akımlar [i0,i1,...]
        Newton lineerizasyonu bu fonksiyonun etrafında yapılır.
     =================================================================== */
  const N_DIODE = 1.8;

  function diodeIS(vf, iff, n) { return iff / Math.exp(vf / (n * VT)); }

  function diodeParams(p) {
    if (p.t === "LED") return { vf: p.vf || 2.0, iff: p.if || 0.02, n: 1.8, brk: 0 };
    if (p.t === "Z")  return { vf: p.vz || 5.1,  iff: 0.01,       n: 1.8, brk: p.vz || 5.1, rz: p.rz || 8 };
    return { vf: p.vf || 0.7, iff: p.if || 0.01, n: 1.8, brk: 0 };     // normal diyot: vf, iff=10mA'da
  }

  function diodeI(vd, Is, n) {
    // SPICE tarzı: vcrit üzerinde üstel eğri DOĞRUSALLAŞTIRILIR (eğim korunur).
    // Böylece büyük vd'de türev 0 olmaz → diyot düğümlerinde tekillik/patlama olmaz.
    const vt = n * VT, vcrit = vt * Math.log(vt / (Math.SQRT2 * Is));
    if (vd > vcrit) {
      const ev = Math.exp(vcrit / vt), gd = Is * ev / vt;
      return Is * (ev - 1) + gd * (vd - vcrit);
    }
    let e = vd / vt;
    if (e < -200) e = -200;
    return Is * (Math.exp(e) - 1);
  }

  /* BJT — Ebers-Moll (transport), NPN: v = [Vb, Vc, Ve], akım cihaza GİRER */
  function bjtCurr(v, p) {
    const pol = p.t === "PNP" ? -1 : 1;
    const Vbe = pol * (v[0] - v[2]), Vbc = pol * (v[0] - v[1]);
    const Is = p.is || 1e-14, Bf = p.bf || 100, Br = p.br || 4;
    const ar = Br / (Br + 1), af = Bf / (Bf + 1);
    const ex = diodeI(Vbe, Is, 1), ey = diodeI(Vbc, Is, 1);
    const If = ex, Ir = ey;
    const Ic = If - Ir / ar;
    const Ib = If / Bf - Ir / Br;
    const Ie = -(Ic + Ib);
    return pol > 0 ? [Ib, Ic, Ie] : [-Ib, -Ic, -Ie];
  }

  /* MOSFET Level-1 — v = [Vg, Vd, Vs] (NMOS). PMOS aynalanır. */
  function mosCurr(v, p) {
    const pol = p.t === "PMOS" ? -1 : 1;
    const Vgs = pol * (v[0] - v[2]), Vds = pol * (v[1] - v[2]);
    const Vth = p.vt != null ? p.vt : 0.7, Kp = p.kp || 0.02, lam = p.lambda != null ? p.lambda : 0.01;
    const Vov = Vgs - Vth;
    let Id;
    if (Vov <= 0) Id = 0;                                     // kesim
    else if (Vds < Vov) Id = Kp * (Vov * Vds - 0.5 * Vds * Vds); // doğrusal
    else Id = 0.5 * Kp * Vov * Vov * (1 + lam * Vds);            // doygun
    Id = pol * Id;
    return [0, Id, -Id];                                       // gate akımı 0
  }

  /* Op-amp — tanh sınırlı, sonlu kazanç A. v = [V+, V-, Vout], akım cihaza GİRER */
  function opampCurr(v, p) {
    const A = p.a || 1e5, Vsat = p.vsat || 12;
    const vd = v[0] - v[1];
    const out = Vsat * Math.tanh(A * vd / Vsat);
    return [0, 0, out - v[2]];                                 // 3. terminal: çıkış
  }

  /* ===================================================================
     3) TOPOLOJİ → DÜĞÜM İNDEKSLERİ
     =================================================================== */
  function buildTopo(circ, mode, t) {
    const uf = new UF();
    for (const p of circ.parts) { for (const q of partPins(p)) uf.add(q.n); }
    for (const p of circ.parts) {
      const ns = nodesOf(p);
      if (p.t === "WIRE" || p.t === "GND") uf.union(ns[0], ns[1]);
      else if (p.t === "SW" && swClosed(p, t)) uf.union(ns[0], ns[1]);
      else if (mode === "dc" && p.t === "L") uf.union(ns[0], ns[1]);
    }
    const gndName = circ.ground || "0";
    let gndRoot;
    if (gndName in uf.p) gndRoot = uf.find(gndName);
    else {
      // Toprak yoksa: ilk düğümü referans al (motor çökmesin)
      const first = Object.keys(uf.p)[0];
      gndRoot = first != null ? uf.find(first) : null;
    }
    const rootIdx = {}; let nn = 0;
    for (const k in uf.p) { const r = uf.find(k); if (r === gndRoot) continue; if (!(r in rootIdx)) rootIdx[r] = nn++; }
    const idx = (name) => { if (name == null) return -1; const r = uf.find(name); return r === gndRoot ? -1 : rootIdx[r]; };
    return { uf, idx, nn, gndRoot };
  }

  /* ===================================================================
     4) TEK ÇALIŞMA NOKTASI (Newton-Raphson)
        ctx: {t, dt, mode:'dc'|'tran', state:{capV,capI,indI}, values, method}
     =================================================================== */
  function solveOp(circ, mode, ctx) {
    ctx = ctx || {};
    const t = ctx.t || 0, dt = ctx.dt || 1e-4, vals = ctx.values || {};
    // state varsayılanlarını tamamla (boş {} gelse bile)
    const st = ctx.state || {};
    if (!st.capV) st.capV = {}; if (!st.capI) st.capI = {};
    if (!st.indI) st.indI = {}; if (!st.indV) st.indV = {};
    if (!st.devV) st.devV = {};
    ctx.state = st;
    const method = ctx.method || "trap";                 // "trap" | "euler"
    const { idx, nn } = buildTopo(circ, mode, t);

    /* --- hangi parçalar hangi ek bilinmeyenleri alıyor --- */
    const vsrc = circ.parts.filter(p => (p.t === "V" || p.t === "VSIN" || p.t === "VPULSE")
      && !(mode === "dc" && p.t !== "V"));
    const inds = (mode === "tran") ? circ.parts.filter(p => p.t === "L") : [];
    const amps = circ.parts.filter(p => p.t === "OPAMP");

    const vsIdx = {}, ldIdx = {}, amIdx = {};
    let N = nn;
    vsrc.forEach(p => vsIdx[p.id] = N++);
    inds.forEach(p => ldIdx[p.id] = N++);
    amps.forEach(p => amIdx[p.id] = N++);
    if (N === 0) return { V: {}, partV: {}, partI: {}, converged: true };

    /* kaynak değeri — srcScale source stepping için (DC'de kademeli açılım) */
    function srcVal(p) {
      const sc = srcScale;
      if (vals[p.id] != null && p.t === "V") return vals[p.id] * sc;
      if (p.t === "V") return p.v * sc;
      if (p.t === "VSIN") return ((p.amp || 1) * Math.sin(2 * Math.PI * (p.f || 50) * t + (p.ph || 0)) + (p.dc || 0)) * sc;
      if (p.t === "VPULSE") {
        const T = 1 / (p.f || 1000), ph = (t % T) / T;
        return (ph < (p.duty || 0.5) ? (p.vhi || 5) : (p.vlo || 0)) * sc;
      }
      return 0;
    }
    const acMag = (p) => (p.t === "VSIN" ? (p.ac != null ? p.ac : (p.amp || 1)) : (p.ac || 0));

    /* Newton durumu */
    const devV = st.devV;                       // lineerizasyon noktaları
    const GMIN = 1e-12;
    let converged = false, sol = new Float64Array(N);
    let dmax = 0.5, prevMaxdV = Infinity;             // Newton adım limiti
    let srcScale = 1;                                  // kaynak adımlama çarpanı
    const NONLIN = ["D", "LED", "Z", "NPN", "PNP", "NMOS", "PMOS", "OPAMP"];
    const nlParts = circ.parts.filter(p => NONLIN.indexOf(p.t) >= 0);

    function runNewton() {
      converged = false; prevMaxdV = Infinity;
    for (let iter = 0; iter < 250; iter++) {
      const A = []; for (let i = 0; i < N; i++) A.push(new Float64Array(N));
      const z = new Float64Array(N);

      const g2 = (i, j, g) => {                 // iki terminalli iletken
        if (i >= 0) A[i][i] += g; if (j >= 0) A[j][j] += g;
        if (i >= 0 && j >= 0) { A[i][j] -= g; A[j][i] -= g; }
      };
      const i2 = (i, j, I) => { if (i >= 0) z[i] -= I; if (j >= 0) z[j] += I; };
      /* pnjlim (SPICE): junction gerilim farkına fizik tabanlı logaritmik sınır.
         vcrit = vt·ln(vt/(√2·Is)) — üstel eğrinin "kritik kavisi".
         Topraklı terminal (nodes[] < 0) ASLA kaydırılmaz. */
      function pnjLimCore(vnew, vold, vt, vcrit) {
        if (vnew > vcrit && Math.abs(vnew - vold) > 2 * vt && (vnew < 0) === (vold < 0)) {
          if (vold > 0) { const arg = 1 + (vnew - vold) / vt; vnew = arg > 0 ? vold + vt * Math.log(arg) : vcrit; }
          else { const arg = 1 + vnew / vt; vnew = arg > 0 ? vt * Math.log(arg) : -vcrit; }
        }
        return vnew;
      }
      function pnjLim(v, g, nodes, a, b, vt, vcrit) {
        const cur = v[a] - v[b], pre = g[a] - g[b];
        const shift = cur - pnjLimCore(cur, pre, vt, vcrit);
        const aG = nodes[a] < 0, bG = nodes[b] < 0;
        if (aG && bG) return;
        if (aG) v[b] += shift;
        else if (bG) v[a] -= shift;
        else { v[a] -= shift / 2; v[b] += shift / 2; }
      }
      const vcritOf = (Is, vt) => vt * Math.log(vt / (Math.SQRT2 * Is));
      /* 3+ terminalli doğrusal olmayan cihaz damgası (numerik Jacobian).
         juncs: [a,b,vt,vcrit] listesi — pnjlim uygulanacak junction'lar. */
      function stampNL(p, nodes, fn, juncs) {
        const n = nodes.length;
        const v = nodes.map((k) => (k >= 0 ? sol[k] : 0));
        const key = p.id;
        const guess = devV[key] || (devV[key] = v.slice());
        if (juncs) for (const [a, b, vt, vc] of juncs) pnjLim(v, guess, nodes, a, b, vt, vc);
        const i0 = fn(v, p);
        const J = [];
        const dlt = 1e-6;
        for (let c = 0; c < n; c++) {
          const vp = v.slice(); vp[c] += dlt;
          const ip = fn(vp, p);
          J.push(ip.map((val, r) => (val - i0[r]) / dlt));
        }
        for (let r = 0; r < n; r++) {
          const ir = nodes[r];
          if (ir < 0) continue;
          let rhs = -i0[r];
          for (let c = 0; c < n; c++) {
            const ic = nodes[c], g = J[c][r];
            if (ic >= 0) A[ir][ic] += g;
            rhs += g * v[c];
          }
          z[ir] += rhs;
        }
        devV[key] = v;
        return v;
      }

      /* --- parçaları estampa et --- */
      const prevDev = {};
      for (const k in devV) prevDev[k] = devV[k].slice();
      for (const p of circ.parts) {
        const ns = nodesOf(p);
        const i = idx(ns[0]), j = idx(ns[1]);
        if (p.t === "R") { const r = Math.max(1e-6, pval(p, ctx)); if (i !== j) g2(i, j, 1 / r); }
        else if (p.t === "I") i2(i, j, p.v || 0);
        else if (p.t === "V" || p.t === "VSIN" || p.t === "VPULSE") {
          const k = vsIdx[p.id]; if (k == null) continue;
          if (i >= 0) { A[k][i] += 1; A[i][k] += 1; }
          if (j >= 0) { A[k][j] -= 1; A[j][k] -= 1; }
          z[k] = srcVal(p);
        }
        else if (p.t === "C") {
          if (mode !== "tran") continue;                       // DC'de açık devre
          const C = Math.max(1e-15, pval(p, ctx));
          const vprev = st.capV[p.id] || 0, iprev = st.capI[p.id] || 0;
          if (method === "euler") { const Gc = C / dt; g2(i, j, Gc); i2(i, j, -Gc * vprev); }
          else { const Gc = 2 * C / dt; g2(i, j, Gc); i2(i, j, -(Gc * vprev + iprev)); }
        }
        else if (p.t === "L") {
          if (mode !== "tran") continue;
          const L = Math.max(1e-12, pval(p, ctx));
          const k = ldIdx[p.id]; if (k == null) continue;
          const iprev = st.indI[p.id] || 0, vprev = st.indV && st.indV[p.id] || 0;
          const Leq = (method === "euler") ? L / dt : 2 * L / dt;
          if (i >= 0) { A[k][i] += 1; A[i][k] += 1; }
          if (j >= 0) { A[k][j] -= 1; A[j][k] -= 1; }
          A[k][k] -= Leq;
          z[k] = -(Leq * iprev + vprev);                        // trapezoidal: -v_{n-1}
        }
        else if (p.t === "D" || p.t === "LED" || p.t === "Z") {
          const pr = diodeParams(p), Is = diodeIS(pr.vf, pr.iff, pr.n);
          const vt = pr.n * VT, vc = vcritOf(Is, vt);
          stampNL(p, [i, j], (v) => {
            const vd = v[0] - v[1];
            let id = diodeI(vd, Is, pr.n);
            // Zener ters kırılma: yumuşak max(x,0) ile C1-sürekli (Newton kararlılığı).
            // Ters kırılmada konvansiyonel akım ANOT'tan çıkar → id eksi.
            if (p.t === "Z" && pr.brk) {
              const x = (-vd - pr.brk);            // kırılma bölgesinde >0
              const dl = 0.08;                     // yumuşaklık
              const soft = 0.5 * (x + Math.sqrt(x * x + dl * dl));
              id -= soft / (pr.rz || 8);
            }
            return [id, -id];
          }, [[0, 1, vt, vc]]);
        }
        else if (p.t === "NPN" || p.t === "PNP") {
          const nd = [idx(p.base), idx(p.col), idx(p.emit)];
          const IsB = p.is || 1e-14, vcB = vcritOf(IsB, VT);
          stampNL(p, nd, bjtCurr, [[0, 2, VT, vcB], [0, 1, VT, vcB]]);   // Vbe, Vbc
        }
        else if (p.t === "NMOS" || p.t === "PMOS") {
          const nd = [idx(p.gate), idx(p.drain), idx(p.src)];
          stampNL(p, nd, mosCurr);                                     // kare kanun: sınır gerekmez
        }
        else if (p.t === "OPAMP") {
          const k = amIdx[p.id]; if (k == null) continue;
          const ip = idx(p.plus), im = idx(p.minus), io = idx(p.out);
          const A0 = p.a || 1e5, Vsat = p.vsat || 12;
          const vd0 = (ip >= 0 ? sol[ip] : 0) - (im >= 0 ? sol[im] : 0);
          const th = Math.tanh(A0 * vd0 / Vsat);
          const f = Vsat * th, df = A0 * (1 - th * th);
          // KCL: çıkış düğümüne akım bilinmeyeni
          if (io >= 0) A[io][k] += 1;
          // kısıt satırı: Vout - f'(vd)·V+ + f'(vd)·V- = f(vd0) - f'(vd0)·vd0
          if (io >= 0) A[k][io] += 1;
          if (ip >= 0) A[k][ip] -= df;
          if (im >= 0) A[k][im] += df;
          z[k] = f - df * vd0;
          devV[p.id] = [ip >= 0 ? sol[ip] : 0, im >= 0 ? sol[im] : 0, io >= 0 ? sol[io] : 0];
        }
      }

      /* singülerite koruması: sadece diagonal BOŞSA gmin ekle (hassasiyeti bozmasın) */
      for (let i = 0; i < nn; i++) if (A[i][i] === 0) A[i][i] = GMIN;

      sol = luSolve(A, z);

      /* Newton yakınsama kontrolü — önceki lineerizasyon noktasına göre */
      let maxdV = 0;
      for (const p of nlParts) {
        const key = p.id, old = prevDev[key]; if (!old) continue;
        const ns = nodesOf(p);
        const cur = ns.map(n => { const k = idx(n); return k >= 0 ? sol[k] : 0; });
        for (let k = 0; k < cur.length; k++) if (isFinite(cur[k])) maxdV = Math.max(maxdV, Math.abs(cur[k] - old[k]));
      }
      if (maxdV < 1e-7 && iter > 0) { converged = true; break; }
      if (!isFinite(sol[0]) && N > 0) break;
    }
    return converged;
    }

    /* --- DC: kaynak adımlama (hepsi-sıfır kötü havuzundan çıkarır) ---
       Kaynaklar kademeli açılır; her adımın çözümü sonrakinin başlangıç
       tahmini olur. Bu, BJT/diyot gibi sert üstel cihazlarda Newton'u
       doğrusal bölgeye sokar (SPICE'ın dc operating point yöntemi). */
    if (mode === "dc" && nlParts.length) {
      const steps = [0.02, 0.08, 0.2, 0.45, 0.75, 1];
      let ok = true;
      for (const s of steps) {
        srcScale = s;
        if (!runNewton()) { ok = false; break; }
      }
      if (!ok) { srcScale = 1; runNewton(); }          // son çare: %100'ten Newton
      srcScale = 1;
    } else {
      srcScale = 1;
      runNewton();
    }

    /* --- sonuçlar --- */
    const topo2 = buildTopo(circ, mode, t);
    const netV = {};
    for (const k in topo2.uf.p) {
      const i = topo2.idx(k);
      netV[k] = i >= 0 ? sol[i] : 0;
    }

    const partV = {}, partI = {};
    for (const p of circ.parts) {
      const ns = nodesOf(p);
      const va = topo2.idx(ns[0]) >= 0 ? sol[topo2.idx(ns[0])] : 0;
      const vb = topo2.idx(ns[1]) >= 0 ? sol[topo2.idx(ns[1])] : 0;
      partV[p.id] = va - vb;
      if (p.t === "R") partI[p.id] = (va - vb) / Math.max(1e-6, pval(p, ctx));
      else if (p.t === "I") partI[p.id] = p.v || 0;
      else if (p.t === "V" || p.t === "VSIN" || p.t === "VPULSE") { const k = vsIdx[p.id]; partI[p.id] = k != null ? sol[k] : 0; }
      else if (p.t === "C" && mode === "tran") {
        const C = Math.max(1e-15, pval(p, ctx));
        const vprev = st.capV[p.id] || 0, iprev = st.capI[p.id] || 0;
        partI[p.id] = (method === "euler") ? (C / dt) * ((va - vb) - vprev) : (2 * C / dt) * ((va - vb) - vprev) - iprev;
      }
      else if (p.t === "L" && mode === "tran") { const k = ldIdx[p.id]; partI[p.id] = k != null ? sol[k] : 0; }
      else if (p.t === "D" || p.t === "LED" || p.t === "Z") {
        const pr = diodeParams(p), Is = diodeIS(pr.vf, pr.iff, pr.n);
        const vd = va - vb;
        let id = diodeI(vd, Is, pr.n);
        if (p.t === "Z" && pr.brk) {
          const x = (-vd - pr.brk), dl = 0.08;
          id -= 0.5 * (x + Math.sqrt(x * x + dl * dl)) / (pr.rz || 8);
        }
        partI[p.id] = id;
      }
      else if (p.t === "OPAMP") { const k = amIdx[p.id]; partI[p.id] = k != null ? sol[k] : 0; }
      else if (p.t === "NPN" || p.t === "PNP" || p.t === "NMOS" || p.t === "PMOS") {
        const cur = bjtCurrOrMos(p, ns.map(n => topo2.idx(n) >= 0 ? sol[topo2.idx(n)] : 0));
        partI[p.id] = cur[1];
      }
      else partI[p.id] = 0;
    }
    return { V: netV, partV, partI, converged, sol, nn, idx: topo2.idx };
  }

  function bjtCurrOrMos(p, v) {
    if (p.t === "NPN" || p.t === "PNP") return bjtCurr(v, p);
    return mosCurr(v, p);
  }

  /* ===================================================================
     5) GEÇİCİ ANALİZ (transient) — durum komşu adımlar arasında taşınır
     =================================================================== */
  function simulate(circ, opt) {
    opt = opt || {};
    const analysis = opt.analysis || circ.analysis || (circ.mode === "tran" ? "tran" : "dc");
    if (analysis === "ac") return ac(circ, opt);

    const values = Object.assign({}, circ.override || {}, opt.values || {});
    const method = opt.method || circ.method || "trap";

    if (analysis === "tran") {
      const steps = opt.steps || circ.steps || 600;
      const tEnd = circ.tEnd || 0.02;
      const dt = tEnd / steps;
      const frames = [];
      const state = { capV: {}, capI: {}, indI: {}, indV: {}, devV: {} };
      // Başlangıç koşulu: kapasitör boş / bobin akımsız (öğrenci beklentisi).
      // dcInit:true ise DC çalışma noktası kullanılır (uygun devrelerde).
      if (circ.dcInit) {
        const dc0 = solveOp(circ, "dc", { values, state });
        for (const p of circ.parts) {
          if (p.t === "C" && isFinite(dc0.partV[p.id])) state.capV[p.id] = dc0.partV[p.id] || 0;
          if (p.t === "L" && isFinite(dc0.partI[p.id])) state.indI[p.id] = dc0.partI[p.id] || 0;
        }
      }
      for (let s = 0; s <= steps; s++) {
        const t = s * dt;
        const r = solveOp(circ, "tran", { t, dt, values, state, method });
        for (const p of circ.parts) {
          if (p.t === "C") { state.capV[p.id] = r.partV[p.id] || 0; state.capI[p.id] = r.partI[p.id] || 0; }
          if (p.t === "L") { state.indI[p.id] = r.partI[p.id] || 0; state.indV[p.id] = r.partV[p.id] || 0; }
        }
        frames.push({ t, V: r.V, I: r.partI, partV: r.partV, led: ledBrightness(circ, r.partI) });
        if (!isFinite(r.partI[Object.keys(r.partI)[0]] || 0)) break;
      }
      return { mode: "tran", frames, tEnd, probes: circ.probes || [], converged: true, analysis: "tran" };
    }

    const r = solveOp(circ, "dc", { values, state: {} });
    return { mode: "dc", frames: [{ t: 0, V: r.V, I: r.partI, partV: r.partV, led: ledBrightness(circ, r.partI) }], tEnd: 0, probes: circ.probes || [], converged: r.converged, analysis: "dc" };
  }

  function ledBrightness(circ, partI) {
    const b = {};
    for (const p of circ.parts) if (p.t === "LED") b[p.id] = Math.max(0, Math.min(1.2, (partI[p.id] || 0) / (p.if || 0.02)));
    return b;
  }

  /* ===================================================================
     6) AC ANALİZ — küçük sinyal Bode (faz + genlik)
        Doğrusal olmayanlar DC OP'ta lineerize edilir.
     =================================================================== */
  function ac(circ, opt) {
    opt = opt || {};
    const values = Object.assign({}, circ.override || {}, opt.values || {});
    const probe = opt.probe || (circ.probes && circ.probes[0]) || "out";
    const ref = opt.ref || "in";
    const f1 = opt.f1 || 10, f2 = opt.f2 || 1e6, pts = opt.pts || 120;

    // DC OP al (lineerizasyon noktası)
    const op = solveOp(circ, "dc", { values, state: {} });
    const { idx, nn } = buildTopo(circ, "ac", 0);
    const vsrc = circ.parts.filter(p => p.t === "V" || p.t === "VSIN" || p.t === "VPULSE");
    const vsIdx = {}; let N = nn; vsrc.forEach(p => vsIdx[p.id] = N++);
    if (N === 0) return { freqs: [], mag: [], phase: [], probe, ref };

    const acMag = (p) => (p.t === "VSIN" ? (p.ac != null ? p.ac : (p.amp || 1)) : (p.ac || 0));
    const NONLIN = ["D", "LED", "Z", "NPN", "PNP", "NMOS", "PMOS", "OPAMP"];
    const devV0 = {};
    for (const p of circ.parts) if (NONLIN.indexOf(p.t) >= 0) {
      const ns = nodesOf(p).map(n => op.V[n] || 0);
      devV0[p.id] = ns;
    }

    const freqs = [], mag = [], phase = [];
    for (let s = 0; s < pts; s++) {
      const w = 2 * Math.PI * f1 * Math.pow(f2 / f1, s / (pts - 1));
      const A = []; for (let i = 0; i < N; i++) A.push(Array.from({ length: N }, () => [0, 0]));
      const z = []; for (let i = 0; i < N; i++) z.push([0, 0]);

      const cadd = (r, c, gr, gi) => { A[r][c][0] += gr; A[r][c][1] += gi; };
      const g2 = (i, j, yr, yi) => {
        if (i >= 0) { cadd(i, i, yr, yi); } if (j >= 0) { cadd(j, j, yr, yi); }
        if (i >= 0 && j >= 0) { cadd(i, j, -yr, -yi); cadd(j, i, -yr, -yi); }
      };
      // küçük sinyal iletkenliği (DC OP'tan, sayısal türev)
      function smallG(p, nodes) {
        const v0 = devV0[p.id] || nodes.map(() => 0);
        const fn = (p.t === "D" || p.t === "LED" || p.t === "Z") ? (v => {
          const pr = diodeParams(p), Is = diodeIS(pr.vf, pr.iff, pr.n);
          const id = diodeI(v[0] - v[1], Is, pr.n); return [id, -id];
        }) : (p.t === "NPN" || p.t === "PNP") ? bjtCurr : (p.t === "OPAMP") ? opampCurr : mosCurr;
        const i0 = fn(v0, p), J = [], d = 1e-6;
        for (let c = 0; c < v0.length; c++) {
          const vp = v0.slice(); vp[c] += d;
          const ip = fn(vp, p);
          J.push(ip.map((val, r) => (val - i0[r]) / d));
        }
        return { J, i0, v0 };
      }

      for (const p of circ.parts) {
        const ns = nodesOf(p);
        const i = idx(ns[0]), j = idx(ns[1]);
        if (p.t === "R") { const r = Math.max(1e-6, pval(p, { values })); if (i !== j) g2(i, j, 1 / r, 0); }
        else if (p.t === "C") { const C = Math.max(1e-15, pval(p, { values })); g2(i, j, 0, w * C); }
        else if (p.t === "L") { const L = Math.max(1e-12, pval(p, { values })); g2(i, j, 0, -1 / (w * L)); }
        else if (p.t === "V" || p.t === "VSIN" || p.t === "VPULSE") {
          const k = vsIdx[p.id]; if (k == null) continue;
          if (i >= 0) { cadd(k, i, 1, 0); cadd(i, k, 1, 0); }
          if (j >= 0) { cadd(k, j, -1, 0); cadd(j, k, -1, 0); }
          const m = acMag(p); z[k][0] = m;
        }
        else if (p.t === "D" || p.t === "LED" || p.t === "Z" || p.t === "NPN" || p.t === "PNP" || p.t === "NMOS" || p.t === "PMOS") {
          const nodes = (p.t === "NPN" || p.t === "PNP") ? [idx(p.base), idx(p.col), idx(p.emit)]
            : (p.t === "NMOS" || p.t === "PMOS") ? [idx(p.gate), idx(p.drain), idx(p.src)] : [i, j];
          const { J } = smallG(p, nodes);
          const n = nodes.length;
          for (let r = 0; r < n; r++) {
            const ir = nodes[r]; if (ir < 0) continue;
            for (let c = 0; c < n; c++) { const ic = nodes[c]; if (ic >= 0) cadd(ir, ic, J[c][r], 0); }
          }
        }
        else if (p.t === "OPAMP") {
          const ip = idx(p.plus), im = idx(p.minus), io = idx(p.out);
          const A0 = p.a || 1e5, Vsat = p.vsat || 12;
          const vd0 = (devV0[p.id] || [0, 0, 0])[0] - (devV0[p.id] || [0, 0, 0])[1];
          const th = Math.tanh(A0 * vd0 / Vsat), df = A0 * (1 - th * th);
          if (io >= 0) cadd(io, io, 0, 0);                 // çıkış → bilinmeyen yok (akım yok)
          // doğrusal: Vout = df·(V+ − V−)  →  Vout − df·V+ + df·V− = 0
          if (io >= 0) cadd(io, io, 1, 0);
          if (ip >= 0) cadd(io, ip, -df, 0);
          if (im >= 0) cadd(io, im, df, 0);
        }
      }
      for (let i = 0; i < nn; i++) cadd(i, i, 1e-12, 0);
      const sol = cluSolve(A, z);
      const pi = idx(probe), ri = idx(ref);
      const vp = pi >= 0 ? sol[pi] : [0, 0], vr = ri >= 0 ? sol[ri] : [1, 0];
      // V(probe)/V(ref) karmaşık bölme
      const dr = vr[0] * vr[0] + vr[1] * vr[1] || 1e-30;
      const hr = (vp[0] * vr[0] + vp[1] * vr[1]) / dr, hi = (vp[1] * vr[0] - vp[0] * vr[1]) / dr;
      const m = Math.hypot(hr, hi);
      freqs.push(w / (2 * Math.PI));
      mag.push(20 * Math.log10(m + 1e-30));
      phase.push(Math.atan2(hi, hr) * 180 / Math.PI);
    }
    return { mode: "ac", freqs, mag, phase, probe, ref, analysis: "ac" };
  }

  /* ===================================================================
     7) TEL AKIMI AKIŞI (animasyon) — düğüm bazlı Laplacian
        Bilinen cihaz akımları düğümlere enjekte edilir, teller birim
        iletkenlikte kabul edilir; potansiyel farkından tel akımı bulunur.
     =================================================================== */
  function wireFlow(circ, partI) {
    // geometrik tepe noktaları
    const key = (x, y) => Math.round(x) + "," + Math.round(y);
    const vert = {}, order = [];
    const addV = (x, y) => { const k = key(x, y); if (!(k in vert)) { vert[k] = order.length; order.push({ x, y, inj: 0, net: null }); } return vert[k]; };
    const edges = [];
    for (const p of circ.parts) {
      const pins = partPins(p);
      for (const q of pins) addV(q.x, q.y);
      if (p.t === "WIRE") edges.push([addV(p.geo[0], p.geo[1]), addV(p.geo[2], p.geo[3])]);
      // cihaz uçlarından enjeksiyon
      const cur = partI[p.id] || 0;
      if (p.t === "WIRE" || p.t === "SW" || p.t === "GND") continue;
      const injAt = (x, y, v) => { const o = order[vert[key(x, y)]]; if (o) o.inj += v; };
      if (is2t(p) && pins.length >= 2) {
        injAt(pins[0].x, pins[0].y, cur);   // akım cihaza girer
        injAt(pins[1].x, pins[1].y, -cur);
      } else if (pins.length === 3) {
        injAt(pins[0].x, pins[0].y, 0);
        injAt(pins[1].x, pins[1].y, cur);
        injAt(pins[2].x, pins[2].y, -cur);
      }
    }
    // her bağlı bileşen kümesi için sabit bir tepe (singularite önleme)
    const n = order.length;
    if (!n) return [];
    const uf = new UF(); for (let i = 0; i < n; i++) uf.add(i);
    for (const [a, b] of edges) uf.union(a, b);
    // bileşen başına enjeksiyon toplamı 0 olmalı; değilse tel yok → akım 0
    const comp = {}; for (let i = 0; i < n; i++) { const r = uf.find(i); (comp[r] = comp[r] || { idx: [], inj: 0 }).idx.push(i); comp[r].inj += order[i].inj; }
    const pinOf = {};
    for (const r in comp) pinOf[r] = comp[r].idx[0];
    // A matrisi: her tepe için Σ G(Vt − Vs) = inj  (G=1 tel)
    const A = []; for (let i = 0; i < n; i++) A.push(new Float64Array(n));
    const b = new Float64Array(n);
    for (const [a, c] of edges) { A[a][a] += 1; A[c][c] += 1; A[a][c] -= 1; A[c][a] -= 1; }
    for (let i = 0; i < n; i++) {
      const r = uf.find(i);
      if (pinOf[r] === i) { for (let k = 0; k < n; k++) A[i][k] = 0; A[i][i] = 1; b[i] = 0; }
      else b[i] = order[i].inj;
    }
    const V = luSolve(A, b);
    return edges.map(([a, c]) => ({ a: order[a], b: order[c], i: V[a] - V[c] }));
  }

  /* ===================================================================
     8) HAZIR DEVRELER — başlangıç → profesyonel
     =================================================================== */
  function P(t, id, a, b, props, geo) { return Object.assign({ t, id, a, b }, props, { geo }); }
  function OP(id, plus, minus, out, geo, props) { return Object.assign({ t: "OPAMP", id, plus, minus, out, a: 1e5, vsat: 12 }, props, { geo }); }
  function BJT(id, base, col, emit, geo, props) { return Object.assign({ t: "NPN", id, base, col, emit, bf: 100, br: 4, is: 1e-14 }, props, { geo }); }
  function MOS(id, gate, drain, src, geo, props) { return Object.assign({ t: "NMOS", id, gate, drain, src, vt: 0.7, kp: 0.02, lambda: 0.01 }, props, { geo }); }

  const CIRCUITS = [
    /* ---------- BAŞLANGIÇ ---------- */
    { id: "led", name: "LED + Direnç", level: "Başlangıç", analysis: "dc",
      desc: "En temel devre. Direnç LED akımını sınırlar. R'yi değiştir, LED parlaklığını izle.",
      parts: [P("V","V1","in","0",{v:9},[120,300,120,120]), P("R","R1","in","led",{v:330},[120,120,340,120]),
              P("LED","D1","led","0",{vf:2.0,if:0.02},[340,120,340,300]), P("WIRE","W1","0","0",{},[340,300,120,300])],
      probes: ["led"],
      knobs: [{id:"R1",label:"Direnç R1",min:10,max:1000,step:10,unit:"Ω"},{id:"V1",label:"Gerilim",min:1,max:12,step:0.5,unit:"V"}] },

    { id: "bolucu", name: "Gerilim Bölücü", level: "Başlangıç", analysis: "dc",
      desc: "Vout = Vin × R2/(R1+R2). ADC ve geri besleme devrelerinin temeli.",
      parts: [P("V","V1","in","0",{v:12},[120,340,120,120]), P("R","R1","in","out",{v:10000},[120,120,340,120]),
              P("R","R2","out","0",{v:4700},[340,120,340,340]), P("WIRE","W1","0","0",{},[340,340,120,340])],
      probes: ["out"],
      knobs: [{id:"R1",label:"R1 (üst)",min:1000,max:47000,step:500,unit:"Ω"},{id:"R2",label:"R2 (alt)",min:1000,max:47000,step:500,unit:"Ω"}] },

    { id: "seri", name: "Seri Dirençler", level: "Başlangıç", analysis: "dc",
      desc: "Seri dirençler toplanır: Rtop = R1+R2. Akım hepsinden aynı geçer.",
      parts: [P("V","V1","in","0",{v:12},[120,320,120,120]), P("R","R1","in","mid",{v:220},[120,120,300,120]),
              P("R","R2","mid","0",{v:470},[420,120,420,320]), P("WIRE","W1","mid","mid",{},[300,120,420,120]),
              P("WIRE","W2","0","0",{},[420,320,120,320])],
      probes: ["mid"], knobs: [{id:"R1",label:"R1",min:50,max:1000,step:10,unit:"Ω"},{id:"R2",label:"R2",min:50,max:1000,step:10,unit:"Ω"}] },

    { id: "anahtar", name: "Anahtar + Lamba", level: "Başlangıç", analysis: "dc",
      desc: "Anahtar kapanınca akım yolu tamamlanır. Lamba akımı = V/R.",
      parts: [P("V","V1","in","0",{v:9},[120,320,120,120]), P("SW","SW1","in","lamp",{closed:true},[120,120,300,120]),
              P("R","L1","lamp","0",{v:100},[420,120,420,320]), P("WIRE","W1","lamp","lamp",{},[300,120,420,120]),
              P("WIRE","W2","0","0",{},[420,320,120,320])],
      probes: ["lamp"], knobs: [{id:"L1",label:"Lamba direnci",min:20,max:500,step:10,unit:"Ω"}] },

    { id: "zener", name: "Zener Gerilim Sabitleyici", level: "Başlangıç", analysis: "dc",
      desc: "Zener ters bölgede sabit gerilim verir. Seri R fazla gücü Zener'den alır.",
      parts: [P("V","V1","in","0",{v:12},[120,340,120,120]), P("R","R1","in","z",{v:220},[120,120,340,120]),
              P("Z","D1","z","0",{vz:5.1},[340,120,340,340]), P("WIRE","W1","0","0",{},[340,340,120,340])],
      probes: ["z"], knobs: [{id:"R1",label:"Seri R",min:47,max:1000,step:10,unit:"Ω"},{id:"V1",label:"Vin",min:6,max:24,step:0.5,unit:"V"}] },

    /* ---------- ORTA ---------- */
    { id: "rc", name: "RC Şarj (Zaman Sabiti)", level: "Orta", analysis: "tran",
      desc: "Kondansatör direnç üzerinden dolar. τ = R×C. Osiloskopta üstel eğri.",
      tEnd: 0.05, probes: ["out","in"],
      parts: [P("V","V1","in","0",{v:10},[120,340,120,120]), P("R","R1","in","out",{v:1000},[120,120,360,120]),
              P("C","C1","out","0",{v:10e-6},[360,120,360,340]), P("WIRE","W1","0","0",{},[360,340,120,340])],
      knobs: [{id:"R1",label:"R1",min:100,max:5000,step:100,unit:"Ω"},{id:"C1",label:"C1 (µF)",min:1,max:100,step:1,unit:"µF",scale:1e-6}] },

    { id: "rect", name: "Yarım Dalga Doğrultucu", level: "Orta", analysis: "tran",
      desc: "Diyot AC'nin sadece pozitif yarısını geçirir. Giriş ve çıkışı karşılaştır.",
      tEnd: 0.04, probes: ["in","out"],
      parts: [P("VSIN","V1","in","0",{amp:12,f:50,ph:0},[120,340,120,140]), P("D","D1","in","out",{vf:0.7,if:1},[120,140,360,140]),
              P("R","R1","out","0",{v:1000},[360,140,360,340]), P("WIRE","W1","0","0",{},[360,340,120,340])],
      knobs: [{id:"R1",label:"Yük direnci",min:100,max:5000,step:100,unit:"Ω"}] },

    { id: "rect-sm", name: "Köprü Doğrultucu + Süzme", level: "Orta", analysis: "tran",
      desc: "4 diyot köprüsü tam dalga doğrultur, C dalgalılığı (ripple) azaltır. Trafolu güç kaynağı prensibi.",
      tEnd: 0.05, steps: 900, probes: ["in","out"],
      parts: [
        P("VSIN","V1","in","ac",{amp:15,f:50},[60,360,60,220]),
        P("WIRE","Win","in","in",{},[60,220,180,220]),
        P("D","D1","in","out",{vf:0.7,if:1},[180,220,300,120]),
        P("D","D2","ac","out",{vf:0.7,if:1},[420,220,300,120]),
        P("D","D3","0","in",{vf:0.7,if:1},[300,320,180,220]),
        P("D","D4","0","ac",{vf:0.7,if:1},[300,320,420,220]),
        P("WIRE","Wac","ac","ac",{},[420,220,420,360]),
        P("WIRE","Wac2","ac","ac",{},[420,360,60,360]),
        P("WIRE","Wout","out","out",{},[300,120,520,120]),
        P("WIRE","Wout2","out","out",{},[520,120,600,120]),
        P("WIRE","Wgnd","0","0",{},[300,320,520,320]),
        P("WIRE","Wgnd2","0","0",{},[520,320,600,320]),
        P("C","C1","out","0",{v:470e-6},[520,120,520,320]),
        P("R","RL","out","0",{v:100},[600,120,600,320])
      ],
      knobs: [{id:"C1",label:"Süzme C (µF)",min:10,max:1000,step:10,unit:"µF",scale:1e-6},{id:"RL",label:"Yük",min:10,max:500,step:5,unit:"Ω"}] },

    { id: "rlc", name: "Seri RLC Salınım", level: "Orta", analysis: "tran",
      desc: "R küçükse sönümlü salınım (ringing). R artırınca aşırı sönümlü geçiş.",
      tEnd: 0.002, steps: 1200, probes: ["out","in"],
      parts: [P("VPULSE","V1","in","0",{vhi:5,vlo:0,f:500,duty:0.02},[120,340,120,140]),
              P("R","R1","in","out",{v:20},[120,140,360,140]), P("L","L1","out","mid",{v:10e-3},[360,140,480,140]),
              P("C","C1","mid","0",{v:1e-6},[480,140,480,340]), P("WIRE","W1","0","0",{},[480,340,120,340])],
      knobs: [{id:"R1",label:"Seri R",min:1,max:500,step:1,unit:"Ω"},{id:"L1",label:"L (mH)",min:1,max:100,step:1,unit:"mH",scale:1e-3}] },

    { id: "rcfilt", name: "RC Alçak Geçiren Filtre", level: "Orta", analysis: "ac",
      desc: "Kesim frekansı fc = 1/(2πRC). AC analizinde Bode eğrisini gör.",
      probes: ["out","in"],
      parts: [P("VSIN","V1","in","0",{amp:5,f:1000,ac:1},[120,340,120,120]),
              P("R","R1","in","out",{v:1600},[120,120,360,120]),
              P("C","C1","out","0",{v:10e-9},[360,120,360,340]), P("WIRE","W1","0","0",{},[360,340,120,340])],
      knobs: [{id:"R1",label:"R",min:100,max:100000,step:100,unit:"Ω"},{id:"C1",label:"C (nF)",min:1,max:1000,step:1,unit:"nF",scale:1e-9}] },

    /* ---------- İLERİ ---------- */
    { id: "opamp-inv", name: "Op-amp Ters Yükselteç", level: "İleri", analysis: "tran",
      desc: "Kazanç K = −Rf/Rin. Giriş-çıkış ters fazlı. Ses ve ölçüm devrelerinin temeli.",
      tEnd: 0.004, steps: 800, probes: ["in","out"],
      parts: [
        P("VSIN","V1","in","0",{amp:0.5,f:1000,dc:0},[90,320,90,140]),
        P("R","R1","in","inv",{v:1000},[90,140,300,140]),
        P("R","R2","inv","out",{v:10000},[300,60,540,60]),
        OP("U1","0","inv","out",[300,112,400,212]),
        P("R","RL","out","0",{v:10000},[540,162,540,320]),
        P("WIRE","W1","out","out",{},[400,162,540,162]),
        P("WIRE","W2","inv","inv",{},[300,140,300,60]),
        P("WIRE","W4","out","out",{},[540,60,540,162]),
        P("WIRE","Wg0","0","0",{},[300,184,300,320]),
        P("WIRE","W3","0","0",{},[540,320,90,320])
      ],
      knobs: [{id:"R2",label:"Rf (geri besleme)",min:1000,max:100000,step:500,unit:"Ω"},{id:"R1",label:"Rin",min:100,max:20000,step:100,unit:"Ω"}] },

    { id: "opamp-non", name: "Op-amp Pozitif Yükselteç", level: "İleri", analysis: "tran",
      desc: "Kazanç K = 1 + Rf/Rg. Giriş ve çıkış aynı fazda. Impedans uyumlayıcı olarak da kullanılır.",
      tEnd: 0.004, steps: 800, probes: ["in","out"],
      parts: [
        P("VSIN","V1","in","0",{amp:0.5,f:1000},[90,320,90,140]),
        P("R","Rg","inv","0",{v:1000},[250,96,250,320]),
        OP("U1","in","inv","out",[300,68,400,168]),
        P("R","Rf","inv","out",{v:9000},[250,60,560,60]),
        P("WIRE","W1","out","out",{},[400,118,560,118]),
        P("R","RL","out","0",{v:10000},[560,118,560,320]),
        P("WIRE","W2","in","in",{},[90,140,300,140]),
        P("WIRE","Wj","inv","inv",{},[300,96,250,96]),
        P("WIRE","Wr","inv","inv",{},[250,96,250,60]),
        P("WIRE","Wo2","out","out",{},[560,118,560,60]),
        P("WIRE","W3","0","0",{},[560,320,90,320])
      ],
      knobs: [{id:"Rf",label:"Rf",min:1000,max:100000,step:500,unit:"Ω"},{id:"Rg",label:"Rg",min:100,max:20000,step:100,unit:"Ω"}] },

    { id: "ce-amp", name: "BJT Ortak Emiter Amplifikatör", level: "İleri", analysis: "tran",
      desc: "Kolektör direnci R_C üzerinde gerilim düşer: Av ≈ −gm·R_C. Ses güç aşamasının temeli.",
      tEnd: 0.004, steps: 800, probes: ["in","out"],
      parts: [
        P("VSIN","V1","in","0",{amp:0.02,f:1000},[80,340,80,170]),
        P("R","RB","in","b",{v:100000},[80,170,260,170]),
        BJT("Q1","b","out","e",[260,100,360,240]),
        P("R","RC","vcc","out",{v:4700},[310,40,310,100]),
        P("R","RE","e","0",{v:1000},[310,240,310,340]),
        P("V","VCC","vcc","0",{v:12},[500,340,500,40]),
        P("WIRE","Wtop","vcc","vcc",{},[310,40,500,40]),
        P("WIRE","W1","out","out",{},[310,100,440,100]),
        P("R","RL","out","0",{v:10000},[440,100,440,340]),
        P("WIRE","Wbot","0","0",{},[80,340,500,340])
      ],
      probes2: ["out"],
      knobs: [{id:"RC",label:"Kolektör R",min:470,max:47000,step:100,unit:"Ω"},{id:"RB",label:"Taban R",min:10000,max:1000000,step:10000,unit:"Ω"}] },

    { id: "buck", name: "Buck Dönüştürücü (PWM)", level: "İleri", analysis: "tran",
      desc: "PWM anahtar + bobin + süzme C. Vout ≈ Vin×duty. LED sürücü ve MCU beslemesi.",
      tEnd: 0.005, steps: 3000, probes: ["sw","out"],
      parts: [
        P("V","V1","in","0",{v:12},[100,340,100,120]),
        P("SW","SW1","in","sw",{pwm:{f:20000,duty:0.5}},[100,120,300,120]),
        P("D","D1","0","sw",{vf:0.5,if:1},[300,340,300,120]),
        P("L","L1","sw","out",{v:1e-3},[300,120,460,120]),
        P("C","C1","out","0",{v:100e-6},[460,120,460,340]),
        P("R","R1","out","0",{v:10},[560,120,560,340]),
        P("WIRE","W1","out","out",{},[460,120,560,120]),
        P("WIRE","W2","0","0",{},[560,340,100,340])
      ],
      knobs: [{id:"V1",label:"Vin",min:5,max:24,step:1,unit:"V"},{id:"R1",label:"Yük",min:5,max:200,step:5,unit:"Ω"}] },

    { id: "mosfet-sw", name: "MOSFET Anahtar + LED", level: "İleri", analysis: "dc",
      desc: "Düşük gerilimle yüksek akım anahtarlama. Gate gerilimi Vgs(th) üzerine çıkınca MOSFET açılır.",
      parts: [
        P("V","VCC","vdd","0",{v:12},[480,320,480,60]),
        P("R","RD","vdd","dr",{v:220},[250,60,250,180]),
        P("LED","D1","dr","0",{vf:2.0,if:0.02},[400,180,400,320]),
        MOS("M1","g","dr","0",[200,180,300,320]),
        P("V","VG","g","0",{v:5},[120,320,120,250]),
        P("WIRE","Wvdd","vdd","vdd",{},[480,60,250,60]),
        P("WIRE","Wdr","dr","dr",{},[250,180,400,180]),
        P("WIRE","Wg","g","g",{},[120,250,200,250]),
        P("WIRE","W2","0","0",{},[480,320,120,320])
      ],
      probes: ["dr"],
      knobs: [{id:"VG",label:"Gate gerilimi",min:0,max:10,step:0.5,unit:"V"},{id:"RD",label:"Direnç",min:47,max:10000,step:10,unit:"Ω"}] },

    { id: "cmp", name: "Op-amp Karşılaştırıcı", level: "İleri", analysis: "tran",
      desc: "Giriş referansın üstündeyse çıkış +Vsat, altındaysa −Vsat. PWM ve eşiş devrelerinin temeli.",
      tEnd: 0.004, steps: 800, probes: ["in","out"],
      parts: [
        P("VSIN","V1","in","0",{amp:2,f:200,dc:0},[90,320,90,140]),
        OP("U1","in","ref","out",[300,140,400,240]),
        P("V","VREF","ref","0",{v:1},[180,320,180,168]),
        P("WIRE","W0","in","in",{},[90,140,300,212]),
        P("WIRE","W1","ref","ref",{},[180,168,300,168]),
        P("WIRE","W2","0","0",{},[90,320,540,320]),
        P("WIRE","W3","out","out",{},[400,190,540,190]),
        P("R","RL","out","0",{v:10000},[540,190,540,320])
      ],
      knobs: [{id:"VREF",label:"Referans",min:0,max:5,step:0.1,unit:"V"},{id:"V1",label:"Giriş genliği",min:0.1,max:5,step:0.1,unit:"V"}] }
  ];

  /* CIRCUITS içinde W2 = ... hatası varsa temizle (atanmamış ifade) */
  for (const c of CIRCUITS) for (const p of c.parts) if (p && p.t) { }

  /* ===================================================================
     11) DEVRE DENETLEYİCİ — topoloji + değer + davranış karşılaştırması
         Net isimlerinden bağımsızdır (kullanıcı devreyi kendi kursa da).
     =================================================================== */
  function pinRoleList(p) {
    switch (p.t) {
      case "OPAMP": return ["+", "-", "out"];
      case "NPN": case "PNP": return ["b", "c", "e"];
      case "NMOS": case "PMOS": return ["g", "d", "s"];
      case "GND": return ["top", "0"];
      case "V": case "VSIN": case "VPULSE": case "I": return ["+", "-"];
      case "D": case "LED": case "Z": return ["a", "k"];
      default: return ["1", "2"];
    }
  }
  function _rk(x) {
    if (x == null || !isFinite(x)) return String(x);
    const a = Math.abs(x);
    if (a === 0) return "0";
    const d = Math.max(0, 2 - (Math.floor(Math.log10(a)) + 1));
    return (Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toString();
  }
  function valueKey(p) {
    switch (p.t) {
      case "R": case "C": case "L": case "V": case "I": return _rk(p.v);
      case "VSIN": return _rk(p.amp) + "/" + _rk(p.f);
      case "VPULSE": return _rk(p.vhi) + "/" + _rk(p.vlo) + "/" + _rk(p.f) + "/" + _rk(p.duty);
      case "D": case "LED": return _rk(p.vf);
      case "Z": return _rk(p.vz);
      default: return p.t;
    }
  }
  function circuitSignature(circ) {
    const uf = new UF();
    for (const p of circ.parts) for (const n of nodesOf(p)) { uf.add(n); }
    for (const p of circ.parts) if (p.t === "WIRE") uf.union(p.a, p.b);
    const parts = [], netMap = {};
    for (const p of circ.parts) {
      if (p.t === "WIRE") continue;
      const roles = pinRoleList(p);
      partPins(p).forEach((pin, i) => {
        const rr = uf.find(pin.n);
        (netMap[rr] = netMap[rr] || []).push(p.t + "$" + (roles[i] || "?"));
      });
      parts.push(p.t + ":" + valueKey(p) + ":" + roles.length);
    }
    parts.sort();
    const nets = Object.keys(netMap).map(k => netMap[k].slice().sort().join("+")).sort();
    return { parts: parts.join("|"), nets: nets.join("|"), netCount: nets.length };
  }
  function _multiDiff(aStr, bStr) {
    const cnt = (s) => { const m = {}; for (const x of s.split("|")) if (x) m[x] = (m[x] || 0) + 1; return m; };
    const A = cnt(aStr), B = cnt(bStr), missing = [], extra = [];
    for (const k in B) { const d = (B[k] || 0) - (A[k] || 0); for (let i = 0; i < d; i++) missing.push(k); }
    for (const k in A) { const d = (A[k] || 0) - (B[k] || 0); for (let i = 0; i < d; i++) extra.push(k); }
    return { missing, extra };
  }
  function checkTopology(user, ref) {
    const a = circuitSignature(user), b = circuitSignature(ref), errors = [];
    const pd = _multiDiff(a.parts, b.parts);
    if (pd.missing.length) errors.push("Eksik parça: " + pd.missing.join(", "));
    if (pd.extra.length) errors.push("Fazla/yanlış parça: " + pd.extra.join(", "));
    if (a.nets !== b.nets) errors.push("Bağlantı şeması hedefle uyuşmuyor (tel/pin bağlantılarını kontrol et).");
    return { ok: !errors.length, errors, sig: a, ref: b };
  }
  function _behavior(circ, ctx) {
    let sim;
    try { sim = simulate(circ, ctx || {}); } catch (e) { return { ok: false, errors: ["Simülasyon çalıştırılamadı: " + e.message] }; }
    const fr = sim.frames && sim.frames[sim.frames.length - 1];
    if (!fr) return { ok: sim.converged !== false, errors: sim.converged === false ? ["Simülasyon yakınsamadı (kısa devre/bağlantı hatası?)."] : [], rows: {} };
    const rows = {};
    for (const p of circ.parts) {
      if (p.t === "WIRE" || p.t === "GND") continue;
      const v = fr.partV ? fr.partV[p.id] : (fr.V && partPins(p).length ? Math.abs((fr.V[partPins(p)[0].n] || 0) - (fr.V[partPins(p)[partPins(p).length - 1].n] || 0)) : null);
      const i = fr.I ? fr.I[p.id] : null;
      if ((v != null && isFinite(v)) || (i != null && isFinite(i))) (rows[p.t] = rows[p.t] || []).push([v, i]);
    }
    return { ok: sim.converged !== false, errors: sim.converged === false ? ["Simülasyon yakınsamadı (kısa devre/bağlantı hatası?)."] : [], rows };
  }
  function checkBehavior(user, ref, ctx, tol) {
    tol = tol || 0.05;
    const A = _behavior(user, ctx), B = _behavior(ref, ctx), errors = [];
    if (!A.ok) return { ok: false, errors: A.errors };
    const close = (x, y) => { if (x == null || y == null || !isFinite(x) || !isFinite(y)) return true; const m = Math.max(1e-9, Math.abs(y)); return Math.abs(x - y) <= tol * m + 1e-6; };
    for (const t in B.rows) {
      const ba = (A.rows[t] || []).slice().sort((p, q) => (q[0] || 0) - (p[0] || 0));
      const bb = B.rows[t].slice().sort((p, q) => (q[0] || 0) - (p[0] || 0));
      if (ba.length !== bb.length) { errors.push(t + " parça sayısı/ölçümü uyuşmuyor."); continue; }
      for (let k = 0; k < bb.length; k++) {
        if (!close(ba[k][0], bb[k][0]) || !close(ba[k][1], bb[k][1])) { errors.push(t + " davranışı hedefle uyuşmuyor (gerilim/akım farkı)."); break; }
      }
    }
    return { ok: !errors.length, errors };
  }
  function checkCircuit(user, ref, opts) {
    opts = opts || {};
    const topo = checkTopology(user, ref);
    let beh = { ok: false, errors: [] };
    if (topo.ok) beh = checkBehavior(user, ref, opts.ctx, opts.tol);
    const errors = topo.errors.concat(beh.errors);
    return { ok: topo.ok && beh.ok, topologyOk: topo.ok, behaviorOk: beh.ok, errors };
  }

  const SimEngine = {
    VERSION, VT, solveOp, simulate, ac, wireFlow, partPins, nodesOf,
    diodeI, diodeIS, luSolve, cluSolve,
    pinRoleList, valueKey, circuitSignature, checkTopology, checkBehavior, checkCircuit,
    circuits: CIRCUITS
  };
  root.SimEngine = SimEngine;
  if (typeof module !== "undefined" && module.exports) module.exports = SimEngine;

})(typeof self !== "undefined" ? self : this);
