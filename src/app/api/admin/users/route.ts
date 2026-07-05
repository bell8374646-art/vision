import { NextResponse } from 'next/server';
import { readDb } from '@/data/db';

export async function GET() {
  try {
    const db = await readDb();
    
    // Sort transactions by date descending
    const sortedTxs = [...db.transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json({
      users: db.users,
      transactions: sortedTxs,
      tokenStats: db.tokenStats,
      presaleRounds: db.presaleRounds,
      stakingPlans: db.stakingPlans,
      contactMessages: db.contact || [],
      newsletterEmails: db.newsletter || []
    });
  } catch (error) {
    console.error('Admin fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
