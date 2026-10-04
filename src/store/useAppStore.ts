import { create } from 'zustand';
import {
  Location,
  CameraMode,
  EnvironmentalMetrics,
  EnvironmentalLayer,
  WasteHotspot,
  CommunityReport,
  CommunityAction,
  WhatIfInterventions,
  LayerId
} from '../types';
import {
  SUPPORTED_LOCATIONS,
  COMMUNITY_ACTIONS,
  calculateSimulation
} from '../api/mockData';
import { DataService } from '../api/dataService';
import {
  getCityRealEnvironmentalPackage,
  DataMetricStatus
} from '../services/environmentalDataService';
import { RealAirQuality } from '../services/airQualityService';
import { RealWeather } from '../services/weatherService';

export const INITIAL_LAYERS: EnvironmentalLayer[] = [
  { id: 'aqi', name: 'Air Quality (AQI)', shortDesc: 'Real Open-Meteo / CAMS PM2.5 & Ozone', isActive: true, opacity: 0.85, color: '#f59e0b', unit: 'AQI' },
  { id: 'waste', name: 'Waste Hotspots', shortDesc: 'Georeferenced GPS Observation Pins', isActive: false, opacity: 0.9, color: '#ef4444', unit: 'Index' },
  { id: 'cleanliness', name: 'Cleanliness Index', shortDesc: 'Community Sanitation Score', isActive: false, opacity: 0.75, color: '#06b6d4', unit: 'Score' },
  { id: 'green', name: 'Green Canopy', shortDesc: 'Real Mapbox / OSM Park Polygons', isActive: true, opacity: 0.95, color: '#10b981', unit: '%' },
  { id: 'water', name: 'Water Health', shortDesc: 'Real Lakes & River Hydrography', isActive: true, opacity: 0.8, color: '#3b82f6', unit: 'WQI' },
  { id: 'heat', name: 'Thermal Heat Island', shortDesc: 'Open-Meteo Regional Temperature Heatmap', isActive: false, opacity: 0.85, color: '#f97316', unit: '°C' },
  { id: 'noise', name: 'Acoustic / Noise', shortDesc: 'Arterial Transit Corridors', isActive: false, opacity: 0.7, color: '#8b5cf6', unit: 'dB' },
];

export const INITIAL_INTERVENTIONS: WhatIfInterventions = {
  urbanTrees: 0,
  wasteCollection: 0,
  recycling: 0,
  greenSpace: 0,
  publicTransport: 0
};

// Initial placeholder until real API load completes
const INITIAL_BASELINE: EnvironmentalMetrics = {
  airQuality: {
    aqi: 65,
    pm25: 22.0,
    pm10: 38.0,
    dominantPollutant: 'PM2.5',
    no2: 24.0,
    o3: 32.0,
    co: 0.6,
    category: 'Moderate'
  },
  greenCoverPercentage: 32.5,
  wasteIndex: 45,
  waterQualityIndex: 58,
  heatIslandAnomaly: 1.8,
  noiseLevelDb: 66.0,
  cleanlinessScore: 68,
  terraIndex: 68
};

interface AppState {
  // Navigation & Location
  currentLocation: Location;
  cameraMode: CameraMode;
  isFlying: boolean;
  isScanning: boolean;
  searchQuery: string;

  // Real Environmental Data
  layers: EnvironmentalLayer[];
  baselineMetrics: EnvironmentalMetrics;
  displayedMetrics: EnvironmentalMetrics;
  realAirQuality: RealAirQuality | null;
  realWeather: RealWeather | null;
  dataStatuses: DataMetricStatus[];
  isDataLoading: boolean;
  dataError: string | null;

  // Waste & Community
  wasteHotspots: WasteHotspot[];
  selectedHotspot: WasteHotspot | null;
  communityReports: CommunityReport[];
  selectedReport: CommunityReport | null;
  communityActions: CommunityAction[];
  isReportModalOpen: boolean;
  isActivityFeedOpen: boolean;
  isDataSourceModalOpen: boolean;

  // Simulation ("WHAT IF")
  isSimulating: boolean;
  interventions: WhatIfInterventions;
  simulatedMetrics: EnvironmentalMetrics;
  splitViewActive: boolean;

  // Demo Mode
  isDemoActive: boolean;
  demoStepIndex: number;
  demoStepName: string;
  demoStepDesc: string;

  // Modals
  isAiCopilotOpen: boolean;
  isAiVisionOpen: boolean;
  activeTab: 'hud' | 'whatif' | 'community' | 'layers';
  show3DDepth: boolean;

