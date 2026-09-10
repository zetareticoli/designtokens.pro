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

## Ownership — chi fa cosa

### Agent (implementabile in codice / PR)

Interventi tecnici e on-page che posso applicare direttamente sul repo, senza accessi esterni né decisioni di prodotto/contenuto.

| ID | Intervento | Note |
|----|------------|------|
| A1 | Meta title + description CTR/brand | Testo proposto; override tuo se preferisci altro wording |
| A2 | OG/Twitter completi (`site_name`, `locale`, image size/alt) | |
| A3 | JSON-LD `@graph`: `WebPage` + `Product`/`Offer` + `Person` + `FAQPage` | Niente `aggregateRating` senza review reali |
| A4 | Attributi `width`/`height`, `loading="lazy"`, `fetchpriority` hero | |
| A5 | Conversione PNG pesanti → WebP + update `src` in HTML | |
| A6 | Video: togliere `autoplay`, `preload="none"`, poster più leggero se fattibile | Compressione aggressiva del MP4: meglio se fornisci master |
| A7 | Brand/logo link in nav → `/` | Ripristino del link commentato |
| A8 | Chip capitoli allineato agli 8 in pagina | Finché non esistono i 2 mancanti |
| A9 | Footer year → 2026 (o dinamico) | |
| A10 | Sezione “Guide Materials” autonoma (H2) | Fix gerarchia DOM |
| A11 | Alt preview più specifici | Basati sul contenuto visibile delle pagine |
| A12 | Cache headers statici in `vercel.json` | `/img`, `/fonts`, `/css`, `/js`, `/media` |
| A13 | Allineare `site.webmanifest` a `theme-color` brand | |
| A14 | Garantire `robots.txt` con `Sitemap` nel repo | Il 200 live arriva col merge/deploy |
| A15 | Smoke-check post-merge su `index.md` / `llms.txt` / robots | Dopo il tuo deploy Vercel |

**Fuori dallo scope agent senza tuo go-ahead:** nuovi articoli/pagine pillar, rewrite copy marketing lungo, `noindex` su `/join`, transcript video, backlink outreach.

### Tu (accessi, decisioni, contenuti, authority)

| ID | Intervento | Perché resta a te |
|----|------------|-------------------|
| U1 | Merge PR + deploy Vercel | Controllo release |
| U2 | Google Search Console: verifica proprietà, submit sitemap, Coverage/CWV | Account Google |
| U3 | Verificare in GSC/browser che `robots.txt`, `index.md`, `llms.txt` rispondano 200 | Post-deploy |
| U4 | Decidere destino `/join` (`noindex` vs includere in sitemap) | Decisione funnel |
| U5 | Confermare se i capitoli sono 8 o 10; se 10, fornire titoli/outline dei 2 mancanti | Contenuto prodotto |
| U6 | Approvare wording title/description/schema (prezzo in SERP, tone of voice) | Brand |
| U7 | Validare rich results (Rich Results Test) dopo deploy | Preferibile dal tuo dominio live |
| U8 | Scrivere/pubblicare 4–6 pezzi evergreen o 1+ capitolo free on-site | Contenuto editoriale |
| U9 | Hub `/guide` o `/learn` + strategia internal linking | IA del sito / priorità prodotto |
| U10 | Transcript/captions del video sneak peek | Asset editoriale |
| U11 | Outreach: guest post, talk, LinkedIn, community DS | Relazioni / personal brand |
| U12 | Citazioni/backlink (Sparkbox, Into Design Systems, ecc.) | Authority off-site |
| U13 | Goal Plausible + tracking conversioni Kit | Analytics account |
| U14 | Review GSC settimanale 4–6 settimane post go-live Fase A | Monitoraggio continuo |
| U15 | (Opzionale) hreflang / edizioni localizzate | Solo se esce prodotto tradotto |
| U16 | `aggregateRating` in schema | Solo con recensioni verificabili |

### Collaborazione tipica

1. **Agent** implementa A1–A14 in PR.
2. **Tu** fai U1 (merge/deploy) + U6 se vuoi tweak di copy prima del merge.
3. **Tu** fai U2–U3–U7 (Search Console + verifica live).
4. **Agent** può supportare U8–U9 in un secondo ciclo *dopo* brief/contenuti da te (outline, tono, URL target).
5. **Tu** guidi U11–U14 (authority + misura); l’agent non può fare outreach al posto tuo.

---

## Piano di interventi (priorizzato, con owner)

### Fase A — Quick wins tecnici

