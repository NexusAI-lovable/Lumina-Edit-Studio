
import React, { useState, useEffect } from 'react';
import { BanState } from '../types';

interface BannedScreenProps {
  state: BanState;
  onOwnerAccess: () => void;
}

const BannedScreen: React.FC<BannedScreenProps> = ({ state, onOwnerAccess }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!state.unbanAt) {
      setTimeLeft('PERMANENT');
      return;
    }

    const interval = setInterval(() => {
      const diff = state.unbanAt! - Date.now();
      if (diff <= 0) {
        setTimeLeft('RESTORING...');
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [state.unbanAt]);

  return (
    <div 
      className="fixed inset-0 bg-[#020202] z-[9999] flex flex-col items-center justify-center p-8 overflow-hidden select-none"
      onContextMenu={(e) => e.preventDefault()} // Block context menu
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15)_0%,transparent_70%)]"></div>
      
      {/* Moving scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-0 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>

      <div className="relative z-10 max-w-md w-full text-center space-y-10 animate-in fade-in zoom-in duration-1000">
        <div className="flex justify-center" onDoubleClick={onOwnerAccess}>
          <div className="w-28 h-28 bg-red-600/10 border border-red-500/40 rounded-[3rem] flex items-center justify-center shadow-[0_0_80px_rgba(220,38,38,0.3)] group cursor-default">
            <i className="fas fa-shield-halved text-red-500 text-5xl group-hover:scale-90 transition-transform"></i>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">System Locked</h1>
            <div className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Access Revoked</span>
            </div>
          </div>
          
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
            Your credentials have been flagged for non-compliance.
            Lumina Iris core functions are currently disabled.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-red-600/5 border border-red-500/10 rounded-3xl text-left">
            <p className="text-[9px] font-black text-red-400 uppercase tracking-[0.2em] mb-2">Ban Reason</p>
            <p className="text-[11px] text-slate-300 font-bold uppercase italic leading-tight">"{state.banReason || 'Administrative Action'}"</p>
          </div>
          
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-left">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Restoration At</p>
            <p className="text-[11px] font-mono font-black text-indigo-400 tracking-wider">{timeLeft}</p>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col items-center gap-4">
          <p className="text-[9px] text-slate-800 font-black uppercase tracking-[0.3em]">
            Digital Signature: {Math.random().toString(36).substr(2, 16).toUpperCase()}
          </p>
          <div className="flex gap-2">
            <div className="w-1 h-1 bg-red-900 rounded-full"></div>
            <div className="w-1 h-1 bg-red-900 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-red-900 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center text-[8px] text-slate-900 font-black uppercase tracking-[0.5em]">
        <span>IRIS_SEC_MODULE_v4</span>
        <span className="animate-pulse">STABILITY_CHECK: OK</span>
      </div>

      {/* Block all mouse events to children by default except the ones we handle */}
      <div className="fixed inset-0 pointer-events-auto cursor-not-allowed z-[-1]"></div>
    </div>
  );
};

export default BannedScreen;
