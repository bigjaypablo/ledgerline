export function Pager({
  page,
  pages,
  makeHref,
}: {
  page: number;
  pages: number;
  makeHref: (page: number) => string;
}) {
  if (pages <= 1) return null;
  const numbers = Array.from({ length: pages }, (_, index) => index + 1);
  return (
    <nav className="mt-8 flex flex-wrap items-center gap-2" aria-label="Pages">
      {page > 1 ? (
        <a href={makeHref(page - 1)} className="inline-flex min-h-11 items-center border border-line bg-card px-3 text-sm font-semibold">
          Previous
        </a>
      ) : null}
      {numbers.map((number) => (
        <a
          key={number}
          href={makeHref(number)}
          aria-current={number === page ? "page" : undefined}
          className={
            number === page
              ? "inline-flex min-h-11 min-w-11 items-center justify-center bg-ink text-sm font-semibold text-inverse-fg"
              : "inline-flex min-h-11 min-w-11 items-center justify-center border border-line bg-card text-sm font-semibold"
          }
        >
          {number}
        </a>
      ))}
      {page < pages ? (
        <a href={makeHref(page + 1)} className="inline-flex min-h-11 items-center border border-line bg-card px-3 text-sm font-semibold">
          Next
        </a>
      ) : null}
    </nav>
  );
}
