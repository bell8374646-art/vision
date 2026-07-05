'use client';

import React from 'react';
import { Check, Flame, Hourglass, Calendar, Compass, ShieldAlert } from 'lucide-react';

interface Phase {
  id: number;
  title: string;
  quarter: string;
  status: 'done' | 'in_progress' | 'planned';
  description: string;
  milestones: string[];
}

const PHASES: Phase[] = [
  {
    id: 1,
    quarter: "Q1 - Q2 2026",
    title: "Consensus & ZK Spec",
    status: 'done',
    description: "Conceptual engineering of Proof-of-Vision (PoV) and mathematical modeling of GPU virtualization pipelines.",
    milestones: [
      "Authoring the VISION technical whitepaper",
      "Drafting zk-SNARK validation circuits in Rust",
      "Deploying mock contract mockups on local testnets",
      "Securing $1.0M seed round funding commitments"
    ]
  },
  {
    id: 2,
    quarter: "Q3 2026 (Active)",
    title: "Presale & SDK Release",
    status: 'in_progress',
    description: "Opening public funding, releasing native gaming integration scripts, and onboarding genesis node validators.",
    milestones: [
      "Launching public pre-sale rounds (Round 2 active)",
      "Publishing UE5 & Unity rendering SDK beta packages",
      "Deploying testnet staking dashboard and wallet gates",
      "Opening pre-registration for distributed GPU nodes"
    ]
  },
  {
    id: 3,
    quarter: "Q4 2026",
    title: "Public Testnet v1",
    status: 'planned',
    description: "Deploying open-source node clients to check physical GPU rendering scaling and proof verification times.",
    milestones: [
      "Distributing public node validator client scripts",
      "Initiating CertiK & Hacken smart-contract audits",
      "Onboarding initial 500 GPU providers globally",
      "Simulating network-wide stress tests & gas adjusters"
    ]
  },
  {
    id: 4,
    quarter: "Q1 2027",
    title: "Mainnet Launch",
    status: 'planned',
    description: "Deploying production ERC-20 smart contracts, launching bridges, and opening the decentralized rendering market.",
    milestones: [
      "Deploying audited token smart contracts on Ethereum L2",
      "Opening bridge interfaces for USDT, ETH, and BNB assets",
      "Activating real-time reward emissions for active stakers",
      "Launching visual computing job broker system for developers"
    ]
  },
  {
    id: 5,
    quarter: "Q2 2027",
    title: "DAO Governance",
    status: 'planned',
    description: "Relinquishing control keys to community-led governance contracts and deploying grant pipelines.",
    milestones: [
      "Transferring treasury control to multi-signature DAO",
      "Launching on-chain proposals for gas tariff modifications",
      "Onboarding hardware upgrade grants for node providers",
      "Expanding zero-knowledge rendering research integrations"
    ]
  }
];

