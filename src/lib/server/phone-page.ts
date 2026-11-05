// The capture page a phone opens from the QR code. Plain HTML, no build step, served by phone.ts.
export const PHONE_PAGE = /* html */ `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#FAFAF8">
<title>Nool</title>
<style>
:root{--bg:#FAFAF8;--surface:#fff;--text:#111;--muted:#6B6B6B;--line:#E6E6E3;--accent:#2B4BFF}
@media (prefers-color-scheme:dark){:root{--bg:#141414;--surface:#1c1c1c;--text:#f2f2f2;--muted:#9a9a9a;--line:#2c2c2c;--accent:#5b74ff}}
*{box-sizing:border-box;margin:0}
body{background:var(--bg);color:var(--text);font:16px/1.45 system-ui,-apple-system,sans-serif;padding:16px 16px calc(24px + env(safe-area-inset-bottom));max-width:560px;margin:0 auto}
header{display:flex;align-items:center;gap:10px;margin-bottom:20px}
header b{font-size:20px;letter-spacing:-.01em}
label{display:grid;gap:4px;font-size:13px;color:var(--muted);margin-bottom:12px}
select,textarea{font:inherit;color:var(--text);background:var(--surface);border:1px solid var(--line);border-radius:4px;padding:10px 12px;width:100%}
textarea{min-height:120px;resize:vertical}
.row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
button,.pick{font:inherit;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border-radius:4px;border:1px solid var(--line);background:var(--surface);color:var(--text)}
.primary{background:var(--accent);border-color:var(--accent);color:#fff;width:100%;margin:4px 0 12px}
button:disabled{opacity:.5}
.pick input{display:none}
#log{list-style:none;padding:0;margin-top:20px;border-top:1px solid var(--line)}
#log li{padding:10px 0;border-bottom:1px solid var(--line);font-size:14px;color:var(--muted)}
#log li.err{color:#d2462b}
.empty{padding:40px 0;text-align:center;color:var(--muted)}
</style></head>
<body>
<header>
 <svg width="28" height="28" viewBox="0 0 32 32"><rect x="2" y="2" width="28" height="28" fill="#2B4BFF"/><path d="M10.5 23 V14.5 C10.5 11 12.8 9.5 15.75 9.5 C18.7 9.5 21 11 21 14.5 V20 C21 22.6 22.6 24 25.5 23" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>
 <b>Send to Nool</b>
</header>
<main id="app"><p class="empty">Connecting to your computer…</p></main>
<ul id="log"></ul>
<script>
const hash = location.hash.slice(1);
if (hash) { try { localStorage.setItem('nool-key', hash); } catch {} history.replaceState(null, '', '/'); }
let key = hash; try { key = key || localStorage.getItem('nool-key') || ''; } catch {}
const $ = (s) => document.querySelector(s);
const log = (msg, err) => { const li = document.createElement('li'); li.textContent = msg; if (err) li.className = 'err'; $('#log').prepend(li); };
const call = async (path, opts = {}) => {
  const res = await fetch(path, { ...opts, headers: { 'x-nool-key': key, ...(opts.headers || {}) } });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.message || 'Could not reach Nool');
  return j;
};
let projects = [];
const remember = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const recall = (k) => { try { return localStorage.getItem(k); } catch { return null; } };

function render() {
  $('#app').innerHTML = \`
    <label>Project <select id="p"></select></label>
    <label>Stage <select id="s"></select></label>
    <label>Note or link <textarea id="t" placeholder="What happened, what changed"></textarea></label>
    <button class="primary" id="send">Send note</button>
    <div class="row">
      <label class="pick"><input id="img" type="file" accept="image/*" multiple>Photo</label>
      <label class="pick"><input id="aud" type="file" accept="audio/*" capture>Voice</label>
    </div>\`;
  const p = $('#p'), s = $('#s');
  p.innerHTML = projects.map((x) => '<option value="' + x.id + '">' + x.title.replace(/</g, '&lt;') + '</option>').join('');
  if (recall('nool-p') && projects.some((x) => x.id === recall('nool-p'))) p.value = recall('nool-p');
  const stages = () => {
    const pr = projects.find((x) => x.id === p.value);
    s.innerHTML = pr.stages.map((x) => '<option value="' + x.id + '">' + x.name.replace(/</g, '&lt;') + '</option>').join('');
    if (pr.stages.some((x) => x.id === recall('nool-s'))) s.value = recall('nool-s');
  };
  stages();
  p.onchange = () => { remember('nool-p', p.value); stages(); remember('nool-s', s.value); };
  s.onchange = () => remember('nool-s', s.value);
  const block = (type, data) => call('/block', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ project: p.value, stage: s.value, type, data }) });
  $('#send').onclick = async () => {
    const text = $('#t').value.trim(); if (!text) return;
    $('#send').disabled = true;
    try {
      const r = /^https?:\\/\\/\\S+$/i.test(text) ? await block('link', { url: text, note: '' }) : await block('note', { text });
      $('#t').value = ''; log('Note sent to ' + r.project + ' → ' + r.stage);
    } catch (e) { log(e.message, true); }
    $('#send').disabled = false;
  };
  const upload = async (file, type) => {
    log('Sending ' + (type === 'voice' ? 'recording' : 'photo') + '…');
    try {
      const { src } = await call('/upload', { method: 'POST', headers: { 'content-type': file.type || 'application/octet-stream' }, body: file });
      const r = type === 'voice' ? await block('voice', { src, caption: '', transcript: '', duration: 0 }) : await block('image', { src, caption: '' });
      log((type === 'voice' ? 'Recording' : 'Photo') + ' sent to ' + r.project + ' → ' + r.stage);
    } catch (e) { log(e.message, true); }
  };
  $('#img').onchange = async (e) => { for (const f of e.target.files) await upload(f, 'image'); e.target.value = ''; };
  $('#aud').onchange = async (e) => { for (const f of e.target.files) await upload(f, 'voice'); e.target.value = ''; };
}

(async () => {
  if (!key) { $('#app').innerHTML = '<p class="empty">Open this page by scanning the QR code in Nool (Connections → Phone).</p>'; return; }
  try {
    projects = (await call('/projects')).projects;
    if (!projects.length) { $('#app').innerHTML = '<p class="empty">Issue a stamp in Nool first, then come back.</p>'; return; }
    render();
  } catch (e) { $('#app').innerHTML = '<p class="empty">' + e.message + '</p>'; }
})();
</script>
</body></html>`;
