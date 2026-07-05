'use client';

import React, { useState } from 'react';
import { Cpu, ShieldCheck, Database, Layers, Play, Check, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type NodeKey = 'creator' | 'gpu' | 'validator' | 'storage';

interface NodeInfo {
  title: string;
  role: string;
  hardware: string;
  rewards: string;
  details: string;
}

export default function AboutPage() {
  const [selectedNode, setSelectedNode] = useState<NodeKey>('creator');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState<string>('Idle');

  const nodeDetails: Record<NodeKey, NodeInfo> = {
    creator: {
      title: "Creator Client",
      role: "Submits rendering tasks & locks gas in VISION tokens.",
      hardware: "Browser, UE5 Plugin, Blender, or Unity integrations.",
      rewards: "High-fidelity rendering completed in 1/10th the time and cost.",
      details: "Creators upload scene files (.blend, USD) and specify output parameters. The client automatically chunks the scenes and deposits required VISION token gas fees into the escrow smart contract."
    },
    gpu: {
      title: "GPU Computing Node",
      role: "Executes rendering computations & generates ZK execution proofs.",
      hardware: "NVIDIA RTX 3080+, AMD 6800XT+, CUDA/ROCm node client.",
      rewards: "Captures 70% of transaction fees + protocol block rewards.",
      details: "Workers listen for rendering assignments. They download frame chunks, compile shadows, geometry, and textures, render them, and simultaneously generate a mathematical zk-SNARK proof verifying execution correctness without revealing private files."
    },
    validator: {
      title: "zk-Consensus Validator",
      role: "Verifies zk-proof correctness & authorizes payment transfers.",
      hardware: "Validator node client, minimal GPU required, high CPU/RAM.",
      rewards: "Captures 20% of transaction fees for maintaining network safety.",
      details: "Validators check the zk-SNARKs submitted by GPU nodes. Verification is nearly instantaneous (<10ms). If correct, validators sign off on the block, publishing metadata to the blockchain and triggering payment release."
    },
    storage: {
      title: "Decentralized Storage Layer",
      role: "Stores textures, meshes, and rendered frame outputs temporarily.",
      hardware: "High-speed SSD rigs (IPFS, Filecoin, or local node cache).",
      rewards: "Captures 10% of transaction fees for storage leasing.",
      details: "A encrypted staging repository that ensures high-throughput delivery of assets to GPU rendering workers and hosts the completed frame outputs for download by the creator client."
    }
  };

  const triggerAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const steps = [
      { name: '1. Scene Submitted', delay: 0 },
      { name: '2. Task Assigned to GPU', delay: 1500 },
      { name: '3. Frame Rendered & zk-Proof Created', delay: 3500 },
      { name: '4. Validator Confirms Proof', delay: 5500 },
      { name: '5. Output Saved & Payment Released', delay: 7500 },
      { name: 'Completed', delay: 9500 }
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setAnimationStep(step.name);
        if (step.name === 'Completed') {
          setIsAnimating(false);
          setTimeout(() => setAnimationStep('Idle'), 2000);
        }
      }, step.delay);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-vision-cyan uppercase tracking-wider">Protocol Architecture</span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Decentralizing Computational Vision
        </h1>
        <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
          VISION replaces corporate rendering farms with a cryptographic GPU-pooling network. By matching idle rendering hardware with global creators, we create a hyper-efficient computational market.
        </p>
      </div>

      {/* Problem & Solution Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 border glass-panel border-white/10 rounded-2xl space-y-4">
          <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 border border-rose-500/20 rounded-full uppercase">
            The Bottleneck
          </span>
          <h3 className="text-xl font-bold text-white">Centralized Cloud Monopolies</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Centralized render solutions charge massive markups, enforce strict minimum contracts, and create single points of failure. Creators wait hours for queue clearances while millions of gaming GPUs sit completely idle in consumer homes, wasting raw computational capacity.
          </p>
        </div>

        <div className="p-8 border glass-panel border-white/10 rounded-2xl border-vision-cyan/30 space-y-4">
          <span className="text-xs font-bold text-vision-cyan bg-vision-cyan/10 px-2 py-0.5 border border-vision-cyan/20 rounded-full uppercase">
            The Vision
          </span>
          <h3 className="text-xl font-bold text-white">Cryptographically Verifiable Scaling</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            VISION pools distributed GPUs globally, verifying job accuracy through zero-knowledge proofs. Creators pay only for computing power utilized, nodes receive block payouts and rendering fees, and validators guarantee mathematical precision without ever viewing proprietary files.
          </p>
        </div>
      </section>

      {/* Interactive Node Diagram Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Interactive Node Visualizer</h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Click on any network node to inspect its protocol properties, or click &quot;Simulate Render Job&quot; to watch the zk-flow in action.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SVG Diagram Canvas */}
          <div className="lg:col-span-7 p-6 border glass-panel border-white/10 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden bg-black/40 h-[480px]">
            
            {/* Top Toolbar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Interactive Blueprint
              </span>
              <button
                onClick={triggerAnimation}
                disabled={isAnimating}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-vision-cyan text-black disabled:opacity-50 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Play className="w-3 h-3 fill-black" />
                <span>{isAnimating ? 'Simulating...' : 'Simulate Render Job'}</span>
              </button>
            </div>

            {/* Animation Status Overlay */}
            {animationStep !== 'Idle' && (
              <div className="absolute top-16 left-4 right-4 text-center z-10">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-vision-purple border border-vision-purple/50 text-white animate-pulse">
                  {animationStep}
                </span>
              </div>
            )}

            {/* SVG Network Schematic */}
            <svg viewBox="0 0 600 400" className="w-full max-w-lg h-auto select-none">
              {/* Connection Lines */}
              <line x1="100" y1="200" x2="300" y2="100" stroke={selectedNode === 'creator' || selectedNode === 'gpu' ? '#00F5FF' : '#333'} strokeWidth="2" strokeDasharray="5 5" />
              <line x1="100" y1="200" x2="300" y2="300" stroke={selectedNode === 'creator' || selectedNode === 'validator' ? '#00F5FF' : '#333'} strokeWidth="2" strokeDasharray="5 5" />
              <line x1="500" y1="200" x2="300" y2="100" stroke={selectedNode === 'storage' || selectedNode === 'gpu' ? '#7C3AED' : '#333'} strokeWidth="2" />
              <line x1="500" y1="200" x2="300" y2="300" stroke={selectedNode === 'storage' || selectedNode === 'validator' ? '#7C3AED' : '#333'} strokeWidth="2" />
              <line x1="300" y1="100" x2="300" y2="300" stroke={selectedNode === 'gpu' || selectedNode === 'validator' ? '#7C3AED' : '#333'} strokeWidth="2" strokeDasharray="2 2" />

              {/* Animating Packets */}
              {isAnimating && (
                <>
                  {/* Packet: Client -> GPU */}
                  {animationStep.startsWith('1.') && (
                    <circle r="6" fill="#00F5FF" className="animate-ping">
                      <animateMotion dur="1.5s" repeatCount="1" path="M 100 200 L 300 100" fill="freeze" />
                    </circle>
                  )}
                  {/* Packet: GPU -> Storage */}
                  {animationStep.startsWith('3.') && (
                    <circle r="6" fill="#7C3AED" className="animate-pulse">
                      <animateMotion dur="2s" repeatCount="1" path="M 300 100 L 500 200" fill="freeze" />
                    </circle>
                  )}
                  {/* Packet: GPU -> Validator (zk-Proof) */}
                  {animationStep.startsWith('3.') && (
                    <circle r="6" fill="#ffffff">
                      <animateMotion dur="2s" repeatCount="1" path="M 300 100 L 300 300" fill="freeze" />
                    </circle>
                  )}
                  {/* Packet: Validator -> Client (Payment / Notification) */}
                  {animationStep.startsWith('5.') && (
                    <circle r="6" fill="#00F5FF">
                      <animateMotion dur="2s" repeatCount="1" path="M 300 300 L 100 200" fill="freeze" />
                    </circle>
                  )}
                </>
              )}

              {/* Creator Client Node (Left) */}
              <g className="cursor-pointer" onClick={() => setSelectedNode('creator')}>
                <circle cx="100" cy="200" r="35" fill={selectedNode === 'creator' ? '#00F5FF' : '#111'} stroke="#00F5FF" strokeWidth="2" />
                <text x="100" y="205" textAnchor="middle" fill={selectedNode === 'creator' ? '#000' : '#fff'} fontSize="11" fontWeight="bold">Client</text>
              </g>

              {/* GPU Computing Node (Top) */}
              <g className="cursor-pointer" onClick={() => setSelectedNode('gpu')}>
                <circle cx="300" cy="100" r="35" fill={selectedNode === 'gpu' ? '#00F5FF' : '#111'} stroke="#7C3AED" strokeWidth="2" />
                <text x="300" y="105" textAnchor="middle" fill={selectedNode === 'gpu' ? '#000' : '#fff'} fontSize="11" fontWeight="bold">GPU Node</text>
              </g>

              {/* Consensus Validator (Bottom) */}
              <g className="cursor-pointer" onClick={() => setSelectedNode('validator')}>
                <circle cx="300" cy="300" r="35" fill={selectedNode === 'validator' ? '#00F5FF' : '#111'} stroke="#7C3AED" strokeWidth="2" />
                <text x="300" y="305" textAnchor="middle" fill={selectedNode === 'validator' ? '#000' : '#fff'} fontSize="10" fontWeight="bold">Validator</text>
              </g>

              {/* Storage Node (Right) */}
              <g className="cursor-pointer" onClick={() => setSelectedNode('storage')}>
                <circle cx="500" cy="200" r="35" fill={selectedNode === 'storage' ? '#00F5FF' : '#111'} stroke="#7C3AED" strokeWidth="2" />
                <text x="500" y="205" textAnchor="middle" fill={selectedNode === 'storage' ? '#000' : '#fff'} fontSize="11" fontWeight="bold">Storage</text>
              </g>
            </svg>
          </div>

          {/* Node Attribute Side Panel */}
          <div className="lg:col-span-5 h-[480px] flex flex-col justify-between p-6 border glass-panel border-white/10 rounded-2xl relative overflow-hidden bg-black/40">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedNode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-vision-cyan border border-vision-cyan/30 px-2 py-0.5 rounded-full uppercase bg-vision-cyan/5">
                    Node Role Configuration
                  </span>
                  <h3 className="text-2xl font-black text-white mt-2">
                    {nodeDetails[selectedNode].title}
                  </h3>
                </div>

                <div className="space-y-4 text-sm text-gray-300">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Protocol Role</p>
                    <p className="font-medium text-white">{nodeDetails[selectedNode].role}</p>
                  </div>

                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Hardware Spec Required</p>
                    <p className="font-medium text-white font-mono text-xs">{nodeDetails[selectedNode].hardware}</p>
                  </div>

                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Incentive Reward Share</p>
                    <p className="font-medium text-vision-cyan font-semibold">{nodeDetails[selectedNode].rewards}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {nodeDetails[selectedNode].details}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="text-[10px] text-gray-500 text-center border-t border-white/5 pt-4">
              Select other nodes in the network schematic to view their specifications.
            </div>
          </div>

        </div>
      </section>

      {/* Competitive Table Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Competitive Ecosystem Positioning</h2>
          <p className="text-gray-400 text-sm">
            A technical comparison of VISION consensus rendering parameters against traditional legacy solutions.
          </p>
        </div>

        <div className="border glass-panel border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Feature Parameter</th>
                  <th className="p-4 text-xs font-bold text-vision-cyan uppercase tracking-wider">VISION Protocol</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Centralized Farms (AWS)</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">DeCentralized Web2 Pools</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/5 text-gray-300">
                <tr>
                  <td className="p-4 font-semibold text-white">Cost per TFLOPS-hour</td>
                  <td className="p-4 font-bold text-vision-cyan font-tabular">$0.02 USD</td>
                  <td className="p-4 font-tabular text-gray-400">$0.25 USD</td>
                  <td className="p-4 font-tabular text-gray-400">$0.10 USD</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Auditable Verification</td>
                  <td className="p-4 flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-4 h-4" /> Cryptographic (zk-SNARKs)
                  </td>
                  <td className="p-4 text-gray-400">Manual re-rendering</td>
                  <td className="p-4 text-gray-400">Reputation rating system</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Setup Minimums</td>
                  <td className="p-4 text-white">Zero minimums (Pay per frame)</td>
                  <td className="p-4 text-gray-400">Contract locks & server leases</td>
                  <td className="p-4 text-gray-400">Complex configuration scripts</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Asset Security</td>
                  <td className="p-4 text-white">Decrypted chunks, secure zero-knowledge</td>
                  <td className="p-4 text-gray-400">Trust-based corporate firewalls</td>
                  <td className="p-4 text-gray-500">Exposed assets on node PCs</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Vesting / Node Bonds</td>
                  <td className="p-4 text-white">Staked tokens penalize bad nodes</td>
                  <td className="p-4 text-gray-400">None</td>
                  <td className="p-4 text-gray-400">None</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}
