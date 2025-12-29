'use client';

import React, { useMemo } from 'react';

export default function BlogPostContent({
  content,
  format,
}: {
  content: string;
  format: 'markdown' | 'html' | 'plaintext';
}) {
  const htmlAsText = useMemo(() => {
    if (format !== 'html') return null;
    if (typeof window === 'undefined') return content;
    try {
      const doc = new DOMParser().parseFromString(content, 'text/html');
      return doc.body.textContent ?? '';
    } catch {
      return content;
    }
  }, [content, format]);

  if (format === 'html') {
    return (
      <div className="whitespace-pre-wrap text-foreground leading-relaxed">
        {htmlAsText ?? ''}
      </div>
    );
  }

  return (
    <div className="whitespace-pre-wrap text-foreground leading-relaxed">
      {content}
    </div>
  );
}
