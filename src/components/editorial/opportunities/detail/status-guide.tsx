import { projectStatus, type Campaign } from "@/lib/editorial/opportunity-types";
import { STATUS_HELP, STATUS_TAG } from "../labels";

const FLOW = [
  "potential",
  "confirmed",
  "snapshot",
  "verification",
  "rewards_available",
  "distributed",
] as const;

type Key = keyof typeof STATUS_TAG;

export function StatusGuide(p: { campaigns: Campaign[]; fallback: Key }) {
  const now: Key = p.campaigns.length ? projectStatus(p.campaigns) : p.fallback;
  const at = FLOW.indexOf(now as (typeof FLOW)[number]);
  return (
    <section className="mt-6 border border-line bg-card p-4 font-sans">
      <h2 className="text-xs font-bold tracking-widest text-muted uppercase">
        Where this project is
      </h2>
      <p className="mt-2 text-lg font-semibold">{STATUS_TAG[now]}</p>
      <p className="text-sm text-muted">{STATUS_HELP[now]}</p>
      <ol className="mt-4 grid grid-cols-6 gap-1" aria-label="Status steps">
        {FLOW.map((k, i) => {
          const done = at >= 0 && i <= at;
          const cls = "h-1.5 " + (done ? "bg-accent" : "bg-line");
          return <li key={k} className={cls} title={STATUS_TAG[k]} />;
        })}
      </ol>
      <details className="mt-3 text-sm">
        <summary className="min-h-11 cursor-pointer py-2 font-semibold">
          What each status means
        </summary>
        <dl>
          {FLOW.map((k) => (
            <div key={k} className="mt-2">
              <dt className="font-semibold">{STATUS_TAG[k]}</dt>
              <dd className="text-muted">{STATUS_HELP[k]}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}
