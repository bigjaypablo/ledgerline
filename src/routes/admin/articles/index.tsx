import { createFileRoute } from "@tanstack/react-router";
import { ArticleList } from "@/components/editorial/desk-ui";

export const Route = createFileRoute("/admin/articles/")({
  component: ArticleList,
});
