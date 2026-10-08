import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validation';
import { getDb } from '@/db/client';
import { contacts } from '@/db/schema';
import { sendContactEmail } from '@/lib/mail';
import { assertOrigin, apiError, readJson, checkRateLimit, getClientIp, HttpError } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    assertOrigin(request);
    if (!await checkRateLimit(getClientIp(request), 'contact', 5, 3600000)) throw new HttpError(429, 'Bitte versuche es später erneut.');
    const data = contactSchema.parse(await readJson(request, 20000));
    if (data.honeypot) return NextResponse.json({ success: true });
    await getDb().insert(contacts).values({ name: data.name, email: data.email, message: data.message, consentGdpr: true, status: 'new' });
    const notificationSent = await sendContactEmail(data.name, data.email, data.message);
    return NextResponse.json({ success: true, stored: true, notificationSent }, { status: 201 });
  } catch (error) { return apiError(error); }
}
