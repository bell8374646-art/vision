import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/data/db';
import { PresaleRound } from '@/types';

export async function GET() {
  const db = await readDb();
  return NextResponse.json(db.presaleRounds);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, priceUsd, hardCapUsd, softCapUsd, status, startsAt, endsAt } = body;
    
    if (!name || priceUsd === undefined || hardCapUsd === undefined || softCapUsd === undefined || !status) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    const db = await readDb();
    
    if (id) {
      // Update existing round
      const roundIndex = db.presaleRounds.findIndex(r => r.id === id);
      if (roundIndex === -1) {
        return NextResponse.json({ error: 'Round not found' }, { status: 404 });
      }
      
      const existing = db.presaleRounds[roundIndex];
      db.presaleRounds[roundIndex] = {
        ...existing,
        name,
        priceUsd: parseFloat(priceUsd),
        hardCapUsd: parseFloat(hardCapUsd),
        softCapUsd: parseFloat(softCapUsd),
        status,
        startsAt: startsAt || existing.startsAt,
        endsAt: endsAt || existing.endsAt
      };
      
      // If setting this round active, make others inactive
      if (status === 'active') {
        db.presaleRounds.forEach(r => {
          if (r.id !== id && r.status === 'active') {
            r.status = 'closed';
          }
        });
        db.tokenStats.priceUsd = parseFloat(priceUsd);
        db.tokenStats.marketCapUsd = Math.round(db.tokenStats.circulatingSupply * db.tokenStats.priceUsd);
      }
      
      await writeDb(db);
      return NextResponse.json(db.presaleRounds[roundIndex]);
    } else {
      // Create new round
      const newRound: PresaleRound = {
        id: `rnd-${Math.random().toString(36).substring(2, 9)}`,
        name,
        priceUsd: parseFloat(priceUsd),
        hardCapUsd: parseFloat(hardCapUsd),
        softCapUsd: parseFloat(softCapUsd),
        raisedUsd: 0,
        status,
        startsAt: startsAt || new Date().toISOString(),
        endsAt: endsAt || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
      };
      
      db.presaleRounds.push(newRound);
      
      if (status === 'active') {
        db.presaleRounds.forEach(r => {
          if (r.id !== newRound.id && r.status === 'active') {
            r.status = 'closed';
          }
        });
        db.tokenStats.priceUsd = parseFloat(priceUsd);
        db.tokenStats.marketCapUsd = Math.round(db.tokenStats.circulatingSupply * db.tokenStats.priceUsd);
      }
      
      await writeDb(db);
      return NextResponse.json(newRound);
    }
  } catch (error) {
    console.error('Admin presale round error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
