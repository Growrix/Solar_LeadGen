
import React, { useState, useMemo } from 'react';
import { BlogPost, PostStatus } from '../types';

interface PostListProps {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onCreateNew: () => void;
}

const PostList: React.FC<PostListProps> = ({ posts, onEdit, onCreateNew }) => {
  const [filter, setFilter] = useState<PostStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  // Filter logic
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesStatus = filter === 'all' || post.status === filter;
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [posts, filter, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredPosts.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedPosts(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const counts = {
    all: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-light text-gray-800">Posts</h1>
          <button
            onClick={onCreateNew}
            className="px-3 py-1 border border-indigo-600 text-indigo-600 text-sm font-semibold rounded hover:bg-indigo-50 transition-colors"
          >
            Add New
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search Posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-3 pr-10 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none w-64 shadow-sm"
          />
        </div>
      </div>

      {/* Status Filter Subsubsub (WP naming) */}
      <ul className="flex items-center space-x-2 text-sm text-gray-600">
        <li>
          <button 
            onClick={() => setFilter('all')}
            className={`${filter === 'all' ? 'font-bold text-gray-900' : 'text-indigo-600 hover:text-indigo-800'}`}
          >
            All <span className="text-gray-400 font-normal">({counts.all})</span>
          </button>
        </li>
        <span className="text-gray-300">|</span>
        <li>
          <button 
            onClick={() => setFilter('published')}
            className={`${filter === 'published' ? 'font-bold text-gray-900' : 'text-indigo-600 hover:text-indigo-800'}`}
          >
            Published <span className="text-gray-400 font-normal">({counts.published})</span>
          </button>
        </li>
        <span className="text-gray-300">|</span>
        <li>
          <button 
            onClick={() => setFilter('draft')}
            className={`${filter === 'draft' ? 'font-bold text-gray-900' : 'text-indigo-600 hover:text-indigo-800'}`}
          >
            Drafts <span className="text-gray-400 font-normal">({counts.draft})</span>
          </button>
        </li>
      </ul>

      {/* Bulk Actions & Table Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select className="bg-white border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm">
          <option>Bulk Actions</option>
          <option>Edit</option>
          <option>Move to Trash</option>
        </select>
        <button className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm">
          Apply
        </button>

        <select className="bg-white border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm ml-2">
          <option>All Dates</option>
          <option>October 2024</option>
          <option>September 2024</option>
        </select>
        <select className="bg-white border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm">
          <option>All Categories</option>
          <option>Technology</option>
          <option>Design</option>
        </select>
        <button className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm">
          Filter
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-300 text-[13px] font-bold text-gray-700">
              <th className="px-4 py-3 w-10">
                <input 
                  type="checkbox" 
                  checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                />
              </th>
              <th className="px-4 py-3 min-w-[300px]">Title</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Categories</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3 text-center">
                <svg className="h-4 w-4 mx-auto text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPosts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50 group">
                <td className="px-4 py-4 align-top">
                  <input 
                    type="checkbox" 
                    checked={selectedPosts.includes(post.id)}
                    onChange={() => toggleSelect(post.id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="space-y-1">
                    <button 
                      onClick={() => onEdit(post)}
                      className="text-[14px] font-bold text-indigo-700 hover:text-indigo-900 block"
                    >
                      {post.title} {post.status === 'draft' && <span className="text-gray-400 font-normal">— Draft</span>}
                    </button>
                    
                    {/* Row Actions - Visible on Hover */}
                    <div className="flex items-center space-x-2 text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(post)} className="text-indigo-600 hover:text-indigo-800">Edit</button>
                      <span className="text-gray-300">|</span>
                      <button className="text-indigo-600 hover:text-indigo-800">Quick Edit</button>
                      <span className="text-gray-300">|</span>
                      <button className="text-red-600 hover:text-red-800">Trash</button>
                      <span className="text-gray-300">|</span>
                      <button className="text-indigo-600 hover:text-indigo-800">View</button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 align-top text-[13px] text-indigo-600 hover:underline cursor-pointer">
                  {post.author}
                </td>
                <td className="px-4 py-4 align-top text-[13px] text-indigo-600 hover:underline cursor-pointer">
                  {post.category}
                </td>
                <td className="px-4 py-4 align-top text-[13px] text-gray-500">
                  {post.tags.length > 0 ? post.tags.join(', ') : '—'}
                </td>
                <td className="px-4 py-4 align-top text-center text-[13px]">
                   <span className="bg-indigo-600 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
                     {Math.floor(Math.random() * 5)}
                   </span>
                </td>
                <td className="px-4 py-4 align-top text-[13px] text-gray-500">
                  <div className="font-medium text-gray-900">
                    {post.status === 'published' ? 'Published' : 'Last Modified'}
                  </div>
                  {post.publishDate}
                </td>
              </tr>
            ))}
            {filteredPosts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                  No posts found.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-white border-t border-gray-300 text-[13px] font-bold text-gray-700">
            <tr>
              <th className="px-4 py-3 w-10">
                <input 
                  type="checkbox" 
                  checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                />
              </th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Categories</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3 text-center">
                <svg className="h-4 w-4 mx-auto text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 px-1">
        <div>{selectedPosts.length} items selected</div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <span>{filteredPosts.length} items</span>
          <div className="flex border border-gray-300 rounded overflow-hidden">
            <button className="px-2 py-1 bg-white hover:bg-gray-50 border-r border-gray-300 text-gray-400 cursor-not-allowed">«</button>
            <button className="px-2 py-1 bg-white hover:bg-gray-50 border-r border-gray-300 text-gray-400 cursor-not-allowed">‹</button>
            <div className="px-3 py-1 bg-white border-r border-gray-300 flex items-center">
              <input type="text" value="1" readOnly className="w-6 text-center focus:outline-none" />
              <span className="mx-1">of 1</span>
            </div>
            <button className="px-2 py-1 bg-white hover:bg-gray-50 border-r border-gray-300 text-gray-400 cursor-not-allowed">›</button>
            <button className="px-2 py-1 bg-white hover:bg-gray-50 text-gray-400 cursor-not-allowed">»</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostList;
