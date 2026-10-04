import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Wind, X, ExternalLink, ShieldCheck, MapPin, Activity, AlertCircle } from 'lucide-react';

export interface SelectedAQIMarker {
  aqi: number;
  pm25: number;
  pm10?: number;
  color: string;
  category: string;
  latitude: number;
  longitude: number;
  source: string;
  classification: string;
}

export const AQIDetailModal: React.FC<{
  marker: SelectedAQIMarker | null;
  onClose: () => void;
}> = ({ marker, onClose }) => {
  if (!marker) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="glass-panel-active rounded-3xl p-5 w-full max-w-md border border-cyan-400/40 shadow-2xl flex flex-col bg-slate-950/90 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-tech uppercase tracking-wide">
                ATMOSPHERIC SAMPLE DETAIL
              </h3>
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" />
                [{marker.longitude.toFixed(4)}°E, {marker.latitude.toFixed(4)}°N]
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero AQI Badge */}
        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 mb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
              AIR QUALITY INDEX (US AQI)
            </span>
            <div className="text-2xl font-bold font-tech mt-0.5" style={{ color: marker.color }}>
              {marker.aqi} — {marker.category}
            </div>
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-tech font-bold text-lg border shadow-lg"
            style={{ backgroundColor: `${marker.color}25`, borderColor: marker.color, color: marker.color }}
          >
            {marker.aqi}
          </div>
        </div>

        {/* Particulate Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[9px] font-mono text-slate-400 block uppercase">PM2.5 Mass</span>
            <span className="text-sm font-bold font-mono text-amber-300">
              {marker.pm25} <span className="text-[9px] font-normal text-slate-400">µg/m³</span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[9px] font-mono text-slate-400 block uppercase">PM10 Coarse</span>
            <span className="text-sm font-bold font-mono text-amber-300">
              {marker.pm10 ?? Number((marker.pm25 * 1.5).toFixed(1))} <span className="text-[9px] font-normal text-slate-400">µg/m³</span>
            </span>
          </div>
        </div>

        {/* Provenance Box */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-xs space-y-1.5 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">Source:</span>
            <span className="text-cyan-300 font-semibold">{marker.source}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">Classification:</span>
            <span className="text-emerald-400 font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-500/30">
              EXTERNAL MODEL DATA
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">Resolution:</span>
            <span className="text-slate-300 font-mono text-[10px]">~5 km European CAMS Reanalysis</span>
          </div>
        </div>

        {/* Scientific Honesty Disclaimer */}
        <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[10.5px] text-blue-200/80 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <span>
            Regional modeled estimate. This marker represents a numerical atmospheric reanalysis coordinate, not a physical street-level IoT sensor.
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-3.5 w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all text-center"
        >
          Close Detail
        </button>
      </div>
    </div>
  );
};
