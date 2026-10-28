import { createFileRoute } from "@tanstack/react-router";
import { PagesDesk } from "@/components/editorial/desk-ui";

export const Route = createFileRoute("/admin/pages")({
  component: PagesDesk,
});
