import { createFileRoute } from "@tanstack/react-router";
import { DeskHome } from "@/components/editorial/desk-ui";

export const Route = createFileRoute("/admin/")({
  component: DeskHome,
});
