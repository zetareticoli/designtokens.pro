const COOKIE = 'dt_guide';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function base64UrlToBytes(value) {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmac(secret, payload) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return new Uint8Array(signature);
}

function sameBytes(left, right) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) diff |= left[index] ^ right[index];
  return diff === 0;
}

export async function guideCookieHeader(secret) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ exp })));
  const signature = bytesToBase64Url(await hmac(secret, payload));
  return `${COOKIE}=${payload}.${signature}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`;
}

export async function hasGuideCookie(cookieHeader, secret) {
  if (!secret || !cookieHeader) return false;
  const pair = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE}=`));
  if (!pair) return false;
  const token = pair.slice(COOKIE.length + 1);
  const dot = token.indexOf('.');
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = await hmac(secret, payload);
  let actual;
  try {
    actual = base64UrlToBytes(signature);
  } catch {
    return false;
  }
  if (!sameBytes(expected, actual)) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)));
    return Number(data.exp) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
