import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SUPPORTED_LOCATIONS } from '../../api/mockData';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Square,
  Sparkles,
  CheckCircle,
  Eye,
  Sliders,
  Wind,
  Trash2,
  Users
} from 'lucide-react';

interface DemoStep {
  name: string;
  desc: string;
  duration: number; // ms
  action: () => void;
}

export const DemoController: React.FC = () => {
  const isDemoActive = useAppStore(s => s.isDemoActive);
  const stopDemo = useAppStore(s => s.stopDemo);
  const setCameraMode = useAppStore(s => s.setCameraMode);
  const flyToLocation = useAppStore(s => s.flyToLocation);
  const triggerScan = useAppStore(s => s.triggerScan);
  const toggleLayer = useAppStore(s => s.toggleLayer);
  const selectHotspot = useAppStore(s => s.selectHotspot);
  const selectReport = useAppStore(s => s.selectReport);
  const setIntervention = useAppStore(s => s.setIntervention);
  const resetInterventions = useAppStore(s => s.resetInterventions);
  const wasteHotspots = useAppStore(s => s.wasteHotspots);
  const communityReports = useAppStore(s => s.communityReports);

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const steps: DemoStep[] = [
    {
      name: '1. Global 3D Geospatial Twin',
      desc: 'Visualizing planetary environmental telemetry mesh & major urban digital twin nodes across India and Europe.',
      duration: 5000,
      action: () => {
        setCameraMode('global');
        resetInterventions();
        selectHotspot(null);
        selectReport(null);
      }
    },
    {
      name: '2. Search & Select Bengaluru',
      desc: 'Locking onto Silicon Plateau basin (12.97°N, 77.59°E). Preparing supersonic sub-orbital descent vector.',
      duration: 3500,
      action: () => {
        const blr = SUPPORTED_LOCATIONS.find(l => l.id === 'bengaluru')!;
        setCameraMode('city');
        flyToLocation(blr);
      }
    },
    {
      name: '3. Smooth Camera Flight into 3D City',
      desc: 'Descending through atmospheric boundary layer into 3D urban canopy, buildings, road corridors, and water systems.',
      duration: 4500,
      action: () => {
        // City view is now active
      }
    },
    {
      name: '4. Environmental LiDAR Scan',
      desc: 'Executing precision spatial radar sweep. Calibrating real-time particulate density, heat anomaly, and waste sensors.',
      duration: 4000,
      action: () => {
        triggerScan();
      }
    },
    {
      name: '5. Volumetric Air-Quality Dynamics (AQI)',
      desc: 'Overlaying real-time 3D aerosol particulate simulation. AQI currently 142 (Unhealthy for Sensitive Groups), PM2.5 at 58.4 µg/m³.',
      duration: 5000,
      action: () => {
        // Toggle layers for focus
        useAppStore.setState(s => ({
          layers: s.layers.map(l => ({ ...l, isActive: l.id === 'aqi' || l.id === 'green' }))
        }));
      }
    },
    {
      name: '6. Autonomous Waste Hotspot Detection',
      desc: 'Inspecting critical waste accumulation at Bellandur Lake catchment (14.2 Metric Tons of microplastics detected via satellite spectral analysis).',
      duration: 5500,
      action: () => {
        useAppStore.setState(s => ({
          layers: s.layers.map(l => ({ ...l, isActive: l.id === 'waste' || l.id === 'aqi' }))
        }));
        const hs = wasteHotspots[0] || {
          id: 'blr-w1',
          title: 'Bellandur Lake Catchment Inflow',
          coordinates: [77.6710, 12.9352],
          severity: 'high',
          volumeEst: 14200,
          wasteType: 'Plastic/Microplastics',
          detectionMethod: 'Satellite Spectral Analysis',
          recommendation: 'Deploy floating retention booms and automated microplastic skimming unit.'
        };
        selectHotspot(hs);
      }
    },
    {
      name: '7. Verified Community Ground Truth',
      desc: 'Citizen Eco-Guard volunteer report: Illegal chemical runoff near stormwater channel. 47 citizen verifications.',
      duration: 5000,
      action: () => {
        selectHotspot(null);
        const rep = communityReports[0] || null;
        selectReport(rep);
      }
    },
    {
      name: '8. Initialize WHAT-IF Simulation Engine',
      desc: 'Opening environmental laboratory. Modeling multi-sector municipal interventions against baseline metrics.',
      duration: 4500,
      action: () => {
        selectReport(null);
        useAppStore.setState(s => ({
          layers: s.layers.map(l => ({ ...l, isActive: true }))
        }));
      }
    },
    {
      name: '9. Intervention: Expand Urban Canopy (+70% Trees)',
      desc: 'Thousands of 3D instanced trees sprout dynamically. Microclimate shade attenuates thermal heat island from +2.8°C to +1.4°C.',
      duration: 5500,
      action: () => {
        setIntervention('urbanTrees', 70);
        setIntervention('greenSpace', 50);
      }
    },
    {
      name: '10. Intervention: Modernize Circular Waste & Transit (+80%)',
      desc: 'Waste collection boosted to 80%, material recycling to 75%, and electric transit to 65%. Waste beacons remediate into clean zones.',
      duration: 5500,
      action: () => {
        setIntervention('wasteCollection', 80);
        setIntervention('recycling', 75);
        setIntervention('publicTransport', 65);
      }
    },
    {
      name: '11. Simulated Resilience Outcome Verified',
      desc: 'Result: AQI drops from 142 to 68 (Moderate), Green Cover surges to 51.4%, and TERRA composite index rises from 58 to 86/100!',
      duration: 6000,
      action: () => {
        triggerScan();
      }
    }
  ];

  const executeStep = (index: number) => {
    if (index >= steps.length) {
      // Loop or stop
      setCurrentStep(0);
      steps[0].action();
      return;
    }
    setCurrentStep(index);
    steps[index].action();
  };

  useEffect(() => {
    if (!isDemoActive) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    executeStep(0);
    setIsPlaying(true);
  }, [isDemoActive]);

  useEffect(() => {
    if (!isDemoActive || !isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const duration = steps[currentStep]?.duration || 5000;
    timerRef.current = setTimeout(() => {
      const next = currentStep + 1;
      if (next < steps.length) {
        executeStep(next);
      } else {
        // Complete
        setIsPlaying(false);
      }
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentStep, isPlaying, isDemoActive]);

  if (!isDemoActive) return null;

  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed top-18 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
      <div className="glass-panel-active rounded-2xl p-4 w-full max-w-2xl pointer-events-auto border-2 border-emerald-400 shadow-2xl shadow-emerald-950/50 animate-in fade-in slide-in-from-top-4 duration-300">
        {/* Step Progress Bar */}
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-3 border border-white/5">
          <div
            className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Header & Controls */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase font-tech tracking-wider text-emerald-300">
              LIVE HACKATHON DEMO MODE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-slate-300 border border-white/10">
              Step {currentStep + 1} / {steps.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (currentStep > 0) executeStep(currentStep - 1);
              }}
              title="Previous Step"
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause Demo' : 'Resume Demo'}
              className="p-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                if (currentStep < steps.length - 1) executeStep(currentStep + 1);
              }}
              title="Next Step"
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-4 bg-white/20 mx-1" />

            <button
              onClick={stopDemo}
              title="Exit Demo Mode"
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Exit Demo</span>
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div>
          <h4 className="text-sm font-bold text-white mb-0.5 flex items-center gap-2">
            <span>{steps[currentStep].name}</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {steps[currentStep].desc}
          </p>
        </div>
      </div>
    </div>
  );
};
