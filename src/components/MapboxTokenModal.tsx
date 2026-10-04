import React, { useState } from 'react';
import { getMapboxToken, setMapboxToken } from '../utils/mapboxToken';
import { ShieldAlert, Key, Globe, ArrowRight, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onTokenSaved: () => void;
  onClose?: () => void;
}

export const MapboxTokenModal: React.FC<Props> = ({ isOpen, onTokenSaved, onClose }) => {
  const [tokenInput, setTokenInput] = useState(getMapboxToken() || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tokenInput.trim();
    if (!trimmed.startsWith('pk.')) {
      setError('Invalid token format. Mapbox public access tokens start with "pk."');
      return;
    }
    setMapboxToken(trimmed);
    setError('');
    onTokenSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="glass-panel-active rounded-3xl p-6 w-full max-w-lg border border-amber-500/40 shadow-2xl text-left select-none">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-4">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-tech tracking-wide uppercase">
              REAL MAP DATA UNAVAILABLE
            </h3>
            <span className="text-[11px] text-amber-300 font-mono">
              Mapbox Access Token Required
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          TERRA has transitioned from procedural city generators to <strong>genuine geographic data</strong>.
          Mapbox GL JS requires an access token to stream real 3D building heights, real terrain elevation, global globe projections, and GPS geocoding.
        </p>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1">
              Mapbox Public Access Token (pk.eyJ...)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value);
                  setError('');
                }}
                placeholder="pk.eyJ1Ijo..."
                className="w-full bg-slate-900/90 border border-white/15 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none font-mono"
              />
            </div>
            {error && <span className="text-[11px] text-rose-400 mt-1 block">{error}</span>}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400">
            <span className="text-slate-300 font-medium block mb-0.5">Configuration Options:</span>
            <span>1. Paste your token above, or</span><br />
            <span>2. Set <code className="text-cyan-300 font-mono">VITE_MAPBOX_ACCESS_TOKEN</code> in your environment / Secrets panel.</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Get free Mapbox token</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/25"
            >
              <span>Connect Real World Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
