import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ThumbRow } from "@/components/editorial/rows";
import { SliderControls } from "@/components/editorial/slider-controls";
import type { Card } from "@/lib/editorial/types";

const PER_PAGE = 4;

// Distance between the start of one slide and the next (slides may be narrower than the track).
function stepOf(el: HTMLElement): number {
  const a = el.children[0] as HTMLElement | undefined;
  const b = el.children[1] as HTMLElement | undefined;
  if (a && b) return Math.max(b.offsetLeft - a.offsetLeft, 1);
  return Math.max(el.clientWidth, 1);
}

export function ThumbSlider({ cards }: { cards: Card[] }) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0 });
  const [page, setPage] = useState(0);
  const [dragging, setDragging] = useState(false);

  if (cards.length === 0) return null;
  const pages: Card[][] = [];
  for (let i = 0; i < cards.length; i += PER_PAGE) pages.push(cards.slice(i, i + PER_PAGE));

  function goTo(n: number) {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(pages.length - 1, n));
    el.scrollTo({ left: next * stepOf(el), behavior: "smooth" });
  }

  function down(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || e.button !== 0 || !track.current) return;
    drag.current = { active: true, moved: false, startX: e.clientX, startLeft: track.current.scrollLeft };
  }

  function move(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    const el = track.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      setDragging(true);
      el.setPointerCapture(e.pointerId);
    }
    if (d.moved) el.scrollLeft = d.startLeft - dx;
  }

  function up() {
    const d = drag.current;
    const el = track.current;
    if (!d.active) return;
    d.active = false;
    if (d.moved && el) {
      const delta = el.scrollLeft - d.startLeft;
      const base = d.startLeft / stepOf(el);
      const target = Math.abs(delta) > stepOf(el) * 0.15 ? (delta > 0 ? Math.ceil(base) : Math.floor(base)) : Math.round(base);
      setDragging(false);
      goTo(Math.round(target));
    }
  }

  return (
    <section className="sheet pb-8" aria-roledescription="carousel" aria-label="More stories">
      <div className="mb-2 flex items-end justify-between border-b border-ink pb-2">
        <h2 className="text-sm font-bold tracking-widest uppercase">More stories</h2>
        <Link to="/archive" className="text-sm font-semibold text-accent">
          Archive
        </Link>
      </div>
      <div className="relative">
        <div
          ref={track}
          className={dragging ? "snap-row dragging" : "snap-row"}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onClickCapture={(e) => {
            if (drag.current.moved) {
              e.preventDefault();
              e.stopPropagation();
              drag.current.moved = false;
            }
          }}
          onScroll={(e) => {
            const el = e.currentTarget;
            setPage(Math.round(el.scrollLeft / stepOf(el)));
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
        {pages.length > 1 ? <SliderControls page={page} total={pages.length} onGo={goTo} /> : null}
      </div>
    </section>
  );
}
