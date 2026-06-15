// Standalone Vercel Serverless Function (zero-config /api). Deployed alongside
// the static Astro build, so the site's .html URLs stay intact. Sends the
// contact form via Resend. Reachable at POST /api/contact.
import { Resend } from 'resend';

// Verified Resend domain is adambarnes.biz. Change these two if needed.
const FROM = 'Adam Barnes <contact@adambarnes.biz>';
const TO = 'hello@adambarnes.biz';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);

export async function POST(request: Request): Promise<Response> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'Invalid form submission.' }, 400);
  }

  const val = (k: string) => String(form.get(k) ?? '').trim();

  // Honeypot: bots fill _gotcha. Pretend success and drop it.
  if (val('_gotcha')) return json({ ok: true });

  const name = val('name');
  const email = val('email');
  const phone = val('phone');
  const subject = val('subject');
  const message = val('message');

  if (!name || !email || !subject || !message) {
    return json({ ok: false, error: 'Please fill in all required fields.' }, 400);
  }
  if (!isEmail(email)) {
    return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // TEMP DIAGNOSTIC: list env var names matching /resend/i (names only, no
    // values) to tell apart "not on this project/scope" vs "name typo".
    const seen = Object.keys(process.env).filter((k) => /resend/i.test(k));
    console.error('RESEND_API_KEY is not set. resend-ish keys:', seen);
    return json(
      {
        ok: false,
        error: `Email service is not configured. [debug — resend env keys seen: ${seen.join(', ') || 'NONE'}]`,
      },
      500,
    );
  }

  const resend = new Resend(apiKey);
  const text =
    `New enquiry via adambarnes.biz\n\n` +
    `Name:    ${name}\n` +
    `Email:   ${email}\n` +
    `Phone:   ${phone || '—'}\n` +
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
