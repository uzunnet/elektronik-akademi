/* sim-core.js doğruluk testleri — bilinen analitik sonuçlarla karşılaştırma */
const SE = require("F:/360/ElektronikAkademi/js/sim-core.js");

let pass = 0, fail = 0;
function ok(name, got, want, tol) {
  tol = tol || 1e-6;
  const scale = Math.max(1e-12, Math.abs(want));
  const good = Math.abs(got - want) <= tol * scale || Math.abs(got - want) <= tol;
  if (good) { pass++; console.log("  ✓ " + name + " = " + got.toPrecision(7)); }
  else { fail++; console.log("  ✗ " + name + " = " + got.toPrecision(7) + "  (beklenen " + want.toPrecision(7) + ", fark " + (got-want).toExponential(2) + ")"); }
}
function section(t) { console.log("\n== " + t + " =="); }
const P = (t, id, a, b, props, geo) => Object.assign({ t, id, a, b }, props, { geo });

/* ---- 1) Gerilim bölücü ---- */
section("Gerilim bölücü (analitik: 12*4700/14700)");
{
  const c = { parts: [P("V","V1","in","0",{v:12},[0,0,0,0]),
                      P("R","R1","in","out",{v:10000},[0,0,0,0]),
                      P("R","R2","out","0",{v:4700},[0,0,0,0])], probes:["out"] };
  const r = SE.simulate(c, { analysis: "dc" });
  ok("Vout", r.frames[0].V.out, 12*4700/14700, 1e-9);
  ok("I(R1)", r.frames[0].I.R1, 12/14700, 1e-12);
}

/* ---- 2) Seri + paralel direnç ---- */
section("Seri/paralel");
{
  const c = { parts: [P("V","V1","in","0",{v:10},[0,0,0,0]),
                      P("R","R1","in","out",{v:1000},[0,0,0,0]),
                      P("R","R2","out","0",{v:3000},[0,0,0,0])], probes:["out"] };
  ok("Vout (10*3k/4k)", SE.simulate(c,{analysis:"dc"}).frames[0].V.out, 7.5, 1e-9);
}

/* ---- 3) RC geçici: t=τ'da %63.2 ---- */
section("RC şarj (1-e^{-1} = 0.632)");
{
  const R = 1000, C = 10e-6, tau = R*C;
  const c = { parts: [P("V","V1","in","0",{v:10},[0,0,0,0]),
                      P("R","R1","in","out",{v:R},[0,0,0,0]),
                      P("C","C1","out","0",{v:C},[0,0,0,0])],
              probes:["out"], tEnd: tau*3, mode:"tran", steps: 2000 };
  const r = SE.simulate(c, { analysis: "tran" });
  const idx = Math.round(r.frames.length * (tau / (tau*3)));
  const atTau = r.frames[Math.min(idx, r.frames.length-1)].V.out;
  ok("V(t≈τ)/Vin", atTau/10, 1-Math.exp(-1), 0.01);
  ok("V(son)/Vin", r.frames[r.frames.length-1].V.out/10, 1-Math.exp(-3), 0.01);
}

/* ---- 4) Diyot: modele göre tutarlı + gerçekçi (~0.6-0.7V) ---- */
section("Diyot + seri direnç (model tutarlılığı)");
{
  const c = { parts: [P("V","V1","in","0",{v:5},[0,0,0,0]),
                      P("R","R1","in","d",{v:1000},[0,0,0,0]),
                      P("D","D1","d","0",{vf:0.7,if:0.01},[0,0,0,0])], probes:["d"] };
  const r = SE.simulate(c, { analysis: "dc" });
  const vd = r.frames[0].V.d, id = r.frames[0].I.D1;
  const VT = SE.VT, n = 1.8, Is = 0.01/Math.exp(0.7/(n*VT));
  let va = 0.65; for (let k=0;k<80;k++){ const ii=Is*(Math.exp(va/(n*VT))-1); va -= (va+1000*ii-5)/(1+1000*ii/(n*VT)); }
  ok("Vd (model ile aynı)", vd, va, 1e-6);
  ok("Vd gerçekçi (0.60-0.75V)", (vd>0.60 && vd<0.75) ? 1 : 0, 1, 0);
  ok("KVL: Vd + R·Id = 5V", vd + 1000*id, 5, 1e-9);
}

