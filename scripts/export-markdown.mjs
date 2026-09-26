import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import domino from '@mixmark-io/domino';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const siteUrl = 'https://www.designtokens.pro/';
const excludedDirectories = new Set(['node_modules', 'scripts', 'tests']);

export function htmlToMarkdown(html, relativePath) {
  const document = domino.createDocument(html);
  const pageUrl = new URL(relativePath.replace(/index\.html$/, '').replace(/\.html$/, ''), siteUrl);
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
  const sourceUrl = canonical ? new URL(canonical, pageUrl) : pageUrl;
  const content = document.querySelector('main') || document.body;
  const title = document.querySelector('title')?.textContent.trim() || relativePath;

  const select = (selector) => Array.from(content.querySelectorAll(selector));

  // Extract editorial content, including collapsed chapter details, without
  // navigation, scripts, decorative graphics or explicitly hidden elements.
  select('script, style, noscript, template, svg, canvas, iframe, nav, [hidden], [aria-hidden="true"], [data-markdown-exclude]')
    .forEach((node) => node.remove());
  if (content === document.body) {
    select('body > header, body > footer').forEach((node) => node.remove());
  }
  select('img').forEach((node) => {
    if (!node.getAttribute('alt')?.trim()) node.remove();
  });
  // Resolve URLs against the HTML location, so the Markdown also works when
  // downloaded or passed to an assistant outside the website.
  const baseHref = document.querySelector('base[href]')?.getAttribute('href');
  const baseUrl = baseHref ? new URL(baseHref, pageUrl) : pageUrl;
  for (const [selector, attribute] of [['a[href]', 'href'], ['img[src]', 'src']]) {
    select(selector).forEach((node) => {
      node.setAttribute(attribute, new URL(node.getAttribute(attribute), baseUrl).href);
    });
  }

  const converter = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });
  converter.use(gfm);
  // Card links can contain whole headings and paragraphs. Keep that structure
  // outside the link instead of emitting invalid multiline Markdown labels.
  converter.addRule('blockLink', {
    filter: (node) => node.nodeName === 'A' && Boolean(node.querySelector('h1, h2, h3, h4, h5, h6, p, div')),
    replacement: (text, node) => {
      const heading = node.querySelector('h1, h2, h3, h4, h5, h6');
      const label = (heading?.textContent || node.textContent).trim().replace(/\s+/g, ' ');
      const link = `[${converter.escape(label)}](<${node.getAttribute('href')}>)`;
      return `\n\n${text.trim()}\n\n${link}\n\n`;
    },
  });
  converter.addRule('summary', {
    filter: 'summary',
    replacement: (text) => `\n\n${text.trim()}\n\n`,
  });
  let markdown = converter.turndown(content.innerHTML).replace(/^[\t ]+$/gm, '');
  if (!content.querySelector('h1')) markdown = `# ${title}\n\n${markdown}`;
  return `<!-- Generated from ${relativePath} by scripts/export-markdown.mjs. Edit the HTML source. -->\n\nSource: ${sourceUrl.href}\n\n${markdown.trim()}\n`;
}

export function exportPages(root = projectRoot) {
  const pages = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith('.') || excludedDirectories.has(entry.name)) continue;
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile() && entry.name.endsWith('.html')) pages.push(file);
    }
  }
  visit(root);
  for (const file of pages) {
    const relativePath = path.relative(root, file).split(path.sep).join('/');
    const markdown = htmlToMarkdown(fs.readFileSync(file, 'utf8'), relativePath);
    fs.writeFileSync(file.replace(/\.html$/, '.md'), markdown);
  }
  return pages.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`Exported ${exportPages()} HTML pages to Markdown.`);
}
