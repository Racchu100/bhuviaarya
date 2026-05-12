import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const db = await getDb();
    
    if (password === db.settings.password) {
      // In a real app, you'd set a secure cookie/session here
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}
