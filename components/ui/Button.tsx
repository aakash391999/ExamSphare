import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 shadow-md shadow-brand-200 border border-transparent",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-gray-200 shadow-sm",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md shadow-green-200",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    outline: "bg-transparent border-2 border-brand-600 text-brand-600 hover:bg-brand-50"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`mr-2 ${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}`} />}
      {children}
    </button>
  );
};