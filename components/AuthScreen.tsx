
import React, { useState, useEffect } from 'react';
import { User, RegisteredUser } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const getRegistry = (): RegisteredUser[] => {
    try {
      const data = localStorage.getItem('lumina_user_registry');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveToRegistry = (user: RegisteredUser) => {
    const registry = getRegistry();
    registry.push(user);
    localStorage.setItem('lumina_user_registry', JSON.stringify(registry));
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasKey) {
      setError("AI Engine must be initialized first.");
      return;
    }

    const registry = getRegistry();
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = registry.find(u => u.email === normalizedEmail);

    if (isSignUp) {
      // REGISTRATION ATTEMPT
      if (existingUser) {
        setError("This identity already exists in our registry. Please switch to 'Sign In' and enter your password.");
        return;
      }

      if (!password || password.length < 4) {
        setError("Security key must be at least 4 characters.");
        return;
      }

      const newUser: RegisteredUser = {
        email: normalizedEmail,
        name: name.trim() || "Creative Explorer",
        password: password, 
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedEmail}`
      };

      saveToRegistry(newUser);
      loginUser(newUser);
    } else {
      // LOGIN ATTEMPT
      if (!existingUser) {
        setError("No studio identity found for this email. If you are new, please Register first.");
        return;
      }

      // SECURITY: STRICT PASSWORD VERIFICATION
      // This prevents scammers/hackers from logging into existing accounts without the correct key
      if (existingUser.password !== password) {
        setError("CRITICAL ERROR: Invalid security key. Access denied to this identity.");
        return;
      }

      // BAN PROTOCOL CHECK
      if (existingUser.isBanned) {
        const now = Date.now();
        if (existingUser.unbanAt && now > existingUser.unbanAt) {
          // Automatic restoration of access
          const updatedRegistry = registry.map(u => 
            u.email === normalizedEmail ? { ...u, isBanned: false, unbanAt: undefined } : u
          );
          localStorage.setItem('lumina_user_registry', JSON.stringify(updatedRegistry));
          loginUser({ ...existingUser, isBanned: false });
        } else {
          setError(`ACCESS REVOKED: ${existingUser.banReason || 'Administrative Suspension'}`);
          return;
        }
      } else {
        loginUser(existingUser);
      }
    }
  };

  const loginUser = (regUser: RegisteredUser | any) => {
    setIsLoading(true);
    setStatus("Verifying Credentials...");
    
    setTimeout(() => {
      setStatus("Establishing Secure Link...");
      setTimeout(() => {
        onLogin({
          id: Math.random().toString(36).substr(2, 9),
          name: regUser.email === 'muwalahmed5@gmail.com' ? "System Administrator" : regUser.name,
          email: regUser.email,
          avatar: regUser.avatar,
          provider: 'email'
        });
      }, 800);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-[#020202] z-[10000] flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.06)_0%,transparent_70%)] animate-pulse"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-indigo-600/10 border border-indigo-500/30 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(99,102,241,0.2)]">
            <i className="fas fa-eye text-indigo-400 text-4xl"></i>
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Lumina Iris</h1>
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.5em] opacity-80">Security Protocol</p>
        </div>

        <div className="w-full bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
              <div className="w-16 h-16 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="text-center space-y-2">
                <p className="text-xs font-black text-white uppercase tracking-[0.2em]">{status}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {!hasKey ? (
              <div className="space-y-4">
                <button 
                  onClick={handleSelectKey}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                >
                  <i className="fas fa-key"></i>
                  Initialize Studio Engine
                </button>
              </div>
            ) : (
              <div className="py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Engine Authorized</span>
                <i className="fas fa-circle-check text-emerald-500 text-xs"></i>
              </div>
            )}

            <div className={`space-y-6 transition-all duration-500 ${hasKey ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
              <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                <button 
                  onClick={() => { setIsSignUp(false); setError(null); }}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isSignUp ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500'}`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setIsSignUp(true); setError(null); }}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSignUp ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500'}`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {isSignUp && (
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Studio Name"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    required={isSignUp}
                  />
                )}
                
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Registry Email"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  required
                />

                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Security Key (Password)"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  required
                />

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-in shake duration-500">
                    <p className="text-[10px] text-red-400 font-black uppercase text-center tracking-tight">{error}</p>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 mt-2"
                >
                  {isSignUp ? 'Join Studio Registry' : 'Verify & Enter Studio'}
                </button>
              </form>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest">
              Identity is tied to this local environment. <br/> Access will be denied without the correct security key.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