/* ---- 5) Zener: sabit gerilim ---- */
section("Zener 5.1V sabitleyici (Vin=12, R=220 → ≈5.34V, ≈30mA)");
{
  const c = { parts: [P("V","V1","in","0",{v:12},[0,0,0,0]),
                      P("R","R1","in","z",{v:220},[0,0,0,0]),
                      P("Z","D1","0","z",{vz:5.1},[0,0,0,0])], probes:["z"] };
  const r = SE.simulate(c, { analysis: "dc" });
  const vz = r.frames[0].V.z, iz = r.frames[0].I.D1;
  ok("Vz", vz, 5.34, 0.25);
  ok("Iz (mA, anota girer → negatif)", iz*1000, -30.3, 3);
  ok("KVL: Vz + R·|I| = 12V", vz + 220*Math.abs(iz), 12, 1e-3);
}

/* ---- 6) Op-amp pozitif yükseltici: K = 1+Rf/Rg = 10 ---- */
section("Op-amp non-inv (K=1+9k/1k=10)");
{
  const c = { parts: [P("VSIN","V1","in","0",{amp:0.5,f:1000},[0,0,0,0]),
                      P("R","Rg","inv","0",{v:1000},[0,0,0,0]),
                      {t:"OPAMP",id:"U1",plus:"in",minus:"inv",out:"out",a:1e5,vsat:12,geo:[0,0,0,0]},
                      P("R","Rf","inv","out",{v:9000},[0,0,0,0]),
                      P("R","RL","out","0",{v:10000},[0,0,0,0])], probes:["out"] };
  const r = SE.simulate(c, { analysis: "tran", steps: 400, tEnd: 0.002 });
  let vmax = 0; for (const f of r.frames) vmax = Math.max(vmax, Math.abs(f.V.out));
  ok("Vout_pik / Vin_pik", vmax/0.5, 10, 0.05);
}

/* ---- 7) Op-amp ters yükseltici: K = -10 ---- */
section("Op-amp inverting (K=-Rf/Rin=-10, giriş-çıkış ters faz)");
{
  const c = { parts: [P("VSIN","V1","in","0",{amp:0.5,f:1000},[0,0,0,0]),
                      P("R","R1","in","inv",{v:1000},[0,0,0,0]),
                      P("R","R2","inv","out",{v:10000},[0,0,0,0]),
                      {t:"OPAMP",id:"U1",plus:"0",minus:"inv",out:"out",a:1e5,vsat:12,geo:[0,0,0,0]},
                      P("R","RL","out","0",{v:10000},[0,0,0,0])], probes:["in","out"] };
  const r = SE.simulate(c, { analysis: "tran", steps: 400, tEnd: 0.002 });
  const n = r.frames.length;
  const vin = r.frames[n>>1].V.in, vout = r.frames[n>>1].V.out;
  ok("Vout/Vin (faz ters)", vout/vin, -10, 0.1);
}

