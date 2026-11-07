import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { findArticles } from "@/lib/editorial/article-search";

type Hit = { slug: string; title: string };

export function ArticleLinkPicker(p: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPick: (slug: string, title: string) => void;
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);

  useEffect(() => {
    if (!p.open) return;
    let live = true;
    const t = window.setTimeout(() => {
      findArticles({ data: { q } })
        .then((r) => live && setHits(r))
        .catch(() => live && setHits([]));
    }, 250);
    return () => {
      live = false;
      window.clearTimeout(t);
    };
  }, [q, p.open]);

  return (
    <Dialog.Root open={p.open} onOpenChange={p.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto border-t border-ink bg-card p-5 font-sans text-ink">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-xl font-medium">
              Link to an article
            </Dialog.Title>
            <Dialog.Close
              className="inline-flex min-h-11 min-w-11 items-center justify-center"
              aria-label="Close"
            >
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Search published articles and insert a link.
          </Dialog.Description>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by headline…"
            className="mt-3 min-h-12 w-full border border-line bg-paper px-3"
          />
          <ul className="mt-3 divide-y divide-line">
            {hits.map((h) => (
              <li key={h.slug}>
                <button
                  type="button"
                  className="min-h-12 w-full py-2 text-left text-base"
                  onClick={() => {
                    p.onPick(h.slug, h.title);
                    p.onOpenChange(false);
                  }}
                >
                  {h.title}
                </button>
              </li>
            ))}
            {hits.length === 0 ? (
              <li className="py-3 text-sm text-muted">No articles found.</li>
            ) : null}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
