/* Optimise photos to WebP for the gallery.
 *
 * Usage (from the project root):
 *   npm init -y && npm i sharp        # one-time
 *   node scripts/optimize-images.js assets/images/uploads
 *
 * It converts every .jpg/.jpeg/.png in the given folder to a resized .webp
 * (long edge ≤ 1400px, quality 80) and prints the { src, w, h } lines to paste
 * into the GALLERY array in js/i18n.js. Originals are left untouched.
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const dir = process.argv[2] || "assets/images/uploads";
const MAX = 1400, QUALITY = 80;

(async () => {
  const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png)$/i.test(f));
  if (!files.length) { console.log("No .jpg/.png images found in " + dir); return; }
  const lines = [];
  for (const f of files) {
    const { data, info } = await sharp(path.join(dir, f))
      .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer({ resolveWithObject: true });
    const out = f.replace(/\.(jpe?g|png)$/i, ".webp");
    fs.writeFileSync(path.join(dir, out), data);
    lines.push(`  { src: "${path.posix.join(dir, out)}", w: ${info.width}, h: ${info.height} },`);
  }
  console.log("Done. Add these to the GALLERY array in js/i18n.js:\n");
  console.log(lines.join("\n"));
})();
