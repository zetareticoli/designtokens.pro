import { guideCookieHeader } from '../lib/guide-session.mjs';

const KIT_API = 'https://api.kit.com/v4';

function redirect(location, cookie) {
  const headers = { Location: location, 'Cache-Control': 'no-store' };
  if (cookie) headers['Set-Cookie'] = cookie;
  return new Response(null, { status: 303, headers });
}

async function kit(path, key) {
  const response = await fetch(`${KIT_API}${path}`, {
    headers: { 'X-Kit-Api-Key': key },
  });
  if (!response.ok) {
    throw new Error(`Kit responded ${response.status}`);
  }
  return response.json();
}

async function emailHasGuideTag(email) {
  const key = process.env.KIT_API_KEY;
  const tagId = Number(process.env.KIT_GUIDE_TAG_ID);
  if (!key || !tagId) {
    throw new Error('Missing KIT_API_KEY or KIT_GUIDE_TAG_ID');
  }

  const subscribers = await kit(
    `/subscribers?email_address=${encodeURIComponent(email)}&include=tags`,
    key,
  );
  return (subscribers.subscribers || []).some((subscriber) => {
    const sameEmail = (subscriber.email_address || '').toLowerCase() === email;
    const tagged = (subscriber.tags || []).some((tag) => Number(tag.id) === tagId);
    return sameEmail && tagged;
  });
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const form = await request.formData();
  const email = String(form.get('email') || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return redirect('/access?error=email');
  }

  try {
    const purchased = await emailHasGuideTag(email);
    if (!purchased) return redirect('/access?error=purchase');
    const secret = process.env.GUIDE_ACCESS_SECRET;
    if (!secret) return redirect('/access?error=unavailable');
    return redirect('/guide', await guideCookieHeader(secret));
  } catch {
    return redirect('/access?error=unavailable');
  }
}
