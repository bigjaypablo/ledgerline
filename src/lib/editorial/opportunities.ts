import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { ACTIVITIES, CAPITALS, REWARD_STATUSES, normalizeCampaigns, type Campaign } from "@/lib/editorial/opportunity-types";

export type Opportunity = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  chain: string;
  rewardStatus: "confirmed" | "potential" | "none";
  summary: string;
  capital: "none" | "gas_only" | "funds_at_risk";
  timeMinutes: number | null;
  deadline: string;
  officialUrl: string;
  riskNote: string;
  sponsored: boolean;
  verifiedOn: string;
  campaigns: Campaign[];
};

type Row = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  chain: string;
  reward_status: Opportunity["rewardStatus"];
  summary: string;
  capital: Opportunity["capital"];
  time_minutes: unknown;
  deadline: unknown;
  official_url: string;
  risk_note: string;
  sponsored: unknown;
  verified_on: unknown;
  campaigns: unknown;
};

function day(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return typeof value === "string" ? value.slice(0, 10) : "";
}

const only = (list: readonly string[], v: unknown) => (list.includes(String(v ?? "")) ? String(v) : "");

export const getOpportunities = createServerFn({ method: "GET" })
  .validator((input: { kind?: string; rewardStatus?: string; capital?: string }) => ({
    kind: only(ACTIVITIES, input?.kind),
    rewardStatus: only(REWARD_STATUSES, input?.rewardStatus),
    capital: only(CAPITALS, input?.capital),
  }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<Row>`
      select id, slug, name, logo_url, chain, reward_status, summary, capital, time_minutes,
             deadline, official_url, risk_note, sponsored, verified_on, campaigns
      from opportunities
      where status = 'published'
        and verified_on >= current_date - 14
        and (deadline is null or deadline >= current_date)
        and not (
          jsonb_array_length(campaigns) > 0
          and not exists (select 1 from jsonb_array_elements(campaigns) k where k->>'status' <> 'closed')
        )
        and (${data.kind} = '' or exists (
          select 1 from jsonb_array_elements(campaigns) a where a->>'activity' = ${data.kind}
        ))
        and (${data.rewardStatus} = '' or reward_status = ${data.rewardStatus})
        and (${data.capital} = '' or capital = ${data.capital})
      order by deadline asc nulls last, name asc
    `;
    const items: Opportunity[] = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      logoUrl: r.logo_url ?? "",
      chain: r.chain,
      rewardStatus: r.reward_status,
      summary: r.summary,
      capital: r.capital,
      timeMinutes: r.time_minutes == null ? null : Number(r.time_minutes),
      deadline: day(r.deadline),
      officialUrl: r.official_url,
      riskNote: r.risk_note,
      sponsored: r.sponsored === true || r.sponsored === "t",
      verifiedOn: day(r.verified_on),
      campaigns: normalizeCampaigns(r.campaigns),
    }));
    return { items, kind: data.kind, rewardStatus: data.rewardStatus, capital: data.capital };
  });
