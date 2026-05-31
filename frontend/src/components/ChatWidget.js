'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [username, setUsername] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const [useAI, setUseAI] = useState(false);
  const bottomRef = useRef(null);

  const isClosed = messages.length > 0 && messages[messages.length - 1]?.isClosed;

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/chat`);
      if (res.ok) setMessages(await res.json());
    } catch {}
  };

  useEffect(() => {
    if (open && !showNamePrompt) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [open, showNamePrompt]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username || 'Guest', message: text }),
      });
      setText('');
      fetchMessages();
      if (useAI) {
        setTimeout(async () => {
          await fetch(`${API_URL}/chat/ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text }),
          });
          fetchMessages();
        }, 500);
      }
    } catch {}
  };

  const reopenChat = async () => {
    try {
      await fetch(`${API_URL}/chat/reopen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      fetchMessages();
    } catch {}
  };

  return (
    <>
      <style>{`
        @keyframes pulse-shadow {
          0% { box-shadow: 0 0 0 0 rgba(255, 102, 0, 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(255, 102, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 102, 0, 0); }
        }
        .chat-pulse-btn {
          animation: pulse-shadow 2s infinite;
        }
        .chat-fade-in {
          animation: chatFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-28 right-6 md:bottom-12 md:right-10 z-50 w-14 h-14 bg-gradient-to-r from-[#FF6600] to-[#ff7e1b] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 chat-pulse-btn flex items-center justify-center border border-white/20 cursor-pointer"
          title="Support Chat"
        >
          <MessageCircle size={24} />
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-28 right-6 md:bottom-24 md:right-10 z-50 w-[320px] sm:w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden chat-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FF6600] to-[#ff7e1b] text-white px-5 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <MessageCircle size={18} />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 border border-white rounded-full animate-ping" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 border border-white rounded-full" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-sm block leading-none">Support Chat</span>
                <span className="text-[10px] text-white/80 font-semibold mt-1 block">We are online</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setUseAI(!useAI)}
                className={`text-[10px] p-1.5 rounded-lg ${useAI ? 'bg-green-500 text-white' : 'bg-white/10 text-white/80'} hover:bg-white/20 transition flex items-center gap-1 font-bold border-0 cursor-pointer`}
                title="Toggle AI Assistant"
              >
                <Bot size={13} />
                <span>AI</span>
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-white/15 rounded-lg transition border-0 bg-transparent text-white/80 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[300px] bg-slate-50/50">
            {showNamePrompt ? (
              <div className="p-5 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mx-auto text-[#FF6600]">
                  <MessageCircle size={22} />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 text-sm">Welcome to Goroly Support</p>
                  <p className="text-[11px] text-slate-400 leading-normal">Enter your name to start chatting with our support agents.</p>
                </div>
                <input
                  type="text"
                  placeholder="Your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#FF6600] focus:border-transparent transition"
                />
                <button
                  onClick={() => setShowNamePrompt(false)}
                  className="w-full py-2.5 bg-[#FF6600] hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition shadow-md shadow-orange-500/10 cursor-pointer border-0"
                >
                  Start Chat
                </button>
              </div>
            ) : (
              <>
                {messages.map((m) => (
                  <div key={m._id} className={`flex ${m.isAdmin ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${m.isClosed ? 'bg-slate-200 text-slate-500 italic text-center w-full' : m.isAdmin ? 'bg-white border border-slate-100 text-slate-700 shadow-xs' : 'bg-[#FF6600] text-white shadow-xs'}`}>
                      {m.isClosed ? (
                        <span>Chat closed by support. <button onClick={reopenChat} className="text-[#FF6600] underline font-bold bg-transparent border-0 cursor-pointer">Start new chat</button></span>
                      ) : (
                        <>
                          <div className="font-bold text-[9px] mb-1 uppercase tracking-wider opacity-75 flex items-center gap-1 select-none">
                            {m.isAdmin ? (
                              <>
                                <Bot size={10} className="text-slate-400" />
                                <span>{m.username === 'AI Assistant' ? 'AI Assistant' : 'Support'}</span>
                              </>
                            ) : (
                              <>
                                <User size={10} className="text-white/80" />
                                <span>{m.username}</span>
                              </>
                            )}
                          </div>
                          <span className="font-semibold">{m.message}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Footer Input */}
          {!showNamePrompt && !isClosed && (
            <form onSubmit={sendMessage} className="border-t border-slate-100 p-2.5 flex gap-2 bg-white">
              <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#FF6600] transition"
              />
              <button
                type="submit"
                className="p-2 bg-[#FF6600] hover:bg-orange-600 text-white rounded-xl transition cursor-pointer border-0 flex items-center justify-center w-9 h-9 flex-shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
