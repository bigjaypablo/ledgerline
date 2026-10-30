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
    <div className="max-w-4xl text-lg leading-8">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        allowedElements={ALLOWED}
        unwrapDisallowed
        components={{
          h2: ({ children }) => (
            <h2 id={takeId()} className="mt-10 scroll-mt-24 font-serif text-3xl font-semibold leading-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 id={takeId()} className="mt-8 scroll-mt-24 font-serif text-2xl font-semibold">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mt-4">{children}</p>,
          ul: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-5">{children}</ol>,
          blockquote: ({ children }) => (
            <blockquote className="mt-4 border-l-4 border-accent pl-4 text-muted">{children}</blockquote>
          ),
          a: ({ href, children }) => {
            const external = Boolean(href && /^https?:\/\//i.test(href));
            return (
              <a
                href={href}
                className="text-accent underline decoration-accent/40 underline-offset-2"
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {children}
              </a>
            );
          },
          table: ({ children }) => (
            <div className="mt-4 max-w-full overflow-x-auto border border-line">
              <table className="w-full min-w-[36rem] border-collapse text-left text-base">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border-b border-ink bg-card px-3 py-2 text-sm font-bold">{children}</th>,
          td: ({ children }) => <td className="border-b border-line px-3 py-2 align-top text-sm leading-6">{children}</td>,
          code: ({ className, children }) => {
            const block = Boolean(className);
            if (block) {
              return <code className="font-mono text-sm">{children}</code>;
            }
            return <code className="bg-line px-1 font-mono text-base">{children}</code>;
          },
          pre: ({ children }) => (
            <pre className="mt-4 max-w-full overflow-x-auto bg-ink p-4 text-inverse-fg">{children}</pre>
          ),
          hr: () => <hr className="my-8 border-ink" />,
          img: ({ src, alt }) => {
            const allowed =
              typeof src === "string" &&
              (src.startsWith("/") || src.startsWith("https://") || src.startsWith("data:image/jpeg"));
            if (!allowed) return null;
            return <img src={src} alt={alt ?? ""} className="mt-4 w-full" />;
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
    <nav className="my-6 max-w-4xl border-y border-line py-4" aria-label="Contents">
      <button type="button" className="text-xs font-bold tracking-widest uppercase" onClick={() => setOpen((value) => !value)}>
        Contents {open ? "–" : "+"}
      </button>
      {open ? (
        <ol className="mt-3 space-y-2 text-base">
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="hover:text-accent">
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      ) : null}
    </nav>
  );
}
