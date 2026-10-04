/**
 * Absolute Geographic Lattice Weather & Temperature Data Service
 * Data Source: Open-Meteo Weather Forecast API
 * 
 * Precision Architecture:
 * - Coordinates are SNAPPED to globally fixed geographic lattice multiples of STEP.
 * - Coordinates NEVER shift or jitter during pan, zoom, pitch, or rotation.
 * - Stable Feature IDs: temp_${lon}_${lat}
 * - Viewport buffering (+20% margin) prevents edge pop-in.
 */

export interface RealWeather {
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  time: string;
  source: string;
}

export interface TemperatureSamplePoint {
  id: string;
  latitude: number;
  longitude: number;
  temperature: number;
  apparentTemperature: number;
  weight: number;
  color: string;
  timestamp: number;
}

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

const CACHE_TTL_MS = 25 * 60 * 1000;
const tempLatticeCache = new Map<string, { temp: number; appTemp: number; timestamp: number }>();
const singleWeatherCache = new Map<string, { data: RealWeather; timestamp: number }>();

function getPointKey(lat: number, lon: number): string {
  return `${lon.toFixed(4)}_${lat.toFixed(4)}`;
}

export function getTemperatureColor(temp: number): string {
  if (temp <= 12) return '#06b6d4'; // Cyan (Cooler)
  if (temp <= 22) return '#10b981'; // Green (Pleasant)
  if (temp <= 28) return '#f59e0b'; // Amber (Average)
  if (temp <= 34) return '#f97316'; // Orange (Warm)
  return '#ef4444'; // Red (Hot)
}

/**
 * Fetches current weather for a single coordinate (used by HUD city summary).
 */
export async function fetchCurrentWeather(lat: number, lon: number): Promise<RealWeather | null> {
  const roundedLat = Number((Math.round(lat * 20) / 20).toFixed(4));
  const roundedLon = Number((Math.round(lon * 20) / 20).toFixed(4));
  const key = `${roundedLon}_${roundedLat}`;

  const cached = singleWeatherCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,apparent_temperature,relative_humidity_2m`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo Weather HTTP ${res.status}`);

    const json = await res.json();
    const curr = json.current;
    if (!curr) throw new Error('Missing current weather data');

    const result: RealWeather = {
      temperature_2m: Number((curr.temperature_2m ?? 20).toFixed(1)),
      apparent_temperature: Number((curr.apparent_temperature ?? curr.temperature_2m ?? 20).toFixed(1)),
      relative_humidity_2m: Math.round(curr.relative_humidity_2m ?? 60),
      time: curr.time || new Date().toISOString(),
      source: 'Open-Meteo Numerical Weather Prediction Models'
    };

    singleWeatherCache.set(key, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.warn(`Failed to fetch Open-Meteo weather for [${lat}, ${lon}]:`, err);
    return null;
  }
}

/**
 * Absolute Geographic Lattice Viewport Sampling for Temperature
 */
export async function fetchViewportTemperatureSamples(
  bounds: ViewportBounds,
  zoom: number
): Promise<TemperatureSamplePoint[]> {
  const { north, south, east, west } = bounds;

  const STEP = zoom < 8 ? 0.08 : zoom < 12 ? 0.04 : 0.025;

  const padLat = (north - south) * 0.20;
  const padLon = (east - west) * 0.20;

  const startLat = Math.floor((south - padLat) / STEP) * STEP;
  const endLat = Math.ceil((north + padLat) / STEP) * STEP;
  const startLon = Math.floor((west - padLon) / STEP) * STEP;
  const endLon = Math.ceil((east + padLon) / STEP) * STEP;

  const pointsToQuery: Array<{ lat: number; lon: number; key: string }> = [];
  const results: TemperatureSamplePoint[] = [];

  for (let lat = startLat; lat <= endLat + 0.0001; lat += STEP) {
    const fixedLat = Number(lat.toFixed(4));
    if (fixedLat < -85 || fixedLat > 85) continue;

    for (let lon = startLon; lon <= endLon + 0.0001; lon += STEP) {
      const fixedLon = Number(lon.toFixed(4));
      const key = getPointKey(fixedLat, fixedLon);
      const cached = tempLatticeCache.get(key);

      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        results.push({
          id: `temp_${key}`,
          latitude: fixedLat,
          longitude: fixedLon,
          temperature: cached.temp,
          apparentTemperature: cached.appTemp,
          weight: Math.min(1.0, Math.max(0.1, (cached.temp - 10) / 30)),
          color: getTemperatureColor(cached.temp),
          timestamp: cached.timestamp
        });
      } else {
        pointsToQuery.push({ lat: fixedLat, lon: fixedLon, key });
      }
    }
  }

  if (pointsToQuery.length > 0) {
    const batch = pointsToQuery.slice(0, 30);
    try {
      const lats = batch.map(p => p.lat).join(',');
      const lons = batch.map(p => p.lon).join(',');
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,apparent_temperature`;
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : [data];

        items.forEach((item, idx) => {
          const pt = batch[idx];
          if (!pt) return;

          const temp = Number((item.current?.temperature_2m ?? 22).toFixed(1));
          const appTemp = Number((item.current?.apparent_temperature ?? temp).toFixed(1));
          const now = Date.now();

          tempLatticeCache.set(pt.key, { temp, appTemp, timestamp: now });

          results.push({
            id: `temp_${pt.key}`,
            latitude: pt.lat,
            longitude: pt.lon,
            temperature: temp,
            apparentTemperature: appTemp,
            weight: Math.min(1.0, Math.max(0.1, (temp - 10) / 30)),
            color: getTemperatureColor(temp),
            timestamp: now
          });
        });
      }
    } catch (err) {
      console.warn('Batch Open-Meteo temperature lattice fetch warning:', err);
    }
  }

  return results;
}
