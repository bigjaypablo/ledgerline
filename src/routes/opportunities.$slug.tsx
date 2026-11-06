import { createFileRoute, notFound } from "@tanstack/react-router";
import { OpportunityDetailView } from "@/components/editorial/opportunities/detail/opportunity-detail-view";
import { ListSkeleton } from "@/components/editorial/skeletons";
import { getOpportunity } from "@/lib/editorial/opportunity-detail";

export const Route = createFileRoute("/opportunities/$slug")({
  loader: async ({ params }) => {
    const item = await getOpportunity({ data: { slug: params.slug } });
    if (!item) throw notFound();
    return item;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Airdrop"} airdrop guide — Ledgerline` },
      { name: "description", content: loaderData?.summary ?? "" },
    ],
  }),
  pendingComponent: ListSkeleton,
  pendingMs: 200,
  component: DetailPage,
});

function DetailPage() {
  return <OpportunityDetailView item={Route.useLoaderData()} />;
}
