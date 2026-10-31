import { useRef, useState } from "react";
import { ThumbRow } from "@/components/editorial/rows";
import type { Card } from "@/lib/editorial/types";

const PER_PAGE = 4;

export function ThumbSlider({ cards }: { cards: Card[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const pages: Card[][] = [];
  for (let i = 0; i < cards.length; i += PER_PAGE) pages.push(cards.slice(i, i + PER_PAGE));

  function goTo(n: number) {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(pages.length - 1, n));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }

  return (
    <section className="sheet pb-8" aria-roledescription="carousel" aria-label="More stories">
      <div className="relative border-t border-line">
        <div
          ref={track}
          className="snap-row"
          onScroll={(e) => {
            const el = e.currentTarget;
            setPage(Math.round(el.scrollLeft / Math.max(el.clientWidth, 1)));
          }}
        >
          {pages.map((group, i) => (
            <div key={i} className="snap-page grid gap-x-8 md:grid-cols-2" aria-label={`Page ${i + 1} of ${pages.length}`}>
              {group.map((card) => (
                <ThumbRow key={card.id} card={card} />
              ))}
            </div>
          ))}
        </div>
        {pages.length > 1 ? (
          <div className="mt-3 flex items-center justify-center gap-3">
            <button type="button" aria-label="Previous stories" disabled={page === 0} className="slider-arrow" onClick={() => goTo(page - 1)}>
              ‹
            </button>
            <div className="flex items-center">
              {pages.map((_, i) => (
                <button key={i} type="button" aria-label={`Go to page ${i + 1}`} aria-current={i === page} className="hero-dot-hit" onClick={() => goTo(i)}>
                  <span className={i === page ? "hero-dot on" : "hero-dot"} />
                </button>
              ))}
            </div>
            <button type="button" aria-label="Next stories" disabled={page === pages.length - 1} className="slider-arrow" onClick={() => goTo(page + 1)}>
              ›
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
