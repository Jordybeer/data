import nodemailer from 'nodemailer';

let cached: nodemailer.Transporter | null = null;

function transporter() {
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth:
      process.env.SMTP_USER || process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER || '', pass: process.env.SMTP_PASS || '' }
        : undefined,
  });
  return cached;
}

export async function sendMagicLink(to: string, url: string) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.ADMIN_MAIL;
  if (!process.env.SMTP_HOST || !from) {
    throw new Error('SMTP not configured (SMTP_HOST / SMTP_FROM / ADMIN_MAIL)');
  }
  await transporter().sendMail({
    from,
    to,
    subject: 'Your Snuff DB sign-in link',
    text: `Click to sign in: ${url}\n\nThis link expires in 15 minutes. If you didn't request it, ignore this email.`,
    html: `<p>Click to sign in: <a href="${url}">${url}</a></p><p>This link expires in 15 minutes. If you didn't request it, ignore this email.</p>`,
  });
}
