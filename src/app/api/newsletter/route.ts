import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/data/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const db = await readDb();
    
    // Ensure newsletter field exists
    if (!db.newsletter) {
      db.newsletter = [];
    }
    
    // Avoid duplicates
    if (!db.newsletter.includes(email)) {
      db.newsletter.push(email);
      await writeDb(db);
    }
    
    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Newsletter submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
