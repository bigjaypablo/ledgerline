import { safeImageSrc } from "@/lib/editorial/text";

export function OpportunityLogo({ name, url, size = 48 }: { name: string; url: string; size?: number }) {
  const src = safeImageSrc(url);
  const box = { width: size, height: size };
  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        style={box}
        loading="lazy"
        className="shrink-0 rounded-full border border-line bg-card object-cover"
      />
    );
  }
  return (
    <span
      style={box}
      aria-hidden
      className="inline-grid shrink-0 place-items-center rounded-full border border-line bg-card font-serif font-semibold"
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
