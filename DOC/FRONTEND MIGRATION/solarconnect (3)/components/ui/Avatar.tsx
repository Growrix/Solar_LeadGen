import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = '', 
  fallback, 
  size = 'md', 
  className = '' 
}) => {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-xl",
  };

  return (
    <div className={`relative inline-flex shrink-0 overflow-hidden rounded-full border border-white/10 ${sizes[size]} ${className}`}>
      {src ? (
        <img 
            src={src} 
            alt={alt} 
            className="h-full w-full object-cover" 
            onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
        />
      ) : null}
      
      <div className={`
        ${src ? 'hidden' : 'flex'} 
        h-full w-full items-center justify-center bg-brand-500/10 text-brand-400 font-bold uppercase tracking-wider
      `}>
        {fallback.slice(0, 2)}
      </div>
    </div>
  );
};