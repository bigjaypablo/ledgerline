import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { NewsletterForm } from "@/components/editorial/shell";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getReactions, reactToArticle, saveState, toggleSave } from "@/lib/editorial/public";

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
  return (
    <section className="mt-12 bg-accent text-white">
      <div className="mx-auto max-w-xl px-4 py-12 text-center font-sans">
        <h2 className="text-3xl font-medium">Ready for more?</h2>
        <p className="mt-2 text-base text-white/80">One short desk note when we publish something worth your time.</p>
        <div className="mt-6 text-left">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
