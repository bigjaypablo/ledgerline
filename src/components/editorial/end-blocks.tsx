import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getReactions, reactToArticle, saveState, subscribe, toggleSave } from "@/lib/editorial/public";

function voterId(): string {
  try {
    let id = window.localStorage.getItem("ledgerline:voter");
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem("ledgerline:voter", id);
    }
    return id;
  } catch {
    return "";
  }
}

const btn = "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 font-sans text-[11px] font-medium text-muted";

export function ActionBar({ articleId, title, commentCount }: { articleId: string; title: string; commentCount: number }) {
  const { user } = useCurrentUserState();
  const [react, setReact] = useState({ likes: 0, dislikes: 0, mine: 0 });
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    let live = true;
    getReactions({ data: { articleId, voterId: voterId() } })
      .then((r) => live && setReact(r))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [articleId]);

  useEffect(() => {
    if (!user?.id) return;
    let live = true;
    saveState({ data: { articleId } })
      .then((r) => live && setSaved(r.saved))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [user?.id, articleId]);

  function like() {
    const next = react.mine === 1 ? 0 : 1;
    void reactToArticle({ data: { articleId, voterId: voterId(), value: next } })
      .then(setReact)
      .catch(() => setNote("Could not record that."));
  }

  function share() {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      void navigator.share({ title, url }).catch(() => {});
    } else {
      void navigator.clipboard
        .writeText(url)
        .then(() => setNote("Link copied"))
        .catch(() => setNote("Could not copy"));
    }
    window.setTimeout(() => setNote(""), 2000);
  }

  return (
    <>
      <div className="h-20 md:hidden" aria-hidden />
      <nav
        aria-label="Article actions"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {note ? <p className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ink px-3 py-1 font-sans text-xs text-inverse-fg">{note}</p> : null}
        <div className="mx-auto flex max-w-3xl items-stretch">
          <button type="button" onClick={like} aria-pressed={react.mine === 1} className={`${btn} ${react.mine === 1 ? "text-accent" : ""}`}>
            <Heart className="size-5" fill={react.mine === 1 ? "currentColor" : "none"} aria-hidden />
            {react.likes}
          </button>
          <a href="#comments" className={btn}>
            <MessageCircle className="size-5" aria-hidden />
            {commentCount}
          </a>
          {user ? (
            <button
              type="button"
              className={`${btn} ${saved ? "text-accent" : ""}`}
              onClick={() =>
                void toggleSave({ data: { articleId } })
                  .then((r) => setSaved(r.saved))
                  .catch(() => setNote("Could not save."))
              }
            >
              <Bookmark className="size-5" fill={saved ? "currentColor" : "none"} aria-hidden />
              {saved ? "Saved" : "Save"}
            </button>
          ) : (
            <Link to="/login" className={btn}>
              <Bookmark className="size-5" aria-hidden />
              Save
            </Link>
          )}
          <button type="button" onClick={share} className={btn}>
            <Share2 className="size-5" aria-hidden />
            Share
          </button>
        </div>
      </nav>
    </>
  );
}

export function ReadyBand() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMsg("");
    try {
      const r = await subscribe({ data: { email, consent, company } });
      setMsg(r.message);
      if (r.ok) setEmail("");
    } catch {
      setMsg("Could not save that address. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-12 bg-accent text-white">
      <div className="mx-auto max-w-xl px-4 py-12 text-center font-sans">
        <h2 className="text-3xl font-medium">Ready for more?</h2>
        <p className="mt-2 text-base text-white/80">One short desk note when we publish something worth your time.</p>
        <form onSubmit={onSubmit} className="mt-6">
          <div className="flex">
            <label className="sr-only" htmlFor="band-email">Email</label>
            <input
              id="band-email"
              type="email"
              required
              autoComplete="email"
              placeholder="Type your email…"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-12 min-w-0 flex-1 border border-white/60 bg-transparent px-3 text-white placeholder:text-white/60"
            />
            <button type="submit" disabled={pending} className="min-h-12 bg-white px-5 text-sm font-semibold text-accent disabled:opacity-60">
              {pending ? "Saving…" : "Subscribe"}
            </button>
          </div>
          <label className="mt-3 flex items-start justify-center gap-2 text-left text-sm text-white/85">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-4" />
            <span>Send me the occasional desk note. I can unsubscribe later.</span>
          </label>
          <label className="absolute -left-[9999px]" aria-hidden="true">
            Company
            <input value={company} onChange={(e) => setCompany(e.target.value)} tabIndex={-1} autoComplete="off" />
          </label>
          {msg ? <p className="mt-3 text-sm">{msg}</p> : null}
        </form>
      </div>
    </section>
  );
}