  // Layer Architecture
  primaryLayer: LayerId;
  isCompareMode: boolean;
  geoDebugMode: boolean;

  // Actions
  setLocation: (loc: Location) => Promise<void>;
  flyToLocation: (loc: Location) => void;
  setCameraMode: (mode: CameraMode) => void;
  triggerScan: () => void;
  toggleLayer: (id: LayerId) => void;
  setPrimaryLayer: (id: LayerId) => void;
  toggleCompareMode: () => void;
  toggleGeoDebugMode: () => void;
  setLayerOpacity: (id: LayerId, opacity: number) => void;
  selectHotspot: (hotspot: WasteHotspot | null) => void;
  selectReport: (report: CommunityReport | null) => void;
  setIntervention: (key: keyof WhatIfInterventions, value: number) => void;
  resetInterventions: () => void;
  setReportModalOpen: (open: boolean) => void;
  setActivityFeedOpen: (open: boolean) => void;
  setDataSourceModalOpen: (open: boolean) => void;
  setAiCopilotOpen: (open: boolean) => void;
  setAiVisionOpen: (open: boolean) => void;
  startDemo: () => void;
  stopDemo: () => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  addCommunityReport: (report: Omit<CommunityReport, 'id' | 'timestamp' | 'upvotes'>) => Promise<void>;
  submitNewReport: (report: Omit<CommunityReport, 'id' | 'timestamp' | 'upvotes'>) => Promise<void>;
  upvoteReport: (reportId: string) => Promise<void>;
  refreshRealData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentLocation: SUPPORTED_LOCATIONS[0],
  cameraMode: 'city',
  isFlying: false,
  isScanning: false,
  searchQuery: '',

  layers: INITIAL_LAYERS,
  baselineMetrics: INITIAL_BASELINE,
  displayedMetrics: INITIAL_BASELINE,
  realAirQuality: null,
  realWeather: null,
  dataStatuses: [],
  isDataLoading: true,
  dataError: null,

  wasteHotspots: [],
  selectedHotspot: null,
  communityReports: [],
  selectedReport: null,
  communityActions: [],
  isReportModalOpen: false,
  isActivityFeedOpen: false,
  isDataSourceModalOpen: false,

  isSimulating: false,
  interventions: INITIAL_INTERVENTIONS,
  simulatedMetrics: calculateSimulation(INITIAL_BASELINE, INITIAL_INTERVENTIONS),
  splitViewActive: false,

  isDemoActive: false,
  demoStepIndex: 0,
  demoStepName: '',
  demoStepDesc: '',

  isAiCopilotOpen: false,
  isAiVisionOpen: false,
  activeTab: 'hud',
  show3DDepth: true,
  primaryLayer: 'aqi',
  isCompareMode: false,
  geoDebugMode: false,

  setLocation: async (loc: Location) => {
    set({ isDataLoading: true, dataError: null, currentLocation: loc });

    try {
      // Fetch genuine live/model-derived Open-Meteo data for this city's exact GPS coordinates
      const [envPackage, hotspots, reports, actions] = await Promise.all([
        getCityRealEnvironmentalPackage(loc),
        DataService.getWasteHotspots(loc.id),
        DataService.getCommunityReports(loc.id),
        DataService.getCommunityActions(loc.id)
      ]);

      const state = get();
      const simMetrics = calculateSimulation(envPackage.metrics, state.interventions);

      set({
        currentLocation: loc,
        baselineMetrics: envPackage.metrics,
        displayedMetrics: state.isSimulating ? simMetrics : envPackage.metrics,
        simulatedMetrics: simMetrics,
        realAirQuality: envPackage.realAirQuality,
        realWeather: envPackage.realWeather,
        dataStatuses: envPackage.statuses,
        wasteHotspots: hotspots,
        communityReports: reports,
        communityActions: actions,
        selectedHotspot: null,
        selectedReport: null,
        isDataLoading: false
      });
    } catch (err: any) {
      console.error('Error fetching real environmental data:', err);
      set({
        isDataLoading: false,
        dataError: 'Air-quality or weather data currently unavailable from upstream API.'
      });
    }
  },

  refreshRealData: async () => {
    const loc = get().currentLocation;
    await get().setLocation(loc);
  },

  flyToLocation: (loc: Location) => {
    set({ isFlying: true });
    get().setLocation(loc);
    setTimeout(() => {
      set({ isFlying: false, cameraMode: 'city' });
      get().triggerScan();
    }, 2400);
  },

  setCameraMode: (mode: CameraMode) => set({ cameraMode: mode }),

