'use client';

import React from 'react';
import Image from 'next/image';
import { X, Mail, Calendar, Shield } from 'lucide-react';
import type { AuthorProfile } from '@/components/admin/blog/shared/authorTypes';

type AuthorPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  author: AuthorProfile | null;
};

export function AuthorPreviewModal({ isOpen, onClose, author }: AuthorPreviewModalProps) {
  if (!isOpen || !author) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-overlay/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-surface rounded-card shadow-modal w-full max-w-md overflow-hidden animate-fade-in-up border border-border">
        <div className="h-32 bg-accent/15 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-surface/70 hover:bg-surface text-foreground rounded-full transition-colors backdrop-blur-sm border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <X className="icon-sm" />
          </button>
        </div>

        <div className="px-6 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <Image
              src={author.avatar}
              alt={author.name}
              width={96}
              height={96}
              sizes="96px"
              className="w-24 h-24 rounded-full border-4 border-border bg-background-alt object-cover shadow-card"
            />
            <span
              className={`px-3 py-1 rounded-full text-label uppercase tracking-wide border shadow-button mb-2 ${
                author.status === 'active'
                  ? 'bg-success/15 text-success border-success/20'
                  : 'bg-muted text-foreground-muted border-border'
              }`}
            >
              {author.status}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-heading-2 text-foreground">{author.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-caption capitalize border ${
                  author.role === 'admin'
                    ? 'bg-accent/15 text-accent border-accent/20'
                    : author.role === 'editor'
                      ? 'bg-info/15 text-info border-info/20'
                      : author.role === 'contributor'
                        ? 'bg-success/15 text-success border-success/20'
                        : 'bg-muted text-foreground-muted border-border'
                }`}
              >
                <Shield className="icon-xs" />
                {author.role}
              </span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-body-small text-foreground-muted">
              <div className="w-8 h-8 rounded-full bg-background-alt border border-border flex items-center justify-center text-muted-foreground">
                <Mail className="icon-sm" />
              </div>
              <a href={`mailto:${author.email}`} className="hover:text-accent transition-colors">
                {author.email}
              </a>
            </div>
            <div className="flex items-center gap-3 text-body-small text-foreground-muted">
              <div className="w-8 h-8 rounded-full bg-background-alt border border-border flex items-center justify-center text-muted-foreground">
                <Calendar className="icon-sm" />
              </div>
              <span>Joined {author.joinedAt}</span>
            </div>
          </div>

          <div className="bg-background-alt rounded-card p-4 border border-border">
            <h3 className="text-label text-foreground uppercase tracking-wider mb-2">About</h3>
            <p className="text-body-small text-foreground-muted leading-relaxed">{author.bio || 'No bio provided yet.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
