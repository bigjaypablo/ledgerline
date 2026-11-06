export const CAPITAL_LABEL = {
  none: "No capital needed",
  gas_only: "Gas fees only",
  funds_at_risk: "Funds at risk",
} as const;

export const REWARD_LABEL = {
  none: "No reward announced",
  potential: "Reward potential only",
  confirmed: "Reward confirmed",
  snapshot: "Snapshot",
  verification: "Verification",
  rewards_available: "Rewards available",
  distributed: "Distributed",
} as const;

export const ACTIVITY_LABEL = { testnet: "Testnet", mainnet: "Mainnet", community: "Community" } as const;
export const REWARD_TYPE_LABEL = { points: "Points", token: "Token", whitelist: "Whitelist", none: "No reward" } as const;
export const STATE_LABEL = { open: "Open", upcoming: "Upcoming", paused: "Paused", closed: "Closed" } as const;

export const STATUS_TAG = {
  none: "No reward",
  potential: "Potential",
  confirmed: "Confirmed",
  snapshot: "Snapshot",
  verification: "Verification",
  rewards_available: "Rewards available",
  distributed: "Distributed",
} as const;

export const STATUS_HELP = {
  none: "The project has not announced any reward.",
  potential: "No reward is confirmed. Activity may be rewarded later.",
  confirmed: "The project has officially announced a reward or token.",
  snapshot: "Eligibility is being recorded, or was recorded already.",
  verification: "The project is checking eligibility (identity, bots).",
  rewards_available: "Claims are open. Check the official page.",
  distributed: "Rewards were sent, or the claim period has ended.",
} as const;

export const TASK_LABEL = {
  social: "Social tasks",
  form: "Fill a form",
  testnet: "Testnet",
  mainnet: "Mainnet",
  trading: "Trading",
  liquidity: "Liquidity",
  nft: "Mint NFT",
  ambassador: "Ambassador program",
  hold: "Hold",
  node: "Node",
  staking: "Staking",
  bridge: "Bridge",
  quests: "Quests",
  referral: "Referral",
} as const;
