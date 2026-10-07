import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function verifyTurnstile(token: string) {
  if (!token) return false;
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return false;
  
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secret}&response=${token}`,
  });
  const data = await res.json();
  return data.success;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (data.turnstileToken) {
      const isValid = await verifyTurnstile(data.turnstileToken);
      if (!isValid) return NextResponse.json({ message: 'Verifikasi Anti-Spam gagal' }, { status: 401 });
    }

    const identifier = data.identifier;
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    if (!user) return NextResponse.json({ message: 'Akun tidak ditemukan' }, { status: 400 });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    await prisma.user.update({
      where: { id: user.id },
      data: { resetOtpCode: otpCode, resetOtpExpiresAt: expiresAt }
    });

    try {
      await resend.emails.send({
        from: 'Nethubz.com <noreply@nethubz.com>',
        to: user.email,
        subject: 'Reset Password - Nethubz.com',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .header { background-color: #059669; color: white; text-align: center; padding: 30px 20px; font-size: 24px; font-weight: bold; }
            .content { padding: 40px 30px; color: #334155; line-height: 1.6; text-align: center; }
            .title { font-size: 20px; font-weight: 600; color: #0f172a; margin-bottom: 20px; }
            .otp-box { background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; text-align: center; padding: 20px; font-size: 32px; font-weight: 800; color: #059669; letter-spacing: 8px; margin: 30px 0; }
            .footer { background-color: #f8fafc; text-align: center; padding: 20px; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">Nethubz.com</div>
            <div class="content">
              <div class="title">Reset Password Anda</div>
              <p>Kami menerima permintaan untuk mereset password akun Anda. Gunakan kode berikut untuk melanjutkan proses reset password:</p>
              <div class="otp-box">${otpCode}</div>
              <p>Kode ini hanya berlaku selama 10 menit. Jika Anda tidak meminta reset password, abaikan email ini.</p>
            </div>
            <div class="footer">
              <p>Email ini dikirim secara otomatis, mohon tidak membalas.</p>
            </div>
          </div>
        </body>
        </html>
        `
      });
      return NextResponse.json({ message: "Kode OTP berhasil dikirim ke email." });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ message: 'Gagal mengirim email OTP' }, { status: 500 });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
