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
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-28 right-6 md:bottom-12 md:right-10 z-50 p-6 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 hover:scale-115 transition-all duration-300 animate-bounce flex items-center justify-center border border-white/10" title="Support Chat">
          <MessageCircle size={36} />
        </button>
      )}
      {open && (
        <div className="fixed bottom-28 right-6 md:bottom-24 md:right-10 z-50 w-[320px] sm:w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in">
          <div className="bg-blue-600 text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <span className="font-extrabold text-sm">Support Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setUseAI(!useAI)} className={`text-[10px] px-2 py-0.5 rounded ${useAI ? 'bg-green-500' : 'bg-white/20'} hover:opacity-80 transition`} title="Toggle AI Assistant">
                <Bot size={14} />
              </button>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-blue-500 rounded-lg transition"><X size={18} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[300px] bg-slate-50">
            {showNamePrompt ? (
              <div className="p-4 text-center space-y-3">
                <p className="text-xs text-slate-500">Enter your name to start chatting</p>
                <input type="text" placeholder="Your name" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500" />
                <button onClick={() => setShowNamePrompt(false)} className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 transition">Start Chat</button>
              </div>
            ) : (
              <>
                {messages.map((m) => (
                  <div key={m._id} className={`flex ${m.isAdmin ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] p-2.5 rounded-xl text-xs ${m.isClosed ? 'bg-slate-200 text-slate-500 italic text-center w-full' : m.isAdmin ? 'bg-white border border-slate-200 text-slate-700' : 'bg-blue-600 text-white'}`}>
                      {m.isClosed ? (
                        <span>Chat closed by support. <button onClick={reopenChat} className="text-blue-600 underline font-semibold">Start new chat</button></span>
                      ) : (
                        <><div className="font-bold text-[10px] mb-0.5 opacity-70">{m.isAdmin ? (m.username === 'AI Assistant' ? '🤖 AI Assistant' : 'Support') : m.username}</div>{m.message}</>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </>
            )}
          </div>
          {!showNamePrompt && !isClosed && (
            <form onSubmit={sendMessage} className="border-t border-slate-200 p-2 flex gap-2 bg-white">
              <input type="text" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500" />
              <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"><Send size={16} /></button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
