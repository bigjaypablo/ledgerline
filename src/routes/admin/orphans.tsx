import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listInbound } from "@/lib/editorial/orphans";

export const Route = createFileRoute("/admin/orphans")({
  component: OrphanReport,
});

type Row = { id: string; slug: string; title: string; n: number };

function OrphanReport() {
  const { user } = useCurrentUserState();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    let live = true;
    listInbound()
      .then((r) => live && setRows(r))
      .catch((e: unknown) => {
        if (live) setError(e instanceof Error ? e.message : "Could not load.");
      });
    return () => {
      live = false;
    };
  }, [user?.id]);

  const orphans = rows ? rows.filter((r) => r.n === 0).length : 0;

  return (
    <main className="font-sans">
      <h1 className="text-3xl font-medium">Internal links</h1>
      <p className="mt-2 text-sm text-muted">
        How many other articles link to each published article from their body
        text. Articles with 0 are orphans: open the ones you want to boost
        and add a link from a related article.
      </p>
      {error ? <p className="mt-4 text-sm text-accent">{error}</p> : null}
      {rows ? (
        <p className="mt-4 text-sm font-semibold">
          {orphans} of {rows.length} articles have no inbound links.
        </p>
      ) : null}
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {(rows ?? []).map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 py-3">
            <span className="min-w-0">
              <span className="block truncate font-semibold">{r.title}</span>
              <span className="text-xs text-muted">
                {r.n === 0 ? "Orphan" : r.n + " inbound"}
              </span>
            </span>
            <a
              href={"/admin/articles/" + r.id}
              className="inline-flex min-h-11 shrink-0 items-center border border-line px-3 text-sm font-semibold"
            >
              Edit
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
