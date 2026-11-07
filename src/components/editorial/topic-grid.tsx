import { Link } from "@tanstack/react-router";
import { formatDate } from "@/lib/editorial/text";
import type { Card, HomeData } from "@/lib/editorial/types";

const TOPICS = [
  {
    key: "crypto",
    title: "Crypto",
    href: "/crypto",
    text: "Exchanges, wallets and custody, checked against primary sources.",
  },
  {
    key: "ai",
    title: "AI",
    href: "/ai",
    text: "Pricing, limits and terms of the AI tools people pay for.",
  },
  {
    key: "saas",
    title: "SaaS",
    href: "/saas",
    text: "Trials, renewals and what the fine print really says.",
  },
  {
    key: "guides",
    title: "Guides",
    href: "/guides",
    text: "Step-by-step checks you can repeat before you pay.",
  },
] as const;

function Block(p: { title: string; text: string; cards: Card[] }) {
  return (
    <div className="p-5">
      <h2 className="text-xl font-semibold">{p.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{p.text}</p>
      <ul className="mt-3">
        {p.cards.slice(0, 3).map((c) => (
          <li key={c.id} className="mt-3">
            <Link
              to="/article/$slug"
              params={{ slug: c.slug }}
              className="text-base leading-snug text-accent hover:underline"
            >
              {c.title}
            </Link>
            <span className="mt-0.5 block text-[11px] tracking-wide text-muted uppercase">
              {c.categoryName} · {formatDate(c.publishedAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TopicGrid({ data }: { data: HomeData }) {
  const blocks = TOPICS.filter((t) => data[t.key].length > 0);
  if (blocks.length === 0) return null;
  return (
    <section className="sheet py-8">
      <div className="grid border border-dotted border-ink md:grid-cols-2">
        {blocks.map((t, i) => {
          const edge = i % 2 === 0 ? " md:border-r" : "";
          const rule = i > 0 ? " border-t md:border-t-0" : "";
          const row = i > 1 ? " md:border-t" : "";
          return (
            <div
              key={t.key}
              className={"flex flex-col border-dotted border-ink" + edge + rule + row}
            >
              <Block title={t.title} text={t.text} cards={data[t.key]} />
              <Link
                to={t.href}
                className="mt-auto px-5 pb-5 text-xs font-semibold tracking-widest text-accent uppercase"
              >
                View all →
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
