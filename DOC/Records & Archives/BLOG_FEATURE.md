# 📝 SolarMatch Blog Feature - Comprehensive Master Plan

## 📊 AUDIT REPORT - Current State Analysis

### ✅ What We Already Have

#### 1. Frontend Pages (Client-Side)
**Location:** `src/app/blog/`

##### A. Blog List Page (`src/app/blog/page.tsx`)
- ✅ **Status:** IMPLEMENTED (Frontend Only)
- **Features:**
  - Grid layout displaying blog articles
  - Search functionality
  - Category filtering
  - Pagination (load more)
  - Responsive design
  - Theme support (Light/Dark/System)
  - Next.js Image optimization
- **Limitations:**
  - Uses static data from `blogData.ts`
  - No API integration
  - No CMS connection

##### B. Blog Post Page (`src/app/blog/post/page.tsx`)
- ✅ **Status:** IMPLEMENTED (Frontend Only)
- **Features:**
  - Full article display
  - Author bio section
  - Share buttons (Twitter, Facebook, LinkedIn)
  - Comments section with authentication
  - Related posts section
  - Back to blog navigation
  - SessionStorage for post data
  - Theme-aware styling
- **Authentication Integration:**
  - ✅ Sign-in modal for comments
  - ✅ localStorage authentication (`homeownerAuth`)
  - ✅ Auto-post comment after sign-in
  - ✅ Page reload with state persistence
- **Limitations:**
  - Static post data via sessionStorage
  - Comments stored locally (not persisted)
  - No API integration
  - No database connection

##### C. Blog Section Component (`src/components/BlogSection.tsx`)
- ✅ **Status:** IMPLEMENTED
- **Features:**
  - Homepage blog preview
  - Shows 3 latest articles
  - Click to read full post
  - Category badges
  - Author & date info
  - "See All Posts" CTA
- **Limitations:**
  - Hardcoded articles in component
  - No dynamic data fetching

#### 2. Data Layer

##### A. Type Definitions (`src/types/blog.ts`)
```typescript
interface Post {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}
```
- ✅ **Status:** BASIC IMPLEMENTATION
- **Limitations:**
  - No unique ID field
  - No slug for SEO-friendly URLs
  - No content/body field
  - No metadata (tags, SEO)
  - No status (draft/published)
  - No timestamps (createdAt, updatedAt)
  - No author relationship
  - No comments relationship

##### B. Static Data (`src/data/blogData.ts`)
- ✅ **Status:** IMPLEMENTED (Temporary)
- **Contains:**
  - 9 sample blog posts
  - Category extraction logic
- **Limitations:**
  - Hardcoded data
  - No CRUD operations
  - No search/filter backend
  - No pagination logic

#### 3. Authentication System
- ✅ **Status:** IMPLEMENTED
- **Current Implementation:**
  - localStorage-based (`homeownerAuth`)
  - Modal sign-in flow
  - Comment authentication requirement
  - Session persistence across page reloads
- **Integration Points:**
  - Comments require authentication
  - Dashboard access after login
  - Unified homeowner authentication

#### 4. Styling & Theme Support
- ✅ **Status:** FULLY IMPLEMENTED
- **Features:**
  - Three themes: Light (cream), Dark (black), System (green)
  - CSS variables for dynamic theming
  - Tailwind CSS integration
  - Custom classes: `.blog-section`, `.blog-page-bg`, `.blog-post-page-bg`
  - Theme-aware cards and components
  - Responsive design

---

## ❌ What We DON'T Have

### 1. Backend Infrastructure
- ❌ **No API Routes** - No Next.js API endpoints
- ❌ **No Database** - No PostgreSQL/MongoDB/MySQL setup
- ❌ **No ORM** - No Prisma/Drizzle/TypeORM configuration
- ❌ **No Server Actions** - No Next.js server actions
- ❌ **No Data Fetching** - No SSR/SSG for blog posts
- ❌ **No File Upload** - No image/media management
- ❌ **No Search Backend** - No full-text search implementation
- ❌ **No Analytics** - No view counts, popular posts tracking

### 2. Admin Panel CMS
- ❌ **No Blog Management Dashboard** - Admin panel exists but no blog functionality
- ❌ **No Content Editor** - No rich text editor (TinyMCE, Quill, Slate)
- ❌ **No CRUD Interface** - No create/edit/delete posts UI
- ❌ **No Media Library** - No image upload/management
- ❌ **No Category Management** - No add/edit categories
- ❌ **No Author Management** - No author profiles
- ❌ **No Draft System** - No save as draft functionality
- ❌ **No Publishing Workflow** - No schedule posts
- ❌ **No SEO Tools** - No meta tags, descriptions, keywords editor
- ❌ **No Preview** - No preview before publishing
- ❌ **No Bulk Actions** - No bulk edit/delete/publish

### 3. Comments System
- ❌ **No Database Storage** - Comments not persisted
- ❌ **No API Endpoints** - No POST/GET/DELETE comments
- ❌ **No Moderation** - No admin approval system
- ❌ **No Replies** - No threaded comments
- ❌ **No Notifications** - No email alerts for new comments
- ❌ **No Spam Protection** - No captcha/akismet
- ❌ **No User Profiles** - No comment history

