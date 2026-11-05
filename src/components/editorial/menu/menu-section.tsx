import type { ReactNode } from "react";

export function MenuSection({ label, badge, children }: { label: string; badge?: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-widest text-accent uppercase">{label}</h2>
        {badge ? (
          <span className="bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-accent uppercase">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="mt-1">{children}</div>
    </section>
  );
}
