/* =========================================================================
   Elektronik Akademi — Uygulama Motoru
   Navigasyon, ilerleme takibi, quiz, setler, araçlar, sözlük.
   ========================================================================= */

const CURRICULUM = [...MODULES_PART1, ...MODULES_PART2];
const LESSON_INDEX = {};
CURRICULUM.forEach(m => m.lessons.forEach(l => { LESSON_INDEX[l.id] = { mod: m, lesson: l }; }));
const MODULE_BY_ID = {}; CURRICULUM.forEach(m => MODULE_BY_ID[m.id] = m);

/* Derslere hangi şekiller eklenecek (figures.js içindeki anahtarlar) */
const LESSON_FIGS = {
  m1l1: ["resistor", "potentiometer"], m1l2: ["capacitor"], m1l3: ["inductor", "lcFilter"],
  m1l4: ["diode", "led", "bridge", "rectwave", "fullwave"],
  m1l5: ["zener", "zenerReg"], m1l6: ["transformer", "crystal"], m1l7: ["bjt", "transistorSwitch", "darlington"],
  m1l8: ["mosfet", "mosfetSwitch"], m1l9: ["relay", "switches"],
  m1l10: ["opamp", "opampNon", "opampInv", "schmitt"],
  m1l11: ["logic", "mcu", "ne555astable", "powerSyms", "resetCircuit", "crystalCircuit", "sevenseg"],
  m2l1: ["seriesparalel"], m2l2: ["wheatstone"], m2l3: ["divider"], m2l4: ["rc"],
  m3l1: ["bridge", "rectwave", "fullwave"], m3l3: ["reg7805", "linearReg"], m3l4: ["smps"], m3l5: ["smps", "voltDoubler"], m3l6: ["mosfet"],
  m4l1: ["inductor", "capacitor"], m4l4: ["buck", "boost", "buckboost"], m4l5: ["smps"], m4l6: ["optocoupler"],
  m5l1: ["transformer", "flyback"], m5l2: ["bridge", "hbridge", "halfBridge"], m5l3: ["thyristors"], m5l4: ["mosfet"],
  m6l2: ["inverter"],
  m10l2: ["buck"], m11l2: ["diode", "bjt", "mosfet"], m11l3: ["capacitor"], m12l1: ["mcu", "fuse", "battery", "packages"],
  m13l1: [], m13l2: ["i2cPullup"], m13l3: [], m13l4: ["levelShifter"],
  m14l1: ["opamp", "opampNon", "opampInv", "opampIntegrator"], m14l2: ["lcFilter", "sallenkey"],
  m14l3: ["sensors", "wheatstone"], m14l4: ["tl431ref", "currentSource"]
};

/* Çizimlere ek olarak gösterilecek gerçek parça fotoğrafları (photos.js) */
const FIG_PHOTO = {
  resistor: ["resistor"], capacitor: ["capacitor", "elec-cap"], inductor: ["inductor"], transformer: ["transformer"],
  diode: ["diode", "schottky"], zener: ["zener"], led: ["led"], bjt: ["bjt"], mosfet: ["mosfet"], relay: ["relaymod"],
  opamp: ["opamp", "lm358"], opampNon: ["opamp", "lm358"], opampInv: ["opamp", "lm358"],
  opampIntegrator: ["opamp", "lm358"], sallenkey: ["opamp"], schmitt: ["ne555", "opamp"],
  reg7805: ["reg7805", "lm317"], linearReg: ["reg7805", "lm317"], mcu: ["mcu", "arduino"],
  bridge: ["bridge"], fullwave: ["bridge"], potentiometer: ["pot", "trim-pot"], crystal: ["crystal"],
  switches: ["switch", "pushbutton", "dip-switch"], fuse: ["fuse"], battery: ["battery"],
  thyristors: ["scr"], sensors: ["thermistor", "varistor"],
  optocoupler: ["optocoupler"], darlington: ["bjt", "uln2003"], currentSource: ["bjt"],
  tl431ref: ["tl431"], sevenseg: ["sevenseg"], i2cPullup: ["resistor"], levelShifter: ["mosfet"],
  halfBridge: ["mosfet"], hbridge: ["mosfet", "motor"], inverter: ["mosfet"],
  buck: ["buckmodule"], boost: ["boostmodule"], buckboost: ["buckmodule", "boostmodule"],
  smps: ["transformer"], flyback: ["transformer"], transistorSwitch: ["bjt"], mosfetSwitch: ["mosfet"],
  logic: ["ic-dip"], ne555astable: ["ne555"], crystalCircuit: ["crystal"], rc: ["capacitor"],
  divider: ["resistor"], lcFilter: ["inductor"], voltDoubler: ["diode"], zenerReg: ["zener"],
  seriesparalel: ["resistor", "capacitor"], rectwave: ["opamp"], wheatstone: ["resistor"],
  resetCircuit: ["capacitor", "ne555"]
};

