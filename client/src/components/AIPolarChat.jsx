import React, { useState } from 'react';
import { Bot, Send, ShieldAlert, Sparkles, UserRound } from 'lucide-react';

export default function AIPolarChat({ stations, selectedStation }) {
  const station = stations.find(item => item.id === selectedStation) || stations[0] || {};
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'NexusPole AI is ready. Ask about weather, inventory, readiness, logistics, or safety decisions.' }]);

  const ask = async (event) => {
    event.preventDefault();
    if (!message.trim() || loading) return;
    const question = message.trim();
    setMessage('');
    setMessages(previous => [...previous, { role: 'user', text: question }]);
    setLoading(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, context: { stationId: station.id, station: station.name, weather: station.weather } })
      });
      const data = await response.json();
      setMessages(previous => [...previous, { role: 'assistant', text: response.ok ? data.reply : data.error }]);
    } catch {
      setMessages(previous => [...previous, { role: 'assistant', text: 'AI service could not be reached. Check the server connection and Gemini configuration.' }]);
    } finally {
      setLoading(false);
    }
  };

  return <div className="space-y-6">
    <div className="frost-panel p-5 rounded-2xl border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-polar-900 to-polar-900"><div className="flex items-center gap-2 text-cyan-300 font-mono text-xs uppercase tracking-wider mb-2"><Sparkles className="w-4 h-4" /> Gemini-powered polar operations assistant</div><h1 className="text-2xl font-bold text-white">Ask Command AI</h1><p className="text-sm text-slate-300 mt-1">Context-aware answers for {station.name || 'the selected station'}.</p></div>
    <div className="frost-panel rounded-2xl p-5"><div className="flex items-start gap-3 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 mb-4"><ShieldAlert className="w-4 h-4 shrink-0" />AI is advisory only. Confirm safety-critical decisions with the mission commander.</div><div className="space-y-3 min-h-[360px] max-h-[520px] overflow-y-auto">{messages.map((item, index) => <div key={`${item.role}-${index}`} className={`flex gap-2 ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>{item.role === 'assistant' && <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-cyan-300" /></div>}<div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${item.role === 'user' ? 'bg-cyan-500 text-polar-950' : 'bg-polar-950 border border-polar-800 text-slate-200'}`}>{item.text}</div>{item.role === 'user' && <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0"><UserRound className="w-4 h-4 text-white" /></div>}</div>)}</div><form onSubmit={ask} className="flex gap-2 mt-4 pt-4 border-t border-polar-800"><input value={message} onChange={event => setMessage(event.target.value)} placeholder="Ask: Is Bharati safe for traverse today?" className="flex-1 bg-polar-950 border border-polar-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" /><button disabled={loading} className="flex items-center gap-2 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-polar-950 font-bold text-xs"><Send className="w-4 h-4" />{loading ? 'Thinking' : 'Ask AI'}</button></form></div>
  </div>;
}