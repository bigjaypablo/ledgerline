import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Cover } from "@/components/editorial/cards";
import { formatDate, safeImageSrc } from "@/lib/editorial/text";
import type { Card } from "@/lib/editorial/types";

export function ThumbRow({ card }: { card: Card }) {
  const src = safeImageSrc(card.coverImage);
  return (
    <article className="thumb-row">
      <Link to="/article/$slug" params={{ slug: card.slug }} className="thumb-img" tabIndex={-1} aria-hidden="true" draggable={false}>
        {src ? <img src={src} alt="" width={240} height={240} loading="lazy" decoding="async" /> : null}
      </Link>
      <div className="min-w-0">
        <p className="text-xs font-bold tracking-widest text-accent uppercase">{card.categoryName}</p>
        <h3 className="mt-1 font-serif text-lg font-semibold leading-snug">
          <Link to="/article/$slug" params={{ slug: card.slug }}>
            {card.title}
          </Link>
        </h3>
        <p className="mt-2 text-xs font-semibold tracking-wide text-muted uppercase">
          <time dateTime={card.publishedAt}>{formatDate(card.publishedAt)}</time>
          <span aria-hidden> · </span>
          {card.readingMinutes} min
        </p>
      </div>
    </article>
  );
}

export function FeatureCard({ card }: { card: Card }) {
  return (
    <article className="pb-5">
      <Link to="/article/$slug" params={{ slug: card.slug }} className="block" draggable={false}>
        <Cover card={card} />
      </Link>
      <p className="mt-3 text-xs font-bold tracking-widest text-accent uppercase">{card.label}</p>
      <h3 className="mt-1 font-serif text-2xl font-semibold leading-tight md:text-3xl">
        <Link to="/article/$slug" params={{ slug: card.slug }}>
          {card.title}
        </Link>
      </h3>
      <p className="mt-2 text-base leading-7 text-muted">{card.summary}</p>
      <p className="mt-2 text-xs font-semibold tracking-wide text-muted uppercase">
        <time dateTime={card.publishedAt}>{formatDate(card.publishedAt)}</time>
        <span aria-hidden> · </span>
        {card.categoryName}
        <span aria-hidden> · </span>
        {card.readingMinutes} min read
      </p>
    </article>
  );
}

export function LatestList({ cards, perPage = 6 }: { cards: Card[]; perPage?: number }) {
  const [page, setPage] = useState(0);
  if (cards.length === 0) return null;
  const pages = Math.ceil(cards.length / perPage);
  const go = (n: number) => setPage(((n % pages) + pages) % pages);
  const slice = cards.slice(page * perPage, (page + 1) * perPage);
  return (
    <aside className="latest-box" aria-label="Latest research">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-bold tracking-widest uppercase">Latest research</h2>
        <span className="h-px flex-1 bg-line" aria-hidden />
        <Link to="/archive" className="text-xs font-bold tracking-widest text-accent uppercase">
          Archive
        </Link>
      </div>
      <ul className="latest-list">
        {slice.map((card) => (
          <li key={card.id}>
            <Link to="/article/$slug" params={{ slug: card.slug }} className="block py-3.5">
              <span className="block text-base leading-6 font-medium">{card.title}</span>
              <span className="mt-1 block text-xs font-semibold tracking-wide text-muted uppercase">
                {card.categoryName} · {formatDate(card.publishedAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {pages > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-1">
          <button type="button" aria-label="Previous page" className="latest-arrow" onClick={() => go(page - 1)}>
            ‹
          </button>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} type="button" aria-label={`Page ${i + 1}`} className="hero-dot-hit" onClick={() => go(i)}>
              <span className={i === page ? "hero-dot on" : "hero-dot"} />
            </button>
          ))}
          <button type="button" aria-label="Next page" className="latest-arrow" onClick={() => go(page + 1)}>
            ›
          </button>
        </div>
      ) : null}
    </aside>
  );
}
