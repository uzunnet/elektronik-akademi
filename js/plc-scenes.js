/* =========================================================================
   Elektronik Akademi — PLC Animasyonlu Makine Sahneleri (plc-scenes.js)
   PLC çıkışlarına (Y) bağlı, gerçek zamanlı çizilen endüstriyel makineler.
   Sensörler (X) sahne tarafından otomatik tetiklenir.
   ========================================================================= */

const Scenes = {
  canvas: null,
  ctx: null,
  W: 760,
  H: 380,
  key: "conveyor",
  s: {},
  t: 0,

  defs: {},

  mount(key) {
    this.key = key || this.key;
    const cv = document.getElementById("plc-scene-canvas");
    if (cv) { this.canvas = cv; this.ctx = cv.getContext("2d"); this.W = cv.width; this.H = cv.height; }
    const def = this.defs[this.key];
    this.s = {};
    if (def && def.init) def.init(this.s);
    const t = document.getElementById("plc-scene-title");
    if (t && def) t.innerHTML = '<b>' + def.name + '</b> — ' + def.desc;
  },

  reset() {
    const def = this.defs[this.key];
    this.s = {};
    if (def && def.init) def.init(this.s);
    this.t = 0;
  },

  update(dt, plc) {
    const def = this.defs[this.key];
    this.t += dt;
    if (def && def.update) def.update(this.s, plc, dt, this.t);
  },

  render() {
    const def = this.defs[this.key];
    if (!def || !this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    this.bg(ctx);
    if (def.draw) def.draw(ctx, this.s, PLC, this.W, this.H, this.t);
    this.vignette(ctx);
    this.hud(ctx, PLC);
  },

  vignette(ctx) {
    const W = this.W, H = this.H;
    const vg = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.22, W / 2, H * 0.5, W * 0.74);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.40)");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  },

  hud(ctx, plc) {
    const W = this.W;
    const run = plc && plc.running;
    ctx.save();
    ctx.textBaseline = "middle";
    const label = run ? "RUN" : "STOP";
    const col = run ? "#57e08f" : "#ff8f8f";
    ctx.font = "700 15px Consolas,monospace";
    const pw = ctx.measureText(label).width + 42;
    ctx.fillStyle = run ? "rgba(16,44,26,.84)" : "rgba(54,20,20,.84)";
    rr(ctx, 16, 14, pw, 32, 16); ctx.fill();
    ctx.strokeStyle = run ? "rgba(87,224,143,.55)" : "rgba(255,143,143,.55)";
    ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(31, 30, 6, 0, 7);
    ctx.fillStyle = col;
    if (run) { ctx.shadowColor = col; ctx.shadowBlur = 12; }
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = col; ctx.textAlign = "left";
    ctx.fillText(label, 45, 31);

    const ms = (plc && plc.scanMs || 0).toFixed(2);
    const scans = (plc && plc.scans || 0);
    const txt = "SCAN " + String(scans).padStart(6, "0") + "   " + ms + " ms";
    ctx.font = "600 13px Consolas,monospace";
    const w2 = ctx.measureText(txt).width + 26;
    ctx.fillStyle = "rgba(8,14,24,.84)";
    rr(ctx, W - 16 - w2, 14, w2, 32, 8); ctx.fill();
    ctx.strokeStyle = "rgba(74,158,255,.35)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = "#7fd1ff"; ctx.textAlign = "right";
    ctx.fillText(txt, W - 29, 31);
    ctx.restore();
  },

  bg(ctx) {
    const H = this.H, W = this.W;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#101a2c");
    g.addColorStop(0.55, "#0b1220");
    g.addColorStop(1, "#070c15");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const sp = ctx.createRadialGradient(W * 0.5, H * 0.12, 12, W * 0.5, H * 0.2, W * 0.6);
    sp.addColorStop(0, "rgba(120,170,255,0.10)");
    sp.addColorStop(1, "rgba(120,170,255,0)");
    ctx.fillStyle = sp; ctx.fillRect(0, 0, W, H * 0.72);
    const fg = ctx.createLinearGradient(0, H * 0.62, 0, H);
    fg.addColorStop(0, "#141d2e"); fg.addColorStop(1, "#0a111c");
    ctx.fillStyle = fg; ctx.fillRect(0, H * 0.62, W, H * 0.38);
    ctx.strokeStyle = "rgba(74,158,255,0.06)"; ctx.lineWidth = 1;
    for (let i = -6; i <= 22; i++) {
      const x = i * 60;
      ctx.beginPath(); ctx.moveTo(x, H * 0.62); ctx.lineTo(W / 2 + (x - W / 2) * 1.8, H); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(0, H * 0.62); ctx.lineTo(W, H * 0.62); ctx.stroke();
    ctx.strokeStyle = "rgba(74,158,255,0.035)";
    for (let y = 0; y < H * 0.62; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H * 0.62); ctx.stroke(); }
  }
};

