# Casa Trini Formentera — website

A static, multilingual marketing & booking site for **Casa Trini Formentera**, a rustic holiday home on Formentera. No build step, no framework — just open it or drop it on any static host.

Modelled on the original https://casatriniformentera.com/, expanded with 6 languages, a full gallery with lightbox, an amenities section, a map, and an inquiry form + booking links.

**Live site:** hosted on GitHub Pages from the `main` branch of
[emilianionascu/casa-trini](https://github.com/emilianionascu/casa-trini) →
https://emilianionascu.github.io/casa-trini/. To update the live site, commit and
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

## Run it locally

Just open `index.html` in a browser. For the Google map iframe and the form to
behave exactly as in production, serve it over HTTP instead:

```powershell
# from the project folder — pick one
py -m http.server 8080         # then open http://localhost:8080
npx serve .
```

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
auto-detects the visitor's browser language on first visit. The brand tagline
*"Vive Formentera auténtica"* is intentionally kept in Spanish in every language.

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
