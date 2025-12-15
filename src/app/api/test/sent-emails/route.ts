import { NextResponse } from 'next/server';
import { __getCapturedEmails, __clearCapturedEmails } from '@/lib/sendgrid';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }
  const emails = __getCapturedEmails();
  return NextResponse.json({ count: emails.length, emails });
}

export async function DELETE() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }
  __clearCapturedEmails();
  return NextResponse.json({ ok: true });
}
