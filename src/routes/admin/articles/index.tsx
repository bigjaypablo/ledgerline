import { createFileRoute } from "@tanstack/react-router";
import { PostsList as ArticleList } from "@/components/editorial/posts-list";

export const Route = createFileRoute("/admin/articles/")({
  component: ArticleList,
});
