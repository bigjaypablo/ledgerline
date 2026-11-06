export const ACTIVITIES = ["testnet", "mainnet", "community"] as const;
export const REWARD_TYPES = ["points", "token", "whitelist", "none"] as const;
export const REWARD_STATUSES = [
  "none",
  "potential",
  "confirmed",
  "snapshot",
  "verification",
  "rewards_available",
  "distributed",
] as const;
export const TASK_TYPES = [
  "social",
  "form",
  "testnet",
  "mainnet",
  "trading",
  "liquidity",
  "nft",
  "ambassador",
  "hold",
  "node",
  "staking",
  "bridge",
  "quests",
  "referral",
] as const;
export type TaskType = (typeof TASK_TYPES)[number];
export const CAPITALS = ["none", "gas_only", "funds_at_risk"] as const;
export const CAMPAIGN_STATUSES = ["open", "paused", "closed"] as const;

export type Step = { text: string; url: string };
export type Campaign = {
  id: string;
  title: string;
  explanation: string;
  activity: (typeof ACTIVITIES)[number];
  tasks: TaskType[];
  rewardType: (typeof REWARD_TYPES)[number];
  rewardStatus: (typeof REWARD_STATUSES)[number];
  capital: (typeof CAPITALS)[number];
  costNote: string;
  timeMinutes: string;
  startsOn: string;
  deadlineLocal: string; // YYYY-MM-DDTHH:mm in the campaign's own timezone
  tzOffset: string; // e.g. +01:00
  status: (typeof CAMPAIGN_STATUSES)[number];
  startUrl: string;
  steps: Step[];
};
export type Member = { name: string; role: string; xUrl: string };
export type LinkItem = { label: string; url: string };

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const https = (v: unknown) => {
  const s = str(v, 500);
  return s.startsWith("https://") ? s : "";
};
const pick = <T extends string>(v: unknown, list: readonly T[], fallback: T): T =>
  list.includes(v as T) ? (v as T) : fallback;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const OFFSET = /^[+-]\d{2}:\d{2}$/;

function rows(v: unknown): Record<string, unknown>[] {
  let value = v;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? (value.filter((x) => x && typeof x === "object") as Record<string, unknown>[]) : [];
}

export function normalizeCampaigns(v: unknown): Campaign[] {
  return rows(v)
    .slice(0, 12)
    .map((c, i): Campaign => {
      const minutes = Math.round(Number(c.timeMinutes));
      const starts = str(c.startsOn, 10);
      const local = str(c.deadlineLocal, 16);
      const offset = str(c.tzOffset, 6);
      return {
        id: str(c.id, 40) || `c${i + 1}`,
        title: str(c.title, 120),
        explanation: str(c.explanation, 1500),
        activity: pick(c.activity, ACTIVITIES, "mainnet"),
        tasks: cleanTasks(c.tasks, c.activity),
        rewardType: pick(c.rewardType, REWARD_TYPES, "points"),
        rewardStatus: pick(c.rewardStatus, REWARD_STATUSES, "potential"),
        capital: pick(c.capital, CAPITALS, "gas_only"),
        costNote: str(c.costNote, 120),
        timeMinutes: Number.isFinite(minutes) && minutes > 0 && minutes <= 10000 ? String(minutes) : "",
        startsOn: DATE.test(starts) ? starts : "",
        deadlineLocal: LOCAL.test(local) ? local : "",
        tzOffset: OFFSET.test(offset) ? offset : "+00:00",
        status: pick(c.status, CAMPAIGN_STATUSES, "open"),
        startUrl: https(c.startUrl),
        steps: rows(c.steps)
          .slice(0, 15)
          .map((s) => ({ text: str(s.text, 500), url: https(s.url) }))
          .filter((s) => s.text),
      };
    })
    .filter((c) => c.title);
}

export function normalizeTeam(v: unknown): Member[] {
  return rows(v)
    .slice(0, 8)
    .map((m) => ({ name: str(m.name, 80), role: str(m.role, 80), xUrl: https(m.xUrl) }))
    .filter((m) => m.name);
}

export function normalizeLinks(v: unknown): LinkItem[] {
  return rows(v)
    .slice(0, 8)
    .map((l) => ({ label: str(l.label, 40), url: https(l.url) }))
    .filter((l) => l.label && l.url);
}

export function deadlineDate(c: Campaign): Date | null {
  if (!c.deadlineLocal) return null;
  const d = new Date(`${c.deadlineLocal}:00${c.tzOffset}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function campaignState(c: Campaign, now = new Date()): "open" | "upcoming" | "paused" | "closed" {
  if (c.status === "closed") return "closed";
  const end = deadlineDate(c);
  if (end && end < now) return "closed";
  if (c.status === "paused") return "paused";
  if (c.startsOn && new Date(`${c.startsOn}T00:00:00Z`) > now) return "upcoming";
  return "open";
}

export function deadlineLabel(c: Campaign): string {
  const end = deadlineDate(c);
  if (!end) return "No deadline announced";
  const [date, time] = c.deadlineLocal.split("T");
  const utc = end.toISOString().slice(0, 16).replace("T", " ");
  return c.tzOffset === "+00:00" ? `${date} ${time} UTC` : `${date} ${time} (UTC${c.tzOffset}) = ${utc} UTC`;
}

export function nextDeadline(campaigns: Campaign[]): string {
  const now = new Date();
  const ends = campaigns
    .filter((c) => campaignState(c, now) !== "closed")
    .map(deadlineDate)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());
  return ends[0] ? ends[0].toISOString().slice(0, 10) : "";
}

function cleanTasks(v: unknown, activity: unknown): TaskType[] {
  const list = Array.isArray(v) ? v : [];
  const out: TaskType[] = [];
  for (const t of list) {
    const ok = TASK_TYPES.includes(t as TaskType);
    if (ok && !out.includes(t as TaskType)) out.push(t as TaskType);
  }
  if (out.length === 0) {
    if (activity === "testnet") out.push("testnet");
    if (activity === "mainnet") out.push("mainnet");
  }
  return out.slice(0, 8);
}

type RewardStatus = (typeof REWARD_STATUSES)[number];

export function projectStatus(campaigns: Campaign[]): RewardStatus {
  const rank = (c: Campaign) => REWARD_STATUSES.indexOf(c.rewardStatus);
  const best = (list: Campaign[]) =>
    list.reduce((m, c) => Math.max(m, rank(c)), 0);
  const live = campaigns.filter((c) => campaignState(c) !== "closed");
  const pool = live.length > 0 ? live : campaigns;
  return REWARD_STATUSES[best(pool)];
}

export function projectTasks(campaigns: Campaign[]): TaskType[] {
  const out: TaskType[] = [];
  for (const c of campaigns) {
    for (const t of c.tasks) if (!out.includes(t)) out.push(t);
  }
  return out;
}
