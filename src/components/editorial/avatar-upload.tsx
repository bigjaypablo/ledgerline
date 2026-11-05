import { useEffect, useState } from "react";
import { Avatar } from "@/components/editorial/account-menu";
import {
  getMyAvatar,
  removeMyAvatar,
  uploadMyAvatar,
} from "@/lib/editorial/avatar";

async function toSquareJpeg(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that image.");
  const sx = (bmp.width - side) / 2;
  const sy = (bmp.height - side) / 2;
  ctx.drawImage(bmp, sx, sy, side, side, 0, 0, 256, 256);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function announce() {
  window.dispatchEvent(new Event("ledgerline:profile-updated"));
}

export function PhotoButton(props: {
  className: string;
  label?: string;
  onError?: (m: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await toSquareJpeg(file);
      await uploadMyAvatar({ data: { dataUrl } });
      announce();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed.";
      props.onError?.(msg);
    } finally {
      setBusy(false);
    }
  }
  return (
    <label className={props.className}>
      {busy ? "Uploading…" : (props.label ?? "Profile photo")}
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          void pick(f);
        }}
      />
    </label>
  );
}

export function AvatarPicker({ name }: { name: string }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    const load = () =>
      getMyAvatar()
        .then((r) => live && setUrl(r.avatarUrl))
        .catch(() => {});
    void load();
    window.addEventListener("ledgerline:profile-updated", load);
    return () => {
      live = false;
      window.removeEventListener("ledgerline:profile-updated", load);
    };
  }, []);
  const btn =
    "inline-flex min-h-11 cursor-pointer items-center border " +
    "border-ink px-4 text-sm font-semibold";
  return (
    <div className="mt-6 flex items-center gap-4">
      <Avatar url={url} name={name} size={72} />
      <div className="flex flex-wrap gap-2">
        <PhotoButton
          className={btn}
          label={url ? "Change photo" : "Upload photo"}
          onError={setError}
        />
        {url ? (
          <button
            type="button"
            className={btn}
            onClick={() =>
              void removeMyAvatar().then(announce).catch(() => {})
            }
          >
            Remove photo
          </button>
        ) : null}
        {error ? <p className="w-full text-sm text-accent">{error}</p> : null}
      </div>
    </div>
  );
}
