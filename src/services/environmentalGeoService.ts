import { WhatIfInterventions } from '../types/index';
import {
  fetchViewportAQISamples,
  ViewportBounds,
  AQISamplePoint
} from './airQualityService';
import {
  fetchViewportTemperatureSamples,
  TemperatureSamplePoint
} from './weatherService';

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    id?: string | number;
    properties: Record<string, any>;
    geometry: {
      type: string;
      coordinates: any;
    };
  }>;
}

/**
 * 1. AIR QUALITY CONTINUOUS VIEWPORT HEATMAP
 * Single Source of Truth: Uses exact absolute geographic lattice points.
 */
export async function getViewportAQIGeoJSON(
  bounds: ViewportBounds,
  zoom: number,
  interventions?: WhatIfInterventions
): Promise<GeoJSONFeatureCollection> {
  const samples = await fetchViewportAQISamples(bounds, zoom);
  const improvement = interventions ? (interventions.publicTransport * 0.45 + interventions.urbanTrees * 0.25) / 100 : 0;

  return {
    type: 'FeatureCollection',
    features: samples.map((sample) => {
      const simulatedAQI = Math.max(15, Math.round(sample.aqi * (1 - improvement * 0.55)));
      const simulatedPM25 = Number((sample.pm2_5 * (1 - improvement * 0.6)).toFixed(1));

      return {
        type: 'Feature',
        id: sample.id,
        properties: {
          id: sample.id,
          aqi: simulatedAQI,
          pm25: simulatedPM25,
          pm10: sample.pm10,
          weight: Math.min(1.0, Math.max(0.1, simulatedAQI / 260)),
          color: sample.color,
          category: sample.category,
          source: 'Open-Meteo / Copernicus CAMS Atmospheric Model',
          timestamp: sample.timestamp
        },
        geometry: {
          type: 'Point',
          coordinates: [sample.longitude, sample.latitude] // Absolute geographic coordinates
        }
      };
    })
  };
}

/**
 * 2. READABLE AQI INDICATOR MARKERS (With Intelligent Geographic Spacing)
 * Selects a clean subset of points from the EXACT SAME sample lattice.
 * Coordinates are 100% identical and immutable.
 */
export async function getViewportAQIMarkersGeoJSON(
  bounds: ViewportBounds,
  zoom: number,
  interventions?: WhatIfInterventions
): Promise<GeoJSONFeatureCollection> {
  const samples = await fetchViewportAQISamples(bounds, zoom);
  const improvement = interventions ? (interventions.publicTransport * 0.45 + interventions.urbanTrees * 0.25) / 100 : 0;

  // Intelligent Geographic Spacing without altering coordinates:
  // Enforces a minimum distance between displayed markers to prevent overlap
  const minSeparationDeg = zoom < 8 ? 0.16 : zoom < 11 ? 0.08 : 0.045;
  const acceptedMarkers: AQISamplePoint[] = [];

  for (const sample of samples) {
    const isTooClose = acceptedMarkers.some(m => {
      const dLon = Math.abs(m.longitude - sample.longitude);
      const dLat = Math.abs(m.latitude - sample.latitude);
      return Math.sqrt(dLon * dLon + dLat * dLat) < minSeparationDeg;
    });

    if (!isTooClose) {
      acceptedMarkers.push(sample);
    }
  }

  return {
    type: 'FeatureCollection',
    features: acceptedMarkers.map((sample) => {
      const simulatedAQI = Math.max(15, Math.round(sample.aqi * (1 - improvement * 0.55)));
      const simulatedPM25 = Number((sample.pm2_5 * (1 - improvement * 0.6)).toFixed(1));

      return {
        type: 'Feature',
        id: `marker_${sample.id}`,
        properties: {
          id: sample.id,
          aqi: simulatedAQI,
          aqiLabel: `${simulatedAQI}`,
          pm25: simulatedPM25,
          pm10: sample.pm10,
          color: sample.color,
          category: sample.category,
          latitude: sample.latitude,
          longitude: sample.longitude,
          source: 'Open-Meteo / Copernicus CAMS',
          classification: 'EXTERNAL_MODEL',
          timestamp: sample.timestamp
        },
        geometry: {
          type: 'Point',
          coordinates: [sample.longitude, sample.latitude] // Exact immutable geographic coordinate
        }
      };
    })
  };
}

