'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import {
  LayoutDashboard, Users, UserCheck, Settings, Coins, Layers,
  Compass, FileSpreadsheet, Edit3, ShieldAlert, Search, ShieldCheck,
  Ban, RefreshCw, Plus, Edit, Trash, Download, LogOut, ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

type Tab = 'overview' | 'users' | 'kyc' | 'presale' | 'staking' | 'referrals' | 'transactions' | 'cms' | 'settings';

export default function AdminPage() {
  const {
    adminData,
    loading,
    error,
    fetchAdminData,
    adminApproveKyc,
    adminRejectKyc,
    adminToggleSuspend,
    adminUpsertPresaleRound,
    adminUpsertStakingPlan,
    adminSaveCms
  } = useStore();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  // Search & Filter state
  const [userSearch, setUserSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('all');
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('all');

  // Detail drawer / Edit form states
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [kycNotesInput, setKycNotesInput] = useState('');
  
  // Presale Form states
  const [editingRound, setEditingRound] = useState<any | null>(null);
  const [roundName, setRoundName] = useState('');
  const [roundPrice, setRoundPrice] = useState('');
  const [roundHardCap, setRoundHardCap] = useState('');
  const [roundSoftCap, setRoundSoftCap] = useState('');
  const [roundStatus, setRoundStatus] = useState<'upcoming' | 'active' | 'closed'>('upcoming');

  // Staking Form states
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planName, setPlanName] = useState('');
  const [planLockDays, setPlanLockDays] = useState('');
  const [planApy, setPlanApy] = useState('');
  const [planMinStake, setPlanMinStake] = useState('');

  // CMS Form States
  const [cmsHeroTitle, setCmsHeroTitle] = useState('');
  const [cmsHeroSubtitle, setCmsHeroSubtitle] = useState('');
  const [cmsAboutMission, setCmsAboutMission] = useState('');
  const [faqsList, setFaqsList] = useState<any[]>([]);

  // Settings State
  const [settingTelegram, setSettingTelegram] = useState('#');
  const [settingDiscord, setSettingDiscord] = useState('#');

  // Fetch admin data on load
  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Load CMS copy and FAQs once adminData is fetched
  useEffect(() => {
    if (adminData) {
      setCmsHeroTitle(adminData.tokenStats ? useStore.getState().cmsConfig?.homeHeroTitle || 'Powering the Future Through Decentralized Vision' : '');
      setCmsHeroSubtitle(useStore.getState().cmsConfig?.homeHeroSubtitle || '');
      setCmsAboutMission(useStore.getState().cmsConfig?.aboutMission || '');
      setFaqsList(useStore.getState().faqItems || []);
    }
  }, [adminData]);

  if (loading && !adminData) {
    return (
      <div className="min-h-screen bg-vision-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-10 h-10 text-vision-cyan animate-spin" />
          <p className="text-sm font-semibold tracking-wider">Syncing Admin Console...</p>
        </div>
      </div>
    );
  }

  const users = adminData?.users || [];
  const transactions = adminData?.transactions || [];
  const tokenStats = adminData?.tokenStats;
  const presaleRounds = adminData?.presaleRounds || [];
  const stakingPlans = adminData?.stakingPlans || [];
  const contactMessages = adminData?.contactMessages || [];
  const newsletterEmails = adminData?.newsletterEmails || [];

  // Filtered Users list
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.walletAddress.toLowerCase().includes(userSearch.toLowerCase()) || 
                          (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesKyc = kycFilter === 'all' || u.kycStatus === kycFilter;
    return matchesSearch && matchesKyc;
  });

  // Filtered Transactions list
  const filteredTxs = transactions.filter(t => {
    const matchesSearch = t.txHashMock.toLowerCase().includes(txSearch.toLowerCase()) ||
                          t.userId.toLowerCase().includes(txSearch.toLowerCase());
    const matchesType = txTypeFilter === 'all' || t.type === txTypeFilter;
    return matchesSearch && matchesType;
  });

  // Pending KYC Queue
  const pendingKycUsers = users.filter(u => u.kycStatus === 'pending');

  // CSV Exporter
  const exportToCsv = () => {
    const headers = ['Transaction ID', 'User ID', 'Type', 'Amount (VISION)', 'USD Value', 'Status', 'Mock Tx Hash', 'Date'];
    const rows = transactions.map(t => [
      t.id,
      t.userId,
      t.type,
      t.amountVision,
      t.amountUsd || '',
      t.status,
      t.txHashMock,
      new Date(t.createdAt).toISOString()
    ]);
    
    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vision_transactions_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdatePresale = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminUpsertPresaleRound({
      id: editingRound?.id || null,
      name: roundName,
      priceUsd: parseFloat(roundPrice),
      hardCapUsd: parseFloat(roundHardCap),
      softCapUsd: parseFloat(roundSoftCap),
      status: roundStatus
    });
    setEditingRound(null);
    setRoundName('');
    setRoundPrice('');
    setRoundHardCap('');
    setRoundSoftCap('');
  };

  const handleUpdateStaking = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminUpsertStakingPlan({
      id: editingPlan?.id || null,
      name: planName,
      lockDays: parseInt(planLockDays),
      apy: parseFloat(planApy) / 100, // convert percentage back to decimal
      minStakeVision: parseFloat(planMinStake)
    });
    setEditingPlan(null);
    setPlanName('');
    setPlanLockDays('');
    setPlanApy('');
    setPlanMinStake('');
  };

  const handleSaveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminSaveCms(
      {
        homeHeroTitle: cmsHeroTitle,
        homeHeroSubtitle: cmsHeroSubtitle,
        aboutMission: cmsAboutMission
      },
      faqsList
    );
    alert('CMS modifications saved to mock store successfully!');
  };

  return (
    <div className="flex min-h-screen">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 bg-black/40 flex flex-col justify-between flex-shrink-0">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-widest text-gradient">VISION ADMIN</span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'overview' ? 'bg-red-950/30 text-red-400 border border-red-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'users' ? 'bg-red-950/30 text-red-400 border border-red-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              <span>Users</span>
            </button>

            <button
              onClick={() => setActiveTab('kyc')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'kyc' ? 'bg-red-950/30 text-red-400 border border-red-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-4.5 h-4.5" />
                <span>KYC Queue</span>
              </div>
              {pendingKycUsers.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
                  {pendingKycUsers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('presale')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'presale' ? 'bg-red-950/30 text-red-400 border border-red-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Coins className="w-4.5 h-4.5" />
              <span>Presale CRUD</span>
            </button>

            <button
              onClick={() => setActiveTab('staking')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'staking' ? 'bg-red-950/30 text-red-400 border border-red-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4.5 h-4.5" />
              <span>Staking CRUD</span>
            </button>

            <button
              onClick={() => setActiveTab('referrals')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'referrals' ? 'bg-red-950/30 text-red-400 border border-red-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-4.5 h-4.5" />
              <span>Referrals</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'transactions' ? 'bg-red-950/30 text-red-400 border border-red-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet className="w-4.5 h-4.5" />
              <span>Ledger</span>
            </button>

            <button
              onClick={() => setActiveTab('cms')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'cms' ? 'bg-red-950/30 text-red-400 border border-red-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Edit3 className="w-4.5 h-4.5" />
              <span>CMS Editor</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-white/5 space-y-4">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Public Website</span>
          </Link>
          <button
            onClick={() => {
              sessionStorage.removeItem('vsn_admin_auth');
              window.location.reload();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg bg-red-950/30 text-red-400 border border-red-950/50 hover:bg-red-900/30 hover:text-white transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Console</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-8 bg-zinc-950/60 overflow-y-auto max-h-screen">
        
        {/* Active Tab View Panels */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Metrics Overview</h2>
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-4 gap-6">
              
              <div className="p-6 border glass-panel border-white/10 rounded-2xl bg-black/40">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Registered Wallets</span>
                <h3 className="text-3xl font-black text-white font-tabular mt-2">{users.length}</h3>
                <p className="text-[10px] text-gray-500 mt-1">Mock user registry database size</p>
              </div>

              <div className="p-6 border glass-panel border-white/10 rounded-2xl bg-black/40">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Stakers</span>
                <h3 className="text-3xl font-black text-white font-tabular mt-2">
                  {transactions.filter(t => t.type === 'stake' && !t.unstaked).length}
                </h3>
                <p className="text-[10px] text-gray-500 mt-1">Staking contracts currently emitting yield</p>
              </div>

              <div className="p-6 border glass-panel border-white/10 rounded-2xl bg-black/40">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">VISION Tokens Sold</span>
                <h3 className="text-3xl font-black text-vision-cyan font-tabular mt-2">
                  {transactions
                    .filter(t => t.type === 'purchase' && t.status === 'completed')
                    .reduce((acc, curr) => acc + curr.amountVision, 0)
                    .toLocaleString()} VSN
                </h3>
                <p className="text-[10px] text-gray-500 mt-1">Combined presale purchase volume</p>
              </div>

              <div className="p-6 border glass-panel border-white/10 rounded-2xl bg-black/40">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider font-semibold">Total Funds Raised</span>
                <h3 className="text-3xl font-black text-white font-tabular mt-2">
                  ${presaleRounds.reduce((acc, curr) => acc + curr.raisedUsd, 0).toLocaleString()}
                </h3>
                <p className="text-[10px] text-gray-500 mt-1">Presale rounds capital total</p>
              </div>

            </div>

            {/* Quick overview detail items */}
            <div className="grid grid-cols-2 gap-8">
              <div className="p-6 border glass-panel border-white/10 rounded-2xl bg-black/40 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Presale Progress Summary</h4>
                <div className="space-y-4">
                  {presaleRounds.map((round) => (
                    <div key={round.id} className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-300">
                        <span>{round.name}</span>
                        <span className="font-semibold text-white font-tabular">${round.raisedUsd.toLocaleString()} / ${round.hardCapUsd.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-vision-cyan h-full rounded-full"
                          style={{ width: `${(round.raisedUsd / round.hardCapUsd) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border glass-panel border-white/10 rounded-2xl bg-black/40 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Inbox (Mock contact forms)</h4>
                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {contactMessages.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No contact support messages logged.</p>
                  ) : (
                    contactMessages.map((msg) => (
                      <div key={msg.id} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <strong>{msg.name} ({msg.email})</strong>
                          <span className="font-mono">{new Date(msg.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-300 leading-normal">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: User management */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">User Directory</h2>

            {/* Filter tool */}
            <div className="flex gap-4 p-4 border glass-panel border-white/10 rounded-xl bg-black/30">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-500" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Filter by wallet address..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-black/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <select
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-black/60 border border-white/10 text-xs text-white focus:outline-none"
              >
                <option value="all">All KYC Statuses</option>
                <option value="not_started">Not Started</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* User database table */}
            <div className="border glass-panel border-white/10 rounded-2xl overflow-hidden bg-black/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-gray-500">
                    <th className="p-4 uppercase font-semibold">WALLET ADDRESS</th>
                    <th className="p-4 uppercase font-semibold">EMAIL</th>
                    <th className="p-4 uppercase font-semibold">KYC STATUS</th>
                    <th className="p-4 uppercase font-semibold">VISION BALANCE</th>
                    <th className="p-4 uppercase font-semibold">TOTAL SPENT (USD)</th>
                    <th className="p-4 uppercase font-semibold">STATUS</th>
                    <th className="p-4 uppercase font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className={selectedUser?.id === u.id ? 'bg-white/5' : ''}>
                      <td className="p-4 font-mono font-bold text-white truncate max-w-[180px]">{u.walletAddress}</td>
                      <td className="p-4">{u.email || <span className="text-gray-600 italic">None</span>}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 border rounded-full font-bold uppercase text-[9px] ${
                          u.kycStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          u.kycStatus === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          u.kycStatus === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                          {u.kycStatus}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white font-tabular">{u.visionBalance.toLocaleString()} VSN</td>
                      <td className="p-4 font-bold text-white font-tabular">${u.totalPurchasedUsd.toLocaleString()}</td>
                      <td className="p-4">
                        {u.suspended ? (
                          <span className="text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Ban className="w-3.5 h-3.5" /> Suspended
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Active
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setKycNotesInput(u.kycNotes || '');
                          }}
                          className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white transition-colors"
                        >
                          Manage Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Profile Drawer / Editor overlay */}
            {selectedUser && (
              <div className="p-6 border glass-panel border-white/10 rounded-2xl bg-black/80 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Manage Profile: {selectedUser.walletAddress}</h3>
                  <button onClick={() => setSelectedUser(null)} className="text-xs text-gray-500 hover:text-white">Close Panel</button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3">
                    <p><strong>System ID:</strong> <span className="font-mono text-gray-400">{selectedUser.id}</span></p>
                    <p><strong>Registered Date:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                    <p><strong>Referral Code:</strong> <span className="font-mono font-bold text-vision-cyan">{selectedUser.referralCode}</span></p>
                    <p><strong>Referred By:</strong> <span className="font-mono text-gray-400">{selectedUser.referredBy || 'None'}</span></p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Suspend toggles */}
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                      <div>
                        <p className="font-bold text-white">Suspension Status</p>
                        <p className="text-[10px] text-gray-500">Toggle user ability to stake/buy</p>
                      </div>
                      <button
                        onClick={async () => {
                          await adminToggleSuspend(selectedUser.id, !selectedUser.suspended);
                          // Sync local state
                          setSelectedUser({ ...selectedUser, suspended: !selectedUser.suspended });
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          selectedUser.suspended 
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
                            : 'bg-rose-600 text-white hover:bg-rose-500'
                        }`}
                      >
                        {selectedUser.suspended ? 'Reactive Account' : 'Suspend Account'}
                      </button>
                    </div>

                    {/* KYC note edit */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Review Notes / Memo
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={kycNotesInput}
                          onChange={(e) => setKycNotesInput(e.target.value)}
                          placeholder="Approve/reject memo log notes"
                          className="flex-1 px-3 py-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none"
                        />
                        <button
                          onClick={async () => {
                            // Save note by updating status (keep current status)
                            await adminApproveKyc(selectedUser.id, kycNotesInput);
                            setSelectedUser({ ...selectedUser, kycNotes: kycNotesInput });
                            alert('Notes updated.');
                          }}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: KYC Queue */}
        {activeTab === 'kyc' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">KYC Review queue</h2>

            {pendingKycUsers.length === 0 ? (
              <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-gray-500 text-xs italic bg-white/[0.01]">
                No pending KYC applications in queue.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingKycUsers.map((user) => (
                  <div key={user.id} className="p-5 border glass-panel border-white/10 rounded-2xl bg-black/50 space-y-4 flex flex-col justify-between md:flex-row md:items-center">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-bold text-white font-mono truncate max-w-[280px]">{user.walletAddress}</h4>
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
                          Pending Review
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">Email: <strong>{user.email || 'Anonymous'}</strong></p>
                      <p className="text-xs text-gray-400 italic">User submission metadata: {user.kycNotes}</p>
                    </div>

                    {/* KYC notes and review actions */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0 items-end">
                      <div className="space-y-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider">Notes</label>
                        <input
                          type="text"
                          id={`note-${user.id}`}
                          placeholder="Identity verified..."
                          className="px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-xs text-white focus:outline-none w-52"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            const note = (document.getElementById(`note-${user.id}`) as HTMLInputElement)?.value || 'Approved by admin.';
                            await adminApproveKyc(user.id, note);
                          }}
                          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white"
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            const note = (document.getElementById(`note-${user.id}`) as HTMLInputElement)?.value || 'Documents rejected.';
                            await adminRejectKyc(user.id, note);
                          }}
                          className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white"
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Presale CRUD */}
        {activeTab === 'presale' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Presale Rounds Management</h2>

            {/* Editing / Create Form panel */}
            <div className="p-6 border glass-panel border-white/10 rounded-2xl bg-black/40 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {editingRound ? `Edit Presale Round: ${editingRound.name}` : 'Create New Presale Round'}
              </h3>
              
              <form onSubmit={handleUpdatePresale} className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">Round Name</label>
                  <input
                    type="text"
                    required
                    value={roundName}
                    onChange={(e) => setRoundName(e.target.value)}
                    placeholder="Round 4"
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">Token Price (USD)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={roundPrice}
                    onChange={(e) => setRoundPrice(e.target.value)}
                    placeholder="0.15"
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">Soft Cap (USD)</label>
                  <input
                    type="number"
                    required
                    value={roundSoftCap}
                    onChange={(e) => setRoundSoftCap(e.target.value)}
                    placeholder="500000"
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">Hard Cap (USD)</label>
                  <input
                    type="number"
                    required
                    value={roundHardCap}
                    onChange={(e) => setRoundHardCap(e.target.value)}
                    placeholder="2000000"
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">Status</label>
                  <select
                    value={roundStatus}
                    onChange={(e) => setRoundStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="col-span-2 md:col-span-5 flex justify-end gap-2 pt-2">
                  {editingRound && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRound(null);
                        setRoundName('');
                        setRoundPrice('');
                        setRoundHardCap('');
                        setRoundSoftCap('');
                      }}
                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-gradient-vision text-black font-bold text-xs"
                  >
                    {editingRound ? 'Update Round' : 'Create Round'}
                  </button>
                </div>
              </form>
            </div>

            {/* Rounds list table */}
            <div className="border glass-panel border-white/10 rounded-2xl overflow-hidden bg-black/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-gray-500">
                    <th className="p-4 uppercase font-semibold">ROUND NAME</th>
                    <th className="p-4 uppercase font-semibold">TOKEN PRICE</th>
                    <th className="p-4 uppercase font-semibold">SOFT / HARD CAP</th>
                    <th className="p-4 uppercase font-semibold">RAISED (USD)</th>
                    <th className="p-4 uppercase font-semibold">STATUS</th>
                    <th className="p-4 uppercase font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {presaleRounds.map((round) => (
                    <tr key={round.id}>
                      <td className="p-4 font-bold text-white">{round.name}</td>
                      <td className="p-4 font-bold font-tabular">${round.priceUsd.toFixed(4)}</td>
                      <td className="p-4 font-tabular">${round.softCapUsd.toLocaleString()} / ${round.hardCapUsd.toLocaleString()}</td>
                      <td className="p-4 font-bold text-vision-cyan font-tabular">${round.raisedUsd.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 border rounded-full font-bold uppercase text-[9px] ${
                          round.status === 'active' ? 'bg-vision-cyan/10 text-vision-cyan border-vision-cyan/20 animate-pulse' :
                          round.status === 'closed' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {round.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setEditingRound(round);
                            setRoundName(round.name);
                            setRoundPrice(String(round.priceUsd));
                            setRoundHardCap(String(round.hardCapUsd));
                            setRoundSoftCap(String(round.softCapUsd));
                            setRoundStatus(round.status);
                          }}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white flex items-center gap-1.5 ml-auto"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Tab 5: Staking CRUD */}
        {activeTab === 'staking' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Staking Pools Configurator</h2>

            {/* Editing / Create Form panel */}
            <div className="p-6 border glass-panel border-white/10 rounded-2xl bg-black/40 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {editingPlan ? `Edit Staking Plan: ${editingPlan.name}` : 'Create New Staking Plan'}
              </h3>
              
              <form onSubmit={handleUpdateStaking} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="Flexible Light"
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">Lock period (Days)</label>
                  <input
                    type="number"
                    required
                    value={planLockDays}
                    onChange={(e) => setPlanLockDays(e.target.value)}
                    placeholder="30"
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">Yield APY (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={planApy}
                    onChange={(e) => setPlanApy(e.target.value)}
                    placeholder="12.5"
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">Minimum Stake Limit</label>
                  <input
                    type="number"
                    required
                    value={planMinStake}
                    onChange={(e) => setPlanMinStake(e.target.value)}
                    placeholder="500"
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="col-span-2 md:col-span-4 flex justify-end gap-2 pt-2">
                  {editingPlan && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlan(null);
                        setPlanName('');
                        setPlanLockDays('');
                        setPlanApy('');
                        setPlanMinStake('');
                      }}
                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-gradient-vision text-black font-bold text-xs"
                  >
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </button>
                </div>
              </form>
            </div>

            {/* Plans list table */}
            <div className="border glass-panel border-white/10 rounded-2xl overflow-hidden bg-black/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-gray-500">
                    <th className="p-4 uppercase font-semibold">PLAN NAME</th>
                    <th className="p-4 uppercase font-semibold">LOCK DAYS</th>
                    <th className="p-4 uppercase font-semibold">ANNUAL APY</th>
                    <th className="p-4 uppercase font-semibold">MINIMUM STAKE</th>
                    <th className="p-4 uppercase font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {stakingPlans.map((plan) => (
                    <tr key={plan.id}>
                      <td className="p-4 font-bold text-white">{plan.name}</td>
                      <td className="p-4 font-bold font-tabular">{plan.lockDays} Days</td>
                      <td className="p-4 font-black text-vision-cyan font-tabular">{((plan.apy || 0) * 100).toFixed(1)}% APY</td>
                      <td className="p-4 font-tabular">{plan.minStakeVision.toLocaleString()} VSN</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setEditingPlan(plan);
                            setPlanName(plan.name);
                            setPlanLockDays(String(plan.lockDays));
                            setPlanApy(String(plan.apy * 100)); // display as percentage integer
                            setPlanMinStake(String(plan.minStakeVision));
                          }}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white flex items-center gap-1.5 ml-auto"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Tab 6: Referrals */}
        {activeTab === 'referrals' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Referrals & Commissions</h2>
            
            <div className="border glass-panel border-white/10 rounded-2xl overflow-hidden bg-black/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-gray-500">
                    <th className="p-4 uppercase font-semibold">INVITED USER WALLET</th>
                    <th className="p-4 uppercase font-semibold">REFERRAL INVITE CODE</th>
                    <th className="p-4 uppercase font-semibold">REFERRED BY CODE</th>
                    <th className="p-4 uppercase font-semibold">PURCHASE VOLUME (USD)</th>
                    <th className="p-4 uppercase font-semibold">MOCK COMMISSION PAID (VSN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {users
                    .filter(u => u.referredBy)
                    .map((user) => {
                      const referrer = users.find(r => r.referralCode === user.referredBy);
                      const commission = transactions
                        .filter(t => t.type === 'referral_payout' && t.userId === referrer?.id)
                        .reduce((acc, curr) => acc + curr.amountVision, 0);

                      return (
                        <tr key={user.id}>
                          <td className="p-4 font-mono font-bold text-white truncate max-w-[200px]">{user.walletAddress}</td>
                          <td className="p-4 font-mono text-gray-400">{user.referralCode}</td>
                          <td className="p-4 font-mono font-bold text-vision-cyan">{user.referredBy}</td>
                          <td className="p-4 font-bold text-white font-tabular">${user.totalPurchasedUsd.toLocaleString()}</td>
                          <td className="p-4 font-bold text-white font-tabular">
                            {(user.totalPurchasedUsd * 0.05 / (tokenStats?.priceUsd || 0.085)).toLocaleString(undefined, { maximumFractionDigits: 0 })} VSN
                          </td>
                        </tr>
                      );
                    })}
                  {users.filter(u => u.referredBy).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500 italic">
                        No active referral relationships recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 7: Transactions Spreadsheet */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">Transaction Ledger</h2>
              <button
                onClick={exportToCsv}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export Ledger (CSV)</span>
              </button>
            </div>

            {/* Filter tool */}
            <div className="flex gap-4 p-4 border glass-panel border-white/10 rounded-xl bg-black/30">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-500" />
                <input
                  type="text"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  placeholder="Filter by hash, user ID..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-black/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <select
                value={txTypeFilter}
                onChange={(e) => setTxTypeFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-black/60 border border-white/10 text-xs text-white focus:outline-none"
              >
                <option value="all">All Transaction Types</option>
                <option value="purchase">Purchase</option>
                <option value="stake">Stake</option>
                <option value="unstake">Unstake</option>
                <option value="claim_reward">Claim Reward</option>
                <option value="referral_payout">Referral Payout</option>
              </select>
            </div>

            {/* Spreadsheet Table */}
            <div className="border glass-panel border-white/10 rounded-2xl overflow-hidden bg-black/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-gray-500">
                    <th className="p-4 uppercase font-semibold">TX ID</th>
                    <th className="p-4 uppercase font-semibold">USER</th>
                    <th className="p-4 uppercase font-semibold">TYPE</th>
                    <th className="p-4 uppercase font-semibold">AMOUNT (VISION)</th>
                    <th className="p-4 uppercase font-semibold">USD VALUE</th>
                    <th className="p-4 uppercase font-semibold">MOCK TX HASH</th>
                    <th className="p-4 uppercase font-semibold">STATUS</th>
                    <th className="p-4 uppercase font-semibold">DATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {filteredTxs.map((t) => {
                    const u = users.find(us => us.id === t.userId);
                    return (
                      <tr key={t.id}>
                        <td className="p-4 font-mono font-bold text-gray-400">{t.id}</td>
                        <td className="p-4 font-mono truncate max-w-[120px]" title={u?.walletAddress || t.userId}>
                          {u ? u.walletAddress.substring(0, 8) + '...' : t.userId}
                        </td>
                        <td className="p-4 font-bold uppercase tracking-wider text-gray-400">
                          {t.type === 'purchase' && <span className="text-vision-cyan">Purchase</span>}
                          {t.type === 'stake' && <span className="text-vision-blue">Stake</span>}
                          {t.type === 'unstake' && <span className="text-rose-400">Unstake</span>}
                          {t.type === 'claim_reward' && <span className="text-emerald-400">Claim Reward</span>}
                          {t.type === 'referral_payout' && <span className="text-purple-400">Referral Payout</span>}
                        </td>
                        <td className="p-4 font-bold text-white font-tabular">{t.amountVision.toLocaleString()} VSN</td>
                        <td className="p-4 font-bold text-white font-tabular">{t.amountUsd ? `$${t.amountUsd.toLocaleString()}` : <span className="text-gray-600">-</span>}</td>
                        <td className="p-4 font-mono text-gray-500 truncate max-w-[150px]">{t.txHashMock}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 border rounded-full font-bold uppercase text-[9px] ${
                            t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            t.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-500 font-mono">{new Date(t.createdAt).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Tab 8: CMS Editor */}
        {activeTab === 'cms' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">CMS copy blocks & FAQs</h2>

            <form onSubmit={handleSaveCms} className="space-y-6">
              
              {/* Marketing Copy Fields */}
              <div className="p-6 border glass-panel border-white/10 rounded-2xl bg-black/40 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Marketing Copy blocks</h3>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Home Hero Title</label>
                    <input
                      type="text"
                      required
                      value={cmsHeroTitle}
                      onChange={(e) => setCmsHeroTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-sm focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Home Hero Subtitle</label>
                    <textarea
                      required
                      rows={3}
                      value={cmsHeroSubtitle}
                      onChange={(e) => setCmsHeroSubtitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-sm focus:outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">About Mission Statement</label>
                    <textarea
                      required
                      rows={3}
                      value={cmsAboutMission}
                      onChange={(e) => setCmsAboutMission(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-sm focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* FAQ Management */}
              <div className="p-6 border glass-panel border-white/10 rounded-2xl bg-black/40 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Accordion FAQs Manager</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setFaqsList([
                        ...faqsList,
                        { id: `faq-${Date.now()}`, category: 'Presale', question: 'New Question?', answer: 'Answer here.' }
                      ]);
                    }}
                    className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add FAQ Item
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {faqsList.map((faq, index) => (
                    <div key={faq.id} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3 relative">
                      
                      <button
                        type="button"
                        onClick={() => {
                          setFaqsList(faqsList.filter(f => f.id !== faq.id));
                        }}
                        className="absolute top-4 right-4 p-1 text-gray-500 hover:text-rose-400 rounded transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider">Category</label>
                          <select
                            value={faq.category}
                            onChange={(e) => {
                              const updated = [...faqsList];
                              updated[index].category = e.target.value;
                              setFaqsList(updated);
                            }}
                            className="w-full px-2 py-1.5 rounded bg-black border border-white/10 text-xs text-white"
                          >
                            <option value="Presale">Presale</option>
                            <option value="Staking">Staking</option>
                            <option value="Wallet">Wallet</option>
                            <option value="KYC">KYC</option>
                            <option value="Security">Security</option>
                          </select>
                        </div>
                        
                        <div className="col-span-3 space-y-1">
                          <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider">Question</label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const updated = [...faqsList];
                              updated[index].question = e.target.value;
                              setFaqsList(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded bg-black border border-white/10 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider">Answer</label>
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => {
                            const updated = [...faqsList];
                            updated[index].answer = e.target.value;
                            setFaqsList(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded bg-black border border-white/10 text-xs text-white focus:outline-none resize-none"
                        />
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Submit CMS edits */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-90 active:scale-[0.99]"
                >
                  Save CMS Changes & Propagate
                </button>
              </div>

            </form>
          </div>
        )}

      </main>

    </div>
  );
}
