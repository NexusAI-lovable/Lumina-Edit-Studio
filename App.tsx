
import React, { useState, useRef, useEffect } from 'react';
import { EditTool, VideoClip, ProjectState, AudioTrack, TextOverlay, BanState, User, RegisteredUser } from './types';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';
import VideoPlayer from './components/VideoPlayer';
import PropertiesPanel from './components/PropertiesPanel';
import ExportModal from './components/ExportModal';
import BannedScreen from './components/BannedScreen';
import OwnerPanel from './components/OwnerPanel';
import AuthScreen from './components/AuthScreen';

const App: React.FC = () => {
  const OWNER_EMAIL = 'muwalahmed5@gmail.com';

  // Persistence Logic: Load User
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('lumina_user_v2');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Check if current user is banned from registry
  useEffect(() => {
    if (!user) return;
    const checkBanStatus = () => {
      try {
        const data = localStorage.getItem('lumina_user_registry');
        if (data) {
          const registry: RegisteredUser[] = JSON.parse(data);
          const currentReg = registry.find(u => u.email === user.email);
          if (currentReg?.isBanned && user.email !== OWNER_EMAIL) {
             // Force logout or set local ban state
             setBanState({
               isBanned: true,
               banReason: currentReg.banReason,
               unbanAt: currentReg.unbanAt,
               isWarningActive: false
             });
          } else if (!currentReg?.isBanned) {
            setBanState(prev => ({ ...prev, isBanned: false }));
          }
        }
      } catch (e) {
        console.error("Ban check failed", e);
      }
    };
    checkBanStatus();
    const interval = setInterval(checkBanStatus, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Persistence Logic: Load Project
  const [project, setProject] = useState<ProjectState>(() => {
    try {
      const saved = localStorage.getItem('lumina_project_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...parsed, isPlaying: false };
      }
    } catch (e) {
      console.warn("Failed to load project state", e);
    }
    return {
      clips: [],
      audioTracks: [],
      textOverlays: [],
      selectedClipId: null,
      selectedTextId: null,
      currentTime: 0,
      isPlaying: false
    };
  });

  // Persistence Logic: Load Ban State
  const [banState, setBanState] = useState<BanState>(() => {
    try {
      const saved = localStorage.getItem('lumina_ban_state_v2');
      return saved ? JSON.parse(saved) : { isBanned: false, isWarningActive: false };
    } catch {
      return { isBanned: false, isWarningActive: false };
    }
  });

  const [activeTool, setActiveTool] = useState<EditTool>(EditTool.AI_GEN);
  const [isExporting, setIsExporting] = useState(false);
  const [isOwnerPanelOpen, setIsOwnerPanelOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);

  // Save User session
  useEffect(() => {
    if (user) {
      localStorage.setItem('lumina_user_v2', JSON.stringify(user));
    } else {
      localStorage.removeItem('lumina_user_v2');
    }
  }, [user]);

  // Save Project state
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      localStorage.setItem('lumina_project_v2', JSON.stringify(project));
    }, 1000);
    return () => clearTimeout(saveTimeout);
  }, [project]);

  // Save Ban state
  useEffect(() => {
    localStorage.setItem('lumina_ban_state_v2', JSON.stringify(banState));
  }, [banState]);

  // Auto-Unban and Warning Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      if (banState.isBanned && banState.unbanAt && now >= banState.unbanAt) {
        setBanState({ isBanned: false, isWarningActive: false, unbanAt: undefined });
      }

      if (banState.isWarningActive && banState.warningCountdown !== undefined) {
        if (banState.warningCountdown <= 0) {
          setBanState(prev => ({ 
            ...prev, 
            isBanned: true, 
            isWarningActive: false, 
            warningCountdown: 0, 
            banReason: "Automatic System Enforcement" 
          }));
        } else {
          setBanState(prev => ({ 
            ...prev, 
            warningCountdown: (prev.warningCountdown || 0) - 1 
          }));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [banState]);

  const handleLogoClick = () => {
    if (user?.email !== OWNER_EMAIL) return;

    setLogoClickCount(prev => prev + 1);
    if (logoClickCount + 1 >= 5) {
      setIsOwnerPanelOpen(true);
      setLogoClickCount(0);
    }
    setTimeout(() => setLogoClickCount(0), 3000);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out? Your project will be saved.")) {
      setUser(null);
    }
  };

  const selectedClip = project.clips.find(c => c.id === project.selectedClipId);

  const addClip = (clip: VideoClip) => {
    const totalDuration = project.clips.reduce((acc, c) => acc + c.duration, 0);
    const newClip = { 
      ...clip, 
      startTime: totalDuration,
      blur: clip.blur ?? 0,
      brightness: clip.brightness ?? 100,
      contrast: clip.contrast ?? 100,
      isShake: clip.isShake ?? false,
      speed: clip.speed ?? 1
    };
    
    setProject(prev => ({
      ...prev,
      clips: [...prev.clips, newClip],
      selectedClipId: newClip.id
    }));
  };

  const updateClip = (id: string, updates: Partial<VideoClip>) => {
    setProject(prev => ({
      ...prev,
      clips: prev.clips.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const addAudio = (audio: AudioTrack) => {
    setProject(prev => ({
      ...prev,
      audioTracks: [...prev.audioTracks, audio]
    }));
  };

  const addTextOverlay = (text: string, style: 'neon' | 'glitch' | 'minimal' | 'impact' = 'minimal') => {
    const newText: TextOverlay = {
      id: Math.random().toString(36).substr(2, 9),
      content: text,
      startTime: project.currentTime,
      duration: 3,
      style: style,
      color: '#FFFFFF'
    };
    setProject(prev => ({
      ...prev,
      textOverlays: [...prev.textOverlays, newText],
      selectedTextId: newText.id
    }));
  };

  const removeClip = (id: string) => {
    setProject(prev => {
      const filtered = prev.clips.filter(c => c.id !== id);
      let currentPos = 0;
      const reordered = filtered.map(c => {
        const nc = { ...c, startTime: currentPos };
        currentPos += c.duration;
        return nc;
      });
      return {
        ...prev,
        clips: reordered,
        selectedClipId: prev.selectedClipId === id ? null : prev.selectedClipId
      };
    });
  };

  const handleTimeUpdate = (time: number) => {
    setProject(prev => ({ ...prev, currentTime: time }));
  };

  const handleSeek = (time: number) => {
    setProject(prev => ({ ...prev, currentTime: time }));
  };

  const deselectAll = () => {
    setProject(prev => ({ ...prev, selectedClipId: null, selectedTextId: null }));
  };

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  const isActuallyBanned = banState.isBanned && user.email !== OWNER_EMAIL;

  if (isActuallyBanned) {
    return <BannedScreen state={banState} onOwnerAccess={() => {
      if (user?.email === OWNER_EMAIL) setIsOwnerPanelOpen(true);
    }} />;
  }

  const isOwner = user.email === OWNER_EMAIL;

  return (
    <div className="flex flex-col h-screen overflow-hidden select-none bg-[#020202] font-sans text-slate-200">
      {banState.isWarningActive && (
        <div className="fixed top-0 inset-x-0 h-1 bg-red-600 z-[100] overflow-hidden">
          <div className="h-full bg-red-400 animate-[loading_infinite_linear]" style={{ width: '50%', animationDuration: '1s' }}></div>
        </div>
      )}
      {banState.isWarningActive && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[101] animate-in slide-in-from-top duration-500">
          <div className="bg-red-600/90 backdrop-blur-xl px-8 py-3 rounded-full border border-red-400 shadow-[0_0_50px_rgba(220,38,38,0.6)] flex items-center gap-6">
             <i className="fas fa-triangle-exclamation text-white animate-pulse"></i>
             <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">System Compliance Low</span>
               <span className="text-xs font-mono font-black text-red-100">Suspension in {banState.warningCountdown}s</span>
             </div>
          </div>
        </div>
      )}

      <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/30 backdrop-blur-2xl z-30">
        <div className="flex items-center gap-5">
          <div className="relative group cursor-pointer" onClick={handleLogoClick}>
            <div className={`absolute -inset-1 bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 ${logoClickCount > 0 ? 'opacity-40 scale-105' : ''}`}></div>
            <div className="relative w-11 h-11 bg-[#050505] border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
              <i className="fas fa-eye text-indigo-400 text-xl group-hover:scale-110 transition-transform"></i>
              <div className="absolute w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
            </div>
            <div className="flex flex-col ml-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white uppercase tracking-tighter leading-none">Lumina Iris</span>
                {isOwner && (
                  <span className="bg-indigo-500/20 text-indigo-400 text-[7px] font-black px-1.5 py-0.5 rounded border border-indigo-500/30 uppercase tracking-widest">OWNER</span>
                )}
              </div>
              <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] opacity-60">Studio v1.2</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTool(EditTool.AI_ASSISTANT)}
            className="flex items-center gap-3 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-full transition-all group"
          >
             <i className="fas fa-sparkles text-indigo-400 group-hover:rotate-12 transition-transform"></i>
             <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Talk to Iris</span>
          </button>

          <div className="h-8 w-px bg-white/5 mx-2"></div>
          
          <button 
            onClick={() => setIsExporting(true)}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            <i className="fas fa-cloud-arrow-up"></i>
            Render & Export
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-white/5">
             <div className="text-right">
               <p className="text-[10px] font-black text-white uppercase truncate w-24">{user.name}</p>
               <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{isOwner ? 'Root Administrator' : 'PRO Creative'}</p>
             </div>
             <div className="relative group">
                <img src={user.avatar} className="w-10 h-10 rounded-2xl bg-slate-800 border border-white/10" alt="Avatar" />
                <button 
                  onClick={handleLogout}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-600 rounded-lg flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity border border-black"
                >
                  <i className="fas fa-power-off"></i>
                </button>
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <nav className="w-20 border-r border-white/5 bg-[#050505] flex flex-col items-center py-8 gap-8 z-20">
          {(Object.values(EditTool) as EditTool[])
            .filter(t => t !== EditTool.HELP)
            .filter(t => t !== EditTool.ADMIN || isOwner)
            .map(tool => (
            <button 
              key={tool}
              onClick={() => setActiveTool(tool)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group relative ${activeTool === tool ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:bg-white/5'}`}
            >
              <i className={`fas ${
                tool === EditTool.AI_GEN ? 'fa-wand-magic-sparkles' :
                tool === EditTool.TRANSFORM ? 'fa-crop-simple' :
                tool === EditTool.FILTERS ? 'fa-clapperboard' :
                tool === EditTool.TEXT ? 'fa-font' :
                tool === EditTool.MUSIC ? 'fa-music' :
                tool === EditTool.TEMPLATES ? 'fa-layer-group' : 
                tool === EditTool.AI_ASSISTANT ? 'fa-robot' : 
                tool === EditTool.ADMIN ? 'fa-shield-halved' : 'fa-question'
              } text-lg`}></i>
              {activeTool === tool && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-indigo-400 rounded-l-full"></div>
              )}
            </button>
          ))}
          <div className="mt-auto">
            <button 
              onClick={() => setActiveTool(EditTool.HELP)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group relative ${activeTool === EditTool.HELP ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}
            >
              <i className="fas fa-circle-question text-lg"></i>
            </button>
          </div>
        </nav>

        <div className="w-[400px] border-r border-white/5 bg-slate-900/20 z-10">
          <Sidebar 
            activeTool={activeTool} 
            project={project}
            banState={banState}
            onUpdateBan={setBanState}
            onAddClip={addClip}
            onAddAudio={addAudio}
            onAddText={addTextOverlay}
          />
        </div>

        <div className="flex-1 flex flex-col bg-[#050505] relative" onClick={deselectAll}>
          <div className="flex-1 flex items-center justify-center p-12">
            <VideoPlayer 
              project={project} 
              currentTime={project.currentTime}
              onTimeUpdate={handleTimeUpdate}
              onPlayToggle={(playing) => setProject(prev => ({ ...prev, isPlaying: playing }))}
            />
          </div>

          <div className="h-80 border-t border-white/5 bg-slate-900/10">
            <Timeline 
              project={project}
              onSelectClip={(id) => setProject(prev => ({ ...prev, selectedClipId: id, selectedTextId: null }))}
              onSelectText={(id) => setProject(prev => ({ ...prev, selectedTextId: id, selectedClipId: null }))}
              onRemoveClip={removeClip}
              onSeek={handleSeek}
            />
          </div>
        </div>

        {selectedClip && (
          <div className="w-80 border-l border-white/5 bg-slate-900/40 z-10">
            <PropertiesPanel 
              clip={selectedClip} 
              onUpdate={(updates) => updateClip(selectedClip.id, updates)}
              onClose={() => setProject(prev => ({ ...prev, selectedClipId: null }))}
            />
          </div>
        )}
      </main>

      {isExporting && (
        <ExportModal 
          project={project} 
          onClose={() => setIsExporting(false)} 
        />
      )}

      {isOwnerPanelOpen && (
        <OwnerPanel 
          banState={banState} 
          onUpdateBan={setBanState} 
          onClose={() => setIsOwnerPanelOpen(false)} 
          project={project}
        />
      )}
    </div>
  );
};

export default App;
