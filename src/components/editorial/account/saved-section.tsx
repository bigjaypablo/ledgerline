import { StoryCard } from "@/components/editorial/cards";
import type { Card as CardType } from "@/lib/editorial/types";
import { Card } from "./card";

export function SavedSection({ saved }: { saved: CardType[] | null }) {
  return (
    <Card title="Saved articles">
      {saved === null ? <p className="text-muted">Loading…</p> : null}
      {saved && saved.length === 0 ? (
        <p className="text-muted">Nothing saved yet. Open an article and choose Save.</p>
      ) : null}
      {saved && saved.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {saved.map((card) => (
            <StoryCard key={card.id} card={card} />
          ))}
        </div>
      ) : null}
    </Card>
  );
}
