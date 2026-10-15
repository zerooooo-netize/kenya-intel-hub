import ReactMarkdown from "react-markdown";

/** Renders AI-generated markdown as formatted rich text (headings, bold, lists, links). */
export default function MarkdownView({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`text-sm leading-relaxed space-y-3 ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mt-4 mb-1.5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-1">{children}</h3>,
          p: ({ children }) => <p className="text-sm leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-primary hover:underline">{children}</a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/40 pl-3 italic text-muted-foreground">{children}</blockquote>
          ),
          hr: () => <hr className="border-border/60 my-3" />,
          code: ({ children }) => (
            <code className="bg-muted/60 rounded px-1 py-0.5 text-xs font-mono">{children}</code>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
