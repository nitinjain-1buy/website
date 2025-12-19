import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { demoVideoData } from '../data/mock';
import { Play, X } from 'lucide-react';

const DemoVideoModal = ({ variant = 'default', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const buttonStyles = {
    default: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    outline: 'border-slate-300 text-slate-700 hover:bg-slate-50',
    dark: 'bg-white text-slate-900 hover:bg-slate-100'
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant={variant === 'outline' ? 'outline' : 'default'}
          className={`${buttonStyles[variant]} ${className}`}
        >
          <Play className="mr-2 h-5 w-5" />
          Watch Demo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl p-0 bg-black border-slate-800">
        <div className="relative aspect-video w-full">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute -top-12 right-0 text-white hover:text-slate-300 z-50"
          >
            <X className="h-8 w-8" />
          </button>
          <iframe
            src={isOpen ? `${demoVideoData.videoUrl}?autoplay=1` : ''}
            title="1Buy.AI Demo Video"
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hero section with video thumbnail that opens modal
export const DemoVideoSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            {demoVideoData.title}
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {demoVideoData.description}
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <div className="relative max-w-4xl mx-auto cursor-pointer group">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
                <img
                  src={demoVideoData.thumbnailUrl}
                  alt="Demo Video Thumbnail"
                  className="w-full transition-transform duration-300 group-hover:scale-105"
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-10 w-10 text-slate-900 ml-1" />
                  </div>
                </div>
              </div>
              <p className="text-center text-slate-500 mt-4 text-sm">
                Click to watch the demo
              </p>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl p-0 bg-black border-slate-800">
            <div className="relative aspect-video w-full">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-slate-300 z-50"
              >
                <X className="h-8 w-8" />
              </button>
              <iframe
                src={isOpen ? `${demoVideoData.videoUrl}?autoplay=1` : ''}
                title="1Buy.AI Demo Video"
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default DemoVideoModal;
