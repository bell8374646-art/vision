'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Coins, ArrowRight, ShieldCheck, RefreshCw, Clock, Wallet, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import WalletModal from '@/components/WalletModal';

function PresaleContent() {
  const searchParams = useSearchParams();
  const {
    walletAddress,
    isConnected,
    userProfile,
    transactions,
    activePresaleRound,
    tokenStats,
    purchaseVision,
    fetchUserProfile
  } = useStore();

  const [paymentCurrency, setPaymentCurrency] = useState<'USDT' | 'ETH' | 'BNB' | 'SOL'>('USDT');
  const [payAmount, setPayAmount] = useState('1000');
  const [visionReceived, setVisionReceived] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'submitting' | 'pending' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Mock rates to USD
  const rates = { USDT: 1, ETH: 3500, BNB: 600, SOL: 140 };

  // Set default asset to SOL if Solana wallet is connected
  useEffect(() => {
    if (isConnected && walletAddress && !walletAddress.startsWith('0x')) {
      setPaymentCurrency('SOL');
    } else {
      setPaymentCurrency('USDT');
    }
  }, [isConnected, walletAddress]);



  // Sync ref code from URL query param if present
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  // Handle calculator conversions
  useEffect(() => {
    const amount = parseFloat(payAmount);
    const price = activePresaleRound?.priceUsd || 0.085;
    if (!isNaN(amount) && amount > 0) {
      const usdValue = amount * rates[paymentCurrency];
      setVisionReceived(usdValue / price);
    } else {
      setVisionReceived(0);
    }
  }, [payAmount, paymentCurrency, activePresaleRound]);

  // Round countdown timer
  useEffect(() => {
    if (!activePresaleRound) return;
    
    const targetDate = new Date(activePresaleRound.endsAt).getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      
      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activePresaleRound]);

  // Poll profile during pending purchase to auto-confirm
  useEffect(() => {
    if (!walletAddress || purchaseStatus !== 'pending') return;

    const checkInterval = setInterval(async () => {
      await fetchUserProfile(walletAddress);
      // If the pending tx is now completed, flip status to success
      const hasPending = useStore.getState().transactions.some(t => t.type === 'purchase' && t.status === 'pending');
      if (!hasPending) {
        setPurchaseStatus('success');
        setStatusMessage('Transaction confirmed. Tokens credited!');
        clearInterval(checkInterval);
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [walletAddress, purchaseStatus, fetchUserProfile]);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !walletAddress) {
      setIsWalletModalOpen(true);
      return;
    }

    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Please enter a valid amount.');
      return;
    }

    setErrorMsg('');
    setPurchaseStatus('submitting');
    setStatusMessage('Initiating wallet signature request...');

    // Simulate MetaMask confirmation delay (1s)
    setTimeout(async () => {
      setStatusMessage('Broadcasting Web3 payment to node gateway...');
      const tx = await purchaseVision(payAmount, paymentCurrency, referralCode);
      
      if (tx) {
        setPurchaseStatus('pending');
        setStatusMessage('Waiting for mock network block confirmation (3s)...');
      } else {
        setPurchaseStatus('error');
        setErrorMsg(useStore.getState().error || 'Transaction rejected by node gateway.');
      }
    }, 1200);
  };

  const getProgressPercent = () => {
    if (!activePresaleRound) return 50;
    return (activePresaleRound.raisedUsd / activePresaleRound.hardCapUsd) * 100;
  };

  const getSoftCapPercent = () => {
    if (!activePresaleRound) return 25;
    return (activePresaleRound.softCapUsd / activePresaleRound.hardCapUsd) * 100;
  };

  // Filter out referral payouts or staking events to keep this history to purchases only
  const purchaseTxs = transactions.filter(t => t.type === 'purchase');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-vision-cyan uppercase tracking-wider">Pre-sale Terminal</span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Participate in the VISION Token Launch
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Secure VISION tokens at seed rates before public exchange listings. Purchased tokens are credited instantly to your connected mock wallet.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 7 Columns: Presale Round Status */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Active Round Progress Panel */}
          <div className="p-6 border glass-panel border-white/10 rounded-2xl space-y-6 bg-black/40">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-bold text-vision-cyan bg-vision-cyan/10 border border-vision-cyan/20 px-2.5 py-0.5 rounded-full uppercase">
                  Active Presale Round
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {activePresaleRound?.name || 'Public Presale Round'}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 font-medium">Fixed Token Price</span>
                <p className="text-xl font-black text-white font-tabular">
                  ${activePresaleRound?.priceUsd || '0.0850'} USD
                </p>
              </div>
            </div>

            {/* Cap Progress Bars */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Raised: <strong className="text-white font-tabular">${activePresaleRound?.raisedUsd.toLocaleString()}</strong></span>
                <span>Hard Cap: <strong className="text-white font-tabular">${activePresaleRound?.hardCapUsd.toLocaleString()}</strong></span>
              </div>
              <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5 relative">
                
                {/* Progress bar */}
                <div
                  className="bg-gradient-vision h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, getProgressPercent())}%` }}
                />

                {/* Soft Cap Marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-yellow-500/80"
                  style={{ left: `${getSoftCapPercent()}%` }}
                  title={`Soft Cap: $${activePresaleRound?.softCapUsd.toLocaleString()}`}
                />
              </div>
              <div className="flex justify-between text-[9px] text-gray-500 font-mono px-1">
                <span>0%</span>
                <span style={{ marginLeft: `${getSoftCapPercent() - 5}%` }} className="text-yellow-500">Soft Cap ($750K)</span>
                <span>Hard Cap ($3M)</span>
              </div>
            </div>

            {/* Countdown Clock */}
            <div className="grid grid-cols-4 gap-3 bg-white/5 p-4 border border-white/5 rounded-xl text-center">
              <div>
                <span className="text-lg sm:text-2xl font-black text-white font-tabular">{countdown.days}</span>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Days</p>
              </div>
              <div>
                <span className="text-lg sm:text-2xl font-black text-white font-tabular">{countdown.hours}</span>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Hours</p>
              </div>
              <div>
                <span className="text-lg sm:text-2xl font-black text-white font-tabular">{countdown.minutes}</span>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Minutes</p>
              </div>
              <div>
                <span className="text-lg sm:text-2xl font-black text-white font-tabular">{countdown.seconds}</span>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Seconds</p>
              </div>
            </div>
            
            <div className="flex gap-2 text-[10px] text-gray-400 leading-relaxed justify-center items-center font-semibold">
              <Clock className="w-3.5 h-3.5 text-vision-cyan" />
              <span>ROUND EMISSIONS CLOSE AUTOMATICALLY ON AUGUST 31, 2026.</span>
            </div>
          </div>

          {/* Secure escrow badge */}
          <div className="flex gap-3 p-4 border glass-panel border-white/10 rounded-xl bg-white/[0.01]">
            <ShieldCheck className="w-6 h-6 text-vision-cyan flex-shrink-0" />
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong>Escrow Smart Contract:</strong> All mock payments are held securely in a multi-signature pre-sale lock. VISION tokens will unlock for withdrawal or direct staking vault placement immediately upon transaction finality.
            </p>
          </div>

        </div>

        {/* Right 5 Columns: Exchange Form Terminal */}
        <div className="lg:col-span-5">
          <div className="p-6 border glass-panel border-white/10 rounded-2xl space-y-6 bg-black/40">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-vision-cyan" />
              <h3 className="text-lg font-bold text-white">Exchange Terminal</h3>
            </div>

            {/* If not connected, show Lock Callout */}
            {!isConnected ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full border border-dashed border-white/20 bg-white/5 flex items-center justify-center mx-auto text-gray-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Wallet Connection Required</h4>
                  <p className="text-xs text-gray-400 max-w-[240px] mx-auto leading-relaxed">
                    Connect a simulated Web3 account address to input purchase orders.
                  </p>
                </div>
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-vision text-black hover:opacity-90"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <form onSubmit={handlePurchase} className="space-y-4">
                {/* Currency selector buttons */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Select Purchase Asset
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['USDT', 'ETH', 'BNB', 'SOL'] as const).map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => setPaymentCurrency(curr)}
                        className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                          paymentCurrency === curr
                            ? 'border-vision-cyan text-vision-cyan bg-vision-cyan/5'
                            : 'border-white/5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      You Pay ({paymentCurrency})
                    </label>
                    <input
                      type="number"
                      required
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder="0.0"
                      disabled={purchaseStatus !== 'idle'}
                      className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-vision-cyan transition-colors font-mono text-sm disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      You Receive (VISION Ticker)
                    </label>
                    <div className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/5 text-gray-300 font-mono text-sm font-bold flex justify-between items-center">
                      <span>{visionReceived.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      <span className="text-vision-cyan text-[10px] font-sans font-bold">VSN</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Referral Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="VSN-XXXX"
                      disabled={userProfile?.referredBy !== null || purchaseStatus !== 'idle'}
                      className="w-full px-4 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-vision-cyan transition-colors font-mono uppercase disabled:opacity-50"
                    />
                    {userProfile?.referredBy && (
                      <p className="text-[10px] text-emerald-400 mt-1 font-medium">✓ Referral linked to: {userProfile.referredBy}</p>
                    )}
                  </div>
                </div>

                {/* Status Box */}
                {purchaseStatus !== 'idle' && (
                  <div className={`p-4 border rounded-xl text-xs flex gap-2.5 items-start ${
                    purchaseStatus === 'error'
                      ? 'border-rose-500/20 bg-rose-500/5 text-rose-400'
                      : purchaseStatus === 'success'
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                        : 'border-vision-cyan/20 bg-vision-cyan/5 text-vision-cyan'
                  }`}>
                    {purchaseStatus === 'error' ? (
                      <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                    ) : purchaseStatus === 'success' ? (
                      <CheckCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <RefreshCw className="w-4.5 h-4.5 flex-shrink-0 mt-0.5 animate-spin" />
                    )}
                    <div>
                      <p className="font-bold uppercase tracking-wider text-[10px]">
                        {purchaseStatus === 'submitting' && 'Signing Contract'}
                        {purchaseStatus === 'pending' && 'Broadcasting Block'}
                        {purchaseStatus === 'success' && 'Finalized'}
                        {purchaseStatus === 'error' && 'Transaction Error'}
                      </p>
                      <p className="text-[11px] mt-0.5 opacity-90 leading-tight">{statusMessage || errorMsg}</p>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={purchaseStatus === 'submitting' || purchaseStatus === 'pending'}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-vision text-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100"
                >
                  <span>Buy VISION</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        </div>

      </div>



      {/* Connected Wallet's Historic Transaction Log */}
      {isConnected && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white">Connected Wallet Transactions</h3>
          <div className="border glass-panel border-white/10 rounded-2xl overflow-hidden bg-black/40 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">TX HASH</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">DATE</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">AMOUNT (VSN)</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">VALUE (USD)</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {purchaseTxs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500 text-xs italic">
                        No purchase transactions logged for this address.
                      </td>
                    </tr>
                  ) : (
                    purchaseTxs.map((tx) => (
                      <tr key={tx.id}>
                        <td className="p-4 font-mono text-xs text-gray-400 truncate max-w-[180px]">
                          {tx.txHashMock}
                        </td>
                        <td className="p-4 text-xs text-gray-400">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4 font-bold text-white font-tabular">
                          {tx.amountVision.toLocaleString()}
                        </td>
                        <td className="p-4 font-bold text-white font-tabular">
                          ${tx.amountUsd?.toLocaleString() || '0'}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full ${
                            tx.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : tx.status === 'pending'
                                ? 'bg-vision-cyan/10 text-vision-cyan border-vision-cyan/20 animate-pulse'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {tx.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                            {tx.status === 'pending' && <RefreshCw className="w-3 h-3 animate-spin" />}
                            <span>{tx.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Spacer to render wallet modal */}
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </div>
  );
}

export default function PresalePage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-24 flex items-center justify-center text-gray-400">
        Loading Pre-sale terminal components...
      </div>
    }>
      <PresaleContent />
    </Suspense>
  );
}
