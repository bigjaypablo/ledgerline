import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { Markdown } from "tiptap-markdown";

type Props = {
  value: string;
  onChange: (markdown: string) => void;
  compress: (file: File) => Promise<string>;
  onError: (message: string) => void;
};

// Icon paths on a 24x24 grid, separated by "|"
const P: Record<string, string> = {
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
};

function Icon({ n }: { n: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[n].split("|").map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

function Btn({ label, icon, text, onClick, active }: { label: string; icon?: string; text?: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-9 shrink-0 items-center justify-center border text-xs font-bold ${icon ? "w-9" : "min-w-9 px-3"} ${
        active ? "border-ink bg-ink text-inverse-fg" : "border-line bg-card"
      }`}
    >
      {icon ? <Icon n={icon} /> : text}
    </button>
  );
}

const Sep = () => <span className="rich-sep" aria-hidden="true" />;

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-sm font-semibold">{label}</span>
      <Btn label={`Fewer ${label}`} text="−" onClick={() => onChange(Math.max(min, value - 1))} />
      <span className="w-8 text-center text-base font-bold">{value}</span>
      <Btn label={`More ${label}`} text="+" onClick={() => onChange(Math.min(max, value + 1))} />
    </div>
  );
}

function getMd(editor: Editor): string {
  return (editor.storage as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();
}

export function RichBody({ value, onChange, compress, onError }: Props) {
  const last = useRef(value);
  const fileRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [popY, setPopY] = useState<number | null>(null);
  const [popSide, setPopSide] = useState<"above" | "below">("above");
  const [more, setMore] = useState(false);
  const [picker, setPicker] = useState(false);
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(3);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit,
      LinkExt.configure({ openOnClick: false }),
      ImageExt,
      Table,
      TableRow,
      TableHeader,
      TableCell,
      Markdown.configure({ html: false, tightLists: true }),
    ],
    content: value,
    editorProps: {
      attributes: { class: "rich-body", "aria-label": "Article body" },
    },
    onUpdate: ({ editor: ed }) => {
      const md = getMd(ed);
      last.current = md;
      onChange(md);
    },
  });

  useEffect(() => {
    if (!editor || value === last.current) return;
    last.current = value;
    editor.commands.setContent(value, false);
  }, [value, editor]);

  // Table menu above the table; below it if there is no room above.
  useEffect(() => {
    let y: number | null = null;
    let side: "above" | "below" = "above";
    try {
      if (editor && wrapRef.current && editor.isActive("table")) {
        const { node } = editor.view.domAtPos(editor.state.selection.from);
        const el = (node instanceof Element ? node : node.parentElement)?.closest("table");
        if (el) {
          const w = wrapRef.current.getBoundingClientRect();
          const t = el.getBoundingClientRect();
          const h = popRef.current?.offsetHeight ?? 48;
          if (t.top - w.top >= h + 8) {
            y = Math.round(w.bottom - t.top + 4);
            side = "above";
          } else {
            y = Math.round(t.bottom - w.top + 4);
            side = "below";
          }
        }
      }
    } catch {
      y = null;
    }
    setPopY((p) => (p === y ? p : y));
    setPopSide((s) => (s === side ? s : side));
  });

  if (!editor) return <div className="min-h-80 border border-line bg-card" aria-hidden />;

  const c = () => editor.chain().focus();

  function setLink() {
    const prev = (editor!.getAttributes("link").href as string | undefined) ?? "https://";
    const url = window.prompt("Link address", prev);
    if (url === null) return;
    if (url.trim() === "" || url.trim() === "https://") c().unsetLink().run();
    else c().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  return (
    <div className="rich">
      <div className="rich-bar" role="toolbar" aria-label="Formatting">
        <Btn label="Undo" icon="undo" onClick={() => c().undo().run()} />
        <Btn label="Redo" icon="redo" onClick={() => c().redo().run()} />
        <Sep />
        <Btn label="Heading 2" text="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => c().toggleHeading({ level: 2 }).run()} />
        <Btn label="Heading 3" text="H3" active={editor.isActive("heading", { level: 3 })} onClick={() => c().toggleHeading({ level: 3 }).run()} />
        <Sep />
        <Btn label="Bold" icon="bold" active={editor.isActive("bold")} onClick={() => c().toggleBold().run()} />
        <Btn label="Italic" icon="italic" active={editor.isActive("italic")} onClick={() => c().toggleItalic().run()} />
        <Btn label="Bulleted list" icon="ul" active={editor.isActive("bulletList")} onClick={() => c().toggleBulletList().run()} />
        <Btn label="Numbered list" icon="ol" active={editor.isActive("orderedList")} onClick={() => c().toggleOrderedList().run()} />
        <Btn label="Quote" icon="quote" active={editor.isActive("blockquote")} onClick={() => c().toggleBlockquote().run()} />
        <Sep />
        <Btn label="Link" icon="link" active={editor.isActive("link")} onClick={setLink} />
        <Btn label="Image" icon="image" onClick={() => fileRef.current?.click()} />
        <Btn label="Table" icon="table" active={picker} onClick={() => setPicker((p) => !p)} />
        <Btn label="Code block" icon="code" active={editor.isActive("codeBlock")} onClick={() => c().toggleCodeBlock().run()} />
        <Btn label="Divider" icon="rule" onClick={() => c().setHorizontalRule().run()} />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            compress(file)
              .then((src) => {
                const alt = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 80) || "Image";
                c().setImage({ src, alt }).run();
              })
              .catch((err: unknown) => onError(err instanceof Error ? err.message : "Upload failed."));
          }}
        />
      </div>
      {picker ? (
        <div className="table-picker" role="group" aria-label="New table size">
          <Stepper label="Rows" value={rows} min={2} max={30} onChange={setRows} />
          <Stepper label="Columns" value={cols} min={1} max={8} onChange={setCols} />
          <div className="flex gap-2">
            <Btn
              label="Insert table"
              text={`Insert ${rows} × ${cols}`}
              active
              onClick={() => {
                c().insertTable({ rows, cols, withHeaderRow: true }).run();
                setPicker(false);
              }}
            />
            <Btn label="Cancel" text="Cancel" onClick={() => setPicker(false)} />
          </div>
        </div>
      ) : null}
      <div className="rich-wrap" ref={wrapRef}>
        {popY !== null ? (
          <div ref={popRef} className="table-pop" style={popSide === "above" ? { bottom: popY } : { top: popY }} role="toolbar" aria-label="Table">
            <div className="flex gap-1">
              <Btn label="Add row below" icon="rowAdd" onClick={() => c().addRowAfter().run()} />
              <Btn label="Add column right" icon="colAdd" onClick={() => c().addColumnAfter().run()} />
              <Btn label={more ? "Fewer options" : "More options"} icon={more ? "close" : "more"} active={more} onClick={() => setMore((m) => !m)} />
            </div>
            {more ? (
              <div className="flex flex-wrap gap-1">
                <Btn label="Add row above" icon="rowAddUp" onClick={() => c().addRowBefore().run()} />
                <Btn label="Add column left" icon="colAddLeft" onClick={() => c().addColumnBefore().run()} />
                <Btn label="Delete row" icon="rowDel" onClick={() => c().deleteRow().run()} />
                <Btn label="Delete column" icon="colDel" onClick={() => c().deleteColumn().run()} />
                <Btn label="Header row on/off" icon="header" onClick={() => c().toggleHeaderRow().run()} />
                <Btn label="Delete table" icon="trash" onClick={() => c().deleteTable().run()} />
              </div>
            ) : null}
          </div>
        ) : null}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
