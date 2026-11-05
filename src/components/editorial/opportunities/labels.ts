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

export const KIND_LABEL = { testnet: "Testnet", points: "Points", airdrop: "Token reward" } as const;

export const KIND_FILTERS = [
  { kind: "", label: "All" },
  { kind: "testnet", label: "Testnets" },
  { kind: "points", label: "Points" },
  { kind: "airdrop", label: "Airdrops" },
] as const;
