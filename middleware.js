import { hasGuideCookie } from './lib/guide-session.mjs';

/**
 * Content negotiation: serve Markdown when Accept includes text/markdown.
 * Discovery Link headers for llms.txt are set in vercel.json.
 * /guide is served only after /api/access sets a signed cookie.
 */
export default async function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, '') || '/';
  const guidePath = pathname === '/guide' || pathname.startsWith('/guide/') || pathname.startsWith('/content/guide');

  if (guidePath) {
    const allowed = await hasGuideCookie(request.headers.get('cookie') || '', process.env.GUIDE_ACCESS_SECRET || '');
    if (!allowed) {
      return Response.redirect(new URL('/access', url), 302);
    }
  }

  const accept = request.headers.get('accept') || '';
  const wantsMarkdown =
    accept.includes('text/markdown') || accept.includes('text/x-markdown');

  if (!wantsMarkdown) {
    return;
  }

  const mdMap = {
    '/': '/index.md',
    '/index.html': '/index.md',
    '/privacy': '/privacy.md',
    '/privacy.html': '/privacy.md',
    '/join': '/join.md',
    '/join.html': '/join.md',
    '/compare': '/compare.md',
    '/compare.html': '/compare.md',
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
    '/guide',
    '/guide/:path*',
    '/content/guide/:path*',
  ],
};
