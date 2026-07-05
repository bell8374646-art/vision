export type TokenStats = {
  priceUsd: number;
  marketCapUsd: number;
  circulatingSupply: number;
  totalSupply: number;
  burnedSupply: number;
  holders: number;
  stakingApy: number; // e.g. 0.12 = 12%
  updatedAt: string; // ISO timestamp
};

export type PresaleRound = {
  id: string;
  name: string; // "Round 1"
  priceUsd: number;
  hardCapUsd: number;
  softCapUsd: number;
  raisedUsd: number;
  status: "upcoming" | "active" | "closed";
  startsAt: string;
  endsAt: string;
};

export type StakingPlan = {
  id: string;
  name: string;
  lockDays: number;
  apy: number;
  minStakeVision: number;
};

export type User = {
  id: string;
  walletAddress: string;
  email?: string;
  kycStatus: "not_started" | "pending" | "approved" | "rejected";
  visionBalance: number;
  totalPurchasedUsd: number;
  referralCode: string;
  referredBy?: string | null;
  createdAt: string;
  suspended?: boolean;
  kycNotes?: string;
};

export type Transaction = {
  id: string;
  userId: string;
  type: "purchase" | "stake" | "unstake" | "claim_reward" | "referral_payout";
  amountVision: number;
  amountUsd?: number;
  status: "pending" | "completed" | "failed";
  txHashMock: string; // e.g. "0xMOCK..."
  createdAt: string;
  stakingPlanId?: string;
  stakingLockDays?: number;
  stakingApy?: number;
  stakingClaimedRewards?: number;
  unstaked?: boolean;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string; // markdown
  category: string;
  author: string;
  publishedAt: string;
};

export type FAQItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

export type CMSConfig = {
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  aboutMission: string;
};

export type DatabaseSchema = {
  tokenStats: TokenStats;
  presaleRounds: PresaleRound[];
  stakingPlans: StakingPlan[];
  users: User[];
  transactions: Transaction[];
  blogPosts: BlogPost[];
  faq: FAQItem[];
  cms: CMSConfig;
  newsletter: string[];
  contact: { id: string; name: string; email: string; message: string; createdAt: string }[];
};
