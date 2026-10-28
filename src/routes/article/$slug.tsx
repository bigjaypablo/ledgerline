import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { ArticleView } from "@/components/editorial/article-view";
import { ArticleSkeleton } from "@/components/editorial/skeletons";
import { absoluteUrl } from "@/lib/editorial/text";
import { getArticle } from "@/lib/editorial/public";

export const Route = createFileRoute("/article/$slug")({
  loader: async ({ params }) => {
    const data = await getArticle({ data: { slug: params.slug } });
    if (!data) throw notFound();
    if (data.kind === "redirect") {
      throw redirect({ to: "/article/$slug", params: { slug: data.slug } });
    }
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Ledgerline" }] };
    const article = loaderData.article;
    const canonical = absoluteUrl(loaderData.settings.publicUrl, `/article/${article.slug}`);
    const meta: Array<{ title?: string; name?: string; content?: string; property?: string }> = [
      { title: `${article.seoTitle} — Ledgerline` },
      { name: "description", content: article.seoDescription },
      { name: "author", content: loaderData.author.name },
    ];
    if (article.coverImage.startsWith("https://")) {
      meta.push({ property: "og:image", content: article.coverImage });
    }
    return {
      meta,
      links: canonical.startsWith("http") ? [{ rel: "canonical", href: canonical }] : undefined,
    };
  },
  pendingComponent: ArticleSkeleton,
  pendingMs: 200,
  component: ArticleRoute,
});

function ArticleRoute() {
  const data = Route.useLoaderData();
  return (
    <ArticleView
      data={{
        article: data.article,
        sources: data.sources,
        related: data.related,
        previous: data.previous,
        next: data.next,
        comments: data.comments,
        tools: data.tools,
        author: data.author,
        settings: data.settings,
      }}
    />
  );
}
