
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AdminPost, TrashedPost, Comment, PostStatus, CommentStatus, AuthorProfile } from '../types';
import { MOCK_ADMIN_POSTS, MOCK_TRASHED_POSTS, MOCK_COMMENTS, MOCK_AUTHORS } from '../constants';

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  type: 'media' | 'post';
}

export interface MediaReference {
  id: string;
  title: string;
  slug: string;
  type: 'post' | 'page';
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: string;
  uploadedAt: string;
  dimensions?: string;
  altText?: string;
  caption?: string;
  tags?: string[];
  references?: MediaReference[];
  folderId?: string | null; // null means root
}

export interface TrashedMediaItem extends MediaItem {
  trashedAt: string;
}

const MOCK_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Blog Images', parentId: null, createdAt: '2023-01-01', type: 'media' },
  { id: 'f2', name: 'Product Shots', parentId: 'f1', createdAt: '2023-02-15', type: 'media' },
  { id: 'f3', name: 'Documents', parentId: null, createdAt: '2023-03-10', type: 'media' },
  { id: 'f4', name: 'Team Photos', parentId: null, createdAt: '2023-04-05', type: 'media' },
  { id: 'f5', name: 'Events', parentId: 'f4', createdAt: '2023-05-20', type: 'media' },
  // Post Folders
  { id: 'pf1', name: 'Q1 Campaigns', parentId: null, createdAt: '2023-01-10', type: 'post' },
  { id: 'pf2', name: 'Drafts 2024', parentId: null, createdAt: '2023-01-12', type: 'post' },
  { id: 'pf3', name: 'Technical Guides', parentId: 'pf1', createdAt: '2023-02-01', type: 'post' },
];

