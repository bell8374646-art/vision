import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/data/db';
import { StakingPlan } from '@/types';

export async function GET() {
  const db = await readDb();
  return NextResponse.json(db.stakingPlans);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, lockDays, apy, minStakeVision } = body;
    
    if (!name || lockDays === undefined || apy === undefined || minStakeVision === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    const db = await readDb();
    
    if (id) {
      // Update existing staking plan
      const planIndex = db.stakingPlans.findIndex(p => p.id === id);
      if (planIndex === -1) {
        return NextResponse.json({ error: 'Staking plan not found' }, { status: 404 });
      }
      
      db.stakingPlans[planIndex] = {
        id,
        name,
        lockDays: parseInt(lockDays),
        apy: parseFloat(apy),
        minStakeVision: parseFloat(minStakeVision)
      };
      
      await writeDb(db);
      return NextResponse.json(db.stakingPlans[planIndex]);
    } else {
      // Create new staking plan
      const newPlan: StakingPlan = {
        id: `plan-${Math.random().toString(36).substring(2, 9)}`,
        name,
        lockDays: parseInt(lockDays),
        apy: parseFloat(apy),
        minStakeVision: parseFloat(minStakeVision)
      };
      
      db.stakingPlans.push(newPlan);
      await writeDb(db);
      return NextResponse.json(newPlan);
    }
  } catch (error) {
    console.error('Admin staking plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
