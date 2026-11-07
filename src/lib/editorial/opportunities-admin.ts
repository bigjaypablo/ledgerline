import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { slugify } from "@/lib/editorial/text";
import {
  deadlineDate,
  projectStatus,
  normalizeCampaigns,
  normalizeLinks,
  normalizeTeam,
  type Campaign,
  type LinkItem,
  type Member,
} from "@/lib/editorial/opportunity-types";

export type AdminOpportunity = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  chain: string;
  summary: string;
  about: string;
  whyNote: string;
  backers: string;
  raised: string;
  raisedSource: string;
  raisedOn: string;
  category: string;
  tags: string;
  featured: boolean;
  officialUrl: string;
  riskNote: string;
  sponsored: boolean;
  status: string;
  verifiedOn: string;
  team: Member[];
  links: LinkItem[];
  campaigns: Campaign[];
};

type Row = Record<string, unknown>;

const text = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const day = (v: unknown) =>
  v instanceof Date ? v.toISOString().slice(0, 10) : typeof v === "string" ? v.slice(0, 10) : "";

async function gate(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ role: string }>`select role from profiles where user_id = ${userId}`;
  const role = rows[0]?.role;
  if (role !== "admin" && role !== "editor") throw new Error("Staff only.");
  return sql;
}

function tagList(v: unknown): string[] {
  const raw = typeof v === "string" ? v.split(",") : Array.isArray(v) ? v : [];
  const out: string[] = [];
  for (const t of raw) {
    const s = String(t).trim().slice(0, 30);
    if (s && !out.includes(s)) out.push(s);
  }
  return out.slice(0, 10);
}

const STATUSES = ["draft", "published", "archived"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const RANK = { none: 0, gas_only: 1, funds_at_risk: 2 } as const;

// The project's headline fields are worked out from its campaigns, so they are never typed twice.
function headline(campaigns: Campaign[]) {
  const live = campaigns.filter((c) => c.status !== "closed");
  const pool = live.length ? live : campaigns;
  if (pool.length === 0) {
    return { kind: "testnet", rewardStatus: "potential", capital: "gas_only", minutes: null as number | null, deadline: null as string | null };
  }
  const top = projectStatus(campaigns);
  const rewardStatus = top === "none" || top === "potential" ? top : "confirmed";
  const capital = pool.reduce<Campaign["capital"]>((top, c) => (RANK[c.capital] > RANK[top] ? c.capital : top), "none");
  const total = pool.reduce((sum, c) => sum + (Number(c.timeMinutes) || 0), 0);
  const kind = pool.some((c) => c.rewardType === "token") ? "airdrop" : pool.some((c) => c.rewardType === "points") ? "points" : "testnet";
  const ends = pool.map(deadlineDate).filter((d): d is Date => d !== null);
  const deadline =
    ends.length === pool.length ? new Date(Math.max(...ends.map((d) => d.getTime()))).toISOString().slice(0, 10) : null;
  return { kind, rewardStatus, capital, minutes: total > 0 ? total : null, deadline };
}

export const listOpportunities = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AdminOpportunity[]> => {
    const sql = await gate(context.userId);
    const rows = await sql<Row>`
      select id, slug, name, logo_url, chain, summary, about, why_note, backers, raised, official_url,
             risk_note, sponsored, status, verified_on, team, links, campaigns,
             category, tags, raised_source, raised_on, featured
      from opportunities
      order by updated_at desc
    `;
    return rows.map((r) => ({
      id: String(r.id),
      slug: String(r.slug),
      name: String(r.name),
      logoUrl: text(r.logo_url, 500),
      chain: text(r.chain, 60),
      summary: text(r.summary, 400),
      about: text(r.about, 2000),
      whyNote: text(r.why_note, 1500),
      backers: text(r.backers, 300),
      raised: text(r.raised, 60),
      raisedSource: text(r.raised_source, 500),
      raisedOn: day(r.raised_on),
      category: text(r.category, 40),
      tags: tagList(r.tags).join(", "),
      featured: r.featured === true || r.featured === "t",
      officialUrl: text(r.official_url, 500),
      riskNote: text(r.risk_note, 400),
      sponsored: r.sponsored === true || r.sponsored === "t",
      status: String(r.status),
      verifiedOn: day(r.verified_on),
      team: normalizeTeam(r.team),
      links: normalizeLinks(r.links),
      campaigns: normalizeCampaigns(r.campaigns),
    }));
  });