/* ====================== çizim yardımcıları ====================== */
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function metalBox(ctx, x, y, w, h, r, c1, c2) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, c1 || "#3a4761");
  g.addColorStop(1, c2 || "#1d2738");
  ctx.fillStyle = g; rr(ctx, x, y, w, h, r || 6); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1; ctx.stroke();
}
function flabel(ctx, x, y, txt, col, font) {
  ctx.font = font || "600 12px 'Segoe UI',sans-serif";
  ctx.fillStyle = col || "#9fb4cc";
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillText(txt, x, y);
}
function led(ctx, x, y, w, h, on, col) {
  col = col || "#22c55e";
  const g = ctx.createLinearGradient(x, y, x, y + h);
  if (on) { g.addColorStop(0, "#ffffff"); g.addColorStop(1, col); }
  else { g.addColorStop(0, "#2a3a30"); g.addColorStop(1, "#16241b"); }
  ctx.save();
  if (on) { ctx.shadowColor = col; ctx.shadowBlur = 12; }
  ctx.fillStyle = g; rr(ctx, x, y, w, h, 3); ctx.fill();
  ctx.restore();
}
function car(ctx, x, y, col) {
  const g = ctx.createLinearGradient(0, y - 30, 0, y);
  g.addColorStop(0, col); g.addColorStop(1, "#16202e");
  ctx.fillStyle = g; rr(ctx, x, y - 28, 70, 28, 7); ctx.fill();
  ctx.fillStyle = "#0e1626"; rr(ctx, x + 12, y - 40, 46, 14, 4); ctx.fill();
  ctx.fillStyle = "#0b1120";
  ctx.beginPath(); ctx.arc(x + 16, y, 7, 0, 7); ctx.arc(x + 54, y, 7, 0, 7); ctx.fill();
}