function photoStrip(keys) {
  if (typeof PHOTOS === "undefined" || !keys) return "";
  return keys.filter(k => PHOTOS[k]).map(k =>
    `<figure class="photo-mini"><img src="${PHOTOS[k].f}" alt="${PHOTOS[k].t}" loading="lazy"><figcaption>${PHOTOS[k].t}<span class="lic">${PHOTOS[k].lic}</span></figcaption></figure>`
  ).join("");
}

function figuresHTML(ids) {
  if (typeof FIG === "undefined" || !ids || !ids.length) return "";
  return ids.map(id => {
    const f = FIG[id]; if (!f) return "";
    const pkeys = FIG_PHOTO[id] || (typeof PHOTOS !== "undefined" && PHOTOS[id] ? [id] : []);
    const ph = photoStrip(pkeys);
    return `<figure class="fig">${f.g}${ph ? `<div class="photo-strip">${ph}</div>` : ""}<figcaption><b>${f.t}</b>${f.cat ? `<span class="fig-cat">${f.cat}</span>` : ""}</figcaption></figure>`;
  }).join("");
}

const STORE_KEY = "elektronik_akademi_v1";
let STATE = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { done: [], quiz: {}, lastLesson: null, theme: "dark" };
}
function saveState() { try { localStorage.setItem(STORE_KEY, JSON.stringify(STATE)); } catch (e) {} }

function isDone(id) { return STATE.done.includes(id); }
function totalLessons() { return CURRICULUM.reduce((n, m) => n + m.lessons.length, 0); }
function doneCount() { return STATE.done.length; }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

/* ------------------------------ SIDEBAR ------------------------------ */
function buildSidebar() {
  const nav = document.getElementById("sidebar-nav");
  nav.innerHTML = CURRICULUM.map(m => {
    const done = m.lessons.filter(l => isDone(l.id)).length;
    const pct = Math.round(done / m.lessons.length * 100);
    return `
      <div class="nav-group">
        <button class="nav-mod" data-mod="${m.id}">
          <span class="nav-ico">${m.icon}</span>
          <span class="nav-txt">${esc(m.title)}</span>
          <span class="nav-badge">${done}/${m.lessons.length}</span>
        </button>
        <div class="nav-sub" id="sub-${m.id}">
          ${m.lessons.map(l => `<button class="nav-lesson ${isDone(l.id) ? "done" : ""}" data-lesson="${l.id}">
             <span class="dot"></span>${esc(l.title)}</button>`).join("")}
        </div>
      </div>`;
  }).join("");
}

function progressRing() {
  const pct = totalLessons() ? Math.round(doneCount() / totalLessons() * 100) : 0;
  const r = 34, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return `<svg class="ring" width="90" height="90" viewBox="0 0 90 90">
    <circle cx="45" cy="45" r="${r}" stroke-width="8" fill="none" class="ring-bg"/>
    <circle cx="45" cy="45" r="${r}" stroke-width="8" fill="none" class="ring-fg"
      stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 45 45)"/>
    <text x="45" y="50" text-anchor="middle" class="ring-txt">${pct}%</text>
  </svg>`;
}

/* ------------------------------- VIEWS ------------------------------- */
function setActiveNav(kind, id) {
  document.querySelectorAll(".nav-mod").forEach(b => b.classList.toggle("active", kind === "mod" && b.dataset.mod === id));
  document.querySelectorAll(".nav-lesson").forEach(b => b.classList.toggle("active", kind === "lesson" && b.dataset.lesson === id));
  document.querySelectorAll(".top-nav button").forEach(b => b.classList.toggle("active", b.dataset.view === kind));
}

