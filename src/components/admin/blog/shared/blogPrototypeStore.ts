'use client';

import React from 'react';
import { usePersistentState } from '@/components/admin/blog/shared/usePersistentState';

export type MediaType = 'image' | 'video' | 'document';

export interface MediaReference {
  id: string;
  title: string;
  slug: string;
  type: 'post' | 'page';
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  type: 'media';
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: MediaType;
  size: string;
  uploadedAt: string;
  dimensions?: string;
  altText?: string;
  caption?: string;
  tags?: string[];
  references?: MediaReference[];
  folderId?: string | null;
}

export interface TrashedMediaItem extends MediaItem {
  trashedAt: string;
}

export type CommentStatus = 'pending' | 'approved' | 'hidden' | 'spam';

export interface CommentItem {
  id: string;
  postTitle: string;
  postSlug: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  status: CommentStatus;
  submittedAt: string;
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

const DEFAULT_MEDIA_FOLDERS: MediaFolder[] = [
  { id: 'f1', name: 'Blog Images', parentId: null, createdAt: '2023-01-01', type: 'media' },
  { id: 'f2', name: 'Product Shots', parentId: 'f1', createdAt: '2023-02-15', type: 'media' },
  { id: 'f3', name: 'Documents', parentId: null, createdAt: '2023-03-10', type: 'media' },
  { id: 'f4', name: 'Team Photos', parentId: null, createdAt: '2023-04-05', type: 'media' },
  { id: 'f5', name: 'Events', parentId: 'f4', createdAt: '2023-05-20', type: 'media' },
];

const DEFAULT_MEDIA: MediaItem[] = [
  {
    id: '1',
    name: 'solar-panel-roof.jpg',
    url: 'https://picsum.photos/seed/solar1/800/600',
    type: 'image',
    size: '1.2 MB',
    uploadedAt: 'Oct 24, 2023',
    dimensions: '1920x1080',
    altText: 'Solar panels on a suburban roof',
    caption: 'Residential installation',
    tags: ['roof', 'installation'],
    folderId: 'f1',
    references: [
      { id: '1', title: 'The Future of Solar Energy', slug: 'future-of-solar-energy-2024', type: 'post' },
      { id: '5', title: 'Understanding Net Metering', slug: 'understanding-net-metering', type: 'post' },
    ],
  },
  {
    id: '2',
    name: 'battery-storage-unit.png',
    url: 'https://picsum.photos/seed/solar2/800/600',
    type: 'image',
    size: '2.4 MB',
    uploadedAt: 'Oct 23, 2023',
    dimensions: '2400x1600',
    folderId: 'f2',
    references: [{ id: '6', title: 'The Battery Storage Revolution', slug: 'battery-storage-revolution', type: 'post' }],
  },
  {
    id: '3',
    name: 'installation-guide.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'document',
    size: '4.5 MB',
    uploadedAt: 'Oct 20, 2023',
    folderId: 'f3',
  },
  {
    id: '4',
    name: 'commercial-site-drone.mp4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video',
    size: '24 MB',
    uploadedAt: 'Oct 18, 2023',
    folderId: null,
  },
  {
    id: '5',
    name: 'team-meeting.jpg',
    url: 'https://picsum.photos/seed/solar3/800/600',
    type: 'image',
    size: '3.1 MB',
    uploadedAt: 'Oct 15, 2023',
    dimensions: '4000x3000',
    tags: ['team', 'office'],
    folderId: 'f4',
    references: [{ id: 'about', title: 'About Us', slug: 'about', type: 'page' }],
  },
  {
    id: '6',
    name: 'inverter-schematic.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'document',
    size: '1.8 MB',
    uploadedAt: 'Oct 12, 2023',
    folderId: 'f3',
  },
  {
    id: '7',
    name: 'sunny-day-hero.jpg',
    url: 'https://picsum.photos/seed/solar4/800/600',
    type: 'image',
    size: '0.9 MB',
    uploadedAt: 'Oct 10, 2023',
    dimensions: '1200x800',
    folderId: 'f1',
  },
  {
    id: '8',
    name: 'quarterly-report-q3.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'document',
    size: '1.1 MB',
    uploadedAt: 'Oct 05, 2023',
    folderId: null,
  },
];

const DEFAULT_TRASHED_MEDIA: TrashedMediaItem[] = [
  {
    id: 'tm1',
    name: 'old-logo-v1.png',
    url: 'https://picsum.photos/seed/trash1/200/200',
    type: 'image',
    size: '0.5 MB',
    uploadedAt: 'Jan 10, 2023',
    trashedAt: '2 days ago',
    dimensions: '500x500',
    folderId: 'f1',
  },
  {
    id: 'tm2',
    name: 'deprecated-policy.pdf',
    url: '#',
    type: 'document',
    size: '2.1 MB',
    uploadedAt: 'Feb 15, 2023',
    trashedAt: '1 week ago',
    folderId: null,
  },
];

const DEFAULT_COMMENTS: CommentItem[] = [
  {
    id: '1',
    postTitle: 'The Future of Solar Energy: Trends to Watch in 2024',
    postSlug: 'future-of-solar-energy-2024',
    authorName: 'John Doe',
    authorEmail: 'john@example.com',
    authorAvatar: 'https://picsum.photos/seed/c1/100/100',
    content:
      'This is a fantastic article! I really appreciate the breakdown of PERC technology. Do you think bifacial panels are worth the extra cost for residential setups?',
    status: 'pending',
    submittedAt: '2 hours ago',
  },
  {
    id: '2',
    postTitle: 'Maximizing Efficiency: How to Maintain Your Solar Panels',
    postSlug: 'maximizing-panel-efficiency',
    authorName: 'Jane Smith',
    authorEmail: 'jane.s@example.com',
    authorAvatar: 'https://picsum.photos/seed/c2/100/100',
    content:
      'Great tips. I usually just hose mine down, but I will look into professional cleaning services for the spring.',
    status: 'approved',
    submittedAt: '5 hours ago',
  },
  {
    id: '3',
    postTitle: 'Solar Financing Explained: Leases vs. Loans',
    postSlug: 'solar-financing-explained',
    authorName: 'Mike Ross',
    authorEmail: 'mike.ross@example.com',
    authorAvatar: 'https://picsum.photos/seed/c3/100/100',
    content: 'Click here for cheap solar loans: http://spam-link.com',
    status: 'spam',
    submittedAt: '1 day ago',
  },
  {
    id: '4',
    postTitle: 'The Future of Solar Energy: Trends to Watch in 2024',
    postSlug: 'future-of-solar-energy-2024',
    authorName: 'Sarah Connor',
    authorEmail: 'sarah@skynet.com',
    authorAvatar: 'https://picsum.photos/seed/c4/100/100',
    content: 'The section on battery storage is slightly outdated. The new Iron-Air batteries are cheaper.',
    status: 'approved',
    submittedAt: '1 day ago',
  },
  {
    id: '5',
    postTitle: 'Commercial Solar Benefits',
    postSlug: 'commercial-solar-benefits',
    authorName: 'Bob Builder',
    authorEmail: 'bob@construction.com',
    authorAvatar: 'https://picsum.photos/seed/c5/100/100',
    content: 'Does this apply to small warehouses too? Im looking to install 50kW system.',
    status: 'pending',
    submittedAt: '2 days ago',
  },
  {
    id: '6',
    postTitle: 'Understanding Net Metering',
    postSlug: 'understanding-net-metering',
    authorName: 'Angry User',
    authorEmail: 'angry@internet.com',
    authorAvatar: 'https://picsum.photos/seed/c6/100/100',
    content: "This article is garbage. You don't know what you are talking about.",
    status: 'hidden',
    submittedAt: '3 days ago',
  },
];

export function useBlogPrototypeStore() {
  const [folders, setFolders] = usePersistentState<MediaFolder[]>('admin.blog.proto.media.folders', DEFAULT_MEDIA_FOLDERS);
  const [media, setMedia] = usePersistentState<MediaItem[]>('admin.blog.proto.media.library', DEFAULT_MEDIA);
  const [trashedMedia, setTrashedMedia] = usePersistentState<TrashedMediaItem[]>(
    'admin.blog.proto.media.trash',
    DEFAULT_TRASHED_MEDIA
  );
  const [comments, setComments] = usePersistentState<CommentItem[]>('admin.blog.proto.comments', DEFAULT_COMMENTS);

  const addFolder = React.useCallback(
    (name: string, parentId: string | null) => {
      const next: MediaFolder = {
        id: uid('mf'),
        name,
        parentId,
        createdAt: new Date().toISOString(),
        type: 'media',
      };
      setFolders((prev) => [next, ...prev]);
      return next;
    },
    [setFolders]
  );

  const renameFolder = React.useCallback(
    (id: string, name: string) => {
      setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
    },
    [setFolders]
  );

  const deleteFolder = React.useCallback(
    (id: string) => {
      setFolders((prev) => prev.filter((f) => f.id !== id));
      setMedia((prev) => prev.map((m) => (m.folderId === id ? { ...m, folderId: null } : m)));
    },
    [setFolders, setMedia]
  );

  const addMedia = React.useCallback(
    (item: Omit<MediaItem, 'id' | 'uploadedAt'>) => {
      const next: MediaItem = {
        ...item,
        id: uid('m'),
        uploadedAt: 'Just now',
      };
      setMedia((prev) => [next, ...prev]);
      return next;
    },
    [setMedia]
  );

  const updateMedia = React.useCallback(
    (id: string, updates: Partial<MediaItem>) => {
      setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    },
    [setMedia]
  );

  const renameMedia = React.useCallback(
    (id: string, newName: string) => {
      updateMedia(id, { name: newName });
    },
    [updateMedia]
  );

  const replaceMedia = React.useCallback(
    (id: string, file: File) => {
      const url = URL.createObjectURL(file);
      const sizeMb = (file.size / 1024 / 1024).toFixed(1);
      const type: MediaType = file.type.startsWith('image')
        ? 'image'
        : file.type.startsWith('video')
          ? 'video'
          : 'document';

      updateMedia(id, {
        name: file.name,
        url,
        size: `${sizeMb} MB`,
        type,
        uploadedAt: 'Just now',
      });
    },
    [updateMedia]
  );

  const bulkUpdateMedia = React.useCallback(
    (ids: string[], updates: Partial<MediaItem>) => {
      setMedia((prev) => prev.map((m) => (ids.includes(m.id) ? { ...m, ...updates } : m)));
    },
    [setMedia]
  );

  const moveMediaToFolder = React.useCallback(
    (mediaIds: string[], folderId: string | null) => {
      bulkUpdateMedia(mediaIds, { folderId });
    },
    [bulkUpdateMedia]
  );

  const moveMediaToTrash = React.useCallback(
    (id: string) => {
      setMedia((prev) => {
        const item = prev.find((m) => m.id === id);
        if (!item) return prev;
        setTrashedMedia((trashPrev) => [{ ...item, trashedAt: 'Just now' }, ...trashPrev]);
        return prev.filter((m) => m.id !== id);
      });
    },
    [setMedia, setTrashedMedia]
  );

  const restoreMediaFromTrash = React.useCallback(
    (id: string) => {
      setTrashedMedia((prev) => {
        const item = prev.find((m) => m.id === id);
        if (!item) return prev;
        const { trashedAt: _trashedAt, ...rest } = item;
        setMedia((mediaPrev) => [{ ...rest, uploadedAt: rest.uploadedAt || 'Restored' }, ...mediaPrev]);
        return prev.filter((m) => m.id !== id);
      });
    },
    [setTrashedMedia, setMedia]
  );

  const permanentlyDeleteMedia = React.useCallback(
    (id: string) => {
      setTrashedMedia((prev) => prev.filter((m) => m.id !== id));
      setMedia((prev) => prev.filter((m) => m.id !== id));
    },
    [setTrashedMedia, setMedia]
  );

  const updateCommentStatus = React.useCallback(
    (id: string, status: CommentStatus) => {
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    },
    [setComments]
  );

  const deleteComment = React.useCallback(
    (id: string) => {
      setComments((prev) => prev.filter((c) => c.id !== id));
    },
    [setComments]
  );

  return {
    folders,
    media,
    trashedMedia,
    comments,
    addFolder,
    renameFolder,
    deleteFolder,
    addMedia,
    updateMedia,
    renameMedia,
    replaceMedia,
    bulkUpdateMedia,
    moveMediaToFolder,
    moveMediaToTrash,
    restoreMediaFromTrash,
    permanentlyDeleteMedia,
    updateCommentStatus,
    deleteComment,
  };
}
