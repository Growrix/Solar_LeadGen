'use client';

import React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipTapLink from '@tiptap/extension-link';
import TipTapUnderline from '@tiptap/extension-underline';
import TipTapImage from '@tiptap/extension-image';
import {
  Bold,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Eye,
  Code,
  Wand2,
} from 'lucide-react';

function normalizeHtmlConservatively(html: string): string {
  const raw = (html ?? '').trim();
  if (!raw) return '';

  try {
    const doc = new DOMParser().parseFromString(raw, 'text/html');
    const body = doc.body;

    // Remove empty paragraphs and collapse whitespace-only nodes.
    const paragraphs = Array.from(body.querySelectorAll('p'));
    for (const p of paragraphs) {
      const text = (p.textContent ?? '').replace(/\s+/g, ' ').trim();
      const hasMedia = p.querySelector('img,video,iframe,code,pre');
      if (!text && !hasMedia) {
        p.remove();
      }
    }

    // Remove consecutive <br> chains.
    const brs = Array.from(body.querySelectorAll('br'));
    for (const br of brs) {
      const next = br.nextSibling;
      if (next && next.nodeName === 'BR') {
        br.remove();
      }
    }

    return (body.innerHTML ?? '').trim();
  } catch {
    return raw;
  }
}

export function RichHtmlEditor({
  initialHtml,
  onHtmlChange,
  className,
}: {
  initialHtml: string;
  onHtmlChange: (nextHtml: string) => void;
  className?: string;
}) {
  const [isPreview, setIsPreview] = React.useState(false);
  const [showRawHtml, setShowRawHtml] = React.useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TipTapLink.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-brand-accent underline underline-offset-4',
        },
      }),
      TipTapUnderline,
      TipTapImage.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-2xl border border-border shadow-neu-outset',
        },
      }),
    ],
    content: initialHtml?.trim() ? initialHtml : '<p></p>',
    onUpdate: ({ editor: ed }) => {
      onHtmlChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-neutral prose-lg max-w-none focus:outline-none min-h-[360px] px-4 py-3 text-foreground',
      },
    },
  });

  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((initialHtml ?? '').trim() === current.trim()) return;
    editor.commands.setContent(initialHtml?.trim() ? initialHtml : '<p></p>', { emitUpdate: false });
  }, [editor, initialHtml]);

  const canToggle = Boolean(editor);

  const currentHtml = editor?.getHTML() ?? initialHtml;

  const setLink = React.useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter URL', previousUrl ?? 'https://');
    if (url === null) return;
    const next = url.trim();
    if (!next) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: next }).run();
  }, [editor]);

  const insertImage = React.useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter image URL (https://...)', 'https://');
    if (url === null) return;
    const src = url.trim();
    if (!src) return;
    editor.chain().focus().setImage({ src }).run();
  }, [editor]);

  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    label,
    icon,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    label: string;
    icon: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border text-foreground shadow-neu-outset active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
        active ? 'bg-accent text-background border-accent' : 'bg-background border-border hover:bg-surface'
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className={className ?? ''}>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <ToolbarButton
          label="Bold"
          icon={<Bold size={16} />}
          disabled={!canToggle}
          active={editor?.isActive('bold')}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          icon={<Italic size={16} />}
          disabled={!canToggle}
          active={editor?.isActive('italic')}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="Underline"
          icon={<span className="text-body-small underline">U</span>}
          disabled={!canToggle}
          active={editor?.isActive('underline')}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          label="Heading 1"
          icon={<Heading1 size={16} />}
          disabled={!canToggle}
          active={editor?.isActive('heading', { level: 1 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton
          label="Heading 2"
          icon={<Heading2 size={16} />}
          disabled={!canToggle}
          active={editor?.isActive('heading', { level: 2 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="Heading 3"
          icon={<Heading3 size={16} />}
          disabled={!canToggle}
          active={editor?.isActive('heading', { level: 3 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarButton
          label="Bullet list"
          icon={<List size={16} />}
          disabled={!canToggle}
          active={editor?.isActive('bulletList')}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Numbered list"
          icon={<ListOrdered size={16} />}
          disabled={!canToggle}
          active={editor?.isActive('orderedList')}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          label="Link"
          icon={<LinkIcon size={16} />}
          disabled={!canToggle}
          active={editor?.isActive('link')}
          onClick={setLink}
        />
        <ToolbarButton
          label="Insert image"
          icon={<ImageIcon size={16} />}
          disabled={!canToggle}
          active={false}
          onClick={insertImage}
        />

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!editor) return;
              const normalized = normalizeHtmlConservatively(editor.getHTML());
              editor.commands.setContent(normalized?.trim() ? normalized : '<p></p>', { emitUpdate: false });
              onHtmlChange(editor.getHTML());
            }}
            disabled={!editor}
            className="inline-flex items-center gap-2 px-4 h-10 rounded-xl border border-border bg-background text-body-small text-foreground hover:bg-surface shadow-neu-outset active:scale-95 disabled:opacity-50"
            title="Normalize spacing and remove empty blocks"
          >
            <Wand2 size={16} />
            Format
          </button>

          <button
            type="button"
            onClick={() => setIsPreview((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 h-10 rounded-xl border shadow-neu-outset active:scale-95 ${
              isPreview ? 'bg-accent text-background border-accent' : 'bg-background text-foreground border-border hover:bg-surface'
            }`}
            title="Toggle preview"
          >
            <Eye size={16} />
            Preview
          </button>

          <button
            type="button"
            onClick={() => setShowRawHtml((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 h-10 rounded-xl border shadow-neu-outset active:scale-95 ${
              showRawHtml ? 'bg-surface text-foreground border-border' : 'bg-background text-foreground border-border hover:bg-surface'
            }`}
            title="Advanced raw HTML view"
          >
            <Code size={16} />
            Raw HTML
          </button>
        </div>
      </div>

      {showRawHtml ? (
        <div className="space-y-2">
          <p className="text-body-small text-muted-foreground">
            Advanced: edit HTML directly. Use with care.
          </p>
          <textarea
            className="w-full min-h-[260px] px-4 py-3 rounded-2xl bg-surface border border-border text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
            value={currentHtml}
            onChange={(e) => {
              const next = e.target.value;
              onHtmlChange(next);
              editor?.commands.setContent(next?.trim() ? next : '<p></p>', { emitUpdate: false });
            }}
          />
          <p className="text-body-small text-muted-foreground">
            Tip: Links should be full URLs like{' '}
            <span className="text-brand-accent underline">https://example.com</span>
            .
          </p>
        </div>
      ) : isPreview ? (
        <div className="rounded-2xl border border-border bg-background p-6">
          {currentHtml?.trim() ? (
            <div
              className="prose prose-neutral prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: normalizeHtmlConservatively(currentHtml) }}
            />
          ) : (
            <p className="text-body text-muted-foreground">No content yet.</p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-background shadow-neu-outset">
          <EditorContent editor={editor} />
        </div>
      )}

      <p className="pt-3 text-body-small text-muted-foreground">
        Content is stored as HTML in <span className="font-mono">contentHtml</span> and should match the public render.
      </p>
    </div>
  );
}
