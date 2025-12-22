import React from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const AnimatedSection = ({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  className = '',
  threshold = 0.1,
  as: Component = 'div',
  ...props
}) => {
  const [ref, isVisible] = useScrollAnimation({ threshold });

  const animationClasses = {
    'fade-up': 'animate-fade-up',
    'fade-down': 'animate-fade-down',
    'fade-left': 'animate-fade-left',
    'fade-right': 'animate-fade-right',
    'zoom-in': 'animate-zoom-in',
    'scale-up': 'animate-scale-up',
    'blur-in': 'animate-blur-in',
    'glow-in': 'animate-glow-in'
  };

  const animClass = animationClasses[animation] || 'animate-fade-up';

  return (
    <Component
      ref={ref}
      className={`${className} ${isVisible ? animClass : 'opacity-0 translate-y-8'}`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`
      }}
      {...props}
    >
      {children}
    </Component>
  );
};

export default AnimatedSection;
