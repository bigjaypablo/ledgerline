import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getMyProfile } from "@/lib/editorial/admin";
import { signOut } from "@/lib/auth/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { Avatar } from "@/components/editorial/account-menu";

type Me = Awaited<ReturnType<typeof getMyProfile>>;

export function PublicAccountMenu() {
  const user = useCurrentUser();
  const [staff, setStaff] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    let live = true;
    const load = () =>
      getMyProfile()
        .then((v) => {
          if (live) setStaff(v);
        })
        .catch(() => {
          if (live) setStaff(null); // readers are rejected: that is expected
        });
    void load();
    window.addEventListener("ledgerline:profile-updated", load);
    return () => {
      live = false;
      window.removeEventListener("ledgerline:profile-updated", load);
    };
  }, [user?.id]);

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

  if (!user) return null;
  const name = staff?.displayName || user.displayName || user.primaryEmail || "Reader";
  const email = user.primaryEmail || staff?.email || "";
  const item = "flex min-h-11 w-full items-center px-4 text-left text-sm font-semibold text-ink hover:bg-paper";

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full"
      >
        <Avatar url={staff?.avatarUrl} name={name} />
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-72 max-w-[calc(100vw-2rem)] border border-ink bg-card text-ink shadow-lg">
          <div className="flex items-center gap-3 border-b border-line p-4">
            <Avatar url={staff?.avatarUrl} name={name} size={48} />
            <div className="min-w-0">
              <p className="truncate font-serif text-lg font-semibold leading-tight">{name}</p>
              <p className="truncate text-xs text-muted">{email}</p>
            </div>
          </div>
          <div className="py-1">
            <Link to="/account" className={item} onClick={() => setOpen(false)}>
              Saved articles
            </Link>
            <Link to="/account" className={item} onClick={() => setOpen(false)}>
              Account
            </Link>
            {staff ? (
              <Link to="/admin" className={item} onClick={() => setOpen(false)}>
                Open the desk
              </Link>
            ) : null}
          </div>
          <div className="border-t border-line py-1">
            <button
              type="button"
              disabled={busy}
              className={`${item} text-accent disabled:cursor-wait`}
              onClick={() => {
                setBusy(true);
                void signOut("/").catch(() => setBusy(false));
              }}
            >
              {busy ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
