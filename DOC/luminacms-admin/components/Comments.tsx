
import React, { useState } from 'react';
import { Comment, CommentStatus } from '../types';
import { MOCK_COMMENTS } from '../constants';

const Comments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [filter, setFilter] = useState<CommentStatus | 'all'>('all');

  const filteredComments = filter === 'all' 
    ? comments 
    : comments.filter(c => c.status === filter);

  const handleStatusChange = (id: string, newStatus: CommentStatus) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setComments(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Comments</h2>
          <p className="text-sm text-gray-500 mt-1">Moderate user interactions on your blog posts.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(['all', 'pending', 'approved', 'spam'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                filter === tab 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Comment</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredComments.map((comment) => (
              <tr key={comment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">{comment.author}</div>
                  <div className="text-xs text-gray-500">{comment.email}</div>
                  <div className="text-[10px] text-gray-400 mt-1">on <span className="text-indigo-600 font-medium">{comment.postTitle}</span></div>
                </td>
                <td className="px-6 py-4 max-w-md">
                  <p className="text-sm text-gray-600 line-clamp-2">{comment.content}</p>
                  <div className="text-[10px] text-gray-400 mt-1">{comment.date}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                    comment.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    comment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {comment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    {comment.status !== 'approved' && (
                      <button 
                        onClick={() => handleStatusChange(comment.id, 'approved')}
                        className="text-green-600 hover:text-green-800 font-medium text-xs"
                      >
                        Approve
                      </button>
                    )}
                    {comment.status !== 'spam' && (
                      <button 
                        onClick={() => handleStatusChange(comment.id, 'spam')}
                        className="text-yellow-600 hover:text-yellow-800 font-medium text-xs"
                      >
                        Spam
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredComments.length === 0 && (
          <div className="p-12 text-center text-gray-500 italic">No comments found in this category.</div>
        )}
      </div>
    </div>
  );
};

export default Comments;
