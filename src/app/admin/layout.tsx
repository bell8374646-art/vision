'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { ShieldCheck, Eye, EyeOff, Laptop, ChevronLeft, Lock } from 'lucide-react';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const [isDesktop, setIsDesktop] = useState(true);

  // Check screen size
  useEffect(() => {
    const checkViewport = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Remember login state in session storage for convenience
  useEffect(() => {
    const logged = sessionStorage.getItem('vsn_admin_auth');
    if (logged === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
      sessionStorage.setItem('vsn_admin_auth', 'true');
    } else {
      setAuthError('Invalid credentials. Hint: use admin123');
    }
  };

  // 1. Viewport Guard
  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-vision-black flex flex-col items-center justify-center p-6 text-center">
        <div className="p-8 border glass-panel border-red-500/20 bg-red-950/5 max-w-md rounded-2xl space-y-4">
          <Laptop className="w-12 h-12 text-red-400 mx-auto animate-pulse" />
          <h2 className="text-xl font-bold text-white">Admin Console Restricted</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            The VISION Admin Dashboard is desktop-only to facilitate managing large spreadsheet datasets and CMS block configuration fields.
          </p>
          <p className="text-xs text-vision-cyan font-semibold">
            Please expand your browser viewport width above 1024px or sign in from a desktop PC.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-white/5 border border-white/10 px-4 py-2 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Return to Public Site</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authentication Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-vision-black flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.05)_0%,transparent_60%)] pointer-events-none" />
        
        <div className="w-full max-w-md p-8 border glass-panel border-white/10 shadow-2xl rounded-2xl relative bg-black/40 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-red-950/20 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase">VISION Admin</h2>
            <p className="text-xs text-gray-500">Security Gatehouse authentication required.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Passphrase
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 text-sm rounded-lg bg-black/60 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {authError && <p className="text-xs text-red-400 font-medium">{authError}</p>}

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-red-600 to-red-800 text-white hover:opacity-90 transition-opacity active:scale-[0.99]"
            >
              Unlock Console
            </button>
          </form>
          
          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Cancel & return to website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Render Dashboard sidebar navigation layout
  return (
    <div className="min-h-screen bg-vision-black text-gray-100 flex">
      {/* Admin specific container styles are handled by the page.tsx child */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
