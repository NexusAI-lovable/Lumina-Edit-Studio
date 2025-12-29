
import React, { useState, useRef, useEffect } from 'react';
import { ProjectState } from '../types';
import { GeminiService } from '../services/geminiService';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIAssistantProps {
  project: ProjectState;
}

const QUICK_PROMPTS = [
  "Fix my edit's pacing",
  "How to add a noir feel?",
  "Suggest a feature idea",
  "Is there a bug in my timeline?"
];

const AIAssistant: React.FC<AIAssistantProps> = ({ project }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Interface stabilized. I am Iris, your Studio Co-Pilot. I'm monitoring your current composition of " + project.clips.length + " clips. How can I refine your vision?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: messageText }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const reply = await GeminiService.assistantChat(messageText, project);
      setMessages([...newMessages, { role: 'assistant', content: reply || "My neural links are flickering. Please repeat the query." }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: "Communication blackout. Please verify your Studio Key in the Auth Gate." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] relative overflow-hidden animate-in fade-in duration-700">
      {/* Neural Background Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full animate-pulse delay-700"></div>
      </div>

      {/* Header Context Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 bg-slate-900/40 backdrop-blur-xl border-b border-white/5">
         <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping absolute inset-0"></div>
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full relative shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Iris Neural Link</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">v3.1.2 Active</span>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[8px] font-black text-indigo-400 uppercase tracking-tighter">Sync: OK</span>
         </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth"
      >
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}
          >
            <div className={`
              max-w-[90%] px-5 py-4 rounded-[2.5rem] text-[11px] leading-relaxed font-medium transition-all shadow-2xl
              ${m.role === 'user' 
                ? 'bg-indigo-600 text-white shadow-indigo-600/20 rounded-tr-none border border-indigo-500/30' 
                : 'bg-white/5 backdrop-blur-md border border-white/10 text-slate-300 rounded-tl-none'}
            `}>
              {m.content.split('\n').map((line, idx) => (
                <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
             <div className="bg-white/5 border border-white/10 px-5 py-4 rounded-[2rem] rounded-tl-none">
                <div className="flex gap-1.5">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative z-10 p-6 border-t border-white/5 bg-slate-900/30 backdrop-blur-2xl space-y-4">
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map(qp => (
            <button 
              key={qp}
              onClick={() => handleSend(qp)}
              disabled={isTyping}
              className="px-4 py-2 bg-black/40 border border-white/5 rounded-full text-[9px] font-black text-slate-500 uppercase hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all whitespace-nowrap active:scale-95"
            >
              {qp}
            </button>
          ))}
        </div>

        <div className="relative group">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Query Iris Co-Pilot..."
            className="w-full bg-black/60 border border-white/10 rounded-3xl p-5 pr-16 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none font-medium placeholder:text-slate-800 transition-all custom-scrollbar"
            rows={2}
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`absolute right-4 bottom-4 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              !input.trim() || isTyping ? 'text-slate-800' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95'
            }`}
          >
            <i className={`fas ${isTyping ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-xs`}></i>
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-[8px] text-slate-700 font-black uppercase tracking-[0.4em]">Integrated Intelligence Mode</p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
