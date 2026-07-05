import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/data/db';
import { User } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params;
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }
    
    const db = await readDb();
    let user = db.users.find(u => u.walletAddress.toLowerCase() === wallet.toLowerCase());
    
    // Auto-create user if not exists so the demo is seamless
    if (!user) {
      user = {
        id: `u-${Math.random().toString(36).substring(2, 11)}`,
        walletAddress: wallet,
        kycStatus: 'not_started',
        // Give new wallets some mock testnet funds to play with:
        // 0 VISION (they purchase this), 5000 USDT, 2 ETH, 10 BNB
        visionBalance: 0,
        totalPurchasedUsd: 0,
        referralCode: `VSN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        referredBy: null,
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      await writeDb(db);
    }
    
    // Auto-confirm pending transactions older than 3 seconds
    const pendingTxs = db.transactions.filter(t => t.userId === user!.id && t.status === 'pending');
    let dbChanged = false;
    
    const now = Date.now();
    for (const tx of pendingTxs) {
      const elapsedSeconds = (now - new Date(tx.createdAt).getTime()) / 1000;
      if (elapsedSeconds >= 3) {
        tx.status = 'completed';
        
        if (tx.type === 'purchase') {
          // Increment user balances
          user.visionBalance = Math.round((user.visionBalance + tx.amountVision) * 100) / 100;
          user.totalPurchasedUsd = Math.round((user.totalPurchasedUsd + (tx.amountUsd || 0)) * 100) / 100;
          
          // Increment token stats
          db.tokenStats.circulatingSupply += tx.amountVision;
          db.tokenStats.marketCapUsd = Math.round(db.tokenStats.circulatingSupply * db.tokenStats.priceUsd);
        }
        dbChanged = true;
      }
    }
    
    if (dbChanged) {
      await writeDb(db);
    }
    
    // Get user's transaction logs
    const userTxs = db.transactions.filter(t => t.userId === user!.id);
    
    return NextResponse.json({
      user,
      transactions: userTxs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });
  } catch (error) {
    console.error('Fetch user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params;
    const body = await request.json();
    const { email, documentType, fullName } = body;
    
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }
    
    const db = await readDb();
    const user = db.users.find(u => u.walletAddress.toLowerCase() === wallet.toLowerCase());
    
    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    if (user.suspended) {
      return NextResponse.json({ error: 'User account is suspended' }, { status: 403 });
    }
    
    // Update user details and flip KYC to pending
    user.email = email || user.email;
    user.kycStatus = 'pending';
    user.kycNotes = `Submitted for review: ${fullName || 'Anonymous'} (${documentType || 'ID Card'})`;
    
    await writeDb(db);
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Update KYC error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