/* ---- 8) BJT: AKTİF bölgede Ic ≈ β·Ib (RB=1MΩ → doygun değil) ---- */
section("BJT ortak-emiter, aktif bölge (Ic ≈ β·Ib)");
{
  const beta = 100, RB = 1e6, RC = 4700;
  const c = { parts: [P("V","VCC","vcc","0",{v:12},[0,0,0,0]),
                      P("R","RB","vcc","b",{v:RB},[0,0,0,0]),
                      P("R","RC","vcc","c",{v:RC},[0,0,0,0]),
                      {t:"NPN",id:"Q1",base:"b",col:"c",emit:"0",bf:beta,br:4,is:1e-14,geo:[0,0,0,0]}],
              probes:["c"] };
  const r = SE.simulate(c, { analysis: "dc" });
  const Vc = r.frames[0].V.c, Vb = r.frames[0].V.b;
  const Ib = (12 - Vb) / RB, Ic = (12 - Vc) / RC, Vce = Vc;
  ok("Vbe", Vb, 0.66, 0.06);
  ok("Ib (µA)", Ib*1e6, (12-0.66)/RB*1e6, 3);
  ok("Ic (mA)", Ic*1000, beta*Ib*1000, 0.05);
  ok("β etkin", Ic/Ib, beta, 2);
  ok("aktif bölge: Vce > Vbe − 0.2", Vce > Vb - 0.3 ? 1 : 0, 1, 0);
  ok("Vc (V)", Vc, 12 - beta*Ib*RC, 0.25);
}

/* ---- 9) MOSFET: doygun akım ---- */
section("MOSFET Level-1 (Id = 0.5·kp·Vov²)");
{
  const kp = 0.02, vt = 0.7, vgs = 3.0;
  const c = { parts: [P("V","VG","g","0",{v:vgs},[0,0,0,0]),
                      P("V","VDD","d","0",{v:12},[0,0,0,0]),
                      {t:"NMOS",id:"M1",gate:"g",drain:"d",src:"0",vt:vt,kp:kp,lambda:0,geo:[0,0,0,0]}],
              probes:["d"] };
  const r = SE.simulate(c, { analysis: "dc" });
  const Id = r.frames[0].I.M1;
  ok("Id", Id, 0.5*kp*Math.pow(vgs-vt,2), 1e-6);
}

/* ---- 10) AC: RC alçak geçiren -3dB ---- */
section("RC LPF AC (-3dB @ fc=1/(2πRC))");
{
  const R = 15915, C = 10e-9, fc = 1/(2*Math.PI*R*C);
  const c = { parts: [P("VSIN","V1","in","0",{amp:5,f:1000,ac:1},[0,0,0,0]),
                      P("R","R1","in","out",{v:R},[0,0,0,0]),
                      P("C","C1","out","0",{v:C},[0,0,0,0])], probes:["out"] };
  const r = SE.ac(c, { f1: 10, f2: 1e6, pts: 200, probe: "out", ref: "in" });
  let magAtFc = null, best = Infinity;
  for (let i = 0; i < r.freqs.length; i++) { const d = Math.abs(Math.log(r.freqs[i]/fc)); if (d < best) { best = d; magAtFc = r.mag[i]; } }
  ok("fc (Hz) örneği bulundu", r.freqs.length ? 1 : 0, 1, 0);
  ok("Mag @ fc (dB)", magAtFc, -3.01, 0.3);
  // DC'ye yakın ~0dB
  ok("Mag @ 10Hz (dB)", r.mag[0], 0, 0.1);
}

/* ---- 11) Tel akım akışı: KCL korunuyor (tel akımları + cihaz enjeksiyonları) ---- */
section("Tel akım akışı (animasyon) — KCL");
{
  const c = SE.circuits.find(x => x.id === "bolucu");
  const r = SE.simulate(c, { analysis: "dc" });
  const flows = SE.wireFlow(c, r.frames[0].I);
  ok("en az 1 tel", flows.length >= 1 ? 1 : 0, 1, 0);
  // wireFlow: tel çıkışı = cihaz enjeksiyonu (Laplacian çözümü). Kontrol: fark ≈ 0.
  const key = (x, y) => Math.round(x) + "," + Math.round(y);
  const verts = {};
  const addv = (x, y, v) => { const k = key(x, y); verts[k] = (verts[k] || 0) + v; };
  for (const f of flows) { addv(f.a.x, f.a.y, +f.i); addv(f.b.x, f.b.y, -f.i); }
  for (const p of c.parts) {
    if (p.t === "WIRE" || p.t === "SW" || p.t === "GND") continue;
    const ps = SE.partPins(p), I = r.frames[0].I[p.id] || 0;
    if (ps.length >= 2) { addv(ps[0].x, ps[0].y, -I); addv(ps[1].x, ps[1].y, +I); }  // çıkar: enjeksiyon
  }
  let maxImb = 0;
  for (const k in verts) maxImb = Math.max(maxImb, Math.abs(verts[k]));
  ok("düğüm başına KCL dengesizliği", maxImb, 0, 1e-9);
  // dönüş teli toplam devre akımını taşımalı (~8.16mA)
  // bolucu: V=12, R1+R2=14700 → I=0.816mA
  ok("devre akımı (mA)", r.frames[0].I.R1*1000, 12/14700*1000, 0.05);
}

