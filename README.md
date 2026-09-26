# designtokens.pro
A guide on design tokens and how to master every single aspect of the process, from creating a naming convention to deploy them in production.

_Stay tuned_

## HTML pages and Markdown exports

Edit the HTML pages directly, including `index.html`, `privacy.html`, and
`compare.html`. Their layout, styles, and scripts remain in the HTML files.

Run `npm run build` to generate a `.md` file beside every site `.html` file.
`scripts/export-markdown.mjs` converts the main content (or the body when there
is no main element), preserving headings, links, lists, images, tables, and code.
It omits navigation, scripts, decorative SVGs, and explicitly hidden content.
Collapsed chapter details remain included. Relative links become absolute URLs.
Use `data-markdown-exclude` to omit an element from the export.

Dependencies, hidden directories, scripts, and tests are excluded from discovery.
Exports in `guide/` stay in that protected directory. The original chapter
sources in `content/guide/` are never overwritten.

Markdown exports are generated files: edit the corresponding HTML and rebuild.
`npm run dev` exports them before starting the server; during a running session,
run `npm run build` again after HTML changes. Vercel runs the same command.

`npm run build:guide` keeps its existing purpose: generate the guide HTML and PDF
from `content/guide/`. After rebuilding the guide, run `npm run build` to refresh
its Markdown exports too.
