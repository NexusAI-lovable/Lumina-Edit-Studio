
import React, { useState, useEffect } from 'react';
import { BanState, ProjectState, RegisteredUser } from '../types';

interface OwnerPanelProps {
  banState: BanState;
  onUpdateBan: (state: BanState) => void;
  onClose: () => void;
  project?: ProjectState;
}

const OwnerPanel: React.FC<OwnerPanelProps> = ({ banState, onUpdateBan, onClose, project }) => {
  const [registry, setRegistry] = useState<RegisteredUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);
  const [reason, setReason] = useState('');
  const [banDuration, setBanDuration] = useState('5');
  const [confirmNuclear, setConfirmNuclear] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'system'>('users');

  const loadRegistry = () => {
    try {
      const data = localStorage.getItem('lumina_user_registry');
      if (data) setRegistry(JSON.parse(data));
    } catch (e) {
      console.error("Registry load failed", e);
    }
  };

  useEffect(() => {
    loadRegistry();
  }, []);

  const updateRegistryUser = (email: string, updates: Partial<RegisteredUser>) => {
    const updated = registry.map(u => u.email === email ? { ...u, ...updates } : u);
    localStorage.setItem('lumina_user_registry', JSON.stringify(updated));
    setRegistry(updated);
    if (selectedUser?.email === email) {
      setSelectedUser({ ...selectedUser, ...updates });
    }
  };

  const handleBan = (isPermanent: boolean) => {
    if (!selectedUser) return;
    const unbanAt = isPermanent ? undefined : Date.now() + (parseInt(banDuration) * 60 * 1000);
    const banReason = reason || "Administrative Action";

    updateRegistryUser(selectedUser.email, {
      isBanned: true,
      banReason: banReason,
      unbanAt: unbanAt
    });
  };

  const handleUnban = (email: string) => {
    updateRegistryUser(email, {
      isBanned: false,
      banReason: undefined,
      unbanAt: undefined
    });
  };

  const handleDeleteUser = (email: string) => {
    if (email === 'muwalahmed5@gmail.com') return;
    if (window.confirm(`Permanently wipe ${email} from registry?`)) {
      const updated = registry.filter(u => u.email !== email);
      localStorage.setItem('lumina_user_registry', JSON.stringify(updated));
      setRegistry(updated);
      if (selectedUser?.email === email) setSelectedUser(null);
    }
  };

  const handleNuclearWipe = () => {
    if (!confirmNuclear) {
      setConfirmNuclear(true);
      return;
    }
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/98 z-[10000] flex items-center justify-center p-6 backdrop-blur-3xl select-none">
      <div className="bg-[#050505] border border-white/10 rounded-[3.5rem] w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
        
        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
           <div>
             <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Root Command Terminal</h2>
             <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">Authorized Access: muwalahmed5@gmail.com</p>
           </div>
           
           <div className="flex items-center gap-6">
              <nav className="flex bg-black p-1.5 rounded-2xl border border-white/5">
                {[
                  { id: 'users', label: 'User Management', icon: 'fa-users-gear' },
                  { id: 'system', label: 'Core Diagnostics', icon: 'fa-server' }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <i className={`fas ${tab.icon} text-[10px]`}></i>
                    {tab.label}
                  </button>
                ))}
              </nav>
              <button onClick={onClose} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all group">
                <i className="fas fa-times text-slate-500 group-hover:text-white transition-all"></i>
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {activeTab === 'users' ? (
            <>
              {/* Registry List */}
              <div className="w-1/3 border-r border-white/5 p-8 overflow-y-auto custom-scrollbar space-y-4">
                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Studio Residents</h3>
                <div className="space-y-3">
                  {registry.map(u => (
                    <button 
                      key={u.email}
                      onClick={() => setSelectedUser(u)}
                      className={`w-full p-5 rounded-3xl border transition-all text-left flex items-center gap-4 group ${
                        selectedUser?.email === u.email 
                        ? 'bg-indigo-600 border-indigo-500 shadow-xl' 
                        : u.isBanned 
                          ? 'bg-red-600/5 border-red-500/10' 
                          : 'bg-black/40 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <img src={u.avatar} className="w-10 h-10 rounded-2xl bg-slate-900 border border-white/10" />
                      <div className="truncate flex-1">
                        <div className="flex items-center gap-2">
                           <span className={`text-[11px] font-black uppercase truncate ${selectedUser?.email === u.email ? 'text-white' : 'text-slate-200'}`}>{u.name}</span>
                           {u.isBanned && <i className="fas fa-ban text-[10px] text-red-500"></i>}
                        </div>
                        <p className={`text-[9px] font-mono truncate ${selectedUser?.email === u.email ? 'text-indigo-200' : 'text-slate-600'}`}>{u.email}</p>
                      </div>
                      {u.email === 'muwalahmed5@gmail.com' && <i className="fas fa-shield-halved text-indigo-400 text-[10px]"></i>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Panel */}
              <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
                {selectedUser ? (
                  <div className="max-w-xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                     <div className="flex items-center gap-8">
                        <img src={selectedUser.avatar} className="w-24 h-24 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-500/20" />
                        <div>
                           <h4 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedUser.name}</h4>
                           <p className="text-xs font-mono text-indigo-400 mt-1">{selectedUser.email}</p>
                           {selectedUser.isBanned && (
                             <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/40 rounded-full">
                               <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Locked: {selectedUser.unbanAt ? 'Timed' : 'Perm'}</span>
                             </div>
                           )}
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Violation Log</label>
                           <textarea 
                             value={reason}
                             onChange={(e) => setReason(e.target.value)}
                             placeholder="Document administrative reasoning..."
                             className="w-full h-32 bg-black border border-white/10 rounded-[2rem] p-6 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-medium resize-none transition-all"
                           />
                        </div>

                        {selectedUser.email !== 'muwalahmed5@gmail.com' ? (
                          <div className="grid grid-cols-1 gap-4 pt-4">
                            {selectedUser.isBanned ? (
                              <button 
                                onClick={() => handleUnban(selectedUser.email)}
                                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl text-[12px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-600/20"
                              >
                                Restore Studio Privileges
                              </button>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex gap-4">
                                  <input 
                                    type="number"
                                    value={banDuration}
                                    onChange={(e) => setBanDuration(e.target.value)}
                                    className="w-24 bg-black border border-white/10 rounded-2xl p-4 text-center text-xs font-mono text-indigo-400"
                                  />
                                  <button 
                                    onClick={() => handleBan(false)}
                                    className="flex-1 py-4 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-3xl text-[12px] font-black uppercase tracking-[0.2em] transition-all border border-red-500/20"
                                  >
                                    Apply {banDuration}m Lockout
                                  </button>
                                </div>
                                <button 
                                  onClick={() => handleBan(true)}
                                  className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-3xl text-[12px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-red-600/20"
                                >
                                  Permanent System Ban
                                </button>
                              </div>
                            )}
                            <button 
                              onClick={() => handleDeleteUser(selectedUser.email)}
                              className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                            >
                              Delete Account Registry
                            </button>
                          </div>
                        ) : (
                          <div className="p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-[2.5rem] flex flex-col items-center gap-4">
                             <i className="fas fa-shield-halved text-4xl text-indigo-500 opacity-40"></i>
                             <p className="text-xs font-black text-indigo-300 uppercase tracking-widest">Administrative Core Protection Enabled</p>
                          </div>
                        )}
                     </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-800 space-y-6">
                    <i className="fas fa-users-viewfinder text-8xl opacity-10"></i>
                    <p className="text-sm font-black text-slate-700 uppercase tracking-[0.4em]">Select an identity to manage</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 p-16 space-y-12 overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-3 gap-8">
                  <div className="p-10 bg-black border border-white/5 rounded-[3rem] space-y-4">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Creators</p>
                     <p className="text-5xl font-black text-white">{registry.length}</p>
                  </div>
                  <div className="p-10 bg-black border border-white/5 rounded-[3rem] space-y-4">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Locked Identities</p>
                     <p className="text-5xl font-black text-red-500">{registry.filter(u => u.isBanned).length}</p>
                  </div>
                  <div className="p-10 bg-black border border-white/5 rounded-[3rem] space-y-4">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Assets</p>
                     <p className="text-5xl font-black text-indigo-400">{project?.clips.length || 0}</p>
                  </div>
               </div>

               <div className="p-12 bg-red-600/5 border border-red-500/10 rounded-[3.5rem] space-y-8">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-red-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
                        <i className="fas fa-radiation text-2xl"></i>
                     </div>
                     <div>
                        <h4 className="text-xl font-black text-white uppercase tracking-tight">Nuclear Maintenance Mode</h4>
                        <p className="text-xs text-red-400 font-bold uppercase mt-1 tracking-widest">Global cache & registry purge authorization required</p>
                     </div>
                  </div>

                  <div className={`p-10 rounded-[2.5rem] border transition-all ${confirmNuclear ? 'bg-red-600 border-red-400' : 'bg-black border-white/5'}`}>
                    <p className={`text-sm leading-relaxed font-bold uppercase mb-8 ${confirmNuclear ? 'text-white' : 'text-slate-500'}`}>
                      {confirmNuclear ? 'CRITICAL ALERT: This will permanently delete ALL registered users, all project files, and all session data in this environment.' : 'Purge all local storage databases including the root identity and all project cache.'}
                    </p>
                    <button 
                      onClick={handleNuclearWipe}
                      className={`w-full py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.4em] transition-all border ${confirmNuclear ? 'bg-white text-red-600 border-white animate-pulse' : 'bg-white/5 hover:bg-red-600/20 text-red-500 border-red-500/20'}`}
                    >
                      {confirmNuclear ? 'INITIATE GLOBAL WIPE' : 'System Reset (WIPE)'}
                    </button>
                    {confirmNuclear && (
                       <button onClick={() => setConfirmNuclear(false)} className="w-full mt-4 text-[10px] font-black text-white/60 uppercase tracking-widest">Abort Sequence</button>
                    )}
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-black border-t border-white/5 text-[10px] font-black text-slate-800 uppercase tracking-[0.5em] flex justify-between">
           <span>Registry Persistence Active</span>
           <span className="animate-pulse">Root Session Established</span>
        </div>
      </div>
    </div>
  );
};

export default OwnerPanel;
