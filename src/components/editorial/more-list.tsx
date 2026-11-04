import { Link } from "@tanstack/react-router";
import { formatDate, safeImageSrc } from "@/lib/editorial/text";
import type { Card } from "@/lib/editorial/types";

export function MoreList({ cards }: { cards: Card[] }) {
  if (cards.length === 0) return null;
  return (
    <ul className="mt-3 divide-y divide-line">
      {cards.map((card) => {
        const src = safeImageSrc(card.coverImage);
        return (
          <li key={card.id}>
            <Link
              to="/article/$slug"
              params={{ slug: card.slug }}
              className="group flex items-start justify-between gap-3 py-3"
            >
              <span className="min-w-0">
                <span className="block font-sans text-[15px] leading-snug font-medium group-hover:text-accent">
                  {card.title}
                </span>
                <span className="mt-1 block font-sans text-xs tracking-wide text-muted uppercase">
                  {formatDate(card.publishedAt)} · {card.categoryName}
                </span>
              </span>
              {src ? (
                <img
                  src={src}
                  alt=""
                  width={160}
                  height={160}
                  loading="lazy"
                  decoding="async"
                  className="size-16 shrink-0 object-cover"
                />
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
