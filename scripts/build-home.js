/* Generate the 6 per-language homepages from _src/home.html + js/i18n.js.
 * Root "/" = Spanish (default); /en/ /de/ /it/ /fr/ /sv/ = the others.
 * Preserves ALL markup (only swaps text/attrs) so the interactive JS keeps working.
 *
 * Run:  npm run build:home     (or: node scripts/build-home.js)
 * At custom-domain launch, set BASE = "" and re-run.
 */
const fs = require("fs"), path = require("path"), cheerio = require("cheerio");
const ROOT = path.resolve(__dirname, "..");
const BASE = "/casa-trini";                       // deploy subpath (set "" at domain launch)
const DOMAIN = "https://casatriniformentera.com"; // absolute base for canonical/hreflang/og

const I18N = new Function(fs.readFileSync(path.join(ROOT, "js/i18n.js"), "utf8") + "; return I18N;")();
const master = fs.readFileSync(path.join(ROOT, "_src/home.html"), "utf8");

const LANGS = ["es", "en", "de", "it", "fr", "sv"];
const LABEL = { en: "English", es: "Español", de: "Deutsch", it: "Italiano", fr: "Français", sv: "Svenska" };
const OGLOC = { es: "es_ES", en: "en_US", de: "de_DE", it: "it_IT", fr: "fr_FR", sv: "sv_SE" };
const TITLE = {
  es: "Casa Trini Formentera — Casa rústica junto al mar | Formentera",
  en: "Casa Trini Formentera — Rustic Holiday Villa near the Sea | Formentera, Spain",
  de: "Casa Trini Formentera — Rustikales Ferienhaus am Meer | Formentera",
  it: "Casa Trini Formentera — Casa rustica vicino al mare | Formentera",
  fr: "Casa Trini Formentera — Maison rustique près de la mer | Formentera",
  sv: "Casa Trini Formentera — Rustik semestervilla nära havet | Formentera"
};
const OGTITLE = {
  es: "Casa Trini Formentera — Casa rústica en Formentera",
  en: "Casa Trini Formentera — Rustic Holiday Villa in Formentera",
  de: "Casa Trini Formentera — Rustikales Ferienhaus auf Formentera",
  it: "Casa Trini Formentera — Casa rustica a Formentera",
  fr: "Casa Trini Formentera — Maison rustique à Formentera",
  sv: "Casa Trini Formentera — Rustik villa på Formentera"
};

const langPath = l => BASE + (l === "es" ? "/" : "/" + l + "/");
const absPath  = l => DOMAIN + (l === "es" ? "/" : "/" + l + "/");
const blogPath = l => BASE + (l === "es" ? "/blog/" : "/blog/" + l + "/");

for (const lang of LANGS) {
  const t = I18N[lang];
  const $ = cheerio.load(master, { decodeEntities: false });

  $("html").attr("lang", lang);

  $("[data-i18n]").each((i, el) => {
    const $el = $(el), key = $el.attr("data-i18n"), val = t[key];
    if (val == null) return;
    if ((el.tagName || "").toLowerCase() === "meta") $el.attr("content", val);
    else $el.text(val);
  });

  $("title").text(TITLE[lang]);
  $('link[rel="canonical"]').attr("href", absPath(lang));
  $('meta[property="og:title"]').attr("content", OGTITLE[lang]);
  $('meta[property="og:description"]').attr("content", t["meta.description"]);
  $('meta[name="twitter:title"]').attr("content", OGTITLE[lang]);
  $('meta[name="twitter:description"]').attr("content", t["meta.description"]);
  $('meta[property="og:url"]').attr("content", absPath(lang));
  $('meta[property="og:locale"]').attr("content", OGLOC[lang]);
  $('meta[property="og:locale:alternate"]').remove();
  LANGS.filter(l => l !== lang).forEach(l =>
    $('meta[property="og:locale"]').after('\n  <meta property="og:locale:alternate" content="' + OGLOC[l] + '" />'));

  let hre = "";
  LANGS.forEach(l => { hre += '\n  <link rel="alternate" hreflang="' + l + '" href="' + absPath(l) + '" />'; });
  hre += '\n  <link rel="alternate" hreflang="x-default" href="' + absPath("es") + '" />';
  $('link[rel="canonical"]').after(hre);

  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const j = JSON.parse($(el).html());
      if (j["@type"] === "LodgingBusiness") { j.description = t["meta.description"]; j.url = absPath(lang); $(el).text(JSON.stringify(j, null, 2)); }
    } catch (e) {}
  });

  $('link[href], script[src], img[src]').each((i, el) => {
    const tag = (el.tagName || "").toLowerCase();
    const attr = (tag === "script" || tag === "img") ? "src" : "href";
    let v = $(el).attr(attr);
    if (!v || /^(https?:|\/\/|#|data:|mailto:|tel:|\/)/.test(v)) return;
    $(el).attr(attr, BASE + "/" + v);
  });

  $("#langCurrent").text(lang.toUpperCase());
  const $menu = $("#langMenu"); $menu.empty();
  LANGS.forEach(l => {
    const cur = l === lang ? ' aria-current="true"' : '';
    $menu.append('\n            <li><a href="' + langPath(l) + '" data-lang="' + l + '" role="menuitem"' + cur + '>' + LABEL[l] + '</a></li>');
  });

  $("#navDiscover").attr("href", blogPath(lang));

  if (lang === "es") {
    const redir = '<script>(function(){try{var s=localStorage.getItem("ct_lang");var supp=["en","de","it","fr","sv"];var w=s||(navigator.language||"").slice(0,2).toLowerCase();if(w&&w!=="es"&&supp.indexOf(w)>=0){location.replace("' + BASE + '/"+w+"/");}}catch(e){}})();<\/script>';
    $("head").prepend("\n  " + redir + "\n");
  }

  const outRel = lang === "es" ? "index.html" : lang + "/index.html";
  const outPath = path.join(ROOT, outRel);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, $.html());
  console.log("wrote", outRel, "(lang=" + lang + ")");
}
console.log("done");
