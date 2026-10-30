import { useState } from "react";

export function ShareLinks({ title, url, xHref }: { title: string; url: string; xHref: string }) {
  const [note, setNote] = useState("");
  const t = encodeURIComponent(title);
  const u = encodeURIComponent(url);
  const links: [string, string][] = [
    ["X", xHref],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ["Threads", `https://www.threads.net/intent/post?text=${t}%20${u}`],
    ["WhatsApp", `https://wa.me/?text=${t}%20${u}`],
    ["Telegram", `https://t.me/share/url?url=${u}&text=${t}`],
  ];
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <>
      <span className="text-muted">Share:</span>
      {links.map(([name, href]) => (
        <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="text-accent">
          {name}
        </a>
      ))}
      <button
        type="button"
        className="text-accent"
        onClick={() => {
          void navigator.clipboard
            .writeText(url)
            .then(() => setNote("Link copied"))
            .catch(() => setNote("Could not copy"));
        }}
      >
        Copy link
      </button>
      {canNativeShare ? (
        <button
          type="button"
          className="text-accent"
          onClick={() => {
            void navigator.share({ title, url }).catch(() => {});
          }}
        >
          More (Instagram…)
        </button>
      ) : null}
      {note ? <span className="text-muted">{note}</span> : null}
    </>
  );
}
