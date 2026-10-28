import { createFileRoute } from "@tanstack/react-router";
import { SearchView } from "@/components/editorial/search-view";
import { ListSkeleton } from "@/components/editorial/skeletons";
import { searchArticles } from "@/lib/editorial/public";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q: string; page?: number } => {
    const page = Number(search.page);
    return {
      q: typeof search.q === "string" ? search.q.slice(0, 120) : "",
      ...(Number.isFinite(page) && page > 1 ? { page: Math.floor(page) } : {}),
    };
  },
  loaderDeps: ({ search }) => ({ q: search.q, page: search.page ?? 1 }),
  loader: ({ deps }) => searchArticles({ data: deps }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.q ? `Search: ${loaderData.q} — Ledgerline` : "Search — Ledgerline",
      },
      { name: "description", content: "Search published Ledgerline research. Drafts are not included." },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  pendingComponent: ListSkeleton,
  pendingMs: 200,
  component: SearchPage,
});

function SearchPage() {
  return <SearchView data={Route.useLoaderData()} />;
}
