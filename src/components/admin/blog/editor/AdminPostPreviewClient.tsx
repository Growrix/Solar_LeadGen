'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Eye, Loader2, AlertCircle } from 'lucide-react';
import { getAdminBlogPostById, type AdminBlogPost } from '@/lib/blog/adminApiClient';

type ViewState = 'loading' | 'ready' | 'error' | 'not-found';

export function AdminPostPreviewClient(props: { id: string }) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [post, setPost] = useState<AdminBlogPost | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setViewState('loading');
      try {
        const found = await getAdminBlogPostById(props.id);
        if (cancelled) return;

        if (!found) {
          setViewState('not-found');
          setPost(null);
          return;
        }

        setPost(found);
        setViewState('ready');
      } catch {
        if (cancelled) return;
        setViewState('error');
        setPost(null);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [props.id]);

  const cover = useMemo(() => {
    const url = post?.coverImageUrl?.trim();
    return url ? url : null;
  }, [post?.coverImageUrl]);

  if (viewState === 'loading') {
    return (
      <div className="p-8 bg-background text-foreground min-h-screen">
        <div className="flex items-center gap-3 text-body text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading preview...
        </div>
      </div>
    );
  }

  if (viewState === 'not-found') {
    return (
      <div className="p-8 bg-background text-foreground min-h-screen">
        <div className="bg-surface rounded-lg border border-border p-8 max-w-3xl">
          <h2 className="text-heading-4">Post not found</h2>
          <p className="text-body text-muted-foreground mt-2">This post may have been deleted.</p>
          <div className="mt-6">
            <Link href="/admin/blog/content-manager" className="text-accent hover:underline">
              Back to Content Manager
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (viewState === 'error' || !post) {
    return (
      <div className="p-8 bg-background text-foreground min-h-screen">
        <div className="bg-surface rounded-lg border border-destructive/20 p-8 max-w-3xl">
          <div className="flex items-start gap-3">
            <div className="bg-destructive/10 p-2 rounded-full border border-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-heading-4">Could not load preview</h2>
              <p className="text-body text-muted-foreground mt-1">Please try again.</p>
              <div className="mt-6">
                <Link href={`/admin/blog/${encodeURIComponent(props.id)}`} className="text-accent hover:underline">
                  Back to editor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 bg-background text-foreground min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/blog/${encodeURIComponent(props.id)}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="w-px h-5 bg-border" />
            <h1 className="text-heading-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-accent" />
              Preview
            </h1>
          </div>

          <div className="text-caption text-muted-foreground font-mono">ID: {post.id}</div>
        </div>

        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          {cover && (
            <div className="relative w-full aspect-[16/9] bg-muted">
              <Image src={cover} alt="Cover" fill sizes="100vw" className="object-cover" />
            </div>
          )}

          <div className="p-6 sm:p-10">
            <div className="mb-6">
              <div className="text-caption text-muted-foreground mb-2">/{post.slug}</div>
              <h2 className="text-heading-1 leading-tight">{post.title || '(Untitled)'}</h2>
              {post.excerpt && <p className="mt-4 text-body text-muted-foreground">{post.excerpt}</p>}
            </div>

            {post.content ? (
              <div
                className="prose max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-accent prose-blockquote:text-muted-foreground prose-li:text-foreground prose-code:text-foreground"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <div className="text-body text-muted-foreground italic">No content.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
