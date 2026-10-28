import { useEffect, useRef } from "react";
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

function Btn({ label, onClick, active }: { label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-h-11 shrink-0 border px-3 text-sm font-semibold ${
        active ? "border-ink bg-ink text-inverse-fg" : "border-line bg-card"
      }`}
    >
      {label}
    </button>
  );
}

function getMd(editor: Editor): string {
  return (editor.storage as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();
}

export function RichBody({ value, onChange, compress, onError }: Props) {
  const last = useRef(value);
  const fileRef = useRef<HTMLInputElement>(null);

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

  if (!editor) return <div className="min-h-80 border border-line bg-card" aria-hidden />;

  const c = () => editor.chain().focus();
  const inTable = editor.isActive("table");

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
        <Btn label="Undo" onClick={() => c().undo().run()} />
        <Btn label="Redo" onClick={() => c().redo().run()} />
        <Btn label="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => c().toggleHeading({ level: 2 }).run()} />
        <Btn label="H3" active={editor.isActive("heading", { level: 3 })} onClick={() => c().toggleHeading({ level: 3 }).run()} />
        <Btn label="Bold" active={editor.isActive("bold")} onClick={() => c().toggleBold().run()} />
        <Btn label="Italic" active={editor.isActive("italic")} onClick={() => c().toggleItalic().run()} />
        <Btn label="List" active={editor.isActive("bulletList")} onClick={() => c().toggleBulletList().run()} />
        <Btn label="1. List" active={editor.isActive("orderedList")} onClick={() => c().toggleOrderedList().run()} />
        <Btn label="Quote" active={editor.isActive("blockquote")} onClick={() => c().toggleBlockquote().run()} />
        <Btn label="Link" active={editor.isActive("link")} onClick={setLink} />
        <Btn label="Image" onClick={() => fileRef.current?.click()} />
        <Btn label="Table" onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
        <Btn label="Code" active={editor.isActive("codeBlock")} onClick={() => c().toggleCodeBlock().run()} />
        <Btn label="Rule" onClick={() => c().setHorizontalRule().run()} />
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
      {inTable ? (
        <div className="rich-bar rich-table" role="toolbar" aria-label="Table">
          <Btn label="Row above" onClick={() => c().addRowBefore().run()} />
          <Btn label="Row below" onClick={() => c().addRowAfter().run()} />
          <Btn label="Column left" onClick={() => c().addColumnBefore().run()} />
          <Btn label="Column right" onClick={() => c().addColumnAfter().run()} />
          <Btn label="Header row" onClick={() => c().toggleHeaderRow().run()} />
          <Btn label="Delete row" onClick={() => c().deleteRow().run()} />
          <Btn label="Delete column" onClick={() => c().deleteColumn().run()} />
          <Btn label="Delete table" onClick={() => c().deleteTable().run()} />
        </div>
      ) : null}
      <div className="rich-wrap">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
