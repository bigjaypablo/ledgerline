import type { LinkItem, Member } from "@/lib/editorial/opportunity-detail";

export function DetailTeam({ team }: { team: Member[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {team.map((m, i) => (
        <li key={i} className="border border-line bg-card p-3">
          <p className="font-semibold">{m.name}</p>
          {m.role ? <p className="text-sm text-muted">{m.role}</p> : null}
          {m.xUrl ? (
            <a href={m.xUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline">
              X profile
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function DetailLinks({ links }: { links: LinkItem[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {links.map((l, i) => (
        <li key={i}>
          <a href={l.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex min-h-11 items-center border border-line px-4 text-sm font-semibold hover:text-accent">
            {l.label} ↗
          </a>
        </li>
      ))}
    </ul>
  );
}
