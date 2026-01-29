
import React from 'react';
import { 
  BarChart3, 
  FileText, 
  Image as ImageIcon, 
  MessageSquare, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Zap
} from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { AdminPost, Comment, PostStatus } from '../../types';

const AdminOverview: React.FC = () => {
  const { posts, media, comments } = useBlog();

  // --- Statistics Calculation ---

  // Posts Stats
  const totalPosts = posts.length;
  const publishedPosts = posts.filter(p => p.status === 'published').length;
  const draftPosts = posts.filter(p => p.status === 'draft').length;
  const reviewPosts = posts.filter(p => p.status === 'needs_review').length;
  const scheduledPosts = posts.filter(p => p.status === 'scheduled').length;

  // Media Stats
  const totalMedia = media.length;
  const recentMedia = media.filter(m => m.uploadedAt === 'Just now' || m.uploadedAt.includes('hour') || m.uploadedAt.includes('min')).length;
  
  // Storage usage simulation (parse '1.2 MB', '24 MB' etc)
  const totalStorageBytes = media.reduce((acc, item) => {
    const parts = item.size.split(' ');
    const val = parseFloat(parts[0]);
    const unit = parts[1];
    if (unit === 'GB') return acc + val * 1024;
    if (unit === 'KB') return acc + val / 1024;
    return acc + val; // MB default
  }, 0);
  const totalStorageDisplay = totalStorageBytes > 1024 
    ? `${(totalStorageBytes / 1024).toFixed(1)} GB` 
    : `${totalStorageBytes.toFixed(1)} MB`;

  // Comments Stats
  const pendingComments = comments.filter(c => c.status === 'pending').length;
  const totalComments = comments.length;

  // --- Activity Stream Construction ---

  type ActivityItem = {
    id: string;
    type: 'post' | 'media' | 'comment';
    title: string;
    subtitle: string;
    timestamp: string;
    status?: string;
    user?: string;
    icon: React.ElementType;
  };

  const activities: ActivityItem[] = [
    ...posts.slice(0, 5).map(p => ({
      id: p.id,
      type: 'post' as const,
      title: p.title,
      subtitle: `Status: ${p.status.replace('_', ' ')}`,
      timestamp: p.updatedAt,
      status: p.status,
      user: typeof p.author === 'string' ? p.author : p.author.name,
      icon: FileText
    })),
    ...media.slice(0, 5).map(m => ({
      id: m.id,
      type: 'media' as const,
      title: m.name,
      subtitle: `${m.type} • ${m.size}`,
      timestamp: m.uploadedAt,
      icon: ImageIcon
    })),
    ...comments.slice(0, 5).map(c => ({
      id: c.id,
      type: 'comment' as const,
      title: `Comment by ${c.authorName}`,
      subtitle: `on "${c.postTitle}"`,
      timestamp: c.submittedAt,
      status: c.status,
      icon: MessageSquare
    }))
  ];

  // Helper to crudely sort mixed timestamps (Just now > mins > hours > days > dates)
  const getSortWeight = (timeStr: string) => {
    if (timeStr === 'Just now') return 1000;
    if (timeStr.includes('min')) return 900;
    if (timeStr.includes('hour')) return 800;
    if (timeStr.includes('day')) return 700;
    return 100; // Dates
  };

  const sortedActivity = activities.sort((a, b) => getSortWeight(b.timestamp) - getSortWeight(a.timestamp)).slice(0, 8);

  // --- Components ---

  const StatCard = ({ title, value, subValue, icon: Icon, colorClass, trend }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
        {trend && (
          <div className="flex items-center mt-2 text-xs font-medium text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Overview of your blog's performance and content pipeline.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.hash = '#/admin/blog/new'}
              className="inline-flex items-center justify-center px-4 py-2 bg-solar-600 hover:bg-solar-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Content" 
            value={totalPosts} 
            subValue={`${publishedPosts} published`}
            icon={FileText} 
            colorClass="bg-blue-50 text-blue-600"
            trend="+2 this week"
          />
          <StatCard 
            title="Media Library" 
            value={totalMedia} 
            subValue={`${totalStorageDisplay} used`}
            icon={ImageIcon} 
            colorClass="bg-purple-50 text-purple-600"
            trend="+5 files added"
          />
          <StatCard 
            title="Engagement" 
            value={totalComments} 
            subValue={`${pendingComments} pending`}
            icon={MessageSquare} 
            colorClass="bg-amber-50 text-amber-600"
          />
          <StatCard 
            title="Engine Health" 
            value="Active" 
            subValue="Systems nominal"
            icon={Zap} 
            colorClass="bg-green-50 text-green-600"
          />
        </div>

        {/* Bottlenecks / Action Items */}
        {(reviewPosts > 0 || pendingComments > 0 || scheduledPosts > 0) && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-solar-600" />
              <h3 className="font-bold text-slate-900">Attention Needed</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {reviewPosts > 0 && (
                <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{reviewPosts} posts require review</p>
                      <p className="text-xs text-slate-500">Drafts are waiting for approval before publishing.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.location.hash = '#/admin/blog'}
                    className="text-sm font-medium text-solar-600 hover:text-solar-700 flex items-center gap-1"
                  >
                    Review <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
              {pendingComments > 0 && (
                <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{pendingComments} comments pending moderation</p>
                      <p className="text-xs text-slate-500">User comments waiting to be approved or rejected.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.location.hash = '#/admin/blog/comments'}
                    className="text-sm font-medium text-solar-600 hover:text-solar-700 flex items-center gap-1"
                  >
                    Moderate <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
              {scheduledPosts > 0 && (
                <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{scheduledPosts} posts scheduled</p>
                      <p className="text-xs text-slate-500">Upcoming content ready to go live automatically.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.location.hash = '#/admin/blog'}
                    className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    View Schedule <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Recent Activity</h3>
              <button className="text-xs font-medium text-slate-500 hover:text-slate-700">View All</button>
            </div>
            <div className="flex-1 overflow-hidden">
              {sortedActivity.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {sortedActivity.map((item) => (
                    <div key={`${item.type}-${item.id}`} className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        item.type === 'post' ? 'bg-blue-50 text-blue-600' :
                        item.type === 'media' ? 'bg-purple-50 text-purple-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-slate-900 truncate pr-2">{item.title}</p>
                          <span className="text-xs text-slate-400 whitespace-nowrap">{item.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{item.subtitle}</p>
                        {item.user && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] text-slate-600 font-bold">
                              {item.user.charAt(0)}
                            </div>
                            <span className="text-xs text-slate-400">{item.user}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No recent activity found.
                </div>
              )}
            </div>
          </div>

          {/* Quick Links & System */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-900 text-sm">Quick Actions</h3>
              </div>
              <div className="p-4 space-y-2">
                <button 
                  onClick={() => window.location.hash = '#/admin/blog/new'}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left group"
                >
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-slate-900">Draft New Post</span>
                    <span className="block text-xs text-slate-500">Open editor</span>
                  </div>
                </button>

                <button 
                  onClick={() => window.location.hash = '#/admin/blog/media'}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left group"
                >
                  <div className="bg-purple-100 text-purple-600 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-slate-900">Upload Media</span>
                    <span className="block text-xs text-slate-500">Manage library</span>
                  </div>
                </button>

                <button 
                  onClick={() => window.location.hash = '#/admin/blog/engine'}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left group"
                >
                  <div className="bg-amber-100 text-amber-600 p-2 rounded-lg group-hover:bg-amber-200 transition-colors">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-slate-900">Configure Engine</span>
                    <span className="block text-xs text-slate-500">Automation rules</span>
                  </div>
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden text-white p-6 relative">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Zap className="w-24 h-24" />
               </div>
               <h3 className="font-bold text-lg mb-1 relative z-10">System Status</h3>
               <p className="text-slate-400 text-xs mb-6 relative z-10">Last check: Just now</p>
               
               <div className="space-y-3 relative z-10">
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-slate-300 flex items-center gap-2">
                     <CheckCircle2 className="w-4 h-4 text-green-400" /> Database
                   </span>
                   <span className="text-green-400 font-medium">Operational</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-slate-300 flex items-center gap-2">
                     <CheckCircle2 className="w-4 h-4 text-green-400" /> API Quota
                   </span>
                   <span className="text-green-400 font-medium">Good (12%)</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-slate-300 flex items-center gap-2">
                     <Calendar className="w-4 h-4 text-blue-400" /> Next Publish
                   </span>
                   <span className="text-white font-medium">14:00 UTC</span>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
