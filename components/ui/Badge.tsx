import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  size = 'md'
}) => {
  const variants = {
    brand: "bg-brand-100 text-brand-700 border-brand-200",
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-orange-100 text-orange-700 border-orange-200",
    danger: "bg-red-100 text-red-700 border-red-200",
    neutral: "bg-gray-100 text-gray-700 border-gray-200",
    outline: "bg-transparent text-gray-500 border-gray-200"
  };

  const sizes = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2.5 py-1"
  };

  return (
    <span className={`
      inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-full border 
      ${variants[variant]} 
      ${sizes[size]} 
      ${className}
    `}>
      {children}
    </span>
  );
};