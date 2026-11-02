import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Cover } from "@/components/editorial/cards";
import type { Card } from "@/lib/editorial/types";

const DELAY = 7000;

export function LeadSlideshow({ cards }: { cards: Card[] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [dx, setDx] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);
  const moved = useRef(false);
  const total = cards.length;

  function go(next: number, d?: 1 | -1) {
    if (total < 2) return;
    setDir(d ?? (next > index ? 1 : -1));
    setIndex(((next % total) + total) % total);
  }


  if (total === 0) return null;
  const card = cards[index] ?? cards[0];

  function down(e: React.PointerEvent) {
    startX.current = e.clientX;
    moved.current = false;
    setPaused(true);
  }
  function move(e: React.PointerEvent) {
    if (startX.current === null) return;
    const d = e.clientX - startX.current;
    if (Math.abs(d) > 8) moved.current = true;
    setDx(d);
  }
  function up() {
    if (startX.current === null) return;
    const d = dx;
    startX.current = null;
    setDx(0);
    setPaused(false);
    if (d > 60) go(index - 1, -1);
    else if (d < -60) go(index + 1, 1);
  }

  const dragStyle =
    dx !== 0
      ? {
          transform: `perspective(1200px) translateX(${dx * 0.5}px) rotateY(${dx / -28}deg)`,
          opacity: 1 - Math.min(Math.abs(dx) / 500, 0.45),
          transition: "none",
        }
      : undefined;

  return (
    <section
      className="sheet pt-8 pb-3"
      aria-roledescription="carousel"
      aria-label="Lead stories"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1, 1);
        if (e.key === "ArrowLeft") go(index - 1, -1);
      }}
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
    >
      <div
        className="touch-pan-y select-none"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={() => startX.current !== null && up()}
        onClickCapture={(e) => {
          if (moved.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <article key={card.id} className={`hero-slide ${dir > 0 ? "fx-next" : "fx-prev"}`} style={dragStyle}>
          <Link to="/article/$slug" params={{ slug: card.slug }} className="hero-frame" draggable={false}>
            <Cover card={card} eager />
          </Link>
          <div className="hero-head">
            <h3 className="font-serif text-3xl font-semibold leading-tight text-balance md:text-5xl">
              <Link to="/article/$slug" params={{ slug: card.slug }} draggable={false}>
                {card.title}
              </Link>
            </h3>
            <Link to="/article/$slug" params={{ slug: card.slug }} className="hero-cta" draggable={false}>
              
              <span className="relative">Read story</span>
            </Link>
          </div>
        </article>
      </div>
      <div className="hero-dots" role="tablist" aria-label="Slides">
        {cards.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show story ${i + 1}: ${item.title}`}
            className="hero-dot-hit"
            onClick={() => go(i)}
          >
            <span className={i === index ? "hero-dot on" : "hero-dot"}>
              {i === index && total > 1 ? (
                <span
                  className="hero-dot-fill"
                  onAnimationEnd={() => go(index + 1, 1)}
                  style={{ animationDuration: DELAY + "ms", animationPlayState: paused ? "paused" : "running" }}
                />
              ) : null}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