export const saveOpportunity = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ context, data }) => {
    const sql = await gate(context.userId);
    const name = String(data.name ?? "").trim().slice(0, 120);
    if (!name) throw new Error("Name the project.");
    const status = String(data.status ?? "draft");
    if (!STATUSES.includes(status)) throw new Error("Unknown status.");
    const officialUrl = String(data.officialUrl ?? "").trim().slice(0, 500);
    if (!officialUrl.startsWith("https://")) throw new Error("The official URL must start with https://");
    const logoUrl = String(data.logoUrl ?? "").trim().slice(0, 500);
    if (logoUrl && !logoUrl.startsWith("https://")) throw new Error("The logo must be an uploaded image.");
    const verifiedOn = String(data.verifiedOn ?? "").trim();
    if (verifiedOn && !DATE.test(verifiedOn)) throw new Error("Verified date is not valid.");
    if (status === "published" && !verifiedOn) throw new Error("Set a verified date before publishing.");

    const campaigns = normalizeCampaigns(data.campaigns);
    const team = normalizeTeam(data.team);
    const links = normalizeLinks(data.links);
    const h = headline(campaigns);

    const id = String(data.id ?? "") || `opp_${crypto.randomUUID()}`;
    const slug = `${slugify(name) || "listing"}-${id.slice(-6)}`;
    const chain = String(data.chain ?? "").trim().slice(0, 60);
    const summary = String(data.summary ?? "").slice(0, 400);
    const about = String(data.about ?? "").slice(0, 2000);
    const whyNote = String(data.whyNote ?? "").slice(0, 1500);
    const backers = String(data.backers ?? "").slice(0, 300);
    const raised = String(data.raised ?? "").slice(0, 60);
    const riskNote = String(data.riskNote ?? "").slice(0, 400);
    const sponsored = Boolean(data.sponsored);
    const category = String(data.category ?? "").trim().slice(0, 40);
    const tags = tagList(data.tags);
    const raisedSource = String(data.raisedSource ?? "").trim().slice(0, 500);
    if (raisedSource && !raisedSource.startsWith("https://")) {
      throw new Error("The raise source must start with https://");
    }
    const raisedOn = String(data.raisedOn ?? "").trim();
    if (raisedOn && !DATE.test(raisedOn)) throw new Error("Raise date is not valid.");
    const pstatus = projectStatus(campaigns);

    await sql`
      insert into opportunities (
        id, slug, name, logo_url, chain, kind, reward_status, summary, capital, cost_note,
        time_minutes, deadline, official_url, risk_note, sponsored, status, verified_on,
        about, why_note, backers, raised, team, links, campaigns,
        category, tags, raised_source, raised_on, project_status, featured
      ) values (
        ${id}, ${slug}, ${name}, ${logoUrl}, ${chain}, ${h.kind}, ${h.rewardStatus}, ${summary}, ${h.capital}, '',
        ${h.minutes}, ${h.deadline}, ${officialUrl}, ${riskNote}, ${sponsored}, ${status}, ${verifiedOn || null},
        ${about}, ${whyNote}, ${backers}, ${raised},
        ${JSON.stringify(team)}::jsonb, ${JSON.stringify(links)}::jsonb, ${JSON.stringify(campaigns)}::jsonb,
        ${category}, ${JSON.stringify(tags)}::jsonb, ${raisedSource},
        ${raisedOn || null}, ${pstatus}, ${Boolean(data.featured)}
      )
      on conflict (id) do update set
        name = excluded.name,
        logo_url = excluded.logo_url,
        chain = excluded.chain,
        kind = excluded.kind,
        reward_status = excluded.reward_status,
        summary = excluded.summary,
        capital = excluded.capital,
        time_minutes = excluded.time_minutes,
        deadline = excluded.deadline,
        official_url = excluded.official_url,
        risk_note = excluded.risk_note,
        sponsored = excluded.sponsored,
        status = excluded.status,
        verified_on = excluded.verified_on,
        about = excluded.about,
        why_note = excluded.why_note,
        backers = excluded.backers,
        raised = excluded.raised,
        team = excluded.team,
        links = excluded.links,
        campaigns = excluded.campaigns,
        category = excluded.category,
        featured = excluded.featured,
        tags = excluded.tags,
        raised_source = excluded.raised_source,
        raised_on = excluded.raised_on,
        status_changed_on = case
          when opportunities.project_status is distinct from excluded.project_status
          then now() else opportunities.status_changed_on end,
        project_status = excluded.project_status,
        updated_at = now()
    `;
    return { id, campaigns: campaigns.length };
  });

export const markVerified = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => ({ id: String(input?.id ?? "") }))
  .handler(async ({ context, data }) => {
    const sql = await gate(context.userId);
    await sql`update opportunities set verified_on = current_date, updated_at = now() where id = ${data.id}`;
    return { ok: true };
  });
