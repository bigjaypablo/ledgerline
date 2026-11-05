import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { slugify } from "@/lib/editorial/text";

export type AdminOpportunity = {
  id: string;
  slug: string;
  name: string;
  chain: string;
  kind: string;
  rewardStatus: string;
  summary: string;
  capital: string;
  costNote: string;
  timeMinutes: string;
  deadline: string;
  officialUrl: string;
  riskNote: string;
  sponsored: boolean;
  status: string;
  verifiedOn: string;
};

type Row = {
  id: string;
  slug: string;
  name: string;
  chain: string;
  kind: string;
  reward_status: string;
  summary: string;
  capital: string;
  cost_note: string;
  time_minutes: unknown;
  deadline: unknown;
  official_url: string;
  risk_note: string;
  sponsored: unknown;
  status: string;
  verified_on: unknown;
};

function day(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return typeof value === "string" ? value.slice(0, 10) : "";
}

async function gate(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ role: string }>`select role from profiles where user_id = ${userId}`;
  const role = rows[0]?.role;
  if (role !== "admin" && role !== "editor") throw new Error("Staff only.");
  return sql;
}

const KINDS = ["airdrop", "testnet", "points"];
const REWARDS = ["confirmed", "potential", "none"];
const CAPITALS = ["none", "gas_only", "funds_at_risk"];
const STATUSES = ["draft", "published", "archived"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const listOpportunities = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AdminOpportunity[]> => {
    const sql = await gate(context.userId);
    const rows = await sql<Row>`
      select id, slug, name, chain, kind, reward_status, summary, capital, cost_note,
             time_minutes, deadline, official_url, risk_note, sponsored, status, verified_on
      from opportunities
      order by updated_at desc
    `;
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      chain: r.chain,
      kind: r.kind,
      rewardStatus: r.reward_status,
      summary: r.summary,
      capital: r.capital,
      costNote: r.cost_note,
      timeMinutes: r.time_minutes == null ? "" : String(r.time_minutes),
      deadline: day(r.deadline),
      officialUrl: r.official_url,
      riskNote: r.risk_note,
      sponsored: r.sponsored === true || r.sponsored === "t",
      status: r.status,
      verifiedOn: day(r.verified_on),
    }));
  });

export const saveOpportunity = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ context, data }) => {
    const sql = await gate(context.userId);
    const name = String(data.name ?? "").trim().slice(0, 120);
    if (!name) throw new Error("Name the project.");
    const kind = String(data.kind ?? "");
    if (!KINDS.includes(kind)) throw new Error("Pick a type.");
    const rewardStatus = String(data.rewardStatus ?? "");
    if (!REWARDS.includes(rewardStatus)) throw new Error("Pick a reward status.");
    const capital = String(data.capital ?? "");
    if (!CAPITALS.includes(capital)) throw new Error("Pick a capital level.");
    const status = String(data.status ?? "draft");
    if (!STATUSES.includes(status)) throw new Error("Unknown status.");
    const officialUrl = String(data.officialUrl ?? "").trim().slice(0, 500);
    if (!officialUrl.startsWith("https://")) throw new Error("The official URL must start with https://");
    const verifiedOn = String(data.verifiedOn ?? "").trim();
    if (verifiedOn && !DATE.test(verifiedOn)) throw new Error("Verified date is not valid.");
    if (status === "published" && !verifiedOn) {
      throw new Error("Set a verified date before publishing.");
    }
    const deadline = String(data.deadline ?? "").trim();
    if (deadline && !DATE.test(deadline)) throw new Error("Deadline is not valid.");
    const minutesRaw = String(data.timeMinutes ?? "").trim();
    const minutes = minutesRaw ? Math.round(Number(minutesRaw)) : null;
    if (minutes !== null && (!Number.isFinite(minutes) || minutes < 0 || minutes > 10000)) {
      throw new Error("Time must be a number of minutes.");
    }
    const id = String(data.id ?? "") || `opp_${crypto.randomUUID()}`;
    const slug = `${slugify(name) || "listing"}-${id.slice(-6)}`;
    const chain = String(data.chain ?? "").trim().slice(0, 60);
    const summary = String(data.summary ?? "").slice(0, 400);
    const costNote = String(data.costNote ?? "").slice(0, 120);
    const riskNote = String(data.riskNote ?? "").slice(0, 400);
    const sponsored = Boolean(data.sponsored);
    await sql`
      insert into opportunities (
        id, slug, name, chain, kind, reward_status, summary, capital, cost_note,
        time_minutes, deadline, official_url, risk_note, sponsored, status, verified_on
      ) values (
        ${id}, ${slug}, ${name}, ${chain}, ${kind}, ${rewardStatus}, ${summary}, ${capital}, ${costNote},
        ${minutes}, ${deadline || null}, ${officialUrl}, ${riskNote}, ${sponsored}, ${status}, ${verifiedOn || null}
      )
      on conflict (id) do update set
        name = excluded.name,
        chain = excluded.chain,
        kind = excluded.kind,
        reward_status = excluded.reward_status,
        summary = excluded.summary,
        capital = excluded.capital,
        cost_note = excluded.cost_note,
        time_minutes = excluded.time_minutes,
        deadline = excluded.deadline,
        official_url = excluded.official_url,
        risk_note = excluded.risk_note,
        sponsored = excluded.sponsored,
        status = excluded.status,
        verified_on = excluded.verified_on,
        updated_at = now()
    `;
    return { id };
  });

export const markVerified = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => ({ id: String(input?.id ?? "") }))
  .handler(async ({ context, data }) => {
    const sql = await gate(context.userId);
    await sql`update opportunities set verified_on = current_date, updated_at = now() where id = ${data.id}`;
    return { ok: true };
  });
