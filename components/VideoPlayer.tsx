
import React, { useRef, useEffect } from 'react';
import { ProjectState } from '../types';

interface VideoPlayerProps {
  project: ProjectState;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onPlayToggle: (playing: boolean) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ project, currentTime, onTimeUpdate, onPlayToggle }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentClip = project.clips.find(clip => 
    currentTime >= clip.startTime && currentTime < (clip.startTime + clip.duration)
  );

  // Sync Play/Pause
  useEffect(() => {
    if (videoRef.current) {
      if (project.isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [project.isPlaying, currentClip?.id]);

  // Sync Time with strict precision
  useEffect(() => {
    if (videoRef.current && currentClip && currentClip.mediaType === 'video') {
      const clipLocalTime = currentTime - currentClip.startTime;
      if (Math.abs(videoRef.current.currentTime - clipLocalTime) > 0.15) {
        videoRef.current.currentTime = clipLocalTime;
      }
    }
  }, [currentTime, currentClip]);

  // Unified Frame Request Loop
  useEffect(() => {
    let animationFrame: number;
    let lastTick = performance.now();

    const frame = (now: number) => {
      if (project.isPlaying) {
        const delta = (now - lastTick) / 1000;
        const nextTime = currentTime + delta;
        onTimeUpdate(nextTime);
      }
      lastTick = now;
      animationFrame = requestAnimationFrame(frame);
    };

    animationFrame = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animationFrame);
  }, [project.isPlaying, currentTime, onTimeUpdate]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlayToggle(!project.isPlaying);
  };

  const renderCurrentMedia = () => {
    if (!currentClip) return null;

    const filters = [
      `brightness(${currentClip.brightness}%)`,
      `contrast(${currentClip.contrast}%)`,
      `blur(${currentClip.blur}px)`,
      currentClip.filter === 'Noir' ? 'grayscale(1)' : '',
    ].filter(Boolean).join(' ');

    const mediaClass = `w-full h-full object-cover transition-all duration-300 ${currentClip.isShake ? 'effect-shake' : ''}`;

    if (currentClip.mediaType === 'image') {
      return (
        <img 
          src={currentClip.url} 
          className={mediaClass} 
          style={{ filter: filters }}
          alt="Preview"
        />
      );
    }

    return (
      <video
        ref={videoRef}
        src={currentClip.url}
        className={mediaClass}
        muted
        playsInline
        style={{ filter: filters }}
      />
    );
  };

  return (
    <div className="relative group w-full aspect-video bg-black rounded-[40px] overflow-hidden shadow-[0_60px_100px_-20px_rgba(0,0,0,1)] border border-white/5 ring-1 ring-white/10 group">
      {currentClip ? (
        <>
          {renderCurrentMedia()}
          
          {/* Overlays */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {project.textOverlays.map(text => (
              currentTime >= text.startTime && currentTime < (text.startTime + text.duration) && (
                <div key={text.id} className="animate-in fade-in zoom-in duration-500 px-10 text-center">
                  <span className={`
                    text-7xl font-black drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] uppercase tracking-tighter block
                    ${text.style === 'neon' ? 'text-indigo-400 drop-shadow-[0_0_20px_rgba(99,102,241,1)]' : 'text-white'}
                    ${text.style === 'impact' ? 'italic italic-black text-8xl scale-y-110' : ''}
                    ${text.style === 'glitch' ? 'animate-pulse skew-x-12' : ''}
                  `} style={{ color: text.color }}>
                    {text.content}
                  </span>
                </div>
              )
            ))}
          </div>

          {/* Interactive Layer */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer" onClick={togglePlay}>
            <div className="w-24 h-24 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full flex items-center justify-center text-white text-4xl hover:scale-110 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]">
              <i className={`fas ${project.isPlaying ? 'fa-pause' : 'fa-play'} ${!project.isPlaying && 'ml-2'}`}></i>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="absolute bottom-10 left-10 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-400">
              {currentClip.mediaType === 'video' ? 'Pro-Motion' : 'Still Asset'}
            </div>
            {currentClip.isShake && (
              <div className="px-4 py-2 bg-amber-500/20 backdrop-blur-xl border border-amber-500/40 rounded-2xl text-[10px] font-black uppercase tracking-widest text-amber-500 animate-pulse">
                Shake Active
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-800 gap-8 bg-[#030303]">
          <div className="relative">
            <i className="fas fa-clapperboard text-9xl opacity-5"></i>
            <div className="absolute inset-0 flex items-center justify-center">
               <i className="fas fa-plus text-2xl text-indigo-600/20"></i>
            </div>
          </div>
          <div className="text-center px-12">
            <p className="text-xl font-black text-slate-500 uppercase tracking-[0.4em]">Empty Studio</p>
            <p className="text-[10px] font-bold text-slate-700 mt-4 uppercase tracking-widest leading-relaxed">
              Use the AI Tab or Quick Styles to generate <br/> your first cinematic clip
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
