import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getMyProfile } from "@/lib/editorial/admin";
import { authEnabled, signOut } from "@/lib/auth/client";

type Me = Awaited<ReturnType<typeof getMyProfile>>;

export function Avatar({ url, name, size = 40 }: { url?: string; name: string; size?: number }) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("") || "?";
  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-full border border-ink bg-ink font-semibold text-inverse-fg"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : initials}
    </span>
  );
}

export function AccountMenu() {
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    const load = () =>
      getMyProfile()
        .then((v) => {
          if (live) setMe(v);
        })
        .catch(() => {});
    void load();
    window.addEventListener("ledgerline:profile-updated", load);
    return () => {
      live = false;
      window.removeEventListener("ledgerline:profile-updated", load);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const name = me?.displayName || "Account";
  const item = "flex min-h-11 w-full items-center px-4 text-left text-sm font-semibold hover:bg-paper";

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full focus-visible:outline-2"
      >
        <Avatar url={me?.avatarUrl} name={name} />
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-72 max-w-[calc(100vw-2rem)] border border-ink bg-card shadow-lg">
          <div className="flex items-center gap-3 border-b border-line p-4">
            <Avatar url={me?.avatarUrl} name={name} size={48} />
            <div className="min-w-0">
              <p className="truncate font-serif text-lg font-semibold leading-tight">{name}</p>
              <p className="truncate text-xs text-muted">{me?.email || ""}</p>
              {me ? (
                <span className="mt-1 inline-block border border-ink px-1.5 text-[10px] font-bold tracking-widest uppercase">
                  {me.role}
                </span>
              ) : null}
            </div>
          </div>
          <div className="py-1">
            <Link to="/admin/profile" className={item} onClick={() => setOpen(false)}>
              Profile settings
            </Link>
            <Link to="/" className={item} onClick={() => setOpen(false)}>
              View site
            </Link>
            {me?.role === "admin" ? (
              <Link to="/admin/settings" className={item} onClick={() => setOpen(false)}>
                People and settings
              </Link>
            ) : null}
          </div>
          {authEnabled ? (
            <div className="border-t border-line py-1">
              <button
                type="button"
                disabled={busy}
                className={`${item} text-accent disabled:cursor-wait`}
                onClick={() => {
                  setBusy(true);
                  void signOut("/admin/login").catch(() => setBusy(false));
                }}
              >
                {busy ? "Signing out…" : "Sign out"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
