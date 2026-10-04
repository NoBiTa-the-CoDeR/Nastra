import React, { useState } from 'react';
import { MapboxGeographicView } from './components/MapboxGeographicView';
import { TopNav } from './components/hud/TopNav';
import { MetricHUD } from './components/hud/MetricHUD';
import { LayerController } from './components/hud/LayerController';
import { WhatIfPanel } from './components/hud/WhatIfPanel';
import { ActivityFeed } from './components/hud/ActivityFeed';
import { HotspotDrawer } from './components/hud/HotspotDrawer';
import { CommunityModal } from './components/hud/CommunityModal';
import { DataSourceModal } from './components/hud/DataSourceModal';
import { EnvironmentalScanBanner } from './components/hud/EnvironmentalScanBanner';
import { DemoController } from './components/hud/DemoController';
import { AiCopilotModal } from './components/hud/AiCopilotModal';
import { AiVisionGeneratorModal } from './components/hud/AiVisionGeneratorModal';
import { useAppStore } from './store/useAppStore';
import {
  Layers,
  Sliders,
  Users,
  BarChart3,
  Compass,
  Maximize2
} from 'lucide-react';

export default function App() {
  const isDemoActive = useAppStore(s => s.isDemoActive);
  const setReportModalOpen = useAppStore(s => s.setReportModalOpen);
  const [showMetrics, setShowMetrics] = useState(true);
  const [showLayers, setShowLayers] = useState(true);
  const [showWhatIf, setShowWhatIf] = useState(true);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#05070c] select-none">
      {/* Real Geographic Mapbox GL 3D Engine with Synchronized Three.js Environmental Layer */}
      <MapboxGeographicView />

      {/* Top HUD Navigation */}
      <TopNav />

      {/* Environmental Intelligence HUD (Left) */}
      {showMetrics && <MetricHUD />}

      {/* 7-Layer Environmental Toggle & Opacity Panel (Right Top) */}
      {showLayers && <LayerController />}

      {/* WHAT-IF Environmental Simulation Lab (Right Bottom) */}
      {showWhatIf && <WhatIfPanel />}

      {/* Community Action & Activity Stream (Bottom Center) */}
      <ActivityFeed />

      {/* Hotspot Inspection Drawer (when clicking 3D waste beacon) */}
      <HotspotDrawer />

      {/* Sequential LiDAR Environmental Scan Banner */}
      <EnvironmentalScanBanner />

      {/* Community Ground Truth Reports Modal */}
      <CommunityModal />

      {/* Data Source Transparency & Provenance Modal */}
      <DataSourceModal />

      {/* Scripted Hackathon Presentation Demo Controller */}
      {isDemoActive && <DemoController />}

      {/* AI Intelligence Copilot Modal */}
      <AiCopilotModal />

      {/* AI Vision & High-Resolution Image Generator */}
      <AiVisionGeneratorModal />

      {/* Floating Bottom-Left HUD Toggle Bar */}
      <div className="absolute left-4 bottom-4 z-20 flex items-center gap-1.5 pointer-events-auto">
        <button
          onClick={() => setShowMetrics(!showMetrics)}
          className={`glass-panel px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
            showMetrics
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
              : 'border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Toggle Environmental HUD"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Metrics HUD</span>
        </button>

        <button
          onClick={() => setShowLayers(!showLayers)}
          className={`glass-panel px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
            showLayers
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
              : 'border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Toggle Environmental Layers"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Layers</span>
        </button>

        <button
          onClick={() => setShowWhatIf(!showWhatIf)}
          className={`glass-panel px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
            showWhatIf
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
              : 'border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Toggle WHAT-IF Simulator"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">WHAT-IF</span>
        </button>

        <button
          onClick={() => setReportModalOpen(true)}
          className="glass-panel px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-white/10 text-slate-400 hover:text-white hover:border-cyan-400/40 transition-all"
          title="Open Community Reports"
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Citizen Reports</span>
        </button>
      </div>

      {/* Cinematic Compass / Orientation Watermark */}
      <div className="absolute right-4 bottom-2 z-10 pointer-events-none text-right">
        <span className="text-[10px] font-mono text-slate-600 tracking-widest uppercase block">
          TERRA SPATIAL ENGINE • WGS84 WEB MERCATOR • 60 FPS
        </span>
      </div>
    </main>
  );
}
