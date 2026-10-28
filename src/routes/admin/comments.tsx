import { createFileRoute } from "@tanstack/react-router";
import { CommentDesk } from "@/components/editorial/desk-ui";

export const Route = createFileRoute("/admin/comments")({
  component: CommentDesk,
});