### 4. Advanced Features
- ❌ **No Tags System** - No post tagging
- ❌ **No Related Posts Logic** - No algorithm for suggestions
- ❌ **No Reading Progress** - No scroll indicator
- ❌ **No Bookmarks** - No save for later
- ❌ **No Share Tracking** - No social share counts
- ❌ **No Email Subscriptions** - No newsletter for blog updates
- ❌ **No RSS Feed** - No XML feed generation
- ❌ **No Sitemap** - No dynamic sitemap for SEO
- ❌ **No OpenGraph** - No proper social media preview cards

---

## 🎯 EXECUTION PLAN - Step-by-Step Implementation

## PHASE 1: Database & Backend Foundation (Week 1)

### Step 1.1: Database Schema Design & Setup
**Priority:** 🔴 CRITICAL
**Duration:** 2-3 days

#### 1.1.1: Choose Database & ORM
**Decision Points:**
- **Database Options:**
  - PostgreSQL (Recommended for production)
  - MySQL (Alternative)
  - MongoDB (NoSQL option)
  - Supabase (Postgres + Auth + Storage)
  
- **ORM Options:**
  - Prisma (Recommended - TypeScript-first)
  - Drizzle ORM (Lightweight alternative)
  - TypeORM (Enterprise option)

**Recommendation:** PostgreSQL + Prisma

**Actions:**
```bash
# Install Prisma
npm install prisma @prisma/client
npm install -D prisma

# Initialize Prisma
npx prisma init
```

#### 1.1.2: Database Schema Definition
**File:** `prisma/schema.prisma`

```prisma
// BLOG SCHEMA DESIGN

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==================== USER MANAGEMENT ====================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          UserRole  @default(HOMEOWNER)
  avatar        String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  blogPosts     BlogPost[]
  comments      Comment[]
  
  @@map("users")
}

enum UserRole {
  HOMEOWNER
  INSTALLER
  ADMIN
}

// ==================== BLOG MANAGEMENT ====================

model BlogPost {
  id            String        @id @default(cuid())
  title         String
  slug          String        @unique
  excerpt       String
  content       String        @db.Text // Full HTML/Markdown content
  coverImage    String
  status        PostStatus    @default(DRAFT)
  featured      Boolean       @default(false)
  readTime      Int           // in minutes
  viewCount     Int           @default(0)
  
  // SEO
  metaTitle     String?
  metaDescription String?
  metaKeywords  String[]
  
  // Publishing
  publishedAt   DateTime?
  scheduledFor  DateTime?
  
  // Timestamps
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  // Relations
  authorId      String
  author        User          @relation(fields: [authorId], references: [id], onDelete: Cascade)
  categoryId    String
  category      Category      @relation(fields: [categoryId], references: [id])
  tags          PostTag[]
  comments      Comment[]
  
  @@index([slug])
  @@index([status, publishedAt])
  @@index([authorId])
  @@index([categoryId])
  @@map("blog_posts")
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  SCHEDULED
}

model Category {
  id          String      @id @default(cuid())
  name        String      @unique
  slug        String      @unique
  description String?
  color       String?     // Hex color for UI
  icon        String?     // Icon name or emoji
  order       Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Relations
  posts       BlogPost[]
  
  @@map("categories")
}

model Tag {
  id          String      @id @default(cuid())
  name        String      @unique
  slug        String      @unique
  createdAt   DateTime    @default(now())
  
  // Relations
  posts       PostTag[]
  
  @@map("tags")
}

model PostTag {
  id          String      @id @default(cuid())
  postId      String
  tagId       String
  
  post        BlogPost    @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag         Tag         @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@unique([postId, tagId])
  @@map("post_tags")
}

// ==================== COMMENTS SYSTEM ====================

model Comment {
  id          String      @id @default(cuid())
  content     String      @db.Text
  status      CommentStatus @default(PENDING)
  
  // Relations
  postId      String
  post        BlogPost    @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId    String
  author      User        @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  // Threading (replies)
  parentId    String?
  parent      Comment?    @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies     Comment[]   @relation("CommentReplies")
  
  // Timestamps
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  @@index([postId])
  @@index([authorId])
  @@index([status])
  @@map("comments")
}

enum CommentStatus {
  PENDING
  APPROVED
  SPAM
  TRASH
}

// ==================== MEDIA LIBRARY ====================

model Media {
  id          String      @id @default(cuid())
  filename    String
  url         String
  mimeType    String
  size        Int         // in bytes
  width       Int?
  height      Int?
  alt         String?
  caption     String?
  
  // Relations
  uploadedById String
  uploadedBy  User       @relation(fields: [uploadedById], references: [id])
  
  // Timestamps
  createdAt   DateTime   @default(now())
  
  @@map("media")
}
```

**Actions:**
```bash
# Create migration
npx prisma migrate dev --name init_blog_schema

# Generate Prisma Client
npx prisma generate

# Seed sample data (optional)
npx prisma db seed
```

#### 1.1.3: Environment Variables
**File:** `.env`

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/solarmatch?schema=public"

