
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Eye, Calendar, Send, Archive, 
  Image as ImageIcon, Sparkles, Layout, Globe, Clock, AlertCircle, CheckCircle, Loader2, RefreshCw
} from 'lucide-react';
import { AdminPost, ViewState, PostStatus } from '../../types';
import { useBlog } from '../../context/BlogContext';
import SkeletonEditor from './SkeletonEditor';
import ConfirmationModal from './ConfirmationModal';
import ScheduleModal from './ScheduleModal';
import MediaPickerModal from './MediaPickerModal';

interface AdminEditorProps {
  id?: string; // 'new' or UUID
  onBack: () => void;
}

type TabType = 'content' | 'seo' | 'scheduling' | 'ai';

// Mock Drafts Data Lookup (Mirroring EngineDrafts for demo continuity)
// In a real app this would also be in the context or a separate store
const MOCK_DRAFTS_LOOKUP: Record<string, any> = {
  '101': { 
    title: 'Solar Battery Storage Trends 2025', 
    slug: 'solar-battery-trends-2025',
    category: 'Technology', 
    excerpt: 'An in-depth look at how lithium-iron-phosphate adoption is reshaping residential storage...',
    content: '<h2>The Rise of LFP</h2><p>Lithium Iron Phosphate batteries are taking over the market due to their safety profile and longevity...</p>' 
  },
  '102': { 
    title: 'Tax Incentives for Commercial Solar', 
    slug: 'commercial-solar-tax-incentives',
    category: 'Finance', 
    excerpt: 'Updated guide on the ITC extension and what it means for small businesses in California...',
    content: '<p>The Investment Tax Credit (ITC) has been a major driver for solar adoption...</p>' 
  },
  '103': { 
    title: 'The Myth of cloudy days', 
    slug: 'myth-cloudy-days-solar',
    category: 'Guides', 
    excerpt: 'Debunking common misconceptions about solar production during winter months.',
    content: '<p>Many homeowners believe that solar panels stop working when it gets cloudy. This is false...</p>' 
  },
  '104': { 
    title: 'Installation Safety Protocols', 
    slug: 'installation-safety-protocols',
    category: 'Policy', 
    excerpt: 'Internal guidelines for safety harness compliance...',
    content: '<ul><li>Check harness straps</li><li>Secure ladders</li></ul>' 
  },
  '105': { 
    title: 'Old Gen Panel Recycling', 
    slug: 'panel-recycling-report',
    category: 'Sustainability', 
    excerpt: 'What happens to panels after 25 years? A sustainability report.',
    content: '<p>Recycling photovoltaic modules is the next big challenge for the industry...</p>' 
  },
};

