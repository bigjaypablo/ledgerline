import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { emailSignIn, emailSignUp } from "@/components/editorial/email-auth";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { bootstrapStaff, claimStaff, staffStatus } from "@/lib/editorial/admin";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Staff sign in — Ledgerline" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StaffLogin,
});

function StaffLogin() {
  const { user, isPending } = useCurrentUserState();
  const [needsBootstrap, setNeedsBootstrap] = useState(false);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let live = true;
    staffStatus()
      .then((result) => {
        if (!live) return;
        setNeedsBootstrap(result.needsBootstrap);
        setReady(true);
      })
      .catch(() => {
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!user?.id || !ready || needsBootstrap) return;
    let live = true;
    claimStaff()
      .then((result) => {
        if (live && result.ok) window.location.assign("/admin");
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [user?.id, ready, needsBootstrap]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setPending(true);
    try {
      if (needsBootstrap) await emailSignUp(name.trim() || "Editor", email.trim(), password);
      else await emailSignIn(email.trim(), password);
      if (needsBootstrap) {
        const opened = await bootstrapStaff({ data: { displayName: name.trim() || "Editor" } });
        if (!opened.ok) throw new Error("An admin already exists. Sign in with that account.");
      } else {
        const claim = await claimStaff();
        if (!claim.ok) throw new Error("That account is a reader. An admin has to grant staff access.");
      }
      window.location.assign("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
      setPending(false);
    }
  }

  async function promoteCurrent() {
    setPending(true);
    setError("");
    try {
      const opened = await bootstrapStaff({ data: { displayName: user?.displayName || "Editor" } });
      if (!opened.ok) throw new Error("An admin already exists.");
      window.location.assign("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not open the desk.");
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink">
      <div className="w-full max-w-md border border-line bg-card p-6">
        <p className="font-serif text-3xl font-semibold">Ledgerline</p>
        <h1 className="mt-2 text-sm font-bold tracking-widest uppercase">Staff sign in</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {needsBootstrap
            ? "No admin exists yet. The account created here becomes the only admin. Reader sign-in on the public site does not do this."
            : "Email and password for editors. Reader accounts stay on the public site until an admin changes the role."}
        </p>
        {!authEnabled ? <p className="mt-4 text-sm text-muted">Sign-in is turned off.</p> : null}
        {needsBootstrap && user ? (
          <button type="button" className="mt-4 min-h-12 w-full bg-ink text-sm font-semibold text-inverse-fg" disabled={pending} onClick={() => void promoteCurrent()}>
            Use this signed-in account as the first admin
          </button>
        ) : null}
        <form className="mt-4 space-y-3" onSubmit={(event) => void onSubmit(event)}>
          {needsBootstrap ? (
            <label className="block text-sm font-semibold">
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 min-h-12 w-full border border-line px-3" />
            </label>
          ) : null}
          <label className="block text-sm font-semibold">
            Email
            <input type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 min-h-12 w-full border border-line px-3" />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input type="password" required autoComplete={needsBootstrap ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 min-h-12 w-full border border-line px-3" />
          </label>
          {error ? <p className="text-sm text-accent">{error}</p> : null}
          <button type="submit" disabled={pending || isPending || !authEnabled} className="min-h-12 w-full bg-ink text-sm font-semibold text-inverse-fg disabled:opacity-60">
            {pending ? "Working…" : needsBootstrap ? "Create admin" : "Sign in"}
          </button>
        </form>
        <Link to="/" className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-accent">
          Back to the publication
        </Link>
      </div>
    </main>
  );
}
