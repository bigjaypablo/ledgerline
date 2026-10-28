import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MarkdownBody } from "@/components/editorial/markdown-body";
import { changeArticleStatus, getAdminArticle, getEditorMeta, saveArticle } from "@/lib/editorial/admin";
import { LABELS, publishErrors, readingMinutes, slugify } from "@/lib/editorial/text";
import type { ArticleInput, ArticleStatus, SourceInput } from "@/lib/editorial/types";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const emptySource = (): SourceInput => ({
  title: "",
  publisher: "",
  url: "",
  sourceType: "Primary documentation",
  publishedOn: "",
  accessedOn: "",
  claim: "",
});

function blank(): ArticleInput {
  return {
    id: null,
    slug: "",
    title: "",
    summary: "",
    body: "",
    categorySlug: "research",
    label: "Practical guide",
    seoTitle: "",
    seoDescription: "",
    coverImage: "",
    coverAlt: "",
    coverCaption: "",
    featured: false,
    deepDive: false,
    lastChecked: "",
    affiliateDisclosure: false,
    tags: [],
    sources: [emptySource()],
    affiliateIds: [],
    authorId: "",
  };
}

export function ArticleEditor({ articleId }: { articleId: string | null }) {
  const navigate = useNavigate();
  const { user } = useCurrentUserState();
  const [form, setForm] = useState<ArticleInput>(blank);
  const [status, setStatus] = useState<ArticleStatus>("draft");
  const [role, setRole] = useState("writer");
  const [note, setNote] = useState("Not saved yet");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [ready, setReady] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [meta, setMeta] = useState<{ categories: { slug: string; name: string }[]; affiliates: { id: string; name: string; approval_status: string }[]; authors: { user_id: string; display_name: string }[] }>({
    categories: [],
    affiliates: [],
    authors: [],
  });
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const skipAutosave = useRef(true);
  const undoRef = useRef<string[]>([]);
  const redoRef = useRef<string[]>([]);
  const snapshot = useRef("");
  const skipSnapshot = useRef(true);
  const formRef = useRef(form);
  formRef.current = form;
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    if (!user?.id) return;
    let live = true;
    const opened = articleId
      ? getAdminArticle({ data: { id: articleId } })
      : getEditorMeta().then((meta) => ({
          draft: null,
          status: "draft" as const,
          role: meta.role,
          categories: meta.categories,
          affiliates: meta.affiliates,
          authors: meta.authors,
          hasUnpublishedEdits: false,
        }));
    opened
      .then((result) => {
        if (!live || !result) return;
        if (result.draft) setForm(result.draft);
        setStatus(result.status);
        setRole(result.role);
        setMeta({
          categories: result.categories,
          affiliates: result.affiliates.map((item) => ({
            id: item.id,
            name: item.name,
            approval_status: item.approval_status,
          })),
          authors: result.authors.map((item) => ({ user_id: item.user_id, display_name: item.display_name })),
        });
        setNote(result.hasUnpublishedEdits ? "Unpublished edits stored privately" : "Loaded");
        skipAutosave.current = true;
        setReady(true);
      })
      .catch((err: unknown) => {
        if (live) setError(err instanceof Error ? err.message : "Could not open the article.");
      });
    return () => {
      live = false;
    };
  }, [user?.id, articleId]);

  useEffect(() => {
    if (!user?.id || !articleId || !ready) return;
    if (skipAutosave.current) {
      skipAutosave.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      void saveArticle({ data: formRef.current })
        .then((result) => {
          setNote(result.private ? "Saved privately. The live article is unchanged." : "Draft saved");
          setError("");
        })
        .catch((err: unknown) => {
          setNote(err instanceof Error ? err.message : "Save failed. Your text is still in this tab.");
        });
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [form, user?.id, articleId, ready]);

  useEffect(() => {
    if (skipSnapshot.current) {
      skipSnapshot.current = false;
      snapshot.current = form.body;
      return;
    }
    const timer = window.setTimeout(() => {
      if (snapshot.current === form.body) return;
      undoRef.current.push(snapshot.current);
      if (undoRef.current.length > 80) undoRef.current.shift();
      redoRef.current = [];
      snapshot.current = form.body;
    }, 700);
    return () => window.clearTimeout(timer);
  }, [form.body]);

  async function saveNow() {
    const payload = { ...formRef.current, slug: slugify(formRef.current.slug || formRef.current.title) };
    const result = await saveArticle({ data: payload });
    setNote(result.private ? "Saved privately. The live article is unchanged." : "Draft saved");
    if (!articleId) {
      await navigate({ to: "/admin/articles/$articleId", params: { articleId: result.id } });
    }
    return result.id;
  }

  function insert(snippet: string) {
    const current = formRef.current.body;
    const el = bodyRef.current;
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    const next = current.slice(0, start) + snippet + current.slice(end);
    undoRef.current.push(current);
    redoRef.current = [];
    snapshot.current = next;
    skipSnapshot.current = true;
    setForm({ ...formRef.current, body: next });
    window.requestAnimationFrame(() => {
      const node = bodyRef.current;
      if (!node) return;
      const pos = start + snippet.length;
      node.focus();
      node.setSelectionRange(pos, pos);
    });
  }

  function undo() {
    const prev = undoRef.current.pop();
    if (prev === undefined) return;
    redoRef.current.push(formRef.current.body);
    snapshot.current = prev;
    skipSnapshot.current = true;
    setForm({ ...formRef.current, body: prev });
  }

  function redo() {
    const next = redoRef.current.pop();
    if (next === undefined) return;
    undoRef.current.push(formRef.current.body);
    snapshot.current = next;
    skipSnapshot.current = true;
    setForm({ ...formRef.current, body: next });
  }

  function markdownTable(rows: number, cols: number) {
    const rowCount = Math.min(8, Math.max(1, rows));
    const colCount = Math.min(6, Math.max(2, cols));
    const head = Array.from({ length: colCount }, (_, index) => `Column ${index + 1}`).join(" | ");
    const rule = Array.from({ length: colCount }, () => "---").join(" | ");
    const body = Array.from({ length: rowCount }, () => Array.from({ length: colCount }, () => " ").join(" | "));
    return `\n\n| ${head} |\n| ${rule} |\n${body.map((line) => `| ${line} |`).join("\n")}\n`;
  }

  async function compress(file: File) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not read that image.");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL("image/jpeg", 0.82);
    if (url.length > 1_500_000) throw new Error("That image is still too large.");
    return url;
  }

  async function onFile(file: File) {
    setForm({ ...form, coverImage: await compress(file) });
  }

  async function onInlineImage(file: File) {
    const url = await compress(file);
    const alt = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 80) || "Image";
    insert(`\n\n![${alt}](${url})\n`);
  }

  const issues = publishErrors({ ...form, slug: form.slug || slugify(form.title) });
  const canPublish = role === "admin" || role === "editor";

  return (
    <main>
      <p className="text-xs font-bold tracking-widest uppercase text-muted">
        {status} · {readingMinutes(form.body)} min · {note}
      </p>
      {status === "published" ? (
        <p className="mt-2 border border-line bg-card px-3 py-2 text-sm">
          Autosave does not change the public article. Use “Update live version” when the edit should go out.
        </p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-accent">{error}</p> : null}
      <div className="mt-4 flex gap-2">
        <button type="button" className="min-h-11 border border-line px-3 text-sm" onClick={() => setTab("write")}>
          Write
        </button>
        <button type="button" className="min-h-11 border border-line px-3 text-sm" onClick={() => setTab("preview")}>
          Preview
        </button>
      </div>
      {tab === "preview" ? (
        <div className="mt-4 border border-line bg-card p-4">
          <h1 className="font-serif text-4xl font-semibold">{form.title || "Untitled"}</h1>
          <p className="mt-3 text-lg">{form.summary}</p>
          <div className="mt-4">
            <MarkdownBody markdown={form.body} />
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-semibold">
            Headline
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value, slug: form.slug || slugify(event.target.value) })} className="mt-1 min-h-12 w-full border border-line bg-card px-3 font-serif text-2xl" />
          </label>
          <label className="block text-sm font-semibold">
            Standfirst
            <textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} className="mt-1 min-h-24 w-full border border-line bg-card px-3 py-2" />
          </label>
          <div className="border border-line bg-card p-3">
            <p className="text-xs font-bold tracking-widest uppercase text-muted">Insert</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="min-h-11 border border-line px-2 text-sm" onClick={undo}>
                Undo
              </button>
              <button type="button" className="min-h-11 border border-line px-2 text-sm" onClick={redo}>
                Redo
              </button>
              {[
                ["H2", "\n\n## "],
                ["H3", "\n\n### "],
                ["Bold", "**bold**"],
                ["Italic", "*italic*"],
                ["List", "\n- "],
                ["Numbered", "\n1. "],
                ["Quote", "\n\n> "],
                ["Link", "[text](https://)"],
                ["Code", "\n\n```\n\n```\n"],
                ["Rule", "\n\n---\n"],
              ].map(([label, snippet]) => (
                <button key={label} type="button" className="min-h-11 border border-line px-2 text-sm" onClick={() => insert(snippet)}>
                  {label}
                </button>
              ))}
              <button type="button" className="min-h-11 border border-line px-2 text-sm" onClick={() => imageRef.current?.click()}>
                Image
              </button>
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void onInlineImage(file).catch((err: unknown) => setError(err instanceof Error ? err.message : "Upload failed."));
                }}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="text-sm font-semibold">
                Rows
                <input type="number" min={1} max={8} value={tableRows} onChange={(event) => setTableRows(Number(event.target.value))} className="mt-1 block min-h-11 w-20 border border-line px-2" />
              </label>
              <label className="text-sm font-semibold">
                Columns
                <input type="number" min={2} max={6} value={tableCols} onChange={(event) => setTableCols(Number(event.target.value))} className="mt-1 block min-h-11 w-20 border border-line px-2" />
              </label>
              <button type="button" className="min-h-11 bg-ink px-3 text-sm font-semibold text-inverse-fg" onClick={() => insert(markdownTable(tableRows, tableCols))}>
                Insert table
              </button>
            </div>
          </div>
          <textarea
            ref={bodyRef}
            value={form.body}
            onChange={(event) => setForm({ ...form, body: event.target.value })}
            className="min-h-80 w-full border border-line bg-card px-3 py-2 font-mono text-sm"
            aria-label="Markdown body"
          />
        </div>
      )}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <label className="text-sm font-semibold">
          Slug
          <input value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} className="mt-1 min-h-11 w-full border border-line bg-card px-3" />
        </label>
        <label className="text-sm font-semibold">
          Category
          <select value={form.categorySlug} onChange={(event) => setForm({ ...form, categorySlug: event.target.value })} className="mt-1 min-h-11 w-full border border-line bg-card px-2">
            {(meta.categories.length
              ? meta.categories
              : [
                  { slug: "crypto", name: "Crypto" },
                  { slug: "ai", name: "AI" },
                  { slug: "saas", name: "SaaS" },
                  { slug: "guides", name: "Guides" },
                  { slug: "comparisons", name: "Comparisons" },
                  { slug: "research", name: "Research" },
                ]
            ).map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Label
          <select value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} className="mt-1 min-h-11 w-full border border-line bg-card px-2">
            {LABELS.map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Last checked
          <input type="date" value={form.lastChecked} onChange={(event) => setForm({ ...form, lastChecked: event.target.value })} className="mt-1 min-h-11 w-full border border-line bg-card px-3" />
        </label>
        <label className="text-sm font-semibold">
          SEO title
          <input value={form.seoTitle} onChange={(event) => setForm({ ...form, seoTitle: event.target.value })} className="mt-1 min-h-11 w-full border border-line bg-card px-3" />
        </label>
        <label className="text-sm font-semibold">
          SEO description
          <input value={form.seoDescription} onChange={(event) => setForm({ ...form, seoDescription: event.target.value })} className="mt-1 min-h-11 w-full border border-line bg-card px-3" />
        </label>
        <label className="text-sm font-semibold">
          Tags
          <input value={form.tags.join(", ")} onChange={(event) => setForm({ ...form, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} className="mt-1 min-h-11 w-full border border-line bg-card px-3" />
        </label>
        {meta.authors.length > 0 ? (
          <label className="text-sm font-semibold">
            Author
            <select value={form.authorId} onChange={(event) => setForm({ ...form, authorId: event.target.value })} className="mt-1 min-h-11 w-full border border-line bg-card px-2">
              {meta.authors.map((author) => (
                <option key={author.user_id} value={author.user_id}>
                  {author.display_name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} />
          Featured lead
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={form.deepDive} onChange={(event) => setForm({ ...form, deepDive: event.target.checked })} />
          Editor’s pick
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold md:col-span-2">
          <input type="checkbox" checked={form.affiliateDisclosure} onChange={(event) => setForm({ ...form, affiliateDisclosure: event.target.checked })} />
          Show the affiliate disclosure on this article
        </label>
        <label className="text-sm font-semibold">
          Cover image
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void onFile(file).catch((err: unknown) => setError(err instanceof Error ? err.message : "Upload failed."));
            }}
          />
        </label>
        <label className="text-sm font-semibold">
          Or cover URL
          <input value={form.coverImage.startsWith("data:") ? "" : form.coverImage} placeholder={form.coverImage.startsWith("data:") ? "Uploaded image stored" : "/covers/…"} onChange={(event) => setForm({ ...form, coverImage: event.target.value })} className="mt-1 min-h-11 w-full border border-line bg-card px-3" />
        </label>
        <label className="text-sm font-semibold">
          Cover alt text
          <input value={form.coverAlt} onChange={(event) => setForm({ ...form, coverAlt: event.target.value })} className="mt-1 min-h-11 w-full border border-line bg-card px-3" />
        </label>
        <label className="text-sm font-semibold">
          Cover caption
          <input value={form.coverCaption} onChange={(event) => setForm({ ...form, coverCaption: event.target.value })} className="mt-1 min-h-11 w-full border border-line bg-card px-3" />
        </label>
      </div>
      {meta.affiliates.length > 0 ? (
        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Affiliate records to show</legend>
          {meta.affiliates.map((item) => (
            <label key={item.id} className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.affiliateIds.includes(item.id)}
                onChange={(event) =>
                  setForm({
                    ...form,
                    affiliateIds: event.target.checked
                      ? [...form.affiliateIds, item.id]
                      : form.affiliateIds.filter((id) => id !== item.id),
                  })
                }
              />
              {item.name} ({item.approval_status})
            </label>
          ))}
        </fieldset>
      ) : null}
      <section className="mt-6">
        <h2 className="font-serif text-2xl font-semibold">Sources</h2>
        {form.sources.map((source, index) => (
          <div key={index} className="mt-3 grid gap-2 border border-line bg-card p-3 md:grid-cols-2">
            {(
              [
                ["title", "Title"],
                ["publisher", "Publisher"],
                ["url", "URL"],
                ["sourceType", "Source type"],
                ["publishedOn", "Published"],
                ["accessedOn", "Accessed"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="text-sm font-semibold">
                {label}
                <input
                  type={key.endsWith("On") ? "date" : "text"}
                  value={source[key]}
                  onChange={(event) => {
                    const sources = form.sources.slice();
                    sources[index] = { ...source, [key]: event.target.value };
                    setForm({ ...form, sources });
                  }}
                  className="mt-1 min-h-11 w-full border border-line px-3"
                />
              </label>
            ))}
            <label className="text-sm font-semibold md:col-span-2">
              Claim this source supports
              <textarea
                value={source.claim}
                onChange={(event) => {
                  const sources = form.sources.slice();
                  sources[index] = { ...source, claim: event.target.value };
                  setForm({ ...form, sources });
                }}
                className="mt-1 min-h-20 w-full border border-line px-3 py-2"
              />
            </label>
          </div>
        ))}
        <button type="button" className="mt-3 min-h-11 border border-line px-3 text-sm" onClick={() => setForm({ ...form, sources: [...form.sources, emptySource()] })}>
          Add source
        </button>
      </section>
      {issues.length > 0 && canPublish ? (
        <ul className="mt-4 list-disc pl-5 text-sm text-muted">
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-11 border border-ink px-4 text-sm font-semibold"
          onClick={() => void saveNow().catch((err: unknown) => setError(err instanceof Error ? err.message : "Save failed."))}
        >
          Save
        </button>
        {status !== "review" && status !== "published" ? (
          <button
            type="button"
            className="min-h-11 border border-line px-4 text-sm font-semibold"
            onClick={() =>
              void saveNow()
                .then(() => changeArticleStatus({ data: { id: form.id ?? "", status: "review" } }))
                .then(() => setStatus("review"))
                .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not submit."))
            }
          >
            Submit for review
          </button>
        ) : null}
        {canPublish ? (
          <button type="button" className="min-h-11 bg-ink px-4 text-sm font-semibold text-inverse-fg" onClick={() => setConfirming(true)}>
            {status === "published" ? "Update live version" : "Publish"}
          </button>
        ) : null}
        {canPublish && status === "published" ? (
          <button
            type="button"
            className="min-h-11 border border-line px-4 text-sm"
            onClick={() =>
              void changeArticleStatus({ data: { id: form.id ?? "", status: "draft" } }).then(() => {
                setStatus("draft");
                setNote("Unpublished. The article is now a draft.");
              })
            }
          >
            Unpublish
          </button>
        ) : null}
        {canPublish ? (
          <button
            type="button"
            className="min-h-11 border border-line px-4 text-sm"
            onClick={() => void changeArticleStatus({ data: { id: form.id ?? "", status: "archived" } }).then(() => setStatus("archived"))}
          >
            Archive
          </button>
        ) : null}
      </div>
      {confirming ? (
        <div className="mt-4 border border-ink bg-card p-4">
          <p className="font-semibold">Publish this version to the public site?</p>
          <p className="mt-1 text-sm text-muted">Readers will see this headline, body, and source list.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="min-h-11 bg-ink px-4 text-sm font-semibold text-inverse-fg"
              onClick={() =>
                void changeArticleStatus({
                  data: { id: form.id ?? "", status: "published", payload: { ...form, slug: form.slug || slugify(form.title) } },
                })
                  .then(() => {
                    setStatus("published");
                    setConfirming(false);
                    setNote("Live version updated.");
                  })
                  .catch((err: unknown) => {
                    setConfirming(false);
                    setError(err instanceof Error ? err.message : "Publish blocked.");
                  })
              }
            >
              Confirm publish
            </button>
            <button type="button" className="min-h-11 border border-line px-4 text-sm" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      <p className="sr-only">{statusRef.current}</p>
    </main>
  );
}
