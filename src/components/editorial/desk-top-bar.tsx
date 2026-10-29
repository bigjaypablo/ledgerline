import { useState } from "react";
import { IconBtn } from "@/components/editorial/icons";

type Props = {
  tab: "write" | "preview";
  onTab: () => void;
  note: string;
  canPublish: boolean;
  published: boolean;
  canSubmit: boolean;
  onSettings: () => void;
  onSave: () => void;
  onPublish: () => void;
  onSubmit: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
};

export function DeskTopBar(p: Props) {
  const [menu, setMenu] = useState(false);
  const run = (fn: () => void) => () => {
    setMenu(false);
    fn();
  };
  return (
    <div className="desk-bar">
      <IconBtn label={p.tab === "write" ? "Preview" : "Back to writing"} icon={p.tab === "write" ? "eye" : "pencil"} onClick={p.onTab} />
      <p className="desk-note" title={p.note}>
        {p.note}
      </p>
      <IconBtn label="Post settings" icon="sliders" onClick={p.onSettings} />
      <IconBtn label="Save" icon="save" onClick={p.onSave} />
      {p.canPublish ? (
        <button type="button" className="h-10 shrink-0 bg-ink px-3 text-sm font-semibold text-inverse-fg" onClick={p.onPublish}>
          {p.published ? "Update" : "Publish"}
        </button>
      ) : null}
      <div className="relative">
        <IconBtn label="More actions" icon={menu ? "close" : "more"} active={menu} onClick={() => setMenu((m) => !m)} />
        {menu ? (
          <div className="desk-menu">
            {p.canSubmit ? (
              <button type="button" onClick={run(p.onSubmit)}>
                Submit for review
              </button>
            ) : null}
            {p.canPublish && p.published ? (
              <button type="button" onClick={run(p.onUnpublish)}>
                Unpublish
              </button>
            ) : null}
            {p.canPublish ? (
              <button type="button" onClick={run(p.onArchive)}>
                Archive
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
