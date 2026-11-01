import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getMyProfile, saveMyProfile, uploadImage } from "@/lib/editorial/admin";
import { Avatar } from "@/components/editorial/account-menu";

type Me = Awaited<ReturnType<typeof getMyProfile>>;

async function toAvatarJpeg(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const size = 320;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process that image.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  const s = Math.min(bmp.width, bmp.height);
  ctx.drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.85);
}

const input = "mt-1 min-h-11 w-full border border-line bg-card px-3";

export function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [form, setForm] = useState({ displayName: "", bio: "", xHandle: "", xUrl: "", avatarUrl: "" });
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMyProfile()
      .then((v) => {
        setMe(v);
        setForm({ displayName: v.displayName, bio: v.bio, xHandle: v.xHandle, xUrl: v.xUrl, avatarUrl: v.avatarUrl });
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Could not load your profile."));
  }, []);

  async function save(next = form) {
    setBusy(true);
    setNote("");
    setError("");
    try {
      await saveMyProfile({ data: next });
      setNote("Saved.");
      window.dispatchEvent(new Event("ledgerline:profile-updated"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function pick(f: File | undefined) {
    if (!f) return;
    setBusy(true);
    setNote("");
    setError("");
    try {
      const dataUrl = await toAvatarJpeg(f);
      const { url } = await uploadImage({ data: { dataUrl } });
      const next = { ...form, avatarUrl: url };
      setForm(next);
      await save(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload the photo.");
      setBusy(false);
    }
  }

  if (error && !me) return <p className="text-accent">{error}</p>;
  if (!me) return <p className="text-muted">Loading…</p>;

  return (
    <main className="mx-auto max-w-xl">
      <Link to="/admin" className="text-sm font-semibold text-accent">
        ← Desk
      </Link>
      <h1 className="mt-2 font-serif text-4xl font-semibold">Profile settings</h1>

      <section className="mt-6 flex items-center gap-4 border border-line bg-card p-4">
        <Avatar url={form.avatarUrl} name={form.displayName || "?"} size={80} />
        <div className="min-w-0">
          <p className="truncate font-serif text-xl font-semibold">{form.displayName || "Your name"}</p>
          <p className="truncate text-xs text-muted">{me.email}</p>
          <span className="mt-1 inline-block border border-ink px-1.5 text-[10px] font-bold tracking-widest uppercase">
            {me.role}
          </span>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => file.current?.click()}
              className="min-h-11 text-sm font-semibold text-accent disabled:opacity-50"
            >
              Change photo
            </button>
            {form.avatarUrl ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  const next = { ...form, avatarUrl: "" };
                  setForm(next);
                  void save(next);
                }}
                className="min-h-11 text-sm font-semibold text-muted disabled:opacity-50"
              >
                Remove
              </button>
            ) : null}
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
      </section>

      <form
        className="mt-6 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <label className="text-sm font-semibold">
          Display name
          <input className={input} value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
        </label>
        <label className="text-sm font-semibold">
          Bio
          <textarea
            className="mt-1 min-h-28 w-full border border-line bg-card px-3 py-2"
            value={form.bio}
            maxLength={800}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          <span className="text-xs font-normal text-muted">{form.bio.length}/800. Shown at the bottom of your articles.</span>
        </label>
        <label className="text-sm font-semibold">
          X handle
          <input className={input} value={form.xHandle} onChange={(e) => setForm({ ...form, xHandle: e.target.value })} />
        </label>
        <label className="text-sm font-semibold">
          X link
          <input className={input} placeholder="https://x.com/yourname" value={form.xUrl} onChange={(e) => setForm({ ...form, xUrl: e.target.value })} />
        </label>
        <button type="submit" disabled={busy} className="min-h-11 bg-ink px-4 text-sm font-semibold text-inverse-fg disabled:opacity-50">
          {busy ? "Saving…" : "Save profile"}
        </button>
        {note ? <p className="text-sm font-semibold">{note}</p> : null}
        {error ? <p className="text-sm text-accent">{error}</p> : null}
      </form>
    </main>
  );
}
