import { MarkdownBody, TableOfContents } from "@/components/editorial/markdown-body";
import { Standfirst } from "@/components/editorial/standfirst";
import { readingMinutes, safeImageSrc } from "@/lib/editorial/text";
import type { ArticleInput } from "@/lib/editorial/types";

export function ArticlePreview({ form, authorName }: { form: ArticleInput; authorName: string }) {
  const cover = safeImageSrc(form.coverImage);
  const parts = form.coverCaption.split(/\s*Photo:\s*/i);
  const credit = /Photo:/i.test(form.coverCaption) ? form.coverCaption.split(/Photo:\s*/i)[1] : "";
  const sources = form.sources.filter((s) => s.title || s.url);
  return (
    <div className="mt-4 border border-line bg-paper p-4">
      <p className="mb-3 text-xs font-bold tracking-widest text-muted uppercase">Preview — this is how it will look when published</p>
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold tracking-widest text-accent uppercase">{form.label}</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight sm:text-5xl">{form.title || "Untitled"}</h1>
        {form.summary ? <Standfirst className="mt-4 text-xl leading-8" text={form.summary} /> : null}
        <p className="mt-4 text-sm text-muted">
          <span className="font-semibold text-ink">{authorName}</span>
          <span aria-hidden> · </span>
          {readingMinutes(form.body)} min read
        </p>
        {form.lastChecked ? (
          <p className="mt-2 text-sm font-semibold">Last checked {form.lastChecked}</p>
        ) : (
          <p className="mt-2 border border-accent bg-card px-3 py-2 text-sm">Missing a last-checked date. Add one in Post settings.</p>
        )}
        {cover ? (
          <figure className="mt-6">
            <img src={cover} alt={form.coverAlt} className="frame-photo" />
            {form.coverCaption ? (
              <figcaption className="mt-2 text-sm text-muted">
                {parts[0]}
                {credit ? <span className="block text-xs">Photo: {credit}</span> : null}
              </figcaption>
            ) : null}
            {!form.coverAlt ? <p className="mt-1 text-xs text-accent">This cover has no alt text yet.</p> : null}
          </figure>
        ) : (
          <p className="mt-6 border border-line bg-card px-3 py-2 text-sm text-muted">No cover image yet. Add one in Post settings, under Cover.</p>
        )}
        <TableOfContents markdown={form.body} />
        <MarkdownBody markdown={form.body} />
        {form.tags.length > 0 ? <p className="mt-6 text-sm text-muted">Tags: {form.tags.join(", ")}</p> : null}
        {sources.length > 0 ? (
          <section className="mt-10 border-t border-line pt-6">
            <h2 className="font-serif text-3xl font-semibold">Sources</h2>
            {sources.map((source, i) => (
              <div key={i} className="mt-3 border-b border-line pb-3">
                <p className="font-semibold text-accent">{source.title || source.url}</p>
                <p className="text-sm text-muted">
                  {source.publisher} · {source.sourceType}
                  {source.accessedOn ? ` · Accessed ${source.accessedOn}` : ""}
                </p>
                {source.claim ? <p className="mt-1 text-sm">{source.claim}</p> : null}
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
}
