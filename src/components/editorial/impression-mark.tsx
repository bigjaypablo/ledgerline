import { useEffect, useRef } from "react";
import { trackImpressions } from "@/lib/editorial/public";

const seen = new Set<string>();
let queue: string[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function flush() {
  timer = null;
  const ids = queue;
  queue = [];
  if (ids.length === 0) return;
  void trackImpressions({ data: { ids, path: window.location.pathname } }).catch(() => {});
}

/** Drop inside a card. Counts one impression when the card is mostly on screen. */
export function ImpressionMark({ id }: { id: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const target = ref.current?.parentElement;
    if (!target || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !seen.has(id)) {
            seen.add(id);
            queue.push(id);
            if (!timer) timer = setTimeout(flush, 1500);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, [id]);

  return <span ref={ref} hidden />;
}
