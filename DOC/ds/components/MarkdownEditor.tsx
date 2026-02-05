"use client";

import * as React from "react";

import { Button } from "../primitives/Button";
import { Textarea } from "../primitives/Textarea";

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function basicMarkdownToHtml(md: string) {
  const safe = escapeHtml(md);
  const withCode = safe.replaceAll(/`([^`]+)`/g, "<code>$1</code>");
  const withBold = withCode.replaceAll(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const withItalic = withBold.replaceAll(/\*([^*]+)\*/g, "<em>$1</em>");
  const withLines = withItalic
    .split("\n")
    .map((line) => {
      if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`;
      if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith("# ")) return `<h1>${line.slice(2)}</h1>`;
      return `<p>${line || "&nbsp;"}</p>`;
    })
    .join("\n");
  return withLines;
}

export type MarkdownEditorProps = {
  value: string;
  onValueChange: (v: string) => void;
  className?: string;
};

export function MarkdownEditor({ value, onValueChange, className }: MarkdownEditorProps) {
  const [preview, setPreview] = React.useState(false);
  return (
    <div className={className ?? "ui-md"}>
      <div className="ui-row ui-row--between">
        <div className="text-heading-4">Markdown</div>
        <Button size="sm" variant="secondary" onClick={() => setPreview((v) => !v)}>
          {preview ? "Edit" : "Preview"}
        </Button>
      </div>
      {preview ? (
        <div className="ui-md__preview" dangerouslySetInnerHTML={{ __html: basicMarkdownToHtml(value) }} />
      ) : (
        <Textarea value={value} onChange={(e) => onValueChange(e.target.value)} rows={6} placeholder="Write markdown…" />
      )}
    </div>
  );
}