function viewHome() {
  setActiveNav("home");
  const last = STATE.lastLesson && LESSON_INDEX[STATE.lastLesson];
  const c = document.getElementById("content");
  c.innerHTML = `
    <section class="hero">
      <div class="hero-txt">
        <span class="pill">Sıfırdan Profesyonel Elektronik</span>
        <h1>Elektronik Akademi</h1>
        <p>Devre kartı odaklı, 7 set ve ${CURRICULUM.length} modül içeren kapsamlı eğitim platformu. Teori, ölçüm, güç elektroniği, arıza bulma ve osiloskop — hepsi bir arada.</p>
        <div class="hero-actions">
          ${last ? `<button class="btn primary" data-open-lesson="${last.lesson.id}">▶ Kaldığın yerden: ${esc(last.lesson.title)}</button>` : `<button class="btn primary" data-open-lesson="${CURRICULUM[0].lessons[0].id}">▶ Başla</button>`}
          <button class="btn" data-view="sets">📦 Eğitim Setleri</button>
          <button class="btn" data-view="tools">🧮 Araçlar</button>
        </div>
      </div>
      <div class="hero-ring">${progressRing()}
        <div class="ring-label">${doneCount()} / ${totalLessons()} ders</div>
      </div>
    </section>

    <section class="stats-row">
      <div class="stat"><b>${CURRICULUM.length}</b><span>Modül</span></div>
      <div class="stat"><b>${totalLessons()}</b><span>Ders</span></div>
      <div class="stat"><b>${CURRICULUM.reduce((n, m) => n + m.lessons.reduce((s, l) => s + (l.quiz ? l.quiz.length : 0), 0), 0)}</b><span>Test Sorusu</span></div>
      <div class="stat"><b>${GLOSSARY.length}</b><span>Sözlük Terimi</span></div>
      <div class="stat"><b>${TOOL_META.length}</b><span>Hesaplayıcı</span></div>
      <div class="stat"><b>${typeof FIG !== "undefined" ? Object.keys(FIG).length : 0}</b><span>Şekil / Diyagram</span></div>
      <div class="stat"><b>${typeof PHOTOS !== "undefined" ? Object.keys(PHOTOS).length : 0}</b><span>Parça Fotoğrafı</span></div>
    </section>

    <h2 class="sec-title">Öğrenme Yolu</h2>
    <div class="path">
      ${SETS.filter(s => !s.isPackage).map(s => `
        <div class="path-card" style="--c:${s.color}">
          <div class="path-head"><span class="path-lvl" style="background:${s.color}">${s.level}</span></div>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.desc)}</p>
          <div class="path-foot">
            <span>${s.modules.map(id => MODULE_BY_ID[id]).filter(Boolean).reduce((n, m) => n + m.lessons.length, 0)} ders</span>
            <button class="btn tiny" data-open-mod="${s.modules[0]}">Aç →</button>
          </div>
        </div>`).join("")}
    </div>

    <h2 class="sec-title">Modüller</h2>
    <div class="mod-grid">
      ${CURRICULUM.map(m => {
        const done = m.lessons.filter(l => isDone(l.id)).length;
        const pct = Math.round(done / m.lessons.length * 100);
        const set = SETS.find(s => s.id === m.set);
        return `<div class="mod-card" data-open-mod="${m.id}">
          <div class="mod-ico" style="color:${set ? set.color : "#e0342c"}">${m.icon}</div>
          <h4>${esc(m.title)}</h4>
          <p>${esc(m.desc)}</p>
          <div class="mod-bar"><i style="width:${pct}%;background:${set ? set.color : "#e0342c"}"></i></div>
          <small>${done}/${m.lessons.length} ders</small>
        </div>`;
      }).join("")}
    </div>`;
}

