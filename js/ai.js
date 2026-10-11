/* =========================================================================
   Elektronik Akademi — AI Hoca (Yerel Ollama + OpenAI-uyumlu API)
   Ayarlar: sağ üstteki ⚙️ AI Ayarları
   ========================================================================= */

const AI_KEY = "elektronik_akademi_ai_v1";

/* Sağlayıcı ön ayarları. Cloud sağlayıcılar için API anahtarı gerekir. */
const AI_PRESETS = {
  ollama:   { label: "Ollama (Yerel)",        kind: "ollama", base: "http://localhost:11434", model: "qwen2.5:7b" },
  openai:   { label: "OpenAI",                kind: "openai", base: "https://api.openai.com/v1", model: "gpt-4o-mini" },
  deepseek: { label: "DeepSeek",              kind: "openai", base: "https://api.deepseek.com/v1", model: "deepseek-chat" },
  openrouter:{label: "OpenRouter",            kind: "openai", base: "https://openrouter.ai/api/v1", model: "qwen/qwen-2.5-72b-instruct" },
  custom:   { label: "Özel (OpenAI-uyumlu)",  kind: "openai", base: "", model: "" }
};

const OLLAMA_MODELS = [
  { id: "qwen2.5:7b",   note: "⭐ Türkçe + teknik denge — önerilen" },
  { id: "qwen2.5:14b",  note: "Daha güçlü (16GB+ RAM/VRAM önerilir)" },
  { id: "llama3.1:8b",  note: "Genel amaçlı, sağlam" },
  { id: "gemma2:9b",    note: "Kaliteli yanıtlar" },
  { id: "mistral:7b",   note: "Hızlı ve hafif" },
  { id: "llama3.2:3b",  note: "Düşük donanım için" },
  { id: "aya-expanse:8b", note: "Çok dilli — Türkçe güçlü" },
  { id: "deepseek-r1:8b", note: "Akıl yürütme odaklı" }
];

const DEFAULT_SYSTEM =
  "Sen 'AI Hoca' adlı, elektronik ve devre kartı tamiri konusunda uzman, sabırlı bir öğretmensin. " +
  "Türkçe yanıt ver. Karmaşık konuları benzetme ve örneklerle basitçe anlat. " +
  "Ölçüm/teşhis içeren sorularda güvenlik uyarısı ekle. Gerekirse madde madde, formül ve pratik ipuçları ver. " +
  "Emin olmadığın teknik detaylarda 'yaklaşık' de ve ölçümle doğrulamayı öner.";

const AIstate = { history: [], busy: false, healthy: null, models: [] };

function loadAIConf() {
  try { const r = localStorage.getItem(AI_KEY); if (r) return Object.assign(defaultAIConf(), JSON.parse(r)); } catch (e) {}
  return defaultAIConf();
}
function defaultAIConf() {
  return { provider: "ollama", ollamaUrl: "http://localhost:11434", model: "qwen2.5:7b",
           apiBase: "https://api.openai.com/v1", apiKey: "", temperature: 0.6, system: DEFAULT_SYSTEM, manual: false };
}
function saveAIConf() { try { localStorage.setItem(AI_KEY, JSON.stringify(AIconf)); } catch (e) {} }
let AIconf = loadAIConf();

