// Standalone Vercel Serverless Function (zero-config /api). Deployed alongside
// the static Astro build, so the site's .html URLs stay intact. Sends the
// contact form via Resend. Reachable at POST /api/contact.
//
// Spam defences, cheapest first: method → origin → honeypot → rate limit →
// timing → validation → Turnstile → Resend. All secrets are read from
// process.env here, server-side only; nothing in this file ships to the browser.
import { Resend } from 'resend';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { z } from 'zod';

// Verified Resend domain is adambarnes.biz. Change these two if needed.
const FROM = 'Adam Barnes <contact@adambarnes.biz>';
const TO = 'hello@adambarnes.biz';

const MIN_FILL_MS = 3000;
const MAX_URLS = 2;
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

const reject = (reason: string, error: string, status = 400) => {
  console.warn(`[contact] rejected: ${reason}`);
  return json({ ok: false, error }, status);
};

// ---- Origin ----------------------------------------------------------------

const PRODUCTION_ORIGINS = ['https://www.adambarnes.biz', 'https://adambarnes.biz'];
const LOCALHOST = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function isAllowedOrigin(origin: string): boolean {
  if (PRODUCTION_ORIGINS.includes(origin)) return true;
  const env = process.env.VERCEL_ENV;
  // Preview deployments post from their own *.vercel.app hostnames: the
  // per-deployment URL and the stable per-branch one.
  if (env === 'preview') {
    return [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL].some(
      (host) => host && origin === `https://${host}`,
    );
  }
  // `vercel dev` (or any local run): localhost on any port.
  if (env === 'development' || !env) return LOCALHOST.test(origin);
  // Production: the custom domain only.
  return false;
}

// ---- Rate limiting ---------------------------------------------------------

const upstash =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        }),
        limiter: Ratelimit.slidingWindow(RATE_LIMIT, '10 m'),
        prefix: 'ratelimit:contact',
      })
    : null;

// Fallback when Upstash isn't configured. NOTE: this lives in the function
// instance's memory, so it resets on every cold start and isn't shared between
// concurrent instances — a best-effort brake, not a guarantee.
const hits = new Map<string, number[]>();

async function isRateLimited(ip: string): Promise<boolean> {
  if (upstash) {
    const { success } = await upstash.limit(ip);
    return !success;
  }
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

const clientIp = (request: Request) =>
  request.headers.get('x-real-ip') ??
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
  'unknown';

// ---- Validation ------------------------------------------------------------

// Strip control characters (keeping newlines and tabs in the message).
const clean = (s: string) => s.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '');
// Single-line fields also end up in the email subject: no newlines at all.
const oneLine = (s: string) => clean(s).replace(/\s+/g, ' ');

const countUrls = (s: string) => (s.match(/https?:\/\/|www\./gi) ?? []).length;

const schema = z.object({
  name: z.string().trim().min(1).max(100).transform(oneLine),
  email: z.string().trim().max(254).pipe(z.email()),
  phone: z.string().trim().max(40).transform(oneLine),
  website: z.string().trim().max(200).transform(oneLine),
  subject: z.string().trim().min(1).max(150).transform(oneLine),
  message: z
    .string()
    .trim()
    .min(1)
    .max(5000)
    .transform(clean)
    .refine((s) => countUrls(s) <= MAX_URLS, { message: 'too many URLs' }),
});

// ---- Turnstile -------------------------------------------------------------

async function verifyTurnstile(token: string, ip: string, secret: string): Promise<boolean> {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip !== 'unknown') body.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

// ---- Handlers --------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin');
  if (!origin || !isAllowedOrigin(origin)) {
    return reject(`bad origin (${origin ?? 'none'})`, 'Forbidden.', 403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reject('unparseable body', 'Invalid form submission.');
  }
  const val = (k: string) => String(form.get(k) ?? '');

  // Honeypot: bots fill it. Pretend success and send nothing.
  if (val('homepage').trim()) {
    console.warn('[contact] rejected: honeypot filled');
    return json({ ok: true });
  }

  const ip = clientIp(request);
  if (await isRateLimited(ip)) {
    return reject('rate limited', 'Too many messages. Please try again later or email hello@adambarnes.biz.', 429);
  }

  // Timing: both stamps come from the browser's clock, so clock skew between
  // visitor and server can't lock anyone out.
  const started = Number(val('started'));
  const submitted = Number(val('submitted'));
  const elapsed = submitted - started;
  if (!(started > 0) || !(submitted > 0) || elapsed < MIN_FILL_MS) {
    return reject(started > 0 && submitted > 0 ? `too fast (${elapsed}ms)` : 'missing timestamp', 'That was quick! Please wait a moment and try again.');
  }

  const parsed = schema.safeParse({
    name: val('name'),
    email: val('email'),
    phone: val('phone'),
    website: val('website'),
    subject: val('subject'),
    message: val('message'),
  });
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    const tooManyUrls = parsed.error.issues.some((i) => i.message === 'too many URLs');
    return reject(
      `validation (${fields})`,
      tooManyUrls
        ? 'Please include no more than two links in your message.'
        : 'Please check the form: all required fields filled in, and a valid email address.',
    );
  }
  const { name, email, phone, website, subject, message } = parsed.data;

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!turnstileSecret || !resendKey) {
    console.error(`[contact] not configured: ${!turnstileSecret ? 'TURNSTILE_SECRET_KEY ' : ''}${!resendKey ? 'RESEND_API_KEY' : ''}`);
    return json({ ok: false, error: 'Email service is not configured.' }, 500);
  }

  const token = val('cf-turnstile-response');
  if (!token || !(await verifyTurnstile(token, ip, turnstileSecret))) {
    return reject(token ? 'turnstile failed' : 'turnstile token missing', 'Spam check failed. Please try again.');
  }

  const resend = new Resend(resendKey);
  const text =
    `New enquiry via adambarnes.biz\n\n` +
    `Name:    ${name}\n` +
    `Email:   ${email}\n` +
    `Phone:   ${phone || '—'}\n` +
    `Website: ${website || '—'}\n` +
    `Type:    ${subject}\n\n` +
    `${message}\n`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `Website enquiry: ${subject} — ${name}`,
      text,
    });
    if (error) {
      console.error('Resend error:', error);
      return json(
        { ok: false, error: 'Could not send. Please email hello@adambarnes.biz directly.' },
        502,
      );
    }
    return json({ ok: true });
  } catch (e) {
    console.error('Contact send failed:', e);
    return json({ ok: false, error: 'Something went wrong. Please try again.' }, 500);
  }
}

const methodNotAllowed = () => {
  console.warn('[contact] rejected: method not allowed');
  return json({ ok: false, error: 'Method not allowed.' }, 405, { Allow: 'POST' });
};
export { methodNotAllowed as GET, methodNotAllowed as PUT, methodNotAllowed as PATCH, methodNotAllowed as DELETE, methodNotAllowed as OPTIONS, methodNotAllowed as HEAD };