/**
 * 3. REAL REGIONAL TEMPERATURE VIEWPORT HEATMAP
 */
export async function getViewportHeatGeoJSON(
  bounds: ViewportBounds,
  zoom: number,
  interventions?: WhatIfInterventions
): Promise<GeoJSONFeatureCollection> {
  const samples = await fetchViewportTemperatureSamples(bounds, zoom);
  const cooling = interventions ? (interventions.urbanTrees * 0.5 + interventions.greenSpace * 0.5) / 100 : 0;

  return {
    type: 'FeatureCollection',
    features: samples.map((sample) => {
      const simulatedTemp = Number((sample.temperature - cooling * 2.2).toFixed(1));

      return {
        type: 'Feature',
        id: sample.id,
        properties: {
          id: sample.id,
          temperature: simulatedTemp,
          apparentTemperature: sample.apparentTemperature,
          intensity: Math.min(1.0, Math.max(0.1, (simulatedTemp - 10) / 30)),
          color: sample.color,
          source: 'Open-Meteo Weather Forecast Model',
          timestamp: sample.timestamp
        },
        geometry: {
          type: 'Point',
          coordinates: [sample.longitude, sample.latitude]
        }
      };
    })
  };
}

/**
 * 4. READABLE TEMPERATURE INDICATOR MARKERS
 */
export async function getViewportTemperatureMarkersGeoJSON(
  bounds: ViewportBounds,
  zoom: number,
  interventions?: WhatIfInterventions
): Promise<GeoJSONFeatureCollection> {
  const samples = await fetchViewportTemperatureSamples(bounds, zoom);
  const cooling = interventions ? (interventions.urbanTrees * 0.5 + interventions.greenSpace * 0.5) / 100 : 0;

  const minSeparationDeg = zoom < 8 ? 0.16 : zoom < 11 ? 0.08 : 0.045;
  const acceptedMarkers: TemperatureSamplePoint[] = [];

  for (const sample of samples) {
    const isTooClose = acceptedMarkers.some(m => {
      const dLon = Math.abs(m.longitude - sample.longitude);
      const dLat = Math.abs(m.latitude - sample.latitude);
      return Math.sqrt(dLon * dLon + dLat * dLat) < minSeparationDeg;
    });

    if (!isTooClose) {
      acceptedMarkers.push(sample);
    }
  }

  return {
    type: 'FeatureCollection',
    features: acceptedMarkers.map((sample) => {
      const simulatedTemp = Number((sample.temperature - cooling * 2.2).toFixed(1));

      return {
        type: 'Feature',
        id: `marker_${sample.id}`,
        properties: {
          id: sample.id,
          temperature: simulatedTemp,
          tempLabel: `${simulatedTemp}°`,
          apparentTemperature: sample.apparentTemperature,
          color: sample.color,
          latitude: sample.latitude,
          longitude: sample.longitude,
          source: 'Open-Meteo Weather Forecast API',
          classification: 'EXTERNAL_MODEL',
          timestamp: sample.timestamp
        },
        geometry: {
          type: 'Point',
          coordinates: [sample.longitude, sample.latitude]
        }
      };
    })
  };
}

/**
 * 5. MODELED NOISE EXPOSURE (Anchored to Real Road/Transit Geometries)
 * Extracted from real rendered road features or arterial transit coordinates.
 */
export function buildRoadNoiseGeoJSON(
  roadFeatures: Array<{ coordinates: number[][]; name: string; roadClass: string }>
): GeoJSONFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: roadFeatures.map((road, idx) => {
      const isHighExposure = road.roadClass === 'motorway' || road.roadClass === 'trunk' || road.roadClass === 'rail';
      const level = isHighExposure ? 'HIGH' : 'MODERATE';
      const dbEstimate = isHighExposure ? '72–78 dB(A)' : '62–68 dB(A)';
      const color = isHighExposure ? '#ef4444' : '#f97316';

      return {
        type: 'Feature',
        id: `noise_corridor_${idx}`,
        properties: {
          id: `noise_corridor_${idx}`,
          name: road.name || 'Arterial Transit Corridor',
          roadClass: road.roadClass,
          exposureLevel: level,
          dbEstimate,
          color,
          source: 'Transport Network Proximity Model',
          classification: 'MODELED_GEOGRAPHIC'
        },
        geometry: {
          type: 'LineString',
          coordinates: road.coordinates
        }
      };
    })
  };
}
