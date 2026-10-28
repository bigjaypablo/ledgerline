import { createFileRoute, notFound } from "@tanstack/react-router";
import { CategoryView } from "@/components/editorial/category-view";
import { ListSkeleton } from "@/components/editorial/skeletons";
import { getCategoryPage } from "@/lib/editorial/public";

export const Route = createFileRoute("/saas")({
  validateSearch: (search: Record<string, unknown>): { page?: number } => {
    const page = Number(search.page);
    if (!Number.isFinite(page) || page <= 1) return {};
    return { page: Math.floor(page) };
  },
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ deps }) => {
    const data = await getCategoryPage({ data: { slug: "saas", page: deps.page } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.category.name ?? "Section"} — Ledgerline` },
      { name: "description", content: loaderData?.category.description ?? "" },
    ],
  }),
  pendingComponent: ListSkeleton,
  pendingMs: 200,
  component: SaasPage,
});

function SaasPage() {
  return <CategoryView data={Route.useLoaderData()} />;
}
