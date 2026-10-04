import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { DataService } from '../../api/dataService';
import { Location } from '../../types';
import {
  Search,
  Globe2,
  Building2,
  Radar,
  Play,
  Sparkles,
  Bot,
  MapPin,
  Compass,
  Sliders
} from 'lucide-react';

export const TopNav: React.FC = () => {
  const currentLocation = useAppStore(s => s.currentLocation);
  const cameraMode = useAppStore(s => s.cameraMode);
  const isFlying = useAppStore(s => s.isFlying);
  const isScanning = useAppStore(s => s.isScanning);
  const isDemoActive = useAppStore(s => s.isDemoActive);

  const flyToLocation = useAppStore(s => s.flyToLocation);
  const setCameraMode = useAppStore(s => s.setCameraMode);
  const triggerScan = useAppStore(s => s.triggerScan);
  const startDemo = useAppStore(s => s.startDemo);
  const stopDemo = useAppStore(s => s.stopDemo);
  const setAiCopilotOpen = useAppStore(s => s.setAiCopilotOpen);
  const setAiVisionOpen = useAppStore(s => s.setAiVisionOpen);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const fetchMatches = async () => {
      if (query.trim().length > 0) {
        const results = await DataService.searchLocations(query);
        if (active) {
          setSearchResults(results);
          setIsSearchOpen(true);
        }
      } else {
        const all = await DataService.getLocations();
        if (active) setSearchResults(all);
      }
    };
    fetchMatches();
    return () => { active = false; };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (city: Location) => {
    setQuery('');
    setIsSearchOpen(false);
    flyToLocation(city);
  };

  return (
    <header className="absolute top-4 inset-x-5 z-30 flex items-center justify-between pointer-events-none select-none">
      {/* Brand & Active Twin Pill */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        <div className="glass-panel px-3.5 py-1.5 rounded-2xl flex items-center gap-2.5 border border-white/10 shadow-2xl backdrop-blur-2xl bg-black/45">
          <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-500/25 to-blue-600/35 border border-cyan-400/40">
            <span className="font-tech text-cyan-400 font-bold text-sm tracking-wider">T</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-tech text-sm font-bold text-white tracking-widest">TERRA</span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                Digital Twin
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Switcher: 3D City vs Globe */}
        <div className="glass-panel p-1 rounded-2xl flex items-center gap-1 border border-white/10 backdrop-blur-2xl bg-black/45">
          <button
            onClick={() => setCameraMode('global')}
            className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              cameraMode === 'global'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Globe</span>
          </button>
          <button
            onClick={() => setCameraMode('city')}
            className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              cameraMode === 'city'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D City</span>
          </button>
        </div>
      </div>

      {/* Center: Search City Capsule */}
      <div ref={searchRef} className="relative w-64 md:w-80 pointer-events-auto">
        <div className="glass-panel rounded-2xl flex items-center px-3 py-1.5 border border-white/10 focus-within:border-cyan-400/60 transition-all shadow-2xl backdrop-blur-2xl bg-black/45">
          <Search className="w-3.5 h-3.5 text-cyan-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchResults.length > 0) {
                handleSelectCity(searchResults[0]);
              }
            }}
            placeholder={`Search location (Bengaluru, Delhi, Paris, Tokyo)...`}
            className="w-full bg-transparent text-xs text-white placeholder-slate-400 outline-none font-sans"
          />
          {isFlying && (
            <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono animate-pulse">
              <span>Flying...</span>
            </div>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {isSearchOpen && searchResults.length > 0 && (
          <div className="absolute top-full mt-2 w-full glass-panel rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl py-1 z-50 backdrop-blur-2xl bg-black/85">
            <div className="px-3 py-1 text-[9px] font-mono text-cyan-400/80 uppercase tracking-wider border-b border-white/5 flex justify-between">
              <span>Geospatial Twin Nodes</span>
              <span>Coordinates</span>
            </div>
            <div className="max-h-56 overflow-y-auto">
              {searchResults.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelectCity(loc)}
                  className="w-full px-3 py-2 text-left hover:bg-cyan-500/15 flex items-center justify-between transition-colors border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <div>
                      <div className="text-xs font-medium text-white">{loc.name}</div>
                      <div className="text-[10px] text-slate-400">{loc.country}</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {loc.center[1].toFixed(2)}°N, {loc.center[0].toFixed(2)}°E
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Controls: LiDAR Scan, ENTER DEMO, AI */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={triggerScan}
          disabled={isScanning}
          title="Trigger 3D LiDAR Environmental Scan"
          className={`glass-panel px-3 py-1.5 rounded-2xl text-xs font-medium flex items-center gap-1.5 border transition-all backdrop-blur-2xl bg-black/45 ${
            isScanning
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/60 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
              : 'border-white/10 text-slate-300 hover:border-cyan-500/40 hover:text-white'
          }`}
        >
          <Radar className={`w-3.5 h-3.5 text-cyan-400 ${isScanning ? 'animate-spin' : ''}`} />
          <span className="hidden lg:inline">{isScanning ? 'Scanning...' : 'Scan Twin'}</span>
        </button>

        {/* ENTER DEMO MODE */}
        <button
          onClick={isDemoActive ? stopDemo : startDemo}
          className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xl ${
            isDemoActive
              ? 'bg-rose-600/80 hover:bg-rose-500 text-white border border-rose-400 shadow-rose-950/40 animate-pulse'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/50 shadow-emerald-950/30'
          }`}
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{isDemoActive ? 'EXIT DEMO' : 'ENTER DEMO'}</span>
        </button>

        {/* AI Copilot & Vision */}
        <button
          onClick={() => setAiCopilotOpen(true)}
          className="glass-panel p-2 rounded-2xl text-slate-300 hover:text-white border border-white/10 hover:border-indigo-400/50 flex items-center justify-center transition-all backdrop-blur-2xl bg-black/45"
          title="AI Environmental Copilot"
        >
          <Bot className="w-4 h-4 text-indigo-400" />
        </button>

        <button
          onClick={() => setAiVisionOpen(true)}
          className="glass-panel p-2 rounded-2xl text-slate-300 hover:text-white border border-white/10 hover:border-purple-400/50 flex items-center justify-center transition-all backdrop-blur-2xl bg-black/45"
          title="AI Environmental Vision Generator (1K, 2K, 4K)"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
        </button>
      </div>
    </header>
  );
};
