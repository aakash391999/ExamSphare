import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  variant?: 'default' | 'glass' | 'flat' | 'gradient';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'p-6',
  onClick,
  hoverEffect = false,
  variant = 'default'
}) => {
  const baseStyles = "rounded-[2.5rem] transition-all duration-500 overflow-hidden";

  const variants = {
    default: "glass-card",
    flat: "bg-theme-bg/50 border border-theme-border",
    glass: "glass-card backdrop-blur-xl",
    gradient: "glass-card bg-gradient-to-br from-theme-card to-theme-bg/30"
  };

  const hoverStyles = hoverEffect ? "hover:scale-[1.02] shadow-2xl" : "";

  return (
    <div
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${hoverStyles}
        ${padding} 
        ${onClick ? 'cursor-pointer active:scale-95' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};