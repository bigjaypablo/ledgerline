import { headingIds } from "@/lib/editorial/text";
import { useActiveHeading } from "@/components/editorial/use-active-heading";

const clean = (t: string) => t.replace(/\((?:https?:\/\/|\/)[^\s)]*\)/g, "").replace(/\s{2,}/g, " ").trim();

export function TocSidebar({ body }: { body: string }) {
  const items = headingIds(body).filter((i) => i.level === 2);
  const active = useActiveHeading(items.map((i) => i.id));
  if (items.length < 2) return null;
  return (
    <nav className="border-t border-ink pt-3" aria-label="On this page">
      <h2 className="text-xs font-bold tracking-widest uppercase">On this page</h2>
      <ol className="mt-3 space-y-2 border-l border-line text-sm leading-5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={`-ml-px block border-l-2 py-1 pl-3 ${
                active === item.id ? "border-accent font-semibold text-ink" : "border-transparent text-muted hover:text-accent"
              }`}
            >
              {clean(item.text)}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
