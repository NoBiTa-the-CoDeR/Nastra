import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  AlertTriangle,
  X,
  MapPin,
  Scale,
  Radar,
  CheckCircle,
  Truck,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Navigation
} from 'lucide-react';

export const HotspotDrawer: React.FC = () => {
  const selectedHotspot = useAppStore(s => s.selectedHotspot);
  const selectHotspot = useAppStore(s => s.selectHotspot);
  const [dispatched, setDispatched] = useState(false);

  if (!selectedHotspot) return null;

  const handleDispatch = () => {
    setDispatched(true);
    setTimeout(() => {
      setDispatched(false);
      selectHotspot(null);
    }, 2000);
  };

  const getSeverityBadge = (severity: string) => {
    if (severity === 'high') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/25 text-rose-400 border border-rose-500/50">HIGH SEVERITY</span>;
    }
    if (severity === 'medium') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/25 text-orange-400 border border-orange-500/50">MEDIUM SEVERITY</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/25 text-amber-400 border border-amber-500/50">LOW SEVERITY</span>;
  };

  return (
    <div className="fixed bottom-24 right-8 z-40 pointer-events-none select-none animate-in fade-in slide-in-from-bottom-3 duration-250">
      <div className="glass-panel-active rounded-2xl p-4 w-80 pointer-events-auto border border-cyan-400/50 shadow-2xl backdrop-blur-2xl bg-black/75">
        {/* Spatial Anchored Header */}
        <div className="flex items-start justify-between pb-2 border-b border-white/10 mb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">
                WASTE HOTSPOT
              </span>
              {getSeverityBadge(selectedHotspot.severity)}
            </div>
            <h4 className="text-sm font-bold text-white font-tech mt-0.5 leading-snug">
              {selectedHotspot.title}
            </h4>
          </div>
          <button
            onClick={() => selectHotspot(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Spatial Telemetry Details */}
        <div className="space-y-2 mb-3 text-xs">
          <div className="flex items-center justify-between py-1 px-2 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[10px] text-slate-400 font-mono">ESTIMATED VOLUME</span>
            <span className="text-xs font-tech font-bold text-white">
              {(selectedHotspot.volumeEst / 1000).toFixed(1)} Metric Tons
            </span>
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[10px] text-slate-400 font-mono">CLASSIFICATION</span>
            <span className="text-xs font-semibold text-amber-300">
              {selectedHotspot.wasteType}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Navigation className="w-3 h-3 text-cyan-400" />
              PROXIMITY
            </span>
            <span className="text-xs font-mono text-cyan-300 font-semibold">
              420m to Circular Hub
            </span>
          </div>

          <div className="py-1.5 px-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[10.5px] text-slate-300">
            <span className="text-[9px] font-mono text-cyan-400 block uppercase font-bold mb-0.5">
              MITIGATION PROTOCOL:
            </span>
            {selectedHotspot.recommendation}
          </div>
        </div>

        {/* Dispatch Action Button */}
        <button
          onClick={handleDispatch}
          disabled={dispatched}
          className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg ${
            dispatched
              ? 'bg-emerald-600 text-white'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
          }`}
        >
          {dispatched ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Response Unit Dispatched</span>
            </>
          ) : (
            <>
              <Truck className="w-3.5 h-3.5" />
              <span>Dispatch Cleanup Response</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
