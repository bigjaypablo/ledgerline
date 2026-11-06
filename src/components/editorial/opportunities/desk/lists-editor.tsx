import type { LinkItem, Member } from "@/lib/editorial/opportunity-types";
import { Field } from "./field";

export function TeamEditor({ team, onChange }: { team: Member[]; onChange: (next: Member[]) => void }) {
  const set = (i: number, patch: Partial<Member>) => onChange(team.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  return (
    <section className="md:col-span-2">
      <h2 className="font-serif text-2xl font-semibold">Team</h2>
      <div className="mt-2 space-y-3">
        {team.map((m, i) => (
          <div key={i} className="grid gap-2 border border-line p-3 md:grid-cols-3">
            <Field label="Name" value={m.name} onChange={(name) => set(i, { name })} />
            <Field label="Role" value={m.role} onChange={(role) => set(i, { role })} />
            <Field label="X link (https://)" value={m.xUrl} onChange={(xUrl) => set(i, { xUrl })} />
            <button type="button" onClick={() => onChange(team.filter((_, j) => j !== i))} className="min-h-11 text-left text-sm font-semibold text-accent">
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...team, { name: "", role: "", xUrl: "" }])} className="mt-2 min-h-11 border border-line px-4 text-sm font-semibold">
        + Add person
      </button>
    </section>
  );
}

export function LinksEditor({ links, onChange }: { links: LinkItem[]; onChange: (next: LinkItem[]) => void }) {
  const set = (i: number, patch: Partial<LinkItem>) => onChange(links.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  return (
    <section className="md:col-span-2">
      <h2 className="font-serif text-2xl font-semibold">Links</h2>
      <div className="mt-2 space-y-3">
        {links.map((l, i) => (
          <div key={i} className="grid gap-2 border border-line p-3 md:grid-cols-2">
            <Field label="Label (Docs, X, Discord…)" value={l.label} onChange={(label) => set(i, { label })} />
            <Field label="Link (https://)" value={l.url} onChange={(url) => set(i, { url })} />
            <button type="button" onClick={() => onChange(links.filter((_, j) => j !== i))} className="min-h-11 text-left text-sm font-semibold text-accent">
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...links, { label: "", url: "" }])} className="mt-2 min-h-11 border border-line px-4 text-sm font-semibold">
        + Add link
      </button>
    </section>
  );
}
