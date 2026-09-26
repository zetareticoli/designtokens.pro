import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { exportPages, htmlToMarkdown } from '../scripts/export-markdown.mjs';

test('exports semantic content, resolving links and preserving code, tables and closed details', () => {
  const html = `<!doctype html><html><head><title>Example</title></head><body>
    <header>GLOBAL HEADER</header><main><h1>Tokens &amp; themes</h1>
    <nav>NAVIGATION</nav><script>SECRET_SCRIPT</script><svg><text>DECORATION</text></svg>
    <p hidden>HIDDEN CONTENT</p><p aria-hidden="true">HIDDEN LABEL</p>
    <p data-markdown-exclude>EXCLUDED CONTENT</p><!-- OLD CONTENT -->
    <p><strong>Strong</strong> and <em>emphasis</em>. <a href="../privacy#cookies">Privacy</a></p>
    <img src="../img/example.png" alt="Token diagram"><img src="decorative.png" alt="">
    <ul><li>First</li><li>Second</li></ul>
    <pre><code class="language-json">{"color": "#fff"}</code></pre>
    <table><thead><tr><th>Name</th><th>Value</th></tr></thead><tbody><tr><td>Color</td><td>Blue</td></tr></tbody></table>
    <details><summary>Chapter details</summary><p>Collapsed content remains available.</p></details>
    <a href="./next"><h2>Next chapter</h2><p>Chapter description</p></a>
    </main><footer>GLOBAL FOOTER</footer></body></html>`;
  const md = htmlToMarkdown(html, 'guide/example.html');
  assert.match(md, /# Tokens & themes/);
  assert.match(md, /\*\*Strong\*\* and _emphasis_/);
  assert.match(md, /\[Privacy\]\(https:\/\/www.designtokens.pro\/privacy#cookies\)/);
  assert.match(md, /!\[Token diagram\]\(https:\/\/www.designtokens.pro\/img\/example.png\)/);
  assert.match(md, /```json\n\{"color": "#fff"\}\n```/);
  assert.match(md, /\| Name \| Value \|/);
  assert.match(md, /Collapsed content remains available/);
  assert.match(md, /## Next chapter/);
  assert.match(md, /\[Next chapter\]\(<https:\/\/www.designtokens.pro\/guide\/next>\)/);
  assert.doesNotMatch(md, /GLOBAL|NAVIGATION|SECRET_SCRIPT|DECORATION|HIDDEN|EXCLUDED|OLD CONTENT|decorative.png/);
});

test('uses the body for landing pages without main and removes global navigation', () => {
  const md = htmlToMarkdown('<html><head><title>Landing</title></head><body><header>MENU</header><section><h1>Welcome</h1><p>Visible copy</p></section><footer>FOOTER</footer></body></html>', 'index.html');
  assert.match(md, /# Welcome/);
  assert.match(md, /Visible copy/);
  assert.doesNotMatch(md, /MENU|FOOTER/);
});

test('exports all site pages beside their HTML without changing sources or protected paths', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'html-markdown-'));
  try {
    const html = '<html><head><title>Example</title></head><body><h1>Original</h1></body></html>';
    for (const dir of ['guide', 'content/guide', 'scripts/templates', 'node_modules/example', '.git']) fs.mkdirSync(path.join(root, dir), { recursive: true });
    for (const file of ['index.html', 'privacy.html', 'compare.html', 'guide/index.html', 'guide/basics.html', 'scripts/templates/example.html', 'node_modules/example/index.html', '.git/example.html']) fs.writeFileSync(path.join(root, file), html);
    fs.writeFileSync(path.join(root, 'content/guide/basics.md'), 'Original chapter source');
    assert.equal(exportPages(root), 5);
    for (const file of ['index', 'privacy', 'compare', 'guide/index', 'guide/basics']) {
      assert.equal(fs.readFileSync(path.join(root, `${file}.html`), 'utf8'), html);
      assert.match(fs.readFileSync(path.join(root, `${file}.md`), 'utf8'), /# Original/);
    }
    assert.equal(fs.existsSync(path.join(root, 'guide.md')), false);
    assert.equal(fs.existsSync(path.join(root, 'scripts/templates/example.md')), false);
    assert.equal(fs.existsSync(path.join(root, 'node_modules/example/index.md')), false);
    assert.equal(fs.readFileSync(path.join(root, 'content/guide/basics.md'), 'utf8'), 'Original chapter source');
    const first = fs.readFileSync(path.join(root, 'index.md'), 'utf8');
    exportPages(root);
    assert.equal(fs.readFileSync(path.join(root, 'index.md'), 'utf8'), first);
    fs.writeFileSync(path.join(root, 'compare.html'), html.replace('Original', 'Changed copy'));
    exportPages(root);
    assert.match(fs.readFileSync(path.join(root, 'compare.md'), 'utf8'), /# Changed copy/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
