import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Marked } from 'marked';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'content', 'guide');
const outDir = path.join(root, 'guide');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: raw };
  }

  const data = {};
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf(':');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (/^\d+$/.test(value)) value = Number(value);
    data[key] = value;
  }

  return { data, body: match[2] };
}

function chapterSections(markdown) {
  const used = new Map();
  const sections = [];
  for (const line of markdown.split('\n')) {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const title = match[2].replace(/\s+#+\s*$/, '');
    let id = slugify(title) || 'section';
    const seen = used.get(id) || 0;
    used.set(id, seen + 1);
    if (seen > 0) id = `${id}-${seen + 1}`;
    sections.push({ depth: match[1].length, title, id });
  }
  return sections;
}

function loadChapters() {
  const files = fs
    .readdirSync(srcDir)
    .filter((name) => name.endsWith('.md'))
    .sort();

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(srcDir, file), 'utf8');
    const { data, body } = parseFrontmatter(raw);
    const fallbackSlug = slugify(file.replace(/\.md$/, '').replace(/^\d+-/, ''));
    return {
      file,
      title: data.title || fallbackSlug,
      slug: data.slug || fallbackSlug,
      order: data.order ?? 0,
      description: data.description || '',
      published: data.published !== false,
      body: body.trim(),
      sections: chapterSections(body),
    };
  }).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

