import type { Campaign } from "@/lib/editorial/opportunity-types";
import { Field, SelectField } from "./field";
import { StepsEditor } from "./steps-editor";
import { TextArea } from "./text-area";

const ACTIVITY = [["testnet", "Testnet"], ["mainnet", "Mainnet"], ["community", "Community (Discord, roles, forms)"]] as const;
const REWARD_TYPE = [["points", "Points"], ["token", "Token"], ["whitelist", "Whitelist"], ["none", "No reward"]] as const;
const REWARD_STATUS = [["potential", "Potential"], ["confirmed", "Confirmed"], ["none", "None announced"]] as const;
const CAPITAL = [["none", "No capital needed"], ["gas_only", "Gas fees only"], ["funds_at_risk", "Funds at risk"]] as const;
const STATE = [["open", "Open"], ["paused", "Paused"], ["closed", "Closed"]] as const;
const TZ = [
  ["+00:00", "UTC"],
  ["+01:00", "UTC+1 (Lagos, Paris)"],
  ["+02:00", "UTC+2"],
  ["+03:00", "UTC+3"],
  ["+04:00", "UTC+4"],
  ["+05:30", "UTC+5:30 (India)"],
  ["+08:00", "UTC+8 (Singapore)"],
  ["+09:00", "UTC+9 (Tokyo)"],
  ["-04:00", "UTC−4 (New York, summer)"],
  ["-05:00", "UTC−5 (New York, winter)"],
  ["-07:00", "UTC−7 (Los Angeles, summer)"],
  ["-08:00", "UTC−8 (Los Angeles, winter)"],
] as const;

const blank = (): Campaign => ({
  id: Math.random().toString(36).slice(2, 10),
  title: "",
  explanation: "",
  activity: "mainnet",
  rewardType: "points",
  rewardStatus: "potential",
  capital: "gas_only",
  costNote: "",
  timeMinutes: "",
  startsOn: "",
  deadlineLocal: "",
  tzOffset: "+00:00",
  status: "open",
  startUrl: "",
  steps: [],
});

export function CampaignEditor({ campaigns, onChange }: { campaigns: Campaign[]; onChange: (next: Campaign[]) => void }) {
  const set = (i: number, patch: Partial<Campaign>) => onChange(campaigns.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const pick = (i: number, key: keyof Campaign) => (v: string) => set(i, { [key]: v } as Partial<Campaign>);

  return (
    <section className="md:col-span-2">
      <h2 className="font-serif text-2xl font-semibold">Campaigns</h2>
      <p className="mt-1 text-sm text-muted">
        One block per campaign (for example swaps and liquidity, or Discord roles). Campaigns without a title are skipped on save.
      </p>
      <div className="mt-3 space-y-3">
        {campaigns.map((c, i) => (
          <details key={c.id} open={!c.title} className="border border-ink bg-card p-3">
            <summary className="min-h-11 cursor-pointer py-2 font-semibold">{c.title || "New campaign"}</summary>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Field label="Campaign title" value={c.title} onChange={pick(i, "title")} />
              <SelectField label="Activity" value={c.activity} onChange={pick(i, "activity")} options={ACTIVITY} />
              <SelectField label="Reward type" value={c.rewardType} onChange={pick(i, "rewardType")} options={REWARD_TYPE} />
              <SelectField label="Reward status" value={c.rewardStatus} onChange={pick(i, "rewardStatus")} options={REWARD_STATUS} />
              <SelectField label="Capital needed" value={c.capital} onChange={pick(i, "capital")} options={CAPITAL} />
              <Field label="Cost note (e.g. from about $5)" value={c.costNote} onChange={pick(i, "costNote")} />
              <Field label="Time needed (minutes)" value={c.timeMinutes} onChange={pick(i, "timeMinutes")} type="number" />
              <SelectField label="Status" value={c.status} onChange={pick(i, "status")} options={STATE} />
              <Field label="Starts on" value={c.startsOn} onChange={pick(i, "startsOn")} type="date" />
              <Field label="Deadline (date and time)" value={c.deadlineLocal} onChange={pick(i, "deadlineLocal")} type="datetime-local" />
              <SelectField label="Deadline timezone" value={c.tzOffset} onChange={pick(i, "tzOffset")} options={TZ} />
              <Field label="Start activity link (https://)" value={c.startUrl} onChange={pick(i, "startUrl")} />
              <div className="md:col-span-2">
                <TextArea label="Explain this campaign" value={c.explanation} onChange={pick(i, "explanation")} rows={4} hint="Plain words: what it is and how it may lead to a reward. Blank line = new paragraph." />
              </div>
              <StepsEditor steps={c.steps} onChange={(steps) => set(i, { steps })} />
              <button type="button" onClick={() => onChange(campaigns.filter((_, j) => j !== i))} className="min-h-11 border border-accent px-4 text-sm font-semibold text-accent md:col-span-2">
                Remove this campaign
              </button>
            </div>
          </details>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...campaigns, blank()])} className="mt-3 min-h-11 border border-ink px-4 text-sm font-semibold">
        + Add campaign
      </button>
    </section>
  );
}
