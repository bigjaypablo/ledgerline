import { StoryCard } from "@/components/editorial/cards";
import { Pager } from "@/components/editorial/pager";
import { PublicShell } from "@/components/editorial/shell";
import type { Card, Category, Settings } from "@/lib/editorial/types";

export function CategoryView({
  data,
}: {
  data: {
    category: Category;
    articles: Card[];
    page: number;
    pages: number;
    total: number;
    settings: Settings;
  };
}) {
  return (
    <PublicShell>
      <main className="sheet py-8">
        <p className="text-xs font-bold tracking-widest text-accent uppercase">Section</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">{data.category.name}</h1>
        <p className="mt-3 max-w-2xl text-lg leading-7">{data.category.description}</p>
        {data.articles.length === 0 ? (
          <p className="mt-10 border-t border-ink pt-6 text-muted">No published articles in this section yet.</p>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data.articles.map((card) => (
              <StoryCard key={card.id} card={card} />
            ))}
          </div>
        )}
        {data.pages > 1 ? (
          <Pager
            page={data.page}
            pages={data.pages}
            makeHref={(page) => (page <= 1 ? `/${data.category.slug}` : `/${data.category.slug}?page=${page}`)}
          />
        ) : null}
        <p className="sr-only">{data.settings.siteName}</p>
      </main>
    </PublicShell>
  );
}
