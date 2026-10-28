import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicShell } from "@/components/editorial/shell";
import { unsubscribe } from "@/lib/editorial/public";

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token.slice(0, 80) : "",
  }),
  head: () => ({
    meta: [
      { title: "Unsubscribe — Ledgerline" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { token } = Route.useSearch();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await unsubscribe({ data: { token } });
      setMessage(result.message);
    } catch {
      setMessage("Could not update that subscription. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <PublicShell>
      <main className="sheet max-w-xl py-12">
        <h1 className="font-serif text-4xl font-semibold">Unsubscribe</h1>
        <p className="mt-3 text-muted">This does not delete an address until you confirm.</p>
        <form onSubmit={onSubmit} className="mt-6">
          <button
            type="submit"
            disabled={pending || !token}
            className="min-h-11 bg-ink px-4 text-sm font-semibold text-inverse-fg disabled:opacity-60"
          >
            {pending ? "Saving…" : "Unsubscribe this address"}
          </button>
        </form>
        {!token ? <p className="mt-4 text-sm text-accent">This link is missing a token.</p> : null}
        {message ? <p className="mt-4 text-sm">{message}</p> : null}
        <Link to="/" className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-accent">
          Back to the publication
        </Link>
      </main>
    </PublicShell>
  );
}
