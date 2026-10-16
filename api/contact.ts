import { JWT } from 'google-auth-library';
import { Resend } from 'resend';

interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
}

const LIMITS = { name: 200, email: 320, message: 5000 };
const ID_PATTERN = /^[0-9a-f-]{36}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body: unknown, status = 200) => Response.json(body, { status });

/** Returns a clean submission, or an error message for the visitor. */
function parse(body: Record<string, unknown>): Submission | string {
  const field = (key: string) =>
    typeof body[key] === 'string' ? (body[key] as string).trim() : '';

  const submission = {
    id: field('id'),
    // Strip line breaks so the name can't affect email headers.
    name: field('name').replace(/[\r\n]+/g, ' '),
    email: field('email'),
    message: field('message'),
  };

  if (!ID_PATTERN.test(submission.id)) return 'Something went wrong. Please reload the page and try again.';
  if (!submission.name || submission.name.length > LIMITS.name) return 'Enter your name.';
  if (!EMAIL_PATTERN.test(submission.email) || submission.email.length > LIMITS.email) {
    return 'Enter a valid email address.';
  }
  if (!submission.message) return 'Enter a message.';
  if (submission.message.length > LIMITS.message) {
    return `Keep your message under ${LIMITS.message.toLocaleString()} characters.`;
  }
  return submission;
}

async function sendEmail(s: Submission) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send(
    {
      from: `Website contact form <contact@${process.env.RESEND_EMAIL_DOMAIN}>`,
      to: process.env.CONTACT_TO_EMAIL!,
      replyTo: `${s.name} <${s.email}>`,
      subject: `New message from ${s.name}`,
      text: `${s.message}\n\n—\n${s.name}\n${s.email}`,
    },
    // A double-submit or retry with the same id won't send twice.
    { idempotencyKey: `contact-form/${s.id}` },
  );
  if (error) throw new Error(`Resend: ${error.message}`);
}

async function appendRow(s: Submission) {
  const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID } = process.env;
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    throw new Error('Google Sheets: missing environment variables');
  }

  const auth = new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const { token } = await auth.getAccessToken();

  // No tab name, so rows go to the first tab whatever it's called.
  const range = encodeURIComponent('A:E');
  // RAW stores values as plain text, so input like "=SUM()" is never run as a formula.
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      values: [[new Date().toISOString(), s.name, s.email, s.message, s.id]],
    }),
  });
  if (!res.ok) throw new Error(`Google Sheets: ${res.status} ${await res.text()}`);
}

export async function POST(request: Request) {
  const raw: unknown = await request.json().catch(() => null);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return json({ ok: false, error: 'Something went wrong. Please try again.' }, 400);
  }
  const body = raw as Record<string, unknown>;

  // Honeypot: people never see this field, bots fill it in. Pretend it worked.
  if (body.website) return json({ ok: true });

  const submission = parse(body);
  if (typeof submission === 'string') return json({ ok: false, error: submission }, 400);

  const [email, sheet] = await Promise.allSettled([sendEmail(submission), appendRow(submission)]);
  for (const result of [email, sheet]) {
    if (result.status === 'rejected') console.error(`contact ${submission.id}:`, result.reason);
  }

  // The message is safe as long as it reached the inbox or the sheet.
  if (email.status === 'fulfilled' || sheet.status === 'fulfilled') return json({ ok: true });
  return json({ ok: false, error: 'Your message couldn’t be sent.' }, 502);
}
