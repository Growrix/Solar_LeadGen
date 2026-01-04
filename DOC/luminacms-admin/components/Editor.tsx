
import React, { useState, useEffect } from 'react';
import { BlogPost, PostStatus } from '../types';
import { geminiService } from '../services/geminiService';

interface EditorProps {
  post: Partial<BlogPost> | null;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}

type TabType = 'general' | 'seo' | 'ai';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Editor: React.FC<EditorProps> = ({ post, onSave, onCancel }) => {
  // Parsing existing date if available
  const existingDate = post?.publishDate ? new Date(post.publishDate) : new Date();
  
  // General State
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [content, setContent] = useState(post?.content || '');
  const [status, setStatus] = useState<PostStatus>(post?.status || 'draft');
  const [category, setCategory] = useState(post?.category || 'General');
  
  // WordPress Style Date/Time State Parts
  const [month, setMonth] = useState(existingDate.getMonth());
  const [day, setDay] = useState(existingDate.getDate().toString());
  const [year, setYear] = useState(existingDate.getFullYear().toString());
  const [hour, setHour] = useState(existingDate.getHours().toString().padStart(2, '0'));
  const [minute, setMinute] = useState(existingDate.getMinutes().toString().padStart(2, '0'));
  
  // SEO State
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || '');
  const [keywords, setKeywords] = useState<string[]>(post?.keywords || []);
  
  // UI State
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (!post?.slug && title && !slug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  }, [title]);

  const handleAiGenerate = async () => {
    if (!title) return alert('Enter a title first');
    setIsGenerating(true);
    try {
      const draft = await geminiService.generateDraft(title);
      setContent((prev) => prev + "\n\n" + draft);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestSeo = async () => {
    if (!content) return alert('Enter some content first');
    setIsGenerating(true);
    try {
      const suggested = await geminiService.suggestSEO(content);
      setKeywords(Array.from(new Set([...keywords, ...suggested])));
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMetaDesc = async () => {
    if (!content) return alert('Add some content first');
    setIsGenerating(true);
    try {
      const desc = await geminiService.generateMetaDescription(title, content);
      setMetaDescription(desc);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const addKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newKeyword.trim()) {
      e.preventDefault();
      if (!keywords.includes(newKeyword.trim())) {
        setKeywords([...keywords, newKeyword.trim()]);
      }
      setNewKeyword('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const handleSubmit = (e: React.FormEvent, targetStatus?: PostStatus) => {
    e.preventDefault();
    const finalStatus = targetStatus || status;
    
    // Construct final ISO-like string for storage
    const dateObj = new Date(parseInt(year), month, parseInt(day), parseInt(hour), parseInt(minute));
    const finalPublishDate = dateObj.toISOString().split('T')[0] + ' ' + hour + ':' + minute;

    onSave({
      id: post?.id || Date.now().toString(),
      title,
      slug,
      content,
      status: finalStatus,
      category,
      tags: keywords,
      excerpt: content.substring(0, 150) + '...',
      author: post?.author || 'Admin',
      publishDate: finalPublishDate,
      coverImage: post?.coverImage || `https://picsum.photos/seed/${Date.now()}/800/400`,
      views: post?.views || 0,
      metaTitle: metaTitle || title,
      metaDescription,
      keywords,
    });
  };

  const charCountColor = (count: number, min: number, max: number) => {
    if (count === 0) return 'text-gray-400';
    if (count >= min && count <= max) return 'text-green-500 font-bold';
    return 'text-orange-500 font-bold';
  };

  const getFormattedScheduleString = () => {
    return `${MONTHS[month]} ${day.padStart(2, '0')}, ${year} @ ${hour}:${minute}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 relative pb-24">
      {/* Main Workspace */}
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 space-y-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post Title..."
              className="w-full px-0 py-2 text-4xl font-black border-none focus:ring-0 focus:outline-none placeholder-gray-200 text-gray-900"
            />
            
            <div className="flex items-center text-sm text-gray-400 font-mono">
              <span className="mr-2 text-gray-300 select-none font-sans">Permalink:</span>
              <span className="mr-1">lumina.cms/blog/</span>
              <input 
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="bg-gray-50 border-none px-2 py-0.5 rounded focus:ring-1 focus:ring-indigo-500 outline-none hover:bg-gray-100 transition-colors" 
              />
            </div>

            <div className="border-t border-gray-100 pt-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                placeholder="Write your story here..."
                className="w-full px-0 py-2 border-none focus:ring-0 focus:outline-none resize-none min-h-[500px] leading-relaxed text-lg text-gray-700 font-serif"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Properties */}
      <div className="w-full lg:w-96 space-y-6">
        {/* Publish Meta-box (Wordpress Style) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Publishing Controls</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
              status === 'published' ? 'bg-green-100 text-green-700' : 
              status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'
            }`}>
              {status}
            </span>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Status Section */}
            <div className="flex items-start space-x-2 text-[13px] text-gray-600">
               <svg className="h-4 w-4 mt-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <div className="flex-1">
                  Status: <span className="font-bold text-gray-900 capitalize">{status}</span>
                  <button 
                    onClick={() => setIsEditingStatus(!isEditingStatus)}
                    className="ml-2 text-indigo-600 hover:text-indigo-800 underline decoration-indigo-200"
                  >
                    Edit
                  </button>
                  {isEditingStatus && (
                    <div className="mt-2 flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                      <select 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value as PostStatus)}
                        className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                      <button 
                        onClick={() => setIsEditingStatus(false)}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200 font-bold"
                      >
                        OK
                      </button>
                    </div>
                  )}
               </div>
            </div>

            {/* Visibility Section (WP-like placeholder) */}
            <div className="flex items-start space-x-2 text-[13px] text-gray-600">
               <svg className="h-4 w-4 mt-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
               </svg>
               <div className="flex-1">
                  Visibility: <span className="font-bold text-gray-900">Public</span>
                  <button className="ml-2 text-indigo-600 hover:text-indigo-800 underline decoration-indigo-200">Edit</button>
               </div>
            </div>

            {/* Scheduler Section (Wordpress-Style) */}
            <div className="flex items-start space-x-2 text-[13px] text-gray-600">
               <svg className="h-4 w-4 mt-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
               <div className="flex-1">
                  Publish: <span className="font-bold text-gray-900">
                    {status === 'scheduled' ? getFormattedScheduleString() : 'immediately'}
                  </span>
                  <button 
                    onClick={() => setIsEditingSchedule(!isEditingSchedule)}
                    className="ml-2 text-indigo-600 hover:text-indigo-800 underline decoration-indigo-200"
                  >
                    Edit
                  </button>

                  {isEditingSchedule && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-4 gap-1 items-center mb-3">
                        {/* Month */}
                        <div className="col-span-2">
                          <select 
                            value={month}
                            onChange={(e) => {
                              setMonth(parseInt(e.target.value));
                              setStatus('scheduled');
                            }}
                            className="w-full px-1 py-1 bg-white border border-gray-300 rounded text-[11px] focus:ring-1 focus:ring-indigo-500 outline-none"
                          >
                            {MONTHS.map((m, i) => (
                              <option key={m} value={i}>{m}</option>
                            ))}
                          </select>
                        </div>
                        {/* Day */}
                        <div className="col-span-1">
                          <input 
                            type="text" 
                            maxLength={2}
                            value={day}
                            onChange={(e) => {
                              setDay(e.target.value.replace(/\D/g, ''));
                              setStatus('scheduled');
                            }}
                            className="w-full px-1 py-1 bg-white border border-gray-300 rounded text-[11px] text-center focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="DD"
                          />
                        </div>
                        {/* Year */}
                        <div className="col-span-1">
                          <input 
                            type="text" 
                            maxLength={4}
                            value={year}
                            onChange={(e) => {
                              setYear(e.target.value.replace(/\D/g, ''));
                              setStatus('scheduled');
                            }}
                            className="w-full px-1 py-1 bg-white border border-gray-300 rounded text-[11px] text-center focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="YYYY"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 mb-4">
                        <span className="text-[11px] text-gray-400">at</span>
                        <input 
                          type="text" 
                          maxLength={2}
                          value={hour}
                          onChange={(e) => setHour(e.target.value.replace(/\D/g, ''))}
                          className="w-10 px-1 py-1 bg-white border border-gray-300 rounded text-[11px] text-center focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                        <span className="text-[11px] text-gray-400">:</span>
                        <input 
                          type="text" 
                          maxLength={2}
                          value={minute}
                          onChange={(e) => setMinute(e.target.value.replace(/\D/g, ''))}
                          className="w-10 px-1 py-1 bg-white border border-gray-300 rounded text-[11px] text-center focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsEditingSchedule(false)}
                          className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded text-[11px] font-bold hover:bg-gray-50 shadow-sm"
                        >
                          OK
                        </button>
                        <button 
                          onClick={() => setIsEditingSchedule(false)}
                          className="px-3 py-1 text-indigo-600 text-[11px] font-bold hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
               </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <button className="text-[11px] text-red-600 font-bold hover:underline">Move to Trash</button>
            <button 
              onClick={(e) => handleSubmit(e, status === 'scheduled' ? 'scheduled' : 'published')}
              className={`px-4 py-1.5 text-white text-[11px] font-bold rounded shadow-sm transition-all active:scale-95 ${
                status === 'scheduled' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {status === 'scheduled' ? 'Schedule' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Tabbed Sidebars */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-8">
          <div className="flex border-b border-gray-100">
            {(['general', 'seo', 'ai'] as TabType[]).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  activeTab === t ? 'text-indigo-600 bg-indigo-50/50 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-6 max-h-[calc(100vh-500px)] overflow-y-auto scrollbar-hide">
            {activeTab === 'general' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Author</label>
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <img src="https://picsum.photos/32/32?seed=admin" className="h-8 w-8 rounded-full mr-3" alt="" />
                    <span className="text-sm font-medium text-gray-700">Admin User</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Google Preview */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase">Search Preview</p>
                  <div className="space-y-1">
                    <p className="text-blue-700 text-lg hover:underline cursor-pointer truncate font-medium">
                      {metaTitle || title || 'Post Title'}
                    </p>
                    <p className="text-green-700 text-xs truncate">
                      lumina.cms › blog › {slug || 'your-slug'}
                    </p>
                    <p className="text-gray-600 text-xs line-clamp-2">
                      {metaDescription || 'Add a meta description to see how it appears in search results.'}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Meta Title</label>
                    <span className={`text-[10px] ${charCountColor(metaTitle.length, 50, 60)}`}>
                      {metaTitle.length}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Meta Description</label>
                    <span className={`text-[10px] ${charCountColor(metaDescription.length, 120, 155)}`}>
                      {metaDescription.length}/155
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  />
                  <button 
                    onClick={handleGenerateMetaDesc}
                    disabled={isGenerating}
                    className="mt-2 text-[10px] text-indigo-600 font-bold uppercase hover:text-indigo-800 disabled:opacity-50"
                  >
                    {isGenerating ? 'Analyzing...' : 'Generate with AI'}
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Focus Keywords</label>
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={addKeyword}
                    placeholder="Press Enter to add..."
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-3"
                  />
                  <div className="flex flex-wrap gap-2">
                    {keywords.map(kw => (
                      <span key={kw} className="flex items-center px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded group">
                        {kw}
                        <button onClick={() => removeKeyword(kw)} className="ml-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-4 bg-indigo-600 rounded-xl text-white shadow-lg">
                  <h4 className="font-bold flex items-center mb-2">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707z" />
                    </svg>
                    AI Content Copilot
                  </h4>
                  <p className="text-xs text-indigo-100 mb-4">Leverage Gemini to supercharge your content workflow.</p>
                  
                  <div className="space-y-2">
                    <button
                      onClick={handleAiGenerate}
                      disabled={isGenerating}
                      className="w-full py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? 'Brainstorming...' : 'Generate Intro Draft'}
                    </button>
                    <button
                      onClick={handleSuggestSeo}
                      disabled={isGenerating}
                      className="w-full py-2 bg-indigo-500/30 border border-white/20 text-white rounded-lg text-xs font-bold hover:bg-indigo-500/50 transition-colors disabled:opacity-50"
                    >
                      Suggest SEO Keywords
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-gray-200 p-4 z-40 flex items-center justify-between px-8 shadow-2xl">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onCancel}
            className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <div className="h-4 w-px bg-gray-200"></div>
          <span className="text-xs text-gray-400 font-medium italic">Last autosaved at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={(e) => handleSubmit(e, 'draft')}
            className="px-6 py-2 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={(e) => handleSubmit(e, status === 'scheduled' ? 'scheduled' : 'published')}
            className={`px-8 py-2 text-white text-sm font-bold rounded-lg transition-all shadow-lg active:scale-95 ${
               status === 'scheduled' 
               ? 'bg-amber-600 hover:bg-amber-700 hover:shadow-amber-200' 
               : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200'
            }`}
          >
            {status === 'scheduled' ? 'Schedule Post' : 'Publish Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Editor;
