import { createFileRoute } from "@tanstack/react-router";
import { OpportunitiesView } from "@/components/editorial/opportunities/opportunities-view";
import { ListSkeleton } from "@/components/editorial/skeletons";
import { getOpportunities } from "@/lib/editorial/opportunities";

type Search = { kind?: string; rewardStatus?: string; capital?: string };

const text = (v: unknown) => (typeof v === "string" ? v.slice(0, 20) : "");

export const Route = createFileRoute("/opportunities/")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const out: Search = {};
    if (text(search.kind)) out.kind = text(search.kind);
    if (text(search.rewardStatus)) out.rewardStatus = text(search.rewardStatus);
    if (text(search.capital)) out.capital = text(search.capital);
    return out;
  },
  loaderDeps: ({ search }) => ({
    kind: search.kind ?? "",
    rewardStatus: search.rewardStatus ?? "",
    capital: search.capital ?? "",
  }),
  loader: ({ deps }) => getOpportunities({ data: deps }),
  head: () => ({
    meta: [
      { title: "Verified Airdrops — Ledgerline" },
      {
        name: "description",
        content: "Testnets, points programs and airdrops verified against official sources, with capital and risk notes.",
      },
    ],
  }),
  pendingComponent: ListSkeleton,
  pendingMs: 200,
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  return <OpportunitiesView data={Route.useLoaderData()} />;
}
