import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Wind,
  Trash2,
  Sparkles,
  Trees,
  Droplets,
  Flame,
  Volume2,
  TrendingDown,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  Activity,
  ShieldCheck,
  Radio,
  Thermometer,
  Database,
  AlertCircle
} from 'lucide-react';

export const MetricHUD: React.FC = () => {
  const currentLocation = useAppStore(s => s.currentLocation);
  const baselineMetrics = useAppStore(s => s.baselineMetrics);
  const displayedMetrics = useAppStore(s => s.displayedMetrics);
  const realAirQuality = useAppStore(s => s.realAirQuality);
  const realWeather = useAppStore(s => s.realWeather);
  const isSimulating = useAppStore(s => s.isSimulating);
  const isDataLoading = useAppStore(s => s.isDataLoading);
  const wasteHotspots = useAppStore(s => s.wasteHotspots);
  const setDataSourceModalOpen = useAppStore(s => s.setDataSourceModalOpen);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const aqi = realAirQuality?.us_aqi ?? displayedMetrics.airQuality.aqi;
  const pm25 = realAirQuality?.pm2_5 ?? displayedMetrics.airQuality.pm25;
  const temp = realWeather?.temperature_2m ?? 24;
  const appTemp = realWeather?.apparent_temperature ?? temp;
  const humidity = realWeather?.relative_humidity_2m ?? 65;
  const terraScore = displayedMetrics.terraIndex;

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (terraScore / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 75) return '#10b981'; // Emerald
    if (score >= 50) return '#06b6d4'; // Cyan
    if (score >= 35) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const scoreColor = getScoreColor(terraScore);

  return (
    <div className="absolute left-5 top-20 z-20 pointer-events-none select-none">
      <div className="glass-panel rounded-2xl p-3.5 pointer-events-auto border border-white/10 shadow-2xl backdrop-blur-2xl bg-black/65 w-84 transition-all duration-300">
        {/* City Title & WGS84 Coords */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2.5">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-white font-tech">
                {currentLocation.name}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE VIEWPORT
              </span>
            </div>
            <span className="text-[9px] text-cyan-400/80 font-mono block mt-0.5">
              WGS84 • [{currentLocation.center[0].toFixed(3)}°E, {currentLocation.center[1].toFixed(3)}°N]
            </span>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
            title={isCollapsed ? 'Expand HUD' : 'Collapse HUD'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Circular TERRA Index Radial Hero */}
        <div className="flex items-center gap-3.5 py-1 mb-2">
          <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
              <circle
                cx="44"
                cy="44"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="44"
                cy="44"
                r={radius}
                stroke={scoreColor}
                strokeWidth="4.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold font-tech text-white leading-none tracking-tight">
                {terraScore}
              </span>
              <span className="text-[9px] font-mono text-slate-400">/ 100</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              TERRA INDEX
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Prototype Composite Indicator
            </div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: scoreColor }}>
              {terraScore >= 75 ? 'Ecologically Resilient' : terraScore >= 50 ? 'Moderate Pressure' : 'High Environmental Stress'}
            </div>
            {isSimulating ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 mt-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-pulse">
                ILLUSTRATIVE PROJECTION
              </span>
            ) : (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                  {isDataLoading ? 'Sampling Viewport...' : 'OPEN-METEO / CAMS MODEL'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Environmental Telemetry Grid */}
        {!isCollapsed && (
          <div className="space-y-1.5 pt-1 border-t border-white/5 animate-in fade-in duration-200">
            {/* Real Air Quality (Open-Meteo CAMS) */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="flex items-center gap-2">
                <Wind className="w-3.5 h-3.5 text-amber-400" />
                <div>
                  <span className="text-[11px] text-slate-200 block font-medium">Air Quality (AQI)</span>
                  <span className="text-[9px] font-mono text-slate-400">
                    PM2.5: {pm25} µg/m³ • Open-Meteo / CAMS
                  </span>
                </div>
              </div>
              <div className="flex items-center font-mono text-xs font-semibold text-white">
                <span>{aqi}</span>
              </div>
            </div>

            {/* Real Weather & Regional Temperature (Open-Meteo Weather) */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="flex items-center gap-2">
                <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                <div>
                  <span className="text-[11px] text-slate-200 block font-medium">Regional Temperature</span>
                  <span className="text-[9px] font-mono text-slate-400">
                    Feels {appTemp}°C • Humidity {humidity}%
                  </span>
                </div>
              </div>
              <div className="flex items-center font-mono text-xs font-semibold text-orange-300">
                <span>{temp}°C</span>
              </div>
            </div>

            {/* Mapped Green Canopy (Mapbox / OSM) */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="flex items-center gap-2">
                <Trees className="w-3.5 h-3.5 text-emerald-400" />
                <div>
                  <span className="text-[11px] text-slate-200 block font-medium">Mapped Green Canopy</span>
                  <span className="text-[9px] font-mono text-slate-400">
                    Regional Estimate
                  </span>
                </div>
              </div>
              <div className="flex items-center font-mono text-xs font-semibold text-emerald-300">
                <span>~{displayedMetrics.greenCoverPercentage}%</span>
              </div>
            </div>

            {/* Mapped Water Hydrography */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <div>
                  <span className="text-[11px] text-slate-200 block font-medium">Waterway Health</span>
                  <span className="text-[9px] font-mono text-slate-400">
                    Quality sensor unavailable
                  </span>
                </div>
              </div>
              <div className="flex items-center font-mono text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-white/10">
                <span>NO SENSOR</span>
              </div>
            </div>

            {/* Waste Risk (Verified / Community Ground Truth) */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <div>
                  <span className="text-[11px] text-slate-200 block font-medium">Waste Hotspots</span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {wasteHotspots.length > 0 ? `${wasteHotspots.length} Verified Reports` : 'No reports in viewport'}
                  </span>
                </div>
              </div>
              <div className="flex items-center font-mono text-xs font-semibold text-rose-300">
                <span>{wasteHotspots.length} PINS</span>
              </div>
            </div>

            {/* Cleanliness (Community Modeled) */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <div>
                  <span className="text-[11px] text-slate-200 block font-medium">Cleanliness Rating</span>
                  <span className="text-[9px] font-mono text-slate-400">
                    Community Data Pending
                  </span>
                </div>
              </div>
              <div className="flex items-center font-mono text-[10px] text-teal-300">
                <span>COMMUNITY</span>
              </div>
            </div>
          </div>
        )}

        {/* Data Provenance Button */}
        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
          <button
            onClick={() => setDataSourceModalOpen(true)}
            className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/40 hover:bg-cyan-900/60 px-2 py-1 rounded-lg border border-cyan-500/30"
          >
            <Database className="w-3 h-3" />
            <span>DATA PROVENANCE & FORMULA</span>
          </button>

          <span className="text-[9px] font-mono text-slate-500">
            Open-Meteo CAMS
          </span>
        </div>
      </div>
    </div>
  );
};
