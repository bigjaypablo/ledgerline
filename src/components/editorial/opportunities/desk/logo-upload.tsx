import { useRef, useState } from "react";
import { uploadImage } from "@/lib/editorial/admin";
import { OpportunityLogo } from "@/components/editorial/opportunities/logo";

async function toJpeg(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that image.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 256, 256);
  ctx.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, 256, 256);
  return canvas.toDataURL("image/jpeg", 0.88);
}

export function LogoUpload({ name, url, onChange }: { name: string; url: string; onChange: (url: string) => void }) {
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(f: File | undefined) {
    if (!f) return;
    setBusy(true);
    setError("");
    try {
      const { url: next } = await uploadImage({ data: { dataUrl: await toJpeg(f) } });
      onChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3 md:col-span-2">
      <OpportunityLogo name={name || "?"} url={url} size={56} />
      <div>
        <button type="button" disabled={busy} onClick={() => file.current?.click()} className="min-h-11 border border-line px-4 text-sm font-semibold disabled:opacity-50">
          {busy ? "Uploading…" : url ? "Change logo" : "Upload logo"}
        </button>
        {url ? (
          <button type="button" onClick={() => onChange("")} className="ml-2 min-h-11 text-sm font-semibold text-muted">
            Remove
          </button>
        ) : null}
        {error ? <p className="text-sm text-accent">{error}</p> : null}
      </div>
      <input
        ref={file}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
