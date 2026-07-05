import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/data/db';
import { Transaction } from '@/types';

// Staking speed multiplier: 1 real second = 1.15 days of staking (100,000x speedup)
const ACCELERATION_MULTIPLIER = 100000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { walletAddress, transactionId } = body;
    
    if (!walletAddress || !transactionId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
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
    
    // Find the staking transaction
    const stakeTx = db.transactions.find(t => t.id === transactionId && t.userId === user.id && t.type === 'stake');
    if (!stakeTx) {
      return NextResponse.json({ error: 'Staking record not found' }, { status: 404 });
    }
    
    if (stakeTx.unstaked) {
      return NextResponse.json({ error: 'Staking pool has already been unstaked' }, { status: 400 });
    }
    
    // Calculate rewards
    const createdAtTime = new Date(stakeTx.createdAt).getTime();
    const nowTime = new Date().getTime();
    const elapsedSeconds = (nowTime - createdAtTime) / 1000;
    const simulatedElapsedSeconds = elapsedSeconds * ACCELERATION_MULTIPLIER;
    
    const apy = stakeTx.stakingApy || 0;
    const principal = stakeTx.amountVision;
    
    // Yield Formula: Principal * APY * (Simulated Elapsed Time in Years)
    const yearInSeconds = 365 * 24 * 3600;
    const totalYield = principal * apy * (simulatedElapsedSeconds / yearInSeconds);
    
    const alreadyClaimed = stakeTx.stakingClaimedRewards || 0;
    const claimableAmount = Math.max(0, totalYield - alreadyClaimed);
    
    if (claimableAmount < 0.01) {
      return NextResponse.json({ error: 'No claimable rewards accrued yet' }, { status: 400 });
    }
    
    // Credit rewards to user's visionBalance
    user.visionBalance = Math.round((user.visionBalance + claimableAmount) * 100) / 100;
    
    // Update claimed rewards inside the staking transaction
    stakeTx.stakingClaimedRewards = Math.round((alreadyClaimed + claimableAmount) * 100) / 100;
    
    // Record claim transaction
    const claimTx: Transaction = {
      id: `tx-${Math.random().toString(36).substring(2, 11)}`,
      userId: user.id,
      type: 'claim_reward',
      amountVision: Math.round(claimableAmount * 100) / 100,
      status: 'completed',
      txHashMock: `0xMOCK-CLAIM-${Math.random().toString(16).substring(2, 10)}`,
      createdAt: new Date().toISOString()
    };
    db.transactions.push(claimTx);
    
    await writeDb(db);
    
    return NextResponse.json({
      claimTx,
      stakingClaimedRewards: stakeTx.stakingClaimedRewards,
      newVisionBalance: user.visionBalance
    });
  } catch (error) {
    console.error('Claim rewards error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
