
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { ProjectState } from '../types';

interface AIPromptBoxProps {
  project: ProjectState;
  onGenerated: (url: string, prompt: string, thumbnail: string, mediaType: 'video' | 'image') => void;
}

const STYLE_PRESETS = [
  { id: 'cyberpunk', label: 'Neon Cyberpunk', prompt: 'A futuristic neon-drenched cityscape at night with flying vehicles and glowing holograms, cinematic 8k.' },
  { id: 'nature', label: 'Ethereal Forest', prompt: 'A magical ethereal forest with bioluminescent plants and floating spores, morning mist, cinematic drone shot.' },
  { id: 'sci-fi', label: 'Deep Space', prompt: 'A massive starship warping through a colorful nebula, cosmic scale, cinematic lighting.' },
  { id: 'anime', label: 'Lofi Sunset', prompt: 'An aesthetic anime-style sunset over a quiet Japanese neighborhood, vibrant colors, lofi atmosphere.' }
];

const AIPromptBox: React.FC<AIPromptBoxProps> = ({ project, onGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInspiring, setIsInspiring] = useState(false);
  const [mode, setMode] = useState<'video' | 'image'>('video');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSurprise = async () => {
    setIsInspiring(true);
    try {
      const p = await GeminiService.generateRandomPrompt();
      setPrompt(p);
    } finally {
      setIsInspiring(false);
    }
  };

  const handleGenerate = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Check for API key before starting
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
        // Proceeding after triggering dialog
      }

      if (mode === 'video') {
        setStatus("Powering up Veo 3.1...");
        const statusUpdates = [
          setTimeout(() => setStatus("Mapping cinematic coordinates..."), 4000),
          setTimeout(() => setStatus("Synthesizing motion vectors..."), 10000),
          setTimeout(() => setStatus("Enhancing lighting quality..."), 18000),
          setTimeout(() => setStatus("Baking final frames..."), 26000)
        ];

        const url = await GeminiService.generateVideo(finalPrompt);
        if (url) {
          const thumbnail = await GeminiService.generateThumbnail(url);
          onGenerated(url, finalPrompt, thumbnail, 'video');
          setPrompt('');
        }
        statusUpdates.forEach(clearTimeout);
      } else {
        setStatus("Painting AI masterpiece...");
        const imageUrl = await GeminiService.generateImage(finalPrompt);
        if (imageUrl) {
          onGenerated(imageUrl, finalPrompt, imageUrl, 'image');
          setPrompt('');
        }
      }
      setStatus(null);
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || "Generation failed.";
      if (errMsg.includes("entity was not found")) {
        errMsg = "API Key error. Please click 'Select Key' and ensure billing is enabled.";
        if (window.aistudio) window.aistudio.openSelectKey();
      }
      setError(errMsg);
      setStatus(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-5 bg-black/40 border border-white/5 rounded-3xl shadow-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Gen-Studio V3</span>
        </div>
        <button 
          onClick={handleSurprise}
          disabled={isGenerating || isInspiring}
          className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-400 transition-all flex items-center gap-2"
        >
          {isInspiring ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-sparkles"></i>}
          AI Suggest
        </button>
      </div>

      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
        <button 
          onClick={() => setMode('video')}
          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'video' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Video Mode
        </button>
        <button 
          onClick={() => setMode('image')}
          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'image' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Asset Mode
        </button>
      </div>
      
      <div className="space-y-3">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Quick Styles (Instant Gen)</label>
        <div className="grid grid-cols-2 gap-2">
          {STYLE_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => { setPrompt(preset.prompt); handleGenerate(preset.prompt); }}
              disabled={isGenerating}
              className="px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-bold text-slate-400 hover:border-indigo-500/50 hover:text-indigo-300 transition-all text-left truncate"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative group">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={mode === 'video' ? "Describe your vision in detail..." : "Create a cinematic background..."}
          className="w-full h-32 bg-slate-900/50 border border-white/10 rounded-2xl p-5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none placeholder:text-slate-700 transition-all font-medium custom-scrollbar"
          disabled={isGenerating}
        />
        {isGenerating && (
          <div className="absolute inset-0 bg-black/90 rounded-2xl flex flex-col items-center justify-center gap-5 backdrop-blur-xl z-20 border border-indigo-500/20">
             <div className="relative">
               <div className="w-16 h-16 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-microchip text-indigo-400 text-sm animate-pulse"></i>
               </div>
             </div>
             <div className="text-center px-8">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] block mb-2">Rendering Masterpiece</span>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest opacity-80 animate-pulse">{status}</span>
             </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <i className="fas fa-circle-exclamation text-red-500 text-xs"></i>
            <p className="text-[10px] text-red-400 font-black uppercase tracking-tight">System Error</p>
          </div>
          <p className="text-[10px] text-red-400/80 leading-relaxed font-bold uppercase">{error}</p>
          {error.includes("API Key") && (
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[9px] text-indigo-400 underline uppercase font-black">Open Billing Docs</a>
          )}
        </div>
      )}

      <button
        onClick={() => handleGenerate()}
        disabled={isGenerating || !prompt.trim()}
        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-2xl ${
          isGenerating || !prompt.trim() 
            ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
            : 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-95'
        }`}
      >
        <i className={`fas ${mode === 'video' ? 'fa-clapperboard' : 'fa-wand-magic'} ${isGenerating ? 'animate-spin' : ''}`}></i> 
        {isGenerating ? 'Rendering Engine...' : `Create ${mode === 'video' ? 'Video' : 'Graphic'}`}
      </button>
    </div>
  );
};

export default AIPromptBox;
