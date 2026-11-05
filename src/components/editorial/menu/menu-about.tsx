import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { ABOUT_LINKS } from "./menu-data";

export function MenuAbout({ onNavigate }: { onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="border-t border-line pt-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="menu-about"
        onClick={() => setOpen(!open)}
        className="flex min-h-12 w-full items-center justify-between text-base font-semibold"
      >
        About &amp; disclosures
        <ChevronDown className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      <div
        id="menu-about"
        className={`grid transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <ul className="overflow-hidden" inert={!open}>
          {ABOUT_LINKS.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onNavigate}
                className="flex min-h-10 items-center pl-3 text-sm text-muted hover:text-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
