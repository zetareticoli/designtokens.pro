# SEO Audit — `index.html` (designtokens.pro)

**Scope:** homepage / landing page `index.html` and supporting crawl assets (`robots.txt`, `sitemap.xml`, OG/schema, media).  
**Site:** https://www.designtokens.pro/  
**Date:** 2026-09-10  
**Goal:** improve organic visibility for commercial + informational queries around design tokens.

---

## Executive summary

La homepage è già una **landing commerciale forte**: title/description decenti, H1 con keyword primaria, canonical, Open Graph/Twitter, FAQ on-page, outline dei capitoli, HTTPS e redirect apex→www.  
I gap principali per ranking Google sono:

1. **Schema markup insufficiente** (manca `Product`/`Offer` e `FAQPage`; `CreativeWork` è troppo generico).
2. **Performance / Core Web Vitals** a rischio (immagini ~1MB PNG non lazy, video MP4 ~5MB in autoplay).
3. **Superficie organica limitata** (quasi tutto il ranking dipende da una sola URL).
4. **Asset SEO dichiarati ma non live** (`index.md`, `llms.txt` → 404 in produzione; `robots.txt` live senza riga `Sitemap`).
5. **Inconsistenze di contenuto** (promessa “10 chapters”, in pagina solo 8) e **brand/nav deboli** per entity SEO.

Priorità: fix tecnici quick-win → schema → CWV → espansione contenuti/link building.

---

## Cosa funziona già

| Area | Stato |
|------|--------|
| HTTPS + HSTS | OK (Vercel) |
| Apex → www | 301 OK |
| `lang="en"` | OK |
| Canonical | `https://www.designtokens.pro/` |
| Title (~52 char) | Presente, keyword “design tokens” |
| Meta description (~152 char) | Presente, intent chiaro |
| H1 | “Learn everything about design tokens” |
| OG + Twitter cards | Presenti; `og-image.png` 1200×630 OK |
| Heading hierarchy | H1 → H2 sezioni → H3 capitoli/FAQ ragionevole |
| Alt text immagini | Presenti e descrittivi |
| Preview gallery | `loading="lazy"` + width/height |
| Plausible analytics | Privacy-friendly, non blocca crawl |
| 404 | `noindex` OK |
| Contenuto FAQ + chapter indexes | Buona densità semantica on-page |

---

## Findings (per impatto)

### P0 — Critici / quick win tecnici

#### 1. `index.md` e `llms.txt` in 404 in produzione
- In `index.html`: `<link rel="alternate" … href="…/index.md">`
- In `vercel.json`: header `Link: </llms.txt>; rel="describedby"`
- Live: entrambi **404**
- Impatto: signal rotto verso crawler/LLM; possibile “soft 404” reputation su URL linkate.
- Fix: verificare deploy degli asset root; assicurare che Vercel serva `.md`/`.txt` (già previsti header Content-Type). Aggiungere smoke test post-deploy.

#### 2. `robots.txt` live senza `Sitemap`
- Repo locale: `Sitemap: https://www.designtokens.pro/sitemap.xml`
- Produzione (78 byte): manca la riga Sitemap
- Fix: ridistribuire `robots.txt` aggiornato; verificare in Search Console.

#### 3. Schema.org insufficiente per intent commerciale
Attuale JSON-LD:

```json
{ "@type": "CreativeWork", "name": "Design Tokens Pro", … }
```

Manca:
- `@type: Product` (o `Book`) + `Offer` (price `39`, currency `USD`, availability)
- `@type: FAQPage` per le 4 FAQ
- `author` con URL (`https://francescoimprota.com/about`)
- `image`, `brand`, eventualmente `aggregateRating` solo se review reali

Impatto: meno eligibility a rich results (product/FAQ); entity meno chiara.

#### 4. Immagini “What you learn” pesanti e non ottimizzate
| File | Size |
|------|------|
| `tokens-vocabulary.png` | ~976 KB |
| `tokens-purpose.png` | ~1.1 MB |
| `tokens-process.png` | ~1.1 MB |
| `tokens-decisions.png` | ~21 KB |
| Hero webp | ~318 KB |
| `video.mp4` | ~5.0 MB |

Problemi SEO/CWV:
- tre PNG ~1MB **senza** `width`/`height` e **senza** `loading="lazy"`
- hero image senza dimensioni → CLS risk
- video `autoplay` + 5MB → LCP/TBT risk su mobile

---

### P1 — On-page SEO e content quality

