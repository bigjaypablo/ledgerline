import type { ReactNode } from "react";
import { IconBtn } from "@/components/editorial/icons";
import { LABELS, slugify } from "@/lib/editorial/text";
import type { ArticleInput } from "@/lib/editorial/types";

export type EditorMeta = {
  categories: { slug: string; name: string }[];
  affiliates: { id: string; name: string; approval_status: string }[];
  authors: { user_id: string; display_name: string }[];
};

const FALLBACK_CATEGORIES = [
  { slug: "crypto", name: "Crypto" },
  { slug: "ai", name: "AI" },
  { slug: "saas", name: "SaaS" },
  { slug: "guides", name: "Guides" },
  { slug: "comparisons", name: "Comparisons" },
  { slug: "research", name: "Research" },
];

const field = "mt-1 min-h-11 w-full border border-line bg-card px-3";
const area = "mt-1 min-h-20 w-full border border-line bg-card px-3 py-2";

function Section({ title, open, children }: { title: string; open?: boolean; children: ReactNode }) {
  return (
    <details open={open} className="border-b border-line py-2">
      <summary className="min-h-11 cursor-pointer py-2 text-sm font-bold tracking-widest uppercase">{title}</summary>
      <div className="space-y-3 pb-3">{children}</div>
    </details>
  );
}

type Props = {
  form: ArticleInput;
  meta: EditorMeta;
  onChange: (next: ArticleInput) => void;
  onCover: (file: File) => void;
  onClose: () => void;
};

export function SettingsPanel({ form, meta, onChange, onCover, onClose }: Props) {
  const set = (change: Partial<ArticleInput>) => onChange({ ...form, ...change });
  const categories = meta.categories.length ? meta.categories : FALLBACK_CATEGORIES;
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close settings" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="desk-panel" role="dialog" aria-label="Post settings">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-widest uppercase">Post settings</h2>
          <IconBtn label="Close" icon="close" onClick={onClose} />
        </div>

        <Section title="Basics" open>
          <label className="block text-sm font-semibold">
            Slug
            <input value={form.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} className={field} />
          </label>
          <label className="block text-sm font-semibold">
            Category
            <select value={form.categorySlug} onChange={(e) => set({ categorySlug: e.target.value })} className={field}>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Label
            <select value={form.label} onChange={(e) => set({ label: e.target.value })} className={field}>
              {LABELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Tags
            <input
              value={form.tags.join(", ")}
              onChange={(e) => set({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
              placeholder="Separate tags by commas"
              className={field}
            />
          </label>
          {meta.authors.length > 0 ? (
            <label className="block text-sm font-semibold">
              Author
              <select value={form.authorId} onChange={(e) => set({ authorId: e.target.value })} className={field}>
                {meta.authors.map((a) => (
                  <option key={a.user_id} value={a.user_id}>
                    {a.display_name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </Section>

        <Section title="SEO">
          <label className="block text-sm font-semibold">
            SEO title
            <input value={form.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} className={field} />
          </label>
          <label className="block text-sm font-semibold">
            SEO description
            <textarea value={form.seoDescription} onChange={(e) => set({ seoDescription: e.target.value })} className={area} />
          </label>
        </Section>

        <Section title="Cover">
          <label className="block text-sm font-semibold">
            Cover image
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onCover(file);
              }}
            />
          </label>
          <label className="block text-sm font-semibold">
            Or cover URL
            <input
              value={form.coverImage.startsWith("data:") ? "" : form.coverImage}
              placeholder={form.coverImage.startsWith("data:") ? "Uploaded image stored" : "/covers/…"}
              onChange={(e) => set({ coverImage: e.target.value })}
              className={field}
            />
          </label>
          <label className="block text-sm font-semibold">
            Cover alt text
            <input value={form.coverAlt} onChange={(e) => set({ coverAlt: e.target.value })} className={field} />
          </label>
          <label className="block text-sm font-semibold">
            Cover caption
            <input value={form.coverCaption} onChange={(e) => set({ coverCaption: e.target.value })} className={field} />
          </label>
        </Section>

        <Section title="Options">
          <label className="block text-sm font-semibold">
            Last checked
            <input type="date" value={form.lastChecked} onChange={(e) => set({ lastChecked: e.target.value })} className={field} />
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={form.featured} onChange={(e) => set({ featured: e.target.checked })} />
            Featured lead
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={form.deepDive} onChange={(e) => set({ deepDive: e.target.checked })} />
            Editor’s pick
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={form.affiliateDisclosure} onChange={(e) => set({ affiliateDisclosure: e.target.checked })} />
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
                  onChange={(e) =>
                    set({
                      affiliateIds: e.target.checked ? [...form.affiliateIds, item.id] : form.affiliateIds.filter((id) => id !== item.id),
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
  );
}
