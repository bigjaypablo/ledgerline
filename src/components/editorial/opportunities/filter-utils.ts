export type Current = { kind: string; rewardStatus: string; capital: string };
export type SearchOut = { kind?: string; rewardStatus?: string; capital?: string };

export const KIND_OPTIONS = [
  ["testnet", "Testnets"],
  ["mainnet", "Mainnet"],
  ["community", "Community"],
] as const;
export const REWARD_OPTIONS = [
  ["confirmed", "Confirmed"],
  ["potential", "Potential"],
] as const;
export const CAPITAL_OPTIONS = [
  ["none", "No capital"],
  ["gas_only", "Gas only"],
  ["funds_at_risk", "Funds at risk"],
] as const;

export function buildSearch(current: Current, patch: Partial<Current>): SearchOut {
  const next = { ...current, ...patch };
  const out: SearchOut = {};
  if (next.kind) out.kind = next.kind;
  if (next.rewardStatus) out.rewardStatus = next.rewardStatus;
  if (next.capital) out.capital = next.capital;
  return out;
}

export function labelFor(field: keyof Current, value: string): string {
  const list = field === "kind" ? KIND_OPTIONS : field === "rewardStatus" ? REWARD_OPTIONS : CAPITAL_OPTIONS;
  return list.find(([v]) => v === value)?.[1] ?? value;
}
