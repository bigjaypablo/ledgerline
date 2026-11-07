import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import type { Opportunity } from "@/lib/editorial/opportunities";
import {
  campaignState,
  normalizeCampaigns,
  normalizeLinks,
  normalizeTeam,
  type Campaign,
  type LinkItem,
  type Member,
} from "@/lib/editorial/opportunity-types";

export type { Campaign, LinkItem, Member };

export type OpportunityDetail = Opportunity & {
  about: string;
  whyNote: string;
  backers: string;
  raised: string;
  raisedSource: string;
  raisedOn: string;
  category: string;
  tags: string[];
  team: Member[];
  links: LinkItem[];
  stale: boolean;
  ended: boolean;
};

type Row = Record<string, unknown>;

const text = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const flag = (v: unknown) => v === true || v === "t" || v === "true";
const day = (v: unknown) =>
  v instanceof Date ? v.toISOString().slice(0, 10) : typeof v === "string" ? v.slice(0, 10) : "";

export const getOpportunity = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => ({ slug: String(input?.slug ?? "").slice(0, 160) }))
  .handler(async ({ data }): Promise<OpportunityDetail | null> => {
    const sql = await getSql();
    const rows = await sql<Row>`
      select id, slug, name, logo_url, chain, reward_status, summary, capital, time_minutes, deadline,
             official_url, risk_note, sponsored, verified_on, about, why_note, backers, raised,
             team, links, campaigns, category, tags, raised_source, raised_on,
             (verified_on is null or verified_on < current_date - 14) as stale
      from opportunities
      where slug = ${data.slug} and status = 'published'
    `;
    const r = rows[0];
    if (!r) return null;
    const campaigns = normalizeCampaigns(r.campaigns);
    return {
      id: String(r.id),
      slug: String(r.slug),
      name: String(r.name),
      logoUrl: text(r.logo_url, 500),
      chain: text(r.chain, 120),
      rewardStatus: r.reward_status as Opportunity["rewardStatus"],
      summary: text(r.summary, 400),
      capital: r.capital as Opportunity["capital"],
      timeMinutes: r.time_minutes == null ? null : Number(r.time_minutes),
      deadline: day(r.deadline),
      officialUrl: text(r.official_url, 500),
      riskNote: text(r.risk_note, 400),
      sponsored: flag(r.sponsored),
      verifiedOn: day(r.verified_on),
      campaigns,
      about: text(r.about, 2000),
      whyNote: text(r.why_note, 1500),
      backers: text(r.backers, 300),
      raised: text(r.raised, 60),
      raisedSource: text(r.raised_source, 500),
      raisedOn: day(r.raised_on),
      category: text(r.category, 40),
      tags: Array.isArray(r.tags) ? r.tags.map(String) : [],
      team: normalizeTeam(r.team),
      links: normalizeLinks(r.links),
      stale: flag(r.stale),
      ended: campaigns.length > 0 && campaigns.every((c) => campaignState(c) === "closed"),
    };
  });
