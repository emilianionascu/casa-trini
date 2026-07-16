# Moving casatriniformentera.com to the new website (GitHub Pages)

The new Casa Trini website is ready and live at
**https://themayans.github.io/casa-trini/**. To make it appear at
**https://casatriniformentera.com/**, two people each do one part, **in this order**:

1. **Part A — the domain administrator** changes the DNS records.
2. **Part B — the GitHub owner** connects the domain and switches the site config.

> ⚠️ Once both parts are done, the domain shows the **new** website instead of the old
> one. Keep the old hosting account active (don't cancel it) for a couple of weeks as a
> fallback — reverting is just restoring the old DNS records.

---

## PART A — For the domain administrator (DNS)

*(Versión en español más abajo.)*

In the DNS zone for **casatriniformentera.com**, please make these changes:

**1. Apex domain — `casatriniformentera.com` (name `@`):**
Delete the existing `A` (and `AAAA`, if any) records for `@`, and create **four new A records**:

| Type | Name | Value              |
|------|------|--------------------|
| A    | @    | 185.199.108.153    |
| A    | @    | 185.199.109.153    |
| A    | @    | 185.199.110.153    |
| A    | @    | 185.199.111.153    |

Optionally also four `AAAA` records (IPv6): `2606:50c0:8000::153`, `2606:50c0:8001::153`,
`2606:50c0:8002::153`, `2606:50c0:8003::153`.

**2. `www` subdomain:**
Delete any existing `A`/`CNAME` record for `www`, and create **one CNAME record**:

| Type  | Name | Value                 |
|-------|------|-----------------------|
| CNAME | www  | themayans.github.io   |

**Important:**
- Do **not** change anything else — leave MX (email), TXT, and all other records as they are.
- Use the default TTL (or 300–3600 s to speed up propagation).
- If there is a CAA record, it must permit `letsencrypt.org` (or simply have no CAA record).
- When saved, please confirm to the site owner that it's done.

### Versión en español

En la zona DNS de **casatriniformentera.com**, por favor realice estos cambios:

**1. Dominio raíz — `casatriniformentera.com` (nombre `@`):**
Elimine los registros `A` (y `AAAA`, si existen) actuales de `@` y cree **cuatro registros A nuevos**:

| Tipo | Nombre | Valor              |
|------|--------|--------------------|
| A    | @      | 185.199.108.153    |
| A    | @      | 185.199.109.153    |
| A    | @      | 185.199.110.153    |
| A    | @      | 185.199.111.153    |

Opcionalmente, cuatro registros `AAAA` (IPv6): `2606:50c0:8000::153`, `2606:50c0:8001::153`,
`2606:50c0:8002::153`, `2606:50c0:8003::153`.

**2. Subdominio `www`:**
Elimine cualquier registro `A`/`CNAME` existente de `www` y cree **un registro CNAME**:

| Tipo  | Nombre | Valor                 |
|-------|--------|-----------------------|
| CNAME | www    | themayans.github.io   |

**Importante:**
- **No** cambie nada más: deje los registros MX (correo), TXT y demás tal como están.
- Use el TTL por defecto (o 300–3600 s para acelerar la propagación).
- Si existe un registro CAA, debe permitir `letsencrypt.org` (o simplemente no tener CAA).
- Al guardar, por favor confirme al propietario del sitio que está hecho.

---

## PART B — For the GitHub owner (after Part A is confirmed)

You own the org **themayans** and the repo **themayans/casa-trini**.

**1. Connect the domain in GitHub:**
- Open https://github.com/themayans/casa-trini/settings/pages
- Under **Custom domain**, enter `casatriniformentera.com` and click **Save**.
- GitHub runs a DNS check. Wait until it shows **“DNS check successful.”**
  (If it fails, DNS hasn't propagated yet — wait 15–60 min and click Save again.)

**2. Enforce HTTPS:**
- On the same page, GitHub automatically requests a TLS certificate (takes a few
  minutes up to ~1 hour after the DNS check passes).
- When the checkbox becomes available, tick **“Enforce HTTPS.”**

**3. Switch the site itself to root-domain mode** (the code currently builds for
`/casa-trini`; at the domain it must build for `/`). Three things change:
- `_config.yml`: `url: "https://casatriniformentera.com"` and `baseurl: ""`
- `scripts/build-home.js`: `BASE = ""`
- Regenerate the homepages (`npm run build:home`), commit, push.

> Easiest: ask Claude — “DNS is done, do the domain cutover” — and this whole step,
> plus verification, is handled and deployed for you.

**4. Verify:**
- https://casatriniformentera.com/ shows the new Spanish homepage
- https://casatriniformentera.com/en/ (and /de/ /it/ /fr/ /sv/) work
- https://casatriniformentera.com/blog/ shows the blog
- https://www.casatriniformentera.com/ redirects to the apex
- The padlock (valid HTTPS certificate) shows in the browser

**Rollback (if ever needed):** the domain administrator restores the previous DNS
records — the old site reappears as DNS propagates. Nothing on GitHub needs undoing.

---

# Versiunea în română

## Mutarea domeniului casatriniformentera.com pe noul site (GitHub Pages)

Noul site Casa Trini este gata și funcționează la
**https://themayans.github.io/casa-trini/**. Pentru ca el să apară la
**https://casatriniformentera.com/**, două persoane fac fiecare câte o parte,
**în această ordine**:

1. **Partea A — administratorul domeniului** modifică înregistrările DNS.
2. **Partea B — proprietarul GitHub** conectează domeniul și comută configurația site-ului.

> ⚠️ După finalizarea ambelor părți, domeniul va afișa site-ul **nou** în locul celui
> vechi. Păstrați activ vechiul hosting (nu-l anulați) încă vreo două săptămâni, ca
> rezervă — revenirea înseamnă doar restaurarea vechilor înregistrări DNS.

### PARTEA A — Pentru administratorul domeniului (DNS)

În zona DNS a domeniului **casatriniformentera.com**, vă rugăm să faceți următoarele modificări:

**1. Domeniul rădăcină — `casatriniformentera.com` (numele `@`):**
Ștergeți înregistrările `A` (și `AAAA`, dacă există) actuale pentru `@` și creați
**patru înregistrări A noi**:

| Tip | Nume | Valoare            |
|-----|------|--------------------|
| A   | @    | 185.199.108.153    |
| A   | @    | 185.199.109.153    |
| A   | @    | 185.199.110.153    |
| A   | @    | 185.199.111.153    |

Opțional, și patru înregistrări `AAAA` (IPv6): `2606:50c0:8000::153`,
`2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.

**2. Subdomeniul `www`:**
Ștergeți orice înregistrare `A`/`CNAME` existentă pentru `www` și creați
**o înregistrare CNAME**:

| Tip   | Nume | Valoare               |
|-------|------|-----------------------|
| CNAME | www  | themayans.github.io   |

**Important:**
- **Nu** modificați nimic altceva — lăsați neatinse înregistrările MX (e-mail), TXT și celelalte.
- Folosiți TTL-ul implicit (sau 300–3600 s pentru o propagare mai rapidă).
- Dacă există o înregistrare CAA, ea trebuie să permită `letsencrypt.org` (sau pur și simplu să nu existe CAA).
- După salvare, vă rugăm să confirmați proprietarului site-ului că ați terminat.

### PARTEA B — Pentru proprietarul GitHub (după confirmarea Părții A)

Dețineți organizația **themayans** și repository-ul **themayans/casa-trini**.

**1. Conectați domeniul în GitHub:**
- Deschideți https://github.com/themayans/casa-trini/settings/pages
- La **Custom domain**, introduceți `casatriniformentera.com` și apăsați **Save**.
- GitHub rulează o verificare DNS. Așteptați până apare **„DNS check successful”**.
  (Dacă eșuează, DNS-ul nu s-a propagat încă — așteptați 15–60 de minute și apăsați Save din nou.)

**2. Activați HTTPS:**
- Pe aceeași pagină, GitHub solicită automat un certificat TLS (durează de la câteva
  minute până la ~1 oră după trecerea verificării DNS).
- Când caseta devine disponibilă, bifați **„Enforce HTTPS”**.

**3. Comutați site-ul pe modul domeniu-rădăcină** (codul este construit acum pentru
`/casa-trini`; pe domeniu trebuie construit pentru `/`). Se schimbă trei lucruri:
- `_config.yml`: `url: "https://casatriniformentera.com"` și `baseurl: ""`
- `scripts/build-home.js`: `BASE = ""`
- Regenerați paginile (`npm run build:home`), commit, push.

> Cel mai simplu: spuneți-i lui Claude — „DNS-ul e gata, fă cutover-ul de domeniu” —
> iar acest pas, împreună cu verificarea, se execută și se publică automat.

**4. Verificați:**
- https://casatriniformentera.com/ afișează noua pagină principală (în spaniolă)
- https://casatriniformentera.com/en/ (și /de/ /it/ /fr/ /sv/) funcționează
- https://casatriniformentera.com/blog/ afișează blogul
- https://www.casatriniformentera.com/ redirecționează către domeniul rădăcină
- Lacătul (certificat HTTPS valid) apare în browser

**Revenire (dacă este vreodată nevoie):** administratorul domeniului restaurează vechile
înregistrări DNS — site-ul vechi reapare pe măsură ce DNS-ul se propagă. În GitHub nu
trebuie anulat nimic.
