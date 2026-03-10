import * as React from "react";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type HighlightedTextProps = {
  text: string;
  query: string;
  caseSensitive?: boolean;
  className?: string;
};

export function HighlightedText({ text, query, caseSensitive = false, className }: HighlightedTextProps) {
  const q = query.trim();
  if (!q) return <span className={className}>{text}</span>;

  const flags = caseSensitive ? "g" : "gi";
  const re = new RegExp(`(${escapeRegExp(q)})`, flags);
  const parts = text.split(re);

  return (
    <span className={className}>
      {parts.map((p, i) => {
        const isMatch = caseSensitive ? p === q : p.toLowerCase() === q.toLowerCase();
        return isMatch ? (
          <mark key={i} className="ui-highlight">
            {p}
          </mark>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        );
      })}
    </span>
  );
}
