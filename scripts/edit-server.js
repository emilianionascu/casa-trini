/* Local, dev-only in-place editor for the homepage copy.
 *
 *   1) docker compose up          (Jekyll preview on :4000)
 *   2) npm run edit               (this proxy on :4001)
 *   3) open http://localhost:4001/casa-trini/  → click any text, edit, click away to save.
 *
 * It proxies the Jekyll preview, injects a click-to-edit layer, and on save writes the
 * change straight into js/i18n.js (for the page's language) then regenerates the pages.
 * Nothing here is shipped to the public site. Homepage strings only (blog uses /admin).
 */
const http = require("http"), fs = require("fs"), path = require("path");
const { execFile } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const UPSTREAM = "http://localhost:4000";
const PORT = 4001;
const I18N_FILE = path.join(ROOT, "js/i18n.js");

// --- write one string into js/i18n.js, scoped to a language block, then validate ---
function setString(src, lang, key, value) {
  const start = src.indexOf("\n  " + lang + ": {");
  if (start < 0) throw new Error("language block not found: " + lang);
  const end = src.indexOf("\n  }", start);
  if (end < 0) throw new Error("block end not found for " + lang);
  const block = src.slice(start, end);
  const kesc = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const keyRe = new RegExp('("' + kesc + '"\\s*:\\s*")((?:[^"\\\\]|\\\\.)*)(")');
  if (!keyRe.test(block)) throw new Error("key not found: " + key + " (" + lang + ")");
  const esc = String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, " ").trim();
  const newBlock = block.replace(keyRe, (m, p1, p2, p3) => p1 + esc + p3);
  const out = src.slice(0, start) + newBlock + src.slice(end);
  new Function(out + "; return I18N;")(); // throws if we produced invalid JS
  return out;
}

