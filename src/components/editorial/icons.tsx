const PATHS: Record<string, string> = {
  undo: "M9 14 4 9l5-5|M4 9h10a6 6 0 0 1 0 12h-3",
  redo: "m15 14 5-5-5-5|M20 9H10a6 6 0 0 0 0 12h3",
  bold: "M6 4h8a4 4 0 0 1 0 8H6z|M6 12h9a4 4 0 0 1 0 8H6z",
  italic: "M19 4h-9|M14 20H5|M15 4 9 20",
  ul: "M8 6h13|M8 12h13|M8 18h13|M3 6h.01|M3 12h.01|M3 18h.01",
  ol: "M10 6h11|M10 12h11|M10 18h11|M4 6h1v4|M4 10h2|M6 18H4c0-1 2-2 2-3s-1-1.5-2-1",
  quote: "M4 5v14|M9 8h11|M9 12h11|M9 16h7",
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71|M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  image: "M3 5h18v14H3z|M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z|M3 17l5-5 4 4 3-3 6 6",
  table: "M3 5h18v14H3z|M3 10h18|M3 15h18|M9 5v14|M15 5v14",
  code: "m16 18 6-6-6-6|M8 6l-6 6 6 6",
  rule: "M3 12h18",
  underline: "M6 4v6a6 6 0 0 0 12 0V4|M4 20h16",
  strike: "M16 4H9a3 3 0 0 0-2.83 4|M14 12a4 4 0 0 1 0 8H6|M4 12h16",
  clear: "M4 7V4h16v3|M9 20h6|M12 4v16|M3 21 21 3",
  braces: "M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1|M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1",
  htmlview: "m16 18 6-6-6-6|M8 6l-6 6 6 6|M14 4l-4 16",
  more: "M5 12h.01|M12 12h.01|M19 12h.01",
  close: "M6 6l12 12|M18 6 6 18",
  rowAdd: "M3 4h18v9H3z|M3 8.5h18|M9 4v9|M15 4v9|M12 16v6|M9 19h6",
  rowAddUp: "M3 11h18v9H3z|M3 15.5h18|M9 11v9|M15 11v9|M12 2v6|M9 5h6",
  rowDel: "M3 11h18v9H3z|M3 15.5h18|M9 11v9|M15 11v9|M9 5h6",
  colAdd: "M3 3h10v18H3z|M3 9h10|M3 15h10|M8 3v18|M16 12h6|M19 9v6",
  colAddLeft: "M11 3h10v18H11z|M11 9h10|M11 15h10|M16 3v18|M2 12h6|M5 9v6",
  colDel: "M11 3h10v18H11z|M11 9h10|M11 15h10|M16 3v18|M2 12h6",
  header: "M3 5h18v14H3z|M3 10h18|M3 7.5h18",
  trash: "M3 6h18|M8 6V4h8v2|M6 6l1 14h10l1-14|M10 11v5|M14 11v5",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z|M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  pencil: "M4 20h4L19 9l-4-4L4 16z|M13 7l4 4",
  sliders: "M4 6h8|M16 6h4|M4 12h4|M12 12h8|M4 18h10|M18 18h2|M14 4v4|M8 10v4|M16 16v4",
  save: "M5 3h11l3 3v15H5z|M8 3v5h7V3|M8 21v-7h8v7",
};

export function Icon({ n }: { n: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[n].split("|").map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

export function IconBtn({ label, icon, onClick, active }: { label: string; icon: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center border ${active ? "border-ink bg-ink text-inverse-fg" : "border-line bg-card"}`}
    >
      <Icon n={icon} />
    </button>
  );
}
