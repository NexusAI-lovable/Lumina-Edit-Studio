
import React, { useState } from 'react';
import { EditTool, VideoClip, AudioTrack, ProjectState, BanState } from '../types';
import AIPromptBox from './AIPromptBox';
import { GeminiService } from '../services/geminiService';
import TutorialModal from './TutorialModal';
import AIAssistant from './AIAssistant';
import AdminTool from './AdminTool';

interface SidebarProps {
  activeTool: EditTool;
  project: ProjectState;
  banState: BanState;
  onUpdateBan: (state: BanState) => void;
  onAddClip: (clip: VideoClip) => void;
  onAddAudio: (audio: AudioTrack) => void;
  onAddText: (text: string, style: 'neon' | 'glitch' | 'minimal' | 'impact') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, project, banState, onUpdateBan, onAddClip, onAddAudio, onAddText }) => {
  const [localFileProcessing, setLocalFileProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalFileProcessing(true);
    const url = URL.createObjectURL(file);
    let thumbnail = '';
    const isVideo = file.type.startsWith('video/');

    try {
      if (isVideo) {
        thumbnail = await GeminiService.generateThumbnail(url);
      } else {
        thumbnail = url;
      }

      onAddClip({
        id: Math.random().toString(36).substr(2, 9),
        type: 'local',
        mediaType: isVideo ? 'video' : 'image',
        url: url,
        title: file.name,
        duration: isVideo ? 5 : 3,
        thumbnail: thumbnail,
        speed: 1,
        volume: 100,
        filter: 'None',
        blur: 0,
        brightness: 100,
        contrast: 100,
        isShake: false,
        startTime: 0
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLocalFileProcessing(false);
    }
  };

  const handleMusicAdd = (title: string) => {
    onAddAudio({
      id: Math.random().toString(36).substr(2, 9),
      url: '#',
      title: title,
      duration: 15,
      startTime: 0,
      volume: 80
    });
  };

  const handleFeedbackSubmit = () => {
    if (!feedback.trim()) return;
    
    setFeedbackStatus('sending');
    
    // Construct the email components
    const recipient = "muwalahmed5@gmail.com";
    const subject = encodeURIComponent("Lumina Iris Studio - User Feedback");
    const body = encodeURIComponent(`Feedback Details:\n------------------\n${feedback}\n\nProject Context:\n- Clips: ${project.clips.length}\n- Current Playhead: ${project.currentTime.toFixed(2)}s`);
    
    // Simulate a professional delay for "packaging" the feedback
    setTimeout(() => {
      // Trigger the mailto link
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
      
      setFeedbackStatus('sent');
      setFeedback('');
      
      // Reset status after a few seconds
      setTimeout(() => setFeedbackStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <aside className="w-full h-full bg-slate-900/50 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
           <div className={`w-2 h-2 rounded-full bg-indigo-500 ${activeTool !== EditTool.HELP ? 'animate-pulse' : ''}`}></div>
           {activeTool.replace('_', ' ')}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">
        {activeTool === EditTool.AI_GEN && (
          <div className="p-6 space-y-8">
            <AIPromptBox 
              project={project}
              onGenerated={(url, prompt, thumbnail, mediaType) => onAddClip({
                id: Math.random().toString(36).substr(2, 9),
                type: 'ai',
                mediaType: mediaType,
                url: url,
                title: mediaType === 'video' ? "AI Render" : "AI Masterpiece",
                duration: mediaType === 'video' ? 5 : 4,
                prompt: prompt,
                thumbnail: thumbnail,
                speed: 1,
                volume: 100,
                filter: 'None',
                blur: 0,
                brightness: 100,
                contrast: 100,
                isShake: false,
                startTime: 0
              })} 
            />
            
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Import External Assets</label>
              <div className="relative border-2 border-dashed border-white/5 rounded-[2.5rem] p-12 hover:border-indigo-500/30 hover:bg-white/5 transition-all cursor-pointer group text-center bg-black/20">
                <input type="file" accept="video/*,image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={localFileProcessing} />
                <div className="flex flex-col items-center gap-5">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-indigo-500/10 transition-all border border-white/5">
                    <i className={`fas ${localFileProcessing ? 'fa-circle-notch fa-spin text-indigo-500' : 'fa-plus text-slate-500 group-hover:text-indigo-400'} text-2xl`}></i>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-200">Upload Media</p>
                    <p className="text-[9px] text-slate-700 font-bold uppercase tracking-tighter">Support MP4, MOV, PNG, JPG</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTool === EditTool.AI_ASSISTANT && (
          <AIAssistant project={project} />
        )}

        {activeTool === EditTool.ADMIN && (
          <AdminTool banState={banState} onUpdateBan={onUpdateBan} />
        )}

        {activeTool === EditTool.MUSIC && (
          <div className="p-6 space-y-8">
             <div className="p-5 bg-indigo-600/5 border border-indigo-500/10 rounded-3xl flex items-center gap-5 cursor-pointer hover:bg-indigo-600/10 transition-all group">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                  <i className="fas fa-microphone text-white text-lg"></i>
                </div>
                <div>
                   <p className="text-[11px] font-black text-white uppercase tracking-widest">Voiceover AI</p>
                   <p className="text-[9px] text-indigo-400 font-bold uppercase">Record direct-to-track</p>
                </div>
             </div>
             <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Cinematic Scores</label>
               {['Cyberpunk Night', 'Midnight Lo-Fi', 'Orchestral Storm', 'Neon Pulse'].map(track => (
                 <button 
                  key={track}
                  onClick={() => handleMusicAdd(track)}
                  className="w-full p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all flex items-center justify-between group"
                 >
                   <div className="flex items-center gap-4">
                     <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600/20">
                        <i className="fas fa-play text-[10px] text-slate-500 group-hover:text-indigo-400"></i>
                     </div>
                     <span className="text-[11px] font-black text-slate-300 uppercase tracking-tight">{track}</span>
                   </div>
                   <span className="text-[9px] font-mono text-slate-600">03:45</span>
                 </button>
               ))}
             </div>
          </div>
        )}

        {activeTool === EditTool.TEXT && (
          <div className="p-6 space-y-8">
             <div className="space-y-4">
               <textarea 
                 value={textInput}
                 onChange={(e) => setTextInput(e.target.value)}
                 placeholder="Type your subtitle here..."
                 className="w-full h-28 bg-black/40 border border-white/5 rounded-[2rem] p-6 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-medium custom-scrollbar"
               />
               <div className="grid grid-cols-2 gap-3">
                 {(['neon', 'glitch', 'minimal', 'impact'] as const).map(style => (
                   <button 
                    key={style}
                    onClick={() => {
                      if(textInput.trim()) {
                        onAddText(textInput, style);
                        setTextInput('');
                      }
                    }}
                    className="py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:border-indigo-500 transition-all"
                   >
                     {style}
                   </button>
                 ))}
               </div>
             </div>
             <div className="pt-8 border-t border-white/5 space-y-4">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Timeline Overlays</label>
                {project.textOverlays.map(t => (
                  <div key={t.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                    <span className="text-[10px] font-black text-slate-300 truncate w-32 uppercase tracking-tight">{t.content}</span>
                    <span className="text-[9px] font-mono text-indigo-400">{t.startTime.toFixed(1)}s</span>
                  </div>
                ))}
                {project.textOverlays.length === 0 && (
                   <p className="text-[9px] text-slate-700 font-bold uppercase text-center py-4 italic">No overlays added yet</p>
                )}
             </div>
          </div>
        )}

        {activeTool === EditTool.HELP && (
          <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Lumina Iris Tutorials</label>
              <div 
                onClick={() => setIsTutorialOpen(true)}
                className="aspect-video bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800)' }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                   <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-125 group-hover:bg-indigo-500 transition-all">
                      <i className="fas fa-play text-xl ml-1"></i>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Watch Masterclass</p>
                     <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest opacity-80">Interactive Guide • Pro Workflow</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/5">
               <h3 className="text-[11px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2">
                  <i className="fas fa-circle-info"></i> Quick Start
               </h3>
               <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-400 shrink-0 border border-indigo-500/20">1</div>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Start in <span className="text-white font-bold">AI Gen</span>. Describe a scene or pick a preset style to create your first clip.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-400 shrink-0 border border-indigo-500/20">2</div>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Tap a clip in the <span className="text-white font-bold">Timeline</span>. Use the <span className="text-indigo-400">Inspector</span> to auto-generate a cinematic poster thumbnail.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-400 shrink-0 border border-indigo-500/20">3</div>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Layer <span className="text-white font-bold">Neon Text</span> and cinematic soundtracks to tell your story.</p>
                  </div>
               </div>
            </div>

            {/* FEEDBACK SECTION */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1 flex justify-between">
                 <span>Developer Hotline</span>
                 {feedbackStatus === 'sent' && <span className="text-emerald-500 animate-pulse">Email Prepared!</span>}
              </label>
              <div className="bg-black/20 rounded-3xl p-6 border border-white/5 space-y-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed text-center">Your feedback will be sent directly to muwalahmed5@gmail.com via your email client.</p>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="I'd love to see..."
                  disabled={feedbackStatus !== 'idle'}
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none font-medium custom-scrollbar transition-all"
                />
                <button 
                  onClick={handleFeedbackSubmit}
                  disabled={!feedback.trim() || feedbackStatus !== 'idle'}
                  className={`w-full py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    feedbackStatus === 'sent' 
                      ? 'bg-emerald-600 text-white' 
                      : feedbackStatus === 'sending'
                        ? 'bg-slate-800 text-slate-500'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {feedbackStatus === 'sending' ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                  {feedbackStatus === 'sent' ? 'Open Mail Client' : feedbackStatus === 'sending' ? 'Packaging Data...' : 'Send to Developers'}
                </button>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 rounded-3xl border border-white/5 text-center">
              <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] italic">Lumina Studio v1.2.4-stable</p>
            </div>
          </div>
        )}
      </div>

      {isTutorialOpen && (
        <TutorialModal 
          onClose={() => setIsTutorialOpen(false)}
          videoSrc="https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
        />
      )}
    </aside>
  );
};

export default Sidebar;