function viewSets() {
  setActiveNav("sets");
  const c = document.getElementById("content");
  c.innerHTML = `
    <h1 class="page-title">Eğitim Setleri</h1>
    <p class="page-sub">Paketler birbirini tamamlar. Tek tek veya komple paket halinde öğren.</p>
    <div class="sets-grid">
      ${SETS.filter(s => !s.isPackage).map(s => `
        <div class="set-card" style="--c:${s.color}">
          <div class="set-top" style="background:${s.color}"><h3>${esc(s.title)}</h3>
            <span class="set-lvl">${s.level}</span></div>
          <div class="set-body">
            <p>${esc(s.desc)}</p>
            <div class="set-meta">${s.videos ? `<span>🎬 ${s.videos} video</span>` : ""}<span>⏱ ${s.duration}</span><span>💾 ${s.size}</span></div>
            <div class="chips">${s.topics.slice(0, 10).map(t => `<span class="chip">${esc(t)}</span>`).join("")}${s.topics.length > 10 ? `<span class="chip more">+${s.topics.length - 10}</span>` : ""}</div>
            <div class="set-actions">${s.modules.map(id => `<button class="btn primary" data-open-mod="${id}">${esc(MODULE_BY_ID[id] ? MODULE_BY_ID[id].title : id)} →</button>`).join("")}</div>
          </div>
        </div>`).join("")}
    </div>

    <h2 class="sec-title">Paketler</h2>
    <div class="sets-grid">
      ${SETS.filter(s => s.isPackage).map(s => `
        <div class="set-card pkg" style="--c:${s.color}">
          <div class="set-top" style="background:${s.color}"><h3>⭐ ${esc(s.title)}</h3><span class="set-lvl">${s.level}</span></div>
          <div class="set-body">
            <p>${esc(s.desc)}</p>
            <div class="set-meta"><span>🎬 ${s.videos} video</span><span>⏱ ${s.duration}</span><span>💾 ${s.size}</span></div>
            <div class="chips">${s.includes.map(id => { const x = SETS.find(z => z.id === id); return x ? `<span class="chip">${esc(x.title)}</span>` : ""; }).join("")}</div>
            <div class="set-actions">${s.includes.map(id => { const x = SETS.find(z => z.id === id); return x ? x.modules.map(m => `<button class="btn tiny" data-open-mod="${m}">${esc(MODULE_BY_ID[m].title)}</button>`).join("") : ""; }).join("")}</div>
          </div>
        </div>`).join("")}
    </div>`;
}

function viewModule(modId) {
  const m = MODULE_BY_ID[modId]; if (!m) return viewHome();
  setActiveNav("mod", modId);
  const set = SETS.find(s => s.id === m.set);
  const done = m.lessons.filter(l => isDone(l.id)).length;
  document.getElementById("content").innerHTML = `
    <div class="crumb"><button data-view="home">Ana Sayfa</button> / <span>${esc(m.title)}</span></div>
    <div class="module-head" style="--c:${set ? set.color : "#e0342c"}">
      <div class="module-ico">${m.icon}</div>
      <div><h1>${esc(m.title)}</h1><p>${esc(m.desc)}</p>
        <div class="mod-progress">${set ? `<span class="pill" style="background:${set.color}">${esc(set.title)}</span>` : ""} <b>${done}/${m.lessons.length}</b> ders tamam</div>
      </div>
    </div>
    <div class="lesson-list">
      ${m.lessons.map((l, i) => `
        <button class="lesson-row ${isDone(l.id) ? "done" : ""}" data-open-lesson="${l.id}">
          <span class="lr-num">${isDone(l.id) ? "✓" : i + 1}</span>
          <span class="lr-body"><b>${esc(l.title)}</b><small>${esc(l.video || "")} ${l.quiz ? "· " + l.quiz.length + " soru" : ""}</small></span>
          <span class="lr-go">→</span>
        </button>`).join("")}
    </div>`;
}

