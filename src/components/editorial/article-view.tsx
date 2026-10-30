import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Cover } from "@/components/editorial/cards";
import { MarkdownBody, TableOfContents } from "@/components/editorial/markdown-body";
import { NewsletterForm, PublicShell } from "@/components/editorial/shell";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { absoluteUrl, formatDate } from "@/lib/editorial/text";
import type { ArticlePage } from "@/lib/editorial/types";
import { getReactions, reactToArticle, saveState, submitComment, toggleSave, trackAffiliateClick } from "@/lib/editorial/public";

export function ArticleView({ data }: { data: ArticlePage }) {
  const { article, settings } = data;
  const canonical = absoluteUrl(settings.publicUrl, `/article/${article.slug}`);
  const share = `https://x.com/intent/post?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(canonical.startsWith("http") ? canonical : "")}`;
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [company, setCompany] = useState("");
  const [note, setNote] = useState("");

  async function sendComment(event: React.FormEvent) {
    event.preventDefault();
    const result = await submitComment({ data: { articleSlug: article.slug, name, body, company } });
    setNote(result.message);
    if (result.ok) {
      setBody("");
      setName("");
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: { "@type": "Organization", name: data.author.name },
    publisher: { "@type": "Organization", name: "Ledgerline" },
    articleSection: article.categoryName,
  };

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <article className="sheet py-6">
        <div className="mx-auto max-w-4xl">
        <p className="text-sm text-muted">
          <Link to="/" className="hover:text-accent">
            Home
          </Link>
          <span aria-hidden> / </span>
          <Link to={sectionHref(article.categorySlug)} className="hover:text-accent">
            {article.categoryName}
          </Link>
        </p>
        <p className="mt-4 text-xs font-bold tracking-widest text-accent uppercase">{article.label}</p>
        <h1 className="mt-2 mx-auto max-w-4xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">{article.title}</h1>
        <p className="mt-4 mx-auto max-w-4xl text-xl leading-8">{article.summary}</p>
        <p className="mt-4 text-sm text-muted">
          By {data.author.name}
          <span aria-hidden> · </span>
          {formatDate(article.publishedAt)}
          {article.updatedAt ? ` · Updated ${formatDate(article.updatedAt)}` : ""}
          <span aria-hidden> · </span>
          {article.readingMinutes} min read
        </p>
        {article.lastChecked ? (
          <p className="mt-2 text-sm font-semibold">Last checked {formatDate(article.lastChecked)}</p>
        ) : (
          <p className="mt-2 border border-accent bg-card px-3 py-2 text-sm">
            This research article is missing a last-checked date. Treat it as unverified until an editor confirms it.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
          {canonical.startsWith("http") ? (
            <a href={share} className="text-accent">
              Share on X
            </a>
          ) : (
            <ShareFallback title={article.title} />
          )}
          {data.author.xUrl ? (
            <a href={data.author.xUrl} rel="noopener noreferrer" className="text-accent">
              Follow on X
            </a>
          ) : null}
          <SaveButton articleId={article.id} />
        </div>
        <figure className="mt-6 mx-auto max-w-4xl">
          <Cover card={article} eager />
          {article.coverCaption ? <figcaption className="mt-2 text-sm text-muted">{article.coverCaption}</figcaption> : null}
        </figure>
        <TableOfContents markdown={article.body} />
        <MarkdownBody markdown={article.body} />
        <ReactionButtons articleId={article.id} />
        <aside className="mt-8 mx-auto max-w-4xl border border-line bg-card p-4 text-sm leading-6">
          <p className="font-semibold">Information only. Not financial advice.</p>
          <p className="mt-2">
            Ledgerline does not provide financial, investment, legal, or tax advice. Cryptocurrency coverage
            describes public documents and risks. It is not a recommendation to buy, sell, or hold any asset.
            Nothing above is a hands-on product test unless the article says a named person performed one.
          </p>
          {article.affiliateDisclosure || data.tools.length > 0 ? (
            <p className="mt-2">
              Some links on this page may be affiliate links. If Ledgerline is paid for a visit or a signup, the
              link is marked. Payment is not a test and not an endorsement.{" "}
              <Link to="/disclosure" className="text-accent">
                Affiliate disclosure
              </Link>
              .
            </p>
          ) : null}
        </aside>
        <section className="mt-10 mx-auto max-w-4xl">
          <h2 className="font-serif text-3xl font-semibold">Sources</h2>
          {data.sources.length === 0 ? (
            <p className="mt-3 border border-accent bg-card px-3 py-2 text-sm">
              This research article has no source list. Do not treat its claims as checked.
            </p>
          ) : (
            <ol className="mt-4 space-y-4">
              {data.sources.map((source) => (
                <li key={source.id} className="border-t border-line pt-3">
                  <a href={source.url} className="font-semibold text-accent" {...linkAttrs(source.url)}>
                    {source.title}
                  </a>
                  <p className="text-sm text-muted">
                    {source.publisher} · {source.sourceType}
                    {source.publishedOn ? ` · Published ${formatDate(source.publishedOn)}` : ""} · Accessed{" "}
                    {formatDate(source.accessedOn)}
                  </p>
                  <p className="mt-1 text-sm leading-6">{source.claim}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
        {data.tools.length > 0 ? (
          <section className="mt-10 mx-auto max-w-4xl">
            <h2 className="font-serif text-3xl font-semibold">Related links</h2>
            <ul className="mt-4 space-y-4">
              {data.tools.map((tool) => (
                <li key={tool.id} className="border border-line bg-card p-4">
                  <h3 className="font-serif text-2xl font-semibold">{tool.name}</h3>
                  <p className="mt-1 text-sm text-muted">{tool.programName || tool.category}</p>
                  {tool.commissionType === "undocumented" ? (
                    <p className="mt-2 text-sm">Commission terms are not documented here.</p>
                  ) : (
                    <p className="mt-2 text-sm">
                      Commission type on file: {tool.commissionType}. {tool.commissionNotes}
                    </p>
                  )}
                  <a
                    href={tool.affiliateUrl}
                    rel="sponsored nofollow noopener"
                    target="_blank"
                    className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-accent"
                    onClick={() => void trackAffiliateClick({ data: { id: tool.id, articleId: article.id } })}
                  >
                    Affiliate link
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {article.tags.length > 0 ? (
          <p className="mt-6 text-sm text-muted">Tags: {article.tags.join(", ")}</p>
        ) : null}
        <section className="mt-10 mx-auto max-w-4xl border-t border-line pt-6">
          <h2 className="font-serif text-2xl font-semibold">{data.author.name}</h2>
          <p className="mt-2 text-base leading-7">{data.author.bio}</p>
        </section>
        {data.related.length > 0 ? (
          <section className="mt-10 mx-auto max-w-4xl">
            <h2 className="text-sm font-bold tracking-widest uppercase">Related</h2>
            <ul className="mt-3 divide-y divide-line">
              {data.related.map((card) => (
                <li key={card.id} className="py-3">
                  <Link to="/article/$slug" params={{ slug: card.slug }} className="font-serif text-2xl font-semibold">
                    {card.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <nav className="mt-8 grid mx-auto max-w-4xl gap-4 border-t border-line pt-4 sm:grid-cols-2" aria-label="More articles">
          {data.previous ? (
            <Link to="/article/$slug" params={{ slug: data.previous.slug }} className="text-sm">
              <span className="block text-xs font-bold tracking-widest uppercase text-muted">Previous</span>
              <span className="font-serif text-xl font-semibold">{data.previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {data.next ? (
            <Link to="/article/$slug" params={{ slug: data.next.slug }} className="text-sm sm:text-right">
              <span className="block text-xs font-bold tracking-widest uppercase text-muted">Next</span>
              <span className="font-serif text-xl font-semibold">{data.next.title}</span>
            </Link>
          ) : null}
        </nav>
        {settings.commentsEnabled ? (
          <section className="mt-10 mx-auto max-w-4xl border-t border-ink pt-6">
            <h2 className="font-serif text-3xl font-semibold">Comments</h2>
            <p className="mt-2 text-sm text-muted">Comments are checked before they appear. Links are not accepted.</p>
            <ul className="mt-4 space-y-4">
              {data.comments.map((comment) => (
                <li key={comment.id} className="border-b border-line pb-3">
                  <p className="text-sm font-semibold">
                    {comment.authorName}{" "}
                    <span className="font-normal text-muted">{formatDate(comment.createdAt)}</span>
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-base leading-7">{comment.body}</p>
                </li>
              ))}
            </ul>
            <form onSubmit={sendComment} className="mt-4 space-y-3">
              <label className="block text-sm font-semibold" htmlFor="comment-name">
                Name
              </label>
              <input id="comment-name" value={name} onChange={(event) => setName(event.target.value)} className="min-h-12 w-full border border-line bg-card px-3" required />
              <label className="block text-sm font-semibold" htmlFor="comment-body">
                Comment
              </label>
              <textarea id="comment-body" value={body} onChange={(event) => setBody(event.target.value)} className="min-h-28 w-full border border-line bg-card px-3 py-2" required />
              <label className="absolute -left-[9999px]" aria-hidden="true">
                Company
                <input value={company} onChange={(event) => setCompany(event.target.value)} tabIndex={-1} autoComplete="off" />
              </label>
              <button type="submit" className="min-h-11 bg-ink px-4 text-sm font-semibold text-inverse-fg">
                Submit for moderation
              </button>
              {note ? <p className="text-sm">{note}</p> : null}
            </form>
          </section>
        ) : null}
        <section className="mt-10 mx-auto max-w-4xl border-t border-line pt-6">
          <h2 className="font-serif text-2xl font-semibold">The desk note</h2>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </section>
      </div>
      </article>
    </PublicShell>
  );
}

function SaveButton({ articleId }: { articleId: string }) {
  const { user, isPending } = useCurrentUserState();
  const [saved, setSaved] = useState<boolean | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    let live = true;
    saveState({ data: { articleId } })
      .then((result) => {
        if (live) setSaved(result.saved);
      })
      .catch(() => {
        if (live) setSaved(false);
      });
    return () => {
      live = false;
    };
  }, [user?.id, articleId]);

  if (isPending) return null;
  if (!user) {
    return (
      <Link to="/login" className="text-accent">
        Save
      </Link>
    );
  }
  return (
    <button
      type="button"
      className="text-accent"
      onClick={() => {
        setNote("");
        void toggleSave({ data: { articleId } })
          .then((result) => setSaved(result.saved))
          .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Could not save."));
      }}
    >
      {saved ? "Saved" : "Save"}
      {note ? ` · ${note}` : ""}
    </button>
  );
}

function sectionHref(slug: string): "/crypto" | "/ai" | "/saas" | "/guides" | "/comparisons" | "/research" {
  if (slug === "crypto" || slug === "ai" || slug === "saas" || slug === "guides" || slug === "comparisons" || slug === "research") {
    return `/${slug}`;
  }
  return "/research";
}

function linkAttrs(url: string) {
  if (url.startsWith("/")) return {};
  return { target: "_blank", rel: "noopener noreferrer" };
}

function ShareFallback({ title }: { title: string }) {
  return (
    <button
      type="button"
      className="text-accent"
      onClick={() => {
        const url = window.location.href;
        window.open(
          `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          "_blank",
          "noopener",
        );
      }}
    >
      Share on X
    </button>
  );
}

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

function ReactionButtons({ articleId }: { articleId: string }) {
  const [state, setState] = useState({ likes: 0, dislikes: 0, mine: 0 });
  const [note, setNote] = useState("");

  useEffect(() => {
    let live = true;
    getReactions({ data: { articleId, voterId: voterId() } })
      .then((result) => {
        if (live) setState(result);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [articleId]);

  function vote(value: 1 | -1) {
    setNote("");
    const next = state.mine === value ? 0 : value;
    void reactToArticle({ data: { articleId, voterId: voterId(), value: next } })
      .then(setState)
      .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Could not record your vote."));
  }

  const base = "inline-flex min-h-11 items-center gap-2 border px-4 text-sm font-semibold";
  return (
    <div className="mx-auto mt-8 max-w-4xl border-t border-line pt-4">
      <p className="text-sm font-semibold">Was this article useful?</p>
      <div className="mt-2 flex gap-2">
        <button type="button" aria-pressed={state.mine === 1} aria-label="Like" onClick={() => vote(1)} className={`${base} ${state.mine === 1 ? "border-ink bg-ink text-inverse-fg" : "border-line bg-card"}`}>
          <span aria-hidden>👍</span> {state.likes}
        </button>
        <button type="button" aria-pressed={state.mine === -1} aria-label="Dislike" onClick={() => vote(-1)} className={`${base} ${state.mine === -1 ? "border-ink bg-ink text-inverse-fg" : "border-line bg-card"}`}>
          <span aria-hidden>👎</span> {state.dislikes}
        </button>
      </div>
      {note ? <p className="mt-2 text-sm text-accent">{note}</p> : null}
    </div>
  );
}
