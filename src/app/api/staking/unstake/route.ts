import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/data/db';
import { Transaction } from '@/types';

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
    
    // Calculate simulated elapsed time
    const createdAtTime = new Date(stakeTx.createdAt).getTime();
    const nowTime = new Date().getTime();
    const elapsedSeconds = (nowTime - createdAtTime) / 1000;
    const simulatedElapsedSeconds = elapsedSeconds * ACCELERATION_MULTIPLIER;
    
    const lockDays = stakeTx.stakingLockDays || 0;
    const lockDurationSeconds = lockDays * 24 * 3600;
    const isExpired = simulatedElapsedSeconds >= lockDurationSeconds;
    
    const principal = stakeTx.amountVision;
    const apy = stakeTx.stakingApy || 0;
    
    // Calculate unclaimed rewards to auto-claim before unstaking
    const yearInSeconds = 365 * 24 * 3600;
    const totalYield = principal * apy * (simulatedElapsedSeconds / yearInSeconds);
    const alreadyClaimed = stakeTx.stakingClaimedRewards || 0;
    const claimableAmount = Math.max(0, totalYield - alreadyClaimed);
    
    let penalty = 0;
    let refundAmount = principal;
    
    // Apply 5% penalty if unstaking early
    if (!isExpired) {
      penalty = Math.round(principal * 0.05 * 100) / 100;
      refundAmount = Math.round((principal - penalty) * 100) / 100;
    }
    
    // Auto-claim any remaining rewards
    if (claimableAmount > 0.01) {
      user.visionBalance = Math.round((user.visionBalance + claimableAmount) * 100) / 100;
      stakeTx.stakingClaimedRewards = Math.round((alreadyClaimed + claimableAmount) * 100) / 100;
      
      const claimTx: Transaction = {
        id: `tx-${Math.random().toString(36).substring(2, 11)}`,
        userId: user.id,
        type: 'claim_reward',
        amountVision: Math.round(claimableAmount * 100) / 100,
        status: 'completed',
        txHashMock: `0xMOCK-AUTO-CLAIM-${Math.random().toString(16).substring(2, 10)}`,
        createdAt: new Date().toISOString()
      };
      db.transactions.push(claimTx);
    }
    
    // Return principal (minus penalty) to user balance
    user.visionBalance = Math.round((user.visionBalance + refundAmount) * 100) / 100;
    stakeTx.unstaked = true;
    
    // Record unstake transaction
    const unstakeTx: Transaction = {
      id: `tx-${Math.random().toString(36).substring(2, 11)}`,
      userId: user.id,
      type: 'unstake',
      amountVision: principal,
      status: 'completed',
      txHashMock: `0xMOCK-UNSTAKE-${Math.random().toString(16).substring(2, 10)}`,
      createdAt: new Date().toISOString()
    };
    db.transactions.push(unstakeTx);
    
    await writeDb(db);
    
    return NextResponse.json({
      unstakeTx,
      penalty,
      refundAmount,
      newVisionBalance: user.visionBalance
    });
  } catch (error) {
    console.error('Unstaking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