function viewLesson(lessonId) {
  const entry = LESSON_INDEX[lessonId]; if (!entry) return viewHome();
  const { mod, lesson } = entry;
  STATE.lastLesson = lessonId; saveState();
  if (typeof AIstate !== "undefined") AIstate.context = mod.title + " — " + lesson.title;
  setActiveNav("lesson", lessonId);
  const idx = mod.lessons.indexOf(lesson);
  const next = mod.lessons[idx + 1];
  const prev = mod.lessons[idx - 1];
  const set = SETS.find(s => s.id === mod.set);

  const c = document.getElementById("content");
  c.innerHTML = `
    <div class="crumb"><button data-view="home">Ana Sayfa</button> / <button data-open-mod="${mod.id}">${esc(mod.title)}</button> / <span>${esc(lesson.title)}</span></div>
    <article class="lesson">
      <div class="lesson-head">
        ${set ? `<span class="pill" style="background:${set.color}">${esc(set.title)}</span>` : ""}
        ${lesson.video ? `<span class="pill ghost">${esc(lesson.video)}</span>` : ""}
        <button class="pill" id="ask-ai" style="cursor:pointer;background:linear-gradient(135deg,#3a7bd5,#2cc6a0);border-color:transparent;color:#fff">🤖 Bu dersi AI Hoca'ya sor</button>
      </div>
      <h1>${esc(lesson.title)}</h1>
      <div class="lesson-content">${lesson.content}</div>

      ${figuresHTML(LESSON_FIGS[lesson.id])}

      <div class="keybox">
        <h3>🔑 Önemli Noktalar</h3>
        <ul>${lesson.key.map(k => `<li>${esc(k)}</li>`).join("")}</ul>
      </div>

      ${lesson.quiz && lesson.quiz.length ? `<div class="quizbox" id="quiz"></div>` : ""}

      <div class="lesson-nav">
        ${prev ? `<button class="btn" data-open-lesson="${prev.id}">← ${esc(prev.title)}</button>` : `<span></span>`}
        <button class="btn ${isDone(lesson.id) ? "" : "primary"}" id="mark-done">${isDone(lesson.id) ? "✓ Tamamlandı" : "Dersi Tamamla"}</button>
        ${next ? `<button class="btn" data-open-lesson="${next.id}">${esc(next.title)} →</button>` : `<button class="btn" data-view="home">Ana Sayfa →</button>`}
      </div>
    </article>`;

  document.getElementById("mark-done").onclick = () => {
    if (!isDone(lesson.id)) { STATE.done.push(lesson.id); saveState(); buildSidebar(); }
    toast("Ders tamamlandı ✓");
    viewLesson(lessonId);
  };

  const askBtn = document.getElementById("ask-ai");
  if (askBtn) askBtn.onclick = () => {
    if (typeof AIstate !== "undefined") AIstate.context = mod.title + " — " + lesson.title;
    go("ai");
    setTimeout(() => {
      if (typeof sendAI === "function") sendAI(`"${lesson.title}" konusunu bana basit ve örneklerle anlatır mısın? Ayrıca bu konuda sahadaki önemli ölçüm/teşhis ipuçlarını ver.`);
    }, 60);
  };

  if (lesson.quiz && lesson.quiz.length) renderQuiz(lesson);
  window.scrollTo({ top: 0 });
}

function renderQuiz(lesson) {
  const box = document.getElementById("quiz"); if (!box) return;
  const stored = STATE.quiz[lesson.id] || {};
  box.innerHTML = `
    <h3>📝 Mini Test</h3>
    ${lesson.quiz.map((q, qi) => `
      <div class="q" data-q="${qi}">
        <p class="q-text">${qi + 1}. ${esc(q.q)}</p>
        <div class="q-opts">
          ${q.o.map((oo, oi) => `<button class="opt" data-q="${qi}" data-o="${oi}">${esc(oo)}</button>`).join("")}
        </div>
        <div class="q-exp" id="exp-${qi}"></div>
      </div>`).join("")}
    <div class="quiz-score" id="quiz-score"></div>`;

  lesson.quiz.forEach((q, qi) => {
    const exp = document.getElementById("exp-" + qi);
    if (stored[qi] != null) {
      markQuiz(box, qi, q, stored[qi]);
    }
    box.querySelectorAll(`.opt[data-q="${qi}"]`).forEach(btn => {
      btn.onclick = () => {
        const chosen = +btn.dataset.o;
        if (STATE.quiz[lesson.id] && STATE.quiz[lesson.id][qi] != null) return;
        STATE.quiz[lesson.id] = STATE.quiz[lesson.id] || {};
        STATE.quiz[lesson.id][qi] = chosen;
        saveState();
        markQuiz(box, qi, q, chosen);
        updateScore(lesson);
      };
    });
  });
  updateScore(lesson);
}

