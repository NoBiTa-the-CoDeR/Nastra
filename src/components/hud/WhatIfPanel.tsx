import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Sliders,
  Trees,
  Truck,
  Recycle,
  Sparkles,
  Bus,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  X,
  Zap,
  ChevronUp,
  HelpCircle
} from 'lucide-react';

export const WhatIfPanel: React.FC = () => {
  const interventions = useAppStore(s => s.interventions);
  const baselineMetrics = useAppStore(s => s.baselineMetrics);
  const simulatedMetrics = useAppStore(s => s.simulatedMetrics);
  const isSimulating = useAppStore(s => s.isSimulating);
  const setIntervention = useAppStore(s => s.setIntervention);
  const resetInterventions = useAppStore(s => s.resetInterventions);

  const [isOpen, setIsOpen] = useState(false);

  const applyPreset = (preset: 'canopy' | 'circular' | 'transit') => {
    if (preset === 'canopy') {
      setIntervention('urbanTrees', 75);
      setIntervention('greenSpace', 65);
      setIntervention('wasteCollection', 35);
      setIntervention('recycling', 30);
      setIntervention('publicTransport', 40);
    } else if (preset === 'circular') {
      setIntervention('wasteCollection', 90);
      setIntervention('recycling', 85);
      setIntervention('urbanTrees', 35);
      setIntervention('greenSpace', 30);
      setIntervention('publicTransport', 35);
    } else {
      setIntervention('publicTransport', 85);
      setIntervention('urbanTrees', 55);
      setIntervention('greenSpace', 45);
      setIntervention('wasteCollection', 60);
      setIntervention('recycling', 55);
    }
  };

  const currentScore = baselineMetrics.terraIndex;
  const simScore = simulatedMetrics.terraIndex;
  const scoreDiff = simScore - currentScore;

  return (
    <div className="fixed bottom-6 inset-x-0 z-30 flex justify-center pointer-events-none px-4 select-none">
      {/* Minimized Spatial Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`pointer-events-auto px-5 py-2.5 rounded-full flex items-center gap-2.5 text-xs font-semibold tracking-wide transition-all shadow-2xl backdrop-blur-2xl border hover:scale-105 ${
            isSimulating
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400/50 shadow-cyan-950/40 animate-pulse'
              : 'bg-black/60 text-white border-white/15 hover:border-cyan-400/50 hover:bg-black/80'
          }`}
        >
          <div className="p-1 rounded-full bg-cyan-500/20 text-cyan-400">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <span className="font-tech text-sm">WHAT IF?</span>
          <span className="text-slate-400 font-sans hidden sm:inline">"How could this place change?"</span>
          {isSimulating && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/40">
              +{scoreDiff} INDEX
            </span>
          )}
        </button>
      )}

      {/* Expanded Floating Simulation Dock */}
      {isOpen && (
        <div className="pointer-events-auto glass-panel-active rounded-3xl p-4 w-full max-w-2xl border border-cyan-400/30 shadow-2xl backdrop-blur-2xl bg-black/65 animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white tracking-wide block font-tech">
                  "How could this place change?"
                </span>
                <span className="text-[10px] text-cyan-400/80 font-mono">
                  Live 3D Intervention Modeling & Ecosystem Response
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isSimulating && (
                <button
                  onClick={resetInterventions}
                  className="px-2 py-1 rounded-lg text-[10.5px] text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Intervention Scenarios */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex-shrink-0">Presets:</span>
            <button
              onClick={() => applyPreset('canopy')}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[10.5px] font-medium flex items-center gap-1 transition-all flex-shrink-0"
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>Net-Zero Canopy</span>
            </button>
            <button
              onClick={() => applyPreset('circular')}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-[10.5px] font-medium flex items-center gap-1 transition-all flex-shrink-0"
            >
              <Recycle className="w-3 h-3 text-cyan-400" />
              <span>Zero-Waste Grid</span>
            </button>
            <button
              onClick={() => applyPreset('transit')}
              className="px-2.5 py-1 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 text-blue-300 text-[10.5px] font-medium flex items-center gap-1 transition-all flex-shrink-0"
            >
              <Bus className="w-3 h-3 text-blue-400" />
              <span>Clean Transit</span>
            </button>
          </div>

          {/* 5 Interventions in Compact 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 mb-3">
            {/* Urban Trees */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center gap-1.5 font-medium text-[11px]">
                  <Trees className="w-3.5 h-3.5 text-emerald-400" />
                  Urban Trees
                </span>
                <span className="font-mono text-emerald-400 text-xs font-semibold">
                  +{interventions.urbanTrees}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={interventions.urbanTrees}
                onChange={(e) => setIntervention('urbanTrees', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Waste Collection */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center gap-1.5 font-medium text-[11px]">
                  <Truck className="w-3.5 h-3.5 text-rose-400" />
                  Waste Collection
                </span>
                <span className="font-mono text-rose-400 text-xs font-semibold">
                  +{interventions.wasteCollection}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={interventions.wasteCollection}
                onChange={(e) => setIntervention('wasteCollection', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
            </div>

            {/* Recycling */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center gap-1.5 font-medium text-[11px]">
                  <Recycle className="w-3.5 h-3.5 text-cyan-400" />
                  Recycling Rate
                </span>
                <span className="font-mono text-cyan-400 text-xs font-semibold">
                  +{interventions.recycling}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={interventions.recycling}
                onChange={(e) => setIntervention('recycling', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Green Space */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center gap-1.5 font-medium text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  Green Space & Parks
                </span>
                <span className="font-mono text-teal-400 text-xs font-semibold">
                  +{interventions.greenSpace}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={interventions.greenSpace}
                onChange={(e) => setIntervention('greenSpace', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            {/* Public Transport */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center gap-1.5 font-medium text-[11px]">
                  <Bus className="w-3.5 h-3.5 text-blue-400" />
                  Public Transport Modernization
                </span>
                <span className="font-mono text-blue-400 text-xs font-semibold">
                  +{interventions.publicTransport}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={interventions.publicTransport}
                onChange={(e) => setIntervention('publicTransport', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
              />
            </div>
          </div>

          {/* Outcome Comparison Hero: CURRENT [67] vs SIMULATED [82] */}
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-slate-950/80 via-cyan-950/40 to-slate-950/80 border border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-center px-3 py-1 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[9px] font-mono text-slate-400 block uppercase">CURRENT</span>
                <span className="text-lg font-tech font-bold text-slate-300">{currentScore}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div className="text-center px-3 py-1 rounded-xl bg-emerald-950/50 border border-emerald-500/40">
                <span className="text-[9px] font-mono text-emerald-400 block uppercase font-bold">SIMULATED</span>
                <span className="text-lg font-tech font-bold text-emerald-300">{simScore}</span>
              </div>
            </div>

            <div className="text-right text-[11px] font-mono">
              <span className="text-slate-400 block text-[9.5px]">PROJECTED OUTCOME</span>
              <span className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                <TrendingUp className="w-3 h-3" />
                +{scoreDiff} Environmental Health Score
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
