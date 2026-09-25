import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import accessHandler from '../api/access.mjs';
import { hasGuideCookie } from '../lib/guide-session.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT) || 3000;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnv(path.join(root, '.env.local'));
loadEnv(path.join(root, '.env'));

const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));

function normalizePathname(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0] || '/');
  if (decoded.length > 1 && decoded.endsWith('/')) return decoded.slice(0, -1);
  return decoded || '/';
}

function findRoute(routes, pathname) {
  return (routes || []).find((route) => route.source === pathname) || null;
}

function toRelativePath(urlPath) {
  const decoded = normalizePathname(urlPath);
  return decoded.replace(/^\/+/, '') || '.';
}

function resolveFile(urlPath) {
  const relative = toRelativePath(urlPath);
  let file = path.resolve(root, relative);
  if (file !== root && !file.startsWith(`${root}${path.sep}`)) return null;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) && fs.existsSync(`${file}.html`)) file = `${file}.html`;
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return null;
  return file;
}

function sendFile(res, file) {
  const type = types[path.extname(file)] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(file).pipe(res);
}

async function toRequest(req) {
  const host = req.headers.host || `localhost:${port}`;
  const url = new URL(req.url, `http://${host}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) headers.set(key, value.join(', '));
    else if (value !== undefined) headers.set(key, value);
  }
  const method = req.method || 'GET';
  if (method === 'GET' || method === 'HEAD') return new Request(url, { method, headers });
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return new Request(url, { method, headers, body: Buffer.concat(chunks) });
}

async function sendResponse(res, response) {
  const headers = {};
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'set-cookie') headers[key] = value;
  });
  const cookies = typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [];
  if (cookies.length > 0) headers['Set-Cookie'] = cookies;
  res.writeHead(response.status, headers);
  res.end(Buffer.from(await response.arrayBuffer()));
}

const server = http.createServer(async (req, res) => {
  try {
    const request = await toRequest(req);
    const url = new URL(request.url);

    if (url.pathname === '/api/access') {
      await sendResponse(res, await accessHandler(request));
      return;
    }

    const pathname = normalizePathname(url.pathname);
    const guidePath = pathname === '/guide' || pathname.startsWith('/guide/') || pathname.startsWith('/content/guide');
    if (guidePath) {
      const allowed = await hasGuideCookie(request.headers.get('cookie') || '', process.env.GUIDE_ACCESS_SECRET || '');
      if (!allowed) {
        res.writeHead(302, { Location: '/access' });
        res.end();
        return;
      }
    }

    const redirect = findRoute(vercel.redirects, pathname);
    if (redirect) {
      res.writeHead(redirect.permanent ? 301 : 302, { Location: redirect.destination });
      res.end();
      return;
    }

    const rewrite = findRoute(vercel.rewrites, pathname);
    const file = resolveFile(rewrite ? rewrite.destination : pathname);
    if (!file) {
      const missing = resolveFile('/404.html');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(missing ? fs.readFileSync(missing) : 'Not found');
      return;
    }
    sendFile(res, file);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(error instanceof Error ? error.message : 'Server error');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Local site at http://127.0.0.1:${port}/access`);
});
