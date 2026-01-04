export interface Post {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;

  // Optional fields used by canonical routing and DB-backed content
  slug?: string;
  key?: string;
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  robots?: string;
}
