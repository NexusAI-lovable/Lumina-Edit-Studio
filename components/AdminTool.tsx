
import React, { useState, useEffect } from 'react';
import { BanState, RegisteredUser } from '../types';

interface AdminToolProps {
  banState: BanState;
  onUpdateBan: (state: BanState) => void;
}

const AdminTool: React.FC<AdminToolProps> = ({ banState, onUpdateBan }) => {
  const [registry, setRegistry] = useState<RegisteredUser[]>([]);
  const [targetUser, setTargetUser] = useState<RegisteredUser | null>(null);
  const [banReason, setBanReason] = useState('Violation of Community Guidelines');

  const loadRegistry = () => {
    try {
      const data = localStorage.getItem('lumina_user_registry');
      if (data) {
        setRegistry(JSON.parse(data));
      }
    } catch (e) {
      console.error("Failed to load registry", e);
    }
  };

  useEffect(() => {
    loadRegistry();
    const interval = setInterval(loadRegistry, 3000);
    return () => clearInterval(interval);
  }, []);

  const applyEnforcement = (email: string, minutes: number | 'permanent' | 'restore') => {
    const registryData = JSON.parse(localStorage.getItem('lumina_user_registry') || '[]');
    const userIndex = registryData.findIndex((u: RegisteredUser) => u.email === email);
    
    if (userIndex === -1 || email === 'muwalahmed5@gmail.com') return;

    if (minutes === 'restore') {
      registryData[userIndex].isBanned = false;
      registryData[userIndex].banReason = undefined;
      registryData[userIndex].unbanAt = undefined;
    } else {
      const unbanAt = minutes === 'permanent' ? undefined : Date.now() + (minutes * 60000);
      registryData[userIndex].isBanned = true;
      registryData[userIndex].banReason = banReason;
      registryData[userIndex].unbanAt = unbanAt;
    }

    localStorage.setItem('lumina_user_registry', JSON.stringify(registryData));
    setRegistry(registryData);
    setTargetUser(null); // Close the settings popup
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 relative">
      <div className="p-6 border-b border-white/5 bg-slate-900/10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">
          Administrative Terminal
        </h3>
        <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest">
          Select a user's name to manage their system access
        </p>
      </div>

      {/* User Registry List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
        {registry.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-800 space-y-4 opacity-50">
            <i className="fas fa-users-slash text-5xl"></i>
            <p className="text-[10px] font-black uppercase tracking-widest">No Registered Users</p>
          </div>
        ) : (
          registry.map(user => (
            <div 
              key={user.email}
              onClick={() => user.email !== 'muwalahmed5@gmail.com' && setTargetUser(user)}
              className={`w-full p-4 rounded-3xl border transition-all flex items-center justify-between group relative overflow-hidden ${
                user.email === 'muwalahmed5@gmail.com' ? 'cursor-default border-indigo-500/20 bg-indigo-500/5' : 'cursor-pointer hover:bg-white/10 active:scale-95 border-white/5'
              } ${user.isBanned ? 'bg-red-600/10 border-red-500/40' : 'bg-white/5'}`}
            >
              <div className="flex items-center gap-4 overflow-hidden relative z-10">
                <div className="relative">
                  <img src={user.avatar} className="w-10 h-10 rounded-2xl bg-black border border-white/10" alt="User" />
                  {user.isBanned && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-black animate-pulse"></div>
                  )}
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-black uppercase truncate leading-none tracking-tight text-white">{user.name}</p>
                    {user.email === 'muwalahmed5@gmail.com' && (
                      <span className="bg-indigo-500 text-white text-[6px] px-1.5 py-0.5 rounded uppercase font-black tracking-widest">OWNER</span>
                    )}
                  </div>
                  <p className="text-[9px] font-mono opacity-50 truncate mt-1 text-slate-400">{user.email}</p>
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-end">
                 {user.isBanned ? (
                   <span className="text-[7px] font-black text-red-500 uppercase tracking-widest bg-red-600/10 px-2 py-0.5 rounded-full border border-red-500/20">Banned</span>
                 ) : (
                   <i className="fas fa-user-gear text-[10px] text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                 )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Settings Popup / Enforcement Overlay */}
      {targetUser && (
        <div className="absolute inset-0 z-50 bg-[#050505]/98 backdrop-blur-2xl animate-in slide-in-from-right duration-300 flex flex-col p-8 space-y-10">
           <div className="flex items-center justify-between">
              <button 
                onClick={() => setTargetUser(null)}
                className="text-slate-500 hover:text-white flex items-center gap-2 transition-colors"
              >
                <i className="fas fa-arrow-left text-[10px]"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Back to List</span>
              </button>
              <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[8px] font-black text-indigo-400 uppercase tracking-widest">Enforcement Mode</div>
           </div>

           <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <img src={targetUser.avatar} className="w-24 h-24 rounded-[2.5rem] border-2 border-white/10 shadow-2xl" alt="Target" />
                {targetUser.isBanned && (
                  <div className="absolute inset-0 bg-red-600/20 rounded-[2.5rem] flex items-center justify-center border-2 border-red-600">
                    <i className="fas fa-ban text-red-600 text-2xl drop-shadow-lg"></i>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-2xl font-black text-white uppercase tracking-tighter">{targetUser.name}</h4>
                <p className="text-[10px] font-mono text-indigo-400 mt-1">{targetUser.email}</p>
              </div>
           </div>

           <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Administrative Reason</label>
                <textarea 
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="State the reason for suspension..."
                  className="w-full bg-black border border-white/10 rounded-2xl p-5 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none h-24"
                />
              </div>

              {targetUser.isBanned ? (
                <div className="space-y-4">
                  <div className="p-4 bg-red-600/5 border border-red-500/20 rounded-2xl">
                    <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Current Status</p>
                    <p className="text-[10px] text-slate-400 font-bold italic">"{targetUser.banReason || 'Administrative Action'}"</p>
                  </div>
                  <button 
                    onClick={() => applyEnforcement(targetUser.email, 'restore')}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3"
                  >
                    <i className="fas fa-user-check"></i>
                    Unban Identity
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Timed Ban Protocols</label>
                    <div className="grid grid-cols-3 gap-3">
                       {[5, 10, 20].map(mins => (
                         <button 
                          key={mins}
                          onClick={() => applyEnforcement(targetUser.email, mins)}
                          className="py-4 bg-amber-600/10 hover:bg-amber-600 text-amber-500 hover:text-white border border-amber-600/20 rounded-2xl text-[11px] font-black transition-all active:scale-90 flex flex-col items-center justify-center"
                         >
                           <span className="text-[12px]">{mins}</span>
                           <span className="text-[8px] opacity-60">MINS</span>
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <label className="text-[10px] font-black text-red-500 uppercase tracking-widest px-1">Indefinite Protocols</label>
                    <button 
                      onClick={() => applyEnforcement(targetUser.email, 'permanent')}
                      className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-3"
                    >
                      <i className="fas fa-lock"></i>
                      Ban Identity (Permanent)
                    </button>
                  </div>
                </div>
              )}
           </div>

           <div className="text-center pt-4">
              <span className="text-[8px] font-black text-slate-800 uppercase tracking-[0.8em]">SEC_IRIS_VERIFIER_ACTIVE</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminTool;
