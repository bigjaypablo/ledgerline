import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MarkdownBody } from "@/components/editorial/markdown-body";
import { RichBody } from "@/components/editorial/rich-body";
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

const ICONS: Record<string, string> = {
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z|M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  pencil: "M4 20h4L19 9l-4-4L4 16z|M13 7l4 4",
  sliders: "M4 6h8|M16 6h4|M4 12h4|M12 12h8|M4 18h10|M18 18h2|M14 4v4|M8 10v4|M16 16v4",
  save: "M5 3h11l3 3v15H5z|M8 3v5h7V3|M8 21v-7h8v7",
  more: "M5 12h.01|M12 12h.01|M19 12h.01",
  close: "M6 6l12 12|M18 6 6 18",
};

function Icon({ n }: { n: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[n].split("|").map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

function IconBtn({ label, icon, onClick, active }: { label: string; icon: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center border ${active ? "border-ink bg-ink text-inverse-fg" : "border-line bg-card"}`}
    >
      <Icon n={icon} />
    </button>
  );
}

function Section({ title, open, children }: { title: string; open?: boolean; children: ReactNode }) {
  return (
    <details open={open} className="border-b border-line py-2">
      <summary className="min-h-11 cursor-pointer py-2 text-sm font-bold tracking-widest uppercase">{title}</summary>
      <div className="space-y-3 pb-3">{children}</div>
    </details>
  );
}

const field = "mt-1 min-h-11 w-full border border-line bg-card px-3";

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
  const [panel, setPanel] = useState(false);
  const [menu, setMenu] = useState(false);
  const [meta, setMeta] = useState<{ categories: { slug: string; name: string }[]; affiliates: { id: string; name: string; approval_status: string }[]; authors: { user_id: string; display_name: string }[] }>({
    categories: [],
    affiliates: [],
    authors: [],
  });
  const skipAutosave = useRef(true);
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

  async function saveNow() {
    const payload = { ...formRef.current, slug: slugify(formRef.current.slug || formRef.current.title) };
    const result = await saveArticle({ data: payload });
    setNote(result.private ? "Saved privately. The live article is unchanged." : "Draft saved");
    if (!articleId) {
      await navigate({ to: "/admin/articles/$articleId", params: { articleId: result.id } });
    }
    return result.id;
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

  const issues = publishErrors({ ...form, slug: form.slug || slugify(form.title) });
  const canPublish = role === "admin" || role === "editor";
  const fail = (fallback: string) => (err: unknown) => setError(err instanceof Error ? err.message : fallback);

  return (
    <main>
      <div className="desk-bar">
        <IconBtn
          label={tab === "write" ? "Preview" : "Back to writing"}
          icon={tab === "write" ? "eye" : "pencil"}
          onClick={() => setTab(tab === "write" ? "preview" : "write")}
        />
        <p className="desk-note" title={note}>
          {status} · {readingMinutes(form.body)} min · {note}
        </p>
        <IconBtn label="Post settings" icon="sliders" onClick={() => setPanel(true)} />
        <IconBtn label="Save" icon="save" onClick={() => void saveNow().catch(fail("Save failed."))} />
        {canPublish ? (
          <button type="button" className="h-10 shrink-0 bg-ink px-3 text-sm font-semibold text-inverse-fg" onClick={() => setConfirming(true)}>
            {status === "published" ? "Update" : "Publish"}
          </button>
        ) : null}
        <div className="relative">
          <IconBtn label="More actions" icon={menu ? "close" : "more"} active={menu} onClick={() => setMenu((m) => !m)} />
          {menu ? (
            <div className="desk-menu">
              {status !== "review" && status !== "published" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenu(false);
                    void saveNow()
                      .then(() => changeArticleStatus({ data: { id: form.id ?? "", status: "review" } }))
                      .then(() => setStatus("review"))
                      .catch(fail("Could not submit."));
                  }}
                >
                  Submit for review
                </button>
              ) : null}
              {canPublish && status === "published" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenu(false);
                    void changeArticleStatus({ data: { id: form.id ?? "", status: "draft" } }).then(() => {
                      setStatus("draft");
                      setNote("Unpublished. The article is now a draft.");
                    });
                  }}
                >
                  Unpublish
                </button>
              ) : null}
              {canPublish ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenu(false);
                    void changeArticleStatus({ data: { id: form.id ?? "", status: "archived" } }).then(() => setStatus("archived"));
                  }}
                >
                  Archive
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {status === "published" ? (
        <p className="mt-3 border border-line bg-card px-3 py-2 text-sm">
          Autosave does not change the public article. Tap Update when the edit should go out.
        </p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-accent">{error}</p> : null}

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
          <RichBody value={form.body} onChange={(body) => setForm((f) => ({ ...f, body }))} compress={compress} onError={setError} />
        </div>
      )}

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

      {panel ? (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label="Close settings" className="absolute inset-0 bg-black/40" onClick={() => setPanel(false)} />
          <aside className="desk-panel" role="dialog" aria-label="Post settings">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-widest uppercase">Post settings</h2>
              <IconBtn label="Close" icon="close" onClick={() => setPanel(false)} />
            </div>

            <Section title="Basics" open>
              <label className="block text-sm font-semibold">
                Slug
                <input value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} className={field} />
              </label>
              <label className="block text-sm font-semibold">
                Category
                <select value={form.categorySlug} onChange={(event) => setForm({ ...form, categorySlug: event.target.value })} className={field}>
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
              <label className="block text-sm font-semibold">
                Label
                <select value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} className={field}>
                  {LABELS.map((label) => (
                    <option key={label}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Tags
                <input value={form.tags.join(", ")} onChange={(event) => setForm({ ...form, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} placeholder="Separate tags by commas" className={field} />
              </label>
              {meta.authors.length > 0 ? (
                <label className="block text-sm font-semibold">
                  Author
                  <select value={form.authorId} onChange={(event) => setForm({ ...form, authorId: event.target.value })} className={field}>
                    {meta.authors.map((author) => (
                      <option key={author.user_id} value={author.user_id}>
                        {author.display_name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </Section>

            <Section title="SEO">
              <label className="block text-sm font-semibold">
                SEO title
                <input value={form.seoTitle} onChange={(event) => setForm({ ...form, seoTitle: event.target.value })} className={field} />
              </label>
              <label className="block text-sm font-semibold">
                SEO description
                <textarea value={form.seoDescription} onChange={(event) => setForm({ ...form, seoDescription: event.target.value })} className="mt-1 min-h-20 w-full border border-line bg-card px-3 py-2" />
              </label>
            </Section>

            <Section title="Cover">
              <label className="block text-sm font-semibold">
                Cover image
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full text-sm"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void onFile(file).catch(fail("Upload failed."));
                  }}
                />
              </label>
              <label className="block text-sm font-semibold">
                Or cover URL
                <input value={form.coverImage.startsWith("data:") ? "" : form.coverImage} placeholder={form.coverImage.startsWith("data:") ? "Uploaded image stored" : "/covers/…"} onChange={(event) => setForm({ ...form, coverImage: event.target.value })} className={field} />
              </label>
              <label className="block text-sm font-semibold">
                Cover alt text
                <input value={form.coverAlt} onChange={(event) => setForm({ ...form, coverAlt: event.target.value })} className={field} />
              </label>
              <label className="block text-sm font-semibold">
                Cover caption
                <input value={form.coverCaption} onChange={(event) => setForm({ ...form, coverCaption: event.target.value })} className={field} />
              </label>
            </Section>

            <Section title="Options">
              <label className="block text-sm font-semibold">
                Last checked
                <input type="date" value={form.lastChecked} onChange={(event) => setForm({ ...form, lastChecked: event.target.value })} className={field} />
              </label>
              <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} />
                Featured lead
              </label>
              <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={form.deepDive} onChange={(event) => setForm({ ...form, deepDive: event.target.checked })} />
                Editor’s pick
              </label>
              <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={form.affiliateDisclosure} onChange={(event) => setForm({ ...form, affiliateDisclosure: event.target.checked })} />
                Show the affiliate disclosure
              </label>
            </Section>

            {meta.affiliates.length > 0 ? (
              <Section title="Affiliates">
                {meta.affiliates.map((item) => (
                  <label key={item.id} className="flex min-h-11 items-center gap-2 text-sm">
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
              </Section>
            ) : null}
          </aside>
        </div>
      ) : null}

      {confirming ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm border border-ink bg-card p-4">
            <p className="font-semibold">Publish this version to the public site?</p>
            <p className="mt-1 text-sm text-muted">Readers will see this headline, body, and source list.</p>
            {issues.length > 0 ? <p className="mt-2 text-sm text-accent">{issues.length} thing(s) still need fixing. Publishing may be blocked.</p> : null}
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
        </div>
      ) : null}
      <p className="sr-only">{statusRef.current}</p>
    </main>
  );
}
