import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArticlePreview } from "@/components/editorial/article-preview";
import { RichBody } from "@/components/editorial/rich-body";
import { DeskTopBar } from "@/components/editorial/desk-top-bar";
import { SettingsPanel, type EditorMeta } from "@/components/editorial/settings-panel";
import { SourcesEditor, emptySource } from "@/components/editorial/sources-editor";
import { PublishDialog } from "@/components/editorial/publish-dialog";
import { changeArticleStatus, getAdminArticle, getEditorMeta, saveArticle, uploadImage } from "@/lib/editorial/admin";
import { publishErrors, readingMinutes, slugify } from "@/lib/editorial/text";
import type { ArticleInput, ArticleStatus } from "@/lib/editorial/types";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

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

const DRAFT_KEY = "ledgerline:new-draft";
const ZOOM_KEY = "ledgerline:desk-zoom";

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

// Upload to Blob and return a short link; fall back to the embedded image if the upload fails.
async function storeImage(file: File) {
  const dataUrl = await compress(file);
  try {
    const { url } = await uploadImage({ data: { dataUrl } });
    return url;
  } catch (err) {
    window.alert("Blob upload failed: " + (err instanceof Error ? err.message : String(err)));
    return dataUrl;
  }
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
  const [panel, setPanel] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [meta, setMeta] = useState<EditorMeta>({ categories: [], affiliates: [], authors: [] });
  const skipAutosave = useRef(true);
  const formRef = useRef(form);
  formRef.current = form;

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
        let restored = false;
        if (result.draft) setForm(result.draft);
        else if (!articleId) {
          try {
            const raw = window.localStorage.getItem(DRAFT_KEY);
            const saved = raw ? (JSON.parse(raw) as Partial<ArticleInput>) : null;
            if (saved && Array.isArray(saved.sources)) {
              setForm({ ...blank(), ...saved });
              restored = true;
            }
          } catch {
            /* ignore unreadable backup */
          }
        }
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
        setNote(restored ? "Recovered your unsaved draft" : result.hasUnpublishedEdits ? "Unpublished edits stored privately" : "Loaded");
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
    if (articleId || !ready) return;
    const timer = window.setTimeout(() => {
      try {
        if (form.title || form.summary || form.body) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      } catch {
        /* storage full: skip the backup */
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [form, articleId, ready]);

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(ZOOM_KEY));
      if (saved >= 60 && saved <= 130) setZoom(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${zoom}%`;
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [zoom]);

  function changeZoom(next: number) {
    const value = Math.min(130, Math.max(60, next));
    setZoom(value);
    try {
      window.localStorage.setItem(ZOOM_KEY, String(value));
    } catch {
      /* ignore */
    }
  }

  async function saveNow(stay = false) {
    const payload = { ...formRef.current, slug: slugify(formRef.current.slug || formRef.current.title) };
    const result = await saveArticle({ data: payload });
    setNote(result.private ? "Saved privately. The live article is unchanged." : "Draft saved");
    if (!articleId) {
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      if (!stay) await navigate({ to: "/admin/articles/$articleId", params: { articleId: result.id } });
    }
    return result.id;
  }

  const fail = (fallback: string) => (err: unknown) => setError(err instanceof Error ? err.message : fallback);
  const setStatusTo = (next: ArticleStatus, id: string = articleId ?? form.id ?? "") => changeArticleStatus({ data: { id, status: next } });

  function publishNow() {
    const payload = { ...formRef.current, slug: formRef.current.slug || slugify(formRef.current.title) };
    void (articleId ? Promise.resolve(articleId) : saveNow(true))
      .then((id) => changeArticleStatus({ data: { id, status: "published", payload: { ...payload, id } } }).then(() => id))
      .then((id) => {
        setStatus("published");
        setConfirming(false);
        setNote("Live version updated.");
        setJustPublished(true);
        if (!articleId) void navigate({ to: "/admin/articles/$articleId", params: { articleId: id } });
      })
      .catch((err: unknown) => {
        setConfirming(false);
        setError(err instanceof Error ? err.message : "Publish blocked.");
      });
  }

  const issues = publishErrors({ ...form, slug: form.slug || slugify(form.title) });
  const canPublish = role === "admin" || role === "editor";

  return (
    <main>
      <DeskTopBar
        tab={tab}
        onTab={() => setTab(tab === "write" ? "preview" : "write")}
        note={`${status} · ${readingMinutes(form.body)} min · ${note}`}
        canPublish={canPublish}
        published={status === "published"}
        canSubmit={status !== "review" && status !== "published"}
        onSettings={() => setPanel(true)}
        onSave={() => void saveNow().catch(fail("Save failed."))}
        onPublish={() => setConfirming(true)}
        onSubmit={() =>
          void saveNow()
            .then((id) => setStatusTo("review", id))
            .then(() => setStatus("review"))
            .catch(fail("Could not submit."))
        }
        onUnpublish={() =>
          void setStatusTo("draft").then(() => {
            setStatus("draft");
            setNote("Unpublished. The article is now a draft.");
          })
        }
        onArchive={() => void setStatusTo("archived").then(() => setStatus("archived"))}
        zoom={zoom}
        onZoom={changeZoom}
      />

      {justPublished ? (
        <div className="mt-3 flex items-center gap-2 border border-ink bg-card px-3 py-2">
          <p className="flex-1 text-sm font-semibold">Published. The live article is updated.</p>
          <button type="button" className="min-h-11 bg-ink px-3 text-sm font-semibold text-inverse-fg" onClick={() => window.location.assign("/admin/articles/new")}>
            Write next post
          </button>
          <button type="button" className="min-h-11 border border-line px-3 text-sm" onClick={() => setJustPublished(false)}>
            Dismiss
          </button>
        </div>
      ) : null}
      {status === "published" ? (
        <p className="mt-3 border border-line bg-card px-3 py-2 text-sm">
          Autosave does not change the public article. Tap Update when the edit should go out.
        </p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-accent">{error}</p> : null}

      {tab === "preview" ? (
        <ArticlePreview form={form} authorName={meta.authors.find((a) => a.user_id === form.authorId)?.display_name || user?.name || "Author"} />
      ) : (
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-semibold">
            Headline
            <input
              value={form.title}
              placeholder="Write a clear headline"
              onChange={(event) => setForm({ ...form, title: event.target.value, slug: form.slug || slugify(event.target.value) })}
              className="mt-1 min-h-12 w-full border border-line bg-card px-3 font-serif text-2xl"
            />
          </label>
          <label className="block text-sm font-semibold">
            Standfirst
            <textarea value={form.summary} placeholder="One or two sentences that sum up the article" onChange={(event) => setForm({ ...form, summary: event.target.value })} className="mt-1 min-h-24 w-full border border-line bg-card px-3 py-2" />
            <span className="mt-1 block text-xs font-normal text-muted">Press Enter twice for a new paragraph. Use *italic* or **bold**.</span>
          </label>
          <RichBody value={form.body} onChange={(body) => setForm((f) => ({ ...f, body }))} compress={storeImage} onError={setError} />
        </div>
      )}

      <SourcesEditor form={form} onChange={setForm} />

      {issues.length > 0 && canPublish ? (
        <ul className="mt-4 list-disc pl-5 text-sm text-muted">
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      ) : null}

      {panel ? (
        <SettingsPanel
          form={form}
          meta={meta}
          onChange={setForm}
          onCover={(file) => void storeImage(file).then((coverImage) => setForm((f) => ({ ...f, coverImage }))).catch(fail("Upload failed."))}
          onClose={() => setPanel(false)}
        />
      ) : null}
      {confirming ? <PublishDialog issues={issues.length} onConfirm={publishNow} onCancel={() => setConfirming(false)} /> : null}
    </main>
  );
}
