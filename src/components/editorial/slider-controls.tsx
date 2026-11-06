import { Link } from "@tanstack/react-router";

export function SliderControls({
  page,
  total,
  onGo,
}: {
  page: number;
  total: number;
  onGo: (n: number) => void;
}) {
  const last = page === total - 1;
  return (
    <div className="mt-3 flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-4">
        <button type="button" aria-label="Previous stories" disabled={page === 0} className="slider-arrow" onClick={() => onGo(page - 1)}>
          ‹
        </button>
        <p className="min-w-14 text-center font-sans text-sm font-semibold tabular-nums" aria-live="polite">
          {page + 1} / {total}
        </p>
        <button type="button" aria-label="Next stories" disabled={last} className="slider-arrow" onClick={() => onGo(page + 1)}>
          ›
        </button>
      </div>
      {last ? (
        <Link to="/archive" className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline">
          See everything in the Archive
        </Link>
      ) : null}
    </div>
  );
}
