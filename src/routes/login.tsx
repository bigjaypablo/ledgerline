import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { emailSignIn, emailSignUp } from "@/components/editorial/email-auth";
import { PublicShell } from "@/components/editorial/shell";
import { authEnabled } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Ledgerline" },
      { name: "description", content: "Sign in to save Ledgerline research. This is not the staff desk." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

const field =
  "flex min-h-13 items-center gap-3 border border-line bg-paper px-4 transition-colors focus-within:border-accent";
const input = "w-full bg-transparent py-3 text-base outline-none placeholder:text-muted";

function LoginPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setPending(true);
    try {
      if (mode === "up") await emailSignUp(name.trim() || "Reader", email.trim(), password);
      else await emailSignIn(email.trim(), password);
      window.location.assign("/account");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
      setPending(false);
    }
  }

  return (
    <PublicShell>
      <main className="sheet flex justify-center py-10 md:py-16">
        <div className="w-full max-w-md border border-line bg-card p-6 shadow-[0_28px_50px_-30px_rgba(142,29,56,.35)] md:p-8">
          <div className="mx-auto flex size-14 items-center justify-center bg-ink text-inverse-fg">
            <ArrowRight className="size-6" aria-hidden />
          </div>
          <h1 className="mt-5 text-center font-serif text-3xl font-semibold">
            {mode === "in" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-center text-sm leading-6 text-muted">
            Save articles and return to them anytime. Reader accounts cannot publish.
          </p>

          <div className="mt-6 grid grid-cols-2 border border-line p-1" role="tablist" aria-label="Account mode">
            {(["in", "up"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={`min-h-11 text-sm font-semibold transition-colors ${
                  mode === m ? "bg-ink text-inverse-fg" : "text-muted hover:text-ink"
                }`}
              >
                {m === "in" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form className="mt-5 space-y-3" onSubmit={(e) => void onSubmit(e)} noValidate={false}>
            {mode === "up" ? (
              <label className={field}>
                <User className="size-5 shrink-0 text-muted" aria-hidden />
                <span className="sr-only">Name</span>
                <input
                  className={input}
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </label>
            ) : null}
            <label className={field}>
              <Mail className="size-5 shrink-0 text-muted" aria-hidden />
              <span className="sr-only">Email</span>
              <input
                className={input}
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
              />
            </label>
            <label className={field}>
              <Lock className="size-5 shrink-0 text-muted" aria-hidden />
              <span className="sr-only">Password</span>
              <input
                className={input}
                type={show ? "text" : "password"}
                required
                placeholder="Password (8+ characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "up" ? "new-password" : "current-password"}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="flex size-9 shrink-0 items-center justify-center text-muted"
              >
                {show ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
              </button>
            </label>

            {error ? (
              <p role="alert" className="border-l-2 border-accent bg-paper px-3 py-2 text-sm text-accent">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending || !authEnabled}
              className="flex min-h-13 w-full items-center justify-center gap-2 bg-ink text-base font-semibold text-inverse-fg transition-colors hover:bg-accent disabled:opacity-60"
            >
              {pending ? "Working…" : mode === "up" ? "Create account" : "Sign in"}
              {pending ? null : <ArrowRight className="size-5" aria-hidden />}
            </button>
            {!authEnabled ? <p className="text-center text-sm text-muted">Sign-in is turned off.</p> : null}
          </form>

          <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm">
            <Link to="/" className="font-semibold text-accent">
              ← Back to the publication
            </Link>
            <Link to="/admin/login" className="text-muted hover:text-ink">
              Staff
            </Link>
          </div>
        </div>
      </main>
    </PublicShell>
  );
}
