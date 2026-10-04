import { LayerId } from './index';

export interface LayerMetadata {
  id: LayerId;
  name: string;
  sourceId: string;
  classification: 'EXTERNAL_MODEL' | 'REAL_MAPPED' | 'MODELED_GEOGRAPHIC' | 'COMMUNITY_VERIFIED';
  provider: string;
  description: string;
  isContinuousField: boolean;
  color: string;
  unit: string;
}

export const LAYER_REGISTRY: Record<LayerId, LayerMetadata> = {
  aqi: {
    id: 'aqi',
    name: 'Air Quality (US AQI)',
    sourceId: 'terra-aqi-source',
    classification: 'EXTERNAL_MODEL',
    provider: 'Open-Meteo / Copernicus CAMS',
    description: 'Regional atmospheric model field & ground-projected sample indicators.',
    isContinuousField: true,
    color: '#06b6d4',
    unit: 'AQI'
  },
  heat: {
    id: 'heat',
    name: 'Regional Temperature',
    sourceId: 'terra-heat-source',
    classification: 'EXTERNAL_MODEL',
    provider: 'Open-Meteo Weather Forecast API',
    description: 'Numerical weather prediction 2m ambient air temperature field.',
    isContinuousField: true,
    color: '#f97316',
    unit: '°C'
  },
  noise: {
    id: 'noise',
    name: 'Modeled Noise Exposure',
    sourceId: 'terra-noise-source',
    classification: 'MODELED_GEOGRAPHIC',
    provider: 'Transport Network Proximity Model',
    description: 'Acoustic corridor exposure derived from real motorway, arterial, and railway geometries.',
    isContinuousField: true,
    color: '#ef4444',
    unit: 'dB(A)'
  },
  green: {
    id: 'green',
    name: 'Green Spaces & Canopy',
    sourceId: 'terra-green-source',
    classification: 'REAL_MAPPED',
    provider: 'Mapbox / OpenStreetMap Vectors',
    description: 'Vector boundaries of gazetted parks, botanic gardens, and recreation grounds.',
    isContinuousField: false,
    color: '#10b981',
    unit: '%'
  },
  water: {
    id: 'water',
    name: 'Waterway Hydrography',
    sourceId: 'terra-water-source',
    classification: 'REAL_MAPPED',
    provider: 'Mapbox / OpenStreetMap Hydrography',
    description: 'Vector polygons of actual rivers, lakes, canals, and reservoirs.',
    isContinuousField: false,
    color: '#38bdf8',
    unit: 'Status'
  },
  waste: {
    id: 'waste',
    name: 'Waste Hotspots',
    sourceId: 'terra-waste-source',
    classification: 'COMMUNITY_VERIFIED',
    provider: 'Citizen Ground Truth & Municipal Records',
    description: 'Verified physical waste accumulation reports pinned to GPS coordinates.',
    isContinuousField: false,
    color: '#f43f5e',
    unit: 'Reports'
  },
  cleanliness: {
    id: 'cleanliness',
    name: 'Community Cleanliness',
    sourceId: 'terra-community-source',
    classification: 'COMMUNITY_VERIFIED',
    provider: 'Community Submissions',
    description: 'Aggregated citizen ground observations. Shows pending state if insufficient data.',
    isContinuousField: false,
    color: '#14b8a6',
    unit: 'Score'
  }
};
