import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

export type Opportunity = {
  id: string;
  slug: string;
  name: string;
  chain: string;
  kind: "airdrop" | "testnet" | "points";
  rewardStatus: "confirmed" | "potential" | "none";
  summary: string;
  capital: "none" | "gas_only" | "funds_at_risk";
  costNote: string;
  timeMinutes: number | null;
  deadline: string;
  officialUrl: string;
  riskNote: string;
  sponsored: boolean;
  verifiedOn: string;
};

type Row = {
  id: string;
  slug: string;
  name: string;
  chain: string;
  kind: Opportunity["kind"];
  reward_status: Opportunity["rewardStatus"];
  summary: string;
  capital: Opportunity["capital"];
  cost_note: string;
  time_minutes: unknown;
  deadline: unknown;
  official_url: string;
  risk_note: string;
  sponsored: unknown;
  verified_on: unknown;
};

function day(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return typeof value === "string" ? value.slice(0, 10) : "";
}

const KINDS = ["airdrop", "testnet", "points"];
const REWARDS = ["confirmed", "potential", "none"];
const CAPITALS = ["none", "gas_only", "funds_at_risk"];

export const getOpportunities = createServerFn({ method: "GET" })
  .validator((input: { kind?: string; rewardStatus?: string; capital?: string }) => ({
    kind: KINDS.includes(String(input?.kind ?? "")) ? String(input.kind) : "",
    rewardStatus: REWARDS.includes(String(input?.rewardStatus ?? "")) ? String(input.rewardStatus) : "",
    capital: CAPITALS.includes(String(input?.capital ?? "")) ? String(input.capital) : "",
  }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    // Only published, verified in the last 14 days, and not past deadline.
    const rows = await sql<Row>`
      select id, slug, name, chain, kind, reward_status, summary, capital, cost_note,
             time_minutes, deadline, official_url, risk_note, sponsored, verified_on
      from opportunities
      where status = 'published'
        and verified_on >= current_date - 14
        and (deadline is null or deadline >= current_date)
        and (${data.kind} = '' or kind = ${data.kind})
        and (${data.rewardStatus} = '' or reward_status = ${data.rewardStatus})
        and (${data.capital} = '' or capital = ${data.capital})
      order by deadline asc nulls last, name asc
    `;
    const items: Opportunity[] = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      chain: r.chain,
      kind: r.kind,
      rewardStatus: r.reward_status,
      summary: r.summary,
      capital: r.capital,
      costNote: r.cost_note,
      timeMinutes: r.time_minutes == null ? null : Number(r.time_minutes),
      deadline: day(r.deadline),
      officialUrl: r.official_url,
      riskNote: r.risk_note,
      sponsored: r.sponsored === true || r.sponsored === "t",
      verifiedOn: day(r.verified_on),
    }));
    return { items, kind: data.kind, rewardStatus: data.rewardStatus, capital: data.capital };
  });
