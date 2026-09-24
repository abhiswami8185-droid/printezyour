import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Film,
  Image as ImageIcon,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { MediaItem } from '../types';
import { api } from '../services/api';
import { getAssetUrl } from '../utils/assets';

interface HomeMediaShowcaseProps {
  onNavigate?: (tab: string, param?: string) => void;
}

export const HomeMediaShowcase: React.FC<HomeMediaShowcaseProps> = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxMuted, setLightboxMuted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch active showcase media from API
  useEffect(() => {
    let isMounted = true;
    const loadMedia = async () => {
      try {
        const items = await api.getMedia({ section: 'home_showcase', activeOnly: true });
        if (isMounted) {
          setMediaList(Array.isArray(items) ? items : []);
        }
      } catch (err) {
        console.error('Failed to load showcase media:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMedia();
    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : mediaList.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex(prev => (prev !== null && prev < mediaList.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, mediaList.length]);

  // Smooth continuous auto-scrolling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || mediaList.length === 0 || isPaused) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    // Scroll speed in pixels per second
    const speed = 35;

    const step = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (!isPaused && container) {
        container.scrollLeft += speed * delta;
        // Check for seamless loop when scrolled halfway (since items are doubled)
        const halfScroll = container.scrollWidth / 2;
        if (container.scrollLeft >= halfScroll) {
          container.scrollLeft -= halfScroll;
        }
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mediaList.length, isPaused]);

  // Manual scroll controls
  const handleManualScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 340;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return null; // Graceful non-blocking initial state
  }

  // If no media is uploaded yet, do not render empty section
  if (mediaList.length === 0) {
    return null;
  }

  // Duplicate items for seamless continuous looping marquee
  const loopList = mediaList.length > 3 ? [...mediaList, ...mediaList] : mediaList;
  const currentLightboxItem = lightboxIndex !== null ? mediaList[lightboxIndex] : null;

  return (
    <section className="py-12 bg-slate-900 text-white relative overflow-hidden border-y border-slate-800">
      {/* Decorative Background Lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Press Operations & Finished Print Reel</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
              Commercial Printing Work in Action
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Authentic high-resolution photography and press floor video reels captured directly from our Chandigarh facility.
            </p>
          </div>

          {/* Navigation Controls & Stats */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
              {mediaList.length} Active Showcases
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleManualScroll('left')}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center border border-slate-700 transition-colors"
                title="Scroll Left"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleManualScroll('right')}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center border border-slate-700 transition-colors"
                title="Scroll Right"
                aria-label="Scroll Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-scrolling Carousel Container */}
      <div
        ref={scrollContainerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar px-4 sm:px-6 scroll-smooth cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loopList.map((item, index) => {
          const originalIndex = index % mediaList.length;
          return (
            <ShowcaseCard
              key={`${item.id}-${index}`}
              item={item}
              onClick={() => setLightboxIndex(originalIndex)}
            />
          );
        })}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {currentLightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {currentLightboxItem.type === 'video' ? 'Press Video Reel' : 'High-Res Photo'}
                </span>
                <span className="text-sm font-bold text-white truncate max-w-md">
                  {currentLightboxItem.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 mr-2">
                  {((lightboxIndex ?? 0) + 1)} / {mediaList.length}
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Close (Esc)"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Media Content */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-hidden">
              {currentLightboxItem.type === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    src={getAssetUrl(currentLightboxItem.url)}
                    autoPlay
                    controls
                    playsInline
                    loop
                    muted={lightboxMuted}
                    className="max-h-[68vh] max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setLightboxMuted(!lightboxMuted)}
                    className="absolute bottom-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-lg border border-slate-700/80 backdrop-blur-md transition-colors"
                    title={lightboxMuted ? 'Unmute' : 'Mute'}
                  >
                    {lightboxMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                </div>
              ) : (
                <img
                  src={getAssetUrl(currentLightboxItem.url)}
                  alt={currentLightboxItem.title}
                  className="max-h-[68vh] max-w-full object-contain"
                />
              )}

              {/* Prev / Next Buttons */}
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : mediaList.length - 1))
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center border border-slate-700 backdrop-blur-md transition-transform hover:scale-105"
                title="Previous"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex(prev => (prev !== null && prev < mediaList.length - 1 ? prev + 1 : 0))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center border border-slate-700 backdrop-blur-md transition-transform hover:scale-105"
                title="Next"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Caption Footer */}
            {currentLightboxItem.caption && (
              <div className="p-4 bg-slate-900 border-t border-slate-800 text-xs text-slate-300">
                <p className="leading-relaxed">{currentLightboxItem.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

// Sub-component for individual card with IntersectionObserver optimized video playback
interface ShowcaseCardProps {
  item: MediaItem;
  onClick: () => void;
}

const ShowcaseCard: React.FC<ShowcaseCardProps> = ({ item, onClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (item.type !== 'video') return;

    const videoEl = videoRef.current;
    if (!videoEl) return;

    // Use IntersectionObserver to only play video when visible in viewport
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            videoEl.play().catch(() => {
              // Browser autoplay policy graceful catch
            });
          } else {
            videoEl.pause();
          }
        });
      },
      { threshold: 0.25 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [item.type]);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className="shrink-0 w-72 sm:w-80 h-96 sm:h-[400px] rounded-2xl overflow-hidden bg-slate-800/90 border border-slate-700/80 shadow-xl relative group cursor-pointer select-none transition-all duration-300 hover:border-cyan-500 hover:shadow-cyan-500/10"
    >
      {/* Media Element */}
      {item.type === 'video' ? (
        <div className="w-full h-full relative bg-slate-950">
          <video
            ref={videoRef}
            src={getAssetUrl(item.url)}
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Video Badge */}
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
            <Film className="w-3 h-3 text-cyan-400" />
            <span>VIDEO REEL</span>
          </div>
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/15 text-white flex items-center justify-center shadow-md">
            <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400 ml-0.5" />
          </div>
        </div>
      ) : (
        <div className="w-full h-full relative bg-slate-950">
          <img
            src={getAssetUrl(item.url)}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          />
          {/* Photo Badge */}
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
            <ImageIcon className="w-3 h-3 text-pink-400" />
            <span>PRINT PHOTO</span>
          </div>
        </div>
      )}

      {/* Hover Overlay Vignette & Info */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-4 transition-opacity">
        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 drop-shadow-sm">
          {item.title}
        </h3>
        {item.caption && (
          <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 leading-snug drop-shadow-sm">
            {item.caption}
          </p>
        )}
        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1 text-cyan-300 font-semibold group-hover:translate-x-0.5 transition-transform">
            <Maximize2 className="w-3 h-3" /> Click to enlarge
          </span>
          <span className="font-mono uppercase text-[9px] text-slate-400">
            {item.type}
          </span>
        </div>
      </div>
    </div>
  );
};
