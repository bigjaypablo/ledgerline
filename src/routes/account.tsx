import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicShell } from "@/components/editorial/shell";
import { AccountNav } from "@/components/editorial/account/account-nav";
import { PreferencesSection } from "@/components/editorial/account/preferences-section";
import { ProfileSection } from "@/components/editorial/account/profile-section";
import { SavedSection } from "@/components/editorial/account/saved-section";
import { SessionSection } from "@/components/editorial/account/session-section";
import { asSection } from "@/components/editorial/account/sections";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { readerHome } from "@/lib/editorial/public";
import type { Card } from "@/lib/editorial/types";

export const Route = createFileRoute("/account")({
  validateSearch: (search: Record<string, unknown>): { section?: string } =>
    search.section ? { section: String(search.section).slice(0, 20) } : {},
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
  const search = Route.useSearch();
  const section = asSection(search.section);
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

  const shownName = name || user?.displayName || user?.primaryEmail || "Reader";

  return (
    <PublicShell>
      <main className="sheet py-10">
        <p className="text-xs font-bold tracking-widest text-accent uppercase">Account</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">Your account</h1>
        {isPending ? <p className="mt-4 text-muted">Checking the session…</p> : null}
        {!isPending && !user ? (
          <p className="mt-4">
            <Link to="/login" className="font-semibold text-accent">
              Sign in
            </Link>{" "}
            to see your account.
          </p>
        ) : null}
        {user ? (
          <div className="mt-6 grid gap-6 md:grid-cols-[14rem_1fr]">
            <AccountNav active={section} />
            <div>
              {error ? <p className="mb-4 text-sm text-accent">{error}</p> : null}
              {section === "profile" ? <ProfileSection name={shownName} email={user.primaryEmail ?? ""} /> : null}
              {section === "saved" ? <SavedSection saved={saved} /> : null}
              {section === "preferences" ? <PreferencesSection /> : null}
              {section === "session" ? <SessionSection /> : null}
            </div>
          </div>
        ) : null}
      </main>
    </PublicShell>
  );
}
