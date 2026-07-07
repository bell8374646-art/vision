'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { Mail, ArrowRight, ShieldCheck, Github, Twitter, Send } from 'lucide-react';

export default function Footer() {
  const submitNewsletter = useStore((state) => state.submitNewsletter);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Simple validation
    if (!email.includes('@') || email.length < 5) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    
    setErrorMsg('');
    setLoading(true);
    const success = await submitNewsletter(email);
    setLoading(false);
    
    if (success) {
      setSubscribed(true);
      setEmail('');
    } else {
      setErrorMsg('Failed to subscribe. Please try again.');
    }
  };

  return (
    <footer className="bg-vision-black border-t border-white/5 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Tagline Column */}
          <div className="space-y-4 md:col-span-1">
            <span className="text-2xl font-black tracking-wider text-gradient">VISION</span>
            <p className="text-sm text-gray-400 leading-relaxed">
              Powering the Future Through Decentralized Vision. The first trustless zk-rendering consensus protocol.
            </p>
            <div className="flex gap-3 text-gray-400">
              <a href="https://x.com/visioncoin0" target="_blank" rel="noopener noreferrer" className="hover:text-vision-cyan transition-colors" title="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://t.me/Vision_57" target="_blank" rel="noopener noreferrer" className="hover:text-vision-cyan transition-colors" title="Telegram">
                <Send className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-vision-cyan transition-colors" title="GitHub">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Protocol</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-vision-cyan transition-colors">
                  About VISION
                </Link>
              </li>
              <li>
                <Link href="/tokenomics" className="text-gray-400 hover:text-vision-cyan transition-colors">
                  Tokenomics
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-gray-400 hover:text-vision-cyan transition-colors">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="/staking" className="text-gray-400 hover:text-vision-cyan transition-colors">
                  Staking Vaults
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-vision-cyan transition-colors">
                  Technical Whitepaper (PDF)
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-vision-cyan transition-colors">
                  Smart Contract Audits
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-vision-cyan transition-colors">
                  Developer Documentation
                </a>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-vision-cyan transition-colors">
                  Blog & Announcements
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Newsletter</h4>
            <p className="text-xs text-gray-400">
              Receive updates on pre-sale milestones, security audits, and development sprints.
            </p>
            {subscribed ? (
              <div className="p-3 border border-vision-cyan/20 bg-vision-cyan/5 rounded-xl text-xs text-vision-cyan font-medium">
                Thank you! You are now subscribed.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    disabled={loading}
                    className="w-full pl-3 pr-10 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-vision-cyan transition-colors disabled:opacity-55"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-1 top-1 bottom-1 px-2.5 rounded-lg bg-white/10 hover:bg-vision-cyan hover:text-black text-white flex items-center justify-center transition-all disabled:opacity-55"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {errorMsg && <p className="text-[11px] text-red-400 font-medium">{errorMsg}</p>}
              </form>
            )}
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} VISION Network. All rights reserved.
          </p>

          <div className="flex items-center gap-2 max-w-lg md:text-right text-center">
            <ShieldCheck className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <p className="text-[10px] text-gray-600 leading-normal">
              <strong>Demo Disclaimer:</strong> All operations, price ticker values, KYC validations, staking pools, and transaction hashes shown on this web app are mock assets. No real tokens, funds, or crypto assets are traded.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
