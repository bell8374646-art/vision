import { create } from 'zustand';
import { TokenStats, PresaleRound, StakingPlan, User, Transaction, BlogPost, FAQItem, CMSConfig } from '@/types';

type AdminData = {
  users: User[];
  transactions: Transaction[];
  tokenStats: TokenStats;
  presaleRounds: PresaleRound[];
  stakingPlans: StakingPlan[];
  contactMessages: any[];
  newsletterEmails: any[];
};

interface State {
  walletAddress: string | null;
  isConnected: boolean;
  userProfile: User | null;
  transactions: Transaction[];
  tokenStats: TokenStats | null;
  activePresaleRound: PresaleRound | null;
  stakingPlans: StakingPlan[];
  blogPosts: BlogPost[];
  faqItems: FAQItem[];
  cmsConfig: CMSConfig | null;
  
  adminData: AdminData | null;
  
  loading: boolean;
  error: string | null;
  
  // Actions
  connectWallet: (address: string) => Promise<void>;
  disconnectWallet: () => void;
  fetchUserProfile: (address: string) => Promise<void>;
  fetchTokenStats: () => Promise<void>;
  fetchActivePresaleRound: () => Promise<void>;
  fetchStakingPlans: () => Promise<void>;
  fetchBlogPosts: () => Promise<void>;
  fetchFaqsAndCms: () => Promise<void>;
  
  purchaseVision: (amount: string, currency: string, referralCode: string) => Promise<Transaction | null>;
  stakeTokens: (planId: string, amount: string) => Promise<Transaction | null>;
  claimRewards: (transactionId: string) => Promise<any>;
  unstakeTokens: (transactionId: string) => Promise<any>;
  submitKyc: (fullName: string, email: string, documentType: string) => Promise<User | null>;
  
  // Admin Actions
  fetchAdminData: () => Promise<void>;
  adminApproveKyc: (userId: string, notes: string) => Promise<void>;
  adminRejectKyc: (userId: string, notes: string) => Promise<void>;
  adminToggleSuspend: (userId: string, suspended: boolean) => Promise<void>;
  adminUpsertPresaleRound: (roundData: any) => Promise<void>;
  adminUpsertStakingPlan: (planData: any) => Promise<void>;
  adminSaveCms: (cmsData: any, faqData: any) => Promise<void>;
  submitContactForm: (name: string, email: string, message: string) => Promise<boolean>;
  submitNewsletter: (email: string) => Promise<boolean>;
}