function markQuiz(box, qi, q, chosen) {
  box.querySelectorAll(`.opt[data-q="${qi}"]`).forEach((b, oi) => {
    b.classList.remove("correct", "wrong");
    if (oi === q.a) b.classList.add("correct");
    if (oi === chosen && chosen !== q.a) b.classList.add("wrong");
    b.disabled = true;
  });
  const exp = document.getElementById("exp-" + qi);
  if (exp) exp.innerHTML = `${chosen === q.a ? "✅ Doğru! " : "❌ Yanlış. "} ${esc(q.e)}`;
}

function updateScore(lesson) {
  const s = STATE.quiz[lesson.id] || {};
  const answered = Object.keys(s).length;
  const correct = lesson.quiz.reduce((n, q, i) => n + (s[i] === q.a ? 1 : 0), 0);
  const box = document.getElementById("quiz-score");
  if (box) {
    box.innerHTML = answered ? `Skor: <b>${correct}/${lesson.quiz.length}</b> doğru (${answered} cevaplandı)` : "";
    if (answered === lesson.quiz.length && correct === lesson.quiz.length) {
      box.innerHTML += ` &nbsp;🎉 Tam puan!`;
    }
  }
}

function viewTools() {
  setActiveNav("tools");
  const c = document.getElementById("content");
  c.innerHTML = `
    <h1 class="page-title">Araçlar & Hesaplayıcılar</h1>
    <p class="page-sub">Sahada hızlı hesaplama için 8 pratik araç.</p>
    <div class="tools-wrap">
      <div class="tools-list">
        ${TOOL_META.map((t, i) => `<button class="tool-item ${i === 0 ? "active" : ""}" data-tool="${t.id}">
          <span class="tool-ico">${t.icon}</span>
          <span><b>${esc(t.name)}</b><small>${esc(t.desc)}</small></span>
        </button>`).join("")}
      </div>
      <div class="tool-panel" id="tool-panel"></div>
    </div>`;
  const open = (id) => {
    c.querySelectorAll(".tool-item").forEach(b => b.classList.toggle("active", b.dataset.tool === id));
    renderTool(id, document.getElementById("tool-panel"));
  };
  c.querySelectorAll(".tool-item").forEach(b => b.onclick = () => open(b.dataset.tool));
  open(TOOL_META[0].id);
}

function viewFigures() {
  setActiveNav("figs");
  const c = document.getElementById("content");
  if (typeof FIG === "undefined") { c.innerHTML = `<p class="page-sub">Şekiller yüklenemedi.</p>`; return; }
  const cats = (typeof FIG_CATS !== "undefined") ? FIG_CATS : [];
  const ids = Object.keys(FIG);
  const inCats = new Set();
  const cardHTML = (k) => figuresHTML([k]);

  let photosHTML = "";
  if (typeof PHOTOS !== "undefined" && typeof PHOTO_GROUPS !== "undefined") {
    photosHTML = `
      <h2 class="sec-title">📷 Gerçek Parça Fotoğrafları <small style="color:var(--muted);font-weight:400">(${Object.keys(PHOTOS).length} parça · Wikimedia Commons, telifsiz)</small></h2>
      <p class="page-sub">Parçaların birebir gerçek görüntüsü. Lisans her kartta belirtilmiştir.</p>
      ${PHOTO_GROUPS.map(g => !g.keys.length ? "" : `<h3 class="grp-title">${g.name}</h3>
        <div class="photo-grid">${g.keys.filter(k => PHOTOS[k]).map(k => `
          <figure class="photo-card"><img src="${PHOTOS[k].f}" alt="${PHOTOS[k].t}" loading="lazy">
          <figcaption><b>${PHOTOS[k].t}</b><span class="lic">${PHOTOS[k].lic}</span></figcaption></figure>`).join("")}</div>`).join("")}
      <h2 class="sec-title">✏️ Sembol, Pinout & Şemalar</h2>`;
  }

  c.innerHTML = `
    <h1 class="page-title">Şekiller & Parça Fotoğrafları</h1>
    <p class="page-sub">Gerçek parça fotoğrafları + semboller, pinout diyagramları ve blok şemalar. Derslerde de otomatik görünür.</p>
    ${photosHTML}
    ${cats.map(cat => {
      const items = ids.filter(k => FIG[k].cat === cat);
      if (!items.length) return "";
      items.forEach(k => inCats.add(k));
      return `<h2 class="sec-title">${cat}</h2><div class="fig-grid">${items.map(cardHTML).join("")}</div>`;
    }).join("")}
    ${ids.filter(k => !inCats.has(k)).length ? `<h2 class="sec-title">Diğer</h2><div class="fig-grid">${ids.filter(k => !inCats.has(k)).map(cardHTML).join("")}</div>` : ""}
  `;
}

