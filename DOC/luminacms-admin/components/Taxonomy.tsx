
import React, { useState } from 'react';
import { Category, Tag } from '../types';
import { MOCK_CATEGORIES, MOCK_TAGS } from '../constants';

const Taxonomy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [tags, setTags] = useState<Tag[]>(MOCK_TAGS);
  
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    
    const slug = newSlug || newName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      slug,
      count: 0
    };

    if (activeTab === 'categories') {
      setCategories([newItem, ...categories]);
    } else {
      setTags([newItem, ...tags]);
    }

    setNewName('');
    setNewSlug('');
  };

  const handleDelete = (id: string) => {
    if (activeTab === 'categories') {
      setCategories(categories.filter(c => c.id !== id));
    } else {
      setTags(tags.filter(t => t.id !== id));
    }
  };

  const items = activeTab === 'categories' ? categories : tags;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Add New {activeTab === 'categories' ? 'Category' : 'Tag'}</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={`e.g. ${activeTab === 'categories' ? 'Technology' : 'React'}`}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Slug (Optional)</label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="url-friendly-name"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
            >
              Add New
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'categories' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'tags' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Tags
            </button>
          </div>

          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Posts</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{item.slug}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{item.count}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                       Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Taxonomy;
