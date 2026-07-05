import fs from 'fs/promises';
import path from 'path';
import { DatabaseSchema } from '@/types';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

export async function readDb(): Promise<DatabaseSchema> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data) as DatabaseSchema;
  } catch (error) {
    console.error('Error reading mock database:', error);
    // Return a default schema if file is missing (failsafe)
    return {
      tokenStats: {
        priceUsd: 0.085,
        marketCapUsd: 8500000,
        circulatingSupply: 100000000,
        totalSupply: 500000000,
        burnedSupply: 12500000,
        holders: 1420,
        stakingApy: 0.12,
        updatedAt: new Date().toISOString()
      },
      presaleRounds: [],
      stakingPlans: [],
      users: [],
      transactions: [],
      blogPosts: [],
      faq: [],
      cms: {
        homeHeroTitle: "Powering the Future Through Decentralized Vision",
        homeHeroSubtitle: "We are building the first trustless zk-rendering consensus protocol.",
        aboutMission: "Our mission is to democratize high-performance rendering."
      },
      newsletter: [],
      contact: []
    };
  }
}

export async function writeDb(data: DatabaseSchema): Promise<void> {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing mock database:', error);
  }
}
