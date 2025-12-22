import React from 'react';
import { Card } from './ui/card';
import useScrollAnimation from '../hooks/useScrollAnimation';

const AnimatedCard = ({
  children,
  delay = 0,
  className = '',
  hoverEffect = 'lift',
  glowOnHover = false,
  ...props
}) => {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });

  const hoverEffects = {
    lift: 'hover:-translate-y-2 hover:shadow-xl',
    scale: 'hover:scale-[1.02] hover:shadow-xl',
    glow: 'hover:shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-300',
    tilt: 'hover:-translate-y-1 hover:rotate-1 hover:shadow-xl',
    none: ''
  };

  return (
    <Card
      ref={ref}
      className={`
        transition-all duration-500 ease-out
        ${isVisible ? 'animate-fade-up opacity-100' : 'opacity-0 translate-y-8'}
        ${hoverEffects[hoverEffect]}
        ${glowOnHover ? 'hover:shadow-emerald-500/10' : ''}
        ${className}
      `}
      style={{
        transitionDelay: `${delay}ms`
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

export default AnimatedCard;
