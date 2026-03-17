import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  fluid?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  centered?: boolean;
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  fluid = false, 
  size = 'xl',
  centered = true,
  className = '',
  ...props 
}) => {
  const sizes = {
    sm: "max-w-3xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    "2xl": "max-w-screen-2xl",
  };

  return (
    <div 
      className={`
        w-full px-4 sm:px-6 lg:px-8
        ${!fluid ? sizes[size] : ''}
        ${centered ? 'mx-auto' : ''}
        ${className}
      `} 
      {...props}
    >
      {children}
    </div>
  );
};