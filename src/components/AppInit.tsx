'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function AppInit() {
  const fetchTokenStats = useStore((state) => state.fetchTokenStats);
  const fetchActivePresaleRound = useStore((state) => state.fetchActivePresaleRound);
  const fetchStakingPlans = useStore((state) => state.fetchStakingPlans);
  const fetchBlogPosts = useStore((state) => state.fetchBlogPosts);
  const fetchFaqsAndCms = useStore((state) => state.fetchFaqsAndCms);
  const walletAddress = useStore((state) => state.walletAddress);
  const fetchUserProfile = useStore((state) => state.fetchUserProfile);

  useEffect(() => {
    // Initial public data fetch
    fetchTokenStats();
    fetchActivePresaleRound();
    fetchStakingPlans();
    fetchBlogPosts();
    fetchFaqsAndCms();

    // Poll token stats every 10s to simulate live ticker changes
    const interval = setInterval(() => {
      fetchTokenStats();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchTokenStats, fetchActivePresaleRound, fetchStakingPlans, fetchBlogPosts, fetchFaqsAndCms]);

  // If user wallet is connected, refetch profile data to sync confirmation states
  useEffect(() => {
    if (walletAddress) {
      fetchUserProfile(walletAddress);
    }
  }, [walletAddress, fetchUserProfile]);

  return null;
}
