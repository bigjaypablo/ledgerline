import { createFileRoute } from "@tanstack/react-router";
import { ArticleEditor } from "@/components/editorial/desk-editor";

export const Route = createFileRoute("/admin/articles/$articleId")({
  component: EditArticle,
});

function EditArticle() {
  const { articleId } = Route.useParams();
  return <ArticleEditor articleId={articleId} />;
}
