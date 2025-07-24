// src/modules/vip/vip.config.ts
export interface LevelBenefit {
  id: string;
  name: string;
  description: string;
  type: "monetary" | "item" | "perk";
  value?: number | string;
  currencyId?: string;
}

export interface CycleRewardConfig {
  type: "daily" | "weekly" | "monthly";
  rewardName: string;
  description: string;
  amount?: number;
  currencyId?: string;
  items?: { itemId: string; quantity: number }[];
}

export interface SignInReward {
  day: number;
  description: string;
  amount?: number;
  currencyId?: string;
  xp?: number;
}

export interface LevelConfig {
  level: number;
  name: string;
  xpRequired: number;
  xpMultiplier: number;
  cumulativeXpToReach: number;
  cashbackPercentage: number;
  prioritySupport: boolean;
  initialSpecialBonuses?: number;
  benefits: LevelBenefit[];
  dailyBonusMultiplier: number;
  levelUpRewards?: Array<{
    id: string;
    type: string;
    description: string;
    amount?: number;
    currencyId?: string;
    metaData?: Record<string, any>;
  }>;
  dailyCycleReward?: CycleRewardConfig;
  weeklyCycleReward?: CycleRewardConfig;
  monthlyCycleReward?: CycleRewardConfig;
}

export const VIP_LEVEL_CONFIGS: Readonly<LevelConfig[]> = Object.freeze([
  {
    level: 1,
    name: "Bronze",
    xpRequired: 100,
    xpMultiplier: 1,
    cumulativeXpToReach: 0,
    cashbackPercentage: 0.01,
    prioritySupport: false,
    benefits: [],
    dailyBonusMultiplier: 1.0,
    levelUpRewards: [{
      id: "bronze-welcome-bonus",
      type: "monetary",
      description: "Welcome Bonus!",
      amount: 10,
      currencyId: "USD_FUN",
    }],
    dailyCycleReward: {
      type: "daily",
      rewardName: "Daily Login Spark",
      description: "A small daily spark.",
      amount: 1,
      currencyId: "USD_FUN",
    },
  },
  {
    level: 2,
    name: "Silver",
    xpRequired: 200,
    xpMultiplier: 1.1,
    cumulativeXpToReach: 100,
    cashbackPercentage: 0.02,
    prioritySupport: true,
    benefits: [],
    dailyBonusMultiplier: 1.1,
    levelUpRewards: [{
      id: "silver-tier-bonus",
      type: "monetary",
      description: "Silver Tier Bonus!",
      amount: 50,
      currencyId: "USD_FUN",
    }],
    dailyCycleReward: {
      type: "daily",
      rewardName: "Daily Silver Bonus",
      description: "A better daily bonus.",
      amount: 5,
      currencyId: "USD_FUN",
    },
    weeklyCycleReward: {
      type: "weekly",
      rewardName: "Weekly Silver Chest",
      description: "A chest of goodies.",
      items: [{ itemId: "silver_key", quantity: 1 }],
    },
  },
  // ... more levels can be added here
]);

export const DAILY_SIGN_IN_REWARDS: Readonly<SignInReward[]> = Object.freeze([
  { day: 1, description: "Day 1: Welcome Sparkles!", xp: 10, amount: 1, currencyId: "USD_FUN" },
  { day: 2, description: "Day 2: Double Sparkles!", xp: 20, amount: 2, currencyId: "USD_FUN" },
  { day: 3, description: "Day 3: Minor Boost!", xp: 30, amount: 5, currencyId: "USD_FUN" },
  { day: 4, description: "Day 4: Steady On!", xp: 20, amount: 2, currencyId: "USD_FUN" },
  { day: 5, description: "Day 5: Mid-week Perk!", xp: 50, amount: 10, currencyId: "USD_FUN" },
  { day: 6, description: "Day 6: Almost there!", xp: 20, amount: 2, currencyId: "USD_FUN" },
  { day: 7, description: "Day 7: Weekly Jackpot!", xp: 100, amount: 25, currencyId: "USD_FUN" },
]);

// ... (all the interface definitions and VIP_LEVEL_CONFIGS array remain the same)

export function getVipLevelConfiguration(level: number): Readonly<LevelConfig> | undefined {
  return VIP_LEVEL_CONFIGS.find(l => l.level === level);
}

// This function was missing and has been restored
export function getAllVipLevelConfigurations(): Readonly<LevelConfig[]> {
  return VIP_LEVEL_CONFIGS;
}

export function getVipLevelByTotalXp(totalXp: number): Readonly<LevelConfig> {
  for (let i = VIP_LEVEL_CONFIGS.length - 1; i >= 0; i--) {
    const config = VIP_LEVEL_CONFIGS[i];
    if (config && totalXp >= config.cumulativeXpToReach) {
      return config;
    }
  }
  return VIP_LEVEL_CONFIGS[0]!;
}
