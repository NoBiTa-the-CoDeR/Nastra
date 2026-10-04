import {
  Location,
  EnvironmentalMetrics,
  WasteHotspot,
  CommunityReport,
  CommunityAction,
  WhatIfInterventions
} from '../types';
import {
  SUPPORTED_LOCATIONS,
  CITY_METRICS,
  WASTE_HOTSPOTS,
  COMMUNITY_REPORTS,
  COMMUNITY_ACTIONS,
  calculateSimulation
} from './mockData';
import { getMapboxToken } from '../utils/mapboxToken';

export interface IDataService {
  getLocations(): Promise<Location[]>;
  searchLocations(query: string): Promise<Location[]>;
  getLocationById(id: string): Promise<Location | null>;
  getMetrics(cityId: string): Promise<EnvironmentalMetrics>;
  getWasteHotspots(cityId: string): Promise<WasteHotspot[]>;
  getCommunityReports(cityId: string): Promise<CommunityReport[]>;
  getCommunityActions(cityId: string): Promise<CommunityAction[]>;
  submitCommunityReport(cityId: string, report: Omit<CommunityReport, 'id' | 'timestamp' | 'upvotes'>): Promise<CommunityReport>;
  upvoteCommunityReport(cityId: string, reportId: string): Promise<number>;
  calculateWhatIf(baseline: EnvironmentalMetrics, interventions: WhatIfInterventions): Promise<EnvironmentalMetrics>;
}

class LocalDataService implements IDataService {
  private customReports: Record<string, CommunityReport[]> = {};
  private geocodedLocationsCache: Map<string, Location> = new Map();

  async getLocations(): Promise<Location[]> {
    return [...SUPPORTED_LOCATIONS];
  }

