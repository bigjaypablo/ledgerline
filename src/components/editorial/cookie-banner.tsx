import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const KEY = "ledgerline:consent";

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) setOpen(true);
    } catch {
      /* storage blocked: stay hidden */
    }
  }, []);

  if (!open) return null;

  function choose(value: "accepted" | "rejected") {
    try {
      window.localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  const btn = "min-h-11 border border-ink px-4 text-sm font-semibold";
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ink bg-card p-3" role="dialog" aria-label="Cookie choices">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm leading-6">
          We store a little data in your browser for things like your votes and preferences. Analytics or advertising cookies are used only if you accept.{" "}
          <Link to="/privacy" className="text-accent underline">
            Privacy
          </Link>
        </p>
        <div className="flex gap-2">
          <button type="button" className={btn} onClick={() => choose("rejected")}>
            Reject
          </button>
          <button type="button" className={btn} onClick={() => choose("accepted")}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
