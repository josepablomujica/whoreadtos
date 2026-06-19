import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  let body: { name?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { name, email, message } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  if (message.trim().length < 10) {
    return NextResponse.json({ error: 'Message is too short.' }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: 'whoreadtos <onboarding@resend.dev>',
      to: 'josepablomujica@gmail.com',
      replyTo: email.trim(),
      subject: `[whoreadtos contact] ${name.trim()}`,
      text: `From: ${name.trim()} <${email.trim()}>\n\n${message.trim()}`,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to send. Please email us directly.' }, { status: 500 });
  }
}
