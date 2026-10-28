import { createFileRoute } from "@tanstack/react-router";
import { AffiliateDesk } from "@/components/editorial/desk-ui";

export const Route = createFileRoute("/admin/affiliates")({
  component: AffiliateDesk,
});
