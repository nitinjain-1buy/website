import React, { useState, useEffect } from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const TypewriterText = ({
  text,
  speed = 50,
  delay = 0,
  className = '',
  cursorClassName = '',
  showCursor = true,
  onComplete = () => {}
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.3 });

  useEffect(() => {
    if (!isVisible || isTyping || isComplete) return;

    const startTyping = () => {
      setIsTyping(true);
      let currentIndex = 0;

      const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          setIsComplete(true);
          onComplete();
        }
      }, speed);

      return () => clearInterval(typeInterval);
    };

    const timeoutId = setTimeout(startTyping, delay);
    return () => clearTimeout(timeoutId);
  }, [isVisible, text, speed, delay, isTyping, isComplete, onComplete]);

  return (
    <span ref={ref} className={className}>
      {displayText}
      {showCursor && !isComplete && (
        <span 
          className={`inline-block w-[3px] h-[1em] bg-emerald-500 ml-1 animate-blink ${cursorClassName}`}
        />
      )}
      {/* Invisible text to reserve space */}
      <span className="invisible absolute">{text}</span>
    </span>
  );
};

export default TypewriterText;
