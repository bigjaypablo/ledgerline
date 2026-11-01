import { createFileRoute } from "@tanstack/react-router";
import { ArticleStats } from "@/components/editorial/article-stats";

export const Route = createFileRoute("/admin/articles/stats/$articleId")({
  component: StatsPage,
});

function StatsPage() {
  const { articleId } = Route.useParams();
  return <ArticleStats articleId={articleId} />;
}
