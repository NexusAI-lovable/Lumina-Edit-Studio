
import React, { useState } from 'react';
import { VideoClip } from '../types';
import { GeminiService } from '../services/geminiService';

interface EditSuggestion {
  title: string;
  description: string;
  category: string;
}

interface AIAnalysis {
  mood: string;
  suggestions: EditSuggestion[];
}

interface PropertiesPanelProps {
  clip: VideoClip;
  onUpdate: (updates: Partial<VideoClip>) => void;
  onClose: () => void;
}

const THUMBNAIL_STYLES = [
  { id: 'Cinematic', label: 'Cinematic (Movie Poster)' },
  { id: 'Anime', label: 'Anime (Digital Illustration)' },
  { id: 'Noir', label: 'Classic Noir (High Contrast B&W)' },
  { id: 'Design', label: 'Design (Modern Branding)' }
];

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ clip, onUpdate, onClose }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [thumbnailStyle, setThumbnailStyle] = useState('Cinematic');
  const [refinePrompt, setRefinePrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGetSuggestions = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await GeminiService.suggestClipEdits(clip);
      setAnalysis(result);
    } catch (error: any) {
      setError(error.message || "Failed to analyze clip.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMagicPolish = async () => {
    if (!refinePrompt.trim()) return;
    setIsPolishing(true);
    try {
      const polished = await GeminiService.polishPrompt(refinePrompt);
      setRefinePrompt(polished);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleGenerateAIThumbnail = async () => {
    setIsGeneratingPoster(true);
    setError(null);
    try {
      const poster = await GeminiService.generateAIThumbnail(clip, thumbnailStyle, refinePrompt);
      if (poster) {
        onUpdate({ thumbnail: poster });
        setRefinePrompt(''); 
      }
    } catch (error: any) {
      setError(error.message || "Failed to generate AI thumbnail.");
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'color': return 'fa-palette';
      case 'motion': return 'fa-arrows-to-eye';
      case 'fx': return 'fa-wand-sparkles';
      case 'pacing': return 'fa-clock';
      default: return 'fa-lightbulb';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-900/50 sticky top-0 z-20 backdrop-blur-md">
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400">Clip Inspector</h2>
          <p className="text-[10px] text-slate-500 font-bold truncate w-40">{clip.title}</p>
        </div>
        <button 
          onClick={onClose} 
          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
        >
          <i className="fas fa-times text-xs text-white"></i>
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* Visual Preview */}
        <div className="space-y-4">
           <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Asset Visualization</label>
           <div className={`aspect-video rounded-3xl overflow-hidden border-2 transition-all duration-500 relative group ${isGeneratingPoster ? 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.4)] scale-95' : 'border-white/5'}`}>
              <img src={clip.thumbnail} className={`w-full h-full object-cover transition-all duration-700 ${isGeneratingPoster ? 'opacity-30 blur-sm scale-110' : 'opacity-100'}`} alt="Clip thumbnail" />
              
              {isGeneratingPoster && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                   <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                   <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest animate-pulse text-center px-6">Synthesizing Cinematic Asset...</span>
                </div>
              )}
           </div>
        </div>

        {/* Manual Thumbnail Generation UI */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
            <i className="fas fa-camera-rotate text-indigo-500"></i> Regenerate Poster
          </label>
          
          <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5 space-y-5">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">Artistic Style</label>
              <select 
                value={thumbnailStyle}
                onChange={(e) => setThumbnailStyle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none cursor-pointer"
              >
                {THUMBNAIL_STYLES.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-900">{s.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Custom Prompt</label>
                <button 
                  onClick={handleMagicPolish}
                  disabled={isPolishing || !refinePrompt.trim()}
                  className="text-[8px] font-black text-indigo-400 uppercase hover:text-indigo-300 transition-colors flex items-center gap-1.5 disabled:opacity-30"
                >
                  {isPolishing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-sparkles"></i>}
                  Magic Polish
                </button>
              </div>
              <textarea 
                value={refinePrompt}
                onChange={(e) => setRefinePrompt(e.target.value)}
                placeholder="Ex: Add dramatic sun-rays and heavy film grain..."
                className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none font-medium custom-scrollbar transition-all"
              />
            </div>

            <button 
              onClick={handleGenerateAIThumbnail}
              disabled={isGeneratingPoster}
              className={`w-full py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${
                isGeneratingPoster 
                ? 'bg-slate-800 text-slate-600' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95'
              }`}
            >
              {isGeneratingPoster ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-rotate"></i>}
              {isGeneratingPoster ? "Generating..." : "Regenerate Thumbnail"}
            </button>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="space-y-4">
           <button 
              onClick={handleGetSuggestions}
              disabled={isAnalyzing}
              className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-indigo-300 transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzing ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-brain"></i>}
              Analyze Scene Composition
            </button>

            {analysis && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-500 uppercase">Computed Mood:</span>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">{analysis.mood}</span>
                </div>
                <div className="space-y-3">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <i className={`fas ${getCategoryIcon(suggestion.category)} text-indigo-500 text-[10px]`}></i>
                        <span className="text-[10px] font-black text-white uppercase tracking-tight">{suggestion.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed">
                        {suggestion.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Effects Calibration */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
            <i className="fas fa-sliders text-amber-500"></i> Post-Processing
          </label>
          
          <div className="space-y-6 bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5">
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Blur Intensity</span>
                 <span className="text-[10px] font-mono text-indigo-400">{clip.blur}px</span>
               </div>
               <input 
                type="range" min="0" max="20" 
                value={clip.blur} 
                onChange={(e) => onUpdate({ blur: parseInt(e.target.value) })}
                className="w-full accent-indigo-500 h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer" 
               />
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Luminance</span>
                 <span className="text-[10px] font-mono text-indigo-400">{clip.brightness}%</span>
               </div>
               <input 
                type="range" min="0" max="200" 
                value={clip.brightness} 
                onChange={(e) => onUpdate({ brightness: parseInt(e.target.value) })}
                className="w-full accent-indigo-500 h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer" 
               />
            </div>

            <button 
              onClick={() => onUpdate({ isShake: !clip.isShake })}
              className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border flex items-center justify-center gap-3 ${
                clip.isShake ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' : 'bg-black/20 border-white/5 text-slate-600'
              }`}
            >
              <i className="fas fa-wave-square"></i>
              {clip.isShake ? 'Shake: Active' : 'Shake: Off'}
            </button>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="space-y-4 pb-12">
          <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
            <i className="fas fa-gauge-high text-emerald-500"></i> Playback Speed
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[0.5, 1, 1.5, 2].map(s => (
              <button 
                key={s}
                onClick={() => onUpdate({ speed: s })}
                className={`py-3 rounded-2xl text-[10px] font-black transition-all border ${clip.speed === s ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-400' : 'bg-black/20 border-white/5 text-slate-600'}`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
