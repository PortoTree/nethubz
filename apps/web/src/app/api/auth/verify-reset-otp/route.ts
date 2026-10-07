import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const user = await prisma.user.findFirst({
      where: { email: data.email, resetOtpCode: data.otp }
    });

    if (!user) return NextResponse.json({ message: 'Kode OTP salah' }, { status: 400 });
    
    if (!user.resetOtpExpiresAt || user.resetOtpExpiresAt < new Date()) {
      return NextResponse.json({ message: 'Kode OTP sudah kadaluarsa' }, { status: 400 });
    }

    return NextResponse.json({ message: "Kode OTP valid" });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