#### 5. Title/description migliorabili per CTR e intent
- Title attuale: `Design Tokens Guide – From Basics to Advanced Topics`
- Non include brand **Design Tokens Pro** né benefit commerciale.
- Description ripete “design tokens” 3 volte (leggermente keyword-stuffy).

**Proposta title (≤60):**  
`Design Tokens Pro — Naming, Architecture & Themes Guide`

**Proposta description (≤155):**  
`Practical design tokens guide for designers and developers: taxonomy, naming conventions, architecture, themes, and tooling. Online + PDF — $39.`

#### 6. H1 vs brand / entity
- H1 keyword-oriented: buono per query.
- Nav: brand `DT–PRO` **commentato** → homepage senza logo/nome prodotto in header.
- Per Google Knowledge/entity: brand deve essere visibile e linkabile (home + author).

#### 7. Inconsistenza “10 chapters” vs 8 capitoli in pagina
- Hero chip: “10 chapters”
- Lista: capitoli 01–08 only
- Impatto E-E-A-T / trust; rischio bounce e review negative.

#### 8. Markup semantico FAQ senza JSON-LD
FAQ già con H3 + risposta: ottimo per utenti; manca `FAQPage` structured data.

#### 9. Sezione “Guide Materials” strutturata male
Nel DOM appare come `h4` orfano dentro la lista capitoli (dopo capitolo 08), non come blocco di sezione dedicato. Rende meno chiara la gerarchia contenuti.

#### 10. OG incompleto
Mancano tipici: `og:site_name`, `og:locale`, `og:image:width/height`, `og:image:alt`.  
Twitter: manca `twitter:image:alt`.

#### 11. Footer copyright `2024`
Segnale di freschezza debole; aggiornare anno (dinamico o 2026).

#### 12. Sitemap incompleta / opaca
Attuale:
- `/` (1.00)
- `/privacy` (0.80)

Note:
- `/join` esiste ma non è in sitemap (valutare se indexable o `noindex` se funnel obsoleto).
- `/confirm` non deve entrare in sitemap (thank-you).
- Nessun `changefreq` (opzionale); `lastmod` ok se aggiornato a ogni release contenuto.

#### 13. `site.webmanifest` fuori sync
`theme_color`/`background_color` `#fafafa` vs meta `theme-color` `#0A0A0A`. Minore per ranking, utile per consistenza PWA/brand.

---

### P2 — Architettura & crescita organica

#### 14. Single-page = tetto di ranking basso
Quasi tutte le keyword competono sulla stessa URL. Query long-tail (es. *design tokens naming convention*, *primitive vs semantic tokens*, *design tokens themes dark mode*, *style dictionary tokens*) sarebbero meglio servite da **articoli/capitoli pubblici** o landing secondarie.

#### 15. Internal linking debole
Solo anchor (`#section-chapters`, FAQ, Preview). Nessun hub → spoke. Link outbound checkout OK; manca rete interna di contenuti correlati.

#### 16. Contenuto gratuito indexabile limitato
I “two free chapters” sono gated (Kit/ConvertKit). Per SEO serve almeno 1–2 pezzi evergreen pubblici (o un capitolo free on-site) che linkano alla guida.

#### 17. Video senza accessibilità/SEO testuale
Nessun `track`/transcript/caption. Google non “legge” bene il video senza testo correlato.

#### 18. Cache asset statici
HTML con `max-age=0` è accettabile; aggiungere header cache lunghi per `/img/*`, `/fonts/*`, `/css/*`, `/js/*` in `vercel.json` aiuta LCP ripetuti.

---

## Keyword map (indicativa)

| Intent | Query esempio | Target |
|--------|---------------|--------|
| Commercial | design tokens guide, design tokens course, learn design tokens | Homepage |
| Informational | what is a design token, design tokens vs variables | Future article / free chapter |
| How-to | design tokens naming convention, token taxonomy | Future article + chapter 02/04 |
| Architecture | primitive semantic component tokens | Future article + chapter 03 |
| Themes | design tokens dark mode, multi-brand tokens | Future article + chapter 06 |
| Brand | Design Tokens Pro, Francesco Improta design tokens | Homepage + author |

---

## Piano di interventi (priorizzato)

### Fase A — Quick wins tecnici (prima release)

