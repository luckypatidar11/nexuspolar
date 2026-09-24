import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Search, 
  Sparkles, 
  Terminal, 
  ArrowRight,
  Bot,
  User,
  Radio
} from 'lucide-react';

export default function VoiceAssistant({ onNavigateTab }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognitionLanguage, setRecognitionLanguage] = useState(navigator.language || 'en-IN');
  const [conversation, setConversation] = useState([
    {
      sender: 'assistant',
      text: 'NexusPole Polar Voice Interface active. You can speak commands like: "Check fuel status at Bharati", "Inspect PistenBully health", "Check in field personnel", or click one of the quick command prompts below.'
    }
  ]);

  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Web Speech API is not natively supported in this browser. Please use the interactive query bar or prompt buttons below.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = recognitionLanguage;
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      processCommand(text);
    };
    recognition.onend = () => setIsListening(false);

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const processCommand = (query) => {
    const q = query.toLowerCase();
    let reply = '';
    let actionTab = null;

    if (q.includes('fuel') || q.includes('autonomy') || q.includes('diesel')) {
      reply = 'Bharati Station fuel reserve is 142,000 Liters (ATF-50). Current burn rate is 680 L/day. Station autonomy is approximately 114 days. Navigating to Inventory.';
      actionTab = 'inventory';
    } else if (q.includes('pistenbully') || q.includes('asset') || q.includes('snowcat') || q.includes('generator')) {
      reply = 'PistenBully 300 Tiger 1 is operational with Field Team Alpha (Waypoint 4). Generator Gen-A has a predictive vibration alert (0.68G) with service due in 20 hours. Opening Asset Manager.';
      actionTab = 'assets';
    } else if (q.includes('check in') || q.includes('muster') || q.includes('personnel') || q.includes('team')) {
      reply = 'Station roster verified. 24 crew accounted for. Next universal muster is scheduled in 1 hour 14 minutes. Opening Personnel Safety.';
      actionTab = 'personnel';
    } else if (q.includes('blizzard') || q.includes('weather') || q.includes('emergency') || q.includes('sos')) {
      reply = 'Category 3 Polar Blizzard watch in effect at Larsemann Hills. Wind sustained at 38 knots, temperature -28.4°C (Feels like -41°C). Displaying Emergency Orchestrator.';
      actionTab = 'emergency';
    } else if (q.includes('plan') || q.includes('expedition') || q.includes('calorie')) {
      reply = 'AI Expedition Planner ready. Benchmark caloric requirement is 4,000 to 4,500 kcal/day/person in sub-zero terrain. Navigating to AI Planner.';
      actionTab = 'planner';
    } else if (q.includes('cargo') || q.includes('packing') || q.includes('container') || q.includes('qr')) {
      reply = 'Cargo load optimizer reports 2 ISO 20ft polar containers packed at 84% weight capacity. Opening Cargo & 3D Packing.';
      actionTab = 'cargo';
    } else {
      reply = `Understood: "${query}". Processing against NCPOR Polar Knowledge Base and station telemetry log. All systems currently operational.`;
    }

    setConversation(prev => [
      ...prev,
      { sender: 'user', text: query },
      { sender: 'assistant', text: reply }
    ]);

    if (actionTab && onNavigateTab) {
      setTimeout(() => onNavigateTab(actionTab), 2200);
    }
  };

  const samplePrompts = [
    "Check fuel autonomy at Bharati",
    "Inspect PistenBully health and Genset vibration",
    "Record field check-in for Team Alpha",
    "What is the blizzard alert level?",
    "Show smart container packing distribution"
  ];

  const languageOptions = [
    ['en-IN', 'English (India)'],
    ['hi-IN', 'Hindi'],
    ['bn-IN', 'Bengali'],
    ['mr-IN', 'Marathi'],
    ['ta-IN', 'Tamil'],
    ['te-IN', 'Telugu'],
    ['ml-IN', 'Malayalam'],
    ['en-US', 'English (US)'],
    ['fr-FR', 'French'],
    ['de-DE', 'German'],
    ['es-ES', 'Spanish'],
    ['ru-RU', 'Russian'],
    ['ar-SA', 'Arabic'],
    ['zh-CN', 'Chinese'],
    ['ja-JP', 'Japanese']
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="frost-panel p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-polar-900 to-polar-900 border-emerald-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Mic className="w-4 h-4 text-emerald-400" />
              PRD 7.14 Voice Command Assistant
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Polar Voice Command & Natural Language Interface
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Hands-free voice recognition designed for extreme polar field conditions when heavy arctic thermal gloves prevent manual keyboard input.
            </p>
          </div>
        </div>
      </div>

      {/* Voice Interaction Central Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Microphone & Quick Prompts */}
        <div className="frost-panel p-6 rounded-2xl flex flex-col items-center justify-between text-center space-y-5">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-slate-400">ACOUSTIC SENSOR</span>
            <h3 className="text-base font-bold text-white">Voice Command Transceiver</h3>
          </div>

          {/* Big Mic Button */}
          <div className="relative">
            {isListening && (
              <span className="animate-ping absolute inset-0 rounded-full bg-cyan-400 opacity-60" />
            )}
            <button
              onClick={toggleMic}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                isListening 
                  ? 'bg-red-500 text-white scale-110 shadow-red-500/50' 
                  : 'bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-polar-950 shadow-cyan-500/30'
              }`}
            >
              {isListening ? (
                <MicOff className="w-10 h-10 animate-pulse" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            {isListening ? 'Listening... speak your command now' : 'Click to capture voice input'}
          </p>

          <label className="w-full text-left">
            <span className="text-[10px] font-mono uppercase text-slate-400">Voice input language</span>
            <select
              value={recognitionLanguage}
              onChange={(event) => setRecognitionLanguage(event.target.value)}
              disabled={isListening}
              className="mt-1.5 w-full bg-polar-950 border border-polar-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 disabled:opacity-60"
            >
              {languageOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          {/* Quick Voice Prompts */}
          <div className="w-full text-left pt-3 border-t border-polar-800 space-y-2">
            <div className="text-[10px] font-mono uppercase text-slate-400">
              Preset Hands-Free Field Queries:
            </div>
            <div className="space-y-1.5">
              {samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTranscript(prompt);
                    processCommand(prompt);
                  }}
                  className="w-full text-left p-2 rounded-lg bg-polar-950 hover:bg-polar-800 text-xs text-slate-300 hover:text-cyan-300 border border-polar-800/80 transition flex items-center justify-between group"
                >
                  <span className="truncate">"{prompt}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Speech Transcript & Conversation Stream */}
        <div className="lg:col-span-2 frost-panel p-5 rounded-2xl flex flex-col justify-between min-h-[440px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-polar-800 pb-3">
              <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Speech Synthesis Terminal Stream
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                VOICE PIPELINE READY
              </span>
            </div>

            {/* Conversation Log */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {conversation.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-cyan-600 text-polar-950 font-medium rounded-tr-none' 
                      : 'bg-polar-950 border border-polar-800 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Text Command Input Fallback */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (transcript.trim()) {
                processCommand(transcript);
                setTranscript('');
              }
            }}
            className="flex gap-2 mt-4 pt-3 border-t border-polar-800"
          >
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Or type your operational command here..."
              className="flex-1 bg-polar-950 border border-polar-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-polar-950 font-bold px-4 py-2 rounded-xl text-xs transition"
            >
              Execute
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
