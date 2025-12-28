'use client';

import React, { useCallback } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';

type RichTextEditorProps = {
  value: string;
  placeholder?: string;
  onChange: (nextHtml: string) => void;
};

function ToolbarButton({
  active,
  disabled,
  label,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        `px-3 py-2 rounded-xl border border-border/50 shadow-neu-outset-sm transition-colors text-body-small ` +
        (active ? 'bg-accent/10 text-accent' : 'bg-surface text-muted-foreground hover:text-foreground') +
        (disabled ? ' opacity-50 cursor-not-allowed' : '')
      }
    >
      {label}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder = 'Write your post…' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap w-full min-h-[320px] px-4 py-3 text-body-small leading-relaxed',
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter URL', previousUrl ?? '');
    if (url === null) return;

    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="form-input w-full p-0">
        <div className="p-4">
          <p className="text-body-small text-muted-foreground">Loading editor…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-input w-full p-0">
      <div className="flex flex-wrap gap-2 p-3 border-b border-border/50">
        <ToolbarButton
          label="B"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="I"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="U"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          label="H2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="• List"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="1. List"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          label="Link"
          active={editor.isActive('link')}
          onClick={setLink}
        />
        <ToolbarButton label="Clear" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} />
      </div>

      <EditorContent editor={editor} className="tiptap-editor" />
    </div>
  );
}
