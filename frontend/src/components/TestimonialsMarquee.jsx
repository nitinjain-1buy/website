import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Quote, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TestimonialsMarquee = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [speed, setSpeed] = useState(5000); // 5 seconds default
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get(`${API}/testimonials?active_only=true`);
        if (response.data.length > 0) {
          setTestimonials(response.data);
        } else {
          // Seed testimonials if none exist
          await axios.post(`${API}/testimonials/seed`);
          const seededResponse = await axios.get(`${API}/testimonials?active_only=true`);
          setTestimonials(seededResponse.data);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const totalTestimonials = testimonials.length;
  // For desktop we show 2 at a time, so calculate total "pages"
  const totalPages = Math.ceil(totalTestimonials / 2);

  // Auto-advance testimonials
  useEffect(() => {
    if (!isAutoPlaying || totalTestimonials === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalTestimonials);
    }, speed);

    return () => clearInterval(interval);
  }, [isAutoPlaying, speed, totalTestimonials]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalTestimonials) % totalTestimonials);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalTestimonials);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const cycleSpeed = () => {
    // Cycle through speeds: 5s -> 3s -> 2s -> 5s
    if (speed === 5000) setSpeed(3000);
    else if (speed === 3000) setSpeed(2000);
    else setSpeed(5000);
  };

  const getSpeedLabel = () => {
    if (speed === 5000) return '1x';
    if (speed === 3000) return '1.5x';
    return '2x';
  };

  // Get current pair of testimonials for display
  const getVisibleTestimonials = () => {
    if (totalTestimonials === 0) return [];
    const first = testimonials[currentIndex];
    const second = testimonials[(currentIndex + 1) % totalTestimonials];
    return [first, second];
  };

  const visibleTestimonials = getVisibleTestimonials();

  if (isLoading) {
    return (
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">Loading testimonials...</p>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-slate-400 font-medium text-lg">
              What customers are saying
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Real feedback from industry leaders
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAutoPlay}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors p-2 rounded-full border border-slate-700 hover:border-slate-600"
              title={isAutoPlaying ? 'Pause' : 'Play'}
            >
              {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={cycleSpeed}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 rounded-full border border-slate-700 hover:border-slate-600"
            >
              Speed: {getSpeedLabel()}
            </button>
          </div>
        </div>

        {/* Testimonials Container */}
        <div className="relative" ref={containerRef}>
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors shadow-lg border border-slate-700 -ml-4 lg:-ml-6"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors shadow-lg border border-slate-700 -mr-4 lg:-mr-6"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Two Testimonials Side by Side */}
          <div className="mx-10 lg:mx-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {visibleTestimonials.map((testimonial, idx) => (
                <div
                  key={`${testimonial.id}-${idx}`}
                  className="transform transition-all duration-500 ease-out"
                  style={{
                    opacity: 1,
                    animation: 'fadeSlideIn 0.5s ease-out'
                  }}
                >
                  <div className="bg-slate-800 rounded-xl p-6 lg:p-8 border border-slate-700 h-full flex flex-col hover:border-slate-600 transition-colors">
                    <Quote className="h-8 w-8 text-emerald-500 mb-4 flex-shrink-0" />
                    <p className="text-slate-200 text-base lg:text-lg leading-relaxed mb-6 flex-grow">
                      "{testimonial.quote}"
                    </p>
                    <div className="border-t border-slate-700 pt-4 mt-auto">
                      <p className="font-semibold text-white">{testimonial.author}</p>
                      <p className="text-emerald-400 text-sm">{testimonial.company}</p>
                      {testimonial.industry && (
                        <p className="text-slate-500 text-xs mt-1">{testimonial.industry}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-sm min-w-[3rem]">
              {currentIndex + 1}/{totalTestimonials}
            </span>
            <div className="flex-grow h-1 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalTestimonials) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex items-center justify-center mt-6 gap-2 flex-wrap">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
                setTimeout(() => setIsAutoPlaying(true), 15000);
              }}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-6 h-2.5 bg-emerald-500'
                  : index === (currentIndex + 1) % totalTestimonials
                  ? 'w-4 h-2.5 bg-emerald-700'
                  : 'w-2.5 h-2.5 bg-slate-600 hover:bg-slate-500'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
};

export default TestimonialsMarquee;
