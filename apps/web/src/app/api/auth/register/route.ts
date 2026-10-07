import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function validateUsername(username: string): string | null {
  if (username.length < 3 || /^\d+$/.test(username)) return "Username tidak valid";
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) return "Username hanya boleh mengandung huruf, angka, titik (.), garis bawah (_), dan strip (-)";
  if (/\.(com|net|org|id|co|info|biz|me|io|us|uk|my|tv|ai|dev|app|website|store|online)$/i.test(username)) return "Username tidak boleh menyerupai ekstensi domain";
  const reservedWords = ['home', 'explore', 'profile', 'login', 'register', 'settings', 'api', 'admin', 'auth', 'search', 'post', 'messages', 'notifications', 'dashboard', 'secure', 'p'];
  if (reservedWords.includes(username.toLowerCase())) return "Username ini tidak dapat digunakan";
  return null;
}

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

    const validationError = validateUsername(data.username);
    if (validationError) return NextResponse.json({ message: validationError }, { status: 400 });

    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) return NextResponse.json({ message: 'Email sudah terdaftar dan aktif' }, { status: 400 });

    const existingUsername = await prisma.user.findUnique({ where: { username: data.username } });
    if (existingUsername) return NextResponse.json({ message: 'Username sudah dipakai' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.pendingUser.upsert({
      where: { email: data.email },
      update: {
        username: data.username,
        passwordHash: hashedPassword,
        otpCode: otpCode,
        createdAt: new Date()
      },
      create: {
        email: data.email,
        username: data.username,
        passwordHash: hashedPassword,
        otpCode: otpCode,
      }
    });

    try {
      await resend.emails.send({
        from: 'Nethubz.com <noreply@nethubz.com>', 
        to: data.email,
        subject: 'Kode Verifikasi Akun Nethubz.com',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .header { background-color: #047857; padding: 30px 20px; text-align: center; color: white; font-size: 24px; font-weight: bold; }
            .content { padding: 40px 30px; color: #333333; text-align: center; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #1f2937; }
            .otp-box { background-color: #f3f4f6; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin: 30px 0; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #047857; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">Nethubz.com</div>
            <div class="content">
              <div class="title">Verifikasi Email Anda</div>
              <p>Terima kasih telah mendaftar di Nethubz.com! Berikut adalah kode verifikasi 6-digit Anda untuk mengaktifkan akun:</p>
              <div class="otp-box">${otpCode}</div>
              <p>Kode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapapun.</p>
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
    console.error('Register error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
