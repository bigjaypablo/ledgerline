import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Card } from "./card";

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirm(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error: err } = await authClient.deleteUser({ password });
    if (err) {
      setError(err.message ?? "Could not delete the account.");
      setBusy(false);
      return;
    }
    window.location.href = "/";
  }

  return (
    <Card title="Delete account">
      <p className="text-sm leading-6 text-muted">
        This permanently deletes your sign-in. Comments you have posted stay on the site.
      </p>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="mt-4 min-h-11 border border-accent px-4 text-sm font-semibold text-accent">
          Delete my account
        </button>
      ) : (
        <form onSubmit={confirm} className="mt-4 grid gap-3">
          <label className="text-sm font-semibold">
            Enter your password to confirm
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 min-h-11 w-full border border-line bg-card px-3"
            />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="min-h-11 bg-accent px-4 text-sm font-semibold text-inverse-fg disabled:opacity-50">
              {busy ? "Deleting…" : "Permanently delete"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="min-h-11 border border-line px-4 text-sm font-semibold">
              Cancel
            </button>
          </div>
          {error ? <p className="text-sm text-accent">{error}</p> : null}
        </form>
      )}
    </Card>
  );
}
