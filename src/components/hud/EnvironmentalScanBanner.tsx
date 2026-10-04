import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Radar,
  Wind,
  Trash2,
  Trees,
  Droplets,
  Flame,
  CheckCircle2
} from 'lucide-react';

export const EnvironmentalScanBanner: React.FC = () => {
  const isScanning = useAppStore(s => s.isScanning);
  const currentLocation = useAppStore(s => s.currentLocation);
  const displayedMetrics = useAppStore(s => s.displayedMetrics);

  const [activeStep, setActiveStep] = useState(0);

  const scanSteps = [
    { name: 'AIR QUALITY DYNAMICS', icon: <Wind className="w-3.5 h-3.5 text-amber-400" /> },
    { name: 'WASTE HOTSPOTS', icon: <Trash2 className="w-3.5 h-3.5 text-rose-400" /> },
    { name: 'CANOPY DENSITY', icon: <Trees className="w-3.5 h-3.5 text-emerald-400" /> },
    { name: 'WATER SYSTEM HEALTH', icon: <Droplets className="w-3.5 h-3.5 text-blue-400" /> },
    { name: 'THERMAL HEAT ISLAND', icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> }
  ];

  useEffect(() => {
    if (!isScanning) {
      setActiveStep(0);
      return;
    }

    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev < scanSteps.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isScanning]);

  if (!isScanning) return null;

  return (
    <div className="fixed top-20 inset-x-0 z-40 flex justify-center pointer-events-none px-4 select-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="glass-panel-active rounded-2xl px-5 py-3 border border-cyan-400/50 shadow-2xl backdrop-blur-2xl bg-black/75 flex items-center gap-4">
        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40">
          <Radar className="w-5 h-5 animate-spin" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-tech">
              Scanning Environment • {currentLocation.name}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
              LiDAR Calibrating
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            {scanSteps.map((step, idx) => {
              const isDone = idx < activeStep;
              const isCurrent = idx === activeStep;

              return (
                <div
                  key={step.name}
                  className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded transition-all ${
                    isDone
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      : isCurrent
                      ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-400 animate-pulse'
                      : 'bg-black/30 text-slate-500 border border-white/5'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> : step.icon}
                  <span className="hidden md:inline">{step.name.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {activeStep >= scanSteps.length && (
          <div className="border-l border-white/10 pl-3 text-right">
            <span className="text-[9px] font-mono text-slate-400 block uppercase">TERRA INDEX</span>
            <span className="text-base font-tech font-bold text-cyan-300">
              {displayedMetrics.terraIndex} / 100
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
