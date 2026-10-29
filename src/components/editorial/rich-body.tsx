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
import { Icon } from "@/components/editorial/icons";

type Props = {
  value: string;
  onChange: (markdown: string) => void;
  compress: (file: File) => Promise<string>;
  onError: (message: string) => void;
};

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
