import { createFileRoute } from "@tanstack/react-router";
import { ArticleEditor } from "@/components/editorial/desk-editor";

export const Route = createFileRoute("/admin/articles/new")({
  component: () => <ArticleEditor articleId={null} />,
});