// --- the click-to-edit layer injected into every proxied HTML page ---
const CLIENT = `
(function(){
  if(window.__ctEdit)return; window.__ctEdit=true;
  var lang=document.documentElement.lang||'es';
  var bar=document.createElement('div');
  bar.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#2e2a24;color:#fff;font:14px/1.4 system-ui,sans-serif;padding:9px 16px;display:flex;gap:14px;align-items:center;box-shadow:0 -2px 14px rgba(0,0,0,.35)';
  bar.innerHTML='<b>&#9998; Modo edición</b><span style="opacity:.8">Idioma: '+lang.toUpperCase()+' &middot; haz clic en cualquier texto para editarlo</span><span id="__ctStatus" style="margin-left:auto;opacity:.95"></span>';
  document.body.appendChild(bar);
  document.body.style.paddingBottom='52px';
  var status=bar.querySelector('#__ctStatus');
  document.addEventListener('click',function(e){ if(e.target.closest('[contenteditable="true"]')) e.preventDefault(); },true);
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    if(el.tagName==='META')return;
    var key=el.getAttribute('data-i18n'); var orig=el.textContent;
    el.setAttribute('contenteditable','true'); el.setAttribute('spellcheck','false');
    el.style.outline='1px dashed rgba(194,106,72,.55)'; el.style.outlineOffset='3px'; el.style.borderRadius='2px';
    el.addEventListener('focus',function(){ el.style.outline='2px solid #c26a48'; el.style.background='rgba(194,106,72,.06)'; });
    function done(){
      el.style.outline='1px dashed rgba(194,106,72,.55)'; el.style.background='';
      var val=el.textContent.trim(); if(val===orig.trim())return; orig=val;
      status.textContent='Guardando…';
      fetch('/__save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lang:lang,key:key,value:val})})
        .then(function(r){return r.json();})
        .then(function(j){ status.textContent=j.ok?('Guardado \\u2713  '+key):('Error: '+(j.error||'?')); })
        .catch(function(){ status.textContent='Error de red (\\u00bfservidor de edición activo?)'; });
    }
    el.addEventListener('blur',done);
    el.addEventListener('keydown',function(e){ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); el.blur(); } if(e.key==='Escape'){ el.textContent=orig; el.blur(); } });
  });
  document.querySelectorAll('#galleryGrid figure').forEach(function(fig){
    var img=fig.querySelector('img'); if(!img)return;
    fig.style.position='relative';
    var btn=document.createElement('button');
    btn.type='button'; btn.title='Descartar foto'; btn.textContent='\\u2715';
    btn.style.cssText='position:absolute;top:8px;right:8px;z-index:6;width:30px;height:30px;border-radius:50%;border:2px solid #fff;background:rgba(46,42,36,.72);color:#fff;font-size:14px;line-height:1;cursor:pointer;padding:0;box-shadow:0 2px 8px rgba(0,0,0,.35)';
    btn.addEventListener('mouseenter',function(){ btn.style.background='#c0392b'; });
    btn.addEventListener('mouseleave',function(){ btn.style.background='rgba(46,42,36,.72)'; });
    btn.addEventListener('click',function(e){
      e.preventDefault(); e.stopPropagation();
      var file=(img.getAttribute('src')||'').split('/').pop().split('?')[0];
      if(!confirm('¿Descartar esta foto de la galería?\\n'+file)) return;
      status.textContent='Descartando…';
      fetch('/__discard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({file:file})})
        .then(function(r){return r.json();})
        .then(function(j){ if(j.ok){ fig.remove(); window.dispatchEvent(new Event('resize')); status.textContent='Foto descartada \\u2713  ('+j.remaining+' restantes)'; } else { status.textContent='Error: '+(j.error||'?'); } })
        .catch(function(){ status.textContent='Error de red'; });
    });
    fig.appendChild(btn);
  });
})();
`;

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/__save") {
    let body = ""; req.on("data", c => (body += c));
    req.on("end", () => {
      try {
        const { lang, key, value } = JSON.parse(body);
        const src = fs.readFileSync(I18N_FILE, "utf8");
        fs.writeFileSync(I18N_FILE, setString(src, lang, key, value));
        execFile(process.execPath, [path.join(ROOT, "scripts/build-home.js")], { cwd: ROOT }, (err) => {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: !err, error: err ? String(err) : undefined }));
        });
      } catch (e) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: String(e.message || e) }));
      }
    });
    return;
  }
  if (req.method === "POST" && req.url === "/__discard") {
    let body = ""; req.on("data", c => (body += c));
    req.on("end", () => {
      try {
        const { file } = JSON.parse(body);
        if (!file || !/^[\w.\-]+$/.test(file)) throw new Error("bad filename");
        let src = fs.readFileSync(I18N_FILE, "utf8");
        const before = new Function(src + "; return GALLERY;")().length;
        const esc = file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp('\\n\\s*\\{[^{}]*"' + esc + '"[^{}]*\\},?');
        if (!re.test(src)) throw new Error("photo not in gallery: " + file);
        src = src.replace(re, "");
        const remaining = new Function(src + "; return GALLERY;")().length; // validate
        fs.writeFileSync(I18N_FILE, src);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, remaining, removed: before - remaining }));
      } catch (e) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: String(e.message || e) }));
      }
    });
    return;
  }
  fetch(UPSTREAM + req.url, { headers: { accept: req.headers.accept || "*/*" }, redirect: "manual" })
    .then(async (up) => {
      const ct = up.headers.get("content-type") || "";
      if (ct.includes("text/html")) {
        let html = await up.text();
        html = html.replace(/<script>\(function\(\)\{try\{var s=localStorage[\s\S]*?\}\)\(\);<\/script>/, ""); // drop lang auto-redirect while editing
        html = html.replace(/<\/body>/i, "<script>" + CLIENT + "</script></body>");
        res.writeHead(up.status, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
        res.end(html);
      } else {
        const buf = Buffer.from(await up.arrayBuffer());
        res.writeHead(up.status, { "Content-Type": ct || "application/octet-stream", "Cache-Control": "no-store" });
        res.end(buf);
      }
    })
    .catch((e) => { res.writeHead(502); res.end("Jekyll preview not reachable on :4000 — run `docker compose up` first.\n" + e); });
});
server.listen(PORT, () => console.log("In-place editor  →  http://localhost:" + PORT + "/casa-trini/   (proxying " + UPSTREAM + ")"));