| Step | Owner | Ref |
|------|-------|-----|
| Meta title/description | Agent | A1 |
| OG/Twitter | Agent | A2 |
| JSON-LD Product + FAQ + Person | Agent | A3 |
| Img attrs + WebP | Agent | A4–A5 |
| Video autoplay/preload | Agent | A6 |
| Brand nav + chapters chip + year | Agent | A7–A9 |
| robots Sitemap in repo | Agent | A14 |
| Merge/deploy | **Tu** | U1 |
| Search Console + verify live assets | **Tu** | U2–U3 |
| Approvare copy SERP | **Tu** | U6 |

### Fase B — On-page & UX SEO

| Step | Owner | Ref |
|------|-------|-----|
| Guide Materials come sezione H2 | Agent | A10 |
| Alt preview più specifici | Agent | A11 |
| Cache headers + webmanifest | Agent | A12–A13 |
| Policy `/join` in sitemap o noindex | **Tu** (decisione) → Agent applica | U4 |
| Conteggio 8 vs 10 capitoli | **Tu** (decisione) → Agent applica | U5 |

### Fase C — Crescita ranking

| Step | Owner | Ref |
|------|-------|-----|
| Articoli evergreen / capitolo free | **Tu** (+ Agent su scaffold HTML se richiesto) | U8 |
| Hub `/guide` o `/learn` | **Tu** brief → Agent implementa struttura | U9 |
| Transcript video | **Tu** | U10 |
| Backlink / community / guest post | **Tu** | U11–U12 |

### Fase D — Misurazione

| Step | Owner | Ref |
|------|-------|-----|
| GSC impressioni/CTR/posizioni | **Tu** | U2, U14 |
| PageSpeed / CrUX dopo fix media | **Tu** (check) / Agent (re-fix se regressione) | U7 |
| Conversioni Plausible/Kit | **Tu** | U13 |

Cadenza consigliata: review GSC settimanale per 4–6 settimane dopo il deploy della Fase A.

---

## Checklist

### Agent
- [x] A1 Title + description
- [x] A2 OG/Twitter completi
- [x] A3 JSON-LD Product + FAQ + Person
- [x] A4 width/height + lazy / fetchpriority
- [x] A5 WebP immagini pesanti
- [x] A6 Sezione video rimossa (per richiesta)
- [x] A7 Brand in nav
- [x] A8 Chip capitoli (8) — confermato dal maintainer
- [x] A9 Copyright year
- [x] A10 Guide Materials sezione autonoma
- [x] A11 Alt preview
- [x] A12 Cache headers `vercel.json`
- [x] A13 `site.webmanifest` colori
- [x] A14 `robots.txt` Sitemap (già presente in repo)

### Tu
- [ ] U1 Merge + deploy
- [ ] U2 Search Console + submit sitemap
- [ ] U3 Verifica 200 su robots / index.md / llms.txt
- [ ] U4 Decisione `/join`
- [ ] U5 Decisione 8 vs 10 capitoli
- [ ] U6 Approve copy SERP/schema
- [ ] U7 Rich Results Test
- [ ] U8 Contenuti evergreen
- [ ] U9 Hub contenuti
- [ ] U10 Transcript video
- [ ] U11–U12 Outreach / backlink
- [ ] U13 Goals analytics
- [ ] U14 Review GSC ricorrente

---

## Stima impatto

| Intervento | Impatto ranking | Effort | Owner |
|------------|-----------------|--------|-------|
| Schema Product + FAQ | Medio | Basso | Agent |
| Fix robots/md/llms (repo + deploy) | Basso–medio | Basso | Agent + Tu (deploy) |
| Compressione immagini + video | Medio | Medio | Agent |
| Title/description CTR | Medio | Basso | Agent (+ Tu approve) |
| Contenuti pillar + internal links | **Alto** | Alto | **Tu** (+ Agent scaffold) |
| Backlink / authority | **Alto** | Alto / continuo | **Tu** |

Senza la tua Fase C (contenuti + link), i fix tecnici migliorano qualità e CTR ma **non sbloccano da soli** ranking competitivi su query informative ad alto volume.

---

## Riferimenti file

- `index.html` — pagina analizzata
- `robots.txt`, `sitemap.xml` — crawl
- `vercel.json` — headers/rewrites (llms/md)
- `index.md`, `llms.txt` — alternate / AI discovery
- `img/og-image.png` — social preview (1200×630)
- `media/video.mp4` — sneak peek (~5MB)
