import { Link } from "@tanstack/react-router";
import { formatDate, safeImageSrc } from "@/lib/editorial/text";
import type { Card } from "@/lib/editorial/types";

export function MetaLine({ card }: { card: Card }) {
  return (
    <p className="mt-2 text-xs font-semibold tracking-wide text-muted uppercase">
      {formatDate(card.publishedAt)}
      <span aria-hidden> · </span>
      {card.categoryName}
      <span aria-hidden> · </span>
      {card.readingMinutes} min read
    </p>
  );
}

export function Cover({ card, eager = false }: { card: Card; eager?: boolean }) {
  const src = safeImageSrc(card.coverImage);
  if (!src) return null;
  return (
    <img
      src={src}
      alt={card.coverAlt || ""}
      width={1200}
      height={800}
      className="frame-photo"
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

export function StoryCard({ card }: { card: Card }) {
  return (
    <article className="border-t border-line pt-4">
      <Cover card={card} />
      <p className="mt-3 text-xs font-bold tracking-widest text-accent uppercase">{card.label}</p>
      <h3 className="mt-1 font-serif text-2xl font-semibold leading-tight">
        <Link to="/article/$slug" params={{ slug: card.slug }} className="hover:text-accent">
          {card.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted">{card.summary}</p>
      <MetaLine card={card} />
    </article>
  );
}

export function SectionBand({
  title,
  href,
  articles,
}: {
  title: string;
  href: "/crypto" | "/ai" | "/saas" | "/guides";
  articles: Card[];
}) {
  if (articles.length === 0) return null;
  const [first, ...rest] = articles;
  return (
    <section className="sheet border-t border-ink py-8">
      <div className="mb-4 flex items-end justify-between border-b border-ink pb-2">
        <h2 className="text-sm font-bold tracking-widest uppercase">{title}</h2>
        <Link to={href} className="text-sm font-bold tracking-widest text-accent uppercase">
          More
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <article className="lg:col-span-7">
          <Cover card={first} />
          <h3 className="mt-3 font-serif text-3xl font-semibold leading-tight">
            <Link to="/article/$slug" params={{ slug: first.slug }}>
              {first.title}
            </Link>
          </h3>
          <p className="mt-2 text-base leading-6">{first.summary}</p>
          <MetaLine card={first} />
        </article>
        <ul className="divide-y divide-line lg:col-span-5">
          {rest.map((card) => (
            <li key={card.id} className="py-3">
              <p className="text-xs font-bold tracking-widest text-accent uppercase">{card.categoryName}</p>
              <Link to="/article/$slug" params={{ slug: card.slug }} className="mt-1 block font-serif text-xl font-semibold leading-snug">
                {card.title}
              </Link>
              <p className="mt-1 text-xs text-muted">{formatDate(card.publishedAt)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