  async searchLocations(query: string): Promise<Location[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [...SUPPORTED_LOCATIONS];

    // Check curated locations first (instant offline match)
    const matches = SUPPORTED_LOCATIONS.filter(
      loc => loc.name.toLowerCase().includes(q) || loc.country.toLowerCase().includes(q)
    );

    // If query has at least 2 characters, search via official Mapbox Geocoding API
    const token = getMapboxToken();
    if (token && q.length >= 2) {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&types=place,locality,region,country&limit=6`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.features) && data.features.length > 0) {
            const geocoded: Location[] = data.features.map((feature: any) => {
              const countryContext = feature.context?.find((c: any) => c.id.startsWith('country'));
              const country = countryContext?.text || 'Global';
              const id = `geo-${feature.id.replace(/[^a-zA-Z0-9-]/g, '-')}`;

              const loc: Location = {
                id,
                name: feature.text || feature.place_name.split(',')[0],
                country,
                center: [feature.center[0], feature.center[1]], // Real GPS coordinates from Mapbox!
                zoom: 14.5,
                pitch: 58,
                bearing: -15,
                description: feature.place_name,
                population: 'Metropolitan Basin',
                altitudeMeters: Math.round(Math.abs(feature.center[1]) * 10),
                climateZone: 'Geographic Terrain Node'
              };

              this.geocodedLocationsCache.set(id, loc);
              return loc;
            });

            // Combine curated matches with geocoded results, de-duplicating by name
            const combined = [...matches];
            for (const g of geocoded) {
              if (!combined.some(m => m.name.toLowerCase() === g.name.toLowerCase())) {
                combined.push(g);
              }
            }
            return combined;
          }
        }
      } catch (err) {
        console.warn('Mapbox Geocoding fetch error:', err);
      }
    }

    // Return matches or empty array. Absolutely NO fake coordinates around Bengaluru!
    return matches;
  }

  async getLocationById(id: string): Promise<Location | null> {
    const loc = SUPPORTED_LOCATIONS.find(l => l.id === id);
    if (loc) return loc;

    if (this.geocodedLocationsCache.has(id)) {
      return this.geocodedLocationsCache.get(id) || null;
    }

    return null;
  }

  async getMetrics(cityId: string): Promise<EnvironmentalMetrics> {
    if (cityId in CITY_METRICS) {
      return { ...CITY_METRICS[cityId] };
    }

    // For any dynamically geocoded city, derive realistic telemetry based on latitude
    const loc = this.geocodedLocationsCache.get(cityId);
    const lat = loc ? Math.abs(loc.center[1]) : 20;

    return {
      airQuality: {
        aqi: Math.round(55 + (lat % 40) * 2.2),
        pm25: Number((18 + (lat % 30) * 1.4).toFixed(1)),
        pm10: Number((35 + (lat % 30) * 2.1).toFixed(1)),
        dominantPollutant: 'PM2.5 / Ambient Aerosol',
        no2: 24.5,
        o3: 38.0,
        co: 0.8,
        category: 'Moderate'
      },
      greenCoverPercentage: Math.round(28 + (lat % 25)),
      wasteIndex: Math.round(35 + (lat % 35)),
      waterQualityIndex: Math.round(55 + (lat % 30)),
      heatIslandAnomaly: Number((1.2 + (lat % 10) * 0.25).toFixed(1)),
      noiseLevelDb: Number((62 + (lat % 15)).toFixed(1)),
      cleanlinessScore: Math.round(65 + (lat % 25)),
      terraIndex: Math.round(62 + (lat % 22))
    };
  }

  async getWasteHotspots(cityId: string): Promise<WasteHotspot[]> {
    if (cityId in WASTE_HOTSPOTS) {
      return [...WASTE_HOTSPOTS[cityId]];
    }

    // Dynamic localized hotspots placed at real GPS offsets of the geocoded location
    const loc = this.geocodedLocationsCache.get(cityId);
    if (!loc) return [];

    const [cLng, cLat] = loc.center;
    return [
      {
        id: `${cityId}-w1`,
        title: `${loc.name} Waterfront Runoff Zone`,
        coordinates: [cLng + 0.015, cLat + 0.012],
        severity: 'high',
        volumeEst: 12400,
        wasteType: 'Plastic/Microplastics',
        detectionMethod: 'Satellite Spectral Analysis',
        recommendation: 'Deploy retention booms and automated microplastic skimming units.'
      },
      {
        id: `${cityId}-w2`,
        title: `${loc.name} Industrial Logistics Depot`,
        coordinates: [cLng - 0.018, cLat - 0.014],
        severity: 'medium',
        volumeEst: 6800,
        wasteType: 'Municipal Solid',
        detectionMethod: 'Drone LiDAR',
        recommendation: 'Establish decentralized recycling collection hub.'
      }
    ];
  }

  async getCommunityReports(cityId: string): Promise<CommunityReport[]> {
    const base = cityId in COMMUNITY_REPORTS ? COMMUNITY_REPORTS[cityId] : [];
    const added = this.customReports[cityId] || [];

    if (base.length > 0) {
      return [...added, ...base];
    }

    // Dynamic localized community report at real GPS coordinates for geocoded cities
    const loc = this.geocodedLocationsCache.get(cityId);
    if (!loc) return [...added];

    const [cLng, cLat] = loc.center;
    const dynamicReports: CommunityReport[] = [
      {
        id: `cr-${cityId}-1`,
        coordinates: [cLng + 0.008, cLat - 0.006],
        type: 'water',
        severity: 'medium',
        title: `Canal Turbidity near Central ${loc.name}`,
        description: 'Unusual discolored runoff observed in stormwater discharge outlet.',
        locationName: `${loc.name} Central Sector`,
        timestamp: '25 minutes ago',
        upvotes: 38,
        author: 'EcoGuard Volunteer',
        status: 'Investigating'
      }
    ];

    return [...added, ...dynamicReports];
  }

  async getCommunityActions(cityId: string): Promise<CommunityAction[]> {
    return [...COMMUNITY_ACTIONS];
  }

  async submitCommunityReport(
    cityId: string,
    report: Omit<CommunityReport, 'id' | 'timestamp' | 'upvotes'>
  ): Promise<CommunityReport> {
    const newReport: CommunityReport = {
      ...report,
      id: `cr-${Date.now()}`,
      timestamp: 'Just now',
      upvotes: 1
    };

    if (!this.customReports[cityId]) {
      this.customReports[cityId] = [];
    }
    this.customReports[cityId].unshift(newReport);
    return newReport;
  }

  async upvoteCommunityReport(cityId: string, reportId: string): Promise<number> {
    const reports = await this.getCommunityReports(cityId);
    const target = reports.find(r => r.id === reportId);
    if (target) {
      target.upvotes += 1;
      return target.upvotes;
    }
    return 1;
  }

  async calculateWhatIf(
    baseline: EnvironmentalMetrics,
    interventions: WhatIfInterventions
  ): Promise<EnvironmentalMetrics> {
    return calculateSimulation(baseline, interventions);
  }
}

export const DataService: IDataService = new LocalDataService();
