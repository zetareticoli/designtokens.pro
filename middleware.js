/**
 * Content negotiation: serve Markdown when Accept includes text/markdown.
 * Discovery Link headers for llms.txt are set in vercel.json.
 */
export default function middleware(request) {
  const accept = request.headers.get('accept') || '';
  const wantsMarkdown =
    accept.includes('text/markdown') || accept.includes('text/x-markdown');

  if (!wantsMarkdown) {
    return;
  }

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, '') || '/';

  const mdMap = {
    '/': '/index.md',
    '/index.html': '/index.md',
    '/privacy': '/privacy.md',
    '/privacy.html': '/privacy.md',
    '/join': '/join.md',
    '/join.html': '/join.md',
    '/compare': '/compare.md',
    '/compare.html': '/compare.md',
    '/compare/subatomic': '/compare-subatomic.md',
    '/compare-subatomic.html': '/compare-subatomic.md',
    '/compare/figma-variables': '/compare-figma-variables.md',
    '/compare-figma-variables.html': '/compare-figma-variables.md',
    '/compare/style-dictionary': '/compare-style-dictionary.md',
    '/compare-style-dictionary.html': '/compare-style-dictionary.md',
    '/compare/tokens-studio': '/compare-tokens-studio.md',
    '/compare-tokens-studio.html': '/compare-tokens-studio.md',
    '/compare/dtcg-spec': '/compare-dtcg-spec.md',
    '/compare-dtcg-spec.html': '/compare-dtcg-spec.md',
  };

  const mdPath = mdMap[pathname];
  if (!mdPath) {
    return;
  }

  // Internal rewrite (Vercel Edge Middleware convention)
  const rewriteUrl = new URL(mdPath, url);
  return new Response(null, {
    status: 200,
    headers: {
      'x-middleware-rewrite': rewriteUrl.toString(),
      Vary: 'Accept',
    },
  });
}

export const config = {
  matcher: [
    '/',
    '/index.html',
    '/privacy',
    '/privacy.html',
    '/join',
    '/join.html',
    '/compare',
    '/compare.html',
    '/compare/subatomic',
    '/compare/figma-variables',
    '/compare/style-dictionary',
    '/compare/tokens-studio',
    '/compare/dtcg-spec',
    '/compare-subatomic.html',
    '/compare-figma-variables.html',
    '/compare-style-dictionary.html',
    '/compare-tokens-studio.html',
    '/compare-dtcg-spec.html',
  ],
};
