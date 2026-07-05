'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Layers, ArrowRight, ShieldCheck, Flame, RefreshCw, PlusCircle, CheckCircle, AlertTriangle, ArrowUpRight, Trophy } from 'lucide-react';
import WalletModal from '@/components/WalletModal';

const ACCELERATION_MULTIPLIER = 100000;

export default function StakingPage() {
  const {
    walletAddress,
    isConnected,
    userProfile,
    transactions,
    stakingPlans,
    tokenStats,
    stakeTokens,
    claimRewards,
    unstakeTokens,
    fetchUserProfile
  } = useStore();

  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [stakeAmount, setStakeAmount] = useState('1000');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  const [actionStatus, setActionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Staking active transactions state (used for live tick computation)
  const [activeStakes, setActiveStakes] = useState<any[]>([]);
  const [livePendingRewards, setLivePendingRewards] = useState(0);

  // Set initial plan selection
  useEffect(() => {
    if (stakingPlans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(stakingPlans[0].id);
    }
  }, [stakingPlans, selectedPlanId]);

  // Compute active stakes and set up the live-ticking yield aggregator
  useEffect(() => {
    const updateLiveYields = () => {
      const stakes = transactions.filter(t => t.type === 'stake' && !t.unstaked && t.status === 'completed');
      setActiveStakes(stakes);
      
      let totalPending = 0;
      const now = Date.now();
      
      stakes.forEach(stake => {
        const createdAtTime = new Date(stake.createdAt).getTime();
        const elapsedSeconds = (now - createdAtTime) / 1000;
        const simulatedElapsedSeconds = elapsedSeconds * ACCELERATION_MULTIPLIER;
        
        const apy = stake.stakingApy || 0;
        const principal = stake.amountVision;
        
        const yearInSeconds = 365 * 24 * 3600;
        const totalYield = principal * apy * (simulatedElapsedSeconds / yearInSeconds);
        const alreadyClaimed = stake.stakingClaimedRewards || 0;
        const pending = Math.max(0, totalYield - alreadyClaimed);
        
        totalPending += pending;
      });
      
      setLivePendingRewards(totalPending);
    };

    updateLiveYields();
    const interval = setInterval(updateLiveYields, 100); // refresh every 100ms for fast ticking text
    return () => clearInterval(interval);
  }, [transactions]);

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !walletAddress) {
      setIsWalletModalOpen(true);
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Please enter a valid amount.');
      return;
    }

    const chosenPlan = stakingPlans.find(p => p.id === selectedPlanId);
    if (!chosenPlan) return;

    if (amount < chosenPlan.minStakeVision) {
      setErrorMsg(`Minimum stake for this plan is ${chosenPlan.minStakeVision} VISION.`);
      return;
    }

    if ((userProfile?.visionBalance || 0) < amount) {
      setErrorMsg('Insufficient VISION balance.');
      return;
    }

    setErrorMsg('');
    setActionStatus('submitting');
    setStatusMessage('Approving smart-contract token allowance...');

    setTimeout(async () => {
      setStatusMessage('Broadcasting collateral stake transaction...');
      const tx = await stakeTokens(selectedPlanId, stakeAmount);
      
      if (tx) {
        setActionStatus('success');
        setStatusMessage(`Successfully staked ${amount.toLocaleString()} VISION!`);
        setStakeAmount('1000');
        // Reset message after 3s
        setTimeout(() => setActionStatus('idle'), 3000);
      } else {
        setActionStatus('error');
        setErrorMsg(useStore.getState().error || 'Failed to authorize stake transaction.');
      }
    }, 1500);
  };

  const handleClaim = async (txId: string) => {
    setActionStatus('submitting');
    setStatusMessage('Requesting claim yield proof generation...');
    
    try {
      await claimRewards(txId);
      setActionStatus('success');
      setStatusMessage('Claim signature confirmed! Rewards deposited.');
      setTimeout(() => setActionStatus('idle'), 3000);
    } catch (err: any) {
      setActionStatus('error');
      setErrorMsg(err.message || 'Claim failed.');
    }
  };

  const handleUnstake = async (txId: string) => {
    const stake = activeStakes.find(s => s.id === txId);
    if (!stake) return;

    // Check early lockup
    const createdAtTime = new Date(stake.createdAt).getTime();
    const elapsedSeconds = (Date.now() - createdAtTime) / 1000;
    const simulatedElapsed = elapsedSeconds * ACCELERATION_MULTIPLIER;
    const lockDuration = (stake.stakingLockDays || 0) * 24 * 3600;
    
    let confirmUnstake = true;
    if (simulatedElapsed < lockDuration) {
      confirmUnstake = window.confirm(
        `WARNING: Staking lock duration has NOT expired yet. Unstaking early will apply a 5% early withdrawal penalty (-${(stake.amountVision * 0.05).toFixed(2)} VISION) and auto-claim any remaining rewards. Do you wish to proceed?`
      );
    }

    if (!confirmUnstake) return;

    setActionStatus('submitting');
    setStatusMessage('Terminating stake contract & returning principal...');
    
    try {
      const res = await unstakeTokens(txId);
      setActionStatus('success');
      if (res.penalty > 0) {
        setStatusMessage(`Unstaked with early withdraw penalty of ${res.penalty.toFixed(2)} VISION.`);
      } else {
        setStatusMessage('Principal returned successfully. Staking vault closed.');
      }
      setTimeout(() => setActionStatus('idle'), 3000);
    } catch (err: any) {
      setActionStatus('error');
      setErrorMsg(err.message || 'Unstake failed.');
    }
  };

  // Staking Ledger transactions (filter: type is stake, unstake, or claim_reward)
  const stakingLedger = transactions.filter(
    t => t.type === 'stake' || t.type === 'unstake' || t.type === 'claim_reward'
  );

  const getStakedPrincipalTotal = () => {
    return activeStakes.reduce((acc, curr) => acc + curr.amountVision, 0);
  };

  const getClaimedRewardsTotal = () => {
    // Sum of claimed rewards across all stakes
    const activeClaimed = activeStakes.reduce((acc, curr) => acc + (curr.stakingClaimedRewards || 0), 0);
    
    // Also include unstaked claims
    const unstakedClaims = transactions
      .filter(t => t.type === 'stake' && t.unstaked)
      .reduce((acc, curr) => acc + (curr.stakingClaimedRewards || 0), 0);
      
    return activeClaimed + unstakedClaims;
  };

  const getStakeProgress = (stake: any) => {
    const createdAtTime = new Date(stake.createdAt).getTime();
    const elapsedSeconds = (Date.now() - createdAtTime) / 1000;
    const simulatedElapsed = elapsedSeconds * ACCELERATION_MULTIPLIER;
    const lockDuration = (stake.stakingLockDays || 0) * 24 * 3600;
    return Math.min(100, (simulatedElapsed / lockDuration) * 100);
  };

  const isLockExpired = (stake: any) => {
    const createdAtTime = new Date(stake.createdAt).getTime();
    const elapsedSeconds = (Date.now() - createdAtTime) / 1000;
    const simulatedElapsed = elapsedSeconds * ACCELERATION_MULTIPLIER;
    const lockDuration = (stake.stakingLockDays || 0) * 24 * 3600;
    return simulatedElapsed >= lockDuration;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-vision-cyan uppercase tracking-wider">DeFi Staking Hub</span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Lock VISION. Secure the Network. Earn Yield.
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Node providers lock collateral to qualify for rendering jobs. Stakers can pool tokens into active vaults to earn emission inflation rewards.
        </p>
      </div>

      {/* Wallet lock check */}
      {!isConnected ? (
        <div className="max-w-md mx-auto p-8 border glass-panel border-white/10 rounded-2xl text-center space-y-6 bg-black/40">
          <div className="w-16 h-16 rounded-full border border-dashed border-white/20 bg-white/5 flex items-center justify-center mx-auto text-gray-400">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Staking Dashboard Locked</h3>
            <p className="text-xs text-gray-400 max-w-[280px] mx-auto leading-relaxed">
              Connect your Web3 address to view active staking positions, claim accumulated yield, and open new deposits.
            </p>
          </div>
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="w-full py-3 text-sm font-semibold rounded-xl bg-gradient-vision text-black hover:opacity-90"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          {/* 1. EARNINGS DASHBOARD METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border glass-panel border-white/10 rounded-2xl bg-black/40 shadow-xl">
            <div className="p-3 border-r border-white/5 last:border-none">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Staked Principal</span>
              <h3 className="text-2xl font-black text-white font-tabular mt-1">
                {getStakedPrincipalTotal().toLocaleString()} <span className="text-xs text-gray-500 font-sans font-medium">VSN</span>
              </h3>
            </div>

            <div className="p-3 border-r border-white/5">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Live Pending Yield (Fast-Tick)</span>
              <h3 className="text-2xl font-black text-vision-cyan font-tabular mt-1 animate-pulse">
                {livePendingRewards.toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 })} <span className="text-xs text-vision-cyan font-sans font-bold">VSN</span>
              </h3>
            </div>

            <div className="p-3 border-r border-white/5">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Claimed Yield</span>
              <h3 className="text-2xl font-black text-white font-tabular mt-1">
                {getClaimedRewardsTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-gray-500 font-sans font-medium">VSN</span>
              </h3>
            </div>

            <div className="p-3 bg-gradient-vision/5 border border-vision-cyan/10 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] text-vision-cyan font-bold uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> Genesis Boost
                </span>
                <p className="text-xs text-gray-400 leading-tight">Average active yield rate across positions.</p>
              </div>
              <span className="text-lg font-black text-white font-tabular">
                {tokenStats?.stakingApy ? (tokenStats.stakingApy * 100).toFixed(0) : '12'}%
              </span>
            </div>
          </div>

          {/* Staking Action Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Columns: Active Vault positions */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-vision-cyan" /> Active Staking Positions
              </h3>

              {activeStakes.length === 0 ? (
                <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-gray-500 text-xs italic bg-white/[0.01]">
                  No active staking positions. Open a deposit vault on the right to start earning.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeStakes.map((stake) => {
                    const progress = getStakeProgress(stake);
                    const expired = isLockExpired(stake);
                    
                    return (
                      <div key={stake.id} className="p-5 border glass-panel border-white/10 rounded-2xl bg-black/50 space-y-4">
                        
                        {/* Title and Badge */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-mono text-gray-500">{stake.id}</span>
                            <h4 className="text-base font-bold text-white mt-0.5">
                              {stakingPlans.find(p => p.id === stake.stakingPlanId)?.name || 'Staking Vault'}
                            </h4>
                          </div>
                          
                          <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            expired 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                          }`}>
                            {expired ? 'Matured' : 'Locked'}
                          </span>
                        </div>

                        {/* Staked values details */}
                        <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5 text-xs text-gray-400">
                          <div>
                            <p>Staked Principal</p>
                            <p className="font-bold text-white mt-0.5 font-tabular">{stake.amountVision.toLocaleString()} VSN</p>
                          </div>
                          <div>
                            <p>APY / Lockup</p>
                            <p className="font-bold text-white mt-0.5 font-tabular">{((stake.stakingApy || 0) * 100).toFixed(0)}% / {stake.stakingLockDays} Days</p>
                          </div>
                          <div>
                            <p>Total Claimed</p>
                            <p className="font-bold text-white mt-0.5 font-tabular">{(stake.stakingClaimedRewards || 0).toLocaleString()} VSN</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-gray-500">
                            <span>Lock Progress</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full ${expired ? 'bg-emerald-500' : 'bg-vision-cyan'}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Claim / Unstake actions */}
                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            onClick={() => handleClaim(stake.id)}
                            disabled={actionStatus === 'submitting'}
                            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>Claim Accrued</span>
                          </button>
                          
                          <button
                            onClick={() => handleUnstake(stake.id)}
                            disabled={actionStatus === 'submitting'}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50 ${
                              expired
                                ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                                : 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
                            }`}
                          >
                            <span>Unstake Principal</span>
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right 5 Columns: Deposit Staking Form */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-vision-cyan" /> Open Staking Vault
              </h3>

              <div className="p-6 border glass-panel border-white/10 rounded-2xl bg-black/40 space-y-6">
                
                {/* Status Box */}
                {actionStatus !== 'idle' && (
                  <div className={`p-4 border rounded-xl text-xs flex gap-2.5 items-start ${
                    actionStatus === 'error'
                      ? 'border-rose-500/20 bg-rose-500/5 text-rose-400'
                      : actionStatus === 'success'
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                        : 'border-vision-cyan/20 bg-vision-cyan/5 text-vision-cyan'
                  }`}>
                    {actionStatus === 'error' ? (
                      <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                    ) : actionStatus === 'success' ? (
                      <CheckCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <RefreshCw className="w-4.5 h-4.5 flex-shrink-0 mt-0.5 animate-spin" />
                    )}
                    <div>
                      <p className="font-bold uppercase tracking-wider text-[10px]">
                        {actionStatus === 'submitting' && 'Escrow Verification'}
                        {actionStatus === 'success' && 'Deposit Success'}
                        {actionStatus === 'error' && 'Transaction Error'}
                      </p>
                      <p className="text-[11px] mt-0.5 opacity-90 leading-tight">{statusMessage || errorMsg}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleStake} className="space-y-4">
                  {/* Staking Plan Selector Grid */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Select Lockup Vault
                    </label>
                    <div className="space-y-2">
                      {stakingPlans.map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between text-left ${
                            selectedPlanId === plan.id
                              ? 'border-vision-cyan bg-vision-cyan/5 text-white'
                              : 'border-white/5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <div>
                            <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                            <p className="text-[10px] text-gray-500">Min limit: {plan.minStakeVision.toLocaleString()} VSN</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-white font-tabular">{((plan.apy || 0) * 100).toFixed(0)}% APY</span>
                            <p className="text-[10px] text-gray-500">{plan.lockDays} Days Lock</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stake amount input */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Amount to Stake (VISION)
                    </label>
                    <input
                      type="number"
                      required
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.0"
                      disabled={actionStatus === 'submitting'}
                      className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-vision-cyan transition-colors font-mono text-sm disabled:opacity-50"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1.5 font-semibold">
                      <span>Available: {userProfile?.visionBalance?.toLocaleString() || '0'} VSN</span>
                      <button
                        type="button"
                        onClick={() => setStakeAmount(String(userProfile?.visionBalance || 0))}
                        className="text-vision-cyan hover:underline"
                      >
                        Stake Max
                      </button>
                    </div>
                  </div>

                  {errorMsg && <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>}

                  {/* Submit Staking */}
                  <button
                    type="submit"
                    disabled={actionStatus === 'submitting'}
                    className="w-full py-3 rounded-xl font-bold bg-gradient-vision text-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.99] disabled:opacity-50"
                  >
                    <span>Deposit into Staking</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* Staking Ledger Ledger Table */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">Staking Ledger History</h3>
            <div className="border glass-panel border-white/10 rounded-2xl overflow-hidden bg-black/40 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase">TX TYPE</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase">TX HASH</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase">DATE</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase">AMOUNT (VSN)</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {stakingLedger.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500 text-xs italic">
                          No staking transactions logged for this address.
                        </td>
                      </tr>
                    ) : (
                      stakingLedger.map((tx) => (
                        <tr key={tx.id}>
                          <td className="p-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                            {tx.type === 'stake' && <span className="text-vision-cyan">Stake Deposit</span>}
                            {tx.type === 'unstake' && <span className="text-rose-400">Principal Refund</span>}
                            {tx.type === 'claim_reward' && <span className="text-emerald-400">Yield claimed</span>}
                          </td>
                          <td className="p-4 font-mono text-xs text-gray-500 truncate max-w-[180px]">
                            {tx.txHashMock}
                          </td>
                          <td className="p-4 text-xs text-gray-400 font-mono">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4 font-bold text-white font-tabular">
                            {tx.amountVision.toLocaleString()} VSN
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                              <CheckCircle className="w-3 h-3" />
                              <span>completed</span>
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
        </>
      )}

      {/* Spacer to render wallet modal */}
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </div>
  );
}
