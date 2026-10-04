/**
 * Absolute Geographic Lattice Air Quality Data Service
 * Data Source: Open-Meteo Air Quality API / Copernicus CAMS
 * 
 * Precision Architecture:
 * - Coordinates are SNAPPED to globally fixed geographic lattice multiples of STEP.
 * - Coordinates NEVER shift or jitter during pan, zoom, pitch, or rotation.
 * - Stable Feature IDs: aqi_${lon}_${lat}
 * - Viewport buffering (+20% margin) prevents edge pop-in.
 */

export interface RealAirQuality {
  us_aqi: number;
  european_aqi: number;
  pm2_5: number;
  pm10: number;
  nitrogen_dioxide: number;
  ozone: number;
  sulphur_dioxide: number;
  carbon_monoxide: number;
  time: string;
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  source: string;
}

export interface AQISamplePoint {
  id: string;
  latitude: number;
  longitude: number;
  aqi: number;
  pm2_5: number;
  pm10: number;
  weight: number;
  color: string;
  category: string;
  timestamp: number;
}

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

const CACHE_TTL_MS = 25 * 60 * 1000; // 25 minutes TTL
const aqiLatticeCache = new Map<string, { aqi: number; pm2_5: number; pm10: number; timestamp: number }>();
const singleCoordCache = new Map<string, { data: RealAirQuality; timestamp: number }>();

export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#10b981'; // Emerald (Good)
  if (aqi <= 100) return '#eab308'; // Amber (Moderate)
  if (aqi <= 150) return '#f97316'; // Orange (Unhealthy for Sensitive Groups)
  if (aqi <= 200) return '#ef4444'; // Red (Unhealthy)
  if (aqi <= 300) return '#a855f7'; // Purple (Very Unhealthy)
  return '#881337'; // Maroon (Hazardous)
}

export function getAQICategory(aqi: number): RealAirQuality['category'] {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function getPointKey(lat: number, lon: number): string {
  return `${lon.toFixed(4)}_${lat.toFixed(4)}`;
}

/**
 * Fetches current air quality for a single coordinate (used by HUD city summary).
 */
export async function fetchCurrentAirQuality(lat: number, lon: number): Promise<RealAirQuality | null> {
  const roundedLat = Number((Math.round(lat * 20) / 20).toFixed(4));
  const roundedLon = Number((Math.round(lon * 20) / 20).toFixed(4));
  const key = `${roundedLon}_${roundedLat}`;

  const cached = singleCoordCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=us_aqi,european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo AQI HTTP ${res.status}`);

    const json = await res.json();
    const curr = json.current;
    if (!curr) throw new Error('Missing current air quality data');

    const aqi = curr.us_aqi ?? Math.round((curr.pm2_5 ?? 15) * 2.5);
    const result: RealAirQuality = {
      us_aqi: aqi,
      european_aqi: curr.european_aqi ?? Math.round(aqi * 0.7),
      pm2_5: Number((curr.pm2_5 ?? 0).toFixed(1)),
      pm10: Number((curr.pm10 ?? 0).toFixed(1)),
      nitrogen_dioxide: Number((curr.nitrogen_dioxide ?? 0).toFixed(1)),
      ozone: Number((curr.ozone ?? 0).toFixed(1)),
      sulphur_dioxide: Number((curr.sulphur_dioxide ?? 0).toFixed(1)),
      carbon_monoxide: Number((curr.carbon_monoxide ?? 0).toFixed(1)),
      time: curr.time || new Date().toISOString(),
      category: getAQICategory(aqi),
      source: 'Open-Meteo / Copernicus CAMS Atmospheric Model'
    };

    singleCoordCache.set(key, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.warn(`Failed to fetch Open-Meteo AQI for [${lat}, ${lon}]:`, err);
    return null;
  }
}

/**
 * Absolute Geographic Lattice Viewport Sampling
 * Snaps all points to globally fixed geographic increments of STEP.
 * Points remain strictly locked to their exact geographic coordinates forever.
 */
export async function fetchViewportAQISamples(
  bounds: ViewportBounds,
  zoom: number
): Promise<AQISamplePoint[]> {
  const { north, south, east, west } = bounds;

  // Fixed geographic step: snapped to absolute Earth coordinates
  const STEP = zoom < 8 ? 0.08 : zoom < 12 ? 0.04 : 0.025;

  // Add 20% viewport padding buffer to prevent edge artifacts during pan
  const padLat = (north - south) * 0.20;
  const padLon = (east - west) * 0.20;

  const startLat = Math.floor((south - padLat) / STEP) * STEP;
  const endLat = Math.ceil((north + padLat) / STEP) * STEP;
  const startLon = Math.floor((west - padLon) / STEP) * STEP;
  const endLon = Math.ceil((east + padLon) / STEP) * STEP;

  const pointsToQuery: Array<{ lat: number; lon: number; key: string }> = [];
  const results: AQISamplePoint[] = [];

  for (let lat = startLat; lat <= endLat + 0.0001; lat += STEP) {
    const fixedLat = Number(lat.toFixed(4));
    if (fixedLat < -85 || fixedLat > 85) continue;

    for (let lon = startLon; lon <= endLon + 0.0001; lon += STEP) {
      const fixedLon = Number(lon.toFixed(4));
      const key = getPointKey(fixedLat, fixedLon);
      const cached = aqiLatticeCache.get(key);

      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        results.push({
          id: `aqi_${key}`,
          latitude: fixedLat,
          longitude: fixedLon,
          aqi: cached.aqi,
          pm2_5: cached.pm2_5,
          pm10: cached.pm10,
          weight: Math.min(1.0, Math.max(0.1, cached.aqi / 260)),
          color: getAQIColor(cached.aqi),
          category: getAQICategory(cached.aqi),
          timestamp: cached.timestamp
        });
      } else {
        pointsToQuery.push({ lat: fixedLat, lon: fixedLon, key });
      }
    }
  }

  // Batch query missing lattice points from Open-Meteo in blocks of up to 30 points
  if (pointsToQuery.length > 0) {
    const batch = pointsToQuery.slice(0, 30);
    try {
      const lats = batch.map(p => p.lat).join(',');
      const lons = batch.map(p => p.lon).join(',');
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}&current=us_aqi,pm2_5,pm10`;
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : [data];

        items.forEach((item, idx) => {
          const pt = batch[idx];
          if (!pt) return;

          const aqi = item.current?.us_aqi ?? Math.round((item.current?.pm2_5 ?? 15) * 2.5);
          const pm2_5 = Number((item.current?.pm2_5 ?? 0).toFixed(1));
          const pm10 = Number((item.current?.pm10 ?? 0).toFixed(1));
          const now = Date.now();

          aqiLatticeCache.set(pt.key, { aqi, pm2_5, pm10, timestamp: now });

          results.push({
            id: `aqi_${pt.key}`,
            latitude: pt.lat,
            longitude: pt.lon,
            aqi,
            pm2_5,
            pm10,
            weight: Math.min(1.0, Math.max(0.1, aqi / 260)),
            color: getAQIColor(aqi),
            category: getAQICategory(aqi),
            timestamp: now
          });
        });
      }
    } catch (err) {
      console.warn('Batch Open-Meteo AQI lattice fetch warning:', err);
    }
  }

  return results;
}
