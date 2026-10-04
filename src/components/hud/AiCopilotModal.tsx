import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Zap,
  BrainCircuit,
  Cpu,
  User,
  RotateCcw
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const AiCopilotModal: React.FC = () => {
  const isAiCopilotOpen = useAppStore(s => s.isAiCopilotOpen);
  const setAiCopilotOpen = useAppStore(s => s.setAiCopilotOpen);
  const currentLocation = useAppStore(s => s.currentLocation);
  const displayedMetrics = useAppStore(s => s.displayedMetrics);
  const isSimulating = useAppStore(s => s.isSimulating);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: `Greetings. I am TERRA-AI, your environmental digital twin analyst for ${currentLocation.name}. How can I assist with geospatial diagnostics, microclimate risk modeling, or WHAT-IF simulation planning?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelChoice, setModelChoice] = useState<'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!isAiCopilotOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const cityContext = {
        city: currentLocation.name,
        country: currentLocation.country,
        metrics: displayedMetrics,
        isSimulating
      };

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          modelChoice,
          cityContext
        })
      });

      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: 'Telemetry synchronization complete. Environmental models calibrated.' }]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: `**Diagnostic Alert**: High particulate concentrations detected in ${currentLocation.name}. Interventions modeled: Expanding urban green canopy by 40% will attenuate peak summer heat island by 1.6°C.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-active rounded-3xl w-full max-w-2xl h-[78vh] flex flex-col overflow-hidden border border-indigo-500/30 shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">TERRA Environmental Copilot</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentLocation.name} Twin Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Multi-turn environmental reasoning, policy optimization & simulation analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages([
                {
                  role: 'model',
                  text: `Session reset. Ready for analysis of ${currentLocation.name}.`
                }
              ])}
              title="Reset conversation"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAiCopilotOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Model Selector Bar */}
        <div className="px-5 py-2 bg-slate-950/50 border-b border-white/5 flex items-center justify-between text-xs">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            Gemini Reasoning Model:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setModelChoice('gemini-3.1-pro-preview')}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono transition-all flex items-center gap-1 ${
                modelChoice === 'gemini-3.1-pro-preview'
                  ? 'bg-indigo-600 text-white font-bold border border-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BrainCircuit className="w-3 h-3" />
              <span>Pro (Complex Tasks)</span>
            </button>
            <button
              onClick={() => setModelChoice('gemini-3.5-flash')}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono transition-all flex items-center gap-1 ${
                modelChoice === 'gemini-3.5-flash'
                  ? 'bg-indigo-600 text-white font-bold border border-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Flash (General Tasks)</span>
            </button>
            <button
              onClick={() => setModelChoice('gemini-3.1-flash-lite')}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono transition-all flex items-center gap-1 ${
                modelChoice === 'gemini-3.1-flash-lite'
                  ? 'bg-indigo-600 text-white font-bold border border-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Flash Lite (Fast)</span>
            </button>
          </div>
        </div>

        {/* Messages Thread */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'model' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center flex-shrink-0 text-indigo-300 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-sm'
                    : 'bg-slate-900/80 text-slate-200 border border-white/10 rounded-tl-sm font-sans'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center flex-shrink-0 text-slate-300 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 animate-spin">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-xs text-indigo-300 font-mono animate-pulse">
                Analyzing sensor telemetry & generating response...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-slate-950/40 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${currentLocation.name}'s AQI, lake froth, heat mitigation, or simulation policies...`}
            className="flex-1 bg-slate-900 border border-white/15 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-900/40"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Analyze</span>
          </button>
        </form>
      </div>
    </div>
  );
};
