export const CAPITAL_LABEL = {
  none: "No capital needed",
  gas_only: "Gas fees only",
  funds_at_risk: "Funds at risk",
} as const;

export const REWARD_LABEL = {
  confirmed: "Reward confirmed",
  potential: "Reward potential only",
  none: "No reward announced",
} as const;

export const ACTIVITY_LABEL = { testnet: "Testnet", mainnet: "Mainnet", community: "Community" } as const;
export const REWARD_TYPE_LABEL = { points: "Points", token: "Token", whitelist: "Whitelist", none: "No reward" } as const;
export const STATE_LABEL = { open: "Open", upcoming: "Upcoming", paused: "Paused", closed: "Closed" } as const;
