import { createFileRoute } from "@tanstack/react-router";
import { MessageDesk } from "@/components/editorial/desk-ui";

export const Route = createFileRoute("/admin/messages")({
  component: MessageDesk,
});
