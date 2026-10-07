import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

function validateUsername(username: string): string | null {
  if (username.length < 3 || /^\d+$/.test(username)) return "Username tidak valid";
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) return "Username hanya boleh mengandung huruf, angka, titik (.), garis bawah (_), dan strip (-)";
  if (/\.(com|net|org|id|co|info|biz|me|io|us|uk|my|tv|ai|dev|app|website|store|online)$/i.test(username)) return "Username tidak boleh menyerupai ekstensi domain";
  const reservedWords = ['home', 'explore', 'profile', 'login', 'register', 'settings', 'api', 'admin', 'auth', 'search', 'post', 'messages', 'notifications', 'dashboard', 'secure', 'p'];
  if (reservedWords.includes(username.toLowerCase())) return "Username ini tidak dapat digunakan";
  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    if (!username) return NextResponse.json({ available: false, error: 'Username tidak boleh kosong' });

    const validationError = validateUsername(username);
    if (validationError) return NextResponse.json({ available: false, error: validationError });

    const user = await prisma.user.findUnique({ where: { username } });
    return NextResponse.json({ available: !user });
  } catch (error) {
    console.error('Check username error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
