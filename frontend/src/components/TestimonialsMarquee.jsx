import React, { useState, useEffect, useRef } from 'react';
import { testimonialsData } from '../data/mock';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const TestimonialsMarquee = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [speed, setSpeed] = useState(4000); // 4 seconds default
  const containerRef = useRef(null);

  const totalTestimonials = testimonialsData.length;

  // Auto-advance testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalTestimonials);
    }, speed);

    return () => clearInterval(interval);
  }, [isAutoPlaying, speed, totalTestimonials]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalTestimonials) % totalTestimonials);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalTestimonials);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const cycleSpeed = () => {
    // Cycle through speeds: 4s -> 2s -> 1s -> 4s
    if (speed === 4000) setSpeed(2000);
    else if (speed === 2000) setSpeed(1000);
    else setSpeed(4000);
  };

  const getSpeedLabel = () => {
    if (speed === 4000) return '1x';
    if (speed === 2000) return '2x';
    return '4x';
  };

  return (
    <section className="py-16 bg-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <p className="text-slate-400 font-medium">
            What customers are saying
          </p>
          
          {/* Speed Control */}
          <button
            onClick={cycleSpeed}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-1 rounded-full border border-slate-700 hover:border-slate-600"
          >
            Speed: {getSpeedLabel()}
          </button>
        </div>

        {/* Testimonials Container */}
        <div className="relative" ref={containerRef}>
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors -ml-2 md:ml-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors -mr-2 md:mr-0"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Testimonials Slider */}
          <div className="overflow-hidden mx-8 md:mx-12">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonialsData.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="max-w-3xl mx-auto">
                    <div className="bg-slate-800 rounded-xl p-8 md:p-10 border border-slate-700">
                      <Quote className="h-10 w-10 text-emerald-500 mb-6" />
                      <p className="text-slate-200 text-lg md:text-xl leading-relaxed mb-8">
                        "{testimonial.quote}"
                      </p>
                      <div className="border-t border-slate-700 pt-6">
                        <p className="font-semibold text-white text-lg">{testimonial.author}</p>
                        <p className="text-emerald-400">{testimonial.company}</p>
                        <p className="text-slate-500 text-sm">{testimonial.industry}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex items-center justify-center mt-8 gap-2">
          {testimonialsData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-3 bg-emerald-500'
                  : 'w-3 h-3 bg-slate-600 hover:bg-slate-500'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mt-4">
          <span className="text-slate-500 text-sm">
            {currentIndex + 1} / {totalTestimonials}
          </span>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsMarquee;