export default function RoadmapPage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <Check className="w-5 h-5 text-emerald-400" />;
      case 'in_progress':
        return (
          <div className="relative">
            <span className="absolute -inset-1 rounded-full bg-vision-cyan/30 animate-ping" />
            <Flame className="w-5 h-5 text-vision-cyan relative" />
          </div>
        );
      default:
        return <Hourglass className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'done':
        return 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50';
      case 'in_progress':
        return 'border-vision-cyan/30 bg-vision-cyan/5 hover:border-vision-cyan/60 shadow-[0_0_20px_rgba(0,245,255,0.05)]';
      default:
        return 'border-white/5 bg-black/10 opacity-70 hover:opacity-90';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done':
        return <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Completed</span>;
      case 'in_progress':
        return <span className="text-[10px] font-bold text-vision-cyan uppercase tracking-widest animate-pulse">Active Development</span>;
      default:
        return <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Planned</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-vision-cyan uppercase tracking-wider flex items-center justify-center gap-1.5">
          <Compass className="w-4 h-4" /> Protocol Roadmap
        </span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          VISION Development Blueprint
        </h1>
        <p className="text-gray-400 text-base sm:text-lg">
          Follow our timeline from private consensus specs to a fully decentralized autonomous visualization ecosystem.
        </p>
      </div>

      {/* Desktop Horizontal Scroll Timeline */}
      <div className="hidden lg:block space-y-12">
        <div className="relative pt-6">
          {/* Connecting Line behind the items */}
          <div className="absolute top-[48px] left-[5%] right-[5%] h-0.5 bg-gradient-to-r from-emerald-500 via-vision-cyan to-white/10 z-0" />
          
          <div className="flex gap-6 overflow-x-auto pb-8 roadmap-container relative z-10">
            {PHASES.map((phase) => (
              <div key={phase.id} className="w-[320px] flex-shrink-0 space-y-6">
                
                {/* Visual Status Pin */}
                <div className="flex items-center gap-3 pl-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border bg-black/60 shadow-lg ${
                    phase.status === 'done' ? 'border-emerald-500' : phase.status === 'in_progress' ? 'border-vision-cyan' : 'border-white/10'
                  }`}>
                    {getStatusIcon(phase.status)}
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-gray-500">{phase.quarter}</p>
                    <p className="text-xs font-bold">{getStatusLabel(phase.status)}</p>
                  </div>
                </div>

                {/* Detail Card */}
                <div className={`p-6 border glass-panel rounded-2xl h-[330px] flex flex-col justify-between transition-all duration-200 ${getStatusStyle(phase.status)}`}>
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white">
                      Phase {phase.id}: {phase.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {phase.description}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Milestones</p>
                    <ul className="space-y-1.5 text-[11px] text-gray-300">
                      {phase.milestones.map((m, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${
                            phase.status === 'done' ? 'bg-emerald-400' : phase.status === 'in_progress' ? 'bg-vision-cyan' : 'bg-gray-500'
                          }`} />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Vertical Stack Timeline */}
      <div className="lg:hidden space-y-8 relative pl-6">
        {/* Timeline Vertical Bar */}
        <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-500 via-vision-cyan to-white/10" />

        {PHASES.map((phase) => (
          <div key={phase.id} className="relative space-y-3">
            {/* Timeline Pin */}
            <div className="absolute -left-[31px] top-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border bg-black shadow-lg ${
                phase.status === 'done' ? 'border-emerald-500' : phase.status === 'in_progress' ? 'border-vision-cyan' : 'border-white/10'
              }`}>
                {phase.status === 'done' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : phase.status === 'in_progress' ? (
                  <Flame className="w-3.5 h-3.5 text-vision-cyan" />
                ) : (
                  <Hourglass className="w-3.5 h-3.5 text-gray-500" />
                )}
              </div>
            </div>

            {/* Content Card */}
            <div className={`p-5 border glass-panel rounded-2xl space-y-4 ${getStatusStyle(phase.status)}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{phase.quarter}</span>
                {getStatusLabel(phase.status)}
              </div>
              <h3 className="text-lg font-bold text-white">
                Phase {phase.id}: {phase.title}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {phase.description}
              </p>

              <div className="border-t border-white/5 pt-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Milestones</p>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  {phase.milestones.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        phase.status === 'done' ? 'bg-emerald-400' : phase.status === 'in_progress' ? 'bg-vision-cyan' : 'bg-gray-500'
                      }`} />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Advisory Note */}
      <div className="flex gap-3 p-4 border glass-panel border-white/10 max-w-2xl mx-auto rounded-xl bg-white/[0.01]">
        <Calendar className="w-6 h-6 text-vision-cyan flex-shrink-0" />
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong>Vesting Policy Check:</strong> All milestone schedules are modeled programmatically. The team reserves the right to accelerate release cliff constraints depending on third-party smart-contract security audit confirmation speeds.
        </p>
      </div>

    </div>
  );
}