export const useStore = create<State>((set, get) => ({
  walletAddress: null,
  isConnected: false,
  userProfile: null,
  transactions: [],
  tokenStats: null,
  activePresaleRound: null,
  stakingPlans: [],
  blogPosts: [],
  faqItems: [],
  cmsConfig: null,
  adminData: null,
  loading: false,
  error: null,

  connectWallet: async (address: string) => {
    set({ loading: true, error: null });
    try {
      set({ walletAddress: address, isConnected: true });
      // Fetch user profile associated with wallet
      await get().fetchUserProfile(address);
    } catch (err: any) {
      set({ error: err.message || 'Failed to connect wallet' });
    } finally {
      set({ loading: false });
    }
  },

  disconnectWallet: () => {
    set({
      walletAddress: null,
      isConnected: false,
      userProfile: null,
      transactions: []
    });
  },

  fetchUserProfile: async (address: string) => {
    try {
      const res = await fetch(`/api/users/${address}`);
      if (!res.ok) throw new Error('Failed to fetch user profile');
      const data = await res.json();
      set({
        userProfile: data.user,
        transactions: data.transactions
      });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchTokenStats: async () => {
    try {
      const res = await fetch('/api/token/stats');
      if (!res.ok) throw new Error('Failed to fetch token stats');
      const data = await res.json();
      set({ tokenStats: data });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchActivePresaleRound: async () => {
    try {
      const res = await fetch('/api/presale/active');
      if (!res.ok) throw new Error('Failed to fetch active presale round');
      const data = await res.json();
      set({ activePresaleRound: data });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchStakingPlans: async () => {
    try {
      const res = await fetch('/api/staking/plans');
      if (!res.ok) throw new Error('Failed to fetch staking plans');
      const data = await res.json();
      set({ stakingPlans: data });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchBlogPosts: async () => {
    try {
      const res = await fetch('/api/blog/posts');
      if (!res.ok) throw new Error('Failed to fetch blog posts');
      const data = await res.json();
      set({ blogPosts: data });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchFaqsAndCms: async () => {
    try {
      // We can grab FAQs and CMS via standard endpoints or admin endpoints. 
      // Let's call /api/admin/users (which returns both faq and cms in schema as fallback, or write a public endpoint. 
      // Wait, we can fetch it from `/api/admin/users` or just query a generic endpoint. Since admin/users is authenticated mock-only, let's fetch from it! Or read it from public API.)
      // Let's query /api/admin/users because we simulated it as simple route handlers!
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch CMS content');
      const data = await res.json();
      set({
        faqItems: data.faqItems || data.faq || [],
        cmsConfig: data.cmsConfig || data.cms || null
      });
    } catch (err: any) {
      console.error('FAQ/CMS fetch failed, fallback mock data used', err);
    }
  },

  purchaseVision: async (amount: string, currency: string, referralCode: string) => {
    const { walletAddress } = get();
    if (!walletAddress) return null;
    
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/presale/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, amount, currency, referralCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to purchase tokens');
      
      // Refresh profile (which triggers confirm checks)
      await get().fetchUserProfile(walletAddress);
      await get().fetchActivePresaleRound();
      await get().fetchTokenStats();
      
      return data;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  stakeTokens: async (planId: string, amount: string) => {
    const { walletAddress } = get();
    if (!walletAddress) return null;
    
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/staking/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, planId, amount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to stake tokens');
      
      await get().fetchUserProfile(walletAddress);
      await get().fetchTokenStats();
      
      return data;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  claimRewards: async (transactionId: string) => {
    const { walletAddress } = get();
    if (!walletAddress) return null;
    
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/staking/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, transactionId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to claim rewards');
      
      await get().fetchUserProfile(walletAddress);
      return data;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  unstakeTokens: async (transactionId: string) => {
    const { walletAddress } = get();
    if (!walletAddress) return null;
    
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/staking/unstake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, transactionId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to unstake');
      
      await get().fetchUserProfile(walletAddress);
      return data;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  submitKyc: async (fullName: string, email: string, documentType: string) => {
    const { walletAddress } = get();
    if (!walletAddress) return null;
    
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/users/${walletAddress}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, documentType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit KYC');
      
      await get().fetchUserProfile(walletAddress);
      return data;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Admin Actions
  fetchAdminData: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch admin dashboard metrics');
      const data = await res.json();
      set({ adminData: data });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  adminApproveKyc: async (userId: string, notes: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/kyc`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', notes })
      });
      if (!res.ok) throw new Error('Failed to approve KYC');
      await get().fetchAdminData();
      
      // If the currently connected user was edited, refresh their profile
      const { walletAddress } = get();
      if (walletAddress) await get().fetchUserProfile(walletAddress);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  adminRejectKyc: async (userId: string, notes: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/kyc`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', notes })
      });
      if (!res.ok) throw new Error('Failed to reject KYC');
      await get().fetchAdminData();
      
      const { walletAddress } = get();
      if (walletAddress) await get().fetchUserProfile(walletAddress);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  adminToggleSuspend: async (userId: string, suspended: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended })
      });
      if (!res.ok) throw new Error('Failed to toggle suspend status');
      await get().fetchAdminData();
      
      const { walletAddress } = get();
      if (walletAddress) await get().fetchUserProfile(walletAddress);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  adminUpsertPresaleRound: async (roundData: any) => {
    try {
      const res = await fetch('/api/admin/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roundData)
      });
      if (!res.ok) throw new Error('Failed to save presale round');
      await get().fetchAdminData();
      await get().fetchActivePresaleRound();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  adminUpsertStakingPlan: async (planData: any) => {
    try {
      const res = await fetch('/api/admin/staking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
      });
      if (!res.ok) throw new Error('Failed to save staking plan');
      await get().fetchAdminData();
      await get().fetchStakingPlans();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  adminSaveCms: async (cmsData: any, faqData: any) => {
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cms: cmsData, faq: faqData })
      });
      if (!res.ok) throw new Error('Failed to save CMS configurations');
      
      // Update local state directly
      const dbRes = await res.json();
      set({ faqItems: dbRes.faq || [], cmsConfig: dbRes.cms || null });
      await get().fetchAdminData();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  submitContactForm: async (name: string, email: string, message: string) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  submitNewsletter: async (email: string) => {
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}));