# Alternative: Supabase
# DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# File Upload (Cloudinary/AWS S3)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Alternative: AWS S3
# AWS_S3_BUCKET=your_bucket
# AWS_ACCESS_KEY_ID=your_key
# AWS_SECRET_ACCESS_KEY=your_secret
# AWS_REGION=us-east-1

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Step 1.2: API Routes Implementation
**Priority:** 🔴 CRITICAL
**Duration:** 3-4 days

#### 1.2.1: Blog Post API Routes
**Location:** `src/app/api/blog/`

**Files to Create:**

##### A. Get All Posts
**File:** `src/app/api/blog/posts/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'PUBLISHED';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { status };
    
    if (category && category !== 'All') {
      where.category = { slug: category };
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch posts
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          category: true,
          tags: {
            include: { tag: true },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // TODO: Add authentication check for admin/author
    const body = await request.json();
    
    const post = await prisma.blogPost.create({
      data: {
        ...body,
        slug: generateSlug(body.title),
      },
      include: {
        author: true,
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
```

##### B. Get Single Post
**File:** `src/app/api/blog/posts/[slug]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        category: true,
        tags: {
          include: { tag: true },
        },
        comments: {
          where: { status: 'APPROVED' },
          include: {
            author: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // TODO: Add authentication check
    const body = await request.json();
    
    const post = await prisma.blogPost.update({
      where: { slug: params.slug },
      data: body,
      include: {
        author: true,
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // TODO: Add authentication check
    await prisma.blogPost.delete({
      where: { slug: params.slug },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
```

##### C. Comments API
**File:** `src/app/api/blog/posts/[slug]/comments/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId: post.id,
        status: 'APPROVED',
        parentId: null, // Only top-level comments
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        replies: {
          where: { status: 'APPROVED' },
          include: {
            author: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // TODO: Verify user authentication
    const body = await request.json();
    const { content, authorId, parentId } = body;

    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: post.id,
        authorId,
        parentId,
        status: 'PENDING', // Requires moderation
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
```

##### D. Categories API
**File:** `src/app/api/blog/categories/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { posts: { where: { status: 'PUBLISHED' } } },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // TODO: Add admin authentication check
    const body = await request.json();
    
    const category = await prisma.category.create({
      data: {
        ...body,
        slug: generateSlug(body.name),
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
```

#### 1.2.2: Prisma Client Setup
**File:** `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## PHASE 2: Admin Panel CMS (Week 2)

### Step 2.1: Blog Management Dashboard
**Priority:** 🔴 CRITICAL
**Duration:** 4-5 days

#### 2.1.1: Admin Blog Posts List Page
**File:** `src/app/admin/dashboard/blog/page.tsx`

**Features:**
- Table view of all blog posts
- Filter by status (Draft, Published, Archived)
- Search functionality
- Bulk actions (Delete, Publish, Archive)
- Quick edit inline
- View count statistics
- Create new post button

**UI Components:**
- DataTable with sorting
- Status badges
- Action buttons (Edit, Delete, View)
- Pagination controls
- Category filters

#### 2.1.2: Blog Post Editor
**File:** `src/app/admin/dashboard/blog/[id]/edit/page.tsx`

**Rich Text Editor Options:**
1. **TinyMCE** (Recommended)
   - Full-featured WYSIWYG
   - Image upload support
   - Code view
   
2. **Quill**
   - Lightweight
   - Customizable
   
3. **Slate**
   - React-based
   - Fully customizable

**Recommendation:** TinyMCE

**Installation:**
```bash
npm install @tinymce/tinymce-react
```

**Features:**
- Title input
- Slug generator (auto from title)
- Rich text editor for content
- Excerpt textarea
- Cover image upload
- Category dropdown
- Tags input (multi-select)
- SEO meta fields
- Status selector (Draft/Published/Scheduled)
- Schedule publish date picker
- Preview button
- Save draft button
- Publish button

#### 2.1.3: Media Library
**File:** `src/app/admin/dashboard/media/page.tsx`

**Features:**
- Grid/List view toggle
- Upload multiple files
- Drag & drop upload
- Image preview
- Edit alt text & caption
- Delete files
- Search files
- Filter by type (Images, Documents)
- Copy URL to clipboard

**File Upload Service:**
```bash
# Option 1: Cloudinary
npm install cloudinary next-cloudinary

# Option 2: AWS S3
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Recommendation:** Cloudinary (easier setup, free tier)

#### 2.1.4: Category Management
**File:** `src/app/admin/dashboard/blog/categories/page.tsx`

**Features:**
- Add new category
- Edit category name, slug, description
- Set category color
- Reorder categories (drag & drop)
- Delete category
- View post count per category

#### 2.1.5: Comments Moderation
**File:** `src/app/admin/dashboard/blog/comments/page.tsx`

**Features:**
- List all comments
- Filter by status (Pending, Approved, Spam)
- Approve/Reject actions
- Bulk approve/reject
- Delete comment
- View comment context (post)
- Reply to comment
- Mark as spam

---

### Step 2.2: Admin Navigation Update
**File:** `src/app/admin/dashboard/page.tsx`

**Update Sidebar Navigation:**

