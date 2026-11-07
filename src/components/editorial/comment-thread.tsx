import { Link } from "@tanstack/react-router";
import { getMyAvatar } from "@/lib/editorial/avatar";
import { Heart } from "lucide-react";
import { LINKY, LINK_MSG } from "@/lib/editorial/comment-rules";
import { Fragment, useEffect, useState } from "react";
import { myCommentLikes, postComment, toggleCommentLike } from "@/lib/editorial/comments";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { formatDate } from "@/lib/editorial/text";
import type { Comment } from "@/lib/editorial/types";

function Avatar({ name, url }: { name: string; url: string | null }) {
  return (
    <span className="inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-card font-sans text-sm font-bold text-muted">
      {url ? <img src={url} alt="" className="size-full object-cover" /> : name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function CommentThread({ slug, comments }: { slug: string; comments: Comment[] }) {
  const { user } = useCurrentUserState();
  const [counts, setCounts] = useState<Record<string, number>>(() => Object.fromEntries(comments.map((c) => [c.id, c.likes])));
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [shown, setShown] = useState(5);
  const [added, setAdded] = useState<Comment[]>([]);
  const all = [...comments, ...added];
  const [myPhoto, setMyPhoto] = useState<string | null>(null);
  useEffect(() => {
    if (!user?.id) return;
    let live = true;
    const load = () =>
      getMyAvatar()
        .then((r) => live && setMyPhoto(r.avatarUrl || null))
        .catch(() => {});
    void load();
    window.addEventListener("ledgerline:profile-updated", load);
    return () => {
      live = false;
      window.removeEventListener("ledgerline:profile-updated", load);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    let live = true;
    myCommentLikes({ data: { articleSlug: slug } })
      .then((ids) => live && setMine(new Set(ids)))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [user?.id, slug]);

  const top = all.filter((c) => !c.parentId);
  const repliesOf = (id: string) => all.filter((c) => c.parentId === id);

  async function send(parentId: string | null) {
    setBusy(true);
    setNote("");
    try {
      if (LINKY.test(text)) {
        setNote(LINK_MSG);
        return;
      }
      const r = await postComment({ data: { articleSlug: slug, body: text, parentId } });
      setNote(r.message);
      const made = "comment" in r ? r.comment : null;
      if (made) setAdded((a) => [...a, made]);
      if (r.ok) {
        setText("");
        setReplyTo(null);
      }
    } catch {
      setNote("Could not send that. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function like(id: string) {
    try {
      const r = await toggleCommentLike({ data: { commentId: id } });
      setCounts((c) => ({ ...c, [id]: r.count }));
      setMine((m) => {
        const next = new Set(m);
        if (r.liked) next.add(id);
        else next.delete(id);
        return next;
      });
    } catch {
      setNote("Could not record that like.");
    }
  }

  function Box({ parentId }: { parentId: string | null }) {
    if (!user) {
      return (
        <p className="font-sans text-sm text-muted">
          <Link to="/login" className="font-semibold text-accent underline">Sign in</Link> to join the discussion.
        </p>
      );
    }
    return (
      <div className="flex gap-3">
        <Avatar name={user.displayName ?? "R"} url={myPhoto} />
        <div className="min-w-0 flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={parentId ? "Write a reply…" : "Write a comment…"}
            className="min-h-24 w-full border border-line bg-card px-3 py-2 font-sans text-base"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void send(parentId)}
            className="mt-2 min-h-11 bg-ink px-4 font-sans text-sm font-semibold text-inverse-fg disabled:opacity-60"
          >
            {busy ? "Sending…" : parentId ? "Reply" : "Post comment"}
          </button>
        </div>
      </div>
    );
  }

  function Item({ c, reply }: { c: Comment; reply?: boolean }) {
    return (
      <li className={reply ? "mt-4 ml-6 sm:ml-12" : "border-b border-line py-5"}>
        <div className="flex gap-3">
          <Avatar name={c.authorName} url={c.avatarUrl} />
          <div className="min-w-0 flex-1">
            <p className="font-sans text-sm font-semibold">
              {c.authorName} <span className="font-normal text-muted">{formatDate(c.createdAt)}</span>
            </p>
            <p className="mt-1 whitespace-pre-wrap text-base leading-7">{c.body}</p>
            <div className="mt-2 flex items-center gap-5 font-sans text-xs font-semibold tracking-wide text-muted uppercase">
              {user ? (
                <button type="button" onClick={() => void like(c.id)} className={`inline-flex min-h-9 items-center gap-1.5 ${mine.has(c.id) ? "text-accent" : ""}`}>
                  <Heart className="size-4" fill={mine.has(c.id) ? "currentColor" : "none"} aria-hidden />
                  Like ({counts[c.id] ?? 0})
                </button>
              ) : (
                <Link to="/login" className="inline-flex min-h-9 items-center gap-1.5">
                  <Heart className="size-4" aria-hidden /> Like ({counts[c.id] ?? 0})
                </Link>
              )}
              {!reply && user ? (
                <button type="button" className="min-h-9" onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setNote(""); }}>
                  Reply
                </button>
              ) : null}
            </div>
            {replyTo === c.id ? <div className="mt-3">{Box({ parentId: c.id })}</div> : null}
          </div>
        </div>
        {!reply ? <ul>{repliesOf(c.id).map((r) => <Fragment key={r.id}>{Item({ c: r, reply: true })}</Fragment>)}</ul> : null}
      </li>
    );
  }

  return (
    <section id="comments" className="mx-auto mt-10 max-w-3xl border-t border-line pt-6">
      <h2 className="font-sans text-2xl font-medium">Discussion about this post</h2>
      <p className="mt-2 font-sans text-sm text-muted">Comments are checked before they appear. Links are not accepted.</p>
      <div className="mt-5">{replyTo === null ? Box({ parentId: null }) : null}</div>
      {note ? <p role="alert" className="mt-3 border-l-2 border-accent bg-card px-3 py-2 font-sans text-sm">{note}</p> : null}
      <ul className="mt-4">{top.slice(0, shown).map((c) => <Fragment key={c.id}>{Item({ c })}</Fragment>)}</ul>
      {top.length > shown ? (
        <button type="button" onClick={() => setShown((n) => n + 5)} className="mt-4 min-h-11 bg-line/60 px-4 font-sans text-sm font-semibold">
          Show more comments
        </button>
      ) : null}
    </section>
  );
}
