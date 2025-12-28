'use client';

import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

export default function BlogPostContent({
  content,
  format,
}: {
  content: string;
  format: 'markdown' | 'html' | 'plaintext';
}) {
  const sanitized = useMemo(() => {
    if (format !== 'html') return null;
    return DOMPurify.sanitize(content, {
      USE_PROFILES: { html: true },
    });
  }, [content, format]);

  if (format === 'html') {
    return (
      <div
        className="space-y-6"
        dangerouslySetInnerHTML={{ __html: sanitized ?? '' }}
      />
    );
  }

  return (
    <div className="whitespace-pre-wrap text-foreground leading-relaxed">
      {content}
    </div>
  );
}