```typescript
// Add Blog Management menu items
const blogMenuItems = [
  {
    icon: <FileTextIcon />,
    title: "All Posts",
    onClick: () => router.push('/admin/dashboard/blog'),
  },
  {
    icon: <PlusIcon />,
    title: "New Post",
    onClick: () => router.push('/admin/dashboard/blog/new'),
  },
  {
    icon: <FolderIcon />,
    title: "Categories",
    onClick: () => router.push('/admin/dashboard/blog/categories'),
  },
  {
    icon: <MessageSquareIcon />,
    title: "Comments",
    onClick: () => router.push('/admin/dashboard/blog/comments'),
    badge: pendingCommentsCount,
  },
  {
    icon: <ImageIcon />,
    title: "Media Library",
    onClick: () => router.push('/admin/dashboard/media'),
  },
];
```

---

## PHASE 3: Frontend Integration (Week 3)

### Step 3.1: Update Blog Pages to Use API

#### 3.1.1: Update Blog List Page
**File:** `src/app/blog/page.tsx`

**Changes:**
```typescript
// BEFORE: Static data
import { allArticles } from '@/data/blogData';

// AFTER: Server-side data fetching
async function getBlogPosts(params: {
  page?: number;
  category?: string;
  search?: string;
}) {
  const queryParams = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: '9',
    ...(params.category && { category: params.category }),
    ...(params.search && { search: params.search }),
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/blog/posts?${queryParams}`,
    { next: { revalidate: 60 } } // ISR: Revalidate every 60 seconds
  );

  if (!res.ok) throw new Error('Failed to fetch posts');
  
  return res.json();
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string; search?: string };
}) {
  const { posts, pagination } = await getBlogPosts({
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    category: searchParams.category,
    search: searchParams.search,
  });

  return (
    <div className="min-h-screen flex flex-col blog-page-bg">
      {/* Render posts */}
      {posts.map((post) => (
        <ArticleCard key={post.id} article={post} />
      ))}
      
      {/* Pagination */}
      <Pagination {...pagination} />
    </div>
  );
}
```

#### 3.1.2: Update Blog Post Page
**File:** `src/app/blog/[slug]/page.tsx`

**Changes:**
- Move from `/blog/post` to `/blog/[slug]` for SEO-friendly URLs
- Server-side fetch single post
- Generate static params for SSG
- Fetch comments from API
- Update comment submission to API

```typescript
// Server Component for SSG
export async function generateStaticParams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/blog/posts`);
  const { posts } = await res.json();

  return posts.map((post: any) => ({
    slug: post.slug,
  }));
}

async function getPost(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/blog/posts/${slug}`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) throw new Error('Post not found');
  
  return res.json();
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      
      {/* Comments section - Client component */}
      <CommentsSection postSlug={params.slug} initialComments={post.comments} />
    </article>
  );
}
```

#### 3.1.3: Create Comments Client Component
**File:** `src/components/CommentsSection.tsx`

```typescript
'use client';

import { useState } from 'react';

