import type { ErrorComponentProps } from "@tanstack/react-router";
import { PublicShell } from "@/components/editorial/shell";

export function AppErrorComponent({ error, reset }: ErrorComponentProps) {
  const isNetwork =
    error instanceof Error &&
    (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"));

  const title = isNetwork ? "Connection interrupted" : "Something went wrong";
  const message = isNetwork
    ? "Could not load this page. Check your internet connection or try again."
    : error instanceof Error && error.message
      ? error.message
      : "An unexpected error occurred while loading this page.";

  return (
    <PublicShell>
      <main className="sheet py-16 text-center">
        <div className="mx-auto max-w-md border border-line bg-card p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Notice</p>
          <h1 className="mt-2 font-serif text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{message}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex min-h-11 items-center bg-ink px-4 text-sm font-semibold text-inverse-fg hover:opacity-90 transition-opacity"
            >
              Try again
            </button>
            <a
              href="/"
              className="inline-flex min-h-11 items-center border border-line px-4 text-sm font-semibold text-ink hover:bg-line/20 transition-colors"
            >
              Back to homepage
            </a>
          </div>
        </div>
      </main>
    </PublicShell>
  );
}
