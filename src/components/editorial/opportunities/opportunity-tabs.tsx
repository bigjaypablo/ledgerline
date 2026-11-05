import { Link } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { buildSearch, type Current } from "./filter-utils";

const TABS = [["", "All"], ["testnet", "Testnets"], ["points", "Points"]] as const;

export function OpportunityTabs({ current, onOpen, count }: { current: Current; onOpen: () => void; count: number }) {
  return (
    <div className="mt-6 flex items-center gap-2 overflow-x-auto">
      {TABS.map(([value, text]) => (
        <Link
          key={value}
          to="/opportunities"
          search={buildSearch(current, { kind: value })}
          className={`inline-flex min-h-11 shrink-0 items-center border px-4 text-sm font-semibold ${
            current.kind === value ? "border-ink bg-ink text-inverse-fg" : "border-line"
          }`}
        >
          {text}
        </Link>
      ))}
      <button
        type="button"
        onClick={onOpen}
        className="ml-auto inline-flex min-h-11 shrink-0 items-center gap-2 border border-line px-4 text-sm font-semibold"
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Filters{count ? ` (${count})` : ""}
      </button>
    </div>
  );
}
