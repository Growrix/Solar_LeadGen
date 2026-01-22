
import { BlogPost, AdminPost, Category, Tag, Comment, PostStatus, TrashedPost, AuthorProfile } from './types';

const SAMPLE_CONTENT = `
  <p class="lead text-xl text-slate-600 mb-8 leading-relaxed">
    Solar energy is rapidly evolving. As we look towards a sustainable future, understanding the nuances of photovoltaic technology and grid integration becomes crucial for homeowners and businesses alike.
  </p>
  
  <h2 class="text-2xl font-bold text-slate-900 mb-4 mt-8">The Shift to High-Efficiency Panels</h2>
  <p class="mb-6 text-slate-700 leading-7">
    Recent advancements in PERC (Passivated Emitter and Rear Cell) technology have pushed efficiency ratings beyond 22%. This means homeowners can generate more power with fewer panels, maximizing the potential of limited roof space. The integration of bifacial modules, which capture sunlight from both sides, is also gaining traction in residential markets.
  </p>
  
  <h2 class="text-2xl font-bold text-slate-900 mb-4 mt-8">Battery Storage: The Game Changer</h2>
  <p class="mb-6 text-slate-700 leading-7">
    Energy independence is no longer a pipe dream. With the cost of lithium-ion batteries dropping by over 80% in the last decade, pairing solar with storage is becoming the standard. This allows households to store excess energy generated during the day for use during peak evening hours or grid outages.
  </p>
  
  <blockquote class="border-l-4 border-solar-500 pl-6 italic text-slate-600 my-8">
    "The combination of solar plus storage is the single most effective way to insulate yourself from rising utility rates and grid instability."
  </blockquote>

  <h2 class="text-2xl font-bold text-slate-900 mb-4 mt-8">Policy and Incentives</h2>
  <p class="mb-6 text-slate-700 leading-7">
    Government incentives continue to play a pivotal role. The extended Investment Tax Credit (ITC) provides a significant financial buffer, making the ROI on solar installations more attractive than ever. However, navigating the local rebates and net metering policies requires due diligence.
  </p>

  <p class="mb-6 text-slate-700 leading-7">
    In conclusion, the trajectory is clear. Solar is not just an alternative; it is becoming the backbone of modern energy infrastructure. Whether you are looking to save money or save the planet, now is the time to explore your options.
  </p>
`;

export const MOCK_AUTHORS: AuthorProfile[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@solarmatch.com',
    avatar: 'https://picsum.photos/seed/user1/100/100',
    role: 'editor',
    status: 'active',
    joinedAt: 'Jan 15, 2023'
  },
  {
    id: '2',
    name: 'David Chen',
    email: 'david.c@solarmatch.com',
    avatar: 'https://picsum.photos/seed/user2/100/100',
    role: 'contributor',
    status: 'active',
    joinedAt: 'Mar 10, 2023'
  },
  {
    id: '3',
    name: 'Emily Ross',
    email: 'emily.r@solarmatch.com',
    avatar: 'https://picsum.photos/seed/user3/100/100',
    role: 'contributor',
    status: 'inactive',
    joinedAt: 'Apr 05, 2023'
  },
  {
    id: 'admin',
    name: 'Admin User',
    email: 'admin@solarmatch.com',
    avatar: 'https://picsum.photos/seed/user_admin/100/100',
    role: 'admin',
    status: 'active',
    joinedAt: 'Jan 01, 2023'
  }
];

export const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'future-of-solar-energy-2024',
    title: 'The Future of Solar Energy: Trends to Watch in 2024',
    excerpt: 'Explore the emerging technologies and policy shifts that are set to redefine the renewable energy landscape this year.',
    content: SAMPLE_CONTENT,
    coverImage: 'https://picsum.photos/seed/solar1/800/600',
    category: 'Industry News',
    author: { name: 'Sarah Jenkins', avatar: 'https://picsum.photos/seed/user1/100/100' },
    authorId: '1',
    publishedAt: 'Oct 12, 2023',
    readTime: '5 min read',
  },
  {
    id: '2',
    slug: 'maximizing-panel-efficiency',
    title: 'Maximizing Efficiency: How to Maintain Your Solar Panels',
    excerpt: 'Simple maintenance tips to ensure your solar installation operates at peak performance throughout the seasons.',
    content: SAMPLE_CONTENT,
    coverImage: 'https://picsum.photos/seed/solar2/800/600',
    category: 'Guides',
    author: { name: 'David Chen', avatar: 'https://picsum.photos/seed/user2/100/100' },
    authorId: '2',
    publishedAt: 'Oct 08, 2023',
    readTime: '8 min read',
  },
  {
    id: '3',
    slug: 'solar-financing-explained',
    title: 'Solar Financing Explained: Leases vs. Loans',
    excerpt: 'Breaking down the financial options available for homeowners looking to switch to clean energy without breaking the bank.',
    content: SAMPLE_CONTENT,
    coverImage: 'https://picsum.photos/seed/solar3/800/600',
    category: 'Finance',
    author: { name: 'Emily Ross', avatar: 'https://picsum.photos/seed/user3/100/100' },
    authorId: '3',
    publishedAt: 'Sep 29, 2023',
    readTime: '6 min read',
  },
  {
    id: '4',
    slug: 'commercial-solar-benefits',
    title: 'Why Commercial Solar Adoption is Accelerating',
    excerpt: 'Businesses are finding that sustainability and profitability go hand in hand. Here is why more companies are going solar.',
    content: SAMPLE_CONTENT,
    coverImage: 'https://picsum.photos/seed/solar4/800/600',
    category: 'Case Studies',
    author: { name: 'Michael Wright', avatar: 'https://picsum.photos/seed/user4/100/100' },
    publishedAt: 'Sep 15, 2023',
    readTime: '4 min read',
  },
  {
    id: '5',
    slug: 'understanding-net-metering',
    title: 'Understanding Net Metering: Getting Paid for Your Power',
    excerpt: 'A comprehensive guide to how net metering works and how you can benefit from sending excess energy back to the grid.',
    content: SAMPLE_CONTENT,
    coverImage: 'https://picsum.photos/seed/solar5/800/600',
    category: 'Policy',
    author: { name: 'Sarah Jenkins', avatar: 'https://picsum.photos/seed/user1/100/100' },
    authorId: '1',
    publishedAt: 'Sep 10, 2023',
    readTime: '7 min read',
  },
  {
    id: '6',
    slug: 'battery-storage-revolution',
    title: 'The Battery Storage Revolution',
    excerpt: 'How advanced battery systems are making solar power a reliable 24/7 energy solution for modern homes.',
    content: SAMPLE_CONTENT,
    coverImage: 'https://picsum.photos/seed/solar6/800/600',
    category: 'Technology',
    author: { name: 'Alex Johnson', avatar: 'https://picsum.photos/seed/user5/100/100' },
    publishedAt: 'Sep 01, 2023',
    readTime: '10 min read',
  },
];

