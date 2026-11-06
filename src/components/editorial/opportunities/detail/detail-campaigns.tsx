import type { Campaign } from "@/lib/editorial/opportunity-types";
import { campaignState, deadlineLabel } from "@/lib/editorial/opportunity-types";
import { ACTIVITY_LABEL, CAPITAL_LABEL, REWARD_LABEL, REWARD_TYPE_LABEL, STATE_LABEL } from "../labels";
import { Paragraphs } from "./section";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted uppercase">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function CampaignCard({ c }: { c: Campaign }) {
  const state = campaignState(c);
  return (
    <details open={state === "open"} className="border border-line bg-card p-4">
      <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-xs font-bold tracking-widest text-accent uppercase">
            {ACTIVITY_LABEL[c.activity]} · {REWARD_TYPE_LABEL[c.rewardType]}
          </span>
          <span className="mt-1 block font-serif text-xl leading-tight font-semibold">{c.title}</span>
        </span>
        <span className={`shrink-0 text-xs font-bold tracking-widest uppercase ${state === "open" ? "text-accent" : "text-muted"}`}>
          {STATE_LABEL[state]}
        </span>
      </summary>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Fact label="Reward" value={REWARD_LABEL[c.rewardStatus]} />
        <Fact label="Capital" value={`${CAPITAL_LABEL[c.capital]}${c.costNote ? ` (${c.costNote})` : ""}`} />
        <Fact label="Time" value={c.timeMinutes ? `About ${c.timeMinutes} min` : "Not stated"} />
        <Fact label="Starts" value={c.startsOn || "Already live"} />
        <div className="col-span-2">
          <dt className="text-xs text-muted uppercase">Deadline</dt>
          <dd className="font-semibold">{deadlineLabel(c)}</dd>
        </div>
      </dl>
      {c.explanation ? (
        <div className="mt-4">
          <Paragraphs text={c.explanation} />
        </div>
      ) : null}
      {c.steps.length > 0 ? (
        <ol className="mt-4 space-y-2">
          {c.steps.map((s, i) => (
            <li key={i} className="text-base leading-7">
              <span className="font-semibold">{i + 1}.</span> {s.text}
              {s.url ? (
                <>
                  {" "}
                  <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-accent underline">
                    Open ↗
                  </a>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
      {c.startUrl && state !== "closed" ? (
        <a href={c.startUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-4 inline-flex min-h-11 items-center bg-ink px-4 text-sm font-semibold text-inverse-fg">
          Start activity ↗
        </a>
      ) : null}
    </details>
  );
}

export function DetailCampaigns({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div className="space-y-3">
      {campaigns.map((c) => (
        <CampaignCard key={c.id} c={c} />
      ))}
    </div>
  );
}
