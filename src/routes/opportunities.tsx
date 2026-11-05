import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { OpportunitiesView } from "@/components/editorial/opportunities/opportunities-view";

const opportunitiesSearchSchema = z.object({
  kind: z.string().optional().catch(undefined),
  rewardStatus: z.string().optional().catch(undefined),
  capital: z.string().optional().catch(undefined),
});

export type OpportunitiesSearch = z.infer<typeof opportunitiesSearchSchema>;

export const Route = createFileRoute("/opportunities")({
  validateSearch: (search) => opportunitiesSearchSchema.parse(search),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const search = Route.useSearch();
  return <OpportunitiesView search={search} />;
}
