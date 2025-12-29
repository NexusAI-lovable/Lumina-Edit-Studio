
import React, { useEffect, useRef } from 'react';

interface TutorialModalProps {
  onClose: () => void;
  videoSrc: string;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose, videoSrc }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const steps = [
    {
      title: "1. AI Engine (Veo 3.1)",
      desc: "Use the AI Gen tab to describe your vision. Veo 3.1 synthesizes cinematic 720p footage from your text prompts.",
      icon: "fa-wand-magic-sparkles"
    },
    {
      title: "2. Master the Timeline",
      desc: "Clips are automatically sequenced. Click a clip in the timeline to select it for advanced manipulation.",
      icon: "fa-scissors"
    },
    {
      title: "3. AI Creative Intelligence",
      desc: "In the Inspector, use 'Cinematic Masterclass' to get AI-powered suggestions for color, motion, and pacing.",
      icon: "fa-brain"
    },
    {
      title: "4. Cinematic Overlays",
      desc: "Layer Neon, Glitch, or Impact text and select high-end orchestral scores to finish your edit.",
      icon: "fa-font"
    },
    {
      title: "5. Render & Export",
      desc: "Tap the Render button to stitch your AI assets into a final masterpiece ready for distribution.",
      icon: "fa-clapperboard"
    }
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
      {/* Backdrop with extreme blur */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-3xl cursor-pointer" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-7xl h-[85vh] bg-[#050505] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-[0_0_150px_rgba(99,102,241,0.2)] border border-white/10 flex flex-col md:flex-row group">
        
        {/* Video Side (70%) */}
        <div className="relative flex-1 bg-black border-r border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none"></div>
          
          <video 
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-cover opacity-80"
            autoPlay
            loop
            muted
            playsInline
          />

          <div className="absolute top-10 left-10 z-20 pointer-events-none">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40">
                <i className="fas fa-eye text-2xl"></i>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Lumina Iris</h2>
                <p className="text-xs text-indigo-400 font-black uppercase tracking-[0.4em] opacity-80">Studio Masterclass</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 left-10 right-10 z-20 flex items-end justify-between">
             <div className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] max-w-sm">
                <p className="text-xs text-slate-300 font-medium leading-relaxed uppercase tracking-tight italic">
                  "The future of storytelling isn't just edited—it's generated. Lumina Iris gives you the brush and the AI provides the canvas."
                </p>
             </div>
             <button 
              onClick={() => {
                if(videoRef.current) {
                  videoRef.current.muted = !videoRef.current.muted;
                }
              }}
              className="w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-xl"
             >
                <i className="fas fa-volume-up"></i>
             </button>
          </div>
        </div>

        {/* Instructions Side (30%) */}
        <div className="w-full md:w-[400px] bg-slate-950 p-10 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
           <div className="flex items-center justify-between">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">How to use</h3>
             <button 
              onClick={onClose}
              className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
             >
               <i className="fas fa-times"></i>
             </button>
           </div>

           <div className="flex-1 flex flex-col gap-10">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-6 group/step">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600/5 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover/step:bg-indigo-600 group-hover/step:text-white transition-all duration-500">
                    <i className={`fas ${step.icon} text-sm`}></i>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-black text-white uppercase tracking-wider">{step.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-tight">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
           </div>

           <div className="p-6 bg-indigo-600 rounded-[2rem] text-center shadow-2xl shadow-indigo-600/20 group cursor-pointer hover:scale-[1.02] transition-transform" onClick={onClose}>
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Start Creating Now</span>
           </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.5em] text-slate-600 pointer-events-none opacity-50">
        Cinema UI Protocol v1.4 • Press ESC to exit
      </div>
    </div>
  );
};

export default TutorialModal;
