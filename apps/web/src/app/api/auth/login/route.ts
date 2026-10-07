import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    const body = await req.json();
    
    if (body.turnstileToken) {
      const isValid = await verifyTurnstile(body.turnstileToken);
      if (!isValid) {
        return NextResponse.json({ message: 'Verifikasi Anti-Spam gagal' }, { status: 401 });
      }
    }

    const identifier = body.identifier || body.email;
    if (!identifier || !body.password) {
        return NextResponse.json({ message: 'Kredensial tidak lengkap' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'Kredensial salah' }, { status: 401 });
    }
    
    const isPasswordValid = await bcrypt.compare(body.password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Kredensial salah' }, { status: 401 });
    }

    const payload = { username: user.username, sub: user.id };
    const secret = process.env.JWT_SECRET || 'mencari-online-secret-key-dev';
    const access_token = jwt.sign(payload, secret);

    return NextResponse.json({
      access_token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
