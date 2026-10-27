const mailjetApiKey = process.env.MAILJET_API_KEY;
const mailjetSecretKey = process.env.MAILJET_SECRET_KEY;
const from = process.env.SMTP_FROM ?? 'Interviewly <no-reply@localhost>';
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
const serverOrigin = process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 4000}`;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

export async function sendEmail(to: string, subject: string, text: string, actionUrl?: string): Promise<boolean> {
  const safeText = escapeHtml(text).replace(/\n/g, '<br>');
  const action = actionUrl ? `<p><a href="${escapeHtml(actionUrl)}" style="background:#7865e8;color:white;padding:12px 18px;border-radius:8px;text-decoration:none">Continue to Interviewly</a></p>` : '';
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#29283b"><h2>Interviewly</h2><p>${safeText}</p>${action}<p style="color:#888;font-size:12px">If you did not expect this message, you can ignore it.</p></div>`;
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === 'production') throw new Error('MAILJET_API_KEY and MAILJET_SECRET_KEY must be configured to send email in production.');
    console.info(`[mail:development-only] To: ${to} | Subject: ${subject}${actionUrl ? ` | Link: ${actionUrl}` : ''}`);
    return false;
  }
  const match = from.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
  const fromName = match?.[1] || 'Interviewly';
  const fromEmail = match?.[2] || from.trim();
  const response = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${mailjetApiKey}:${mailjetSecretKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Messages: [{
        From: { Email: fromEmail, Name: fromName },
        To: [{ Email: to }],
        Subject: subject,
        TextPart: text,
        HTMLPart: html,
      }],
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error(`Mailjet send failed (${response.status}): ${detail}`);
    throw new Error('Mailjet could not send the email. Check the sender address and Mailjet API credentials.');
  }
  return true;
}

export const isEmailConfigured = () => Boolean(mailjetApiKey && mailjetSecretKey);

export const clientUrl = (path: string) => new URL(path, clientOrigin).toString();
export const serverUrl = (path: string) => new URL(path, serverOrigin).toString();