function escHtml(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function mdToHtml(s){
  let h = escHtml(s);
  h = h.replace(/```([\s\S]*?)```/g, (m, c) => `<pre>${c.replace(/^\n/,"")}</pre>`);
  h = h.replace(/`([^`]+)`/g, "<code>$1</code>");
  h = h.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  return h;
}

/* --------------------------- Sağlayıcı çağrıları --------------------- */
async function aiListModels() {
  const url = (AIconf.ollamaUrl || "http://localhost:11434").replace(/\/$/, "") + "/api/tags";
  const r = await fetch(url);
  if (!r.ok) throw new Error("HTTP " + r.status);
  const j = await r.json();
  return (j.models || []).map(m => m.name);
}

async function aiChat(messages, onDelta) {
  const prov = AI_PRESETS[AIconf.provider] || AI_PRESETS.ollama;
  if (prov.kind === "ollama") return ollamaChat(messages, onDelta);
  return openaiChat(messages, onDelta);
}

async function ollamaChat(messages, onDelta) {
  const base = (AIconf.ollamaUrl || "http://localhost:11434").replace(/\/$/, "");
  const body = { model: AIconf.model || "qwen2.5:7b", messages, stream: true,
                 options: { temperature: AIconf.temperature } };
  const r = await fetch(base + "/api/chat", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
  });
  if (!r.ok) {
    let t = ""; try { t = await r.text(); } catch (e) {}
    let m = "HTTP " + r.status;
    try { const j = JSON.parse(t); if (j && j.error) m = j.error; } catch (e) {}
    if (r.status === 403) m = "CORS engeli — OLLAMA_ORIGINS=* ayarla ve Ollama'yı yeniden başlat";
    throw new Error("Ollama: " + m);
  }
  return readStream(r, (line) => {
    try { const j = JSON.parse(line); if (j.message && j.message.content) onDelta(j.message.content); } catch (e) {}
  });
}

async function openaiChat(messages, onDelta) {
  const base = (AIconf.apiBase || "").replace(/\/$/, "");
  if (!base) throw new Error("API adresi (base URL) boş.");
  const headers = { "Content-Type": "application/json" };
  if (AIconf.apiKey) headers["Authorization"] = "Bearer " + AIconf.apiKey;
  const body = { model: AIconf.model, messages, stream: true, temperature: AIconf.temperature };
  const r = await fetch(base + "/chat/completions", { method: "POST", headers, body: JSON.stringify(body) });
  if (!r.ok) { let t = ""; try { t = (await r.text()).slice(0, 200); } catch (e) {} throw new Error("API hatası: HTTP " + r.status + " " + t); }
  return readStream(r, (line) => {
    if (!line.startsWith("data:")) return;
    const d = line.slice(5).trim();
    if (d === "[DONE]") return;
    try { const j = JSON.parse(d); const c = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content; if (c) onDelta(c); } catch (e) {}
  });
}

async function readStream(resp, onLine) {
  const reader = resp.body.getReader();
  const dec = new TextDecoder();
  let buf = "", full = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop();
    for (const ln of lines) { if (ln.trim()) onLine(ln); }
  }
  if (buf.trim()) onLine(buf);
  return full;
}

/* ------------------------------ UI: sohbet --------------------------- */
function viewAI() {
  setActiveNav("ai");
  const c = document.getElementById("content");
  const prov = AI_PRESETS[AIconf.provider] || AI_PRESETS.ollama;
  c.innerHTML = `
    <div class="ai-wrap">
      <div class="ai-head">
        <div class="ai-avatar">🤖</div>
        <div>
          <h2>AI Hoca</h2>
          <small>Elektronik & kart tamiri asistanı</small>
        </div>
        <span class="ai-status" id="ai-status">—</span>
        <button class="btn tiny" id="ai-settings-btn">⚙️ Ayarlar</button>
      </div>
      <div class="ai-modelbar" id="ai-modelbar" style="display:none"></div>
      <div class="ai-chat" id="ai-chat"></div>
      <div class="ai-suggest" id="ai-suggest">
        <button data-p="Ohm kanununu günlük hayattan örnekle açıkla.">Ohm kanunu nedir?</button>
        <button data-p="SMPS'te anahtarlama MOSFET'i neden yanar? Teşhis adımları neler?">SMPS MOSFET arızası</button>
        <button data-p="Multimetre ile bir MOSFET'in sağlam olup olmadığını nasıl anlarım?">MOSFET nasıl ölçülür?</button>
        <button data-p="Voltage drop tekniği nedir, nasıl uygulanır?">Voltage drop tekniği</button>
        <button data-p="Osiloskopta ripple nasıl ölçülür?">Ripple ölçümü</button>
      </div>
      <div class="ai-input">
        <textarea id="ai-text" placeholder="Sorunu yaz... (Enter = gönder, Shift+Enter = yeni satır)"></textarea>
        <button class="btn primary" id="ai-send">Gönder</button>
      </div>
    </div>`;

  document.getElementById("ai-settings-btn").onclick = openAISettings;
  const ta = document.getElementById("ai-text");
  document.getElementById("ai-send").onclick = () => sendAI(ta.value);
  ta.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAI(ta.value); }
  });
  document.querySelectorAll("#ai-suggest button").forEach(b => b.onclick = () => { ta.value = b.dataset.p; sendAI(ta.value); });

  renderAIChat();
  checkAIHealth();
}

function renderAIChat() {
  const box = document.getElementById("ai-chat"); if (!box) return;
  if (!AIstate.history.length) {
    box.innerHTML = `<div class="msg"><div class="avatar">🤖</div><div class="bubble">Merhaba! Ben AI Hoca. Elektronik, güç devreleri, ölçüm ve kart arıza teşhisi hakkında her şeyi sorabilirsin.\n\n${AIconf.provider === "ollama" ? "Yerel Ollama ile çalışıyorum. Ayarlardan modeli değiştirebilirsin." : "Bağlı API üzerinden çalışıyorum."}</div></div>`;
    return;
  }
  box.innerHTML = AIstate.history.map(m =>
    `<div class="msg ${m.role}"><div class="avatar">${m.role === "user" ? "🧑" : "🤖"}</div><div class="bubble">${mdToHtml(m.content) || ""}</div></div>`
  ).join("");
  box.scrollTop = box.scrollHeight;
}

async function sendAI(text) {
  text = (text || "").trim(); if (!text || AIstate.busy) return;
  const ta = document.getElementById("ai-text"); if (ta) ta.value = "";
  const suggest = document.getElementById("ai-suggest"); if (suggest) suggest.style.display = "none";
  AIstate.history.push({ role: "user", content: text });
  AIstate.history.push({ role: "assistant", content: "" });
  AIstate.busy = true;
  renderAIChat();
  const box = document.getElementById("ai-chat");
  const lastBubble = box.lastElementChild.querySelector(".bubble");
  lastBubble.innerHTML = `<span class="typing"><span></span><span></span><span></span></span>`;

  const ctx = AIstate.context ? `\n\n[Bağlam: Kullanıcı şu ders üzerinde çalışıyor → "${AIstate.context}"]` : "";
  const sys = (AIconf.system || DEFAULT_SYSTEM) + ctx;
  const messages = [{ role: "system", content: sys }]
    .concat(AIstate.history.slice(0, -1).slice(-12));

  let acc = "";
  try {
    await aiChat(messages, d => {
      acc += d;
      lastBubble.innerHTML = mdToHtml(acc);
      box.scrollTop = box.scrollHeight;
    });
    if (!acc) acc = "(Boş yanıt geldi. Model/ayarları kontrol et.)";
    AIstate.history[AIstate.history.length - 1].content = acc;
    setAIStatus("ok", "Bağlı");
  } catch (e) {
    let extra = "";
    if ((AI_PRESETS[AIconf.provider] || {}).kind === "ollama") {
      try {
        const models = await aiListModels();
        AIstate.models = models;
        if (!models.length) {
          extra = "\n\nOllama çalışıyor ama kurulu model yok. Terminalde:\n   ollama pull qwen2.5:7b";
        } else if (!models.some(m => sameModel(m, AIconf.model))) {
          extra = "\n\nKurulu modeller: " + models.join(", ") +
            "\n→ Yukarıdaki **Model** menüsünden birini seç, ya da:\n   ollama pull " + AIconf.model;
        } else {
          extra = "\n\nModel kurulu görünüyor; adresi kontrol et (Ayarlar).";
        }
      } catch (e2) {
        extra = "\n\nOllama'ya ulaşılamadı:\n• ollama serve çalışıyor mu?\n• CORS: OLLAMA_ORIGINS=* ayarla ve Ollama'yı yeniden başlat\n• Uygulamayı Baslat.bat ile (http://localhost:8080) açmak en sağlıklısı";
      }
    }
    const msg = "⚠️ Bağlantı hatası: " + e.message + extra;
    AIstate.history[AIstate.history.length - 1].content = msg;
    lastBubble.innerHTML = mdToHtml(msg);
    setAIStatus("err", "Bağlantı yok");
    renderModelBar(AIstate.models.length && !AIstate.models.some(m => sameModel(m, AIconf.model))
      ? "Kurulu bir model seç →" : "");
    console.error(e);
  }
  AIstate.busy = false;
  renderAIChat();
}

function setAIStatus(cls, txt) {
  const s = document.getElementById("ai-status"); if (!s) return;
  s.className = "ai-status " + (cls || "");
  s.textContent = txt;
}

function sameModel(a, b) {
  a = (a || "").toLowerCase(); b = (b || "").toLowerCase();
  return a === b || a === b + ":latest" || b === a + ":latest";
}

/* Kurulu modeller arasından en uygun olanı seçer.
   12 GB VRAM'e sığan, Türkçe+teknik dengeli modeller önceliklidir. */
function pickModel(models) {
  const pref = ["qwen2.5:7b", "qwen2.5:14b", "qwen2.5", "qwen3:8b", "qwen3:14b", "qwen3",
                "gemma3:12b", "gemma3", "gemma4", "gemma", "llama3.1", "llama3", "ornith", "mistral"];
  for (const p of pref) { const m = models.find(x => x.toLowerCase().includes(p)); if (m) return m; }
  const general = models.find(m => !/coder|code|translate|mini|embed|vision/i.test(m));
  return general || models[0];
}

function renderModelBar(msg) {
  const bar = document.getElementById("ai-modelbar"); if (!bar) return;
  const isOllama = (AI_PRESETS[AIconf.provider] || {}).kind === "ollama";
  let html = "";
  if (isOllama && AIstate.models.length) {
    html += `<span class="mb-label">Model:</span><select id="ai-model-select">` +
      AIstate.models.map(m => `<option value="${m}" ${sameModel(m, AIconf.model) ? "selected" : ""}>${sameModel(m, "qwen2.5:7b") ? "⭐ " : ""}${m}</option>`).join("") + `</select>`;
  }
  if (msg) html += `<span class="mb-msg">${msg}</span>`;
  bar.innerHTML = html;
  bar.style.display = html ? "flex" : "none";
  const sel = document.getElementById("ai-model-select");
  if (sel) sel.onchange = () => {
    AIconf.model = sel.value; AIconf.manual = true; saveAIConf();
    renderModelBar("");
    checkAIHealth();
  };
}

async function checkAIHealth() {
  const s = document.getElementById("ai-status"); if (!s) return;
  setAIStatus("", "Kontrol ediliyor…");
  const prov = AI_PRESETS[AIconf.provider] || {};
  if (prov.kind === "ollama") {
    try {
      const models = await aiListModels();
      AIstate.models = models;
      const rec = pickModel(models);
      if (!models.length) {
        setAIStatus("err", "Model yok");
        renderModelBar("Ollama çalışıyor ama hiç model kurulu değil. Terminalde çalıştır: <code>ollama pull qwen2.5:7b</code>");
      } else {
        let note = "";
        if (!AIconf.manual && rec && !sameModel(rec, AIconf.model)) {
          AIconf.model = rec; saveAIConf();
          note = "Sistemine uygun (VRAM'e sığan) model seçildi: <code>" + escHtml(rec) + "</code>";
        } else if (!models.some(m => sameModel(m, AIconf.model))) {
          AIconf.model = rec; saveAIConf();
          note = "Seçili model kurulu değildi; seçildi: <code>" + escHtml(rec) + "</code>";
        }
        setAIStatus("ok", "Ollama ✓ (" + models.length + " model)");
        renderModelBar(note);
      }
    } catch (e) {
      AIstate.models = [];
      setAIStatus("err", "Ollama'ya ulaşılamadı");
      renderModelBar("Ollama çalışmıyor olabilir. <code>ollama serve</code> çalıştır; CORS için <code>OLLAMA_ORIGINS=*</code> ayarla ve yeniden başlat. Uygulamayı <b>Baslat.bat</b> ile (http://localhost:8080) açmak da çözer.");
    }
  } else {
    setAIStatus(AIconf.apiKey ? "ok" : "err", AIconf.apiKey ? "API anahtarı var" : "API anahtarı yok");
    renderModelBar("");
  }
}

/* ------------------------------ UI: ayarlar -------------------------- */
function openAISettings() {
  const prov = AIconf.provider;
  const back = document.getElementById("modal-back");
  back.innerHTML = `
    <div class="modal">
      <h2>⚙️ AI Ayarları</h2>
      <p class="m-sub">Yerel (Ollama) veya bulut API seç. Ayarlar sadece bu tarayıcıda saklanır.</p>

      <label>Sağlayıcı
        <select id="s-provider">
          ${Object.entries(AI_PRESETS).map(([k, v]) => `<option value="${k}" ${k === prov ? "selected" : ""}>${v.label}</option>`).join("")}
        </select>
      </label>

      <div id="p-ollama">
        <label>Ollama Adresi
          <input id="s-ollamaUrl" value="${escHtml(AIconf.ollamaUrl)}" placeholder="http://localhost:11434">
        </label>
        <label>Model
          <input id="s-model" list="model-list" value="${escHtml(AIconf.model)}" placeholder="qwen2.5:7b">
          <datalist id="model-list">${OLLAMA_MODELS.map(m => `<option value="${m.id}">`).join("")}${(AIstate.models || []).map(m => `<option value="${m}">`).join("")}</datalist>
        </label>
        <div class="provider-note">
          <b>Öneri (yerel AI):</b> Türkçe + teknik için <code>qwen2.5:7b</code> en iyi denge.
          Daha güçlü: <code>qwen2.5:14b</code>. Hafif: <code>llama3.2:3b</code>. Çok dilli: <code>aya-expanse:8b</code>.<br><br>
          Model indir: <code>ollama pull qwen2.5:7b</code><br>
          CORS (file:// için şart): <code>OLLAMA_ORIGINS=*</code> ortam değişkenini ayarlayıp Ollama'yı yeniden başlat.
          Ya da projeyi <code>python -m http.server</code> ile aç (localhost origin izinli).
        </div>
        <button class="btn tiny" id="s-test">🔄 Ollama modellerini getir</button>
        <div id="s-models" class="provider-note" style="margin-top:10px;display:none"></div>
      </div>

      <div id="p-api" style="display:none">
        <label>API Base URL
          <input id="s-apiBase" value="${escHtml(AIconf.apiBase)}" placeholder="https://api.openai.com/v1">
        </label>
        <label>API Anahtarı
          <input id="s-apiKey" type="password" value="${escHtml(AIconf.apiKey)}" placeholder="sk-...">
        </label>
        <label>Model
          <input id="s-apiModel" value="${escHtml(AIconf.model)}" placeholder="gpt-4o-mini">
        </label>
        <div class="provider-note">
          OpenAI-uyumlu her endpoint çalışır (OpenAI, DeepSeek, OpenRouter, yerel LM Studio/vLLM, vs.).
          Anahtar sadece tarayıcında saklanır, sunucuya gönderilmez. <b>Not:</b> Tarayıcıdan API anahtarı kullanırken CORS'a takılabilirsin.
        </div>
      </div>

      <label>System Prompt (öğretmen kişiliği)
        <textarea id="s-system" rows="4">${escHtml(AIconf.system)}</textarea>
      </label>
      <label>Sıcaklık (0 = tutarlı, 1 = yaratıcı): <span id="s-temp-val">${AIconf.temperature}</span>
        <input id="s-temp" type="range" min="0" max="1" step="0.1" value="${AIconf.temperature}" style="padding:0">
      </label>

      <div class="modal-foot">
        <button class="btn" id="s-close">İptal</button>
        <button class="btn primary" id="s-save">Kaydet</button>
      </div>
    </div>`;
  back.classList.add("open");

  const toggle = () => {
    const k = (AI_PRESETS[document.getElementById("s-provider").value] || {}).kind;
    document.getElementById("p-ollama").style.display = k === "ollama" ? "" : "none";
    document.getElementById("p-api").style.display = k === "ollama" ? "none" : "";
    const preset = AI_PRESETS[document.getElementById("s-provider").value];
    if (k !== "ollama" && preset && preset.base) {
      document.getElementById("s-apiBase").value = preset.base;
      document.getElementById("s-apiModel").value = preset.model;
    }
  };
  document.getElementById("s-provider").onchange = toggle; toggle();
  document.getElementById("s-temp").oninput = e => document.getElementById("s-temp-val").textContent = e.target.value;
  document.getElementById("s-close").onclick = () => back.classList.remove("open");
  back.onclick = e => { if (e.target === back) back.classList.remove("open"); };

  document.getElementById("s-test").onclick = async () => {
    const box = document.getElementById("s-models"); box.style.display = "block"; box.textContent = "Yükleniyor…";
    const old = AIconf.ollamaUrl; AIconf.ollamaUrl = document.getElementById("s-ollamaUrl").value;
    try {
      const models = await aiListModels();
      box.innerHTML = models.length ? "Kurulu modeller:<br>" + models.map(m => "• <code>" + m + "</code>").join("<br>") : "Model bulunamadı. `ollama pull` ile indir.";
    } catch (e) { box.innerHTML = "⚠️ Ulaşılamadı: " + e.message; }
    AIconf.ollamaUrl = old;
  };

  document.getElementById("s-save").onclick = () => {
    const p = document.getElementById("s-provider").value;
    const kind = (AI_PRESETS[p] || {}).kind;
    AIconf.provider = p;
    AIconf.ollamaUrl = document.getElementById("s-ollamaUrl").value || "http://localhost:11434";
    AIconf.apiBase = document.getElementById("s-apiBase").value;
    AIconf.apiKey = document.getElementById("s-apiKey").value;
    const newModel = kind === "ollama" ? document.getElementById("s-model").value : document.getElementById("s-apiModel").value;
    if (newModel && newModel !== AIconf.model) AIconf.manual = true;
    AIconf.model = newModel;
    AIconf.system = document.getElementById("s-system").value || DEFAULT_SYSTEM;
    AIconf.temperature = parseFloat(document.getElementById("s-temp").value);
    saveAIConf();
    back.classList.remove("open");
    route();
    toast("AI ayarları kaydedildi");
  };
}
