import type { ListItem } from "@/lib/editorial/opportunities";
import { nextDeadline, projectTasks } from "@/lib/editorial/opportunity-types";

export type Filters = {
  tasks: string[];
  rewards: string[];
  statuses: string[];
  categories: string[];
  tags: string[];
  chains: string[];
  raise: string;
  isNew: boolean;
  updated: boolean;
};
export const EMPTY: Filters = {
  tasks: [],
  rewards: [],
  statuses: [],
  categories: [],
  tags: [],
  chains: [],
  raise: "",
  isNew: false,
  updated: false,
};
export type Sort = "updated" | "new" | "deadline" | "raise";

export const RAISE_OPTIONS = [
  ["u1", "Under $1M"],
  ["m1", "$1M to $10M"],
  ["m10", "$10M and up"],
] as const;

export const flip = (list: string[], v: string) =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

export function chainsOf(i: ListItem): string[] {
  return i.chain.split(",").map((c) => c.trim()).filter(Boolean);
}

export function endKey(i: ListItem): string {
  const raw = nextDeadline(i.campaigns) || i.deadline || "";
  return /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : "";
}

export function daysAgo(d: string): number {
  const t = Date.parse(d);
  return Number.isNaN(t) ? 9999 : (Date.now() - t) / 864e5;
}

export function parseRaise(s: string): number {
  const m = /(\d[\d.,]*)\s*([kmb])?/i.exec(s || "");
  if (!m) return 0;
  const n = parseFloat(m[1].replace(/,/g, ""));
  if (Number.isNaN(n)) return 0;
  const u = (m[2] || "").toLowerCase();
  const mult = u === "b" ? 1e9 : u === "m" ? 1e6 : u === "k" ? 1e3 : 1;
  return n * mult;
}

function band(i: ListItem): string {
  const n = parseRaise(i.raised);
  if (n <= 0) return "";
  return n < 1e6 ? "u1" : n < 1e7 ? "m1" : "m10";
}

const any = (want: string[], have: string[]) =>
  want.length === 0 || want.some((w) => have.includes(w));

export function matches(i: ListItem, f: Filters): boolean {
  if (!any(f.tasks, projectTasks(i.campaigns))) return false;
  if (!any(f.rewards, i.campaigns.map((c) => c.rewardType))) return false;
  if (!any(f.statuses, [i.projectStatus])) return false;
  if (!any(f.categories, [i.category])) return false;
  if (!any(f.tags, i.tags)) return false;
  if (!any(f.chains, chainsOf(i))) return false;
  if (f.raise && band(i) !== f.raise) return false;
  if (f.isNew && daysAgo(i.createdOn) > 7) return false;
  if (f.updated && daysAgo(i.statusChangedOn) > 7) return false;
  return true;
}

export function activeCount(f: Filters): number {
  const lists = [f.tasks, f.rewards, f.statuses, f.categories];
  const more = [f.tags, f.chains];
  let n = [...lists, ...more].reduce((s, l) => s + l.length, 0);
  if (f.raise) n += 1;
  if (f.isNew) n += 1;
  if (f.updated) n += 1;
  return n;
}

export function sortItems(list: ListItem[], sort: Sort): ListItem[] {
  const out = [...list];
  if (sort === "deadline") {
    out.sort((a, b) =>
      (endKey(a) || "9999").localeCompare(endKey(b) || "9999"));
  } else if (sort === "new") {
    out.sort((a, b) => b.createdOn.localeCompare(a.createdOn));
  } else if (sort === "raise") {
    out.sort((a, b) => parseRaise(b.raised) - parseRaise(a.raised));
  } else {
    out.sort((a, b) => b.statusChangedOn.localeCompare(a.statusChangedOn));
  }
  return out;
}
