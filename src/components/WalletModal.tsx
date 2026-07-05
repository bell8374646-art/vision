'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { X, Wallet, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type WalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const connectWallet = useStore((state) => state.connectWallet);
  const [customAddress, setCustomAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeNetwork, setActiveNetwork] = useState<'evm' | 'solana'>('evm');
  
  const defaultEvmAddress = '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5';
  const defaultSolAddress = 'HN7cAD911KwtEa3Ddd389Cc1E1d165CC4BAfe5Sol';

  const handleConnect = async (address: string) => {
    if (activeNetwork === 'evm') {
      if (!address.startsWith('0x') || address.length !== 42) {
        setErrorMsg('Please enter a valid EVM address (must start with 0x and be 42 characters).');
        return;
      }
    } else {
      if (address.startsWith('0x') || address.length < 32 || address.length > 44) {
        setErrorMsg('Please enter a valid Solana address (base58, 32-44 characters, no 0x prefix).');
        return;
      }
    }
    setErrorMsg('');
    await connectWallet(address);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md p-6 overflow-hidden border glass-panel border-white/10 shadow-2xl rounded-2xl z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-vision-cyan" />
                <h3 className="text-xl font-bold tracking-tight text-white">Connect Wallet</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Network Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/5 mb-4 text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => {
                  setActiveNetwork('evm');
                  setCustomAddress('');
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg text-center transition-all ${
                  activeNetwork === 'evm'
                    ? 'bg-vision-cyan text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                EVM Networks
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveNetwork('solana');
                  setCustomAddress('');
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg text-center transition-all ${
                  activeNetwork === 'solana'
                    ? 'bg-vision-cyan text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Solana Network
              </button>
            </div>

            {/* Warning Note */}
            <div className="flex gap-2 p-3 mb-4 border rounded-lg bg-vision-cyan/5 border-vision-cyan/20 text-xs text-vision-cyan">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <p>
                <strong>Demo Mode:</strong> Connect with any mock address. No real transactions will occur and no actual mainnet funds are required.
              </p>
            </div>

            {/* Wallet Options */}
            <div className="space-y-2 mb-4">
              {activeNetwork === 'evm' ? (
                <>
                  <button
                    onClick={() => handleConnect(defaultEvmAddress)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left group"
                  >
                    <div>
                      <h4 className="font-semibold text-white text-sm">VISION Demo Account</h4>
                      <p className="text-[10px] text-gray-400">Pre-loaded with mock USDT, ETH, and BNB</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-vision-cyan group-hover:translate-x-1 transition-all" />
                  </button>

                  <button
                    onClick={() => handleConnect('0x71C7656EC7ab88b098defB751B7401B5f6d8976F')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-left text-xs group"
                  >
                    <div>
                      <h4 className="font-medium text-white">MetaMask (Simulated)</h4>
                      <p className="text-[10px] text-gray-500">Connect to MetaMask dev profile</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-vision-cyan group-hover:translate-x-1 transition-all" />
                  </button>

                  <button
                    onClick={() => handleConnect('0x281059546162b1C9CCD69749C47c59b6fA0C0a4B')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-left text-xs group"
                  >
                    <div>
                      <h4 className="font-medium text-white">Coinbase Wallet (Simulated)</h4>
                      <p className="text-[10px] text-gray-500">Connect to Coinbase dev profile</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-vision-cyan group-hover:translate-x-1 transition-all" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleConnect(defaultSolAddress)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left group"
                  >
                    <div>
                      <h4 className="font-semibold text-white text-sm">VISION Demo Solana Account</h4>
                      <p className="text-[10px] text-gray-400">Pre-loaded with mock SOL and USDT</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-vision-cyan group-hover:translate-x-1 transition-all" />
                  </button>

                  <button
                    onClick={() => handleConnect('PhanTom55EC7ab88b098defB751B7401B5f6d8976F')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-left text-xs group"
                  >
                    <div>
                      <h4 className="font-medium text-white">Phantom Wallet (Simulated)</h4>
                      <p className="text-[10px] text-gray-500">Connect to Phantom SPL profile</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-vision-cyan group-hover:translate-x-1 transition-all" />
                  </button>

                  <button
                    onClick={() => handleConnect('SolFlareCCD69749C47c59b6fA0C0a4B5f6d8976F')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-left text-xs group"
                  >
                    <div>
                      <h4 className="font-medium text-white">Solflare Wallet (Simulated)</h4>
                      <p className="text-[10px] text-gray-500">Connect to Solflare SPL profile</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-vision-cyan group-hover:translate-x-1 transition-all" />
                  </button>
                </>
              )}
            </div>

            {/* Custom Input */}
            <div className="border-t border-white/10 pt-4">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Or Connect Custom {activeNetwork === 'evm' ? 'EVM' : 'Solana'} Address
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder={activeNetwork === 'evm' ? "0x..." : "HN7c..."}
                  className="flex-1 px-4 py-2 text-sm rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-vision-cyan transition-colors"
                />
                <button
                  onClick={() => handleConnect(customAddress)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-vision text-black hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Connect
                </button>
              </div>
              {errorMsg && <p className="text-xs text-red-400 mt-2 font-medium">{errorMsg}</p>}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
