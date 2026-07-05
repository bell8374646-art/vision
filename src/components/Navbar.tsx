'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import WalletModal from './WalletModal';
import { Menu, X, Wallet, ChevronDown, User, ShieldAlert, LogOut, Settings } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { walletAddress, isConnected, userProfile, disconnectWallet } = useStore();
  
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isAdmin = pathname.startsWith('/admin');

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isDropdownOpen && !target.closest('.user-menu-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  // Close mobile menu on page navigate
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Tokenomics', path: '/tokenomics' },
    { name: 'Roadmap', path: '/roadmap' },
    { name: 'Staking', path: '/staking' },
    { name: 'Presale', path: '/presale', highlight: true },
    { name: 'Blog', path: '/blog' },
    { name: 'FAQ', path: '/contact' }
  ];

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const getKycBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getKycLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'KYC Verified';
      case 'pending': return 'KYC Pending';
      case 'rejected': return 'KYC Rejected';
      default: return 'KYC Not Started';
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-md transition-all duration-200 ${
        isAdmin 
          ? 'bg-red-950/20 border-red-900/30' 
          : 'bg-black/40 border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-wider text-gradient">VISION</span>
                {isAdmin && (
                  <span className="text-[10px] font-bold tracking-widest text-red-400 px-2 py-0.5 border border-red-500/30 bg-red-950/40 rounded-full uppercase">
                    Admin
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      link.highlight
                        ? isActive
                          ? 'bg-gradient-vision text-black font-semibold'
                          : 'border border-vision-cyan/30 text-vision-cyan hover:bg-vision-cyan hover:text-black hover:border-transparent'
                        : isActive
                          ? 'text-white bg-white/10'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Wallet Connection / Dropdown */}
            <div className="hidden md:flex items-center">
              {isConnected && walletAddress ? (
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-all focus:outline-none"
                  >
                    <Wallet className="w-4 h-4 text-vision-cyan" />
                    <span className="font-mono">{formatAddress(walletAddress)}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl p-4 space-y-3 z-50">
                      
                      {/* User Info */}
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Account Address</p>
                        <p className="font-mono text-sm text-gray-200 mt-0.5 truncate">{walletAddress}</p>
                      </div>

                      {/* Balances */}
                      <div className="grid grid-cols-2 gap-2 py-2 border-y border-white/10">
                        <div>
                          <p className="text-xs text-gray-500">VISION Balance</p>
                          <p className="text-base font-bold text-white font-tabular">
                            {userProfile?.visionBalance?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Presale Spent</p>
                          <p className="text-base font-bold text-white font-tabular">
                            ${userProfile?.totalPurchasedUsd?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </div>

                      {/* KYC Status Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Identity Verification</span>
                        <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider ${getKycBadgeColor(userProfile?.kycStatus || 'not_started')}`}>
                          {getKycLabel(userProfile?.kycStatus || 'not_started')}
                        </span>
                      </div>

                      {/* Action Links */}
                      <div className="pt-2 space-y-1">
                        <Link
                          href="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold rounded-lg text-red-400 bg-red-950/20 border border-red-900/30 hover:bg-red-900/40 hover:text-white transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Admin Console</span>
                        </Link>
                        
                        <button
                          onClick={() => {
                            disconnectWallet();
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Disconnect Wallet</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-vision text-black text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] duration-100"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-2xl">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
                      link.highlight
                        ? isActive
                          ? 'bg-gradient-vision text-black font-semibold'
                          : 'border border-vision-cyan/30 text-vision-cyan text-center mt-2'
                        : isActive
                          ? 'bg-white/10 text-white'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              {/* Wallet connector for mobile */}
              <div className="pt-4 border-t border-white/10 px-3">
                {isConnected && walletAddress ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-mono text-gray-400">{formatAddress(walletAddress)}</span>
                      <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full uppercase ${getKycBadgeColor(userProfile?.kycStatus || 'not_started')}`}>
                        {getKycLabel(userProfile?.kycStatus || 'not_started')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <div>
                        <p>VISION Balance</p>
                        <p className="font-bold text-white text-sm mt-0.5 font-tabular">
                          {userProfile?.visionBalance?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div>
                        <p>Presale Total</p>
                        <p className="font-bold text-white text-sm mt-0.5 font-tabular">
                          ${userProfile?.totalPurchasedUsd?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href="/admin"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-red-400 bg-red-950/20 border border-red-900/30 hover:bg-red-900/40"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                      <button
                        onClick={disconnectWallet}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-white/10 text-gray-400 hover:text-white"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsWalletModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-vision text-black font-semibold hover:opacity-90"
                  >
                    <Wallet className="w-5 h-5" />
                    <span>Connect Wallet</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to push content below navbar */}
      <div className="h-16" />

      {/* Wallet Connection Modal */}
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </>
  );
}
