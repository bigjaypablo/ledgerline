import type { ReactNode } from "react";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 border-t border-line pt-5">
      <h2 className="text-xs font-bold tracking-widest text-accent uppercase">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i} className="mt-2 text-base leading-7 first:mt-0">
          {p}
        </p>
      ))}
    </>
  );
}
