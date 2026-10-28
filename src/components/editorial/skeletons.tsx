import { PublicShell } from "@/components/editorial/shell";

function Bar({ className }: { className: string }) {
  return <div className={`animate-pulse bg-line ${className}`} />;
}

export function HomeSkeleton() {
  return (
    <PublicShell>
      <div className="sheet space-y-8 py-8" aria-hidden>
        <div className="space-y-4">
          <Bar className="h-[15rem] w-full md:h-[26rem]" />
          <div className="flex flex-col items-center gap-3">
            <Bar className="h-8 w-4/5 max-w-xl" />
            <Bar className="h-11 w-36 rounded-full" />
            <Bar className="h-2 w-40 rounded-full" />
          </div>
        </div>
        <div className="grid gap-6 border-t border-line pt-8 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7">
            <Bar className="aspect-[3/2] w-full" />
            <Bar className="h-4 w-24" />
            <Bar className="h-8 w-5/6" />
            <Bar className="h-4 w-full" />
          </div>
          <div className="space-y-4 border border-line p-5 lg:col-span-5">
            <Bar className="h-4 w-40" />
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2 border-t border-line pt-3">
                <Bar className="h-5 w-full" />
                <Bar className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-x-8 md:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="thumb-row">
              <Bar className="aspect-square w-full" />
              <div className="space-y-2">
                <Bar className="h-3 w-16" />
                <Bar className="h-5 w-full" />
                <Bar className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="sr-only">Loading Ledgerline.</p>
    </PublicShell>
  );
}

export function ListSkeleton() {
  return (
    <PublicShell>
      <div className="sheet space-y-4 py-8" aria-hidden>
        <Bar className="h-10 w-48" />
        <Bar className="h-6 w-2/3" />
        <div className="grid gap-6 md:grid-cols-3">
          <Bar className="h-56" />
          <Bar className="h-56" />
          <Bar className="h-56" />
        </div>
      </div>
      <p className="sr-only">Loading articles.</p>
    </PublicShell>
  );
}

export function ArticleSkeleton() {
  return (
    <PublicShell>
      <div className="sheet max-w-3xl space-y-4 py-8" aria-hidden>
        <Bar className="h-4 w-32" />
        <Bar className="h-12 w-full" />
        <Bar className="h-6 w-5/6" />
        <Bar className="h-72 w-full" />
        <Bar className="h-4 w-full" />
        <Bar className="h-4 w-11/12" />
        <Bar className="h-4 w-4/5" />
      </div>
      <p className="sr-only">Loading the article.</p>
    </PublicShell>
  );
}
