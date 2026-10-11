/* =========================================================================
   Elektronik Akademi — Simülatör Görünümü (sim-view.js)
   Profesyonel EDA tarzı şema: ızgara tuvali, tam sembol kütüphanesi,
   junction noktaları, manyetik sürükleme, geri al, canlı ölçüm/osk.
   SimEngine'e bağlıdır.
   ========================================================================= */
(function () {
  "use strict";

  const VW = 680, VH = 420;                 // SVG kullanıcı uzayı
  const NET_COLOR = { in: "#e0a52c", out: "#2cc6a0", sw: "#3a7bd5", 0: "#8ba0ba" };
  const netColor = (n) => NET_COLOR[n] || "#c9a227";

  const C = {
    lead: "#7a93b0",      // tel / pin ucu
    dev:  "#e8f0fa",      // sembol gövdesi
    fill: "#0d1420",      // sembol iç dolgu
    grid: "#1e3050",      // ızgara
    grid2: "#16203a",
    gnd:  "#8a9fba",
    hi:   "#4a9eff",      // vurgu
    led:  "#ff4030",
    zen:  "#a8a8e0",
    bat:  "#22c55e",
    vc:   "#f59e0b"
  };

  const simView = {
    circ: null, sim: null, values: {}, frame: 0, playing: true,
    phase: 0, speed: 1, probeA: null, probeB: null, selPart: null, lastT: 0, raf: 0,
    heatMap: {},
    
    bbMode: false,
    bbHoles: [],       // {x,y, type:'power+'|'power-'|'terminal', row,col, node}
    bbNodeMap: {},     // nodeName -> {holes[], voltage}
    bbParts: [],       // parts placed on breadboard
    bbWires: [],       // jumpers {fromNode, toNode, color}
    bbArduino: null,   // {pins: {pinName: node}}
    bbTool: "part",    // part|wire|delete
    bbSelHole: null,
    bbSelPart: null,
  };

  /* ---------------------------- yardımcılar --------------------------- */
  function fnum(v, unit) {
    if (v == null || !isFinite(v)) return "—";
    const a = Math.abs(v);
    if (a >= 1e6) return (v / 1e6).toFixed(3) + " M" + unit;
    if (a >= 1e3) return (v / 1e3).toFixed(3) + " k" + unit;
    if (a >= 1) return v.toFixed(3) + " " + unit;
    if (a >= 1e-3) return (v * 1e3).toFixed(3) + " m" + unit;
    if (a >= 1e-6) return (v * 1e6).toFixed(3) + " µ" + unit;
    return v.toExponential(2) + " " + unit;
  }
  function svg(tag, attrs, inner) {
    let a = "";
    for (const k in attrs) { const v = attrs[k]; if (v == null) continue; a += " " + k + '="' + v + '"'; }
    return inner == null ? `<${tag}${a}/>` : `<${tag}${a}>${inner}</${tag}>`;
  }
  const line = (x1, y1, x2, y2, col, w) => svg("line", { x1, y1, x2, y2, stroke: col || C.lead, "stroke-width": w || 2, "stroke-linecap": "round" });
  const poly = (pts, attrs) => svg("polygon", Object.assign({ points: pts.map(p => p.join(",")).join(" ") }, attrs || {}));
  const pline = (pts, attrs) => svg("polyline", Object.assign({ points: pts.map(p => p.join(",")).join(" "), fill: "none" }, attrs || {}));
  const circleEl = (cx, cy, r, attrs) => svg("circle", Object.assign({ cx, cy, r }, attrs || {}));
  const path = (d, attrs) => svg("path", Object.assign({ d, fill: "none" }, attrs || {}));
  function txt(x, y, str, cls, extra) {
    let a = ` x="${x}" y="${y}"`;
    if (cls) a += ` class="${cls}"`;
    if (extra) for (const k in extra) a += ` ${k}="${extra[k]}"`;
    return `<text${a}>${str}</text>`;
  }
  function arrow(x1, y1, x2, y2, col, w) {
    const ang = Math.atan2(y2 - y1, x2 - x1), a = 8;
    const p1 = [x2 - a * Math.cos(ang - 0.5), y2 - a * Math.sin(ang - 0.5)];
    const p2 = [x2 - a * Math.cos(ang + 0.5), y2 - a * Math.sin(ang + 0.5)];
    return line(x1, y1, x2, y2, col, w) + poly([[x2, y2], p1, p2], { fill: col, stroke: "none" });
  }
  function mid(g) { return [(g[0] + g[2]) / 2, (g[1] + g[3]) / 2]; }
  function horiz(g) { return Math.abs(g[2] - g[0]) >= Math.abs(g[3] - g[1]); }

  const EMPTY_FRAME = { V: {}, I: {}, partV: {}, led: {} };
  function pickFrame(sim, idx) {
    const fr = sim && sim.frames;
    if (!fr || !fr.length) return EMPTY_FRAME;
    return fr[Math.max(0, Math.min(fr.length - 1, Math.round(idx)))] || fr[0];
  }

  /* --------------------------- döndürme (rot) ------------------------- */
  function rotCenter(g) { return [(g[0] + g[2]) / 2, (g[1] + g[3]) / 2]; }
  function rotPt(pt, c, rot) {
    let x = pt.x, y = pt.y;
    for (let i = 0; i < (rot & 3); i++) {
      const nx = c[0] - (y - c[1]);
      const ny = c[1] + (x - c[0]);
      x = nx; y = ny;
    }
    return { x, y };
  }
  function vpins(p) {
    const pins = SimEngine.partPins(p);
    if (!p.rot) return pins;
    const c = rotCenter(p.geo);
    return pins.map(q => { const r = rotPt(q, c, p.rot); return { n: q.n, x: r.x, y: r.y }; });
  }
  function rotateGeo90(g) {
    const [x1, y1, x2, y2] = g;
    const [cx, cy] = rotCenter(g);
    const a = rotPt({ x: x1, y: y1 }, [cx, cy], 1);
    const b = rotPt({ x: x2, y: y2 }, [cx, cy], 1);
    return [a.x, a.y, b.x, b.y];
  }
  function geoCorners(g, rot) {
    const c = rotCenter(g);
    return [[g[0], g[1]], [g[2], g[1]], [g[2], g[3]], [g[0], g[3]]].map(pt => rotPt({ x: pt[0], y: pt[1] }, c, rot || 0));
  }
  function geometryFor(circ) {
    const g = {};
    for (const p of circ.parts) {
      if (!p.geo) continue;
      if (p.rot) {
        const c = rotCenter(p.geo);
        const a = rotPt({ x: p.geo[0], y: p.geo[1] }, c, p.rot);
        const b = rotPt({ x: p.geo[2], y: p.geo[3] }, c, p.rot);
        g[p.id] = [a.x, a.y, b.x, b.y];
      } else {
        g[p.id] = p.geo;
      }
    }
    return g;
  }
  function labelPos(p) {
    const cs = geoCorners(p.geo, p.rot);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const q of cs) { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const hz = (x1 - x0) >= (y1 - y0);
    return { lx: hz ? cx : x1 + 12, ly: hz ? y0 - 10 : cy, anchor: hz ? "middle" : "start" };
  }

  /* =========================== BREADBOARD 830 ========================== */
    
  

  // Build breadboard hole map (static layout)
  

  
  

  
  

  /* --------------------------- sembol çizimi --------------------------
     Tüm parça tipleri için standart EDA sembolleri. Pin uçları
     SimEngine.partPins ile birebir hizalıdır.                            */
  function drawPart(p, selected) {
    const [x1, y1, x2, y2] = p.geo, hz = horiz(p.geo), [cx, cy] = mid(p.geo);
    const L = (ax, ay, bx, by, w) => line(ax, ay, bx, by, C.lead, w || 2);
    const dev = (ax, ay, bx, by, w) => line(ax, ay, bx, by, C.dev, w || 2.4);
    const F = { fill: C.fill, stroke: C.dev, "stroke-width": 2, "stroke-linejoin": "round" };
    let s = "";
    const t = p.t;

    if (t === "WIRE") {
      s = svg("line", { x1, y1, x2, y2, class: "wire" });
    }
    else if (t === "R") {
      const HW = 18, A = 7;
      if (hz) {
        const pts = [[cx - HW, cy], [cx - 12, cy - A], [cx - 6, cy + A], [cx, cy - A], [cx + 6, cy + A], [cx + 12, cy - A], [cx + HW, cy]];
        s = L(x1, y1, cx - HW, cy) + pline(pts, { stroke: C.dev, "stroke-width": 2.2, "stroke-linejoin": "round" }) + L(cx + HW, cy, x2, y2);
      } else {
        const pts = [[cx, cy - HW], [cx + A, cy - 12], [cx - A, cy - 6], [cx + A, cy], [cx - A, cy + 6], [cx + A, cy + 12], [cx, cy + HW]];
        s = L(x1, y1, cx, cy - HW) + pline(pts, { stroke: C.dev, "stroke-width": 2.4, "stroke-linejoin": "round" }) + L(cx, cy + HW, x2, y2);
      }
    }
    else if (t === "C") {
      const G = 5, PL = 13;
      if (hz) {
        s = L(x1, y1, cx - G, cy) + L(cx + G, cy, x2, y2) +
            dev(cx - G, cy - PL, cx - G, cy + PL, 3) + dev(cx + G, cy - PL, cx + G, cy + PL, 3);
      } else {
        s = L(x1, y1, cx, cy - G) + L(cx, cy + G, x2, y2) +
            dev(cx - PL, cy - G, cx + PL, cy - G, 3) + dev(cx - PL, cy + G, cx + PL, cy + G, 3);
      }
    }
    else if (t === "L") {
      const R = 6, W = 4 * 2 * R, x0 = cx - W / 2, y0 = cy - W / 2;
      let d = "";
      if (hz) { for (let i = 0; i < 4; i++) { const sx = x0 + i * 2 * R; d += `M ${sx} ${cy} a ${R} ${R} 0 0 1 ${2 * R} 0 `; } s = L(x1, y1, x0, cy) + path(d, { stroke: C.dev, "stroke-width": 2.4 }) + L(x0 + W, cy, x2, y2); }
      else { for (let i = 0; i < 4; i++) { const sy = y0 + i * 2 * R; d += `M ${cx} ${sy} a ${R} ${R} 0 0 1 0 ${2 * R} `; } s = L(x1, y1, cx, y0) + path(d, { stroke: C.dev, "stroke-width": 2.4 }) + L(cx, y0 + W, x2, y2); }
    }
    else if (t === "D" || t === "LED" || t === "Z") {
      const sz = 10, isLED = t === "LED";
      const colD = isLED ? C.led : (t === "Z" ? C.zen : C.dev);
      if (hz) {
        const dir = x2 > x1 ? 1 : -1, base = cx - dir * sz, tip = cx + dir * sz;
        s = L(x1, y1, base, cy) + poly([[base, cy - sz], [base, cy + sz], [tip, cy]], { fill: colD, stroke: colD, "stroke-width": 1 }) +
            dev(tip, cy - sz, tip, cy + sz, 3);
        if (t === "Z") s += line(tip, cy - sz, tip - dir * 5, cy - sz - 6, colD, 3) + line(tip, cy + sz, tip + dir * 5, cy + sz + 6, colD, 3);
        s += L(tip, cy, x2, y2);
        if (isLED) s += arrow(cx - 6, cy - 12, cx + 6, cy - 22, C.led, 1.8) + arrow(cx + 4, cy - 10, cx + 16, cy - 20, C.led, 1.8);
      } else {
        const dir = y2 > y1 ? 1 : -1, base = cy - dir * sz, tip = cy + dir * sz;
        s = L(x1, y1, cx, base) + poly([[cx - sz, base], [cx + sz, base], [cx, tip]], { fill: colD, stroke: colD, "stroke-width": 1 }) +
            dev(cx - sz, tip, cx + sz, tip, 3);
        if (t === "Z") s += line(cx - sz, tip, cx - sz - 6, tip + dir * 5, colD, 3) + line(cx + sz, tip, cx + sz + 6, tip - dir * 5, colD, 3);
        s += L(cx, tip, x2, y2);
        if (isLED) s += arrow(cx + 12, cy - 6, cx + 22, cy + 6, C.led, 1.8) + arrow(cx + 10, cy + 4, cx + 20, cy + 16, C.led, 1.8);
      }
      if (isLED) s += circleEl(cx, cy, 26, { class: "led-glow", "data-led": p.id, fill: C.led, opacity: 0 });
    }
    else if (t === "V") {
      if (hz) {
        const bw = 14, bh = 22;
        s = L(x1, y1, cx - bw, cy) + L(cx + bw, cy, x2, y2);
        s += dev(cx, cy - bh, cx, cy + bh, 3);
        s += dev(cx - 8, cy - bh + 5, cx + 8, cy - bh + 5, 2);
        s += dev(cx - 8, cy + bh - 5, cx + 8, cy + bh - 5, 2);
        s += circleEl(cx, cy, 14, { fill: "none", stroke: C.hi, "stroke-width": 1, opacity: 0.3 });
        s += txt(cx, cy - 6, "+", "sym-sign", { fill: C.bat, "text-anchor": "middle", "font-size": "10" });
        s += txt(cx, cy + 12, "−", "sym-sign", { fill: C.led, "text-anchor": "middle", "font-size": "10" });
      } else {
        const bw = 14, bh = 22;
        s = L(x1, y1, cx, cy - bh) + L(cx, cy + bh, x2, y2);
        s += dev(cx - bh, cy, cx + bh, cy, 3);
        s += dev(cx - bh + 5, cy - 8, cx - bh + 5, cy + 8, 2);
        s += dev(cx + bh - 5, cy - 8, cx + bh - 5, cy + 8, 2);
        s += circleEl(cx, cy, 14, { fill: "none", stroke: C.hi, "stroke-width": 1, opacity: 0.3 });
        s += txt(cx - 8, cy + 3, "+", "sym-sign", { fill: C.bat, "text-anchor": "middle", "font-size": "10" });
        s += txt(cx + 12, cy + 3, "−", "sym-sign", { fill: C.led, "text-anchor": "middle", "font-size": "10" });
      }
    }
    else if (t === "VSIN") {
      const R = 16;
      if (hz) s = L(x1, y1, cx - R, cy) + L(cx + R, cy, x2, y2); else s = L(x1, y1, cx, cy - R) + L(cx, cy + R, x2, y2);
      s += circleEl(cx, cy, R, { fill: C.fill, stroke: C.dev, "stroke-width": 2 });
      s += path(`M ${cx - 11} ${cy} q 5.5 ${-9} 11 0 q 5.5 9 11 0`, { stroke: "#e0a52c", "stroke-width": 2 });
    }
    else if (t === "VPULSE") {
      const R = 16;
      if (hz) s = L(x1, y1, cx - R, cy) + L(cx + R, cy, x2, y2); else s = L(x1, y1, cx, cy - R) + L(cx, cy + R, x2, y2);
      s += circleEl(cx, cy, R, { fill: C.fill, stroke: C.dev, "stroke-width": 2 });
      s += path(`M ${cx - 11} ${cy + 5} h 6 v -10 h 6 v 10 h 6 v -10 h 4`, { stroke: "#3a7bd5", "stroke-width": 2 });
    }
    else if (t === "I") {
      const R = 16;
      if (hz) s = L(x1, y1, cx - R, cy) + L(cx + R, cy, x2, y2); else s = L(x1, y1, cx, cy - R) + L(cx, cy + R, x2, y2);
      s += circleEl(cx, cy, R, { fill: C.fill, stroke: C.dev, "stroke-width": 2 });
      if (hz) s += arrow(cx - 8, cy, cx + 8, cy, C.dev, 2); else s += arrow(cx, cy + 10, cx, cy - 10, C.dev, 2);
    }
    else if (t === "SW") {
      const closed = p.pwm ? true : (p.pulse ? true : (p.closed !== false)), R = 16;
      if (hz) {
        const dir = x2 > x1 ? 1 : -1;
        s = L(x1, y1, cx - dir * R, cy) + L(cx + dir * R, cy, x2, y2) +
            circleEl(cx - dir * R, cy, 3, { fill: C.dev }) + circleEl(cx + dir * R, cy, 3, { fill: C.dev }) +
            dev(cx - dir * R, cy, cx + dir * R, cy - (closed ? 0 : 14), 2.6);
      } else {
        const dir = y2 > y1 ? 1 : -1;
        s = L(x1, y1, cx, cy - dir * R) + L(cx, cy + dir * R, x2, y2) +
            circleEl(cx, cy - dir * R, 3, { fill: C.dev }) + circleEl(cx, cy + dir * R, 3, { fill: C.dev }) +
            dev(cx, cy - dir * R, cx + (closed ? 0 : 14), cy + dir * R, 2.6);
      }
    }
    else if (t === "OPAMP") {
      const my = (y1 + y2) / 2;
      s = poly([[x1, y1], [x1, y2], [x2, my]], { fill: C.fill, stroke: C.dev, "stroke-width": 2, "stroke-linejoin": "round" });
      const yM = y1 + (y2 - y1) * 0.28, yP = y1 + (y2 - y1) * 0.72;
      s += txt(x1 + 10, y1 + (y2 - y1) * 0.28 + 5, "−", "sym-sign", { fill: "#e5534b" });
      s += txt(x1 + 9, y1 + (y2 - y1) * 0.72 + 5, "+", "sym-sign", { fill: "#2cc6a0" });
      s += circleEl(x1, y1 + (y2 - y1) * 0.28, 2.5, { fill: C.lead });
      s += circleEl(x1, y1 + (y2 - y1) * 0.72, 3.2, { fill: C.lead });
      s += circleEl(x2, cy, 2.6, { fill: C.lead });
    }
    else if (t === "NPN" || t === "PNP") {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, bar = mx - 9;
      const topY = Math.min(y1, y2), botY = Math.max(y1, y2);
      s += L(x1, my, bar, my);                        // base lead
      s += dev(bar, my - 20, bar, my + 20, 3);        // base bar
      s += dev(bar, my - 9, mx, topY, 2.2);           // collector
      s += dev(bar, my + 9, mx, botY, 2.2);           // emitter
      if (t === "NPN") s += arrow((bar + mx) / 2 - 3, (my + 9 + botY) / 2 - 2, mx, botY, C.dev, 2.2);
      else s += arrow(mx, botY, (bar + mx) / 2 - 3, (my + 9 + botY) / 2 - 2, C.dev, 2.2);
      s += circleEl(mx, my, 36, { fill: "none", stroke: C.dev, "stroke-width": 1.6, opacity: 0.5 });
    }
    else if (t === "NMOS" || t === "PMOS") {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, gb = mx - 12, ch = mx - 6;
      s = L(x1, my, gb, my);                                        // gate lead
      s += dev(gb, my - 20, gb, my + 20, 2.6);                      // gate plate
      s += dev(ch, my - 20, ch, my - 8, 2.4) + dev(ch, my - 6, ch, my + 6, 2.4) + dev(ch, my + 8, ch, my + 20, 2.4); // channel
      s += dev(ch, my - 14, mx, y1, 2.2);                           // drain
      s += dev(ch, my + 14, mx, y2, 2.2);                           // source
      // body/substrate arrow (NMOS: içe, PMOS: dışa)
      if (t === "NMOS") s += arrow(ch + 2, my, ch + 14, my, C.dev, 2);
      else s += arrow(ch + 14, my, ch + 2, my, C.dev, 2);
    }
    else if (t === "GND") {
      s = L(x1, y1, x1, y1 + 14) + dev(x1 - 14, y1 + 14, x1 + 14, y1 + 14, 3) + dev(x1 - 9, y1 + 20, x1 + 9, y1 + 20, 2.4) + dev(x1 - 4, y1 + 26, x1 + 4, y1 + 26, 2);
    }

    const cls = "part" + (selected ? " selected" : "");
    if (p.rot) {
      const [rcx, rcy] = rotCenter(p.geo);
      return svg("g", { class: cls, "data-part": p.id }, `<g transform="rotate(${p.rot * 90} ${rcx.toFixed(1)} ${rcy.toFixed(1)})">${s}</g>`);
    }
    return svg("g", { class: cls, "data-part": p.id }, s);
  }

  /* --------------------- etiket metni (designator+değer) -------------- */
  function partLabel(p) {
    if (p.t === "R") return `${p.id}  ${fnum(p.overrideV != null ? p.overrideV : p.v, "Ω")}`;
    if (p.t === "C") return `${p.id}  ${fnum(p.v, "F")}`;
    if (p.t === "L") return `${p.id}  ${fnum(p.v, "H")}`;
    if (p.t === "V") return `${p.id}  ${fnum(p.v, "V")}`;
    if (p.t === "VSIN") return `${p.id}  ${p.amp}V ${p.f}Hz`;
    if (p.t === "VPULSE") return `${p.id}  PWM ${p.f}Hz`;
    if (p.t === "I") return `${p.id}  ${fnum(p.v, "A")}`;
    if (t_ok(p.t)) return `${p.id}  ${p.t}`;
    return p.id;
  }
  function t_ok(t) { return t === "D" || t === "LED" || t === "Z" || t === "SW" || t === "NPN" || t === "PNP" || t === "NMOS" || t === "PMOS"; }

  /* --------------------------- şema tuveti ---------------------------- */
  function buildSchematic(circ, frame, hint, id, wireHint) {
    const V = (frame && frame.V) || {};
    const nodeAt = {};
    for (const p of circ.parts) {
      for (const pin of (vpins(p) || [])) {
        if (pin.n != null && !(pin.n in nodeAt)) nodeAt[pin.n] = [pin.x, pin.y];
      }
    }

    let out = `<svg id="${id || "sim-svg"}" viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg">`;
    out += `<defs>
      <radialGradient id="bg-grad" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#111c30"/>
        <stop offset="100%" stop-color="#0a0f18"/>
      </radialGradient>
      <pattern id="sgrid" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="0.8" fill="${C.grid}"/>
      </pattern>
      <pattern id="sgrid2" width="100" height="100" patternUnits="userSpaceOnUse">
        <rect width="100" height="100" fill="url(#sgrid)"/>
        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="${C.grid2}" stroke-width="0.5"/>
      </pattern>
      <filter id="glow-sel">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;
    out += `<rect width="${VW}" height="${VH}" fill="url(#bg-grad)"/>`;
    out += `<rect width="${VW}" height="${VH}" fill="url(#sgrid2)"/>`;

    out += circ.parts.map(p => drawPart(p, p.id === simView.selPart)).join("");

    // ısınma / yanma efekti
    for (const p of circ.parts) {
      if (p.t === "WIRE" || p.t === "GND") continue;
      const heat = simView.heatMap[p.id] || 0;
      if (heat < 0.05) continue;
      const [cx, cy] = rotCenter(p.geo);
      const r = 14 + heat * 22;
      const glow = circleEl(cx, cy, r, { fill: "none", stroke: heat > 0.6 ? "#ff4400" : "#ff8800", "stroke-width": 2 + heat * 3, opacity: 0.3 + heat * 0.5 });
      out += glow;
      if (heat > 0.3) {
        const n = Math.floor(heat * 5);
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2;
          const d = Math.random() * r * 0.7;
          out += circleEl(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1.5 + Math.random() * 2, { fill: heat > 0.6 ? "#ff2200" : "#ffaa00", opacity: 0.6 + Math.random() * 0.4 });
        }
      }
    }

    // junction noktaları (>=3 iletken birleşimi)
    const jc = {};
    for (const p of circ.parts) for (const q of vpins(p)) {
      const k = Math.round(q.x) + "," + Math.round(q.y);
      jc[k] = (jc[k] || 0) + 1;
    }
    for (const k in jc) if (jc[k] >= 3) {
      const [jx, jy] = k.split(",");
      out += circleEl(jx, jy, 3.4, { fill: C.lead, stroke: "#0b0f16", "stroke-width": 1 });
    }

    // manyetik yakalama vurgusu
    if (hint) out += circleEl(hint.x, hint.y, 8, { fill: "none", stroke: C.hi, "stroke-width": 2 }) + circleEl(hint.x, hint.y, 3, { fill: C.hi });
    if (wireHint) out += line(wireHint.fx, wireHint.fy, wireHint.tx, wireHint.ty, C.hi, 2) +
      circleEl(wireHint.fx, wireHint.fy, 3.5, { fill: C.hi }) + circleEl(wireHint.tx, wireHint.ty, 3.5, { fill: C.hi });

    // net gerilim etiketleri
    for (const net in nodeAt) {
      if (net === "0") continue;
      const [nx, ny] = nodeAt[net], v = V[net];
      out += `<g class="node" data-net="${net}" style="cursor:pointer">` +
        circleEl(nx, ny, 4.5, { fill: netColor(net), stroke: "#0b0f16", "stroke-width": 1.2 }) +
        txt(nx + 10, ny - 8, `${net}: ${v == null ? "?" : v.toFixed(2)}V`, "nlabel") + `</g>`;
    }
    if (nodeAt["0"]) {
      const [gx, gy] = nodeAt["0"];
      out += txt(gx + 10, gy + 18, "0 (GND)", "nlabel", { fill: C.gnd });
    }

    // parça etiketleri + akım
    for (const p of circ.parts) {
      if (p.t === "WIRE") continue;
      const lp = labelPos(p);
      out += txt(lp.lx, lp.ly, partLabel(p), "plabel", { "text-anchor": lp.anchor });
      const showI = frame && frame.I && frame.I[p.id] != null && p.t !== "SW" && p.t !== "OPAMP" && p.t !== "NPN" && p.t !== "PNP" && p.t !== "NMOS" && p.t !== "PMOS";
      if (showI) out += txt(lp.lx, lp.ly - 12, fnum(frame.I[p.id] * 1000, "mA"), "plabel small", { "text-anchor": lp.anchor });
    }

    // akım animasyon noktaları katmanı (2 uçlu parçalar)
    out += `<g id="dots">`;
    for (const p of circ.parts) {
      if (["WIRE", "SW", "OPAMP", "NPN", "PNP", "NMOS", "PMOS"].indexOf(p.t) >= 0) continue;
      for (let i = 0; i < 3; i++) out += circleEl(0, 0, 2.6, { class: "dot", "data-part": p.id, fill: C.hi, opacity: 0 });
    }
    out += `</g>` + drawParticles() + `</svg>`;
    return out;
  }

  /* =========================== BREADBOARD RENDER ========================== */
  

  // Build circuit from breadboard state
  

  
  

  

  

  

  

  

  

  
  

  /* ------------------------------ osiloskop --------------------------- */
  function niceStep(x) {
    if (!(x > 0)) return 1;
    const e = Math.pow(10, Math.floor(Math.log10(x)));
    const m = x / e;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * e;
  }
  function fmtTime(ms) {
    if (ms >= 1) return ms.toFixed(ms < 10 ? 2 : 1) + " ms";
    if (ms >= 0.001) return (ms * 1000).toFixed(ms * 1000 < 10 ? 2 : 1) + " \u00b5s";
    return (ms * 1e6).toFixed(0) + " ns";
  }
  function drawScope(canvas, sim, frame) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const L = 40, R = 14, T = 26, B = 24;
    const gx = W - L - R, gy = H - T - B;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#05090f"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#16202e"; ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) { const x = L + gx * i / 10; ctx.beginPath(); ctx.moveTo(x, T); ctx.lineTo(x, T + gy); ctx.stroke(); }
    for (let j = 0; j <= 8; j++) { const y = T + gy * j / 8; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(L + gx, y); ctx.stroke(); }
    ctx.strokeStyle = "rgba(40,60,88,.55)"; ctx.setLineDash([1, 3]);
    for (let i = 0; i <= 50; i++) { if (i % 5 === 0) continue; const x = L + gx * i / 50; ctx.beginPath(); ctx.moveTo(x, T); ctx.lineTo(x, T + gy); ctx.stroke(); }
    for (let j = 0; j <= 40; j++) { if (j % 5 === 0) continue; const y = T + gy * j / 40; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(L + gx, y); ctx.stroke(); }
    ctx.setLineDash([]);
    ctx.strokeStyle = "#2c4568";
    ctx.beginPath(); ctx.moveTo(L, T + gy / 2); ctx.lineTo(L + gx, T + gy / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(L + gx / 2, T); ctx.lineTo(L + gx / 2, T + gy); ctx.stroke();
    ctx.strokeStyle = "#2b3f5c"; ctx.strokeRect(L, T, gx, gy);

    if (sim && sim.mode === "ac" && sim.freqs && sim.freqs.length) { drawBode(ctx, W, H, L, R, T, B, gx, gy, sim); return; }
    if (!sim || !sim.probes || !sim.probes.length || sim.mode !== "tran") {
      ctx.fillStyle = "#54688a"; ctx.font = "14px 'Segoe UI'"; ctx.textAlign = "center";
      ctx.fillText("sinyal yok", W / 2, H / 2);
      const ro = document.getElementById("scope-readout"); if (ro) ro.innerHTML = "";
      const me = document.getElementById("scope-meas"); if (me) me.innerHTML = "";
      return;
    }
    const nets = sim.probes;
    const N = sim.frames.length;
    const fullSpan = sim.tEnd || (sim.frames[N - 1] && sim.frames[N - 1].t) || 1;
    const view = Math.max(0.06, Math.min(1, simView.scopeView || 1));
    const span = Math.max(fullSpan * view, 1e-12);
    const curT = frame ? frame.t : sim.frames[N - 1].t;
    let t0 = curT - span * 0.9;
    t0 = Math.max(0, Math.min(t0, fullSpan - span));
    const t1 = t0 + span;
    let vmax = -1e9, vmin = 1e9;
    for (let i = 0; i < N; i++) { const t = sim.frames[i].t; if (t < t0 || t > t1) continue; for (const n of nets) { const v = sim.frames[i].V[n] || 0; if (v > vmax) vmax = v; if (v < vmin) vmin = v; } }
    if (vmax < vmin) { vmax = 1; vmin = -1; }
    let vdiv;
    if (simView.scopeVdiv && simView.scopeVdiv !== "auto") vdiv = +simView.scopeVdiv;
    else vdiv = niceStep(Math.max(vmax - vmin, 1e-9) / 6.4);
    const mid = (vmax + vmin) / 2;
    const pos = simView.scopePos == null ? 0.5 : simView.scopePos;
    const yFor = v => (T + gy * pos) - (v - mid) / vdiv * (gy / 8);
    const xFor = t => L + gx * (t - t0) / span;
    nets.forEach(n => {
      ctx.strokeStyle = netColor(n); ctx.lineWidth = 1.8; ctx.shadowColor = netColor(n); ctx.shadowBlur = 4; ctx.beginPath();
      let started = false;
      for (let i = 0; i < N; i++) { const t = sim.frames[i].t; if (t < t0 || t > t1) continue; const x = xFor(t), y = yFor(sim.frames[i].V[n] || 0); if (started) ctx.lineTo(x, y); else { ctx.moveTo(x, y); started = true; } }
      ctx.stroke(); ctx.shadowBlur = 0;
    });
    const trig = simView.scopeTrig == null ? 0.5 : simView.scopeTrig;
    const yTrig = yFor(mid + (0.5 - trig) * 8 * vdiv);
    if (yTrig > T && yTrig < T + gy) {
      ctx.strokeStyle = "rgba(245,158,11,.65)"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(L, yTrig); ctx.lineTo(L + gx, yTrig); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.moveTo(L + gx, yTrig); ctx.lineTo(L + gx + 8, yTrig - 4); ctx.lineTo(L + gx + 8, yTrig + 4); ctx.closePath(); ctx.fill();
    }
    const c1 = simView.cur1 == null ? 0.3 : simView.cur1, c2 = simView.cur2 == null ? 0.7 : simView.cur2;
    [[c1, "#22d3ee", "T1"], [c2, "#f472b6", "T2"]].forEach(cd => {
      const x = L + gx * cd[0];
      ctx.strokeStyle = cd[1]; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.moveTo(x, T); ctx.lineTo(x, T + gy); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = cd[1]; ctx.font = "10px Consolas,monospace"; ctx.textAlign = "left"; ctx.fillText(cd[2], x + 2, T + 10);
    });
    nets.forEach((n, i) => {
      const y = T + gy * pos;
      ctx.fillStyle = netColor(n);
      ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(L - 6, y - 4); ctx.lineTo(L - 6, y + 4); ctx.closePath(); ctx.fill();
      ctx.font = "10px Consolas,monospace"; ctx.textAlign = "left";
      ctx.fillText("\u25b8" + n, L + 2, T + 11 + i * 12);
    });
    ctx.fillStyle = "#8fb0d6"; ctx.font = "10px Consolas,monospace";
    ctx.textAlign = "left"; ctx.fillText(vdiv >= 1 ? vdiv.toFixed(vdiv < 10 ? 1 : 0) + " V/div" : (vdiv * 1000).toFixed(0) + " mV/div", L + 2, H - 6);
    ctx.textAlign = "right"; ctx.fillText("t " + fmtTime(span / 10) + "/div", L + gx - 2, H - 6);

    const c0 = nets[0], vals = [];
    for (let i = 0; i < N; i++) { const t = sim.frames[i].t; if (t < t0 || t > t1) continue; vals.push(sim.frames[i].V[c0] || 0); }
    let vp = -1e9, vn = 1e9, sum2 = 0;
    for (let i = 0; i < vals.length; i++) { if (vals[i] > vp) vp = vals[i]; if (vals[i] < vn) vn = vals[i]; sum2 += vals[i] * vals[i]; }
    const vpp = vp - vn, vavg = vals.reduce((a, b) => a + b, 0) / (vals.length || 1), vrms = Math.sqrt(sum2 / (vals.length || 1));
    let cross = 0;
    for (let i = 1; i < vals.length; i++) if ((vals[i - 1] < vavg) !== (vals[i] < vavg)) cross++;
    const f = cross / 2 / span / 1000;
    const dtC = Math.abs(c2 - c1) * span;
    const me = document.getElementById("scope-meas");
    if (me) me.innerHTML =
      '<span>Vpp <b>' + vpp.toFixed(2) + '</b></span>' +
      '<span>Ort <b>' + vavg.toFixed(2) + '</b></span>' +
      '<span>Vrms <b>' + vrms.toFixed(2) + '</b></span>' +
      '<span>f <b>' + (f >= 1000 ? (f / 1000).toFixed(2) + "k" : f.toFixed(1)) + '</b></span>' +
      '<span>T <b>' + (f > 0.01 ? fmtTime(1000 / f) : "\u2014") + '</b></span>' +
      '<span>\u0394t <b>' + fmtTime(dtC) + '</b></span>' +
      '<span>1/\u0394t <b>' + (dtC > 0 ? (1 / (dtC / 1000) >= 1000 ? (1 / (dtC / 1000) / 1000).toFixed(2) + "k" : (1 / (dtC / 1000)).toFixed(1)) : "\u2014") + '</b></span>';
    const ro = document.getElementById("scope-readout");
    if (ro) ro.innerHTML = nets.map(n => '<span style="color:' + netColor(n) + '">\u25cf</span>' + n + " " + (frame ? (frame.V[n] || 0).toFixed(2) : "0") + "V").join(" &nbsp; ") +
      " \u00b7 " + (simView.scopeVdiv && simView.scopeVdiv !== "auto" ? vdiv + " V/div (MAN)" : "V/div AUTO");
  }

  function drawBode(ctx, W, H, L, R, T, B, gx, gy, sim) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0a0e15"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#141e2d"; ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) { const x = L + gx * i / 10; ctx.beginPath(); ctx.moveTo(x, T); ctx.lineTo(x, T + gy); ctx.stroke(); }
    for (let j = 0; j <= 8; j++) { const y = T + gy * j / 8; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(L + gx, y); ctx.stroke(); }
    const fr = sim.freqs, mag = sim.mag, ph = sim.phase;
    const f0 = fr[0], f1 = fr[fr.length - 1];
    const lg = Math.log10(f1) - Math.log10(f0) || 1;
    const lx = f => L + gx * (Math.log10(f) - Math.log10(f0)) / lg;
    let mmin = 1e9, mmax = -1e9;
    for (const m of mag) { if (m > mmax) mmax = m; if (m < mmin) mmin = m; }
    mmax = Math.ceil(mmax / 10) * 10; mmin = Math.floor(mmin / 10) * 10;
    if (mmax - mmin < 20) { mmax = mmin + 20; }
    const yM = m => T + gy * (1 - (m - mmin) / (mmax - mmin));
    const yP = p => T + gy * (1 - (p + 180) / 360);
    ctx.strokeStyle = "#a855f7"; ctx.lineWidth = 1.1; ctx.beginPath();
    ph.forEach((p, i) => { const x = lx(fr[i]), y = yP(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    ctx.strokeStyle = "#4a9eff"; ctx.lineWidth = 1.8; ctx.shadowColor = "#4a9eff"; ctx.shadowBlur = 4; ctx.beginPath();
    mag.forEach((m, i) => { const x = lx(fr[i]), y = yM(m); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(224,52,44,.7)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(L, yM(mmax - 3)); ctx.lineTo(L + gx, yM(mmax - 3)); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = "9px Consolas,monospace"; ctx.fillStyle = "#7f9bbf"; ctx.textAlign = "center";
    for (let d = Math.ceil(Math.log10(f0)); d <= Math.floor(Math.log10(f1)); d++) {
      const f = Math.pow(10, d);
      ctx.fillText(f >= 1e3 ? (f / 1e3) + "k" : f >= 1e6 ? (f / 1e6) + "M" : String(f), lx(f), H - 5);
    }
    ctx.textAlign = "left"; ctx.fillStyle = "#4a9eff"; ctx.fillText("|H| dB", L + 3, T - 5);
    ctx.fillStyle = "#a855f7"; ctx.textAlign = "right"; ctx.fillText("faz °", W - R, T - 5);
    const ro = document.getElementById("scope-readout");
    if (ro) {
      let fc = null;
      for (let i = 1; i < mag.length; i++) if ((mag[i - 1] >= mmax - 3) !== (mag[i] >= mmax - 3)) { fc = fr[i]; break; }
      ro.innerHTML = "BODE \u00b7 V(" + sim.probe + ")/V(" + sim.ref + ")";
      const me = document.getElementById("scope-meas");
      if (me) me.innerHTML =
        '<span>Kazan\u00e7 <b>' + mag[mag.length - 1].toFixed(1) + ' dB</b></span>' +
        '<span>f<sub>-3dB</sub> <b>' + (fc != null ? (fc >= 1000 ? (fc / 1000).toFixed(2) + ' kHz' : fc.toFixed(0) + ' Hz') : '\u2014') + '</b></span>' +
        '<span>Faz <b>' + ph[ph.length - 1].toFixed(0) + '\u00b0</b></span>' +
        '<span>f<sub>1</sub> <b>' + (f0 >= 1000 ? (f0 / 1000).toFixed(0) + 'k' : f0.toFixed(0)) + '</b></span>' +
        '<span>f<sub>2</sub> <b>' + (f1 >= 1e6 ? (f1 / 1e6).toFixed(0) + 'M' : f1 >= 1000 ? (f1 / 1000).toFixed(0) + 'k' : f1.toFixed(0)) + '</b></span>';
    }
  }

  /* ------------------------------ animasyon --------------------------- */
  function animate(ts) {
    simView.raf = requestAnimationFrame(animate);
    if (!document.getElementById("sim-svg")) { cancelAnimationFrame(simView.raf); return; }
    const dt = Math.min(0.05, (ts - (simView.lastT || ts)) / 1000); simView.lastT = ts;
    const { circ, sim } = simView; if (!circ || !sim) return;

    if (sim.mode === "tran" && simView.playing) {
      const N = sim.frames.length;
      const perSec = N / 4;
      simView.frame += perSec * dt * simView.speed;
      if (simView.frame >= N) simView.frame = N - 1;
    }
    const frame = pickFrame(sim, simView.frame);
    const V = frame.V, I = frame.I || {};

    // ısınma / yanma / patlama
    for (const p of circ.parts) {
      if (p.t === "WIRE" || p.t === "GND") continue;
      const pv = frame.partV && frame.partV[p.id] != null ? Math.abs(frame.partV[p.id]) : 0;
      const pi = I[p.id] != null ? Math.abs(I[p.id]) : 0;
      const power = pv * pi;
      const threshold = 0.08;
      const cur = simView.heatMap[p.id] || 0;
      let next;
      if (power > threshold) next = Math.min(1, cur + (power - threshold) * dt * 0.5);
      else next = Math.max(0, cur - dt * 0.2);
      if (next >= 1) {
        explodePart(p, circ);
        next = 0;
      }
      simView.heatMap[p.id] = next;
    }

    simView.phase = (simView.phase + dt * simView.speed) % 1;
    const geo = geometryFor(circ);
    document.querySelectorAll("#dots .dot").forEach((el, k) => {
      const g = geo[el.dataset.part]; if (!g) { el.setAttribute("opacity", 0); return; }
      const cur = I[el.dataset.part] || 0;
      const mag = Math.min(1, Math.abs(cur) / 0.05);
      el.setAttribute("opacity", mag < 0.02 ? 0 : (0.35 + 0.65 * mag));
      const perPart = 3;
      let off = (simView.phase * (0.6 + 1.8 * mag) + k / perPart) % 1;
      if (cur < 0) off = 1 - off;
      el.setAttribute("cx", g[0] + (g[2] - g[0]) * off);
      el.setAttribute("cy", g[1] + (g[3] - g[1]) * off);
    });

    for (const p of circ.parts) if (p.t === "LED") {
      const el = document.querySelector('.led-glow[data-led="' + p.id + '"]');
      if (el) el.setAttribute("opacity", (frame.led && frame.led[p.id] || 0) * 0.55);
    }

    document.querySelectorAll("#sim-svg .node").forEach(n => {
      const net = n.dataset.net, t = n.querySelector(".nlabel");
      if (t) t.textContent = net + ": " + (V[net] == null ? "?" : V[net].toFixed(2)) + "V";
    });
    const sc = document.getElementById("scope-canvas");
    if (sc) drawScope(sc, sim, frame);
    updateParticles(dt);
    updateMeter(circ, frame);
    const pb = document.getElementById("sim-progress");
    if (pb && sim.mode === "tran") pb.value = String(Math.round(simView.frame));
    const st = document.getElementById("sim-t");
    if (st) st.textContent = sim.mode === "tran" ? "t = " + (frame.t * 1000).toFixed(2) + " ms" : "DC (sabit)";
  }

  /* ------------------------------ multimetre (DMM) -------------------- */
  function resistanceBetween(parts, a, b) {
    if (a == null || b == null || a === b) return null;
    const resist = parts.filter(p => p.t === "R" || p.t === "WIRE" || (p.t === "SW" && p.closed))
      .map(p => ({ t: p.t, a: p.a, b: p.b, v: p.v, closed: p.closed, geo: p.geo || [0, 0, 0, 80] }));
    resist.push({ t: "I", id: "__I", a: a, b: b, v: 1, geo: [0, 0, 0, 80] });
    if (b !== "0") resist.push({ t: "WIRE", id: "__G", a: b, b: "0", geo: [0, 0, 0, 0] });
    let sim; try { sim = SimEngine.simulate({ id: "_ohm", name: "ohm", analysis: "dc", parts: resist }, {}); } catch (e) { return null; }
    if (!sim.frames || !sim.frames.length) return null;
    const V = sim.frames[0].V;
    return Math.abs((V[a] || 0) - (V[b] || 0));
  }
  function measureOhm(circ, a, b) {
    const key = a + "|" + b, now = Date.now(), c = simView._ohm;
    if (c && c.key === key && now - c.at < 300) return c.val;
    const val = resistanceBetween(circ.parts, a, b);
    simView._ohm = { key: key, val: val, at: now };
    return val;
  }
  function fmtDmm(v, unit) {
    const neg = v < 0, av = Math.abs(v);
    const pre = [[1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "\u00b5"], [1e-9, "n"], [1e-12, "p"]];
    let s = "", val = v;
    for (const pf of pre) { if (av >= pf[0]) { val = v / pf[0]; s = pf[1]; break; } }
    if (av > 0 && av < 1e-12) { val = v / 1e-12; s = "p"; }
    const a = Math.abs(val);
    const dec = a >= 1000 ? 0 : a >= 100 ? 1 : a >= 10 ? 2 : a >= 1 ? 3 : 4;
    return { txt: (neg ? "-" : "") + a.toFixed(dec), unit: s + unit, sub: "", auto: true };
  }
  const DMM_MODES = { off: "OFF", vdc: "V\u2387", vac: "V\u223c", ohm: "\u03a9", cont: "\u2022)))", adc: "A\u2387", diode: "\u2192|" };
  function dmmMeasure(circ, frame, sim) {
    const V = (frame && frame.V) || {}, I = (frame && frame.I) || {};
    const a = simView.probeA, b = simView.probeB, mode = simView.dmmMode || "vdc";
    if (mode === "off") return { off: true };
    if (mode === "vdc" || mode === "vac") {
      if (a == null || b == null) return { hint: "\u0130ki d\u00fc\u011f\u00fcme t\u0131kla \u2192 gerilim" };
      let v;
      if (mode === "vac" && sim && sim.mode === "tran" && sim.frames) {
        let s = 0, n = 0;
        for (const f of sim.frames) { const x = (f.V[a] || 0) - (f.V[b] || 0); s += x * x; n++; }
        v = Math.sqrt(s / (n || 1));
      } else v = (V[a] || 0) - (V[b] || 0);
      const r = fmtDmm(v, "V"); r.sub = mode === "vac" ? "V~ RMS  " + a + "\u2212" + b : "V=  " + a + "\u2212" + b; return r;
    }
    if (mode === "adc") {
      const p = simView.selPart;
      if (p == null || I[p] == null) return { hint: "Bir par\u00e7a se\u00e7 (ak\u0131m seri \u00f6l\u00e7\u00fcl\u00fcr)" };
      const r = fmtDmm(I[p], "A"); r.sub = p + " ak\u0131m\u0131"; return r;
    }
    if (mode === "ohm" || mode === "cont") {
      if (a == null || b == null) return { hint: "\u0130ki d\u00fc\u011f\u00fcme t\u0131kla \u2192 diren\u00e7" };
      const R = measureOhm(circ, a, b);
      if (R == null || R > 2e6) return { txt: "OL", unit: "", sub: mode === "cont" ? "\u2022)))" : "\u03a9", auto: true };
      const r = fmtDmm(mode === "cont" ? Math.round(R) : R, "\u03a9");
      if (mode === "cont") { r.sub = "\u2022)))"; r.beep = R < 50; }
      return r;
    }
    if (mode === "diode") {
      const p = simView.selPart;
      if (p == null) return { hint: "Bir diyot / LED se\u00e7" };
      const part = circ.parts.find(x => x.id === p);
      if (!part || ["D", "LED", "Z"].indexOf(part.t) < 0) return { hint: "Diyot / LED / Zener se\u00e7" };
      if (!frame || frame.partV == null || frame.partV[p] == null) return { hint: "\u00d6l\u00e7\u00fcm yok" };
      const r = fmtDmm(frame.partV[p], "V"); r.sub = "\u2192| " + p + " (Vf)"; return r;
    }
    return { off: true };
  }
  function updateMeter(circ, frame) {
    const el = document.getElementById("meter-readout"); if (!el) return;
    const m = dmmMeasure(circ, frame, simView.sim);
    const modeLbl = DMM_MODES[simView.dmmMode || "vdc"] || "";
    if (m.off) { el.innerHTML = '<div class="dmm-digits dim">-- --</div>'; setDmmChips("OFF", "", ""); return; }
    if (m.hint) { el.innerHTML = '<div class="dmm-digits dim">--</div><div class="dmm-hint">' + m.hint + '</div>'; setDmmChips(modeLbl, "AUTO", ""); return; }
    const beep = m.beep ? '<span class="dmm-beep on">\u2022)))</span>' : m.beep === false ? '<span class="dmm-beep">\u2022)))</span>' : "";
    el.innerHTML = '<div class="dmm-digits">' + m.txt + '</div>' +
      '<div class="dmm-unit">' + (m.unit || "") + '</div>' +
      '<div class="dmm-sub">' + (m.sub || "") + '</div>';
    setDmmChips(modeLbl, m.auto ? "AUTO" : "", beep);
  }
  function setDmmChips(mode, auto, beep) {
    const mo = document.getElementById("dmm-mode"); if (mo) mo.textContent = mode || "";
    const au = document.getElementById("dmm-auto"); if (au) au.textContent = auto || "";
    const bp = document.getElementById("dmm-beep"); if (bp) bp.innerHTML = beep || "";
  }

  /* --------------------------- kontroller (knob) ---------------------- */
  function buildControls(circ) {
    const box = document.getElementById("sim-knobs"); if (!box) return;
    if (!circ.knobs || !circ.knobs.length) { box.innerHTML = '<p class="meter-hint">Bu devrede ayarlanacak değer yok.</p>'; return; }
    box.innerHTML = circ.knobs.filter(k => circ.parts.some(p => p.id === k.id)).map(k => {
      const part = circ.parts.find(p => p.id === k.id);
      const scale = k.scale || 1;
      const def = (part.v || 0) / scale;
      return '<label class="knob"><span>' + k.label + '</span><b>' + fmtKnob(def, k.unit) + '</b>' +
        '<input type="range" data-knob="' + k.id + '" data-scale="' + scale + '" min="' + k.min + '" max="' + k.max + '" step="' + k.step + '" value="' + def + '" data-unit="' + k.unit + '"></label>';
    }).join("");
    box.querySelectorAll("input[type=range]").forEach(inp => {
      const b = inp.parentElement.querySelector("b");
      const upd = () => { if (b) b.textContent = fmtKnob(+inp.value, inp.dataset.unit); };
      inp.addEventListener("input", () => {
        upd();
        simView.values[inp.dataset.knob] = +inp.value * (+inp.dataset.scale || 1);
        reSimulate(circ);
      });
    });
  }
  function fmtKnob(v, unit) {
    if (v >= 1000) return (v / 1000).toFixed(2) + " k" + unit;
    if (v >= 1) return v.toFixed(v < 10 ? 1 : 0) + " " + unit;
    return v.toString() + " " + unit;
  }

  function reSimulate(circ) {
    simView.sim = SimEngine.simulate(circ, { values: simView.values });
    if (simView.sim.frames && simView.sim.frames.length)
      simView.frame = Math.min(simView.frame, simView.sim.frames.length - 1);
    refreshLabels(circ, pickFrame(simView.sim, simView.frame));
  }

  function refreshLabels(circ, frame) {
    const svgEl = document.getElementById("sim-svg"); if (!svgEl) return;
    svgEl.querySelectorAll(".part").forEach(g => {
      const id = g.dataset.part, p = circ.parts.find(z => z.id === id); if (!p) return;
      const el = g.querySelector(".plabel");
      if (el && p.t === "R" && simView.values[id] != null) el.textContent = id + '  ' + fnum(simView.values[id], "\u03A9");
    });
  }

  /* --------------------------- düzenleme durumu ----------------------- */
  const GRID = 10, MAG = 12, EPS = 0.5;
  let drag = null, snapHint = null, suppressUntil = 0;
  let tool = "select";          // select | wire | erase
  let wireStart = null;         // { x, y, net }
  let wireCursor = null;        // { x, y }
  let paletteOpen = false;
  let exercise = null;          // { src, name }
  let lastCheck = null;
  const hist = { undo: [], redo: [] };
  let netSeq = 1;

  const UNITS = { R: "Ω", C: "F", L: "H", V: "V", I: "A" };

  function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

  function netProps(p) {
    switch (p.t) {
      case "OPAMP": return ["plus", "minus", "out"];
      case "NPN": case "PNP": return ["base", "col", "emit"];
      case "NMOS": case "PMOS": return ["gate", "drain", "src"];
      case "GND": return ["a", null];
      default: return ["a", "b"];
    }
  }
  function usedNets(circ) {
    const s = new Set();
    for (const p of circ.parts) for (const k of netProps(p)) if (k && typeof p[k] === "string") s.add(p[k]);
    return s;
  }
  function freshNet(circ) {
    const u = usedNets(circ);
    let n = netSeq; while (u.has("N" + n)) n++;
    netSeq = n + 1; return "N" + n;
  }
  function freshId(circ, prefix) {
    const s = new Set(circ.parts.map(p => p.id));
    let i = 1; while (s.has(prefix + i)) i++; return prefix + i;
  }

  const PART_DEFS = {
    R: { prefix: "R", w: 40, h: 80, props: { v: 1000 }, geo: (x, y) => [x, y, x, y + 80], label: "Direnç" },
    C: { prefix: "C", w: 40, h: 80, props: { v: 10e-6 }, geo: (x, y) => [x, y, x, y + 80], label: "Kondansatör" },
    L: { prefix: "L", w: 40, h: 80, props: { v: 10e-3 }, geo: (x, y) => [x, y, x, y + 80], label: "Bobin" },
    D: { prefix: "D", w: 40, h: 80, props: { vf: 0.7, if: 0.01 }, geo: (x, y) => [x, y, x, y + 80], label: "Diyot" },
    LED: { prefix: "D", w: 40, h: 80, props: { vf: 2.0, if: 0.02 }, geo: (x, y) => [x, y, x, y + 80], label: "LED" },
    Z: { prefix: "D", w: 40, h: 80, props: { vz: 5.1 }, geo: (x, y) => [x, y, x, y + 80], label: "Zener" },
    V: { prefix: "V", w: 40, h: 80, props: { v: 5 }, geo: (x, y) => [x, y, x, y + 80], label: "Gerilim kaynağı" },
    VSIN: { prefix: "V", w: 40, h: 80, props: { amp: 5, f: 50, ph: 0 }, geo: (x, y) => [x, y, x, y + 80], label: "Sinüs kaynağı" },
    VPULSE: { prefix: "V", w: 40, h: 80, props: { vhi: 5, vlo: 0, f: 500, duty: 0.5 }, geo: (x, y) => [x, y, x, y + 80], label: "Kare dalga kaynağı" },
    I: { prefix: "I", w: 40, h: 80, props: { v: 0.01 }, geo: (x, y) => [x, y, x, y + 80], label: "Akım kaynağı" },
    SW: { prefix: "SW", w: 40, h: 80, props: { closed: true }, geo: (x, y) => [x, y, x, y + 80], label: "Anahtar" },
    GND: { prefix: "GND", w: 30, h: 30, props: {}, geo: (x, y) => [x, y, x, y], label: "Toprak" },
    OPAMP: { prefix: "U", w: 110, h: 90, props: { a: 1e5, vsat: 12 }, geo: (x, y) => [x, y, x + 90, y + 80], label: "Op-amp" },
    NPN: { prefix: "Q", w: 80, h: 150, props: { bf: 100, br: 4, is: 1e-14 }, geo: (x, y) => [x, y, x + 70, y + 140], label: "NPN" },
    PNP: { prefix: "Q", w: 80, h: 150, props: { bf: 100, br: 4, is: 1e-14 }, geo: (x, y) => [x, y, x + 70, y + 140], label: "PNP" },
    NMOS: { prefix: "M", w: 80, h: 150, props: { vt: 0.7, kp: 0.02, lambda: 0.01 }, geo: (x, y) => [x, y, x + 70, y + 140], label: "NMOS" },
    PMOS: { prefix: "M", w: 80, h: 150, props: { vt: 0.7, kp: 0.02, lambda: 0.01 }, geo: (x, y) => [x, y, x + 70, y + 140], label: "PMOS" }
  };

  function freeSpot(circ, w, h) {
    const cols = 6, cw = 110, ch = 120;
    for (let r = 0; r < 4; r++) for (let c = 0; c < cols; c++) {
      const x = 40 + c * cw, y = 55 + r * ch;
      const bb = { x0: x - 6, y0: y - 6, x1: x + w, y1: y + h };
      let ok = true;
      for (const p of circ.parts) {
        const g = p.geo;
        const pb = { x0: Math.min(g[0], g[2]) - 14, y0: Math.min(g[1], g[3]) - 14, x1: Math.max(g[0], g[2]) + 14, y1: Math.max(g[1], g[3]) + 14 };
        if (Math.abs(g[1] - g[3]) < 6) pb.y1 += 28;
        if (bb.x0 < pb.x1 && bb.x1 > pb.x0 && bb.y0 < pb.y1 && bb.y1 > pb.y0) { ok = false; break; }
      }
      if (ok) return { x, y };
    }
    return { x: 40, y: 55 };
  }

  /* --------------------------- patlama efekti -------------------------- */
  const particles = [];
  function explodePart(p, circ) {
    const [cx, cy] = rotCenter(p.geo);
    const cols = ["#ff4400", "#ff8800", "#ffcc00", "#ff2200", "#ffffff"];
    for (let i = 0; i < 24; i++) {
      const a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 120;
      particles.push({
        x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40,
        life: 1, decay: 0.8 + Math.random() * 0.8,
        r: 2 + Math.random() * 3, col: cols[(Math.random() * cols.length) | 0], type: "spark"
      });
    }
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: cx, y: cy, vx: (Math.random() - 0.5) * 60, vy: -30 - Math.random() * 60,
        life: 1, decay: 0.4 + Math.random() * 0.4,
        r: 4 + Math.random() * 6, col: "#333", type: "smoke"
      });
    }
    if (particles.length > 300) particles.splice(0, particles.length - 300);
    removePart(p.id);
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.life -= pt.decay * dt;
      if (pt.life <= 0) { particles.splice(i, 1); continue; }
      pt.x += pt.vx * dt; pt.y += pt.vy * dt;
      if (pt.type === "spark") pt.vy += 200 * dt;
    }
  }

  function drawParticles() {
    let out = '<g id="fx-layer">';
    for (const pt of particles) {
      const op = Math.min(1, pt.life * 1.5);
      if (pt.type === "smoke") out += circleEl(pt.x, pt.y, pt.r * (1.6 - pt.life * 0.6), { fill: pt.col, opacity: op * 0.35 });
      else out += circleEl(pt.x, pt.y, pt.r * pt.life, { fill: pt.col, opacity: op });
    }
    return out + '</g>';
  }

  function makePart(circ, type) {
    const def = PART_DEFS[type];
    const pos = freeSpot(circ, def.w, def.h);
    const part = { t: type, id: freshId(circ, def.prefix), geo: def.geo(pos.x, pos.y) };
    Object.assign(part, deepClone(def.props || {}));
    for (const k of netProps(part)) if (k) part[k] = freshNet(circ);
    return part;
  }

  /* --------------------------- sürükle-taşı --------------------------- */

  function svgPoint(svgEl, ev) {
    const pt = svgEl.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    const m = svgEl.getScreenCTM();
    if (!m) return { x: pt.x, y: pt.y };
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  function snapshot() { return JSON.parse(JSON.stringify(simView.circ.parts)); }
  function pushHist() { hist.undo.push(snapshot()); if (hist.undo.length > 80) hist.undo.shift(); hist.redo.length = 0; }

  function nearestPin(circ, pt, maxD) {
    let best = null;
    for (const p of circ.parts) for (const q of vpins(p)) {
      const d = Math.hypot(q.x - pt.x, q.y - pt.y);
      if (d < maxD && (!best || d < best.d)) best = { d, x: q.x, y: q.y, n: q.n };
    }
    return best;
  }

  function beginDrag(circ, id, ev) {
    const svgEl = document.getElementById("sim-svg"); if (!svgEl) return;
    const part = circ.parts.find(p => p.id === id); if (!part) return;
    pushHist();
    const props = netProps(part), pins = vpins(part);
    const connectedWires = [];
    if (part.t !== "WIRE") {
      for (let i = 0; i < pins.length; i++) {
        if (!props[i]) continue;
        const net = part[props[i]];
        for (const w of circ.parts) {
          if (w.t !== "WIRE") continue;
          const ends = [[w.geo[0], w.geo[1], w.a], [w.geo[2], w.geo[3], w.b]];
          for (let ei = 0; ei < 2; ei++) {
            const e = ends[ei];
            if (Math.abs(e[0] - pins[i].x) < EPS && Math.abs(e[1] - pins[i].y) < EPS && e[2] === net) {
              connectedWires.push({ wire: w, pinIdx: i, wireEnd: ei, net });
            }
          }
        }
      }
    }
    const targets = [];
    for (const p of circ.parts) {
      if (p.id === id) continue;
      for (const q of vpins(p)) targets.push({ x: q.x, y: q.y, net: q.n, kind: "pin" });
    }
    for (const w of circ.parts) {
      if (w.t !== "WIRE") continue;
      targets.push({ x: w.geo[0], y: w.geo[1], net: w.a, kind: "wire", w, end: 0 });
      targets.push({ x: w.geo[2], y: w.geo[3], net: w.b, kind: "wire", w, end: 1 });
    }
    drag = { circ, part, props, pins, connectedWires, targets, start: svgPoint(svgEl, ev), orig: part.geo.slice(), snap: circ.parts.map(p => p.geo.slice()), moved: false };
    document.body.classList.add("dragging");
  }

  function applyDelta(ddx, ddy) {
    const g = drag.orig;
    drag.part.geo = [g[0] + ddx, g[1] + ddy, g[2] + ddx, g[3] + ddy];
    const movedPins = vpins(drag.part);
    for (const cw of drag.connectedWires) {
      const pin = movedPins[cw.pinIdx];
      if (cw.wireEnd === 0) { cw.wire.geo[0] = pin.x; cw.wire.geo[1] = pin.y; }
      else { cw.wire.geo[2] = pin.x; cw.wire.geo[3] = pin.y; }
    }
  }

  function findSnap() {
    const pins = vpins(drag.part);
    let best = null;
    for (let i = 0; i < pins.length; i++) for (const t of drag.targets) {
      const d = Math.hypot(t.x - pins[i].x, t.y - pins[i].y);
      if (d < MAG && (!best || d < best.d)) best = { d, dx: t.x - pins[i].x, dy: t.y - pins[i].y, target: t, pinIdx: i };
    }
    return best;
  }

  function applyConnect(sn) {
    const k = drag.props[sn.pinIdx]; if (!k) return;
    drag.part[k] = sn.target.net;
    // Update connectedWires: if this pin was connected to a wire, that wire now connects to the new net
    const pinIdx = sn.pinIdx;
    for (const cw of drag.connectedWires) {
      if (cw.pinIdx === pinIdx) {
        // The wire end should now follow the pin (already done via applyDelta)
        // But the net name needs to be updated
        if (cw.wireEnd === 0) cw.wire.a = sn.target.net;
        else cw.wire.b = sn.target.net;
        cw.net = sn.target.net;
      }
    }
    if (sn.target.kind === "wire") {
      const pins = vpins(drag.part), w = sn.target.w;
      if (sn.target.end === 0) { w.geo[0] = pins[sn.pinIdx].x; w.geo[1] = pins[sn.pinIdx].y; }
      else { w.geo[2] = pins[sn.pinIdx].x; w.geo[3] = pins[sn.pinIdx].y; }
    }
  }

  function redraw() {
    const card = document.getElementById("sim-card");
    const hint = (wireStart && wireCursor) ? { fx: wireStart.x, fy: wireStart.y, tx: wireCursor.x, ty: wireCursor.y } : null;
    if (card && simView.circ) card.innerHTML = buildSchematic(simView.circ, pickFrame(simView.sim, simView.frame), snapHint, null, hint);
  }

  function onDragMove(ev) {
    if (!drag) return;
    const svgEl = document.getElementById("sim-svg"); if (!svgEl) return;
    const pt = svgPoint(svgEl, ev);
    const dx = pt.x - drag.start.x, dy = pt.y - drag.start.y;
    if (!drag.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
    if (!drag.moved) drag.moved = true;
    const step = ev.altKey ? 1 : GRID;
    let ddx = Math.round(dx / step) * step, ddy = Math.round(dy / step) * step;
    applyDelta(ddx, ddy);
    snapHint = null;
    if (!ev.altKey) {
      const sn = findSnap();
      if (sn) { ddx += sn.dx; ddy += sn.dy; applyDelta(ddx, ddy); snapHint = sn.target; applyConnect(sn); }
    }
    redraw();
  }

  function onWireMove(ev) {
    if (!wireStart) return;
    const svgEl = document.getElementById("sim-svg"); if (!svgEl) return;
    wireCursor = svgPoint(svgEl, ev);
    redraw();
  }

  function endDrag() {
    if (!drag) return;
    if (drag.moved) { suppressUntil = performance.now() + 350; commit(true); renderInstrument(); }
    else hist.undo.pop();
    document.body.classList.remove("dragging");
    snapHint = null; drag = null;
  }

  function restore(parts) { simView.circ.parts = parts; }
  function doUndo() { if (drag || !hist.undo.length) return; hist.redo.push(snapshot()); restore(hist.undo.pop()); commit(false); renderInstrument(); }
  function doRedo() { if (!hist.redo.length) return; hist.undo.push(snapshot()); restore(hist.redo.pop()); commit(false); renderInstrument(); }

  function onDragKey(ev) {
    if (drag && ev.key === "Escape") {
      restore(drag.snap.map(g => g.slice()));
      if (hist.undo.length) hist.undo.pop();
      document.body.classList.remove("dragging");
      drag = null; snapHint = null; commit(false); suppressUntil = performance.now() + 300;
    } else if (!drag && wireStart && ev.key === "Escape") {
      wireStart = null; wireCursor = null; redraw();
    } else if (!drag && (ev.ctrlKey || ev.metaKey) && (ev.key === "z" || ev.key === "Z")) {
      ev.preventDefault(); if (ev.shiftKey) doRedo(); else doUndo();
    } else if (!drag && (ev.ctrlKey || ev.metaKey) && (ev.key === "y" || ev.key === "Y")) {
      ev.preventDefault(); doRedo();
    } else if (!drag && (ev.key === "r" || ev.key === "R") && simView.selPart && ev.target.tagName !== "INPUT" && ev.target.tagName !== "TEXTAREA") {
      ev.preventDefault(); rotatePart(simView.selPart);
    }
  }

  /* --------------------------- düzenleme işlemleri -------------------- */
  function addPart(type) {
    if (!simView.circ) return;
    pushHist();
    const p = makePart(simView.circ, type);
    simView.circ.parts.push(p);
    simView.selPart = p.id;
    commit(false); renderInstrument();
  }

  function removePart(id) {
    const circ = simView.circ; if (!circ) return;
    const i = circ.parts.findIndex(p => p.id === id); if (i < 0) return;
    pushHist();
    const wasWire = circ.parts[i].t === "WIRE";
    circ.parts.splice(i, 1);
    if (!wasWire) {
      const used = usedNets(circ); used.add("0");
      circ.parts = circ.parts.filter(p => p.t !== "WIRE" || (used.has(p.a) && used.has(p.b)));
    }
    if (simView.selPart === id) simView.selPart = null;
    commit(false); renderInstrument();
  }

  function rotatePart(id) {
    const circ = simView.circ; if (!circ) return;
    const p = circ.parts.find(x => x.id === id); if (!p) return;
    pushHist();
    if (p.t === "WIRE") p.geo = rotateGeo90(p.geo);
    else p.rot = ((p.rot || 0) + 1) & 3;
    commit(false); renderInstrument();
  }

  function primaryField(p) {
    const F = valueFields(p);
    return F.length ? F[0] : null;
  }

  /* --------------------------- sağ tık menüsü -------------------------- */
  function hideCtx() { const m = document.getElementById("ctx-menu"); if (m) m.remove(); }
  function showCtx(x, y, id) {
    hideCtx();
    const p = simView.circ && simView.circ.parts.find(q => q.id === id); if (!p) return;
    const m = document.createElement("div");
    m.id = "ctx-menu";
    const items = [];
    if (p.t !== "WIRE") items.push({ label: "Döndür", fn: () => rotatePart(id) });
    const f = primaryField(p);
    if (f) items.push({ label: "Değeri düzenle", fn: () => startInlineEdit(p, f) });
    items.push({ label: "Sil", fn: () => removePart(id) });
    for (const it of items) {
      const b = document.createElement("button");
      b.textContent = it.label;
      b.onclick = (e) => { e.stopPropagation(); hideCtx(); it.fn(); };
      m.appendChild(b);
    }
    document.body.appendChild(m);
    const r = m.getBoundingClientRect();
    m.style.left = Math.min(x, innerWidth - r.width - 8) + "px";
    m.style.top = Math.min(y, innerHeight - r.height - 8) + "px";
  }
  document.addEventListener("click", hideCtx);

  /* --------------------------- satır içi düzenleme --------------------- */
  let inlineEdit = null;
  function cancelInlineEdit() {
    if (inlineEdit && inlineEdit.parentNode) inlineEdit.parentNode.removeChild(inlineEdit);
    inlineEdit = null;
  }
  function startInlineEdit(p, f) {
    cancelInlineEdit();
    const card = document.getElementById("sim-card"); if (!card) return;
    const svgEl = document.getElementById("sim-svg"); if (!svgEl) return;
    const ctm = svgEl.getScreenCTM(); if (!ctm) return;
    const [cx, cy] = rotCenter(p.geo);
    const pt = svgEl.createSVGPoint(); pt.x = cx; pt.y = cy;
    const s = pt.matrixTransform(ctm);
    const cr = card.getBoundingClientRect();
    const inp = document.createElement("input");
    inp.type = "text";
    inp.className = "inline-edit";
    inp.value = p[f.k];
    inp.style.left = (s.x - cr.left) + "px";
    inp.style.top = (s.y - cr.top) + "px";
    card.appendChild(inp);
    inlineEdit = inp;
    inp.focus(); inp.select();
    const finish = (doit) => {
      if (inlineEdit !== inp) return;
      const v = parseFloat(inp.value);
      if (doit && isFinite(v) && simView.circ.parts.indexOf(p) >= 0) {
        pushHist();
        p[f.k] = v;
        commit(false);
      }
      cancelInlineEdit();
      renderInstrument();
    };
    inp.addEventListener("keydown", e => {
      e.stopPropagation();
      if (e.key === "Enter") finish(true);
      else if (e.key === "Escape") finish(false);
    });
    inp.addEventListener("blur", () => finish(true));
    inp.addEventListener("mousedown", e => e.stopPropagation());
    inp.addEventListener("click", e => e.stopPropagation());
  }

  function valueFields(p) {
    const F = [];
    switch (p.t) {
      case "R": case "C": case "L": case "V": case "I": F.push({ k: "v", label: "Değer", u: UNITS[p.t] }); break;
      case "VSIN": F.push({ k: "amp", label: "Genlik", u: "V" }, { k: "f", label: "Frekans", u: "Hz" }); break;
      case "VPULSE": F.push({ k: "vhi", label: "Yüksek", u: "V" }, { k: "vlo", label: "Düşük", u: "V" }, { k: "f", label: "Frekans", u: "Hz" }, { k: "duty", label: "Görev (0-1)", u: "" }); break;
      case "D": case "LED": F.push({ k: "vf", label: "Eşik gerilimi", u: "V" }, { k: "if", label: "Anma akımı", u: "A" }); break;
      case "Z": F.push({ k: "vz", label: "Zener gerilimi", u: "V" }); break;
      case "SW": F.push({ k: "closed", label: "Kapalı", u: "" }); break;
      case "OPAMP": F.push({ k: "a", label: "Açık çevrim kazancı", u: "" }, { k: "vsat", label: "Besleme (doyum)", u: "V" }); break;
      case "NPN": case "PNP": F.push({ k: "bf", label: "Beta (bf)", u: "" }); break;
      case "NMOS": case "PMOS": F.push({ k: "vt", label: "Eşik gerilimi Vt", u: "V" }, { k: "kp", label: "Kp", u: "A/V^2" }); break;
      default: break;
    }
    return F;
  }

  function renderInstrument() {
    const panel = document.getElementById("sim-inspector");
    if (!panel) return;
    if (!simView.circ || !simView.selPart) { panel.innerHTML = '<h3>Seçili öğe</h3><p class="sim-hint">Düzenlemek için bir parçaya ya da tele tıkla.</p>'; return; }
    const p = simView.circ.parts.find(x => x.id === simView.selPart);
    if (!p) { panel.innerHTML = '<h3>Seçili öğe</h3><p class="sim-hint">Seçim yok.</p>'; return; }
    const def = PART_DEFS[p.t];
    const title = def ? def.label : (p.t === "WIRE" ? "Tel" : p.t);
    let html = '<h3>' + title + ' <span class="sim-hint">(' + p.id + ')</span></h3><div class="insp-body">';
    const fields = valueFields(p);
    for (const f of fields) {
      if (f.k === "closed") html += '<label class="insp"><span>' + f.label + '</span><input type="checkbox" data-k="closed" ' + (p.closed !== false ? 'checked' : '') + '></label>';
      else html += '<label class="insp"><span>' + f.label + '</span><input type="number" step="any" data-k="' + f.k + '" value="' + p[f.k] + '"><em>' + f.u + '</em></label>';
    }
    if (!fields.length && p.t !== "WIRE") html += '<p class="sim-hint">Bu öğenin düzenlenebilir değeri yok.</p>';
    html += '</div><button class="sim-btn" id="insp-rot">Döndür</button><button class="sim-btn danger" id="insp-del">Sil</button>';
    panel.innerHTML = html;
    panel.querySelectorAll("input").forEach(inp => {
      inp.oninput = () => {
        const pp = simView.circ.parts.find(x => x.id === p.id); if (!pp) return;
        const k = inp.dataset.k;
        if (inp.type === "checkbox") pp[k] = inp.checked;
        else { const v = parseFloat(inp.value); if (isFinite(v)) pp[k] = v; }
        commit(false);
      };
    });
    const rot = document.getElementById("insp-rot"); if (rot) rot.onclick = () => rotatePart(p.id);
    const del = document.getElementById("insp-del"); if (del) del.onclick = () => removePart(p.id);
  }

  /* ------------------------------- görünüm ---------------------------- */
  function viewSim() {
    setActiveNav("sim");
    const levels = [];
    for (const c of SimEngine.circuits) if (levels.indexOf(c.level) < 0) levels.push(c.level);
    const options = levels.map(lv =>
      '<optgroup label="' + lv + '">' + SimEngine.circuits.filter(c => c.level === lv)
        .map(c => '<option value="' + c.id + '">' + c.name + '</option>').join("") + '</optgroup>').join("");

    const c = document.getElementById("content");
    c.innerHTML =
      '<div class="sim-head">' +
        '<div>' +
          '<h1 class="page-title">Devre Simülatörü</h1>' +
          '<p class="page-sub">Devreyi seç, düzenle; parça ekle/sil, tel çek, değerleri değiştir ve akım akışını canlı izle.</p>' +
        '</div>' +
      '</div>' +
      '<div class="sim-workbench">' +
        '<header class="sim-toolbar">' +
          '<span class="sim-brand"><span class="sim-led"></span> Benç</span>' +
          '<label class="sim-field">Devre' +
            '<select id="sim-select">' + options + '</select>' +
          '</label>' +
          '<span class="sim-spacer"></span>' +
          '<div class="sim-tools" role="group" aria-label="Araç">' +
            '<button class="sim-btn tool active" id="tool-select" title="Seç / taşı">Seç</button>' +
            '<button class="sim-btn tool" id="tool-wire" title="Tel çek">Tel</button>' +
            '<button class="sim-btn tool" id="tool-erase" title="Sil">Sil</button>' +
            '<button class="sim-btn" id="sim-palette-btn" title="Parça paleti">+ Parça</button>' +
          '</div>' +
          '<span class="sim-spacer"></span>' +
          '<button class="sim-btn" id="sim-undo" title="Geri al (Ctrl+Z)">\u21b6</button>' +
          '<button class="sim-btn" id="sim-redo" title="Yinele (Ctrl+Y)">\u21b7</button>' +
          '<button class="sim-btn primary" id="sim-reset" title="Sıfırla">\u21ba Sıfırla</button>' + '<button class="sim-btn" id="sim-save" title="Devreyi kaydet">Kaydet</button>' + '<button class="sim-btn" id="sim-load" title="Kaydedilen devreyi yükle">Yükle</button>' +
        '</header>' +
        '<div class="sim-palette" id="sim-palette">' +
          Object.keys(PART_DEFS).map(t => '<button class="sim-chip" data-add="' + t + '">' + PART_DEFS[t].label + '</button>').join("") +
        '</div>' +
        '<div class="sim-body">' +
          '<section class="sim-stage">' +
            '<div class="sim-card" id="sim-card"></div>' +
            '<div class="sim-timeline">' +
              '<button class="sim-play" id="sim-play" title="Oynat / Duraklat">\u23f8</button>' +
              '<input type="range" id="sim-progress" min="0" max="100" value="0" class="sim-range">' +
              '<span class="sim-t" id="sim-t">t = 0 ms</span>' +
              '<label class="sim-speed">Hız <input type="range" id="sim-speed" min="0.25" max="2" step="0.25" value="1"></label>' +
            '</div>' +
            '<p class="sim-help"><b>Seç</b>: taşı / değer düzenle · <b>Tel</b>: iki uca tıkla · <b>Sil</b>: parça/tel sil · <b>Çift tıkla</b>: değeri düzenle · <b>R</b>: döndür · <b>Sağ tık</b>: menü · <b>Ctrl+Z</b>: geri al · <b>Alt</b>: serbest taşıma</p>' +
          '</section>' +
          '<aside class="sim-side">' +
            '<div class="sim-panel" id="sim-inspector"></div>' +
            '<div class="sim-panel" id="sim-exam">' +
              '<h3>Alıştırma</h3>' +
              '<div class="insp-body">' +
                '<label class="insp"><span>Hedef devre</span><select id="exam-select">' + options + '</select></label>' +
              '</div>' +
              '<div class="exam-actions">' +
                '<button class="sim-btn" id="exam-start">Boş başla</button>' +
                '<button class="sim-btn primary" id="exam-check" disabled>Kontrol Et</button>' +
              '</div>' +
              '<div class="sim-result" id="sim-result"></div>' +
            '</div>' +
            '<div class="sim-panel" id="sim-target-panel">' +
              '<h3>Hedef</h3>' +
              '<div id="sim-target"></div>' +
            '</div>' +
            '<div class="sim-panel">' +
              '<h3>Değerler</h3>' +
              '<div id="sim-knobs"></div>' +
            '</div>' +
            '<div class="sim-panel dmm-panel">' +
              '<h3>Multimetre <span class="inst-tag">DMM</span></h3>' +
              '<div class="dmm">' +
                '<div class="dmm-lcd">' +
                  '<div class="dmm-top"><span id="dmm-mode" class="dmm-mode">V\u2387</span><span id="dmm-auto" class="dmm-auto"></span><span id="dmm-beep" class="dmm-beep"></span></div>' +
                  '<div id="meter-readout" class="meter"></div>' +
                '</div>' +
                '<div class="dmm-dial">' +
                  '<button class="dmm-pos" data-dmm="off">OFF</button>' +
                  '<button class="dmm-pos active" data-dmm="vdc">V\u2387</button>' +
                  '<button class="dmm-pos" data-dmm="vac">V\u223c</button>' +
                  '<button class="dmm-pos" data-dmm="ohm">\u03a9</button>' +
                  '<button class="dmm-pos" data-dmm="cont">\u2022)))</button>' +
                  '<button class="dmm-pos" data-dmm="adc">A\u2387</button>' +
                  '<button class="dmm-pos" data-dmm="diode">\u2192|</button>' +
                '</div>' +
                '<div class="dmm-jacks"><span class="jack red"></span><span class="jack blk"></span><span class="jack amber">10A</span></div>' +
              '</div>' +
            '</div>' +
            '<div class="sim-panel scope-panel">' +
              '<h3>Osiloskop <span class="inst-tag">DSO</span></h3>' +
              '<div class="scope-screen"><canvas id="scope-canvas" width="480" height="288"></canvas><div class="scope-menu" id="scope-meas"></div></div>' +
              '<div class="scope-ctl">' +
                '<label>VOLTS/DIV<select id="scope-vdiv"><option value="auto">AUTO</option><option value="0.1">0.1</option><option value="0.2">0.2</option><option value="0.5">0.5</option><option value="1">1</option><option value="2">2</option><option value="5">5</option><option value="10">10</option></select></label>' +
                '<label>ZAMAN/DIV<select id="scope-tdiv"><option value="1">1\u00d7</option><option value="0.5">0.5\u00d7</option><option value="0.25">0.25\u00d7</option><option value="0.1">0.1\u00d7</option></select></label>' +
              '</div>' +
              '<div class="scope-knobs">' +
                '<label class="sc-knob">KONUM<input type="range" id="scope-pos" min="0" max="1" step="0.02" value="0.5"></label>' +
                '<label class="sc-knob">TRIGGER<input type="range" id="scope-trig" min="0" max="1" step="0.02" value="0.5"></label>' +
              '</div>' +
              '<div class="scope-readout" id="scope-readout"></div>' +
            '</div>' +
            '<p class="sim-desc" id="sim-desc"></p>' +
          '</aside>' +
        '</div>' +
      '</div>';

    const $ = id => document.getElementById(id);

    $("sim-select").onchange = e => {
      try { history.replaceState(null, "", "#sim/" + e.target.value); } catch (er) {}
      selectCircuit(e.target.value);
    };

    $("tool-select").onclick = () => setTool("select");
    $("tool-wire").onclick = () => setTool("wire");
    $("tool-erase").onclick = () => setTool("erase");
    $("sim-palette-btn").onclick = () => { paletteOpen = !paletteOpen; $("sim-palette").classList.toggle("open", paletteOpen); };
    
    $("sim-palette").querySelectorAll("[data-add]").forEach(b => b.onclick = () => addPart(b.dataset.add));

    $("sim-play").onclick = () => {
      simView.playing = !simView.playing;
      $("sim-play").textContent = simView.playing ? "⏸" : "▶";
    };
    $("sim-speed").oninput = e => { simView.speed = +e.target.value; }; $("scope-tdiv").onchange = e => { simView.scopeView = +e.target.value; };
    $("scope-vdiv").onchange = e => { simView.scopeVdiv = e.target.value === "auto" ? "auto" : +e.target.value; };
    $("scope-pos").oninput = e => { simView.scopePos = +e.target.value; };
    $("scope-trig").oninput = e => { simView.scopeTrig = +e.target.value; };
    document.querySelectorAll("[data-dmm]").forEach(b => b.onclick = () => {
      simView.dmmMode = b.dataset.dmm;
      document.querySelectorAll("[data-dmm]").forEach(x => x.classList.toggle("active", x === b));
      updateMeter(simView.circ, pickFrame(simView.sim, simView.frame));
    });
    const scCv = document.getElementById("scope-canvas");
    if (scCv) {
      let curDrag = 0;
      const curX = ev => Math.max(0.02, Math.min(0.98, (ev.clientX - scCv.getBoundingClientRect().left) / scCv.getBoundingClientRect().width));
      const onCurMove = ev => { if (!curDrag) return; const fx = curX(ev); if (curDrag === 1) simView.cur1 = fx; else simView.cur2 = fx; };
      const onCurUp = () => { if (curDrag) { curDrag = 0; scCv.style.cursor = "crosshair"; } };
      scCv.addEventListener("mousedown", ev => {
        const fx = (ev.clientX - scCv.getBoundingClientRect().left) / scCv.getBoundingClientRect().width;
        const c1 = simView.cur1 == null ? 0.3 : simView.cur1, c2 = simView.cur2 == null ? 0.7 : simView.cur2;
        curDrag = Math.abs(fx - c1) <= Math.abs(fx - c2) ? 1 : 2;
        scCv.style.cursor = "ew-resize"; ev.preventDefault();
      });
      scCv.addEventListener("mousemove", ev => {
        const fx = (ev.clientX - scCv.getBoundingClientRect().left) / scCv.getBoundingClientRect().width;
        const c1 = simView.cur1 == null ? 0.3 : simView.cur1, c2 = simView.cur2 == null ? 0.7 : simView.cur2;
        scCv.style.cursor = (Math.abs(fx - c1) < 0.05 || Math.abs(fx - c2) < 0.05) ? "ew-resize" : "crosshair";
      });
      if (simView._curMove) { window.removeEventListener("mousemove", simView._curMove); window.removeEventListener("mouseup", simView._curUp); }
      simView._curMove = onCurMove; simView._curUp = onCurUp;
      window.addEventListener("mousemove", onCurMove);
      window.addEventListener("mouseup", onCurUp);
    }
    $("sim-progress").oninput = e => { simView.playing = false; $("sim-play").textContent = "▶"; simView.frame = +e.target.value; };
    $("sim-reset").onclick = () => { simView.values = {}; selectCircuit(simView.src ? simView.src.id : simView.circ.id); };
    $("sim-save").onclick = saveCircuit;
    $("sim-load").onclick = loadCircuit;
    $("sim-undo").onclick = doUndo;
    $("sim-redo").onclick = doRedo;

    // alıştırma
    $("exam-start").onclick = () => startExercise($("exam-select").value);
    $("exam-check").onclick = checkExercise;

    // düğüm / parça seçimi (yalnızca Seç aracında)
    $("sim-card").addEventListener("click", ev => {
      if (performance.now() < suppressUntil) return;
      if (tool === "wire" || tool === "erase") return;
      const nd = ev.target.closest(".node"), pt = ev.target.closest(".part");
      if (nd && !pt) {
        const net = nd.dataset.net;
        if (simView.probeA == null) simView.probeA = net;
        else if (simView.probeB == null && net !== simView.probeA) simView.probeB = net;
        else { simView.probeA = net; simView.probeB = null; }
        updateMeter(simView.circ, pickFrame(simView.sim, simView.frame));
      } else if (pt) {
        simView.selPart = (simView.selPart === pt.dataset.part) ? null : pt.dataset.part;
        updateMeter(simView.circ, pickFrame(simView.sim, simView.frame));
        renderInstrument(); redraw();
      }
    });

    // sağ tık menüsü
    $("sim-card").addEventListener("contextmenu", ev => {
      ev.preventDefault();
      const g = ev.target.closest(".part");
      if (!g) { hideCtx(); return; }
      showCtx(ev.clientX, ev.clientY, g.dataset.part);
    });

    // çift tık: satır içi değer düzenleme
    $("sim-card").addEventListener("dblclick", ev => {
      if (tool !== "select" || !simView.circ) return;
      const g = ev.target.closest(".part"); if (!g) return;
      const p = simView.circ.parts.find(x => x.id === g.dataset.part); if (!p) return;
      const f = primaryField(p); if (!f) return;
      simView.selPart = p.id;
      startInlineEdit(p, f);
    });

    // etkileşim: tel çek / sil / taşı
    $("sim-card").addEventListener("mousedown", ev => {
      if (ev.button !== 0 || !simView.circ) return;
      const svgEl = document.getElementById("sim-svg"); if (!svgEl) return;
      const g = ev.target.closest(".part");
      if (tool === "erase") {
        if (g) { ev.preventDefault(); removePart(g.dataset.part); }
        return;
      }
      if (tool === "wire") {
        ev.preventDefault();
        const pin = nearestPin(simView.circ, svgPoint(svgEl, ev), MAG * 1.8);
        if (!wireStart) {
          if (pin) { wireStart = { x: pin.x, y: pin.y, net: pin.n }; wireCursor = { x: pin.x, y: pin.y }; redraw(); }
        } else {
          if (pin && pin.n !== wireStart.net) {
            pushHist();
            simView.circ.parts.push({ t: "WIRE", id: freshId(simView.circ, "W"), a: wireStart.net, b: pin.n, geo: [wireStart.x, wireStart.y, pin.x, pin.y] });
            commit(false);
          }
          wireStart = null; wireCursor = null; redraw();
        }
        return;
      }
      if (!g) return;
      ev.preventDefault();
      beginDrag(simView.circ, g.dataset.part, ev);
    });
    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("mousemove", onWireMove);
    window.removeEventListener("mouseup", endDrag);
    window.removeEventListener("keydown", onDragKey);
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mousemove", onWireMove);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("keydown", onDragKey);

    const want = (location.hash.split("/")[1]) || (simView.circ ? simView.circ.id : SimEngine.circuits[0].id);
    if (simView.scopeView == null) simView.scopeView = 1;
    selectCircuit(want);
    cancelAnimationFrame(simView.raf);
    simView.lastT = 0;
    simView.raf = requestAnimationFrame(animate);
  }

  /* --------------------------- araç / ortak --------------------------- */
  function setTool(t) {
    tool = t;
    cancelInlineEdit();
    ["select", "wire", "erase"].forEach(k => { const b = document.getElementById("tool-" + k); if (b) b.classList.toggle("active", k === t); });
    if (t !== "select") { simView.selPart = null; renderInstrument(); }
    wireStart = null; wireCursor = null; redraw();
  }

  function commit(keepFrame) {
    const circ = simView.circ; if (!circ) return;
    simView.sim = SimEngine.simulate(circ, { values: simView.values });
    const n = (simView.sim.mode === "tran" && simView.sim.frames) ? simView.sim.frames.length - 1 : 100;
    if (!keepFrame || simView.frame == null) simView.frame = 0;
    if (simView.frame > n) simView.frame = n;
    const pb = document.getElementById("sim-progress");
    if (pb) { pb.max = String(Math.max(0, n)); pb.value = String(Math.max(0, simView.frame)); }
    redraw();
    buildControls(circ);
    updateMeter(circ, pickFrame(simView.sim, simView.frame));
  }

  function renderTarget() {
    const box = document.getElementById("sim-target");
    if (!box) return;
    box.innerHTML = exercise ? buildSchematic(exercise.src, EMPTY_FRAME, null, "sim-target-svg") : "";
  }

  function selectCircuit(id) {
    const src = SimEngine.circuits.find(x => x.id === id) || SimEngine.circuits[0];
    exercise = null; lastCheck = null;
    cancelInlineEdit();
    simView.heatMap = {};
    particles.length = 0;
    const circ = deepClone(src); circ.id = src.id;
    simView.circ = circ; simView.src = src;
    simView.values = {}; simView.frame = 0; simView.selPart = null; simView.probeA = null; simView.probeB = null;
    wireStart = null; wireCursor = null;
    hist.undo.length = 0; hist.redo.length = 0;
    const sel = document.getElementById("sim-select");
    if (sel && sel.value !== src.id) sel.value = src.id;
    const d = document.getElementById("sim-desc");
    if (d) d.innerHTML = '<b>' + src.name + '</b> — ' + (src.desc || "");
    const ex = document.getElementById("exam-check"); if (ex) ex.disabled = true;
    const res = document.getElementById("sim-result"); if (res) { res.className = "sim-result"; res.innerHTML = ""; }
    renderTarget(); renderInstrument(); commit(false);
  }

  function flashSim(msg) {
    let el = document.getElementById("sim-toast");
    if (!el) { el = document.createElement("div"); el.id = "sim-toast"; el.className = "sim-toast"; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add("show");
    clearTimeout(simView._toastT);
    simView._toastT = setTimeout(() => el.classList.remove("show"), 1600);
  }

  function saveCircuit() {
    if (!simView.circ) return;
    try {
      localStorage.setItem("ea_sim_circ", JSON.stringify({ circ: simView.circ, values: simView.values, ts: Date.now() }));
      flashSim("Devre kaydedildi");
    } catch (e) { flashSim("Kaydedilemedi"); }
  }

  function loadCircuit() {
    try {
      const raw = localStorage.getItem("ea_sim_circ");
      if (!raw) { flashSim("Kayıt yok"); return; }
      const data = JSON.parse(raw);
      if (!data || !data.circ || !Array.isArray(data.circ.parts)) { flashSim("Kayıt bozuk"); return; }
      cancelInlineEdit();
      exercise = null; lastCheck = null;
      simView.circ = data.circ;
      simView.src = SimEngine.circuits.find(x => x.id === data.circ.id) ||
        { id: data.circ.id, name: data.circ.name || "Kayıt", analysis: data.circ.analysis || "dc", parts: [], probes: [], knobs: [] };
      simView.values = data.values || {};
      simView.frame = 0; simView.selPart = null; simView.probeA = null; simView.probeB = null;
      simView.heatMap = {}; particles.length = 0;
      wireStart = null; wireCursor = null;
      hist.undo.length = 0; hist.redo.length = 0;
      const d = document.getElementById("sim-desc");
      if (d) d.innerHTML = '<b>' + (data.circ.name || "Kayıt") + '</b> — yüklenen devre';
      const ex = document.getElementById("exam-check"); if (ex) ex.disabled = true;
      const res = document.getElementById("sim-result"); if (res) { res.className = "sim-result"; res.innerHTML = ""; }
      renderTarget(); renderInstrument(); commit(false);
      flashSim("Devre yüklendi");
    } catch (e) { flashSim("Yüklenemedi"); }
  }

  function startExercise(id) {
    const src = SimEngine.circuits.find(x => x.id === id); if (!src) return;
    cancelInlineEdit();
    exercise = { src };
    simView.heatMap = {};
    particles.length = 0;
    const circ = { id: "exercise", name: "Alıştırma", analysis: src.analysis || "dc", parts: [], probes: [], desc: src.desc || "" };
    simView.circ = circ; simView.src = src;
    simView.values = {}; simView.frame = 0; simView.selPart = null; simView.probeA = null; simView.probeB = null;
    wireStart = null; wireCursor = null; hist.undo.length = 0; hist.redo.length = 0; lastCheck = null;
    const d = document.getElementById("sim-desc");
    if (d) d.innerHTML = '<b>Alıştırma: ' + src.name + '</b> — hedefi kur, sonra <b>Kontrol Et</b>.';
    const ex = document.getElementById("exam-check"); if (ex) ex.disabled = false;
    const res = document.getElementById("sim-result"); if (res) { res.className = "sim-result"; res.innerHTML = ""; }
    setTool("select");
    renderTarget(); renderInstrument(); commit(false);
  }

  function checkExercise() {
    if (!exercise) return;
    const r = SimEngine.checkCircuit(simView.circ, exercise.src, {});
    lastCheck = r;
    const box = document.getElementById("sim-result"); if (!box) return;
    const msgs = (r.errors || []).slice(0, 6);
    box.className = "sim-result " + (r.ok ? "ok" : "bad");
    let items = msgs.map(m => '<li>' + m + '</li>').join("");
    if (!items && !r.ok) items = "<li>Devre hedefle uyuşmuyor.</li>";
    box.innerHTML = '<b>' + (r.ok ? "Devre doğru!" : "Henüz doğru değil") + '</b>' +
      (items ? '<ul>' + items + '</ul>' : "") +
      '<div class="sim-result-sub">Topoloji: ' + (r.topologyOk ? "uygun" : "uygun değil") + ' · Davranış: ' + (r.behaviorOk ? "uygun" : "uygun değil") + '</div>';
  }

  window.viewSim = viewSim;
  window.__simTest = { simView, commit, checkExercise, startExercise, selectCircuit, addPart, removePart, rotatePart, startInlineEdit, cancelInlineEdit, doUndo, doRedo };

})();