const AdminEditor: React.FC<AdminEditorProps> = ({ id, onBack }) => {
  const { posts, addPost, updatePost } = useBlog();
  const isNew = !id || id === 'new';
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [activeTab, setActiveTab] = useState<TabType>('content');
  
  // Modal & Notification State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Saving State
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [saveStatusLabel, setSaveStatusLabel] = useState(isNew ? 'Unsaved' : 'Last saved 2 mins ago');

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Slug Generation State
  const [isSlugTouched, setIsSlugTouched] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string;
    category: string;
    tags: string;
    content: string;
    publishedAt: string;
    status: PostStatus;
  }>({
    title: '',
    slug: '',
    excerpt: '',
    coverImage: '',
    category: '',
    tags: '',
    content: '',
    publishedAt: '',
    status: 'draft',
  });

  // Load Data
  useEffect(() => {
    setViewState('loading');
    setSaveStatusLabel(isNew ? 'Unsaved' : 'Last saved 2 mins ago');

    if (isNew) {
      // Small timeout to simulate init
      setTimeout(() => setViewState('success'), 300);
      setIsSlugTouched(false);
      return;
    }

    // Try finding in context posts first
    const foundPost = posts.find(p => p.id === id);
    
    if (foundPost) {
      setFormData({
        title: foundPost.title,
        slug: foundPost.slug,
        excerpt: foundPost.excerpt,
        coverImage: foundPost.coverImage,
        category: foundPost.category,
        tags: 'Solar, Tech, Energy', // Mock tags as they are not on AdminPost type yet
        content: foundPost.content,
        publishedAt: foundPost.publishedAt,
        status: foundPost.status,
      });
      setIsSlugTouched(true);
      setViewState('success');
      return;
    } 
    
    // Try finding in mock drafts (from Engine Hub)
    if (id && MOCK_DRAFTS_LOOKUP[id]) {
      const draft = MOCK_DRAFTS_LOOKUP[id];
      setFormData({
        title: draft.title,
        slug: draft.slug,
        excerpt: draft.excerpt,
        coverImage: '',
        category: draft.category,
        tags: 'Draft, Automation',
        content: draft.content,
        publishedAt: '',
        status: 'draft',
      });
      setIsSlugTouched(true);
      setViewState('success');
      return;
    }

    // Not found
    setViewState('error');
  }, [id, isNew, posts]);

  // Toast Timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const generateSlug = (text: string) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/(^-|-$)+/g, ''); // Remove leading/trailing hyphens
  };

  const handleSlugRegenerate = () => {
    if (formData.title) {
      handleInputChange('slug', generateSlug(formData.title));
      setIsSlugTouched(false); // Reset touch state so it auto-updates again until manually edited
    }
  };

  // Handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updates: any = { [field]: value };
      
      // Auto-generate slug if title changes and slug hasn't been manually touched
      if (field === 'title' && !isSlugTouched) {
        updates.slug = generateSlug(value);
      }
      
      return { ...prev, ...updates };
    });

    if (field === 'slug') {
      setIsSlugTouched(true);
    }
  };

  const isFormValid = formData.title && formData.slug && formData.content;

  const handlePreview = () => {
    if (isNew) {
      setNotification({ message: 'Save draft to enable preview (demo).', type: 'error' });
      return;
    }
    window.location.hash = `/admin/blog/${id}/preview`;
  };

  // Helper to persist data to context
  const persistData = (newStatus?: PostStatus) => {
    const postData = {
      ...formData,
      status: newStatus || formData.status,
      // Default fields for new post
      author: { name: 'Admin User', avatar: 'https://picsum.photos/seed/user_admin/100/100' },
      readTime: '5 min read',
      updatedAt: 'Just now'
    };

    if (isNew) {
      // Create new ID
      const newId = Math.random().toString(36).substr(2, 9);
      addPost({
        id: newId,
        ...postData
      });
      // Redirect to edit mode for the new ID so we don't create duplicates on subsequent saves
      window.location.hash = `#/admin/blog/${newId}`;
    } else if (id) {
      updatePost(id, postData);
    }
  };

  const handleSaveDraft = () => {
    setIsSavingDraft(true);
    setTimeout(() => {
      persistData('draft');
      setIsSavingDraft(false);
      setSaveStatusLabel('Last saved Just now');
      setNotification({ message: 'Draft saved successfully.', type: 'success' });
    }, 800);
  };

  const confirmPublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      persistData('published');
      setIsPublishing(false);
      setIsPublishModalOpen(false);
      setFormData(prev => ({ ...prev, status: 'published' }));
      setNotification({ message: 'Post published successfully.', type: 'success' });
    }, 1500);
  };

  const confirmSchedule = (date: string) => {
    setIsScheduling(true);
    setTimeout(() => {
      persistData('scheduled');
      // Also update publishedAt in local state
      setFormData(prev => ({ 
        ...prev, 
        publishedAt: date,
        status: 'scheduled'
      }));
      updatePost(id || '', { publishedAt: date });
      
      setIsScheduling(false);
      setIsScheduleModalOpen(false);
      setNotification({ message: 'Post publication scheduled successfully.', type: 'success' });
    }, 1500);
  };

  const handleAIGenerate = () => {
    if (!aiPrompt.trim()) return;
    
    setIsGeneratingAI(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsGeneratingAI(false);
      
      // Generate simulated content
      const generatedContent = `\n\n<h3>Generated Section: ${aiPrompt}</h3>\n<p>This content was generated by the AI assistant based on your prompt. It analyzes the context of your request to provide relevant, SEO-optimized text suitable for your audience.</p>`;
      
      // Update form data with appended content
      setFormData(prev => ({
        ...prev,
        content: prev.content + generatedContent
      }));
      
      setNotification({ message: 'Content generated and appended to editor.', type: 'success' });
      setAiPrompt('');
      
      // Switch back to content tab to show result
      setActiveTab('content');
    }, 1500);
  };

  const handleAction = (action: 'publish' | 'schedule') => {
    if (action === 'publish') {
      setIsPublishModalOpen(true);
    } else if (action === 'schedule') {
      setIsScheduleModalOpen(true);
    }
  };

  if (viewState === 'loading') return <SkeletonEditor />;

  if (viewState === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Editor Error</h2>
        <p className="text-slate-500 mb-6">Could not load the requested post.</p>
        <button onClick={onBack} className="text-slate-900 font-medium underline">Return to List</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
             <CheckCircle className="w-5 h-5 text-green-400" />
             <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmationModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={confirmPublish}
        isLoading={isPublishing}
        title="Publish now?"
        message="Are you sure you want to publish this post? It will become visible to all visitors immediately."
        confirmLabel="Publish Post"
        cancelLabel="Cancel"
        isDestructive={false}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onConfirm={confirmSchedule}
        isLoading={isScheduling}
        initialDate={formData.publishedAt ? new Date(formData.publishedAt).toISOString().slice(0, 16) : ''}
      />

      <MediaPickerModal 
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => handleInputChange('coverImage', url)}
      />

      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">
            {isNew ? 'Create New Post' : 'Edit Post'}
          </h1>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full uppercase tracking-wide ${
            formData.status === 'published' ? 'bg-green-100 text-green-700' : 
            formData.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
            formData.status === 'archived' ? 'bg-stone-100 text-stone-600' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {formData.status.replace('_', ' ')}
          </span>
        </div>
        <div className="text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
          {saveStatusLabel}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow max-w-5xl mx-auto w-full px-6 py-8 pb-32">
        
        {/* Top Fields Group */}
        <div className="space-y-6 mb-10 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter post title"
              className="w-full px-4 py-3 text-lg font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-all placeholder-slate-400 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Slug</label>
              <div className="flex rounded-lg shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm font-mono">
                  /blog/
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="post-url-slug"
                  className="flex-1 min-w-0 block w-full px-3 py-2.5 rounded-none border border-slate-300 focus:ring-2 focus:ring-solar-500 focus:border-solar-500 sm:text-sm font-mono text-slate-700 placeholder-slate-400"
                />
                <button 
                  onClick={handleSlugRegenerate}
                  className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 text-slate-500 hover:text-solar-600 hover:bg-slate-100 transition-colors"
                  title="Regenerate slug from title"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none text-sm bg-white text-slate-700"
              >
                <option value="">Select Category</option>
                <option value="Industry News">Industry News</option>
                <option value="Guides">Guides</option>
                <option value="Technology">Technology</option>
                <option value="Policy">Policy</option>
                <option value="Finance">Finance</option>
                <option value="Sustainability">Sustainability</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Cover Image */}
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cover Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => handleInputChange('coverImage', e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none text-sm placeholder-slate-400"
                  />
                  <button 
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
                    title="Select from Media Library"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  {formData.coverImage && (
                    <div className="w-10 h-10 rounded border border-slate-200 overflow-hidden flex-shrink-0 bg-slate-100">
                      <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
             </div>

             {/* Tags */}
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="Comma separated tags..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none text-sm placeholder-slate-400"
                />
             </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Excerpt</label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              placeholder="Short summary for listing pages..."
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none text-sm resize-none placeholder-slate-400"
            />
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'content', label: 'Content', icon: Layout },
              { id: 'seo', label: 'SEO', icon: Globe },
              { id: 'scheduling', label: 'Scheduling', icon: Clock },
              { id: 'ai', label: 'AI Assistant', icon: Sparkles },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all
                  ${activeTab === tab.id 
                    ? 'border-solar-500 text-solar-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                `}
              >
                <tab.icon className={`
                  -ml-0.5 mr-2 h-4 w-4
                  ${activeTab === tab.id ? 'text-solar-500' : 'text-slate-400 group-hover:text-slate-500'}
                `} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Panels */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[400px] p-6">
          
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="flex flex-col h-full">
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your story here... HTML supported for now."
                className="w-full h-96 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent outline-none font-mono text-sm leading-relaxed placeholder-slate-400"
              />
              <p className="mt-2 text-xs text-slate-400 text-right">Markdown/HTML supported</p>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Meta Title</label>
                <input
                  type="text"
                  placeholder="Defaults to post title if empty"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none text-sm placeholder-slate-400"
                />
                <p className="mt-1 text-xs text-slate-500">Recommended length: 50-60 characters</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Meta Description</label>
                <textarea
                  rows={3}
                  placeholder="Defaults to excerpt if empty"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none text-sm placeholder-slate-400"
                />
                <p className="mt-1 text-xs text-slate-500">Recommended length: 150-160 characters</p>
              </div>
            </div>
          )}

          {/* Scheduling Tab */}
          {activeTab === 'scheduling' && (
            <div className="space-y-6 max-w-lg">
              <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm mb-4 border border-blue-100">
                This post is currently <strong>{formData.status.replace('_', ' ')}</strong>.
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Publish Date</label>
                <input
                  type="datetime-local"
                  value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('publishedAt', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none text-sm placeholder-slate-400"
                />
              </div>
            </div>
          )}

          {/* AI Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
               <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 mb-4">
                 <h4 className="font-semibold text-purple-900 mb-1 flex items-center gap-2">
                   <Sparkles className="w-4 h-4" /> AI Assistant
                 </h4>
                 <p className="text-sm text-purple-700">Use AI to generate outlines, improve grammar, or suggest titles.</p>
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prompt</label>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., 'Rewrite the intro to be more engaging'"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none text-sm placeholder-slate-400"
                  />
               </div>
               <button 
                 onClick={handleAIGenerate}
                 disabled={isGeneratingAI || !aiPrompt.trim()}
                 className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
               >
                 {isGeneratingAI ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                    </>
                 ) : (
                    <>
                        <Sparkles className="w-4 h-4" />
                        Generate
                    </>
                 )}
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button 
               disabled
               aria-disabled="true"
               title="Not in scope"
               className="flex items-center gap-2 px-4 py-2 text-slate-400 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium cursor-not-allowed opacity-70"
             >
               <Archive className="w-4 h-4" />
               <span className="hidden sm:inline">Archive</span>
             </button>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={handleSaveDraft}
               disabled={isSavingDraft}
               className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               <span className="hidden sm:inline">{isSavingDraft ? 'Saving...' : 'Save Draft'}</span>
             </button>
             
             <button 
               onClick={handlePreview}
               disabled={isNew}
               aria-disabled={isNew}
               title={isNew ? 'Save draft to enable preview (demo)' : undefined}
               className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
             >
               <Eye className="w-4 h-4" />
               <span className="hidden sm:inline">Preview</span>
             </button>

             <button 
               onClick={() => handleAction('schedule')}
               disabled={!isFormValid}
               className="flex items-center gap-2 px-4 py-2 text-solar-700 bg-solar-100 hover:bg-solar-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <Calendar className="w-4 h-4" />
               <span className="hidden sm:inline">Schedule</span>
             </button>

             <button 
               onClick={() => handleAction('publish')}
               disabled={!isFormValid}
               className="flex items-center gap-2 px-6 py-2 text-white bg-solar-600 hover:bg-solar-700 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <Send className="w-4 h-4" />
               Publish Now
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditor;
