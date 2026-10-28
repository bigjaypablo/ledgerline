import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { StoryCard } from "@/components/editorial/cards";
import { Pager } from "@/components/editorial/pager";
import { PublicShell } from "@/components/editorial/shell";
import type { Card, Settings } from "@/lib/editorial/types";

export function SearchView({
  data,
}: {
  data: { q: string; articles: Card[]; total: number; page: number; pages: number; settings: Settings };
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState(data.q);

  return (
    <PublicShell>
      <main className="sheet py-8">
        <h1 className="font-serif text-4xl font-semibold">Search</h1>
        <form
          className="mt-4 flex"
          onSubmit={(event) => {
            event.preventDefault();
            void navigate({ to: "/search", search: { q } });
          }}
        >
          <label className="sr-only" htmlFor="search-q">
            Search news, topics and more
          </label>
          <input
            id="search-q"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search news, topics and more"
            className="min-h-12 flex-1 border border-ink bg-card px-3"
          />
          <button type="submit" className="min-h-12 bg-ink px-4 text-sm font-semibold text-inverse-fg">
            Search
          </button>
        </form>
        {data.q.trim().length < 2 ? (
          <p className="mt-6 text-muted">Type at least two letters. Drafts are not searched.</p>
        ) : data.articles.length === 0 ? (
          <p className="mt-6 text-muted">No published articles matched “{data.q}”.</p>
        ) : (
          <>
            <p className="mt-6 text-sm text-muted">
              {data.total} published {data.total === 1 ? "article" : "articles"}
            </p>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {data.articles.map((card) => (
                <StoryCard key={card.id} card={card} />
              ))}
            </div>
            <Pager
              page={data.page}
              pages={data.pages}
              makeHref={(page) => {
                const params = new URLSearchParams();
                params.set("q", data.q);
                if (page > 1) params.set("page", String(page));
                return `/search?${params.toString()}`;
              }}
            />
          </>
        )}
      </main>
    </PublicShell>
  );
}
