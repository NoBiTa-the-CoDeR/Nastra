import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Sparkles,
  X,
  Image as ImageIcon,
  Download,
  Check,
  Maximize2,
  Cpu,
  Layers
} from 'lucide-react';

export const AiVisionGeneratorModal: React.FC = () => {
  const isAiVisionOpen = useAppStore(s => s.isAiVisionOpen);
  const setAiVisionOpen = useAppStore(s => s.setAiVisionOpen);
  const currentLocation = useAppStore(s => s.currentLocation);
  const displayedMetrics = useAppStore(s => s.displayedMetrics);

  const [prompt, setPrompt] = useState(
    `Futuristic sustainable ${currentLocation.name} in 2035 with lush sky gardens, crystal clean lakes, zero-emission magnetic transit, and azure smog-free skies.`
  );
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('2K');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '1:1' | '4:3'>('16:9');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAiVisionOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageSize,
          aspectRatio
        })
      });

      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        setErrorMsg(data.error || 'Failed to synthesize vision image.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to connect to image generation service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-active rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-purple-500/30 shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  AI Future Vision & Projection Synthesis
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  TERRA Vision Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Synthesize high-resolution photorealistic future projections of {currentLocation.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAiVisionOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <form onSubmit={handleGenerate} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Visual Projection Prompt
              </label>
              <textarea
                rows={2}
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe futuristic environmental architecture, clean waterways, restored canopy..."
                className="w-full bg-slate-900 border border-white/15 focus:border-purple-400 rounded-xl px-3.5 py-2 text-xs text-white outline-none resize-none"
              />
            </div>

            {/* Resolution Selector (1K, 2K, 4K) as required by prompt! */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Resolution / Image Size (Affordance)
                </label>
                <div className="flex items-center gap-2">
                  {(['1K', '2K', '4K'] as const).map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setImageSize(size)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                        imageSize === size
                          ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-950/40'
                          : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Aspect Ratio
                </label>
                <div className="flex items-center gap-2">
                  {(['16:9', '1:1', '4:3'] as const).map(ar => (
                    <button
                      key={ar}
                      type="button"
                      onClick={() => setAspectRatio(ar)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-medium transition-all border ${
                        aspectRatio === ar
                          ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-950/40'
                          : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center gap-2 transition-all shadow-lg shadow-purple-950/40"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? `Synthesizing ${imageSize} Image...` : `Generate ${imageSize} Vision`}</span>
              </button>
            </div>
          </form>

          {/* Result Preview Box */}
          <div className="border border-white/10 rounded-2xl p-3 bg-slate-950/60 min-h-[220px] flex items-center justify-center relative overflow-hidden">
            {loading ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-full border-2 border-purple-400 border-t-transparent animate-spin mx-auto mb-3" />
                <p className="text-xs font-tech text-purple-300 tracking-wider">
                  GENERATING {imageSize} ENVIRONMENTAL DIGITAL PROJECTION...
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Synthesizing high-resolution environmental digital twin projection
                </p>
              </div>
            ) : generatedImage ? (
              <div className="relative group w-full">
                <img
                  src={generatedImage}
                  alt="Synthesized Future Environmental Twin"
                  className="w-full rounded-xl object-cover max-h-[340px] shadow-2xl"
                />
                <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={generatedImage}
                    download={`terra-vision-${currentLocation.id}-${imageSize}.png`}
                    className="p-2 rounded-xl bg-black/70 hover:bg-black text-white border border-white/20 transition-all flex items-center gap-1.5 text-xs font-mono"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {imageSize}</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <span>Select resolution (1K, 2K, 4K) and click Generate to synthesize realistic future city projections.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
