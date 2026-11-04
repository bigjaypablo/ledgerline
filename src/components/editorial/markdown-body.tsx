import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { headingIds } from "@/lib/editorial/text";

const ALLOWED = ["p", "br", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "a", "strong", "em", "del", "u", "code", "pre", "hr", "img", "table", "thead", "tbody", "tr", "th", "td"];

export function MarkdownBody({ markdown }: { markdown: string }) {
  const ids = headingIds(markdown);
  let index = 0;
  const takeId = () => ids[index++]?.id ?? "section";

  return (
    <div className="mx-auto max-w-3xl break-words text-[17px] leading-[1.65] text-ink">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        allowedElements={ALLOWED}
        unwrapDisallowed
        components={{
          h2: ({ children }) => (
            <h2 id={takeId()} className="mt-8 mb-3 scroll-mt-24 font-serif text-2xl font-bold tracking-tight text-ink">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 id={takeId()} className="mt-6 mb-2 scroll-mt-24 font-sans text-lg font-bold tracking-tight text-ink/90">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mt-3 mb-3">{children}</p>,
          ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-5">{children}</ol>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-2 border-accent pl-4 text-muted italic">{children}</blockquote>
          ),
          a: ({ href, children }) => {
            const external = Boolean(href && /^https?:\/\//i.test(href));
            return (
              <a
                href={href}
                className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {children}
              </a>
            );
          },
          table: ({ children }) => (
            <div className="my-4 max-w-full overflow-x-auto border border-line">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border-b border-ink bg-card px-3 py-2 text-xs font-bold tracking-wider uppercase">{children}</th>,
          td: ({ children }) => <td className="border-b border-line px-3 py-2 align-top text-sm leading-6">{children}</td>,
          code: ({ className, children }) => {
            const block = Boolean(className);
            if (block) {
              return <code className="font-mono text-xs">{children}</code>;
            }
            return <code className="bg-line/60 rounded px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>;
          },
          pre: ({ children }) => (
            <pre className="my-4 max-w-full overflow-x-auto bg-ink p-4 text-inverse-fg rounded-sm">{children}</pre>
          ),
          hr: () => <hr className="my-6 border-line" />,
          img: ({ src, alt, title }) => {
            const allowed =
              typeof src === "string" &&
              (src.startsWith("/") || src.startsWith("https://") || src.startsWith("data:image/jpeg"));
            if (!allowed) return null;
            return (
              <span className="my-6 block">
                <img src={src} alt={alt ?? ""} className="w-full rounded-sm" />
                {title ? <span className="mt-2 block text-center text-xs leading-5 text-muted">{title}</span> : null}
              </span>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

export function TableOfContents({ markdown }: { markdown: string }) {
  const items = headingIds(markdown).filter((item) => item.level === 2);
  const [open, setOpen] = useState(true);
  if (items.length < 2) return null;
  return (
    <nav className="my-5 mx-auto max-w-3xl border-y border-line py-3" aria-label="Contents">
      <button type="button" className="text-xs font-bold tracking-widest uppercase text-muted hover:text-ink" onClick={() => setOpen((value) => !value)}>
        Contents {open ? "–" : "+"}
      </button>
      {open ? (
        <ol className="mt-2.5 space-y-1.5 text-sm">
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="text-muted hover:text-accent transition-colors">
                {item.text.replace(/\((?:https?:\/\/|\/)[^\s)]*\)/g, "").replace(/\s{2,}/g, " ").trim()}
              </a>
            </li>
          ))}
        </ol>
      ) : null}
    </nav>
  );
}
