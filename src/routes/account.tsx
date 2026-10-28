import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StoryCard } from "@/components/editorial/cards";
import { PublicShell } from "@/components/editorial/shell";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { readerHome } from "@/lib/editorial/public";
import type { Card } from "@/lib/editorial/types";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your account — Ledgerline" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, isPending } = useCurrentUserState();
  const [saved, setSaved] = useState<Card[] | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    let live = true;
    readerHome()
      .then((result) => {
        if (!live) return;
        setName(result.displayName);
        setSaved(result.saved);
      })
      .catch((err: unknown) => {
        if (live) setError(err instanceof Error ? err.message : "Could not open this account.");
      });
    return () => {
      live = false;
    };
  }, [user?.id]);

  return (
    <PublicShell>
      <main className="sheet py-10">
        <p className="text-xs font-bold tracking-widest text-accent uppercase">Readers</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">Your account</h1>
        {isPending ? <p className="mt-4 text-muted">Checking the session…</p> : null}
        {!isPending && !user ? (
          <p className="mt-4">
            <Link to="/login" className="font-semibold text-accent">
              Sign in
            </Link>{" "}
            to see saved research.
          </p>
        ) : null}
        {user ? (
          <>
            <p className="mt-3 max-w-xl text-muted">
              Signed in as {name || user.displayName || user.primaryEmail || "reader"}. This page is not the staff desk.
            </p>
            <button
              type="button"
              className="mt-4 min-h-11 border border-ink px-4 text-sm font-semibold"
              onClick={() => void signOut("/")}
            >
              Sign out
            </button>
            {error ? <p className="mt-4 text-sm text-accent">{error}</p> : null}
            <h2 className="mt-8 font-serif text-2xl font-semibold">Saved</h2>
            {saved && saved.length === 0 ? <p className="mt-3 text-muted">Nothing saved yet. Open an article and choose Save.</p> : null}
            {saved && saved.length > 0 ? (
              <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {saved.map((card) => (
                  <StoryCard key={card.id} card={card} />
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </main>
    </PublicShell>
  );
}
