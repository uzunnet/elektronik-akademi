/* =========================================================================
   Elektronik Akademi — PLC Modülü (Ladder Logic / Merdiven Mantığı)
   ========================================================================= */

const PLC = {
  // PLC state
  inputs: {},   // X0-X15: true/false
  outputs: {},  // Y0-Y15: true/false
  internals: {},// C0-C15: true/false (internal relays)
  rungs: [],    // ladder rungs
  running: false,
  scanRate: 100, // ms
  timer: null,

  // Initialize
  init() {
    for (let i = 0; i <= 15; i++) {
      this.inputs["X" + i] = false;
      this.outputs["Y" + i] = false;
      this.internals["C" + i] = false;
    }
    // Default rungs (start-stop circuit)
    this.rungs = [
      { id: 1, elements: [
        { type: "contact", addr: "X0", nc: false, label: "START" },
        { type: "contact", addr: "X1", nc: true, label: "STOP" },
        { type: "coil", addr: "Y0", label: "RUN" }
      ]},
      { id: 2, elements: [
        { type: "contact", addr: "Y0", nc: false, label: "SEAL" },
        { type: "contact", addr: "X1", nc: true, label: "STOP" },
        { type: "coil", addr: "Y0", label: "RUN" }
      ]}
    ];
  },

  // Set input
  setInput(addr, val) {
    if (this.inputs.hasOwnProperty(addr)) {
      this.inputs[addr] = val;
      if (this.running) this.scan();
    }
  },

  // Toggle input
  toggleInput(addr) {
    this.setInput(addr, !this.inputs[addr]);
  },

  // Single scan cycle
  scan() {
    // Phase 1: Evaluate all rungs (read current output states)
    const results = [];
    for (const rung of this.rungs) {
      let result = true;
      for (const el of rung.elements) {
        if (el.type === "contact") {
          let val;
          if (el.addr.startsWith("X")) val = this.inputs[el.addr];
          else if (el.addr.startsWith("Y")) val = this.outputs[el.addr];
          else if (el.addr.startsWith("C")) val = this.internals[el.addr];
          else val = false;
          if (el.nc) val = !val;
          if (!val) { result = false; break; }
        }
      }
      results.push(result);
    }
    // Phase 2: Update coils (OR logic for same-address coils)
    const newOutputs = {};
    const newInternals = {};
    for (let i = 0; i < this.rungs.length; i++) {
      const rung = this.rungs[i];
      for (const el of rung.elements) {
        if (el.type === "coil") {
          if (results[i]) {
            if (el.addr.startsWith("Y")) newOutputs[el.addr] = true;
            else if (el.addr.startsWith("C")) newInternals[el.addr] = true;
          }
        }
      }
    }
    // Apply: coils that were set stay set, others reset
    for (let i = 0; i <= 15; i++) {
      const y = "Y" + i, c = "C" + i;
      this.outputs[y] = !!newOutputs[y];
      this.internals[c] = !!newInternals[c];
    }
  },

  // Start/stop PLC
  start() {
    if (this.running) return;
    this.running = true;
    this.timer = setInterval(() => this.scan(), this.scanRate);
  },
  stop() {
    this.running = false;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    // Reset outputs
    for (let i = 0; i <= 15; i++) this.outputs["Y" + i] = false;
  },

  // Render PLC UI
  render() {
    const c = document.getElementById("content");
    if (!c) return;
    c.innerHTML =
      '<div class="plc-header">' +
        '<h1 class="page-title">PLC Simülatörü</h1>' +
        '<p class="page-sub">Merdiven (Ladder) mantığı ile PLC programlama ve simülasyon</p>' +
        '<div class="plc-controls">' +
          '<button class="plc-btn ' + (this.running ? 'running' : '') + '" id="plc-run">' +
            (this.running ? '⏹ Durdur' : '▶ Çalıştır') +
          '</button>' +
          '<button class="plc-btn" id="plc-reset">↺ Sıfırla</button>' +
          '<span class="plc-status">' + (this.running ? '● ÇALIŞIYOR' : '○ DURDU') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="plc-body">' +
        '<section class="plc-ladder" id="plc-ladder"></section>' +
        '<aside class="plc-io">' +
          '<div class="plc-panel">' +
            '<h3>Girişler (Inputs)</h3>' +
            '<div class="plc-io-grid" id="plc-inputs"></div>' +
          '</div>' +
          '<div class="plc-panel">' +
            '<h3>Çıkışlar (Outputs)</h3>' +
            '<div class="plc-io-grid" id="plc-outputs"></div>' +
          '</div>' +
          '<div class="plc-panel">' +
            '<h3>İç Röleler</h3>' +
            '<div class="plc-io-grid" id="plc-internals"></div>' +
          '</div>' +
        '</aside>' +
      '</div>';

    this.renderLadder();
    this.renderIO();
    this.bindEvents();
  },

  renderLadder() {
    const el = document.getElementById("plc-ladder");
    if (!el) return;
    let html = '<div class="ladder-frame">';
    // Power rails
    html += '<div class="ladder-rail left"></div>';
    html += '<div class="ladder-rail right"></div>';

    for (let ri = 0; ri < this.rungs.length; ri++) {
      const rung = this.rungs[ri];
      html += '<div class="ladder-rung" data-rung="' + ri + '">';
      html += '<span class="rung-num">' + (ri + 1) + '</span>';

      for (const el of rung.elements) {
        if (el.type === "contact") {
          const active = this.isContactActive(el);
          html += '<div class="ladder-el contact ' + (active ? 'active' : '') + ' ' + (el.nc ? 'nc' : '') + '">' +
            '<span class="contact-bars">' + (el.nc ? '/' : '|') + '</span>' +
            '<span class="el-addr">' + el.addr + '</span>' +
            (el.label ? '<span class="el-label">' + el.label + '</span>' : '') +
            '</div>';
          html += '<div class="ladder-wire"></div>';
        } else if (el.type === "coil") {
          const active = this.outputs[el.addr] || this.internals[el.addr];
          html += '<div class="ladder-el coil ' + (active ? 'active' : '') + '">' +
            '<span class="coil-parens">( )</span>' +
            '<span class="el-addr">' + el.addr + '</span>' +
            (el.label ? '<span class="el-label">' + el.label + '</span>' : '') +
            '</div>';
        }
      }
      html += '</div>';
    }
    html += '</div>';
    el.innerHTML = html;
  },

  isContactActive(el) {
    let val;
    if (el.addr.startsWith("X")) val = this.inputs[el.addr];
    else if (el.addr.startsWith("Y")) val = this.outputs[el.addr];
    else if (el.addr.startsWith("C")) val = this.internals[el.addr];
    else val = false;
    return el.nc ? !val : val;
  },

  renderIO() {
    const inputsEl = document.getElementById("plc-inputs");
    const outputsEl = document.getElementById("plc-outputs");
    const internalsEl = document.getElementById("plc-internals");
    if (!inputsEl || !outputsEl || !internalsEl) return;

    let inpHtml = '', outHtml = '', intHtml = '';
    for (let i = 0; i <= 7; i++) {
      const x = "X" + i, y = "Y" + i, c = "C" + i;
      inpHtml += '<button class="plc-io-btn ' + (this.inputs[x] ? 'on' : '') + '" data-addr="' + x + '">' +
        '<span class="io-led"></span>' + x + '</button>';
      outHtml += '<div class="plc-io-btn ' + (this.outputs[y] ? 'on' : '') + ' readonly">' +
        '<span class="io-led"></span>' + y + '</div>';
      intHtml += '<div class="plc-io-btn ' + (this.internals[c] ? 'on' : '') + ' readonly">' +
        '<span class="io-led"></span>' + c + '</div>';
    }
    inputsEl.innerHTML = inpHtml;
    outputsEl.innerHTML = outHtml;
    internalsEl.innerHTML = intHtml;
  },

  bindEvents() {
    const runBtn = document.getElementById("plc-run");
    const resetBtn = document.getElementById("plc-reset");
    if (runBtn) runBtn.onclick = () => {
      if (this.running) this.stop(); else this.start();
      this.render();
    };
    if (resetBtn) resetBtn.onclick = () => {
      this.stop();
      for (let i = 0; i <= 15; i++) {
        this.inputs["X" + i] = false;
        this.outputs["Y" + i] = false;
        this.internals["C" + i] = false;
      }
      this.render();
    };
    // Input buttons
    document.querySelectorAll('.plc-io-btn[data-addr]').forEach(btn => {
      btn.onmousedown = () => { this.toggleInput(btn.dataset.addr); this.renderLadder(); this.renderIO(); };
      btn.onmouseup = () => { /* momentary - release */ };
    });
    // Also support hold for momentary buttons
    document.querySelectorAll('.plc-io-btn[data-addr]').forEach(btn => {
      btn.onmousedown = () => { this.setInput(btn.dataset.addr, true); this.renderLadder(); this.renderIO(); };
      btn.onmouseup = () => { this.setInput(btn.dataset.addr, false); this.renderLadder(); this.renderIO(); };
      btn.onmouseleave = () => { if (this.inputs[btn.dataset.addr]) { this.setInput(btn.dataset.addr, false); this.renderLadder(); this.renderIO(); } };
    });
  }
};

// Initialize on load
PLC.init();
