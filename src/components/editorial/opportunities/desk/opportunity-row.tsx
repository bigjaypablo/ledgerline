import type { AdminOpportunity } from "@/lib/editorial/opportunities-admin";
import { OpportunityLogo } from "@/components/editorial/opportunities/logo";

function isStale(verifiedOn: string): boolean {
  if (!verifiedOn) return true;
  return Date.now() - new Date(verifiedOn).getTime() > 14 * 24 * 60 * 60 * 1000;
}

export function OpportunityRow({
  item,
  onEdit,
  onVerify,
}: {
  item: AdminOpportunity;
  onEdit: () => void;
  onVerify: () => void;
}) {
  const hidden = item.status === "published" && isStale(item.verifiedOn);
  const n = item.campaigns.length;
  return (
    <li className="flex gap-3 py-3 text-sm">
      <OpportunityLogo name={item.name} url={item.logoUrl} size={36} />
      <div className="min-w-0">
        <button type="button" className="font-semibold" onClick={onEdit}>
          {item.name}
        </button>
        <p className="text-muted">
          {n} campaign{n === 1 ? "" : "s"} · {item.status}
          {item.sponsored ? " · sponsored" : ""} · verified {item.verifiedOn || "never"}
        </p>
        {n === 0 ? <p className="text-accent">No campaigns yet. Open it and add one.</p> : null}
        {hidden ? <p className="text-accent">Hidden from readers: verification is older than 14 days.</p> : null}
        <button type="button" className="mt-1 min-h-11 font-semibold text-accent" onClick={onVerify}>
          Mark verified today
        </button>
      </div>
    </li>
  );
}