/* ---- 12) Buck: ortalama çıkış ≈ Vin·duty ---- */
section("Buck (Vout ≈ Vin·duty)");
{
  const c = SE.circuits.find(x => x.id === "buck");
  const r = SE.simulate(c, { analysis: "tran" });
  const fr = r.frames.slice(Math.floor(r.frames.length/2));
  let avg = 0; for (const f of fr) avg += f.V.out; avg /= fr.length;
  ok("Vout_ort", avg, 12*0.5, 0.5);
}

/* ---- 12) Devre denetleyici: net/isim bağımsız eşdeğerlik + fark yakalama ---- */
section("Devre denetleyici (topoloji + davranış)");
{
  const dclone = (c) => JSON.parse(JSON.stringify(c));
  const rename = (c, netMap, idMap) => {
    const cl = dclone(c);
    const mn = n => (netMap[n] !== undefined ? netMap[n] : n);
    for (const p of cl.parts) {
      p.id = (idMap && idMap[p.id] !== undefined) ? idMap[p.id] : p.id + "_x";
      if (p.a !== undefined) p.a = mn(p.a);
      if (p.b !== undefined) p.b = mn(p.b);
      for (const k of ["plus","minus","out","base","col","emit","gate","drain","src"]) if (p[k] !== undefined) p[k] = mn(p[k]);
    }
    return cl;
  };

  const bol = SE.circuits.find(x => x.id === "bolucu");
  const self = SE.checkCircuit(dclone(bol), bol);
  ok("kendisiyle eşdeğer (topoloji)", self.topologyOk ? 1 : 0, 1, 0);
  ok("kendisiyle eşdeğer (davranış)", self.behaviorOk ? 1 : 0, 1, 0);
  ok("kendisiyle eşdeğer (genel)", self.ok ? 1 : 0, 1, 0);

  const ren = rename(bol, { in: "A1", out: "A2", 0: "0" });
  const eq = SE.checkCircuit(ren, bol);
  ok("net/isim değişse de eşdeğer", eq.ok ? 1 : 0, 1, 0);

  const badVal = dclone(bol);
  badVal.parts.find(p => p.id === "R2").v = 999999;
  const bv = SE.checkTopology(badVal, bol);
  ok("yanlış değer yakalandı", bv.ok ? 0 : 1, 1, 0);

  const badConn = dclone(bol);
  badConn.parts.find(p => p.id === "R2").b = "in";
  const bc = SE.checkTopology(badConn, bol);
  ok("yanlış bağlantı yakalandı", bc.ok ? 0 : 1, 1, 0);

  const behBad = dclone(bol);
  behBad.parts.find(p => p.id === "R2").v = 100;
  ok("davranış farkı yakalandı", SE.checkBehavior(behBad, bol).ok ? 0 : 1, 1, 0);

  let allOk = true;
  for (const c of SE.circuits) { if (!SE.checkCircuit(rename(c, { 0: "0" }), c).ok) { allOk = false; console.log("    (uyuşmadı: " + c.id + ")"); } }
  ok("16 devrenin tümü kendiyle eşdeğer", allOk ? 1 : 0, 1, 0);
}

console.log("\n============================");
console.log("GEÇEN: " + pass + "   HATA: " + fail);
process.exit(fail ? 1 : 0);
