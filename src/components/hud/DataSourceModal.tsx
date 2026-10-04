import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Database,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Radio,
  Layers,
  Thermometer,
  Wind,
  Trees,
  Droplets,
  Trash2
} from 'lucide-react';

export const DataSourceModal: React.FC = () => {
  const isDataSourceModalOpen = useAppStore(s => s.isDataSourceModalOpen);
  const setDataSourceModalOpen = useAppStore(s => s.setDataSourceModalOpen);
  const dataStatuses = useAppStore(s => s.dataStatuses);
  const currentLocation = useAppStore(s => s.currentLocation);
  const realAirQuality = useAppStore(s => s.realAirQuality);
  const realWeather = useAppStore(s => s.realWeather);

  if (!isDataSourceModalOpen) return null;

  const getBadge = (type: string) => {
    switch (type) {
      case 'REAL_MODEL_DATA':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            REAL MODEL DATA
          </span>
        );
      case 'REAL_MAPPED_DATA':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            REAL MAPPED VECTORS
          </span>
        );
      case 'COMMUNITY_DATA':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            COMMUNITY / DEMO
          </span>
        );
      case 'MODELED_DATA':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            MODELED ESTIMATE
          </span>
        );
      case 'UNAVAILABLE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-white/10 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-slate-500" />
            UNAVAILABLE (DEMO)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="glass-panel-active rounded-3xl p-5 w-full max-w-2xl border border-cyan-400/40 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-tech uppercase tracking-wider">
                  DATA PROVENANCE & API TRANSPARENCY
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  {currentLocation.name}
                </span>
              </div>
              <span className="text-[10.5px] text-slate-400 font-mono">
                Real GPS Coordinates: [{currentLocation.center[0].toFixed(4)}°E, {currentLocation.center[1].toFixed(4)}°N]
              </span>
            </div>
          </div>

          <button
            onClick={() => setDataSourceModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Network Status Banner */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 mb-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <span className="text-white font-medium block">
                Open-Meteo Air Quality & Weather API Active
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Live endpoint: https://air-quality-api.open-meteo.com/v1/air-quality
              </span>
            </div>
          </div>
          {realAirQuality && (
            <div className="text-right font-mono text-[10.5px]">
              <span className="text-cyan-300 block font-bold">AQI: {realAirQuality.us_aqi}</span>
              <span className="text-slate-400">{realWeather?.temperature_2m ?? 24}°C</span>
            </div>
          )}
        </div>

        {/* Scrollable Metric Provenance List */}
        <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
          {/* Formula Card */}
          <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs">
            <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5 font-tech uppercase tracking-wide text-xs">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>TERRA Index Prototype Composite Formula</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Calculated exclusively from verified active atmospheric & weather model data:
              <br />
              <code className="text-cyan-300 font-mono text-[10.5px]">TERRA Score = (AQI Score × 0.65) + (Temperature Comfort Score × 0.35)</code>
              <br />
              <span className="text-[10px] text-slate-400">
                Unavailable sensor domains (e.g. water biochemistry) are omitted from scoring to avoid false representation.
              </span>
            </p>
          </div>

          {dataStatuses.map((st, i) => (
            <div
              key={st.name}
              className="p-3 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-all text-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-white tracking-wide text-xs">
                  {st.name}
                </span>
                {getBadge(st.type)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div>
                  <span className="text-[9.5px] font-mono text-slate-500 uppercase block">Source Provider:</span>
                  <span className="text-slate-200 font-medium">{st.source}</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-mono text-slate-500 uppercase block">Current Value:</span>
                  <span className="text-cyan-300 font-mono font-semibold">{st.value}</span>
                </div>
              </div>

              <div className="mt-1.5 pt-1.5 border-t border-white/5 text-[10.5px] text-slate-400">
                {st.description}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10.5px] text-slate-400">
          <span>Open-source Copernicus Atmosphere (CAMS) & Open-Meteo Integration</span>
          <a
            href="https://open-meteo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
          >
            <span>Open-Meteo Documentation</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
