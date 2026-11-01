import { useEffect, useState } from "react";

const KEY = "ledgerline:theme";
type Mode = "system" | "light" | "dark";

function apply(mode: Mode) {
  const el = document.documentElement;
  if (mode === "system") el.removeAttribute("data-theme");
  else el.setAttribute("data-theme", mode);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(KEY);
      if (v === "light" || v === "dark") setMode(v);
    } catch {
      /* storage blocked: stay on system */
    }
  }, []);

  function pick(next: Mode) {
    setMode(next);
    apply(next);
    try {
      if (next === "system") window.localStorage.removeItem(KEY);
      else window.localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  }

  const options: Array<[Mode, string]> = [
    ["system", "System"],
    ["light", "Light"],
    ["dark", "Dark"],
  ];

  return (
    <div className="inline-flex border border-line" role="radiogroup" aria-label="Colour theme">
      {options.map(([value, label]) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={mode === value}
          onClick={() => pick(value)}
          className={`min-h-9 px-3 text-xs font-semibold ${mode === value ? "bg-ink text-inverse-fg" : "text-muted"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
