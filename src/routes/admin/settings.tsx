import { createFileRoute } from "@tanstack/react-router";
import { SettingsDesk } from "@/components/editorial/desk-ui";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsDesk,
});
