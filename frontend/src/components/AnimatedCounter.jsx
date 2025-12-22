import React, { useState, useEffect, useRef } from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const AnimatedCounter = ({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  className = ''
}) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.3 });
  const hasAnimated = useRef(false);

  // Parse the end value - handle strings like "15-20%", "25M+", "400+"
  const parseValue = (val) => {
    if (typeof val === 'number') return val;
    const str = String(val);
    // Handle range like "15-20%"
    if (str.includes('-')) {
      const parts = str.split('-');
      return parseInt(parts[1]) || parseInt(parts[0]) || 0;
    }
    // Extract numeric part
    const match = str.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const getDisplayValue = (currentCount) => {
    const str = String(end);
    // Handle range like "15-20%"
    if (str.includes('-')) {
      const parts = str.split('-');
      const firstNum = parseInt(parts[0]) || 0;
      const secondNum = parseInt(parts[1]) || 0;
      const suffix = str.replace(/[\d\-]/g, '');
      const progress = currentCount / secondNum;
      const currentFirst = Math.round(firstNum * progress);
      const currentSecond = Math.round(currentCount);
      return `${currentFirst}-${currentSecond}${suffix}`;
    }
    // Handle M+ suffix
    if (str.includes('M')) {
      return `${Math.round(currentCount)}M+`;
    }
    // Handle + suffix
    if (str.includes('+')) {
      return `${Math.round(currentCount)}+`;
    }
    // Handle % suffix
    if (str.includes('%')) {
      return `${Math.round(currentCount)}%`;
    }
    return `${prefix}${Math.round(currentCount)}${suffix}`;
  };

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;

    const endValue = parseValue(end);
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = endValue * easeOutQuart;
      
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref} className={className}>
      {getDisplayValue(count)}
    </span>
  );
};

export default AnimatedCounter;