  triggerScan: () => {
    set({ isScanning: true });
    setTimeout(() => set({ isScanning: false }), 3200);
  },

  toggleLayer: (id: LayerId) => {
    set(state => {
      const targetLayer = state.layers.find(l => l.id === id);
      const willBeActive = targetLayer ? !targetLayer.isActive : true;

      // In Normal Mode (not compare mode):
      // Major continuous environmental layers are mutually exclusive for crisp readability
      const continuousLayers: LayerId[] = ['aqi', 'heat', 'noise', 'green', 'water', 'cleanliness'];

      if (!state.isCompareMode && continuousLayers.includes(id) && willBeActive) {
        const updated = state.layers.map(l => {
          if (l.id === id) return { ...l, isActive: true };
          if (continuousLayers.includes(l.id)) return { ...l, isActive: false };
          return l; // Keep point features like waste/community intact
        });
        return { layers: updated, primaryLayer: id };
      }

      // In Compare Mode or toggling off:
      const updated = state.layers.map(l =>
        l.id === id ? { ...l, isActive: !l.isActive } : l
      );
      return { layers: updated };
    });
  },

  setPrimaryLayer: (id: LayerId) => {
    set(state => {
      const continuousLayers: LayerId[] = ['aqi', 'heat', 'noise', 'green', 'water', 'cleanliness'];
      const updated = state.layers.map(l => {
        if (l.id === id) return { ...l, isActive: true };
        if (!state.isCompareMode && continuousLayers.includes(l.id)) return { ...l, isActive: false };
        return l;
      });
      return { layers: updated, primaryLayer: id };
    });
  },

  toggleCompareMode: () => {
    set(state => ({ isCompareMode: !state.isCompareMode }));
  },

  toggleGeoDebugMode: () => {
    set(state => ({ geoDebugMode: !state.geoDebugMode }));
  },

  setLayerOpacity: (id: LayerId, opacity: number) => {
    set(state => {
      const updated = state.layers.map(l =>
        l.id === id ? { ...l, opacity: Math.max(0.1, Math.min(1.0, opacity)) } : l
      );
      return { layers: updated };
    });
  },

  selectHotspot: (hotspot: WasteHotspot | null) => set({ selectedHotspot: hotspot }),
  selectReport: (report: CommunityReport | null) => set({ selectedReport: report }),

  setIntervention: (key: keyof WhatIfInterventions, value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    const interventions = { ...get().interventions, [key]: clamped };
    const simulated = calculateSimulation(get().baselineMetrics, interventions);

    const hasAnyActive = Object.values(interventions).some(v => v > 0);

    set({
      interventions,
      simulatedMetrics: simulated,
      displayedMetrics: hasAnyActive ? simulated : get().baselineMetrics,
      isSimulating: hasAnyActive
    });
  },

  resetInterventions: () => {
    set({
      interventions: INITIAL_INTERVENTIONS,
      simulatedMetrics: calculateSimulation(get().baselineMetrics, INITIAL_INTERVENTIONS),
      displayedMetrics: get().baselineMetrics,
      isSimulating: false
    });
  },

  setReportModalOpen: (open: boolean) => set({ isReportModalOpen: open }),
  setActivityFeedOpen: (open: boolean) => set({ isActivityFeedOpen: open }),
  setDataSourceModalOpen: (open: boolean) => set({ isDataSourceModalOpen: open }),
  setAiCopilotOpen: (open: boolean) => set({ isAiCopilotOpen: open }),
  setAiVisionOpen: (open: boolean) => set({ isAiVisionOpen: open }),

  startDemo: () => {
    set({ isDemoActive: true, demoStepIndex: 0 });
  },

  stopDemo: () => {
    set({ isDemoActive: false });
  },

  nextDemoStep: () => {
    set(s => ({ demoStepIndex: s.demoStepIndex + 1 }));
  },

  prevDemoStep: () => {
    set(s => ({ demoStepIndex: Math.max(0, s.demoStepIndex - 1) }));
  },

  addCommunityReport: async (report) => {
    const locId = get().currentLocation.id;
    const added = await DataService.submitCommunityReport(locId, report);
    set(state => ({
      communityReports: [added, ...state.communityReports]
    }));
  },

  submitNewReport: async (report) => {
    await get().addCommunityReport(report);
  },

  upvoteReport: async (reportId: string) => {
    const locId = get().currentLocation.id;
    const newCount = await DataService.upvoteCommunityReport(locId, reportId);
    set(state => ({
      communityReports: state.communityReports.map(r =>
        r.id === reportId ? { ...r, upvotes: newCount } : r
      )
    }));
  }
}));