export default function CommentsSection({
  postSlug,
  initialComments,
}: {
  postSlug: string;
  initialComments: any[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication
    const userAuth = localStorage.getItem('homeownerAuth');
    if (userAuth !== 'true') {
      // Open sign-in modal
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/blog/posts/${postSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          authorId: 'current-user-id', // Get from auth context
        }),
      });

      if (res.ok) {
        const comment = await res.json();
        // Note: Comment will be pending approval
        alert('Your comment has been submitted for moderation.');
        setNewComment('');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="comments-section">
      {/* Render comments */}
      {/* Comment form */}
    </div>
  );
}
```

### Step 3.2: Update Type Definitions
**File:** `src/types/blog.ts`

```typescript
export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
  featured: boolean;
  readTime: number;
  viewCount: number;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  
  // Relations
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  tags: {
    id: string;
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  comments?: Comment[];
  
  // Timestamps
  publishedAt?: Date;
  scheduledFor?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'SPAM' | 'TRASH';
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  parentId?: string;
  replies?: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  order: number;
  postCount?: number;
}
```

---

## PHASE 4: Advanced Features (Week 4)

### Step 4.1: Search & Filtering
**Implementation:**
- Full-text search using PostgreSQL `tsvector`
- Filter by multiple categories
- Sort by date, views, comments
- Advanced search syntax

### Step 4.2: SEO Optimization
**Features:**
- Dynamic meta tags
- OpenGraph tags for social sharing
- Twitter cards
- JSON-LD structured data
- XML sitemap generation
- RSS feed

**File:** `src/app/blog/[slug]/opengraph-image.tsx`

```typescript
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Blog Post';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/blog/posts/${params.slug}`).then((res) => res.json());

  return new ImageResponse(
    (
      <div style={{ /* OG image styling */ }}>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
      </div>
    ),
    { ...size }
  );
}
```

### Step 4.3: Analytics & Insights
**Features:**
- Track page views
- Popular posts widget
- Reading time calculation
- Trending topics
- Comment count tracking

### Step 4.4: Email Notifications
**Service:** SendGrid or Resend

**Triggers:**
- New comment notification to author
- Comment approval notification to commenter
- New post notification to subscribers
- Weekly digest

### Step 4.5: Related Posts Algorithm
**Implementation:**
- Match by category
- Match by tags
- Match by read time
- Exclude current post
- Limit to 3-6 posts

---

## PHASE 5: Testing & Optimization (Week 5)

### Step 5.1: Testing
- Unit tests for API routes
- Integration tests for CMS
- E2E tests for user flows
- Performance testing
- Security testing

### Step 5.2: Performance Optimization
- Image optimization (Next.js Image)
- Database query optimization
- Caching strategy (Redis)
- CDN for static assets
- Lazy loading

### Step 5.3: Security
- Authentication middleware
- Rate limiting
- CSRF protection
- SQL injection prevention (Prisma)
- XSS prevention
- Content Security Policy

---

## 📋 IMPLEMENTATION CHECKLIST

### Backend & Database
- [ ] Install Prisma & setup database
- [ ] Create database schema
- [ ] Run migrations
- [ ] Seed sample data
- [ ] Create API routes for posts (GET, POST, PUT, DELETE)
- [ ] Create API routes for comments
- [ ] Create API routes for categories
- [ ] Create API routes for media upload
- [ ] Add authentication middleware
- [ ] Add rate limiting

### Admin Panel
- [ ] Create blog posts list page
- [ ] Create blog post editor page
- [ ] Integrate rich text editor (TinyMCE)
- [ ] Create media library page
- [ ] Create category management page
- [ ] Create comments moderation page
- [ ] Add bulk actions
- [ ] Add search & filters
- [ ] Add publishing workflow
- [ ] Update admin navigation

### Frontend
- [ ] Update blog list page to use API
- [ ] Update blog post page to use API
- [ ] Implement dynamic routing ([slug])
- [ ] Create comments client component
- [ ] Update type definitions
- [ ] Implement pagination
- [ ] Add search functionality
- [ ] Add category filtering
- [ ] Implement SSG/ISR
- [ ] Add loading states

### Advanced Features
- [ ] Implement full-text search
- [ ] Add SEO meta tags
- [ ] Create OpenGraph images
- [ ] Generate sitemap
- [ ] Create RSS feed
- [ ] Add analytics tracking
- [ ] Implement related posts
- [ ] Add email notifications
- [ ] Create reading progress bar
- [ ] Add bookmark feature

### Testing & Launch
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Performance testing
- [ ] Security audit
- [ ] Deploy to production
- [ ] Monitor errors
- [ ] Gather user feedback
- [ ] Iterate improvements

---

## 🚀 QUICK START GUIDE

### For Immediate Development:

```bash
# 1. Install dependencies
npm install prisma @prisma/client @tinymce/tinymce-react cloudinary

# 2. Setup Prisma
npx prisma init

# 3. Copy schema to prisma/schema.prisma (from this document)

# 4. Setup environment variables
cp .env.example .env
# Edit .env with your database URL

# 5. Run migrations
npx prisma migrate dev --name init_blog

# 6. Generate Prisma client
npx prisma generate

# 7. Start building API routes
mkdir -p src/app/api/blog/posts
mkdir -p src/app/api/blog/categories
mkdir -p src/app/api/blog/comments

