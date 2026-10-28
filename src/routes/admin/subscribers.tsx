import { createFileRoute } from "@tanstack/react-router";
import { SubscriberDesk } from "@/components/editorial/desk-ui";

export const Route = createFileRoute("/admin/subscribers")({
  component: SubscriberDesk,
});
