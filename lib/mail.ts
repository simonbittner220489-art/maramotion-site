import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  });

  return transporter;
}

export async function sendContactEmail(name: string | null, email: string, message: string): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter || !process.env.CONTACT_EMAIL) return false;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.CONTACT_EMAIL,
      subject: `Neue Nachricht von ${name || 'Kontaktformular'}`,
      text: `Von: ${name || 'Anonym'}\nE-Mail: ${email}\n\n${message}`,
    });
    return true;
  } catch {
    return false;
  }
}
