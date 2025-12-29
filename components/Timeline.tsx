
import React, { useRef } from 'react';
import { ProjectState, VideoClip, AudioTrack, TextOverlay } from '../types';

interface TimelineProps {
  project: ProjectState;
  onSelectClip: (id: string) => void;
  onSelectText: (id: string) => void;
  onRemoveClip: (id: string) => void;
  onSeek: (time: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({ project, onSelectClip, onSelectText, onRemoveClip, onSeek }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const totalDuration = Math.max(
    project.clips.reduce((acc, c) => acc + c.duration, 0),
    project.audioTracks.reduce((acc, a) => acc + a.duration, 0),
    project.textOverlays.reduce((acc, t) => acc + t.duration, 0),
    15
  );
  
  const pixelsPerSecond = 40;
  const playheadX = project.currentTime * pixelsPerSecond;

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    const rect = scrollRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollRef.current.scrollLeft;
    const time = x / pixelsPerSecond;
    onSeek(Math.max(0, Math.min(time, totalDuration)));
  };

  return (
    <div className="flex flex-col h-full select-none">
      <div className="h-10 border-b border-slate-800 bg-slate-900/50 flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <button className="text-slate-500 hover:text-white transition-colors"><i className="fas fa-undo text-xs"></i></button>
          <button className="text-slate-500 hover:text-white transition-colors"><i className="fas fa-redo text-xs"></i></button>
          <div className="w-px h-4 bg-slate-800 mx-2"></div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${project.isPlaying ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {project.isPlaying ? 'Playing' : 'Paused'}
            </span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-3 py-0.5 rounded-full border border-indigo-500/20">
          {project.currentTime.toFixed(2)}s / {totalDuration.toFixed(2)}s
        </div>
      </div>

      <div 
        ref={scrollRef}
        onClick={handleTimelineClick}
        className="flex-1 overflow-x-auto overflow-y-hidden relative custom-scrollbar bg-[#0a0a0a]"
      >
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-50 pointer-events-none"
          style={{ left: `${playheadX}px` }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rotate-45" />
        </div>

        <div className="h-6 border-b border-white/5 relative bg-slate-900/20" style={{ width: `${totalDuration * pixelsPerSecond}px` }}>
          {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute h-full border-l border-white/10" 
              style={{ left: `${i * pixelsPerSecond}px` }}
            >
              <span className="absolute top-1 left-1 text-[8px] text-slate-600 font-bold">{i}s</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5 p-4" style={{ width: `${totalDuration * pixelsPerSecond}px` }}>
          {/* Text Layer Track */}
          <div className="h-8 bg-pink-900/10 rounded-lg relative border border-pink-500/10 flex items-center mb-1">
             <div className="absolute left-[-50px] top-1/2 -translate-y-1/2 text-[7px] font-black uppercase tracking-widest text-pink-700 rotate-[-90deg]">Text</div>
             {project.textOverlays.map((text) => (
                <div 
                  key={text.id}
                  onClick={(e) => { e.stopPropagation(); onSelectText(text.id); }}
                  className={`absolute h-6 rounded border flex items-center px-2 gap-2 cursor-pointer transition-all ${
                    project.selectedTextId === text.id ? 'bg-pink-600 border-pink-400 text-white' : 'bg-pink-900/40 border-pink-700/50 text-pink-300'
                  }`}
                  style={{ left: `${text.startTime * pixelsPerSecond}px`, width: `${text.duration * pixelsPerSecond}px` }}
                >
                  <i className="fas fa-font text-[8px]"></i>
                  <span className="text-[8px] font-black truncate uppercase">{text.content}</span>
                </div>
              ))}
          </div>

          {/* Visual Track */}
          <div className="h-20 bg-slate-800/20 rounded-xl relative border border-white/5 flex items-center group">
             <div className="absolute left-[-50px] top-1/2 -translate-y-1/2 text-[7px] font-black uppercase tracking-widest text-slate-600 rotate-[-90deg]">Visuals</div>
             {project.clips.map((clip) => (
                <div 
                  key={clip.id}
                  onClick={(e) => { e.stopPropagation(); onSelectClip(clip.id); }}
                  className={`absolute h-16 rounded-lg border-2 overflow-hidden transition-all duration-200 cursor-pointer ${
                    project.selectedClipId === clip.id ? 'border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/20 scale-[1.02]' : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                  style={{ left: `${clip.startTime * pixelsPerSecond}px`, width: `${clip.duration * pixelsPerSecond}px` }}
                >
                  <img src={clip.thumbnail} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                    <span className="text-[8px] font-black text-white truncate uppercase tracking-tighter">{clip.title}</span>
                  </div>
                </div>
              ))}
          </div>

          {/* Audio Track */}
          <div className="h-10 bg-indigo-900/10 rounded-xl relative border border-indigo-500/10 flex items-center">
             <div className="absolute left-[-50px] top-1/2 -translate-y-1/2 text-[7px] font-black uppercase tracking-widest text-indigo-800 rotate-[-90deg]">Audio</div>
             {project.audioTracks.map((audio) => (
                <div 
                  key={audio.id}
                  className="absolute h-6 bg-indigo-600/30 border border-indigo-500/40 rounded-md flex items-center px-2 gap-2 overflow-hidden"
                  style={{ left: `${audio.startTime * pixelsPerSecond}px`, width: `${audio.duration * pixelsPerSecond}px` }}
                >
                  <i className="fas fa-wave-square text-[7px] text-indigo-400"></i>
                  <span className="text-[7px] font-bold text-indigo-300 truncate uppercase">{audio.title}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
