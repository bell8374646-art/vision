import { NextResponse } from 'next/server';
import { readDb } from '@/data/db';

export async function GET() {
  const db = await readDb();
  const activeRound = db.presaleRounds.find(r => r.status === 'active') || db.presaleRounds[0];
  
  if (!activeRound) {
    return NextResponse.json({ error: 'No active presale round found' }, { status: 404 });
  }
  
  return NextResponse.json(activeRound);
}
