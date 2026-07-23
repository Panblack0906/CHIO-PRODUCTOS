import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, AlertCircle, Sparkles, Volume2, VolumeX } from 'lucide-react';

export interface StoryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title?: string;
  subtitle?: string;
}

interface StoryPlayerProps {
  stories: StoryItem[];
  autoplaySpeed?: number; // duration in ms, default 5000
}

export function StoryPlayer({ stories = [], autoplaySpeed = 6000 }: StoryPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressIntervalRef = useRef<any>(null);

  // Safeguard: Adjust currentIndex if it's out of bounds of the stories list
  useEffect(() => {
    if (stories.length > 0 && currentIndex >= stories.length) {
      setCurrentIndex(Math.max(0, stories.length - 1));
    }
  }, [stories.length, currentIndex]);

  // Sync HTML5 video play/pause status with isPlaying state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch((err) => console.log('Sync play error:', err));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Sync HTML5 video mute status with isMuted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Restart progress when story index changes
  useEffect(() => {
    setProgress(0);
    const resolvedStory = stories[currentIndex] || stories[0];
    // If it's a video, attempt to play it from scratch
    if (resolvedStory?.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch((err) => console.log('Autoplay play error:', err));
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentIndex, stories]);

  // Handle progress bar animation counting up to 100%
  useEffect(() => {
    if (!isPlaying || stories.length === 0) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const intervalStep = 50; // update speed in ms
    const increment = (intervalStep / autoplaySpeed) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, intervalStep);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, currentIndex, stories, autoplaySpeed]);

  const handleNext = () => {
    if (stories.length <= 1) {
      setProgress(0);
      return;
    }
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  const handlePrev = () => {
    if (stories.length <= 1) {
      setProgress(0);
      return;
    }
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  if (stories.length === 0) {
    // Elegant fallback if no stories exist
    return (
      <div className="h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full bg-gradient-to-tr from-amber-500 via-[#FCC33A] to-amber-100 flex flex-col justify-center items-center p-8 text-center select-none border-l border-amber-100">
        <Sparkles className="w-12 h-12 text-black animate-pulse mb-3" />
        <h3 className="text-xl font-bold text-gray-900 mb-1">CHIO PRODUCTOS</h3>
        <p className="text-sm text-gray-700 max-w-sm">Tus historias y promociones favoritas aparecerán aquí</p>
      </div>
    );
  }

  const currentStory = stories[currentIndex] || stories[0];

  return (
    <div 
      className="relative h-64 sm:h-80 md:h-96 lg:h-full w-full bg-black overflow-hidden group select-none flex flex-col justify-end"
    >
      {/* Top Instagram-Style Progressive Bars */}
      <div className="absolute top-3 left-0 right-0 z-30 px-3 flex gap-1.5">
        {stories.map((story, idx) => {
          let barWidth = '0%';
          if (idx < currentIndex) barWidth = '100%';
          else if (idx === currentIndex) barWidth = `${progress}%`;

          return (
            <div 
              key={story.id} 
              onClick={() => setCurrentIndex(idx)}
              className="h-1 flex-1 bg-white/35 rounded-full overflow-hidden cursor-pointer backdrop-blur-sm"
            >
              <div 
                className="h-full bg-[#FDB913] rounded-full transition-all duration-75 ease-linear"
                style={{ width: barWidth }}
              />
            </div>
          );
        })}
      </div>

      {/* Media Rendering Container */}
      <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center bg-black/95">
        {currentStory.type === 'video' ? (
          <video
            ref={videoRef}
            src={currentStory.url}
            autoPlay
            muted={isMuted}
            playsInline
            loop={stories.length === 1}
            className="w-full h-full object-contain"
            onEnded={() => {
              if (stories.length > 1) handleNext();
            }}
          />
        ) : (
          <img
            src={currentStory.url}
            alt={currentStory.title || "Historia CHIO"}
            className="w-full h-full object-contain object-center animate-fade-in"
          />
        )}
      </div>

      {/* Overlay Ambient Shadow Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/15 z-20 pointer-events-none" />

      {/* Left, Center and Right Tap Zones */}
      <div className="absolute inset-y-0 left-0 w-1/5 z-20 cursor-w-resize" onClick={handlePrev} />
      <div className="absolute inset-y-0 left-1/5 right-1/5 z-20 cursor-pointer" onClick={() => setIsPlaying(!isPlaying)} />
      <div className="absolute inset-y-0 right-0 w-1/5 z-20 cursor-e-resize" onClick={handleNext} />

      {/* Big beautiful play overlay when manually paused */}
      {!isPlaying && (
        <div 
          onClick={() => setIsPlaying(true)}
          className="absolute inset-0 z-25 bg-black/40 flex items-center justify-center cursor-pointer animate-fade-in"
        >
          <div className="p-4 rounded-full bg-black/75 text-white border-2 border-dashed border-[#FDB913]/55 scale-110 sm:scale-120 shadow-2xl flex flex-col items-center justify-center gap-1 min-w-[120px] transition-all">
            <Play className="w-8 h-8 fill-current text-[#FDB913] text-center" />
            <span className="text-[9px] uppercase tracking-widest font-black text-[#FDB913]">Pausado</span>
          </div>
        </div>
      )}

      {/* Buttons Overlay */}
      <div className="absolute top-8 right-3 z-30 flex items-center gap-2">
        {currentStory.type === 'video' && (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
            className={`p-2 rounded-full transition-all duration-300 flex items-center gap-1.5 text-xs font-black uppercase ${
              isMuted 
                ? 'bg-red-600/90 text-white hover:bg-red-500 hover:scale-105' 
                : 'bg-black/60 text-white hover:bg-[#FDB913] hover:text-black hover:scale-105'
            }`}
            title={isMuted ? "Activar audio" : "Silenciar audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 stroke-[2.5]" /> : <Volume2 className="w-4 h-4 stroke-[2.5]" />}
            <span className="text-[8px] tracking-wider hidden sm:inline">
              {isMuted ? "SILENCIADO" : "CON AUDIO"}
            </span>
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
          className={`p-2 rounded-full transition-all duration-200 flex items-center gap-1.5 text-xs font-black uppercase ${
            !isPlaying 
              ? 'bg-[#FDB913] text-black hover:bg-[#e5a60b] hover:scale-105 shadow' 
              : 'bg-black/60 text-white hover:bg-[#FDB913] hover:text-black hover:scale-105'
          }`}
          title={isPlaying ? "Pausar reproducción" : "Reanudar reproducción"}
        >
          {isPlaying ? <Pause className="w-4 h-4 stroke-[2.5]" /> : <Play className="w-4 h-4 stroke-[2.5]" />}
          <span className="text-[8px] tracking-wider hidden sm:inline">
            {isPlaying ? "PAUSAR" : "REPRODUCIR"}
          </span>
        </button>
      </div>

      {/* Content Text Overlay */}
      {(currentStory.title || currentStory.subtitle) && (
        <div className="absolute bottom-4 left-4 right-4 z-25 text-left pointer-events-none drop-shadow-lg">
          {currentStory.title && (
            <h3 className="text-lg sm:text-2xl font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
              <span className="bg-[#FDB913] text-black text-[10px] uppercase font-mono px-2 py-0.5 rounded-md self-center font-bold tracking-widest">
                {currentStory.type === 'video' ? 'VIDEO STORY' : 'ANUNCIO 🌻'}
              </span>
              <span>{currentStory.title}</span>
            </h3>
          )}
          {currentStory.subtitle && (
            <p className="text-xs sm:text-sm text-gray-100 font-medium mt-1 leading-relaxed max-w-md line-clamp-2">
              {currentStory.subtitle}
            </p>
          )}
        </div>
      )}

      {/* Interactive Arrows */}
      <button 
        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/45 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FDB913] hover:text-black scale-90 sm:scale-100 hover:scale-105"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/45 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FDB913] hover:text-black scale-90 sm:scale-100 hover:scale-105"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Page Dots Footer indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-1">
        {stories.map((_, idx) => (
          <div 
            key={idx} 
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-[#FDB913] w-3' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}
