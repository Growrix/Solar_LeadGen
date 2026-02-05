import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ 
  children, 
  className = '', 
  required,
  ...props 
}) => {
  return (
    <label 
      className={`block text-icon mb-1.5 text-body-small ${className}`} 
      {...props}
    >
      {children}
      {required && <span className="text-accent ml-1">*</span>}
    </label>
  );
};