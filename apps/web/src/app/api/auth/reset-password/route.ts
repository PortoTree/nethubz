import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const user = await prisma.user.findFirst({
      where: { email: data.email, resetOtpCode: data.otp }
    });

    if (!user) return NextResponse.json({ message: 'OTP salah atau tidak ditemukan' }, { status: 400 });
    
    if (!user.resetOtpExpiresAt || user.resetOtpExpiresAt < new Date()) {
      return NextResponse.json({ message: 'OTP sudah kadaluarsa' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetOtpCode: null,
        resetOtpExpiresAt: null
      }
    });

    return NextResponse.json({ message: "Password berhasil diubah" });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
