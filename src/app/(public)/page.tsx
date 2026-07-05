'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useStore } from '@/store/useStore';
import { ArrowRight, ShieldCheck, Cpu, Zap, Layers, Network } from 'lucide-react';
import { motion } from 'framer-motion';

// Dynamically import 3D coin to prevent Next.js SSR build errors
const ThreeCoin = dynamic(() => import('@/components/ThreeCoin'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-vision-cyan/20 border-t-vision-cyan animate-spin" />
    </div>
  )
});

export default function HomePage() {
  const { tokenStats, activePresaleRound, blogPosts, cmsConfig, fetchUserProfile, walletAddress } = useStore();

  useEffect(() => {
    if (walletAddress) {
      fetchUserProfile(walletAddress);
    }
  }, [walletAddress, fetchUserProfile]);

  const defaultHeroTitle = "Powering the Future Through Decentralized Vision";
  const defaultHeroSubtitle = "We are building the first trustless zk-rendering consensus protocol on the Solana blockchain. Run a node, secure the network, and claim visual computation rewards.";

  const heroTitle = cmsConfig?.homeHeroTitle || defaultHeroTitle;
  const heroSubtitle = cmsConfig?.homeHeroSubtitle || defaultHeroSubtitle;

  const features = [
    {
      icon: <Layers className="w-6 h-6 text-vision-cyan" />,
      title: "Proof-of-Vision",
      desc: "Uses zero-knowledge proofs (zk-SNARKs) to validate computational rendering streams in milliseconds, securing consensus."
    },
    {
      icon: <Zap className="w-6 h-6 text-vision-cyan" />,
      title: "10x Cost Reduction",
      desc: "Distributed GPU virtualization shifts rendering workloads from centralized clouds, cutting operational costs by 90%."
    },
    {
      icon: <Cpu className="w-6 h-6 text-vision-cyan" />,
      title: "Native SDK Toolkits",
      desc: "Drop-in plugins for Unreal Engine 5 and Unity allow games and simulations to render asset pipelines trustlessly."
    },
    {
      icon: <Network className="w-6 h-6 text-vision-cyan" />,
      title: "Validator Staking",
      desc: "Node operators stake VISION to capture rendering jobs, earning node rewards and transaction fee dividends."
    }
  ];

  const partners = ["AETHER COMPUTING", "KRONOS VEIL", "VERTEX SHADER", "NEXUS GPU", "APEX CRYPTO"];

  const allocations = [
    { name: "Public Presale", percent: 40, color: "bg-vision-cyan" },
    { name: "Staking Pool & Node Rewards", percent: 25, color: "bg-vision-blue" },
    { name: "Core Protocol Development", percent: 15, color: "bg-vision-purple" },
    { name: "Ecosystem Grants & Marketing", percent: 12, color: "bg-white/40" },
    { name: "Genesis Advisory & Team", percent: 8, color: "bg-white/10" }
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center pt-8 overflow-hidden">
        {/* Ambient background colors */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-vision-cyan/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-vision-purple/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Left Column: Text Copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-6 text-center md:text-left"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border border-vision-cyan/30 bg-vision-cyan/5 text-vision-cyan uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5" /> Solana SPL Launch Active
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
                {heroTitle}
              </h1>
              
              <p className="text-base sm:text-lg text-gray-400 max-w-xl">
                {heroSubtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
                <Link
                  href="/presale"
                  className="w-full sm:w-auto px-8 py-3.5 font-bold rounded-xl bg-gradient-vision text-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <span>Buy VISION</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#"
                  className="w-full sm:w-auto px-8 py-3.5 font-semibold rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-white text-center hover:bg-white/10 transition-all"
                >
                  Read Whitepaper
                </a>
              </div>
            </motion.div>

            {/* Right Column: 3D Canvas */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            >
              <ThreeCoin />
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. STATS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 border glass-panel border-white/10 shadow-xl rounded-2xl">
          <div className="text-center p-2 border-r border-white/5 md:last:border-none">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">VISION Token Price</p>
            <h4 className="text-xl sm:text-2xl font-black text-white font-tabular mt-1">
              ${tokenStats?.priceUsd?.toFixed(4) || '0.0850'}
            </h4>
          </div>
          
          <div className="text-center p-2 md:border-r border-white/5">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Market Cap (Mock)</p>
            <h4 className="text-xl sm:text-2xl font-black text-white font-tabular mt-1">
              ${tokenStats?.marketCapUsd?.toLocaleString() || '8,500,000'}
            </h4>
          </div>
          
          <div className="text-center p-2 border-r border-white/5">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Active Holders</p>
            <h4 className="text-xl sm:text-2xl font-black text-white font-tabular mt-1">
              {tokenStats?.holders?.toLocaleString() || '1,420'}
            </h4>
          </div>
          
          <div className="text-center p-2 border-r border-white/5">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Tokens Burned</p>
            <h4 className="text-xl sm:text-2xl font-black text-vision-cyan font-tabular mt-1">
              {tokenStats?.burnedSupply?.toLocaleString() || '12,500,000'}
            </h4>
          </div>
          
          <div className="text-center p-2 col-span-2 md:col-span-1">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Staking APY</p>
            <h4 className="text-xl sm:text-2xl font-black text-gradient font-tabular mt-1">
              {((tokenStats?.stakingApy || 0.12) * 100).toFixed(0)}%
            </h4>
          </div>
        </div>
      </section>

      {/* 3. WHY VISION (FEATURES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Why Choose the VISION Protocol?
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            VISION delivers visual infrastructure that replaces outdated, high-markup render farms with decentralized consensus rendering.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => (
            <div key={index} className="p-6 border glass-panel border-white/10 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl w-fit mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PARTNERS SLIDER */}
      <section className="border-y border-white/5 bg-white/[0.01] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold text-gray-500 uppercase tracking-widest mb-6">
            PROTOCOL SPONSORS & HARDWARE PARTNERS
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-gray-500 font-bold tracking-widest text-sm">
            {partners.map((partner, index) => (
              <span key={index} className="hover:text-gray-300 transition-colors cursor-default">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TOKENOMICS ALLOCATION PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs font-bold text-vision-cyan uppercase tracking-wider">Token Distribution</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Designed for Long-term Sustainability
          </h2>
          <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
            The VISION tokenomics allocation is structured for a high-throughput Solana launch to balance pre-sale distribution, node-collateralization yields, and core protocol development reserves.
          </p>
          <div className="pt-2">
            <Link
              href="/tokenomics"
              className="inline-flex items-center gap-2 text-sm font-semibold text-vision-cyan hover:underline"
            >
              <span>Explore full Tokenomics & calculator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Allocation Progress Bars */}
        <div className="p-6 border glass-panel border-white/10 rounded-2xl space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Token Allocation Split</h4>
          <div className="space-y-4">
            {allocations.map((alloc, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-300">{alloc.name}</span>
                  <span className="text-white font-semibold">{alloc.percent}%</span>
                </div>
                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                  <div className={`${alloc.color} h-full rounded-full`} style={{ width: `${alloc.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ROADMAP TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Protocol Timeline & Deliverables
          </h2>
          <p className="text-gray-400 text-sm">
            We are moving rapidly toward Mainnet launch. Track our progress through our structured development phases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
          <div className="p-6 border glass-panel border-white/10 rounded-2xl relative overflow-hidden">
            <span className="absolute top-4 right-4 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-full uppercase">
              Completed
            </span>
            <span className="text-xs text-gray-500 font-mono">PHASE 1</span>
            <h4 className="text-lg font-bold text-white mt-1 mb-2">Protocol Architecture</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Writing consensus spec, compiling zero-knowledge zk-SNARK constraints, and launching initial private testing.
            </p>
          </div>

          <div className="p-6 border glass-panel border-white/10 rounded-2xl relative overflow-hidden border-vision-cyan/30">
            <span className="absolute top-4 right-4 text-[10px] font-bold text-vision-cyan bg-vision-cyan/10 px-2 py-0.5 border border-vision-cyan/20 rounded-full uppercase animate-pulse">
              In Progress
            </span>
            <span className="text-xs text-gray-500 font-mono">PHASE 2</span>
            <h4 className="text-lg font-bold text-white mt-1 mb-2">Presale & SDK Integrations</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Opening public pre-sale rounds, releasing UE5 and Unity SDK beta packages, and deploying testnet validators.
            </p>
          </div>

          <div className="p-6 border glass-panel border-white/10 rounded-2xl relative overflow-hidden">
            <span className="absolute top-4 right-4 text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-0.5 border border-white/10 rounded-full uppercase">
              Planned
            </span>
            <span className="text-xs text-gray-500 font-mono">PHASE 3</span>
            <h4 className="text-lg font-bold text-white mt-1 mb-2">Public Testnet v1</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Deploying open-source node clients, opening public validator registration, and testing GPU pooling networks.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 text-sm font-semibold text-vision-cyan hover:underline"
          >
            <span>View detailed 5-phase roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 7. LATEST NEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Latest Network News
          </h2>
          <p className="text-gray-400 text-sm">
            Read the latest technical write-ups and corporate announcements from the VISION team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.slice(0, 3).map((post) => (
            <article key={post.id} className="p-6 border glass-panel border-white/10 rounded-2xl flex flex-col justify-between h-full">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-vision-cyan font-semibold">{post.category}</span>
                  <span className="text-gray-500">{new Date(post.publishedAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-white line-clamp-2 hover:text-vision-cyan transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">{post.excerpt}</p>
              </div>
              <div className="pt-4 border-t border-white/5 mt-4">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-vision-cyan transition-colors"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}