/* ====================== SAHNE TANIMLARI ====================== */
(function () {
  const S = Scenes;

  /* ------------------------ 1) KONVEYÖR ------------------------ */
  S.defs.conveyor = {
    name: "Konveyör Hattı",
    desc: "Y0 = Bant motoru · Y1 = Yön (geri) · X2/X3 = otomatik uç sensörleri",
    init(s) { s.boxes = [{ x: 90 }]; s.belt = 0; s.spawnT = 0; },
    update(s, plc, dt) {
      const running = plc.outputs.Y0, rev = plc.outputs.Y1;
      const dir = rev ? -1 : 1;
      s.belt = ((s.belt + (running ? (rev ? -3 : 3) : 0)) % 24 + 24) % 24;
      for (const b of s.boxes) b.x += (running ? 0.09 * dir : 0) * dt;
      if (running && !rev) {
        s.spawnT += dt;
        if (s.spawnT > 2600) { s.spawnT = 0; if (s.boxes.length < 5) s.boxes.push({ x: 60 }); }
      }
      plc.setInput("X2", s.boxes.some(b => b.x > 610 && b.x < 700));
      plc.setInput("X3", s.boxes.some(b => b.x > 40 && b.x < 110));
      s.boxes = s.boxes.filter(b => b.x > -40 && b.x < 800);
    },
    draw(ctx, s, plc, W, H, t) {
      const bx = 60, by = 250, bw = 640;
      for (const sx of [80, 640]) {
        ctx.fillStyle = "#26344a"; ctx.fillRect(sx - 3, 150, 6, 104);
        const on = (sx < 300 ? plc.inputs.X3 : plc.inputs.X2);
        led(ctx, sx - 8, 138, 16, 12, on, "#4a9eff");
      }
      metalBox(ctx, bx - 10, by + 30, bw + 20, 34, 8, "#2c3a50", "#161f2d");
      ctx.fillStyle = "#1b2534";
      ctx.fillRect(bx + 30, by + 60, 14, 44); ctx.fillRect(bx + bw - 44, by + 60, 14, 44);
      const beltG = ctx.createLinearGradient(0, 250, 0, 276);
      beltG.addColorStop(0, "#2a3648"); beltG.addColorStop(1, "#121a27");
      ctx.fillStyle = beltG; rr(ctx, 60, 250, 640, 26, 6); ctx.fill();
      ctx.save(); rr(ctx, 60, 250, 640, 26, 6); ctx.clip();
      ctx.strokeStyle = "rgba(74,158,255,0.35)"; ctx.lineWidth = 3;
      for (let x = 60 - 24 + (s.belt % 24); x < 700 + 24; x += 24) {
        ctx.beginPath(); ctx.moveTo(x, 252); ctx.lineTo(x - 10, 274); ctx.stroke();
      }
      ctx.restore();
      const mg = ctx.createLinearGradient(0, 234, 0, 284);
      mg.addColorStop(0, plc.outputs.Y0 ? "#2f8f57" : "#37455c");
      mg.addColorStop(1, plc.outputs.Y0 ? "#1c5c37" : "#222d3e");
      ctx.fillStyle = mg; rr(ctx, 68, 234, 74, 58, 8); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.stroke();
      if (plc.outputs.Y0) {
        ctx.save(); ctx.translate(105, 263); ctx.rotate(t * 0.01 * (plc.outputs.Y1 ? -1 : 1));
        ctx.strokeStyle = "#8fd6ff"; ctx.lineWidth = 2;
        for (let a = 0; a < 3; a++) { ctx.rotate(Math.PI / 1.5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(9, 0); ctx.stroke(); }
        ctx.restore();
      }
      led(ctx, 68, 220, 10, 8, plc.outputs.Y0);
      flabel(ctx, 84, 226, "MOTOR " + (plc.outputs.Y1 ? "(GERİ)" : "(İLERİ)"), "#cfe0f5");
      for (const b of s.boxes) {
        const g = ctx.createLinearGradient(0, 212, 0, 250);
        g.addColorStop(0, "#e0a94a"); g.addColorStop(1, "#a8792c");
        ctx.fillStyle = g; rr(ctx, b.x, 212, 42, 38, 4); ctx.fill();
        ctx.strokeStyle = "#7c5a1e"; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.strokeStyle = "rgba(124,90,30,0.7)";
        ctx.beginPath(); ctx.moveTo(b.x + 21, 212); ctx.lineTo(b.x + 21, 250); ctx.stroke();
      }
    }
  };

  /* ------------------------ 2) TRAFİK LAMBASI ------------------------ */
  S.defs.traffic = {
    name: "Trafik Lambası",
    desc: "Y0 = Kırmızı · Y1 = Sarı · Y2 = Yeşil · X0 = Başlat",
    init(s) { s.cars = [{ x: 520 }]; },
    update(s, plc, dt) {
      const c = s.cars[0];
      if (plc.outputs.Y2) c.x -= 1.4 * dt * 0.05;
      if (c.x < 190) c.x = 640;
    },
    draw(ctx, s, plc, W, H, t) {
      ctx.fillStyle = "#1a2030"; ctx.fillRect(0, 300, W, 80);
      ctx.strokeStyle = "rgba(230,220,120,0.5)"; ctx.setLineDash([24, 20]); ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, 340); ctx.lineTo(W, 340); ctx.stroke(); ctx.setLineDash([]);
      const px = 470, py = 80;
      ctx.fillStyle = "#2b3648"; ctx.fillRect(px, py, 12, 224);
      metalBox(ctx, px - 22, py - 12, 56, 158, 14, "#2e3b52", "#18212f");
      const lamps = [["Y0", "#ff3a2f"], ["Y1", "#f5a623"], ["Y2", "#2fd66b"]];
      lamps.forEach(([bit, col], i) => {
        const cy = py + 20 + i * 46, on = plc.outputs[bit];
        ctx.save();
        if (on) { ctx.shadowColor = col; ctx.shadowBlur = 24; }
        const g = ctx.createRadialGradient(px + 6, cy - 5, 2, px + 6, cy, 18);
        g.addColorStop(0, on ? "#ffffff" : "#2a3345");
        g.addColorStop(0.4, on ? col : "#1b2432");
        g.addColorStop(1, on ? col : "#121a27");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px + 6, cy, 17, 0, 7); ctx.fill();
        ctx.restore();
        ctx.strokeStyle = "rgba(0,0,0,0.45)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(px + 6, cy, 17, 0, 7); ctx.stroke();
      });
      const c = s.cars[0];
      ctx.fillStyle = "#0b1120";
      ctx.beginPath(); ctx.arc(c.x + 15, 339, 7, 0, 7); ctx.arc(c.x + 49, 339, 7, 0, 7); ctx.fill();
      car(ctx, c.x, 340, "#3d7bd6");
      const go = plc.outputs.Y2;
      flabel(ctx, 40, 80, go ? "GEÇ" : "DUR", go ? "#2fd66b" : "#ff5a4d", "800 44px 'Segoe UI',sans-serif");
    }
  };

  /* ------------------------ 3) DOLUM TANKI ------------------------ */
  S.defs.tank = {
    name: "Dolum Tankı",
    desc: "Y0 = Giriş vanası · Y1 = Karıştırıcı · Y2 = Boşaltma · X2/X3 = otomatik seviye",
    init(s) { s.level = 0.15; s.mix = 0; },
    update(s, plc, dt) {
      if (plc.outputs.Y0) s.level = Math.min(1, s.level + dt * 0.00028);
      if (plc.outputs.Y2) s.level = Math.max(0, s.level - dt * 0.00034);
      if (plc.outputs.Y1) s.mix += dt * 0.012;
      plc.setInput("X2", s.level > 0.9);
      plc.setInput("X3", s.level < 0.08);
    },
    draw(ctx, s, plc, W, H, t) {
      const tx = 300, ty = 70, tw = 200, th = 250;
      metalBox(ctx, tx - 8, ty - 8, tw + 16, th + 16, 16, "#33445f", "#1a2436");
      ctx.fillStyle = "#0a1220"; rr(ctx, tx, ty, tw, th, 10); ctx.fill();
      const lh = th * s.level;
      ctx.save(); rr(ctx, tx, ty, tw, th, 10); ctx.clip();
      const lg = ctx.createLinearGradient(0, ty + th - lh, 0, ty + th);
      lg.addColorStop(0, "#2fd0e0"); lg.addColorStop(1, "#1273a8");
      ctx.fillStyle = lg; ctx.fillRect(tx, ty + th - lh, tw, lh);
      ctx.strokeStyle = "rgba(180,240,255,0.6)"; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = tx; x <= tx + tw; x += 6) {
        const yy = ty + th - lh + Math.sin((x + t * 0.01) * 0.06) * 3;
        x === tx ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke(); ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1;
      for (let i = 1; i < 5; i++) { const y = ty + th * i / 5; ctx.beginPath(); ctx.moveTo(tx + tw - 22, y); ctx.lineTo(tx + tw - 2, y); ctx.stroke(); }
      flabel(ctx, tx + tw / 2 - 22, ty + th / 2 + 4, Math.round(s.level * 100) + "%", "#dff2ff", "800 30px 'Segoe UI',sans-serif");
      if (s.level > 0.12) {
        ctx.strokeStyle = "#b7c7dd"; ctx.lineWidth = 3;
        ctx.save(); ctx.translate(tx + tw / 2, ty + 40); ctx.rotate(s.mix);
        ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, 6); ctx.stroke();
        ctx.restore();
      }
      led(ctx, tx - 26, ty + 6, 14, 10, plc.inputs.X2);
      flabel(ctx, tx - 60, ty + 16, "X2", "#9fb4cc");
      led(ctx, tx - 26, ty + th - 18, 14, 10, plc.inputs.X3);
      flabel(ctx, tx - 60, ty + th - 8, "X3", "#9fb4cc");
      ctx.fillStyle = plc.outputs.Y0 ? "#2fd66b" : "#3a4a60";
      rr(ctx, tx + tw / 2 - 34, ty - 34, 68, 20, 5); ctx.fill();
      flabel(ctx, tx + tw / 2 - 32, ty - 20, "GİRİŞ", plc.outputs.Y0 ? "#062" : "#9fb4cc");
      ctx.fillStyle = plc.outputs.Y2 ? "#f5a623" : "#3a4a60";
      rr(ctx, tx + tw / 2 - 40, ty + th + 16, 80, 20, 5); ctx.fill();
      flabel(ctx, tx + tw / 2 - 42, ty + th + 30, "BOŞALT", plc.outputs.Y2 ? "#402" : "#9fb4cc");
      led(ctx, tx + tw / 2 - 5, ty - 52, 10, 8, plc.outputs.Y1);
      flabel(ctx, tx + tw / 2 + 12, ty - 45, "MİKSER", "#cfe0f5");
    }
  };

  /* ------------------------ 4) ASANSÖR ------------------------ */
  S.defs.elevator = {
    name: "Asansör",
    desc: "Y0 = Yukarı · Y1 = Aşağı · X0/X1 = otomatik kat sensörleri",
    init(s) { s.y = 300; },
    update(s, plc, dt) {
      const up = plc.outputs.Y0, dn = plc.outputs.Y1;
      if (up && !dn) s.y -= dt * 0.09;
      else if (dn && !up) s.y += dt * 0.09;
      s.y = Math.max(80, Math.min(300, s.y));
      plc.setInput("X0", s.y <= 82);
      plc.setInput("X1", s.y >= 298);
    },
    draw(ctx, s, plc, W, H) {
      const sx = 240, sw = 260, sy = 60, sh = 300;
      metalBox(ctx, sx - 30, sy - 20, sw + 60, sh + 40, 10, "#1e2a3d", "#121a28");
      ctx.fillStyle = "#070d16"; rr(ctx, sx, sy, sw, sh, 6); ctx.fill();
      ctx.strokeStyle = "rgba(74,158,255,0.15)"; ctx.lineWidth = 1;
      for (let i = 0; i <= 2; i++) { const y = sy + sh / 2 * i; ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx + sw, y); ctx.stroke(); }
      flabel(ctx, sx - 26, sy + 30, "KAT 2", "#7f93ad");
      flabel(ctx, sx - 26, sy + 180, "KAT 1", "#7f93ad");
      led(ctx, sx + sw + 6, 66, 14, 10, plc.inputs.X0);
      led(ctx, sx + sw + 6, 340, 14, 10, plc.inputs.X1);
      const cw = 150, ch = 100, cxp = 240 + (260 - 150) / 2;
      const cg = ctx.createLinearGradient(0, s.y, 0, s.y + 100);
      cg.addColorStop(0, "#3d70bd"); cg.addColorStop(1, "#204a86");
      ctx.fillStyle = cg; rr(ctx, cxp, s.y, 150, 100, 8); ctx.fill();
      ctx.strokeStyle = "#8fc0ff"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath(); ctx.moveTo(cxp + 75, s.y + 8); ctx.lineTo(cxp + 75, s.y + 92); ctx.stroke();
      if (plc.outputs.Y0) { ctx.fillStyle = "#2fd66b"; ctx.beginPath(); ctx.moveTo(cxp + 75, s.y + 30); ctx.lineTo(cxp + 63, s.y + 46); ctx.lineTo(cxp + 87, s.y + 46); ctx.fill(); }
      if (plc.outputs.Y1) { ctx.fillStyle = "#f5a623"; ctx.beginPath(); ctx.moveTo(cxp + 75, s.y + 70); ctx.lineTo(cxp + 63, s.y + 54); ctx.lineTo(cxp + 87, s.y + 54); ctx.fill(); }
      led(ctx, cxp + 8, s.y + 8, 10, 7, plc.outputs.Y0 || plc.outputs.Y1);
      flabel(ctx, 350, 384, "KAT 2 ↑  /  KAT 1 ↓", "#7f93ad");
    }
  };

  /* ------------------------ 5) GARAJ KAPISI ------------------------ */
  S.defs.gate = {
    name: "Garaj / Bariyer Kapısı",
    desc: "Y0 = Aç · Y1 = Kapat · X0/X1 = otomatik açma/kapama sınır sensörleri",
    init(s) { s.ang = 0; },
    update(s, plc, dt) {
      const op = plc.outputs.Y0, cl = plc.outputs.Y1;
      if (op && !cl) s.ang = Math.min(90, s.ang + dt * 0.06);
      else if (cl && !op) s.ang = Math.max(0, s.ang - dt * 0.06);
      plc.setInput("X0", s.ang >= 88);
      plc.setInput("X1", s.ang <= 2);
    },
    draw(ctx, s, plc, W, H) {
      metalBox(ctx, 60, 120, 240, 230, 10, "#232f43", "#151d2a");
      ctx.fillStyle = "#070d16"; rr(ctx, 110, 150, 150, 200, 6); ctx.fill();
      ctx.fillStyle = "#1a2030"; ctx.fillRect(0, 328, W, 52);
      ctx.strokeStyle = "rgba(230,220,120,0.4)"; ctx.setLineDash([20, 16]); ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, 354); ctx.lineTo(W, 354); ctx.stroke(); ctx.setLineDash([]);
      const pX = 420, pY = 300;
      ctx.save(); ctx.translate(pX, pY); ctx.rotate(-s.ang * Math.PI / 180);
      const bgd = ctx.createLinearGradient(0, -8, 0, 8);
      bgd.addColorStop(0, "#ff5a4d"); bgd.addColorStop(1, "#b23227");
      ctx.fillStyle = bgd; rr(ctx, 0, -8, 220, 16, 6); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (let i = 0; i < 5; i++) ctx.fillRect(30 + i * 38, -8, 18, 16);
      ctx.restore();
      ctx.fillStyle = "#2b3648"; ctx.beginPath(); ctx.arc(pX, pY, 16, 0, 7); ctx.fill();
      ctx.fillStyle = "#4a9eff"; ctx.beginPath(); ctx.arc(pX, pY, 6, 0, 7); ctx.fill();
      metalBox(ctx, pX - 12, pY, 24, 30, 4, "#2b3648", "#16202e");
      car(ctx, 150, 328, plc.outputs.Y0 ? "#3d7bd6" : "#44506a");
      car(ctx, 560, 328, "#3a8f6a");
      flabel(ctx, 430, 120, s.ang > 45 ? "AÇIK" : "KAPALI", s.ang > 45 ? "#2fd66b" : "#ff5a4d", "800 30px 'Segoe UI',sans-serif");
    }
  };

  /* ------------------------ 6) MOTOR / FAN ------------------------ */
  S.defs.fan = {
    name: "Endüstriyel Motor / Fan",
    desc: "Y0 = Motor çalıştır · Y1 = Yüksek devir · X0 = termik/arıza",
    init(s) { s.rpm = 0; s.ang = 0; },
    update(s, plc, dt) {
      const target = plc.outputs.Y0 ? (plc.outputs.Y1 ? 2800 : 1400) : 0;
      s.rpm += (target - s.rpm) * Math.min(1, dt * 0.0016);
      s.ang += (s.rpm / 60) * Math.PI * 2 * (dt / 1000);
    },
    draw(ctx, s, plc, W, H, t) {
      const cx = 380, cy = 200;
      const bg = ctx.createRadialGradient(cx - 30, cy - 30, 20, cx, cy, 130);
      bg.addColorStop(0, plc.outputs.Y0 ? "#3aa663" : "#3b4a61");
      bg.addColorStop(1, "#16202e");
      ctx.save(); ctx.shadowColor = plc.outputs.Y0 ? "rgba(47,214,107,0.5)" : "transparent"; ctx.shadowBlur = 30;
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx, cy, 110, 0, 7); ctx.fill(); ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 110, 0, 7); ctx.stroke();
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.ang);
      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        const g = ctx.createLinearGradient(0, 0, 80, 0);
        g.addColorStop(0, "#8fb6e0"); g.addColorStop(1, "#4a6a92");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(12, -10); ctx.quadraticCurveTo(70, -26, 82, 0); ctx.quadraticCurveTo(70, 26, 12, 10); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      ctx.fillStyle = "#22303f"; ctx.beginPath(); ctx.arc(cx, cy, 22, 0, 7); ctx.fill();
      ctx.fillStyle = "#4a9eff"; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, 7); ctx.fill();
      ctx.strokeStyle = "rgba(74,158,255,0.25)"; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(cx, cy, 124, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, s.rpm / 2800)); ctx.stroke();
      flabel(ctx, cx - 90, cy + 160, plc.outputs.Y0 ? (plc.outputs.Y1 ? "KADEME 2" : "KADEME 1") : "DURDURULDU",
        plc.outputs.Y0 ? (plc.outputs.Y1 ? "#f5a623" : "#2fd66b") : "#7f93ad", "800 24px 'Segoe UI',sans-serif");
      flabel(ctx, cx - 55, cy + 190, Math.round(s.rpm) + " d/dk", "#cfe0f5", "700 18px 'Consolas',monospace");
      led(ctx, 60, 60, 14, 10, plc.inputs.X0);
      flabel(ctx, 84, 70, "X0 ARIZA", "#9fb4cc");
    }
  };
})();

if (typeof window !== "undefined") { window.Scenes = Scenes; window.PLC = PLC; }