function renderMarkdown(markdown, slugs, options = {}) {
  const idPrefix = options.idPrefix || '';
  const forPdf = options.forPdf === true;
  const used = new Map();
  const parser = new Marked();

  function headingId(text) {
    const plain = text.replace(/<[^>]+>/g, '');
    let id = slugify(plain) || 'section';
    const seen = used.get(id) || 0;
    used.set(id, seen + 1);
    if (seen > 0) id = `${id}-${seen + 1}`;
    return idPrefix ? `${idPrefix}-${id}` : id;
  }

  function resolveHref(href) {
    if (!href) return href;
    if (href.startsWith('#')) {
      return idPrefix ? `#${idPrefix}-${href.slice(1)}` : href;
    }
    if (href.startsWith('mailto:') || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('/')) {
      return href;
    }
    const [pathPart, hash] = href.split('#');
    const slug = slugify(pathPart.replace(/\.md$/, ''));
    if (!slugs.has(slug)) return href;
    if (forPdf) return `#${slug}${hash ? `-${hash}` : ''}`;
    return `/guide/${slug}${hash ? `#${hash}` : ''}`;
  }

  parser.use({
    gfm: true,
    renderer: {
      heading({ text, depth }) {
        const id = headingId(text);
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
      link({ href, title, text }) {
        const resolved = resolveHref(href || '');
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        const external = /^https?:\/\//.test(resolved) ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${escapeHtml(resolved)}"${titleAttr}${external}>${text}</a>`;
      },
    },
  });

  return parser.parse(markdown);
}

function chapterNav(chapters, currentSlug) {
  return chapters
    .map((chapter, index) => {
      const number = String(index + 1).padStart(2, '0');
      if (!chapter.published) {
        return `<li class="guide-nav-item is-soon"><span class="guide-nav-num">${number}</span><span>${escapeHtml(chapter.title)}</span><span class="guide-soon">Soon</span></li>`;
      }
      const current = chapter.slug === currentSlug ? ' aria-current="page"' : '';
      return `<li class="guide-nav-item"><a href="/guide/${chapter.slug}"${current}><span class="guide-nav-num">${number}</span><span>${escapeHtml(chapter.title)}</span></a></li>`;
    })
    .join('\n');
}

function sectionNav(sections) {
  if (sections.length === 0) return '';
  const items = sections
    .map((section) => `<li class="guide-section-item depth-${section.depth}"><a href="#${section.id}">${escapeHtml(section.title)}</a></li>`)
    .join('\n');
  return `<nav class="guide-sections" aria-label="On this page"><p class="guide-kicker">On this page</p><ol>${items}</ol></nav>`;
}

function pager(chapters, index) {
  const published = chapters.filter((chapter) => chapter.published);
  const current = published.indexOf(chapters[index]);
  if (current === -1) return '';
  const previous = published[current - 1];
  const next = published[current + 1];
  const previousLink = previous
    ? `<a class="guide-pager-link" href="/guide/${previous.slug}"><span>Previous</span><strong>${escapeHtml(previous.title)}</strong></a>`
    : '<span></span>';
  const nextLink = next
    ? `<a class="guide-pager-link is-next" href="/guide/${next.slug}"><span>Next</span><strong>${escapeHtml(next.title)}</strong></a>`
    : '<span></span>';
  return `<nav class="guide-pager" aria-label="Chapter">${previousLink}${nextLink}</nav>`;
}

function layout({ title, description, chapters, currentSlug, body }) {
  const descriptionTag = description
    ? `<meta name="description" content="${escapeHtml(description)}">`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} – Design Tokens Pro</title>
  ${descriptionTag}
  <meta name="robots" content="noindex, nofollow">
  <link rel="stylesheet" href="/css/style.compiled.css">
  <link rel="stylesheet" href="/css/guide.css">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/icon.png">
  <meta name="theme-color" content="#F4F3EF">
  <link rel="preload" href="/fonts/HubotSans-variable.woff2" as="font" type="font/woff2" crossorigin>
</head>
<body class="guide-body">
  <header class="guide-header">
    <a class="guide-logo" href="/"><img src="/img/logo.svg" alt="Design Tokens Pro"></a>
    <div class="guide-header-actions">
      <a class="guide-contents-link" href="/guide/">Contents</a>
      <a class="guide-pdf-link" href="/guide/design-tokens-pro.pdf" download>PDF Version</a>
    </div>
  </header>
  <div class="guide-shell">
    <aside class="guide-sidebar">
      <details class="guide-nav-disclosure" open>
        <summary>Chapters</summary>
        <nav aria-label="Chapters">
          <ol class="guide-nav">${chapterNav(chapters, currentSlug)}</ol>
        </nav>
      </details>
    </aside>
    <main class="guide-main">
      ${body}
    </main>
  </div>
</body>
</html>
`;
}

function indexPage(chapters) {
  const items = chapters
    .map((chapter, index) => {
      const number = String(index + 1).padStart(2, '0');
      if (!chapter.published) {
        return `<li class="guide-index-item is-soon"><span class="guide-nav-num">${number}</span><div><h2>${escapeHtml(chapter.title)}</h2><p>${escapeHtml(chapter.description)}</p></div><span class="guide-soon">Soon</span></li>`;
      }
      const sectionList = chapter.sections
        .filter((section) => section.depth === 2)
        .map((section) => `<li><a href="/guide/${chapter.slug}#${section.id}">${escapeHtml(section.title)}</a></li>`)
        .join('');
      return `<li class="guide-index-item"><a class="guide-index-title" href="/guide/${chapter.slug}"><span class="guide-nav-num">${number}</span><div><h2>${escapeHtml(chapter.title)}</h2><p>${escapeHtml(chapter.description)}</p></div></a><ol class="guide-index-sections">${sectionList}</ol></li>`;
    })
    .join('\n');

  return layout({
    title: 'Guide',
    description: 'Design Tokens Pro guide.',
    chapters,
    currentSlug: '',
    body: `<h1>Guide</h1><p class="guide-lede">Eight chapters. Read them in order, or open any chapter on its own.</p><ol class="guide-index">${items}</ol>`,
  });
}

function chapterPage(chapters, chapter, index, html) {
  return layout({
    title: chapter.title,
    description: chapter.description,
    chapters,
    currentSlug: chapter.slug,
    body: `<p class="guide-kicker">Chapter ${String(index + 1).padStart(2, '0')}</p><h1>${escapeHtml(chapter.title)}</h1>${sectionNav(chapter.sections)}<article class="guide-prose">${html}</article>${pager(chapters, index)}`,
  });
}

const chapters = loadChapters();
const slugs = new Set(chapters.filter((chapter) => chapter.published).map((chapter) => chapter.slug));
const duplicate = chapters.map((chapter) => chapter.slug).filter((slug, index, all) => all.indexOf(slug) !== index);
if (duplicate.length > 0) {
  throw new Error(`Duplicate chapter slug: ${duplicate.join(', ')}`);
}

fs.mkdirSync(outDir, { recursive: true });
for (const entry of fs.readdirSync(outDir)) {
  if (entry.endsWith('.html')) fs.unlinkSync(path.join(outDir, entry));
}

fs.writeFileSync(path.join(outDir, 'index.html'), indexPage(chapters));

chapters.forEach((chapter, index) => {
  if (!chapter.published) return;
  const html = renderMarkdown(chapter.body, slugs);
  fs.writeFileSync(path.join(outDir, `${chapter.slug}.html`), chapterPage(chapters, chapter, index, html));
});

console.log(`Built ${chapters.filter((chapter) => chapter.published).length} chapters in /guide`);

function pdfDocument(chapters) {
  const published = chapters.filter((chapter) => chapter.published);
  const toc = published
    .map((chapter, index) => {
      const number = String(index + 1).padStart(2, '0');
      const sections = chapter.sections
        .filter((section) => section.depth === 2)
        .map((section) => `<li><a href="#${chapter.slug}-${section.id}">${escapeHtml(section.title)}</a></li>`)
        .join('');
      return `<li><a class="pdf-toc-title" href="#${chapter.slug}"><span class="pdf-toc-num">${number}</span>${escapeHtml(chapter.title)}</a><ol class="pdf-toc-sections">${sections}</ol></li>`;
    })
    .join('\n');

  const body = published
    .map((chapter, index) => {
      const number = String(index + 1).padStart(2, '0');
      const html = renderMarkdown(chapter.body, slugs, { forPdf: true, idPrefix: chapter.slug });
      return `<section class="pdf-chapter" id="${chapter.slug}"><p class="pdf-kicker">Chapter ${number}</p><h2>${escapeHtml(chapter.title)}</h2><div class="pdf-body">${html}</div></section>`;
    })
    .join('\n');

  const stylesheet = path.join(root, 'css', 'guide-pdf.css');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Design Tokens Pro</title>
  <link rel="stylesheet" href="${stylesheet}">
</head>
<body>
  <section class="pdf-cover">
    <p class="pdf-kicker">Design Tokens Pro</p>
    <h1>The Guide</h1>
    <p>Taxonomy, naming, architecture, themes, and the life of a token. Eight chapters.</p>
  </section>
  <nav class="pdf-toc" aria-label="Contents">
    <h2>Contents</h2>
    <ol>${toc}</ol>
  </nav>
  ${body}
</body>
</html>`;
}

function writePdf(chapters) {
  const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const htmlPath = path.join(os.tmpdir(), 'design-tokens-pro-print.html');
  const pdfPath = path.join(outDir, 'design-tokens-pro.pdf');
  fs.writeFileSync(htmlPath, pdfDocument(chapters));
  const result = spawnSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdfPath}`,
    htmlPath,
  ], { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error('Chrome could not write the guide PDF');
  }
  console.log('Wrote /guide/design-tokens-pro.pdf');
}

writePdf(chapters);
