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
