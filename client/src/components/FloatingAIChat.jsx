import React, { useState } from 'react';
import { Bot, Send, ShieldAlert, X } from 'lucide-react';

export default function FloatingAIChat({ station }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Command AI online. Ask me about the current station, weather, stock, or mission risks.' }
  ]);

  const ask = async (event) => {
    event.preventDefault();
    const question = message.trim();
    if (!question || loading) return;
    setMessage('');
    setMessages(previous => [...previous, { role: 'user', text: question }]);
    setLoading(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          context: { station: station?.name, stationId: station?.id, weather: station?.weather }
        })
      });
      const data = await response.json();
      setMessages(previous => [...previous, { role: 'assistant', text: response.ok ? data.reply : data.error }]);
    } catch {
      setMessages(previous => [...previous, { role: 'assistant', text: 'AI service is unavailable. Check the server connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed right-5 bottom-5 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div className="w-[min(360px,calc(100vw-2rem))] h-[min(500px,calc(100vh-7rem))] frost-panel rounded-2xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/40 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-polar-700 bg-polar-900/95">
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center"><Bot className="w-4 h-4 text-cyan-300" /></div><div><div className="text-xs font-bold text-white">Command AI</div><div className="text-[10px] text-emerald-300 font-mono">ONLINE • {station?.name || 'Station context'}</div></div></div>
            <button onClick={() => setOpen(false)} aria-label="Close AI assistant" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-polar-800"><X className="w-4 h-4" /></button>
          </div>
          <div className="px-3 py-2 bg-amber-950/30 border-b border-amber-500/20 flex gap-2 text-[10px] text-amber-200"><ShieldAlert className="w-3.5 h-3.5 shrink-0" />AI is advisory. Confirm safety-critical decisions.</div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">{messages.map((item, index) => <div key={`${item.role}-${index}`} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${item.role === 'user' ? 'bg-cyan-500 text-polar-950' : 'bg-polar-950 border border-polar-800 text-slate-200'}`}>{item.text}</div></div>)}{loading && <div className="text-[10px] text-cyan-300 font-mono px-2">Analyzing station context...</div>}</div>
          <form onSubmit={ask} className="p-3 border-t border-polar-700 flex gap-2"><input value={message} onChange={event => setMessage(event.target.value)} placeholder="Ask Command AI..." className="min-w-0 flex-1 bg-polar-950 border border-polar-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-400" /><button aria-label="Send message" disabled={loading} className="w-9 h-9 shrink-0 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 flex items-center justify-center text-polar-950"><Send className="w-4 h-4" /></button></form>
        </div>
      )}
      <button onClick={() => setOpen(value => !value)} aria-label={open ? 'Close Command AI' : 'Open Command AI'} title="Command AI" className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${open ? 'bg-polar-800 border border-cyan-400/50 text-cyan-300 rotate-90' : 'bg-cyan-500 hover:bg-cyan-400 text-polar-950 shadow-cyan-500/30'}`}>
        <Bot className="w-6 h-6" />
        {!open && <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-polar-950" />}
      </button>
    </div>
  );
}
