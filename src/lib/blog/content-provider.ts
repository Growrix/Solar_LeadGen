import { allArticles } from '@/data/blogData';
import type { BlogCategory, BlogPost, BlogPostSummary, Post } from '@/types/blog';

export interface BlogContentProvider {
  listPublishedPostSummaries(): BlogPostSummary[];
  listCategories(): BlogCategory[];
  getPublishedPostBySlug(slug: string): BlogPost | null;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function mockContentForTitle(title: string): string {
  return [
    `# ${title}`,
    '',
    'This is placeholder content during the frontend-first build.',
    'It will be replaced by real editor content once the backend models and CMS are implemented.',
    '',
    '## What you will learn',
    '- Key concepts in plain English',
    '- Practical steps homeowners can take',
    '- Common pitfalls to avoid',
  ].join('\n');
}

function toSummary(article: Post): BlogPostSummary {
  const slug = slugify(article.title);
  return {
    id: `mock:${slug}`,
    slug,
    title: article.title,
    excerpt: article.excerpt,
    authorName: article.author,
    publishedDateLabel: article.date,
    readTimeLabel: article.readTime,
    categoryName: article.category,
    featuredImageUrl: article.image,
  };
}

function toPost(article: Post): BlogPost {
  const summary = toSummary(article);
  return {
    ...summary,
    status: 'PUBLISHED',
    content: mockContentForTitle(article.title),
    contentFormat: 'markdown',
    seoTitle: article.title,
    seoDescription: article.excerpt,
    ogImageUrl: article.image,
    tags: [],
  };
}

function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    result.push(item);
  }
  return result;
}

function createMockBlogContentProvider(): BlogContentProvider {
  const posts = allArticles.map(toPost);
  const postsBySlug = new Map(posts.map((p) => [p.slug, p] as const));

  return {
    listPublishedPostSummaries(): BlogPostSummary[] {
      return posts.map(({ id, slug, title, excerpt, authorName, publishedDateLabel, readTimeLabel, categoryName, featuredImageUrl }) => ({
        id,
        slug,
        title,
        excerpt,
        authorName,
        publishedDateLabel,
        readTimeLabel,
        categoryName,
        featuredImageUrl,
      }));
    },

    listCategories(): BlogCategory[] {
      const categories = uniqueBy(posts, (p) => p.categoryName).map((p) => {
        const slug = slugify(p.categoryName);
        return {
          id: `mock:cat:${slug}`,
          name: p.categoryName,
          slug,
        } satisfies BlogCategory;
      });

      return categories;
    },

    getPublishedPostBySlug(slug: string): BlogPost | null {
      return postsBySlug.get(slug) ?? null;
    },
  };
}

export const blogContentProvider: BlogContentProvider = createMockBlogContentProvider();
