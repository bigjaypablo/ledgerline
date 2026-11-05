import { createFileRoute } from "@tanstack/react-router";
import { OpportunitiesDesk } from "@/components/editorial/opportunities/desk/opportunities-desk";

export const Route = createFileRoute("/admin/opportunities")({
  component: OpportunitiesDesk,
});
