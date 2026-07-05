import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/data/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;
    
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }
    
    const db = await readDb();
    
    // Ensure contact field exists
    if (!db.contact) {
      db.contact = [];
    }
    
    const newMessage = {
      id: `msg-${Math.random().toString(36).substring(2, 11)}`,
      name,
      email,
      message,
      createdAt: new Date().toISOString()
    };
    
    db.contact.push(newMessage);
    await writeDb(db);
    
    return NextResponse.json({ success: true, message: 'Message logged successfully' });
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
