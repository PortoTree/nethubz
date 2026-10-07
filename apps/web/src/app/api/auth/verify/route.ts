import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const pending = await prisma.pendingUser.findUnique({ where: { email: data.email } });
    
    if (!pending) return NextResponse.json({ message: 'Email tidak ditemukan atau sudah diverifikasi' }, { status: 400 });
    if (pending.otpCode !== data.code) return NextResponse.json({ message: 'Kode OTP salah' }, { status: 400 });

    const existingUser = await prisma.user.findUnique({ where: { username: pending.username } });
    if (existingUser) {
      console.log(`[VerifyOTP] Race condition prevented: Username ${pending.username} was already taken in main User table by someone else.`);
      await prisma.pendingUser.delete({ where: { email: pending.email } });
      return NextResponse.json({ message: 'Mohon maaf, username sudah keduluan diambil orang lain. Silakan daftar ulang dengan username berbeda.' }, { status: 400 });
    }

    await prisma.user.create({
      data: {
        username: pending.username,
        email: pending.email,
        passwordHash: pending.passwordHash,
        profile: {
          create: {
            displayName: pending.username,
          }
        }
      }
    });

    await prisma.pendingUser.delete({ where: { email: pending.email } });

    return NextResponse.json({ message: "Akun berhasil diverifikasi dan dimasukkan ke database utama! Silakan login." });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