function viewGlossary() {
  setActiveNav("glossary");
  const c = document.getElementById("content");
  c.innerHTML = `
    <h1 class="page-title">Sözlük</h1>
    <p class="page-sub">${GLOSSARY.length} terim. İngilizce olmak zorunda olan terimler (MOSFET, PWM, duty cycle…) burada Türkçe açıklanmıştır. Ara veya göz at.</p>
    <input class="search-input" id="g-search" placeholder="🔎 Terim ara...">
    <div class="gloss-grid" id="gloss-grid"></div>`;
  const render = (q) => {
    q = (q || "").toLowerCase();
    const list = GLOSSARY.filter(g => g.t.toLowerCase().includes(q) || g.d.toLowerCase().includes(q));
    document.getElementById("gloss-grid").innerHTML = list.length
      ? list.map(g => `<div class="gloss-card"><b>${esc(g.t)}</b><p>${esc(g.d)}</p></div>`).join("")
      : `<p class="page-sub">Sonuç yok.</p>`;
  };
  document.getElementById("g-search").oninput = e => render(e.target.value);
  render("");
}

/* ------------------------------- TOAST ------------------------------- */
let toastTimer;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

/* ------------------------------ ROUTER ------------------------------- */
function route() {
  const h = location.hash.replace(/^#/, "");
  if (h.startsWith("lesson/")) viewLesson(h.slice(7));
  else if (h.startsWith("mod/")) viewModule(h.slice(4));
  else if (h === "sets") viewSets();
  else if (h === "tools") viewTools();
  else if (h === "glossary") viewGlossary();
  else if (h === "figs") viewFigures();
  else if (h === "sim" || h.startsWith("sim/")) { if (typeof viewSim === "function") viewSim(); else viewHome(); }
  else if (h === "ai") { if (typeof viewAI === "function") viewAI(); else viewHome(); }
  else viewHome();
}

function go(hash) { location.hash = hash; }

/* ------------------------------ INIT --------------------------------- */
function init() {
  buildSidebar();
  document.querySelectorAll(".top-nav button").forEach(b => b.onclick = () => go(b.dataset.view === "home" ? "" : b.dataset.view));
  document.getElementById("content").addEventListener("click", e => {
    const t = e.target.closest("[data-open-lesson],[data-open-mod],[data-view]");
    if (!t) return;
    if (t.dataset.openLesson) go("lesson/" + t.dataset.openLesson);
    else if (t.dataset.openMod) go("mod/" + t.dataset.openMod);
    else if (t.dataset.view) go(t.dataset.view === "home" ? "" : t.dataset.view);
  });
  document.getElementById("sidebar-nav").addEventListener("click", e => {
    const ml = e.target.closest("[data-lesson]");
    const mm = e.target.closest("[data-mod]");
    if (ml) { go("lesson/" + ml.dataset.lesson); }
    else if (mm) {
      const sub = document.getElementById("sub-" + mm.dataset.mod);
      if (sub) sub.classList.toggle("open");
      go("mod/" + mm.dataset.mod);
    }
  });
  document.getElementById("brand").onclick = () => go("");
  document.getElementById("menu-toggle").onclick = () => document.body.classList.toggle("nav-open");
  document.getElementById("reset-btn").onclick = () => {
    if (confirm("Tüm ilerleme ve test sonuçları silinsin mi?")) {
      STATE = { done: [], quiz: {}, lastLesson: null, theme: "dark" };
      saveState(); buildSidebar(); route(); toast("İlerleme sıfırlandı");
    }
  };
  window.addEventListener("hashchange", route);
  route();
}
document.addEventListener("DOMContentLoaded", init);
