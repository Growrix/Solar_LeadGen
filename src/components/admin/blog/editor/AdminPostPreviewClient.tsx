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
      <div className="p-8">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading preview...
        </div>
      </div>
    );
  }

  if (viewState === 'not-found') {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg border border-slate-200 p-8 max-w-3xl">
          <h2 className="text-lg font-semibold text-slate-900">Post not found</h2>
          <p className="text-slate-600 mt-2">This post may have been deleted.</p>
          <div className="mt-6">
            <Link href="/admin/blog/content-manager" className="text-solar-700 hover:underline">
              Back to Content Manager
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (viewState === 'error' || !post) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg border border-red-200 p-8 max-w-3xl">
          <div className="flex items-start gap-3">
            <div className="bg-red-50 p-2 rounded-full">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Could not load preview</h2>
              <p className="text-slate-600 mt-1">Please try again.</p>
              <div className="mt-6">
                <Link href={`/admin/blog/${encodeURIComponent(props.id)}`} className="text-solar-700 hover:underline">
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
    <div className="p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href={`/admin/blog/${encodeURIComponent(props.id)}`} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="w-px h-5 bg-slate-200" />
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-solar-600" />
              Preview
            </h1>
          </div>

          <div className="text-xs text-slate-500 font-mono">ID: {post.id}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {cover && (
            <div className="relative w-full aspect-[16/9] bg-slate-100">
              <Image src={cover} alt="Cover" fill sizes="100vw" className="object-cover" />
            </div>
          )}

          <div className="p-6 sm:p-10">
            <div className="mb-6">
              <div className="text-xs text-slate-500 mb-2">/{post.slug}</div>
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">{post.title || '(Untitled)'}</h2>
              {post.excerpt && <p className="mt-4 text-slate-600 text-base">{post.excerpt}</p>}
            </div>

            {post.content ? (
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <div className="text-slate-500 italic">No content.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