# 8. Start development server
npm run dev
```

---

## 📊 PRIORITY MATRIX

### Must Have (MVP)
1. ✅ Database schema & setup
2. ✅ API routes for posts (CRUD)
3. ✅ Admin post editor
4. ✅ Frontend blog list with API integration
5. ✅ Frontend blog post with dynamic routing
6. ✅ Comments system with authentication
7. ✅ Category management

### Should Have (V1.1)
8. Rich text editor (TinyMCE)
9. Media library
10. Search functionality
11. SEO meta tags
12. Comments moderation

### Nice to Have (V1.2)
13. Related posts
14. Analytics
15. Email notifications
16. RSS feed
17. Sitemap

### Future Enhancements (V2.0)
18. AI-powered content suggestions
19. Multi-language support
20. Advanced analytics dashboard
21. Social media auto-posting
22. A/B testing for titles
23. Content scheduling calendar

---

## 💰 COST ESTIMATION

### Monthly Running Costs:
- **Database:** $0-25/month (Supabase free tier or Vercel Postgres)
- **Media Storage:** $0-20/month (Cloudinary free tier: 25GB)
- **Hosting:** $0-20/month (Vercel free tier or Pro)
- **Email Service:** $0-15/month (SendGrid free tier: 100 emails/day)

**Total:** $0-80/month depending on traffic

---

## 🎯 SUCCESS METRICS

### Phase 1 (Week 1-2)
- ✅ Database schema completed
- ✅ API routes functional
- ✅ Admin can create/edit posts

### Phase 2 (Week 3-4)
- ✅ Frontend displays dynamic posts
- ✅ Users can comment (with auth)
- ✅ Search & filters work

### Phase 3 (Week 5+)
- ✅ SEO optimized
- ✅ Performance benchmarks met
- ✅ 100% feature completion
- ✅ Zero critical bugs
- ✅ Production ready

---

## 📝 NOTES & RECOMMENDATIONS

1. **Start Small:** Implement MVP features first, then iterate
2. **Database First:** Get schema right before building UI
3. **API Testing:** Use tools like Postman/Thunder Client
4. **Version Control:** Commit frequently with descriptive messages
5. **Documentation:** Keep this document updated with progress
6. **Backup Strategy:** Regular database backups
7. **Monitoring:** Setup error tracking (Sentry)
8. **Performance:** Monitor Core Web Vitals

---

## 🔗 USEFUL RESOURCES

- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs
- **TinyMCE Docs:** https://www.tiny.cloud/docs
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **PostgreSQL Docs:** https://www.postgresql.org/docs

---

**Document Version:** 1.0  
**Last Updated:** October 10, 2025  
**Status:** Ready for Implementation  
**Estimated Completion:** 5 weeks (MVP)

## 🤖 AI Integration for Blog Automation (RSS → Research → Draft → Schedule → Publish)

This section outlines an end-to-end plan to automatically ingest news via RSS, research topics, generate full blog posts with SEO assets, and schedule/publish them according to your preferences.

### Goals
- Fetch and parse RSS feeds on a schedule
- De-duplicate, rank, and extract promising topics
- Research context and sources for each topic
- Generate outlines, drafts, cover image prompts, and SEO metadata
- Save as drafts for review or auto-publish based on rules
- Respect safety, brand voice, and quality thresholds

### Operating Modes
- Assist: AI drafts posts, human approves/schedules
- Semi-auto: AI auto-schedules drafts that meet quality rules
- Full-auto: AI publishes within guardrails (use with strict rules)

---

### High-level Architecture
- Ingestion: Scheduled job fetches RSS feeds → stores FeedItems
- Selection: Rank new items by relevance → queue generation jobs
- Research: Optional web search/retrieval to add context and references
- Generation: LLM creates outline → article → SEO → image prompt
- Review/Scheduling: Drafts appear in Admin → approve/edit/schedule/publish
- Observability: Job tracking, errors, retries, token usage, cost

---

### Data Model Additions (Prisma)

Extend Phase 1 schema with the following models. Add to `prisma/schema.prisma` and migrate.

```prisma
// ==================== AI & RSS ====================

model RSSFeed {
  id           String    @id @default(cuid())
  name         String
  url          String    @unique
  active       Boolean   @default(true)
  categories   String[]  // suggested categories to map items
  lastFetchedAt DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  items        RSSItem[]
}

model RSSItem {
  id          String    @id @default(cuid())
  feedId      String
  feed        RSSFeed   @relation(fields: [feedId], references: [id], onDelete: Cascade)
  guid        String?
  url         String    @unique
  title       String
  summary     String?
  publishedAt DateTime?
  contentRaw  String?
  status      RSSItemStatus @default(NEW) // NEW | PROCESSED | SKIPPED
  score       Float     @default(0)       // relevance score
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  generationJobs AIGenerationJob[]
}

enum RSSItemStatus {
  NEW
  PROCESSED
  SKIPPED
}

model AIGenerationJob {
  id           String   @id @default(cuid())
  source       String   // "RSS" | "MANUAL"
  rssItemId    String?
  rssItem      RSSItem? @relation(fields: [rssItemId], references: [id])
  idea         String
  status       JobStatus @default(QUEUED)
  model        String    // e.g., gpt-4o, o3-mini, claude-3.5, etc.
  temperature  Float     @default(0.7)
  maxTokens    Int       @default(2000)
  costUsd      Float     @default(0)
  error        String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  result       DraftPost?
}

enum JobStatus {
  QUEUED
  RUNNING
  COMPLETED
  FAILED
}

