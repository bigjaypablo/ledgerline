import { Link } from "@tanstack/react-router";
import { StoryCard } from "@/components/editorial/cards";
import { Pager } from "@/components/editorial/pager";
import { PublicShell } from "@/components/editorial/shell";
import type { Card, Category, Settings } from "@/lib/editorial/types";

export function ArchiveView({
  data,
}: {
  data: {
    articles: Card[];
    categories: Category[];
    category: string;
    page: number;
    pages: number;
    total: number;
    settings: Settings;
  };
}) {
  function href(page: number, category = data.category) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/archive?${query}` : "/archive";
  }

  return (
    <PublicShell>
      <main className="sheet py-8">
        <p className="text-xs font-bold tracking-widest text-accent uppercase">Browse</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Archive</h1>
        <p className="mt-3 max-w-2xl text-lg leading-7 text-muted">
          Published research only. Drafts are not listed. {data.total} {data.total === 1 ? "article" : "articles"}.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
          <li>
            <Link
              to="/archive"
              className={!data.category ? "inline-flex min-h-11 items-center bg-ink px-3 text-inverse-fg" : "inline-flex min-h-11 items-center border border-line bg-card px-3"}
            >
              All
            </Link>
          </li>
          {data.categories.map((category) => (
            <li key={category.slug}>
              <a
                href={href(1, category.slug)}
                className={
                  data.category === category.slug
                    ? "inline-flex min-h-11 items-center bg-ink px-3 text-inverse-fg"
                    : "inline-flex min-h-11 items-center border border-line bg-card px-3"
                }
              >
                {category.name}
              </a>
            </li>
          ))}
        </ul>
        {data.articles.length === 0 ? (
          <p className="mt-10 border-t border-ink pt-6 text-muted">Nothing published in this filter yet.</p>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data.articles.map((card) => (
              <StoryCard key={card.id} card={card} />
            ))}
          </div>
        )}
        <Pager page={data.page} pages={data.pages} makeHref={(page) => href(page)} />
        <p className="sr-only">{data.settings.siteName}</p>
      </main>
    </PublicShell>
  );
}