// Helper to assign mock statuses
const getMockStatus = (index: number): PostStatus => {
  if (index === 0) return 'published';
  if (index === 1) return 'scheduled'; // Future Date
  if (index === 2) return 'draft';
  if (index === 3) return 'needs_review';
  if (index === 4) return 'archived';
  return 'published';
};

export const MOCK_ADMIN_POSTS: AdminPost[] = MOCK_POSTS.map((post, index) => ({
  ...post,
  status: getMockStatus(index),
  updatedAt: post.publishedAt,
}));

export const MOCK_TRASHED_POSTS: TrashedPost[] = [
  { 
    id: 't1', 
    title: 'Obsolete Solar Tariffs 2022', 
    previousStatus: 'published', 
    author: 'Sarah Jenkins', 
    trashedAt: '2 days ago',
    category: 'Policy'
  },
  { 
    id: 't2', 
    title: 'Draft: Winter Installation Tips', 
    previousStatus: 'draft', 
    author: 'Admin User', 
    trashedAt: '5 days ago',
    category: 'Guides'
  },
  { 
    id: 't3', 
    title: 'Untitled Post 23', 
    previousStatus: 'draft', 
    author: 'AI Assistant', 
    trashedAt: '1 week ago',
    category: 'Uncategorized'
  },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Industry News', slug: 'industry-news', count: 12, updatedAt: 'Oct 10, 2023' },
  { id: '2', name: 'Guides', slug: 'guides', count: 8, updatedAt: 'Oct 05, 2023' },
  { id: '3', name: 'Finance', slug: 'finance', count: 5, updatedAt: 'Sep 28, 2023' },
  { id: '4', name: 'Case Studies', slug: 'case-studies', count: 4, updatedAt: 'Sep 15, 2023' },
  { id: '5', name: 'Policy', slug: 'policy', count: 6, updatedAt: 'Sep 12, 2023' },
  { id: '6', name: 'Technology', slug: 'technology', count: 9, updatedAt: 'Sep 01, 2023' },
];

export const MOCK_TAGS: Tag[] = [
  { id: '1', name: 'Solar', slug: 'solar', count: 24, updatedAt: 'Oct 12, 2023' },
  { id: '2', name: 'Sustainability', slug: 'sustainability', count: 18, updatedAt: 'Oct 10, 2023' },
  { id: '3', name: 'Renewable Energy', slug: 'renewable-energy', count: 15, updatedAt: 'Oct 08, 2023' },
  { id: '4', name: 'Grid', slug: 'grid', count: 9, updatedAt: 'Sep 30, 2023' },
  { id: '5', name: 'Efficiency', slug: 'efficiency', count: 7, updatedAt: 'Sep 25, 2023' },
  { id: '6', name: 'Innovation', slug: 'innovation', count: 11, updatedAt: 'Sep 20, 2023' },
  { id: '7', name: 'Cost Savings', slug: 'cost-savings', count: 6, updatedAt: 'Sep 15, 2023' },
  { id: '8', name: 'Installation', slug: 'installation', count: 5, updatedAt: 'Sep 10, 2023' },
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    postTitle: 'The Future of Solar Energy: Trends to Watch in 2024',
    postSlug: 'future-of-solar-energy-2024',
    authorName: 'John Doe',
    authorEmail: 'john@example.com',
    authorAvatar: 'https://picsum.photos/seed/c1/100/100',
    content: 'This is a fantastic article! I really appreciate the breakdown of PERC technology. Do you think bifacial panels are worth the extra cost for residential setups?',
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
    content: 'Great tips. I usually just hose mine down, but I will look into professional cleaning services for the spring.',
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
    content: 'This article is garbage. You don\'t know what you are talking about.',
    status: 'hidden',
    submittedAt: '3 days ago',
  },
];
