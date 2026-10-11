/* =========================================================================
   Elektronik Akademi — PLC Modülü (Ladder Logic / Merdiven Mantığı)
   Endüstriyel seviye: TON/TOF zamanlayıcı, CTU/CTD sayıcı, kenar kontak,
   paralel dallar, gerçek zamanlı tarama + animasyonlu makine sahneleri.
   ========================================================================= */

const PLC = {
  /* ---------------- durum ---------------- */
  inputs: {},      // X0-X15
  outputs: {},     // Y0-Y15
  memory: {},      // M0-M15 (iç röle)
  timer: {},       // T0-T15 { acc, preset, done, type }
  counter: {},     // C0-C15 { acc, preset, done, prev, type }
  rungs: [],
  running: false,
  scene: "conveyor",
  selRung: 0,
  _lastT: 0,
  _raf: 0,
  _uiAcc: 0,

  /* ---------------- başlat ---------------- */
  init() {
    for (let i = 0; i <= 15; i++) {
      this.inputs["X" + i] = false;
      this.outputs["Y" + i] = false;
      this.memory["M" + i] = false;
      this.timer["T" + i] = { acc: 0, preset: 1000, done: false, type: "TON" };
      this.counter["C" + i] = { acc: 0, preset: 5, done: false, prev: false, type: "CTU" };
    }
    if (!this.rungs.length) this.loadProgram("startstop");
  },

  /* ---------------- hazır programlar ---------------- */
  loadProgram(name) {
    const C = (addr, nc, label, edge) => ({ type: "contact", addr, nc: !!nc, label: label || "", edge: edge || null });
    if (name === "startstop") {
      this.rungs = [
        { id: 1, columns: [
          [ C("X0", 0, "START"), C("Y0", 0, "SEAL") ],
          [ C("X1", 1, "STOP") ]
        ], out: { type: "coil", addr: "Y0", label: "MOTOR" } }
      ];
    } else if (name === "conveyor") {
      this.rungs = [
        { id: 1, columns: [
          [ C("X0", 0, "START"), { type: "contact", addr: "Y0", nc: false, label: "SEAL" } ]
        ], out: { type: "coil", addr: "Y0", label: "BANT" } },
        { id: 2, columns: [
          [ { type: "contact", addr: "X1", nc: false, label: "SAĞ SINIR" } ]
        ], out: { type: "coil", addr: "Y1", label: "YÖN" } }
      ];
    } else if (name === "traffic") {
      this.rungs = [
        { id: 1, columns: [
          [ { type: "contact", addr: "X0", nc: false, label: "BAŞLAT" },
            { type: "contact", addr: "M0", nc: false, label: "ÇALIŞ" } ]
        ], out: { type: "timer", addr: "T0", kind: "TON", preset: 5000, label: "KIRMIZI SÜRE" } },
        { id: 2, columns: [
          [ { type: "contact", addr: "T0", nc: false, label: "T0" } ]
        ], out: { type: "timer", addr: "T1", kind: "TON", preset: 2000, label: "SARI SÜRE" } },
        { id: 3, columns: [
          [ { type: "contact", addr: "T1", nc: false, label: "T1" },
            { type: "contact", addr: "X0", nc: false, label: "BAŞLAT" },
            { type: "contact", addr: "M0", nc: false, label: "ÇALIŞ" } ]
        ], out: { type: "coil", addr: "M0", label: "ÇALIŞ" } },
        { id: 4, columns: [
          [ { type: "contact", addr: "M0", nc: true, label: "!M0" } ]
        ], out: { type: "coil", addr: "Y0", label: "KIRMIZI" } },
        { id: 5, columns: [
          [ { type: "contact", addr: "T0", nc: false, label: "T0" },
            { type: "contact", addr: "T1", nc: true, label: "!T1" } ]
        ], out: { type: "coil", addr: "Y1", label: "SARI" } },
        { id: 6, columns: [
          [ { type: "contact", addr: "T1", nc: false, label: "T1" } ]
        ], out: { type: "coil", addr: "Y2", label: "YEŞİL" } }
      ];
    } else if (name === "tank") {
      this.rungs = [
        { id: 1, columns: [
          [ { type: "contact", addr: "X0", nc: false, label: "BAŞLAT" },
            { type: "contact", addr: "Y0", nc: false, label: "SEAL" } ],
          [ { type: "contact", addr: "X2", nc: true, label: "ÜST SEVİYE" } ]
        ], out: { type: "coil", addr: "Y0", label: "GİRİŞ VANASI" } },
        { id: 2, columns: [
          [ { type: "contact", addr: "X2", nc: false, label: "ÜST SEVİYE" } ],
          [ { type: "contact", addr: "X1", nc: true, label: "BOŞALT" } ]
        ], out: { type: "coil", addr: "Y1", label: "KARIŞTIRICI" } },
        { id: 3, columns: [
          [ { type: "contact", addr: "X1", nc: false, label: "BOŞALT" } ]
        ], out: { type: "coil", addr: "Y2", label: "BOŞALTMA VANASI" } }
      ];
    } else if (name === "elevator") {
      this.rungs = [
        { id: 1, columns: [
          [ { type: "contact", addr: "X0", nc: false, label: "KAT 2 ÇAĞRI" } ],
          [ { type: "contact", addr: "X1", nc: true, label: "KAT 2 SINIR" } ]
        ], out: { type: "coil", addr: "Y0", label: "YUKARI" } },
        { id: 2, columns: [
          [ { type: "contact", addr: "X1", nc: false, label: "KAT 1 ÇAĞRI" } ],
          [ { type: "contact", addr: "X0", nc: true, label: "KAT 1 SINIR" } ]
        ], out: { type: "coil", addr: "Y1", label: "AŞAĞI" } }
      ];
    }
  },

  /* ---------------- bit oku ---------------- */
  contactState(addr) {
    if (addr.startsWith("X")) return this.inputs[addr];
    if (addr.startsWith("Y")) return this.outputs[addr];
    if (addr.startsWith("M")) return this.memory[addr];
    if (addr.startsWith("T")) return this.timer[addr] && this.timer[addr].done;
    if (addr.startsWith("C")) return this.counter[addr] && this.counter[addr].done;
    return false;
  },

  /* ---------------- tarama ---------------- */
  scan(dt) {
    dt = dt || 0;
    for (const rung of this.rungs) {
      let rungTrue = true;
      for (const col of rung.columns) {
        let colTrue = false;
        for (const el of col) {
          const raw = !!this.contactState(el.addr);
          let active = el.nc ? !raw : raw;
          if (el.edge === "P") active = raw && !el._prev;
          else if (el.edge === "N") active = !raw && el._prev;
          el._prev = raw;
          el._active = active;
          if (active) colTrue = true;
        }
        if (!colTrue) { rungTrue = false; break; }
      }
      rung._true = rungTrue;
      this.applyOut(rung, rungTrue, dt);
    }
  },

  applyOut(rung, on, dt) {
    const o = rung.out;
    if (!o) return;
    if (o.type === "coil") {
      if (o.addr.startsWith("Y")) this.outputs[o.addr] = on;
      else if (o.addr.startsWith("M")) this.memory[o.addr] = on;
      o._val = on;
    } else if (o.type === "timer") {
      const t = this.timer[o.addr];
      if (!t) return;
      t.type = o.kind || "TON";
      if (o.preset != null) t.preset = o.preset;
      if (t.type === "TOF") {
        if (on) { t.acc = 0; t.done = true; }
        else if (t.done) { t.acc += dt; if (t.acc >= t.preset) { t.done = false; t.acc = 0; } }
      } else {
        if (on) { t.acc += dt; if (t.acc >= t.preset) { t.done = true; t.acc = t.preset; } }
        else { t.acc = 0; t.done = false; }
      }
      o._val = t.done;
    } else if (o.type === "counter") {
      const c = this.counter[o.addr];
      if (!c) return;
      c.type = o.kind || "CTU";
      if (o.preset != null) c.preset = o.preset;
      if (c.type === "CTD") {
        if (on && !c.prev) { c.acc = Math.max(0, c.acc - 1); c.done = c.acc <= 0; }
      } else {
        if (on && !c.prev) { c.acc++; if (c.acc >= c.preset) c.done = true; }
      }
      c.prev = on;
      o._val = c.done;
    }
  },

  setInput(addr, val) { if (this.inputs.hasOwnProperty(addr)) this.inputs[addr] = val; },
  toggleInput(addr) { this.setInput(addr, !this.inputs[addr]); },

  /* ---------------- çalıştır / durdur ---------------- */
  start() {
    if (this.running) return;
    this.running = true;
    this._lastT = 0;
    this._loop();
    this.renderAll();
  },
  stop() {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
    for (let i = 0; i <= 15; i++) this.outputs["Y" + i] = false;
    for (let i = 0; i <= 15; i++) this.memory["M" + i] = false;
    if (window.Scenes) Scenes.render(16);
    this.renderAll();
  },
  toggleRun() { this.running ? this.stop() : this.start(); },

  resetAll() {
    this.stop();
    for (let i = 0; i <= 15; i++) {
      this.inputs["X" + i] = false;
      this.outputs["Y" + i] = false;
      this.memory["M" + i] = false;
      this.timer["T" + i].acc = 0; this.timer["T" + i].done = false;
      this.counter["C" + i].acc = 0; this.counter["C" + i].done = false; this.counter["C" + i].prev = false;
    }
    if (window.Scenes) Scenes.reset();
    this.renderAll();
    if (window.Scenes) Scenes.render(16);
  },

  _loop() {
    if (!this.running) return;
    this._raf = requestAnimationFrame((ts) => {
      if (!document.getElementById("plc-scene-canvas")) { this._raf = 0; this.running = false; return; }
      const dt = this._lastT ? Math.min(60, ts - this._lastT) : 16;
      this._lastT = ts;

      if (window.Scenes) Scenes.update(dt, this);
      this.scan(dt);
      if (window.Scenes) Scenes.render(dt);

      this._uiAcc += dt;
      if (this._uiAcc > 80) { this._uiAcc = 0; this.renderLadder(true); this.renderIO(); this.renderHMI(); }
      this._loop();
    });
  },

  /* ======================== GÖRÜNÜM ======================== */
  render() {
    const c = document.getElementById("content");
    if (!c) return;

    const scenecards = [
      ["conveyor", "Konveyör"], ["traffic", "Trafik Lambası"], ["tank", "Dolum Tankı"],
      ["elevator", "Asansör"], ["gate", "Garaj Kapısı"], ["fan", "Motor / Fan"]
    ].map(([k, n]) => '<button class="plc-scene-btn ' + (this.scene === k ? 'active' : '') + '" data-scene="' + k + '">' + n + '</button>').join("");

    const progcards = [
      ["startstop", "Start-Stop"], ["conveyor", "Konveyör"], ["traffic", "Trafik"],
      ["tank", "Dolum"], ["elevator", "Asansör"]
    ].map(([k, n]) => '<button class="plc-prog-btn" data-prog="' + k + '">' + n + '</button>').join("");

    c.innerHTML =
      '<div class="plc-header">' +
        '<div class="plc-titlewrap">' +
          '<h1 class="page-title">PLC Simülatörü</h1>' +
          '<p class="page-sub">Endüstriyel merdiven mantığı — zamanlayıcı, sayıcı ve animasyonlu makine sahneleri</p>' +
        '</div>' +
        '<div class="plc-controls">' +
          '<button class="plc-btn ' + (this.running ? 'running' : '') + '" id="plc-run">' +
            (this.running ? '■ DURDUR' : '▶ ÇALIŞTIR') + '</button>' +
          '<button class="plc-btn" id="plc-reset">↺ Sıfırla</button>' +
          '<span class="plc-status ' + (this.running ? 'on' : '') + '">' + (this.running ? '● ÇALIŞIYOR' : '○ DURDU') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="plc-toolbar">' +
        '<div class="plc-tg"><span class="plc-tag">SAHNE</span>' +
          scenecards + '</div>' +
        '<div class="plc-tg"><span class="plc-tag">PROGRAM</span>' + progcards + '</div>' +
      '</div>' +
      '<div class="plc-body">' +
        '<div class="plc-col-left">' +
          '<section class="plc-scene-wrap">' +
            '<canvas id="plc-scene-canvas" width="760" height="380"></canvas>' +
            '<div class="plc-scene-title" id="plc-scene-title"></div>' +
          '</section>' +
          '<section class="plc-hmi" id="plc-hmi"></section>' +
        '</div>' +
        '<div class="plc-right">' +
          '<section class="plc-panel ladder-panel">' +
            '<div class="plc-panel-head"><h3>Ladder Diyagramı</h3>' +
              '<div class="plc-panel-actions">' +
                '<button class="plc-mini" id="plc-add-rung">+ Rung</button>' +
              '</div>' +
            '</div>' +
            '<div class="plc-ladder" id="plc-ladder"></div>' +
          '</section>' +
          '<section class="plc-panel">' +
            '<h3>Girişler (Inputs)</h3><div class="plc-io-grid" id="plc-inputs"></div>' +
          '</section>' +
          '<section class="plc-panel">' +
            '<h3>Çıkışlar (Outputs)</h3><div class="plc-io-grid" id="plc-outputs"></div>' +
          '</section>' +
          '<section class="plc-panel">' +
            '<h3>İç Röle / Zamanlayıcı / Sayıcı</h3><div class="plc-io-grid" id="plc-internals"></div>' +
          '</section>' +
        '</div>' +
      '</div>';

    if (window.Scenes) Scenes.mount(this.scene);
    this.renderLadder();
    this.renderIO();
    this.renderHMI();
    this.bindEvents();
  },

  renderAll() {
    this.renderLadder(true);
    this.renderIO();
    this.renderHMI();
    const runb = document.getElementById("plc-run");
    if (runb) { runb.textContent = this.running ? "⏹ Durdur" : "▶ Çalıştır"; runb.classList.toggle("running", this.running); }
    const st = document.querySelector(".plc-status");
    if (st) { st.textContent = this.running ? "● ÇALIŞIYOR" : "○ DURDU"; st.classList.toggle("on", this.running); }
  },

  renderLadder() {
    const el = document.getElementById("plc-ladder");
    if (!el) return;
    let html = "";
    for (let ri = 0; ri < this.rungs.length; ri++) {
      const rung = this.rungs[ri];
      html += '<div class="ladder-rung" data-rung="' + ri + '">';
      html += '<span class="rung-num">' + (ri + 1) + '</span>';
      html += '<div class="rung-body ' + (rung._true ? "live" : "") + '">';
      html += '<div class="rung-rail-l"></div>';
      for (let ci = 0; ci < rung.columns.length; ci++) {
        const col = rung.columns[ci];
        html += '<div class="rung-col' + (col.length > 1 ? " parallel" : "") + '">';
        for (const elm of col) html += this.contactHTML(elm);
        html += '</div>';
      }
      html += this.outHTML(rung.out);
      html += '<div class="rung-rail-r"></div>';
      html += '</div></div>';
    }
    el.innerHTML = html;
  },

  contactHTML(el) {
    const on = el._active;
    return '<div class="ladder-el contact ' + (on ? 'active' : '') + ' ' + (el.nc ? 'nc' : 'no') + '">' +
      '<div class="contact-sym">' + (el.nc ? '<span class="bar"></span><span class="bar tilted"></span>' : '<span class="bar"></span><span class="bar"></span>') + '</div>' +
      '<div class="el-addr">' + el.addr + '</div>' +
      (el.label ? '<div class="el-label">' + el.label + '</div>' : '') +
      '</div>';
  },

  outHTML(o) {
    if (!o) return "";
    const on = o._val;
    if (o.type === "coil") {
      return '<div class="ladder-el coil ' + (on ? 'active' : '') + '">' +
        '<div class="coil-sym">( )</div><div class="el-addr">' + o.addr + '</div>' +
        (o.label ? '<div class="el-label">' + o.label + '</div>' : '') + '</div>';
    }
    if (o.type === "timer") {
      const t = this.timer[o.addr];
      return '<div class="ladder-el timer ' + (on ? 'active' : '') + '">' +
        '<div class="t-name">' + (o.kind || "TON") + '</div>' +
        '<div class="el-addr">' + o.addr + '</div>' +
        '<div class="t-acc">' + Math.round(t.acc) + '/' + t.preset + 'ms</div>' +
        '</div>';
    }
    if (o.type === "counter") {
      const c = this.counter[o.addr];
      return '<div class="ladder-el counter ' + (on ? 'active' : '') + '">' +
        '<div class="c-name">' + (o.kind || "CTU") + '</div>' +
        '<div class="el-addr">' + o.addr + '</div>' +
        '<div class="cnt-val">' + c.acc + '/' + c.preset + '</div>' +
        '</div>';
    }
    return "";
  },

  renderIO() {
    const ie = document.getElementById("plc-inputs");
    const oe = document.getElementById("plc-outputs");
    const me = document.getElementById("plc-internals");
    if (!ie || !oe || !me) return;

    let ih = "", oh = "", mh = "";
    for (let i = 0; i <= 7; i++) {
      const x = "X" + i, y = "Y" + i;
      ih += '<button class="plc-io-btn ' + (this.inputs[x] ? 'on' : '') + '" data-plc-in="' + x + '">' +
        '<span class="io-led ' + (this.inputs[x] ? 'on' : '') + '"></span><span class="io-lbl">' + x + '</span></button>';
      oh += '<div class="plc-io-btn out ' + (this.outputs[y] ? 'on' : '') + '">' +
        '<span class="io-led ' + (this.outputs[y] ? 'on' : '') + '"></span><span class="io-lbl">' + y + '</span></div>';
    }
    for (let i = 0; i <= 7; i++) {
      const m = "M" + i, t = this.timer["T" + i], c = this.counter["C" + i];
      mh += '<div class="plc-word"><span class="io-lbl">' + m + '</span><span class="io-led mini ' + (this.memory[m] ? 'on' : '') + '"></span>' +
        '<span class="io-lbl t">T' + i + '</span><span class="io-led mini ' + (t.done ? 'on' : '') + '"></span>' +
        '<span class="io-lbl c">C' + i + '</span><span class="io-val">' + c.acc + '</span></div>';
    }
    ie.innerHTML = ih; oe.innerHTML = oh; me.innerHTML = mh;
  },

  renderHMI() {
    const el = document.getElementById("plc-hmi");
    if (!el) return;
    const lamp = (on, label, color) =>
      '<div class="hmi-lamp"><span class="lamp-dot ' + (on ? 'on' : '') + '" style="--lamp:' + color + '"></span><span class="lamp-lbl">' + label + '</span></div>';
    let h = '<div class="hmi-bar">';
    h += '<div class="hmi-run ' + (this.running ? 'run' : 'stop') + '">' + (this.running ? 'RUN' : 'STOP') + '</div>';
    const cols = ["#22c55e", "#22c55e", "#f59e0b", "#f59e0b", "#4a9eff", "#4a9eff", "#a855f7", "#a855f7"];
    for (let i = 0; i < 8; i++) h += lamp(this.outputs["Y" + i], "Y" + i, cols[i]);
    h += '</div>';
    el.innerHTML = h;
  },

  bindEvents() {
    const runb = document.getElementById("plc-run");
    if (runb) runb.onclick = () => { this.toggleRun(); };
    const rb = document.getElementById("plc-reset");
    if (rb) rb.onclick = () => this.resetAll();
    const addb = document.getElementById("plc-add-rung");
    if (addb) addb.onclick = () => this.addRung();

    document.querySelectorAll("[data-plc-in]").forEach(btn => {
      const addr = btn.dataset.plcIn;
      btn.onmousedown = (e) => { e.preventDefault(); this.setInput(addr, true); this.renderIO(); this.renderLadder(); };
      btn.onmouseup = () => { this.setInput(addr, false); this.renderIO(); this.renderLadder(); };
      btn.onmouseleave = () => { if (this.inputs[addr]) { this.setInput(addr, false); this.renderIO(); this.renderLadder(); } };
    });

    document.querySelectorAll(".plc-scene-btn").forEach(btn => {
      btn.onclick = () => {
        this.scene = btn.dataset.scene;
        document.querySelectorAll(".plc-scene-btn").forEach(b => b.classList.toggle("active", b === btn));
        if (window.Scenes) Scenes.mount(this.scene);
        const t = document.getElementById("plc-scene-title");
        if (t) t.textContent = Scenes.defs[this.scene] ? Scenes.defs[this.scene].name : "";
        if (window.Scenes) Scenes.render(16);
      };
    });

    document.querySelectorAll(".plc-prog-btn").forEach(btn => {
      btn.onclick = () => { this.loadProgram(btn.dataset.prog); this.renderAll(); if (window.Scenes) Scenes.render(16); };
    });
  },

  addRung() {
    const n = this.rungs.length + 1;
    this.rungs.push({
      id: n,
      columns: [[{ type: "contact", addr: "X0", nc: false, label: "", edge: null }]],
      out: { type: "coil", addr: "Y0", label: "" }
    });
    this.renderLadder();
  }
};

if (typeof window !== "undefined") PLC.init();
