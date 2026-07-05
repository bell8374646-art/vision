'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { CircleDollarSign, Flame, Calculator, Sparkles, TrendingDown } from 'lucide-react';

interface Allocation {
  label: string;
  percent: number;
  tokens: number;
  color: string;
}

const ALLOCATIONS: Allocation[] = [
  { label: "Public Presale", percent: 40, tokens: 200000000, color: "#00F5FF" }, // Cyan
  { label: "Staking & Node Rewards", percent: 25, tokens: 125000000, color: "#3B82F6" }, // Blue
  { label: "Core Protocol Dev", percent: 15, tokens: 75000000, color: "#7C3AED" }, // Purple
  { label: "Ecosystem & Marketing", percent: 12, tokens: 60000000, color: "#D1D5DB" }, // Gray
  { label: "Genesis Advisory & Team", percent: 8, tokens: 40000000, color: "#4B5563" } // Dark Gray
];

export default function TokenomicsPage() {
  const { tokenStats } = useStore();
  const [calculatorInput, setCalculatorInput] = useState<string>('10000');
  const [percentageSupply, setPercentageSupply] = useState(0);
  const [usdValue, setUsdValue] = useState(0);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  const totalSupply = 500000000;
  const currentPrice = tokenStats?.priceUsd || 0.085;

  useEffect(() => {
    const inputNum = parseFloat(calculatorInput);
    if (!isNaN(inputNum) && inputNum >= 0) {
      setPercentageSupply((inputNum / totalSupply) * 100);
      setUsdValue(inputNum * currentPrice);
    } else {
      setPercentageSupply(0);
      setUsdValue(0);
    }
  }, [calculatorInput, currentPrice]);

  // SVG Donut slice calculation helpers
  let accumulatedPercent = 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-vision-cyan uppercase tracking-wider">Token Economy</span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          VISION Tokenomics & Allocation Model
        </h1>
        <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
          VISION has a fixed total supply cap of 500,000,000 tokens. The model incorporates structural vesting cliffs and regular token burns to enforce long-term deflation.
        </p>
      </div>

      {/* Allocation Donut Chart & Legend */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* SVG Donut Chart */}
        <div className="p-8 border glass-panel border-white/10 rounded-2xl flex flex-col items-center justify-center bg-black/40 h-[420px]">
          <div className="relative w-64 h-64">
            <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
              
              {ALLOCATIONS.map((alloc, idx) => {
                const strokeDashValue = alloc.percent;
                const strokeOffsetValue = 100 - accumulatedPercent;
                accumulatedPercent += alloc.percent;
                const isHovered = hoveredSlice === idx;

                return (
                  <circle
                    key={idx}
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    stroke={alloc.color}
                    strokeWidth={isHovered ? 5.5 : 4}
                    strokeDasharray={`${strokeDashValue} ${100 - strokeDashValue}`}
                    strokeDashoffset={strokeOffsetValue}
                    onMouseEnter={() => setHoveredSlice(idx)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className="transition-all duration-200 cursor-pointer"
                  />
                );
              })}
            </svg>

            {/* Inner Ring Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              {hoveredSlice !== null ? (
                <>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                    {ALLOCATIONS[hoveredSlice].label}
                  </span>
                  <span className="text-3xl font-black text-white font-tabular mt-1">
                    {ALLOCATIONS[hoveredSlice].percent}%
                  </span>
                  <span className="text-xs text-gray-400 font-mono mt-0.5">
                    {(ALLOCATIONS[hoveredSlice].tokens / 1e6).toFixed(0)}M VSN
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Total Supply
                  </span>
                  <span className="text-2xl font-black text-white font-tabular mt-1">
                    500,000,000
                  </span>
                  <span className="text-xs text-vision-cyan font-semibold mt-0.5">
                    VISION
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold text-vision-cyan uppercase tracking-wider">Distribution Legend</span>
            <h3 className="text-xl font-bold text-white mt-1 mb-2">Token Allocation Details</h3>
            <p className="text-xs text-gray-400">Hover over slices of the donut chart to highlight specific allocations.</p>
          </div>

          <div className="space-y-3">
            {ALLOCATIONS.map((alloc, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredSlice(idx)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  hoveredSlice === idx 
                    ? 'bg-white/10 border-white/20 scale-[1.01]' 
                    : 'bg-white/5 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-md flex-shrink-0" style={{ backgroundColor: alloc.color }} />
                  <span className="text-sm font-medium text-gray-200">{alloc.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white font-tabular">{alloc.percent}%</span>
                  <p className="text-[10px] text-gray-500 font-mono">{(alloc.tokens).toLocaleString()} VSN</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vesting Timeline Scroll */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Vesting & Release Schedule</h2>
          <p className="text-gray-400 text-sm">
            To prevent dump events, team and advisor allocations are locked under progressive smart-contract cliffs.
          </p>
        </div>

        <div className="overflow-x-auto pb-4 roadmap-container">
          <div className="flex gap-6 min-w-[900px] p-2">
            
            <div className="flex-1 p-5 border glass-panel border-white/10 rounded-2xl bg-black/20 space-y-3">
              <span className="text-xs font-bold text-vision-cyan font-mono">MONTH 0 — TGE</span>
              <h4 className="text-base font-bold text-white">Token Generation Event</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                40% of public presale unlocked immediately for liquidity mapping. Team, Advisor, and Dev grants remain locked 100%.
              </p>
            </div>

            <div className="flex-1 p-5 border glass-panel border-white/10 rounded-2xl bg-black/20 space-y-3">
              <span className="text-xs font-bold text-gray-500 font-mono">MONTH 3</span>
              <h4 className="text-base font-bold text-white">Presale Vesting Complete</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Remaining 60% of pre-sale tokens are distributed linearly over 90 days. Staking rewards emission expands by 5%.
              </p>
            </div>

            <div className="flex-1 p-5 border glass-panel border-white/10 rounded-2xl bg-black/20 space-y-3">
              <span className="text-xs font-bold text-gray-500 font-mono">MONTH 6</span>
              <h4 className="text-base font-bold text-white">Advisory Cliff Unlocks</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                First advisory release occurs (10% unlock), followed by linear monthly releases over a 12-month period.
              </p>
            </div>

            <div className="flex-1 p-5 border glass-panel border-white/10 rounded-2xl bg-black/20 space-y-3 font-semibold border-vision-purple/30">
              <span className="text-xs font-bold text-vision-purple font-mono">MONTH 12</span>
              <h4 className="text-base font-bold text-white font-black">Team Cliff & Dev Release</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-normal">
                100% team lock cliff expires. Core developer funding unlocks. Release is metered over a 24-month linear period.
              </p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Burn Tracker & Calculator */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Cumulative Burn Tracker Chart */}
        <div className="p-6 border glass-panel border-white/10 rounded-2xl space-y-6 bg-black/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-vision-cyan" />
              <h3 className="text-lg font-bold text-white">Mock Burn Tracker</h3>
            </div>
            <span className="text-[10px] font-bold text-vision-cyan bg-vision-cyan/10 border border-vision-cyan/20 px-2 py-0.5 rounded-full uppercase">
              Deflationary Core
            </span>
          </div>

          <div className="h-44 w-full relative pt-4">
            {/* SVG Line Graph */}
            <svg viewBox="0 0 300 100" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="0" y1="90" x2="300" y2="90" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="10" x2="300" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              
              {/* Burn Line */}
              <path
                d="M 10 90 L 80 80 L 150 65 L 220 40 L 290 10"
                fill="none"
                stroke="url(#gradient-cyan-purple)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              
              {/* Interactive Dots */}
              <circle cx="10" cy="90" r="4.5" fill="#111" stroke="#00F5FF" strokeWidth="2" />
              <circle cx="80" cy="80" r="4.5" fill="#111" stroke="#00F5FF" strokeWidth="2" />
              <circle cx="150" cy="65" r="4.5" fill="#111" stroke="#00F5FF" strokeWidth="2" />
              <circle cx="220" cy="40" r="4.5" fill="#111" stroke="#00F5FF" strokeWidth="2" />
              <circle cx="290" cy="10" r="5" fill="#00F5FF" className="animate-pulse" />

              {/* Gradients */}
              <defs>
                <linearGradient id="gradient-cyan-purple" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00F5FF" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* X Axis labels */}
            <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-1 px-1">
              <span>Launch</span>
              <span>Month 3</span>
              <span>Month 6</span>
              <span>Month 9</span>
              <span>Month 12 (Now)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-gray-400">
            <TrendingDown className="w-5 h-5 text-vision-cyan flex-shrink-0" />
            <p>
              By collecting a 2% burn gas fee on rendering contracts, the supply has decreased by <strong>12.5M VISION</strong> over the past 12 months, boosting token scarcity.
            </p>
          </div>
        </div>

        {/* Supply Calculator */}
        <div className="p-6 border glass-panel border-white/10 rounded-2xl space-y-6 bg-black/40">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-vision-cyan" />
            <h3 className="text-lg font-bold text-white">Supply Share Calculator</h3>
          </div>
          
          <p className="text-xs text-gray-400 leading-normal">
            Input a token holding amount to calculate your network ownership percentage and see its equivalent fiat valuation at the current mock price.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Token Quantity (VISION)
              </label>
              <input
                type="number"
                value={calculatorInput}
                onChange={(e) => setCalculatorInput(e.target.value)}
                placeholder="Enter token count"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-vision-cyan transition-colors font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1">
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Network Ownership</p>
                <p className="text-xl font-bold text-white font-tabular">
                  {percentageSupply.toFixed(5)}%
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1">
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Estimated USD Value</p>
                <p className="text-xl font-bold text-vision-cyan font-tabular">
                  ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            
            <div className="text-[10px] text-gray-600 text-center font-mono">
              Calculations are computed live at: $1 VSN = ${currentPrice.toFixed(4)} USD.
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}
