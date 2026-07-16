# Casa Trini Formentera — website

A static, multilingual marketing & booking site for **Casa Trini Formentera**, a rustic holiday home on Formentera. No build step, no framework — just open it or drop it on any static host.

Modelled on the original https://casatriniformentera.com/, expanded with 6 languages, a full gallery with lightbox, an amenities section, a map, and an inquiry form + booking links.

**Live site:** hosted on GitHub Pages from the `main` branch of
[themayans/casa-trini](https://github.com/themayans/casa-trini) →
https://themayans.github.io/casa-trini/. To update the live site, commit and
push to `main`; Pages rebuilds automatically in ~1 minute.

## Structure

```
index.html                 Single page: hero · the house · amenities · location · gallery · reviews · contact
thanks.html                Localized "thank you" page guests return to after sending the form
css/styles.css             All styling (design system, responsive, lightbox)
js/i18n.js                 All text in 6 languages + the GALLERY image list  ← edit content here
js/main.js                 Behaviour + CONFIG (Formspree ID, booking URLs)  ← edit settings here
assets/images/gallery-pro/ Curated professional photos (Jordi Gómez) shown in the gallery
assets/images/hero.jpg     Full-bleed hero image
assets/images/uploads/     Drop your own photos here (see the README inside)
```

## Run it locally (recommended: the whole site, incl. blog)

The blog is built by **Jekyll** (the same engine GitHub Pages uses), so a plain
static file server won't render it. Use Docker — it serves the **entire** site
(marketing page + blog) exactly as production, and you don't need Ruby installed:

```powershell
docker compose up
```

Then open **http://localhost:4000/casa-trini/** — that one URL is the whole site:
the home page, the gallery, and the blog at `/casa-trini/blog/`. The first run
installs the gems (a few minutes); later runs are instant. Article and layout
edits reload automatically. Press `Ctrl+C` to stop.

This uses the exact GitHub Pages toolchain (`github-pages` gem, pinned in
`Gemfile`), so what you see locally is what goes live.

> Prefer not to use Docker and only need the **marketing page** (no blog)? Any
> static server works — just pick a free port:
> `py -m http.server 8090` → http://localhost:8090
> (Use a different number if that port is busy.)

## How the blog works

- Articles live in `_articles/` as Markdown, **one file per language**, e.g.
  `formentera-sunset.en.md`, `formentera-sunset.es.md`, … Files that share the
  same `ref:` are treated as translations of one another (linked with
  `hreflang` for SEO).
- Front matter drives SEO: `title`, `description`, `date`, `category`, `image`,
  and `permalink` (the article's URL). `jekyll-seo-tag` turns these into the
  page title, meta description, Open Graph/Twitter cards and JSON-LD
  `BlogPosting`; `jekyll-sitemap` adds them to `sitemap.xml` automatically.
- Per-language index pages live in `blog/` (`blog/index.html` = English,
  `blog/es/index.html`, …). Shared UI labels are in `_data/ui.yml`.
- **Publishing:** edit in the visual CMS at `/admin` (see below) or add/commit a
  Markdown file — either way, pushing to `main` rebuilds the live site in ~1 min.

## Edit the homepage text in place (local, no login)

Change homepage copy by **clicking it on the page** — edits save straight into
`js/i18n.js` and the pages regenerate.

```powershell
npm install          # once (installs the tooling)
docker compose up    # terminal 1 — the Jekyll preview (:4000)
npm run edit         # terminal 2 — the in-place editor (:4001)
```

Open **http://localhost:4001/casa-trini/**, click any heading or paragraph, type your
change, and click away (or press Enter) to save — it writes into `js/i18n.js` for that
page's **language** and regenerates the homepages. Switch language with the header
dropdown to edit that language's copy. Press `Esc` to cancel an edit. When you're happy,
commit and push to deploy.

Notes: this is homepage strings only (blog articles are edited in `/admin` or as
Markdown), it runs **only on your machine** (nothing is added to the public site), and it
edits the same `js/i18n.js` the generator reads — so `npm run build:home` stays the source
of truth.

## Editing posts in your browser (`/admin`)

The site has a visual editor (**Sveltia CMS**) at **`/admin`** — write and
translate posts in a form, no files or Git. Saving commits to `main`, and the
site rebuilds in ~1 minute. Images you drop in upload to `assets/images/blog/`.

**One-time setup (so the GitHub login works).** GitHub Pages has no server, so
the editor needs a tiny free "OAuth relay":

1. **Deploy the auth relay (Cloudflare Workers, free).** Open
   <https://github.com/sveltia/sveltia-cms-auth> and use its one-click *Deploy to
   Cloudflare Workers*. You'll get a URL like
   `https://sveltia-cms-auth.<you>.workers.dev`.
2. **Create a GitHub OAuth App.** GitHub → Settings → Developer settings →
   OAuth Apps → *New OAuth App*.
   - Homepage URL: `https://themayans.github.io/casa-trini/`
   - Authorization callback URL: `https://sveltia-cms-auth.<you>.workers.dev/callback`
   Register it, copy the **Client ID**, and generate a **Client secret**.
3. **Give the Worker the credentials.** In the Cloudflare Worker's settings, add
   variables `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and
   `ALLOWED_DOMAINS = themayans.github.io,casatriniformentera.com`.
4. **Point the CMS at the Worker.** In `admin/config.yml`, set `backend.base_url`
   to your Worker URL (replace the placeholder) and commit.

Then open `/admin`, click **Sign in with GitHub**, and edit away.

**Writing tips:** one entry = one language; to translate, create another entry
with the SAME *Article key* and the matching *Language*. The *URL path* must
start with `/blog/<language>/`. Use the editor's image button to insert photos
into the body.

## Things to finish (5-minute setup)

1. **Contact form** — uses [FormSubmit](https://formsubmit.co) (free, no signup) in
   **standard POST mode**: on submit the guest sees FormSubmit's **reCAPTCHA**, the
   inquiry is emailed, and they're returned to `thanks.html`. The destination email
   is the form's `action` in `index.html`. **Activation:** the first submission
   sends a one-time confirmation link to that address — click it once and all future
   inquiries arrive automatically. Anti-spam: reCAPTCHA + a hidden honeypot field.
   (To hide your address, replace the email in the form `action` with the random
   alias FormSubmit gives you after activation.)
2. **Booking** — the property is listed on **Airbnb only**. The listing URL is
   already set in `js/main.js` (`BOOKING_URLS.airbnb`) and in `index.html`.
3. **Email address** — update `CONTACT_EMAIL` in `js/main.js` and the
   `mailto:`/address shown in `index.html` (currently `franciscoformentera2019@hotmail.com`).
4. **Google reviews** — the "Guest Reviews" section works out of the box (5.0★
   badge + links to your Google listing and a set of quotes in the `TESTIMONIALS`
   array in `js/main.js`). To show **live** reviews, pick one:
   - *Places API*: set `GOOGLE_PLACES.apiKey` in `js/main.js` (enable the Places API
     (New) in Google Cloud; verify the `placeId` with the Place ID finder). Up to
     6 live reviews load automatically.
   - *Widget*: paste a free Trustindex/Elfsight/EmbedSocial embed into the
     `#reviewsWidget` div in `index.html`.
   - *Manual*: edit the `TESTIMONIALS` array with real review quotes.
5. **Your own photos** — see `assets/images/uploads/README.txt`.
6. **Translations** — the EN/ES copy is primary; DE/IT/FR/SV were machine-drafted.
   A quick native review is recommended before going live. All copy lives in `js/i18n.js`.

## Google Maps note

There are three "Casa Trini Formentera" pins on Google Maps: your official Google
Business listing (5.0★, the one this site's map points to) plus two vacation-rental
unit listings that booking platforms (Vrbo, etc.) auto-created. They're all the
same property — not an error. To tidy this up you can claim/merge the duplicates
in your Google Business Profile. The site's map and links target the official
listing precisely (coordinates 38.7126, 1.4089).

## Languages

English, Español, Deutsch, Italiano, Français, Svenska — switch with the
selector in the header. The choice is remembered (localStorage) and the site
auto-detects the visitor's browser language on first visit. The hero headline
*"Vive Formentera auténtica"* is intentionally kept in Spanish in every language.
The footer tagline (`footer.tagline` in `js/i18n.js` / `footer_note` in `_data/ui.yml`)
is localized per language.

## Performance & SEO

- **Images**: all photos are optimised to **WebP** (long edge ≤ 1400 px, hero ≤ 2000 px),
  cutting the gallery from ~16 MB to ~7 MB. Each `<img>` has explicit `width`/`height`
  and `loading="lazy"` + `decoding="async"` to avoid layout shift. To optimise new
  uploads, run `npm i sharp` then `node scripts/optimize-images.js assets/images/uploads`
  and paste the printed lines into the `GALLERY` array in `js/i18n.js`.
- **SEO**: `index.html` includes a keyword-rich title, meta description, canonical URL,
  Open Graph + Twitter cards (social preview via `assets/images/og-image.jpg`), and
  **JSON-LD `LodgingBusiness`** structured data (address, geo, amenities, social links).
  `robots.txt` and `sitemap.xml` are included; `thanks.html` is `noindex`.
  All absolute SEO URLs point to the **final domain `https://casatriniformentera.com/`** —
  correct once the domain is pointed at this site (see below); no change needed then.

## Deploy

Drag the folder onto [Netlify](https://app.netlify.com/drop), push to GitHub
Pages, or upload to any web host — it's fully static.

---
Photography © Jordi Gómez (jordigomezgallery.viewbook.com/album/casa-trini). The
gallery shows a curated selection; the full album has 300+ images. To swap or add
photos, edit the `GALLERY` array in `js/i18n.js`.
