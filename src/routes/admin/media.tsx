import { createFileRoute } from "@tanstack/react-router";
import { MediaDesk } from "@/components/editorial/desk-ui";

export const Route = createFileRoute("/admin/media")({
  component: MediaDesk,
});