model DraftPost {
  id              String   @id @default(cuid())
  jobId           String   @unique
  job             AIGenerationJob @relation(fields: [jobId], references: [id])
  title           String
  slug            String   @unique
  outline         String?  // markdown/JSON
  content         String   @db.Text
  coverPrompt     String?  // prompt for image generation
  seoTitle        String?
  seoDescription  String?
  tags            String[]
  mappedCategoryId String?
  mappedCategory  Category? @relation(fields: [mappedCategoryId], references: [id])
  qualityScore    Int      @default(0) // heuristic evaluation
  scheduledFor    DateTime?
  approvedById    String?
  approvedBy      User?    @relation(fields: [approvedById], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  publishedPostId String?
  publishedPost   BlogPost? @relation(fields: [publishedPostId], references: [id])
}

model AIProviderSetting {
  id         String  @id @default(cuid())
  provider   String  // OpenAI | AzureOpenAI | Anthropic | GitHub
  baseUrl    String?
  apiKey     String
  model      String
  default    Boolean @default(false)
  rateLimitPerMin Int @default(60)
  createdAt  DateTime @default(now())
}
```

Migration notes:
- Keep AI tables independent from `BlogPost` until publish time.
- Use `DraftPost.publishedPostId` to link once published.

---

### Model and Provider Guidance

Recommended starting points (choose one, can swap later):
- OpenAI: gpt-4o (drafting, SEO), o3-mini (planning, outline), gpt-4o-mini (cost-effective)
- Anthropic: claude-3.5-sonnet (long-form quality), haiku (cheaper)
- Azure OpenAI: enterprise controls, same model families via Azure
- GitHub Models: hosted choices with simple billing

Content generation strategy:
- Use a two-pass approach: Plan → Draft → Improve SEO → Shorten excerpts
- Keep temperature lower for news (0.4–0.7) to reduce hallucination
- Ask models to cite discovered sources and include links

Safety and quality:
- Disallow unsafe categories; filter feeds by allowed domains
- Verify claims via 2+ source links when possible
- Add a toxicity/off-topic classifier gate before scheduling

Environment variables (examples):
```
AI_PROVIDER=OpenAI
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=...
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=...
GITHUB_MODELS_TOKEN=...
``` 

---

### Background Jobs and Scheduling

Option A (serverless-friendly, simple):
- Vercel Cron calls route handlers on schedule
- Each invocation processes a small batch to stay within limits

Example `vercel.json` (optional):
```json
{
  "crons": [
    { "path": "/api/ai/rss/ingest", "schedule": "0 * * * *" },
    { "path": "/api/ai/jobs/dispatch", "schedule": "5 * * * *" },
    { "path": "/api/ai/jobs/run", "schedule": "*/10 * * * *" }
  ]
}
```

Option B (robust queue):
- Upstash Redis + BullMQ worker (on long-running Node or edge-compatible)
- Better retries, rate limits, concurrency control

Start with Option A; upgrade to B if load grows.

---

### API Routes (proposal)

Create under `src/app/api/ai/`:

- `rss/feeds` (GET/POST/PUT/DELETE): manage feeds
- `rss/ingest` (POST via cron): fetch + parse feeds, store new RSSItem rows
- `ideas/suggest` (GET): propose topics from recent items/keywords
- `jobs/dispatch` (POST via cron): score/select new items → queue AIGenerationJob
- `jobs/run` (POST via cron): pop QUEUED job → call LLM → write DraftPost
- `drafts` (GET): list drafts with filters
- `drafts/[id]/approve` (POST): approve + optionally schedule
- `drafts/[id]/publish` (POST): convert DraftPost → BlogPost
- `settings/provider` (GET/POST): manage provider/model

---

### Example: Ingest Route (simplified)

```ts
// src/app/api/ai/rss/ingest/route.ts
import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { prisma } from '@/lib/prisma';

const parser = new Parser();

export async function POST() {
  const feeds = await prisma.rSSFeed.findMany({ where: { active: true } });
  let created = 0;

  for (const feed of feeds) {
    try {
      const res = await parser.parseURL(feed.url);
      for (const item of res.items.slice(0, 50)) {
        const url = item.link || item.guid || '';
        if (!url) continue;
        try {
          await prisma.rSSItem.create({
            data: {
              feedId: feed.id,
              url,
              guid: item.guid ?? undefined,
              title: item.title || 'Untitled',
              summary: item.contentSnippet || item.content || undefined,
              publishedAt: item.isoDate ? new Date(item.isoDate) : undefined,
            },
          });
          created++;
        } catch (e) {
          // ignore duplicates
        }
      }
      await prisma.rSSFeed.update({ where: { id: feed.id }, data: { lastFetchedAt: new Date() } });
    } catch (err) {
      console.error('RSS ingest error for', feed.url, err);
    }
  }

  return NextResponse.json({ created });
}
```

Install dependency:
```
npm install rss-parser
```

---

### Example: Job Runner (generation)

```ts
// src/app/api/ai/jobs/run/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function callLLM(prompt: string) {
  // Replace with chosen provider SDK; keep abstraction simple
  const apiKey = process.env.OPENAI_API_KEY;
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful expert solar blogger. Keep facts accurate and cite sources.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 1800,
    }),
  });
  if (!resp.ok) throw new Error('Model call failed');
  const data = await resp.json();
  return data.choices[0].message.content as string;
}

