import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/data/db';
import { Transaction, User } from '@/types';

// Mock Exchange Rates to USD
const EXCHANGE_RATES: Record<string, number> = {
  USDT: 1.0,
  ETH: 3500.0,
  BNB: 600.0,
  SOL: 140.0
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { walletAddress, amount, currency, referralCode } = body;
    
    if (!walletAddress || !amount || !currency) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    const purchaseAmount = parseFloat(amount);
    if (isNaN(purchaseAmount) || purchaseAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    
    const rate = EXCHANGE_RATES[currency.toUpperCase()];
    if (!rate) {
      return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 });
    }
    
    const db = await readDb();
    
    // Check if user is suspended
    let user = db.users.find(u => u.walletAddress.toLowerCase() === walletAddress.toLowerCase());
    if (user && user.suspended) {
      return NextResponse.json({ error: 'User account is suspended' }, { status: 403 });
    }
    
    // Find active presale round
    const activeRound = db.presaleRounds.find(r => r.status === 'active');
    if (!activeRound) {
      return NextResponse.json({ error: 'No active presale round available' }, { status: 400 });
    }
    
    const amountUsd = purchaseAmount * rate;
    const amountVision = amountUsd / activeRound.priceUsd;
    
    // Create user if not exists
    if (!user) {
      const newUser: User = {
        id: `u-${Math.random().toString(36).substring(2, 11)}`,
        walletAddress: walletAddress,
        kycStatus: 'not_started',
        visionBalance: 0,
        totalPurchasedUsd: 0,
        referralCode: `VSN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        referredBy: null,
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
      user = newUser;
    }
    
    // Generate new mock transaction with "pending" status
    const isSolana = !walletAddress.startsWith('0x');
    const purchaseTx: Transaction = {
      id: `tx-${Math.random().toString(36).substring(2, 11)}`,
      userId: user.id,
      type: 'purchase',
      amountVision: Math.round(amountVision * 100) / 100,
      amountUsd: Math.round(amountUsd * 100) / 100,
      status: 'pending',
      txHashMock: isSolana
        ? `SOLMOCK-${Math.random().toString(36).substring(2, 11).toUpperCase()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`
        : `0xMOCK-${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      createdAt: new Date().toISOString()
    };
    db.transactions.push(purchaseTx);
    
    // Update presale round raised amount
    activeRound.raisedUsd = Math.round((activeRound.raisedUsd + amountUsd) * 100) / 100;
    
    // Handle Referral if present
    if (referralCode && !user.referredBy) {
      const referrer = db.users.find(u => u.referralCode.toUpperCase() === referralCode.toUpperCase());
      if (referrer && referrer.id !== user.id) {
        user.referredBy = referrer.referralCode;
        
        // Reward referrer with 5% of purchase amount in VISION
        const refAmount = Math.round(amountVision * 0.05 * 100) / 100;
        referrer.visionBalance = Math.round((referrer.visionBalance + refAmount) * 100) / 100;
        
        const refTx: Transaction = {
          id: `tx-${Math.random().toString(36).substring(2, 11)}`,
          userId: referrer.id,
          type: 'referral_payout',
          amountVision: refAmount,
          amountUsd: Math.round(refAmount * activeRound.priceUsd * 100) / 100,
          status: 'completed',
          txHashMock: `0xMOCK-REF-${Math.random().toString(16).substring(2, 10)}`,
          createdAt: new Date().toISOString()
        };
        db.transactions.push(refTx);
      }
    }
    
    await writeDb(db);
    return NextResponse.json(purchaseTx);
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
