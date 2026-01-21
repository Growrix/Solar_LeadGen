
import React from 'react';
import { BlogPost } from '../types';
import { Clock, User } from 'lucide-react';

interface PostCardProps {
  post: BlogPost;
  onClick: (slug: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  const handleClick = () => {
    // Legacy support: Store post data for components that might not fetch via ID
    sessionStorage.setItem('currentBlogPost', JSON.stringify(post));
    onClick(post.slug);
  };

  return (
    <article 
      onClick={handleClick}
      className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer hover:-translate-y-1"
    >
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-200">
        <img 
          src={post.coverImage} 
          alt={post.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide text-white bg-solar-600/90 backdrop-blur-sm rounded-full shadow-sm">
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-solar-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
          {post.excerpt}
        </p>

        {/* Meta Row */}
        <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <img 
              src={post.author.avatar} 
              alt={post.author.name}
              className="w-6 h-6 rounded-full object-cover border border-slate-200" 
            />
            <span className="font-medium text-slate-700">{post.author.name}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>{post.publishedAt}</span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {post.readTime}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