export async function POST() {
  // Take one job at a time
  const job = await prisma.aIGenerationJob.findFirst({ where: { status: 'QUEUED' }, include: { rssItem: true } });
  if (!job) return NextResponse.json({ processed: 0 });

  await prisma.aIGenerationJob.update({ where: { id: job.id }, data: { status: 'RUNNING' } });

  try {
    const topic = job.idea || job.rssItem?.title || 'Solar energy news';
    const summary = job.rssItem?.summary || '';
    const url = job.rssItem?.url || '';

    const prompt = `Research and write a high-quality blog post for homeowners about: "${topic}".
Include:
- Engaging title (H1)
- 120–160 char meta description
- 6–10 section outline
- 800–1200 word article with clear headings
- 3–5 key takeaways as bullets
- Include 2–4 external source links (if relevant)
- Short cover image prompt

Context:
${summary}
Source link: ${url}`;

    const content = await callLLM(prompt);

    // Parse simple fields from the content (use JSON if you prefer more structure)
    const titleMatch = content.match(/#\s+(.+)/);
    const title = titleMatch ? titleMatch[1].trim() : topic;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const draft = await prisma.draftPost.create({
      data: {
        jobId: job.id,
        title,
        slug,
        content,
        tags: [],
        qualityScore: 0,
      },
    });

    await prisma.aIGenerationJob.update({ where: { id: job.id }, data: { status: 'COMPLETED' } });
    if (job.rssItemId) {
      await prisma.rSSItem.update({ where: { id: job.rssItemId }, data: { status: 'PROCESSED' } });
    }

    return NextResponse.json({ processed: 1, draftId: draft.id });
  } catch (err: any) {
    await prisma.aIGenerationJob.update({ where: { id: job.id }, data: { status: 'FAILED', error: String(err) } });
    return NextResponse.json({ processed: 0, error: 'Job failed' }, { status: 500 });
  }
}
```

Notes:
- For robust parsing, have the model return JSON with keys: title, seoDescription, outline, content, coverPrompt, sources[].
- Add a second pass prompt to refine SEO, summarize excerpt, and ensure internal links.

---

### Admin UI Additions

Add these pages under `src/app/admin/dashboard/`:

- `ai/feeds`: Manage RSS feeds (add/edit/delete, activate, category mapping)
- `ai/queue`: View jobs with status, retry/abort actions
- `ai/drafts`: Draft review list with filters (date, score, source)
- `ai/settings`: Provider/model selection, temperature, tokens, rate limits
- `ai/schedule`: Calendar view to schedule drafts (drag to dates)

Draft review panel:
- Diff viewer for regenerated content versions
- Quick actions: Approve, Schedule, Improve SEO, Shorten, Change tone
- One-click Publish → converts DraftPost → BlogPost and copies SEO fields

---

### Publish Flow (Draft → Post)

When approving:
1. Map category and tags
2. Generate or upload cover image (optional image generation via provider of choice)
3. Create `BlogPost` from `DraftPost` fields
4. Set `status = PUBLISHED` and `publishedAt` or schedule via `scheduledFor`
5. Link `DraftPost.publishedPostId`

Optional image generation step:
- Use Cloudinary’s Generative Fill or a model like Stable Diffusion via API
- Store image URL in `coverImage`; save alt text from SEO

---

### Guardrails and Quality Gates

- Minimum word count threshold; reject otherwise
- Must include at least 2 external references for claims
- Brand voice prompt prepend (tone, audience, region)
- Blocklist for topics/domains
- AI content detector and plagiarism check (optional)
- Human-in-the-loop by default; toggle to semi/full auto later

---

### Execution Roadmap (2–3 weeks overlay on existing plan)

Week A (Setup & Ingest):
- Add Prisma models (RSSFeed, RSSItem, AIGenerationJob, DraftPost, AIProviderSetting)
- Create `rss/feeds` and `rss/ingest` routes; verify ingest works on 2–3 feeds
- Add admin Feeds page

Week B (Job Queue & Drafts):
- Implement `jobs/dispatch` (simple relevance score: keyword hits, recency)
- Implement `jobs/run` calling your chosen model
- Create Drafts admin page with details panel and Approve/Schedule actions
- Store structured JSON from model for reliable parsing

Week C (Scheduling & Publish):
- Add `drafts/[id]/publish` route → creates `BlogPost`
- Calendar UI for scheduling, cron to auto-publish scheduled drafts
- Provider settings page; add token usage/cost logging on jobs
- Add safety/quality validators and an “Improve SEO” button (secondary model call)

Stretch:
- Switch to BullMQ + Upstash Redis if volume increases
- Add embeddings for similarity search of internal posts for better linking

---

### Minimal Test Plan

- Unit: RSS parser utility, slug generator, prompt builders
- Integration: Ingest → Job → Draft pipeline with mock model
- E2E (admin): Add feed → Ingest → Draft appears → Approve → Publish → Post visible
- Load: Batch ingest 500 items; ensure dedup and queue capacity

---

### Cost Controls

- Cap tokens per job and max concurrent jobs
- Maintain daily/weekly budget ceiling; pause queue if exceeded
- Prefer cheaper model for outline; premium for final draft only
- Log tokens and estimated cost in `AIGenerationJob.costUsd`

---

### Security & Compliance

- Keep API keys in `.env`, never client-side
- Verify feed domains; sanitize fetched HTML
- Rate-limit AI routes, require admin auth
- Content safety filters for toxicity/PII

---

### Optional: Example Prompt Builder (outline → draft)

```ts
export function buildDraftPrompt(input: {
  topic: string;
  summary?: string;
  urls?: string[];
  audience?: string;
  tone?: string;
}) {
  const { topic, summary = '', urls = [], audience = 'US homeowners', tone = 'helpful, trustworthy' } = input;
  const refs = urls.map((u, i) => `${i + 1}. ${u}`).join('\n');
  return `You are an expert solar blogger writing for ${audience} in a ${tone} tone.
Task: Write a complete blog post on: "${topic}".
Deliver JSON with keys: {title, seoDescription, outline[], content, coverPrompt, sources[]}.
Rules: Be factual, include links in sources[], avoid fluff, 900-1200 words.
Context: ${summary}
Sources to consider:\n${refs}`;
}
```

---

With this AI layer, the blog can continuously produce high-quality, on-brand articles sourced from timely news, while keeping humans in control of quality and publishing cadence.


