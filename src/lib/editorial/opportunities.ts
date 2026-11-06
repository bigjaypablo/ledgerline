import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { ACTIVITIES, CAPITALS, REWARD_STATUSES, normalizeCampaigns, projectStatus, type Campaign } from "@/lib/editorial/opportunity-types";

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

export type ListItem = Opportunity & {
  category: string;
  tags: string[];
  raised: string;
  projectStatus: (typeof REWARD_STATUSES)[number];
  createdOn: string;
  statusChangedOn: string;
};

type Extra = {
  category: string;
  tags: unknown;
  raised: string;
  created_at: unknown;
  status_changed_on: unknown;
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
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<Row & Extra>`
      select id, slug, name, logo_url, chain, reward_status, summary,
             capital, time_minutes, deadline, official_url, risk_note,
             sponsored, verified_on, campaigns, category, tags, raised,
             created_at, status_changed_on
      from opportunities
      where status = 'published'
        and verified_on >= current_date - 14
        and (
          deadline is null or deadline >= current_date
          or (project_status = 'distributed'
              and status_changed_on > now() - interval '30 days')
        )
        and not (
          jsonb_array_length(campaigns) > 0
          and not exists (
            select 1 from jsonb_array_elements(campaigns) k
            where k->>'status' <> 'closed')
          and not (project_status = 'distributed'
              and status_changed_on > now() - interval '30 days')
        )
      order by name asc
    `;
    const items: ListItem[] = rows.map((r) => {
      const campaigns = normalizeCampaigns(r.campaigns);
      return {
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
        campaigns,
        category: r.category ?? "",
        tags: Array.isArray(r.tags) ? r.tags.map(String) : [],
        raised: r.raised ?? "",
        projectStatus: projectStatus(campaigns),
        createdOn: day(r.created_at),
        statusChangedOn: day(r.status_changed_on),
      };
    });
    return { items, kind: "", rewardStatus: "", capital: "" };
  });
