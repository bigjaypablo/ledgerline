import { Link } from "@tanstack/react-router";
import { SECTIONS, type SectionId } from "./sections";

export function AccountNav({ active }: { active: SectionId }) {
  return (
    <nav aria-label="Account sections" className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
      {SECTIONS.map(([id, label]) => (
        <Link
          key={id}
          to="/account"
          search={id === "profile" ? {} : { section: id }}
          aria-current={active === id ? "page" : undefined}
          className={`inline-flex min-h-11 shrink-0 items-center border px-4 text-sm font-semibold ${
            active === id ? "border-ink bg-ink text-inverse-fg" : "border-line"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
