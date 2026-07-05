import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/data/db';

export async function GET() {
  const db = await readDb();
  
  // Simulate slight live fluctuations
  const randomChange = 1 + (Math.random() - 0.5) * 0.0005; // max 0.025% change
  const stats = { ...db.tokenStats };
  stats.priceUsd = Number((stats.priceUsd * randomChange).toFixed(4));
  stats.marketCapUsd = Math.round(stats.marketCapUsd * randomChange);
  stats.updatedAt = new Date().toISOString();
  
  // Randomly add a new holder 10% of the time
  if (Math.random() > 0.9) {
    stats.holders += 1;
    db.tokenStats.holders = stats.holders;
    await writeDb(db);
  }
  
  return NextResponse.json(stats);
}
