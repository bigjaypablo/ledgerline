import { createFileRoute } from "@tanstack/react-router";
import { ArchiveView } from "@/components/editorial/archive-view";
import { ListSkeleton } from "@/components/editorial/skeletons";
import { getArchive } from "@/lib/editorial/public";

export const Route = createFileRoute("/archive")({
  validateSearch: (search: Record<string, unknown>): { page?: number; category?: string } => {
    const page = Number(search.page);
    const category = typeof search.category === "string" ? search.category.slice(0, 40) : "";
    return {
      ...(Number.isFinite(page) && page > 1 ? { page: Math.floor(page) } : {}),
      ...(category ? { category } : {}),
    };
  },
  loaderDeps: ({ search }) => ({ page: search.page ?? 1, category: search.category ?? "" }),
  loader: ({ deps }) => getArchive({ data: deps }),
  head: () => ({
    meta: [
      { title: "Archive — Ledgerline" },
      { name: "description", content: "Browse published Ledgerline research by section." },
    ],
  }),
  pendingComponent: ListSkeleton,
  pendingMs: 200,
  component: ArchivePage,
});

function ArchivePage() {
  return <ArchiveView data={Route.useLoaderData()} />;
}
