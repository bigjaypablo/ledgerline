import type { AdminOpportunity } from "@/lib/editorial/opportunities-admin";

function isStale(verifiedOn: string): boolean {
  if (!verifiedOn) return true;
  const age = Date.now() - new Date(verifiedOn).getTime();
  return age > 14 * 24 * 60 * 60 * 1000;
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
  const stale = isStale(item.verifiedOn);
  const hidden = item.status === "published" && stale;
  return (
    <li className="py-3 text-sm">
      <button type="button" className="font-semibold" onClick={onEdit}>
        {item.name}
      </button>
      <p className="text-muted">
        {item.kind} · {item.status}
        {item.sponsored ? " · sponsored" : ""} · verified {item.verifiedOn || "never"}
      </p>
      {hidden ? <p className="text-accent">Hidden from readers: verification is older than 14 days.</p> : null}
      <button type="button" className="mt-1 min-h-11 font-semibold text-accent" onClick={onVerify}>
        Mark verified today
      </button>
    </li>
  );
}
