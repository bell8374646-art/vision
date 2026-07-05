import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/data/db';
import { Transaction } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { walletAddress, planId, amount } = body;
    
    if (!walletAddress || !planId || !amount) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    const stakeAmount = parseFloat(amount);
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      return NextResponse.json({ error: 'Invalid stake amount' }, { status: 400 });
    }
    
    const db = await readDb();
    
    // Find user
    const user = db.users.find(u => u.walletAddress.toLowerCase() === walletAddress.toLowerCase());
    if (!user) {
      return NextResponse.json({ error: 'User wallet profile not found' }, { status: 404 });
    }
    
    if (user.suspended) {
      return NextResponse.json({ error: 'User account is suspended' }, { status: 403 });
    }
    
    // Find staking plan
    const plan = db.stakingPlans.find(p => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: 'Staking plan not found' }, { status: 400 });
    }
    
    // Validate minimum limit
    if (stakeAmount < plan.minStakeVision) {
      return NextResponse.json({ error: `Minimum stake for this plan is ${plan.minStakeVision} VISION` }, { status: 400 });
    }
    
    // Validate balance
    if (user.visionBalance < stakeAmount) {
      return NextResponse.json({ error: 'Insufficient VISION balance' }, { status: 400 });
    }
    
    // Deduct from balance
    user.visionBalance = Math.round((user.visionBalance - stakeAmount) * 100) / 100;
    
    // Create staking transaction
    const stakeTx: Transaction = {
      id: `tx-${Math.random().toString(36).substring(2, 11)}`,
      userId: user.id,
      type: 'stake',
      amountVision: stakeAmount,
      amountUsd: Math.round(stakeAmount * db.tokenStats.priceUsd * 100) / 100,
      status: 'completed',
      txHashMock: `0xMOCK-STAKE-${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      createdAt: new Date().toISOString(),
      stakingPlanId: plan.id,
      stakingLockDays: plan.lockDays,
      stakingApy: plan.apy,
      stakingClaimedRewards: 0,
      unstaked: false
    };
    
    db.transactions.push(stakeTx);
    await writeDb(db);
    
    return NextResponse.json(stakeTx);
  } catch (error) {
    console.error('Staking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
