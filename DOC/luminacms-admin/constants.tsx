
import { BlogPost, AnalyticsData, Comment, Category, Tag, MediaItem } from './types';

export const INITIAL_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of Web Development in 2025',
    // Added slug to match BlogPost interface
    slug: 'the-future-of-web-development-in-2025',
    excerpt: 'Exploring the impact of AI and edge computing on modern web architectures...',
    content: 'Full content of the blog post goes here...',
    author: 'Alex Rivers',
    status: 'published',
    publishDate: '2024-10-12',
    category: 'Technology',
    // Added tags to match BlogPost interface
    tags: ['Web Dev', 'AI', 'Edge Computing'],
    coverImage: 'https://picsum.photos/seed/tech/800/400',
    views: 1240,
    // Added SEO fields to match BlogPost interface
    metaTitle: 'The Future of Web Development in 2025 | Lumina',
    metaDescription: 'Learn about the impact of AI and edge computing on web architectures in 2025.',
    keywords: ['web development', 'AI', 'edge computing']
  },
  {
    id: '2',
    title: 'Designing for Accessibility: A Practical Guide',
    // Added slug to match BlogPost interface
    slug: 'designing-for-accessibility-a-practical-guide',
    excerpt: 'How to ensure your digital products are usable by everyone regardless of ability.',
    content: 'More content about accessibility...',
    author: 'Sam Chen',
    status: 'published',
    publishDate: '2024-10-15',
    category: 'Design',
    // Added tags to match BlogPost interface
    tags: ['Design', 'Accessibility', 'UX'],
    coverImage: 'https://picsum.photos/seed/design/800/400',
    views: 890,
    // Added SEO fields to match BlogPost interface
    metaTitle: 'Designing for Accessibility: A Practical Guide | Lumina',
    metaDescription: 'A comprehensive guide on creating accessible digital products for everyone.',
    keywords: ['accessibility', 'design', 'UX']
  }
];

export const MOCK_MEDIA: MediaItem[] = [
  {
    id: 'm1',
    url: 'https://picsum.photos/seed/office1/800/600',
    filename: 'modern-office-setup.jpg',
    title: 'Modern Office',
    alt: 'A clean desk with a laptop and coffee',
    caption: 'Our new headquarters in San Francisco',
    size: '1.2 MB',
    dimensions: '1920x1080',
    type: 'image',
    uploadedDate: '2024-10-01'
  },
  {
    id: 'm2',
    url: 'https://picsum.photos/seed/code1/800/600',
    filename: 'react-components.png',
    title: 'React Code Snippet',
    alt: 'VS Code displaying React functional components',
    caption: 'Example of reusable patterns',
    size: '450 KB',
    dimensions: '1200x800',
    type: 'image',
    uploadedDate: '2024-10-05'
  },
  {
    id: 'm4',
    url: 'https://picsum.photos/seed/ai/800/600',
    filename: 'ai-concept-art.jpg',
    title: 'AI Neural Network',
    alt: 'Glowy nodes connected by lines',
    caption: 'Abstract representation of machine learning',
    size: '2.1 MB',
    dimensions: '2560x1440',
    type: 'image',
    uploadedDate: '2024-10-12'
  },
  {
    id: 'm6',
    url: 'https://picsum.photos/seed/nature/800/600',
    filename: 'mountain-peak.jpg',
    title: 'Mountain Peak',
    alt: 'Snowy mountains under a clear blue sky',
    caption: 'Inspiration for our winter theme',
    size: '890 KB',
    dimensions: '1600x900',
    type: 'image',
    uploadedDate: '2024-10-15'
  }
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    author: 'John Doe',
    email: 'john@example.com',
    content: 'Great article! AI is definitely changing how we build components.',
    date: '2024-10-13',
    postId: '1',
    postTitle: 'The Future of Web Development in 2025',
    status: 'approved'
  },
  {
    id: 'c2',
    author: 'Jane Smith',
    email: 'jane@example.com',
    content: 'I have some questions about the accessibility guidelines mentioned here.',
    date: '2024-10-16',
    postId: '2',
    postTitle: 'Designing for Accessibility: A Practical Guide',
    status: 'pending'
  }
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Technology', slug: 'technology', count: 12 },
  { id: 'cat2', name: 'Design', slug: 'design', count: 8 },
  { id: 'cat3', name: 'Lifestyle', slug: 'lifestyle', count: 4 }
];

export const MOCK_TAGS: Tag[] = [
  { id: 't1', name: 'React', slug: 'react', count: 24 },
  { id: 't2', name: 'AI', slug: 'ai', count: 15 },
  { id: 't3', name: 'UX', slug: 'ux', count: 9 }
];

export const MOCK_ANALYTICS: AnalyticsData[] = [
  { name: 'Mon', views: 400, likes: 240 },
  { name: 'Tue', views: 300, likes: 139 },
  { name: 'Wed', views: 200, likes: 980 },
  { name: 'Thu', views: 278, likes: 390 },
  { name: 'Fri', views: 189, likes: 480 },
  { name: 'Sat', views: 239, likes: 380 },
  { name: 'Sun', views: 349, likes: 430 },
];