const MOCK_MEDIA: MediaItem[] = [
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
      { id: '5', title: 'Understanding Net Metering', slug: 'understanding-net-metering', type: 'post' }
    ]
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
    references: [
      { id: '6', title: 'The Battery Storage Revolution', slug: 'battery-storage-revolution', type: 'post' }
    ]
  },
  { id: '3', name: 'installation-guide.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'document', size: '4.5 MB', uploadedAt: 'Oct 20, 2023', folderId: 'f3' },
  { id: '4', name: 'commercial-site-drone.mp4', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', type: 'video', size: '24 MB', uploadedAt: 'Oct 18, 2023', folderId: null },
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
    references: [
      { id: 'about', title: 'About Us', slug: 'about', type: 'page' }
    ]
  },
  { id: '6', name: 'inverter-schematic.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'document', size: '1.8 MB', uploadedAt: 'Oct 12, 2023', folderId: 'f3' },
  { id: '7', name: 'sunny-day-hero.jpg', url: 'https://picsum.photos/seed/solar4/800/600', type: 'image', size: '0.9 MB', uploadedAt: 'Oct 10, 2023', dimensions: '1200x800', folderId: 'f1' },
  { id: '8', name: 'quarterly-report-q3.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'document', size: '1.1 MB', uploadedAt: 'Oct 05, 2023', folderId: null },
];

const MOCK_TRASHED_MEDIA: TrashedMediaItem[] = [
  { id: 'tm1', name: 'old-logo-v1.png', url: 'https://picsum.photos/seed/trash1/200/200', type: 'image', size: '0.5 MB', uploadedAt: 'Jan 10, 2023', trashedAt: '2 days ago', dimensions: '500x500', folderId: 'f1' },
  { id: 'tm2', name: 'deprecated-policy.pdf', url: '#', type: 'document', size: '2.1 MB', uploadedAt: 'Feb 15, 2023', trashedAt: '1 week ago', folderId: null },
];

interface BlogContextType {
  posts: AdminPost[];
  trashedPosts: TrashedPost[];
  media: MediaItem[];
  trashedMedia: TrashedMediaItem[];
  comments: Comment[];
  folders: Folder[];
  authors: AuthorProfile[];
  addPost: (post: AdminPost) => void;
  updatePost: (id: string, updates: Partial<AdminPost>) => void;
  movePostToTrash: (id: string) => void;
  restorePostFromTrash: (id: string) => void;
  permanentlyDeletePost: (id: string) => void;
  movePostToFolder: (postIds: string[], folderId: string | null) => void;
  addMedia: (item: MediaItem) => void;
  updateMedia: (id: string, updates: Partial<MediaItem>) => void;
  renameMedia: (id: string, newName: string) => void;
  replaceMedia: (id: string, file: File) => void;
  bulkUpdateMedia: (ids: string[], updates: Partial<MediaItem>) => void;
  moveMediaToTrash: (id: string) => void;
  restoreMediaFromTrash: (id: string) => void;
  permanentlyDeleteMedia: (id: string) => void;
  updateCommentStatus: (id: string, status: CommentStatus) => void;
  deleteComment: (id: string) => void;
  addFolder: (name: string, parentId: string | null, type: 'media' | 'post') => void;
  deleteFolder: (id: string) => void;
  renameFolder: (id: string, name: string) => void;
  moveMediaToFolder: (mediaIds: string[], folderId: string | null) => void;
  addAuthor: (author: AuthorProfile) => void;
  updateAuthor: (id: string, updates: Partial<AuthorProfile>) => void;
  deleteAuthor: (id: string) => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Add some initial folder assignments to posts
  const initialPosts = MOCK_ADMIN_POSTS.map((p, i) => ({
    ...p,
    folderId: i < 2 ? 'pf1' : i < 4 ? 'pf2' : null
  }));

  const [posts, setPosts] = useState<AdminPost[]>(initialPosts);
  const [trashedPosts, setTrashedPosts] = useState<TrashedPost[]>(MOCK_TRASHED_POSTS);
  const [media, setMedia] = useState<MediaItem[]>(MOCK_MEDIA);
  const [trashedMedia, setTrashedMedia] = useState<TrashedMediaItem[]>(MOCK_TRASHED_MEDIA);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [authors, setAuthors] = useState<AuthorProfile[]>(MOCK_AUTHORS);

  const addPost = (post: AdminPost) => {
    setPosts(prev => [post, ...prev]);
  };

  const updatePost = (id: string, updates: Partial<AdminPost>) => {
    setPosts(prev => prev.map(post => post.id === id ? { ...post, ...updates, updatedAt: 'Just now' } : post));
  };

  const movePostToTrash = (id: string) => {
    const postToTrash = posts.find(p => p.id === id);
    if (postToTrash) {
      const trashedItem: TrashedPost = {
        id: postToTrash.id,
        title: postToTrash.title,
        previousStatus: postToTrash.status,
        author: typeof postToTrash.author === 'string' ? postToTrash.author : postToTrash.author.name,
        trashedAt: 'Just now',
        category: postToTrash.category
      };
      setTrashedPosts(prev => [trashedItem, ...prev]);
      setPosts(prev => prev.filter(p => p.id !== id));
    }
  };

  const restorePostFromTrash = (id: string) => {
    const itemToRestore = trashedPosts.find(p => p.id === id);
    if (itemToRestore) {
      const original = MOCK_ADMIN_POSTS.find(p => p.id === id);
      
      const restoredPost: AdminPost = {
        id: itemToRestore.id,
        slug: original?.slug || `restored-${itemToRestore.id}`,
        title: itemToRestore.title,
        excerpt: original?.excerpt || 'Restored post excerpt...',
        content: original?.content || '<p>Restored content.</p>',
        coverImage: original?.coverImage || 'https://picsum.photos/seed/restored/800/600',
        category: itemToRestore.category,
        author: { name: itemToRestore.author, avatar: 'https://picsum.photos/seed/user1/100/100' },
        publishedAt: 'Draft',
        readTime: '5 min read',
        status: itemToRestore.previousStatus,
        updatedAt: 'Just now',
        folderId: null
      };
      
      setPosts(prev => [restoredPost, ...prev]);
      setTrashedPosts(prev => prev.filter(p => p.id !== id));
    }
  };

  const permanentlyDeletePost = (id: string) => {
    setTrashedPosts(prev => prev.filter(p => p.id !== id));
  };

  const movePostToFolder = (postIds: string[], folderId: string | null) => {
    setPosts(prev => prev.map(p => postIds.includes(p.id) ? { ...p, folderId } : p));
  };

  const addMedia = (item: MediaItem) => {
    setMedia(prev => [item, ...prev]);
  };

  const updateMedia = (id: string, updates: Partial<MediaItem>) => {
    setMedia(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const renameMedia = (id: string, newName: string) => {
    setMedia(prev => prev.map(m => m.id === id ? { ...m, name: newName, updatedAt: 'Just now' } : m));
  };

  const replaceMedia = (id: string, file: File) => {
    const newUrl = URL.createObjectURL(file);
    const newSize = (file.size / 1024 / 1024).toFixed(1) + ' MB';
    const newType = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'document';
    
    setMedia(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          name: file.name,
          url: newUrl,
          size: newSize,
          type: newType,
          uploadedAt: 'Just now',
        };
      }
      return m;
    }));
  };

  const bulkUpdateMedia = (ids: string[], updates: Partial<MediaItem>) => {
    setMedia(prev => prev.map(m => ids.includes(m.id) ? { ...m, ...updates } : m));
  };

  const moveMediaToTrash = (id: string) => {
    const item = media.find(m => m.id === id);
    if (item) {
      const trashedItem: TrashedMediaItem = {
        ...item,
        trashedAt: 'Just now'
      };
      setTrashedMedia(prev => [trashedItem, ...prev]);
      setMedia(prev => prev.filter(m => m.id !== id));
    }
  };

  const restoreMediaFromTrash = (id: string) => {
    const item = trashedMedia.find(m => m.id === id);
    if (item) {
      const { trashedAt, ...rest } = item;
      setMedia(prev => [rest, ...prev]);
      setTrashedMedia(prev => prev.filter(m => m.id !== id));
    }
  };

  const permanentlyDeleteMedia = (id: string) => {
    setTrashedMedia(prev => prev.filter(m => m.id !== id));
  };

  const updateCommentStatus = (id: string, status: CommentStatus) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const deleteComment = (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  // Folder Logic
  const addFolder = (name: string, parentId: string | null, type: 'media' | 'post') => {
    const newFolder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      parentId,
      createdAt: 'Just now',
      type
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const deleteFolder = (id: string) => {
    // Also reset items in this folder to root
    setMedia(prev => prev.map(m => m.folderId === id ? { ...m, folderId: null } : m));
    setPosts(prev => prev.map(p => p.folderId === id ? { ...p, folderId: null } : p));
    setFolders(prev => prev.filter(f => f.id !== id && f.parentId !== id)); 
  };

  const renameFolder = (id: string, name: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f));
  };

  const moveMediaToFolder = (mediaIds: string[], folderId: string | null) => {
    setMedia(prev => prev.map(m => mediaIds.includes(m.id) ? { ...m, folderId } : m));
  };

  // Author Logic
  const addAuthor = (author: AuthorProfile) => {
    setAuthors(prev => [author, ...prev]);
  };

  const updateAuthor = (id: string, updates: Partial<AuthorProfile>) => {
    setAuthors(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAuthor = (id: string) => {
    setAuthors(prev => prev.filter(a => a.id !== id));
  };

  return (
    <BlogContext.Provider value={{
      posts,
      trashedPosts,
      media,
      trashedMedia,
      comments,
      folders,
      authors,
      addPost,
      updatePost,
      movePostToTrash,
      restorePostFromTrash,
      permanentlyDeletePost,
      movePostToFolder,
      addMedia,
      updateMedia,
      renameMedia,
      replaceMedia,
      bulkUpdateMedia,
      moveMediaToTrash,
      restoreMediaFromTrash,
      permanentlyDeleteMedia,
      updateCommentStatus,
      deleteComment,
      addFolder,
      deleteFolder,
      renameFolder,
      moveMediaToFolder,
      addAuthor,
      updateAuthor,
      deleteAuthor
    }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};
