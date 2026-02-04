import React from 'react';
import Image from 'next/image';

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
    sm: "h-8 w-8 text-caption",
    md: "h-10 w-10 text-body-small",
    lg: "h-14 w-14 text-body",
    xl: "h-20 w-20 text-body-large",
  };

  return (
    <div className={`relative inline-flex shrink-0 overflow-hidden rounded-full border border-border/10 ${sizes[size]} ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="80px"
          className="object-cover"
          unoptimized
        />
      ) : null}
      
      <div className={`
        ${src ? 'hidden' : 'flex'} h-full w-full items-center justify-center bg-accent/10 text-accent text-label uppercase tracking-wider`}>
        {fallback.slice(0, 2)}
      </div>
    </div>
  );
};