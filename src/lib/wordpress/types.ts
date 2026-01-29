export type WpRendered = { rendered: string };

export type WpTerm = {
  id: number;
  name: string;
  slug: string;
  taxonomy?: string;
  link?: string;
};

export type WpPost = {
  id: number;
  date: string;
  slug: string;
  link: string;
  title: WpRendered;
  content: WpRendered;
  excerpt: WpRendered;
  featured_media?: number;
  categories?: number[];
  tags?: number[];
  // Optional SEO plugin fields (e.g., Yoast)
  yoast_head_json?: {
    title?: string;
    description?: string;
    og_title?: string;
    og_description?: string;
    og_image?: Array<{ url?: string }>;
  };
  _embedded?: {
    author?: Array<{ name?: string }>; 
    'wp:featuredmedia'?: Array<{ source_url?: string }>;
    'wp:term'?: Array<Array<WpTerm>>;
  };
};
