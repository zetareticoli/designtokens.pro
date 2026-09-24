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
    '/compare/design-systems-guide': '/compare-design-systems-guide.md',
    '/compare-design-systems-guide.html': '/compare-design-systems-guide.md',
    '/compare/design-tokens-101': '/compare-design-tokens-101.md',
    '/compare-design-tokens-101.html': '/compare-design-tokens-101.md',
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
    '/compare/design-systems-guide',
    '/compare/design-tokens-101',
    '/compare-subatomic.html',
    '/compare-design-systems-guide.html',
    '/compare-design-tokens-101.html',
  ],
};
