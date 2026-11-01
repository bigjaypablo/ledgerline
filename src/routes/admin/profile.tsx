import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/editorial/profile-page";

export const Route = createFileRoute("/admin/profile")({
  component: ProfilePage,
});
