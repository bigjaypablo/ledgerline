import { createFileRoute, notFound } from "@tanstack/react-router";
import { StoryCard } from "@/components/editorial/cards";
import { PublicShell } from "@/components/editorial/shell";
import { getTagPage } from "@/lib/editorial/public";

export const Route = createFileRoute("/tag/$slug")({
  loader: async ({ params }) => {
    const data = await getTagPage({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Ledgerline" }] };
    const meta: Array<Record<string, string>> = [
      { title: loaderData.name + " — Ledgerline" },
      {
        name: "description",
        content: "Ledgerline articles about " + loaderData.name + ".",
      },
    ];
    if (loaderData.articles.length < 2) {
      meta.push({ name: "robots", content: "noindex, follow" });
    }
    return { meta };
  },
  component: TagPage,
});

function TagPage() {
  const data = Route.useLoaderData();
  const n = data.articles.length;
  return (
    <PublicShell>
      <main className="sheet py-8">
        <p className="text-xs font-bold tracking-widest text-accent uppercase">
          Topic
        </p>
        <h1 className="mt-2 font-sans text-4xl font-medium">{data.name}</h1>
        <p className="mt-2 text-muted">
          {n} article{n === 1 ? "" : "s"} tagged {data.name}.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.articles.map((card) => (
            <StoryCard key={card.id} card={card} />
          ))}
        </div>
      </main>
    </PublicShell>
  );
}
