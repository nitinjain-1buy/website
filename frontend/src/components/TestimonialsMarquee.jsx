import React from 'react';
import { testimonialsData } from '../data/mock';
import { Quote } from 'lucide-react';

const TestimonialsMarquee = () => {
  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonialsData, ...testimonialsData];

  return (
    <section className="py-16 bg-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <p className="text-center text-slate-400 font-medium">
          What customers are saying
        </p>
      </div>

      <div className="relative">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-10" />

        {/* Scrolling container */}
        <div className="flex animate-marquee">
          {duplicatedTestimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.id}-${index}`}
              className="flex-shrink-0 w-[400px] mx-4"
            >
              <div className="bg-slate-800 rounded-xl p-6 h-full border border-slate-700 hover:border-emerald-600/50 transition-colors">
                <Quote className="h-8 w-8 text-emerald-500 mb-4" />
                <p className="text-slate-300 mb-6 leading-relaxed text-sm">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-slate-700 pt-4">
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <p className="text-emerald-400 text-sm">{testimonial.company}</p>
                  <p className="text-slate-500 text-xs">{testimonial.industry}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsMarquee;
