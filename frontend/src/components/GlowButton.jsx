import React from 'react';
import { Button } from './ui/button';

const GlowButton = ({
  children,
  variant = 'default',
  glowColor = 'emerald',
  className = '',
  ...props
}) => {
  const glowColors = {
    emerald: 'hover:shadow-emerald-500/50 focus:shadow-emerald-500/50',
    blue: 'hover:shadow-blue-500/50 focus:shadow-blue-500/50',
    purple: 'hover:shadow-purple-500/50 focus:shadow-purple-500/50',
    slate: 'hover:shadow-slate-500/30 focus:shadow-slate-500/30'
  };

  const glowClass = glowColors[glowColor] || glowColors.emerald;

  return (
    <Button
      variant={variant}
      className={`
        relative overflow-hidden
        transition-all duration-300 ease-out
        hover:scale-105 hover:shadow-lg
        active:scale-[0.98]
        ${glowClass}
        ${className}
      `}
      {...props}
    >
      <span className="relative z-10 flex items-center">
        {children}
      </span>
      {/* Shimmer effect */}
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
    </Button>
  );
};

export default GlowButton;