1. **Deploy fix** `robots.txt` (Sitemap), `index.md`, `llms.txt` + verifica HTTP 200.
2. **Arricchire meta OG/Twitter** (`site_name`, `locale`, image size/alt).
3. **Rifinire title + meta description** (brand + benefit + prezzo opzionale).
4. **JSON-LD**: sostituire/estendere con `@graph` contenente `WebPage` + `Product`/`Offer` + `Person` + `FAQPage`.
5. **Immagini**: convertire `tokens-*.png` pesanti in WebP/AVIF; aggiungere `width`/`height` + `loading="lazy"` (hero: `fetchpriority="high"`, no lazy).
6. **Video**: rimuovere `autoplay` (o caricare solo su intent/click); comprimere; aggiungere poster ottimizzato; valutare `preload="none"`.
7. **Brand in nav**: ripristinare link logo/nome → `/`.
8. **Allineare “10 chapters”** al contenuto reale (o pubblicare i 2 capitoli mancanti).
9. **Footer year** aggiornato.
10. **Search Console**: conferma proprietà, submit sitemap, monitoraggio Coverage/CWV.

### Fase B — On-page & UX SEO

1. Riorganizzare “Guide Materials” come sezione propria (H2).
2. Aggiungere copy SEO leggero su benefit + audience senza keyword stuffing.
3. Alt più specifici sulle preview (cosa mostra la pagina, non solo “page N”).
4. Cache headers per asset statici in `vercel.json`.
5. Allineare `site.webmanifest` ai colori brand.
6. Valutare `noindex` su `/join` se non più nel funnel primario; altrimenti includere in sitemap.

### Fase C — Crescita ranking (contenuti + authority)

1. Pubblicare 4–6 articoli evergreen (o capitoli free) su URL dedicate, linkate dalla homepage.
2. Creare hub `/guide` o `/learn` con internal links ai topic.
3. Guest post / talk / LinkedIn → backlink verso homepage e articoli pillar.
4. Ottenere citazioni da design-system communities (Sparkbox, Into Design Systems, etc.).
5. Considerare versioning contenuti + `lastmod` sitemap per segnalare freschezza.
6. (Opzionale) hreflang solo se uscite edizioni localizzate.

### Fase D — Misurazione

| Metrica | Dove |
|---------|------|
| Impressioni / CTR query | Google Search Console |
| Posizioni brand vs non-brand | GSC |
| LCP / INP / CLS mobile | PageSpeed Insights + CrUX |
| Conversioni checkout / lead free chapters | Plausible goals / Kit |
| Index coverage di nuove URL | GSC |

Cadenza: review GSC settimanale per 4–6 settimane post Fase A; CWV dopo ottimizzazione immagini/video.

---

## Checklist implementativa (copy-paste)

### Meta & head
- [ ] Title con brand + primary keyword
- [ ] Description CTR-oriented ≤155
- [ ] `og:site_name`, `og:locale`, `og:image:width/height/alt`
- [ ] `twitter:image:alt`
- [ ] Verificare alternate `index.md` → 200
- [ ] Verificare `llms.txt` → 200

### Structured data
- [ ] `Product` + `Offer` ($39 USD)
- [ ] `FAQPage` (4 Q&A)
- [ ] `Person` author con `url` / `sameAs`
- [ ] Validare con Rich Results Test

### Media / performance
- [ ] WebP per tokens-vocabulary/purpose/process
- [ ] width/height su tutte le img
- [ ] lazy below-the-fold; `fetchpriority` hero
- [ ] video senza autoplay o lazy-load
- [ ] cache headers static assets

### Content / IA
- [ ] Brand in header
- [ ] Fix conteggio capitoli
- [ ] Sezione Guide Materials autonoma
- [ ] Copyright year
- [ ] robots Sitemap live
- [ ] sitemap policy join/confirm

---

## Stima impatto

| Intervento | Impatto ranking | Effort |
|------------|-----------------|--------|
| Schema Product + FAQ | Medio (rich results / clarity) | Basso |
| Fix robots/md/llms deploy | Basso–medio (crawl hygiene) | Basso |
| Compressione immagini + video | Medio (CWV → ranking/UX) | Medio |
| Title/description CTR | Medio (CTR SERP) | Basso |
| Contenuti pillar + internal links | **Alto** (nuove keyword) | Alto |
| Backlink / authority | **Alto** | Alto / continuo |

Senza Fase C (contenuti + link), i fix tecnici migliorano qualità e CTR ma **non sbloccano da soli** ranking competitivi su query informative ad alto volume.

---

## Riferimenti file

- `index.html` — pagina analizzata
- `robots.txt`, `sitemap.xml` — crawl
- `vercel.json` — headers/rewrites (llms/md)
- `index.md`, `llms.txt` — alternate / AI discovery
- `img/og-image.png` — social preview (1200×630)
- `media/video.mp4` — sneak peek (~5MB)
