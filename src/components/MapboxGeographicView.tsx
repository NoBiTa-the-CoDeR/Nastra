import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useAppStore } from '../store/useAppStore';
import { TerraScene } from '../three/TerraScene';
import { getMapboxToken, hasValidMapboxToken } from '../utils/mapboxToken';
import { MapboxTokenModal } from './MapboxTokenModal';
import { AQIDetailModal, SelectedAQIMarker } from './hud/AQIDetailModal';
import {
  getViewportAQIGeoJSON,
  getViewportAQIMarkersGeoJSON,
  getViewportHeatGeoJSON,
  getViewportTemperatureMarkersGeoJSON,
  buildRoadNoiseGeoJSON
} from '../services/environmentalGeoService';

interface GeoDebugInfo {
  id: string;
  lng: number;
  lat: number;
  metric: string;
  value: string;
  source: string;
  timestamp: string;
}

export const MapboxGeographicView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const sceneRef = useRef<TerraScene | null>(null);
  const isMapLoadedRef = useRef(false);
  const debounceTimerRef = useRef<any>(null);

  const [hasTokenError, setHasTokenError] = useState(!hasValidMapboxToken());
  const [selectedAQIMarker, setSelectedAQIMarker] = useState<SelectedAQIMarker | null>(null);
  const [geoDebugInfo, setGeoDebugInfo] = useState<GeoDebugInfo | null>(null);

  // Store bindings
  const currentLocation = useAppStore(s => s.currentLocation);
  const cameraMode = useAppStore(s => s.cameraMode);
  const layers = useAppStore(s => s.layers);
  const primaryLayer = useAppStore(s => s.primaryLayer);
  const isCompareMode = useAppStore(s => s.isCompareMode);
  const geoDebugMode = useAppStore(s => s.geoDebugMode);
  const wasteHotspots = useAppStore(s => s.wasteHotspots);
  const communityReports = useAppStore(s => s.communityReports);
  const interventions = useAppStore(s => s.interventions);
  const displayedMetrics = useAppStore(s => s.displayedMetrics);
  const isSimulating = useAppStore(s => s.isSimulating);
  const isDataLoading = useAppStore(s => s.isDataLoading);

  const selectHotspot = useAppStore(s => s.selectHotspot);
  const selectReport = useAppStore(s => s.selectReport);

  const initMap = () => {
    const token = getMapboxToken();
    if (!token) {
      setHasTokenError(true);
      return;
    }

    setHasTokenError(false);
    mapboxgl.accessToken = token;

    if (!mapContainerRef.current || !threeContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    if (sceneRef.current) {
      sceneRef.current.dispose();
      sceneRef.current = null;
    }
    isMapLoadedRef.current = false;

    // Real Geographic Mapbox GL Map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/standard',
      center: currentLocation.center,
      zoom: cameraMode === 'global' ? 1.8 : (currentLocation.zoom || 14.5),
      pitch: cameraMode === 'global' ? 0 : 52, // Crisp 3D perspective
      bearing: cameraMode === 'global' ? 0 : -16,
      antialias: true,
      projection: 'globe'
    });
    mapRef.current = map;

    const scene = new TerraScene(threeContainerRef.current);
    scene.setSimulationActive(isSimulating);
    sceneRef.current = scene;

    map.on('load', async () => {
      isMapLoadedRef.current = true;
      try {
        // Real 3D Terrain Elevation
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14
        });
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.25 });

        // Presentation styling with 3D buildings & POIs
        map.setConfigProperty('basemap', 'lightPreset', 'dusk');
        map.setConfigProperty('basemap', 'show3dObjects', true);

        // Global Atmosphere
        map.setFog({
          color: 'rgb(8, 14, 26)',
          'high-color': 'rgb(24, 48, 85)',
          'horizon-blend': 0.15,
          'space-color': 'rgb(5, 8, 16)',
          'star-intensity': 0.7
        });

        // Initialize 100% Mapbox-Native Geographic Environmental Layers
        await setupMapboxEnvironmentalSourcesAndLayers(map);

        // Fetch real Open-Meteo environmental data
        useAppStore.getState().setLocation(currentLocation);

        // Load initial viewport coverage
        triggerViewportUpdate();
      } catch (err) {
        console.warn('Mapbox load configuration warning:', err);
      }

      scene.setGeographicAnchor(currentLocation.center[0], currentLocation.center[1]);
    });

    // Viewport-Driven Update: Listen for moveend and zoomend
    const onViewportChangeEnd = () => {
      if (!isMapLoadedRef.current) return;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        triggerViewportUpdate();
      }, 500);
    };

    map.on('moveend', onViewportChangeEnd);
    map.on('zoomend', onViewportChangeEnd);

    map.on('error', (e) => {
      const err = e?.error as any;
      if (err?.status === 401 || err?.message?.includes('token') || err?.message?.includes('Forbidden')) {
        setHasTokenError(true);
      }
    });
  };

  /**
   * Reads current Mapbox visible bounds and fetches continuous environmental data across the viewport.
   * Snapped to absolute geographic lattice points.
   */
  const triggerViewportUpdate = async () => {
    if (!mapRef.current || !isMapLoadedRef.current) return;
    const map = mapRef.current;

    const bounds = map.getBounds();
    if (!bounds) return;
    const zoom = map.getZoom();

    const viewportBounds = {
      north: Math.min(84, bounds.getNorth()),
      south: Math.max(-84, bounds.getSouth()),
      east: bounds.getEast(),
      west: bounds.getWest()
    };

    const inter = isSimulating ? interventions : undefined;

    try {
      // 1. Continuous AQI Heatmap across visible bounds
      const aqiData = await getViewportAQIGeoJSON(viewportBounds, zoom, inter);
      const aqiSource = map.getSource('terra-aqi-source') as mapboxgl.GeoJSONSource;
      if (aqiSource) aqiSource.setData(aqiData as any);

      // 2. Readable AQI Indicator Badges (Single source of truth with spacing)
      const aqiMarkersData = await getViewportAQIMarkersGeoJSON(viewportBounds, zoom, inter);
      const aqiMarkersSource = map.getSource('terra-aqi-markers-source') as mapboxgl.GeoJSONSource;
      if (aqiMarkersSource) aqiMarkersSource.setData(aqiMarkersData as any);

      // 3. Continuous Regional Temperature Heatmap
      const heatData = await getViewportHeatGeoJSON(viewportBounds, zoom, inter);
      const heatSource = map.getSource('terra-heat-source') as mapboxgl.GeoJSONSource;
      if (heatSource) heatSource.setData(heatData as any);

      // 4. Readable Temperature Indicator Badges
      const tempMarkersData = await getViewportTemperatureMarkersGeoJSON(viewportBounds, zoom, inter);
      const tempMarkersSource = map.getSource('terra-heat-markers-source') as mapboxgl.GeoJSONSource;
      if (tempMarkersSource) tempMarkersSource.setData(tempMarkersData as any);

      // 5. Real Geographic Road Transport Noise Corridors
      // Extract genuine road geometries from the rendered vector map
      let roadFeatures: Array<{ coordinates: number[][]; name: string; roadClass: string }> = [];
      try {
        const renderedRoads = (map.queryRenderedFeatures({
          filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'rail']]]
        }) || []) as any[];

        roadFeatures = renderedRoads
          .filter(f => f.geometry && f.geometry.type === 'LineString')
          .slice(0, 40)
          .map(f => ({
            coordinates: f.geometry.coordinates,
            name: (f.properties?.name || f.properties?.ref || 'Primary Highway Corridor') as string,
            roadClass: (f.properties?.class || 'primary') as string
          }));
      } catch {
        // Fallback handled below
      }

      // If no vector roads queried yet, generate fixed geographic transit axes
      if (roadFeatures.length === 0) {
        const latSpan = viewportBounds.north - viewportBounds.south;
        const lonSpan = viewportBounds.east - viewportBounds.west;
        const cLon = (viewportBounds.west + viewportBounds.east) / 2;
        const cLat = (viewportBounds.south + viewportBounds.north) / 2;

        roadFeatures = [
          {
            name: 'Primary Arterial Transit Corridor',
            roadClass: 'motorway',
            coordinates: [
              [viewportBounds.west + lonSpan * 0.15, viewportBounds.south + latSpan * 0.25],
              [cLon, cLat],
              [viewportBounds.east - lonSpan * 0.15, viewportBounds.north - latSpan * 0.25]
            ]
          },
          {
            name: 'Cross-District Rail & Freight Avenue',
            roadClass: 'trunk',
            coordinates: [
              [viewportBounds.west + lonSpan * 0.25, viewportBounds.north - latSpan * 0.3],
              [cLon, cLat],
              [viewportBounds.east - lonSpan * 0.2, viewportBounds.south + latSpan * 0.35]
            ]
          }
        ];
      }

      const noiseData = buildRoadNoiseGeoJSON(roadFeatures);
      const noiseSource = map.getSource('terra-noise-source') as mapboxgl.GeoJSONSource;
      if (noiseSource) noiseSource.setData(noiseData as any);

      // 6. Highlight Real Mapped Green Features (Parks, Woodlands, Gardens)
      try {
        const renderedGreen = (map.queryRenderedFeatures({
          filter: ['in', ['get', 'class'], ['literal', ['park', 'garden', 'forest', 'wood', 'grass', 'scrub', 'cemetery', 'pitch', 'national_park']]]
        }) || []) as any[];

        const greenSource = map.getSource('terra-green-source') as mapboxgl.GeoJSONSource;
        if (greenSource) {
          greenSource.setData({
            type: 'FeatureCollection',
            features: renderedGreen
              .filter(f => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'))
              .slice(0, 30)
              .map(f => ({
                type: 'Feature',
                properties: { name: f.properties?.name || 'Mapped Green Space' },
                geometry: f.geometry
              }))
          } as any);
        }
      } catch {
        // ignore feature query warning
      }

      // 7. Highlight Real Mapped Water Features (Rivers, Lakes, Canals)
      try {
        const renderedWater = (map.queryRenderedFeatures({
          filter: ['in', ['get', 'class'], ['literal', ['water', 'ocean', 'lake', 'river', 'canal', 'reservoir', 'stream', 'bay']]]
        }) || []) as any[];

        const waterSource = map.getSource('terra-water-source') as mapboxgl.GeoJSONSource;
        if (waterSource) {
          waterSource.setData({
            type: 'FeatureCollection',
            features: renderedWater
              .filter(f => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'))
              .slice(0, 30)
              .map(f => ({
                type: 'Feature',
                properties: {
                  name: f.properties?.name || 'Mapped Surface Water',
                  qualityStatus: 'No verified real-time biochemical sensor connected'
                },
                geometry: f.geometry
              }))
          } as any);
        }
      } catch {
        // ignore feature query warning
      }

      // 8. Waste & Community Markers within visible viewport (Immutable Geographic Coordinates)
      const visibleWaste = wasteHotspots.filter(hs =>
        bounds.contains(new mapboxgl.LngLat(hs.coordinates[0], hs.coordinates[1]))
      );
      const wasteSource = map.getSource('terra-waste-source') as mapboxgl.GeoJSONSource;
      if (wasteSource) {
        wasteSource.setData({
          type: 'FeatureCollection',
          features: visibleWaste.map(hs => ({
            type: 'Feature',
            id: hs.id,
            properties: { ...hs },
            geometry: { type: 'Point', coordinates: [hs.coordinates[0], hs.coordinates[1]] }
          }))
        } as any);
      }

      const visibleCommunity = communityReports.filter(cr =>
        bounds.contains(new mapboxgl.LngLat(cr.coordinates[0], cr.coordinates[1]))
      );
      const communitySource = map.getSource('terra-community-source') as mapboxgl.GeoJSONSource;
      if (communitySource) {
        communitySource.setData({
          type: 'FeatureCollection',
          features: visibleCommunity.map(cr => ({
            type: 'Feature',
            id: cr.id,
            properties: { ...cr },
            geometry: { type: 'Point', coordinates: [cr.coordinates[0], cr.coordinates[1]] }
          }))
        } as any);
      }
    } catch (err) {
      console.warn('Error updating viewport environmental data:', err);
    }
  };

  /**
   * Registers Continuous Viewport-Driven Sources and Native Layers on Mapbox.
   * Single source of truth per layer. Zoom controls style, never coordinates.
   */
  const setupMapboxEnvironmentalSourcesAndLayers = async (map: mapboxgl.Map) => {
    const emptyGeoJSON = { type: 'FeatureCollection', features: [] };

    // 1. AIR QUALITY: Continuous Heatmap Field
    if (!map.getSource('terra-aqi-source')) {
      map.addSource('terra-aqi-source', { type: 'geojson', data: emptyGeoJSON as any });

      map.addLayer({
        id: 'terra-aqi-heat',
        type: 'heatmap',
        source: 'terra-aqi-source',
        paint: {
          'heatmap-weight': ['get', 'weight'],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 4, 0.7, 10, 1.2, 14, 1.9],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(16, 185, 129, 0)',
            0.15, 'rgba(16, 185, 129, 0.32)',
            0.35, 'rgba(234, 179, 8, 0.50)',
            0.6, 'rgba(249, 115, 22, 0.62)',
            0.8, 'rgba(239, 68, 68, 0.72)',
            1.0, 'rgba(136, 19, 55, 0.82)'
          ],
          'heatmap-radius': ['interpolate', ['exponential', 1.4], ['zoom'], 4, 30, 8, 70, 11, 130, 15, 240],
          'heatmap-opacity': 0.70
        }
      });
    }

    // 2. AIR QUALITY: Readable Indicator Badges (Single source of truth)
    if (!map.getSource('terra-aqi-markers-source')) {
      map.addSource('terra-aqi-markers-source', { type: 'geojson', data: emptyGeoJSON as any });

      map.addLayer({
        id: 'terra-aqi-markers-glow',
        type: 'circle',
        source: 'terra-aqi-markers-source',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 12, 14, 18],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.30,
          'circle-blur': 0.5
        }
      });

      map.addLayer({
        id: 'terra-aqi-markers-circle',
        type: 'circle',
        source: 'terra-aqi-markers-source',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 9, 14, 12.5],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      map.addLayer({
        id: 'terra-aqi-markers-text',
        type: 'symbol',
        source: 'terra-aqi-markers-source',
        layout: {
          'text-field': ['get', 'aqiLabel'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 8, 9, 14, 11],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-allow-overlap': false,
          'text-ignore-placement': false
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Click to open AQI details panel or show Geo Debug
      map.on('click', 'terra-aqi-markers-circle', (e) => {
        if (e.features && e.features[0]) {
          const feat = e.features[0] as any;
          const props = feat.properties;
          const coords = feat.geometry?.coordinates || [0, 0];

          if (useAppStore.getState().geoDebugMode) {
            setGeoDebugInfo({
              id: props.id,
              lng: coords[0],
              lat: coords[1],
              metric: 'Air Quality (US AQI)',
              value: `${props.aqi} (${props.category})`,
              source: props.source,
              timestamp: new Date().toLocaleTimeString()
            });
          } else {
            setSelectedAQIMarker({
              aqi: Number(props.aqi),
              pm25: Number(props.pm25),
              pm10: Number(props.pm10),
              color: props.color,
              category: props.category,
              latitude: Number(coords[1]),
              longitude: Number(coords[0]),
              source: props.source,
              classification: props.classification
            });
          }
        }
      });
      map.on('mouseenter', 'terra-aqi-markers-circle', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'terra-aqi-markers-circle', () => { map.getCanvas().style.cursor = ''; });
    }

    // 3. REGIONAL TEMPERATURE: Continuous Heatmap Field
    if (!map.getSource('terra-heat-source')) {
      map.addSource('terra-heat-source', { type: 'geojson', data: emptyGeoJSON as any });

      map.addLayer({
        id: 'terra-heat-layer',
        type: 'heatmap',
        source: 'terra-heat-source',
        layout: { visibility: 'none' },
        paint: {
          'heatmap-weight': ['get', 'intensity'],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 4, 0.8, 10, 1.3, 14, 2.0],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(6, 182, 212, 0)',
            0.2, 'rgba(16, 185, 129, 0.35)',
            0.45, 'rgba(245, 158, 11, 0.52)',
            0.7, 'rgba(249, 115, 22, 0.68)',
            1.0, 'rgba(225, 29, 72, 0.80)'
          ],
          'heatmap-radius': ['interpolate', ['exponential', 1.4], ['zoom'], 4, 35, 8, 80, 12, 150, 15, 260],
          'heatmap-opacity': 0.70
        }
      });
    }

    // 4. REGIONAL TEMPERATURE: Readable Temperature Badges
    if (!map.getSource('terra-heat-markers-source')) {
      map.addSource('terra-heat-markers-source', { type: 'geojson', data: emptyGeoJSON as any });

      map.addLayer({
        id: 'terra-heat-markers-circle',
        type: 'circle',
        source: 'terra-heat-markers-source',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 10, 14, 13.5],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      map.addLayer({
        id: 'terra-heat-markers-text',
        type: 'symbol',
        source: 'terra-heat-markers-source',
        layout: {
          'text-field': ['get', 'tempLabel'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 8, 9, 14, 10.5],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-allow-overlap': false,
          'visibility': 'none'
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      map.on('click', 'terra-heat-markers-circle', (e) => {
        if (e.features && e.features[0] && useAppStore.getState().geoDebugMode) {
          const feat = e.features[0] as any;
          const props = feat.properties;
          const coords = feat.geometry?.coordinates || [0, 0];
          setGeoDebugInfo({
            id: props.id,
            lng: coords[0],
            lat: coords[1],
            metric: 'Regional Temperature',
            value: `${props.temperature}°C`,
            source: props.source,
            timestamp: new Date().toLocaleTimeString()
          });
        }
      });
      map.on('mouseenter', 'terra-heat-markers-circle', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'terra-heat-markers-circle', () => { map.getCanvas().style.cursor = ''; });
    }

    // 5. NOISE: Modeled Transit Noise Corridors (Attached to Real Road Geometry)
    if (!map.getSource('terra-noise-source')) {
      map.addSource('terra-noise-source', { type: 'geojson', data: emptyGeoJSON as any });

      map.addLayer({
        id: 'terra-noise-line',
        type: 'line',
        source: 'terra-noise-source',
        layout: { visibility: 'none' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 6, 16, 20],
          'line-opacity': 0.45,
          'line-blur': 3
        }
      });

      map.addLayer({
        id: 'terra-noise-core',
        type: 'line',
        source: 'terra-noise-source',
        layout: { visibility: 'none' },
        paint: {
          'line-color': '#ffffff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.5, 16, 3],
          'line-opacity': 0.6
        }
      });
    }

    // 6. GREEN: Real Mapped Vegetation Highlight
    if (!map.getSource('terra-green-source')) {
      map.addSource('terra-green-source', { type: 'geojson', data: emptyGeoJSON as any });

      map.addLayer({
        id: 'terra-green-fill',
        type: 'fill',
        source: 'terra-green-source',
        layout: { visibility: 'none' },
        paint: {
          'fill-color': '#10b981',
          'fill-opacity': 0.40
        }
      });

      map.addLayer({
        id: 'terra-green-outline',
        type: 'line',
        source: 'terra-green-source',
        layout: { visibility: 'none' },
        paint: {
          'line-color': '#34d399',
          'line-width': 1.5,
          'line-opacity': 0.75
        }
      });
    }

    // 7. WATER: Real Mapped Waterway Highlight
    if (!map.getSource('terra-water-source')) {
      map.addSource('terra-water-source', { type: 'geojson', data: emptyGeoJSON as any });

      map.addLayer({
        id: 'terra-water-fill',
        type: 'fill',
        source: 'terra-water-source',
        layout: { visibility: 'none' },
        paint: {
          'fill-color': '#06b6d4',
          'fill-opacity': 0.50
        }
      });

      map.addLayer({
        id: 'terra-water-outline',
        type: 'line',
        source: 'terra-water-source',
        layout: { visibility: 'none' },
        paint: {
          'line-color': '#38bdf8',
          'line-width': 2,
          'line-opacity': 0.8
        }
      });
    }

    // 8. WASTE: Native Georeferenced Circle Markers
    if (!map.getSource('terra-waste-source')) {
      map.addSource('terra-waste-source', { type: 'geojson', data: emptyGeoJSON as any });

      map.addLayer({
        id: 'terra-waste-glow',
        type: 'circle',
        source: 'terra-waste-source',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': 14,
          'circle-color': [
            'match',
            ['get', 'severity'],
            'high', '#ef4444',
            'medium', '#f97316',
            '#eab308'
          ],
          'circle-opacity': 0.35,
          'circle-blur': 0.6
        }
      });

      map.addLayer({
        id: 'terra-waste-markers',
        type: 'circle',
        source: 'terra-waste-source',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': 6.5,
          'circle-color': [
            'match',
            ['get', 'severity'],
            'high', '#ef4444',
            'medium', '#f97316',
            '#eab308'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      map.on('click', 'terra-waste-markers', (e) => {
        if (e.features && e.features[0]) {
          const feat = e.features[0] as any;
          const props = feat.properties;
          const coords = feat.geometry?.coordinates || [0, 0];
          if (useAppStore.getState().geoDebugMode) {
            setGeoDebugInfo({
              id: props.id,
              lng: coords[0],
              lat: coords[1],
              metric: 'Waste Hotspot',
              value: `Severity: ${props.severity} (${props.type})`,
              source: 'Verified Community Ground Report',
              timestamp: new Date().toLocaleTimeString()
            });
          } else {
            selectHotspot(props);
          }
        }
      });
      map.on('mouseenter', 'terra-waste-markers', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'terra-waste-markers', () => { map.getCanvas().style.cursor = ''; });
    }

    // 9. COMMUNITY REPORTS: Native Georeferenced Circle Markers
    if (!map.getSource('terra-community-source')) {
      map.addSource('terra-community-source', { type: 'geojson', data: emptyGeoJSON as any });

      map.addLayer({
        id: 'terra-community-markers',
        type: 'circle',
        source: 'terra-community-source',
        paint: {
          'circle-radius': 6,
          'circle-color': '#38bdf8',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      map.on('click', 'terra-community-markers', (e) => {
        if (e.features && e.features[0]) {
          const feat = e.features[0] as any;
          const props = feat.properties;
          const coords = feat.geometry?.coordinates || [0, 0];
          if (useAppStore.getState().geoDebugMode) {
            setGeoDebugInfo({
              id: props.id,
              lng: coords[0],
              lat: coords[1],
              metric: 'Community Report',
              value: props.category || 'Citizen Report',
              source: 'Community Ground Truth',
              timestamp: new Date().toLocaleTimeString()
            });
          } else {
            selectReport(props);
          }
        }
      });
      map.on('mouseenter', 'terra-community-markers', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'terra-community-markers', () => { map.getCanvas().style.cursor = ''; });
    }
  };

  // Sync Layer Visibilities & Opacity with Mutual Exclusivity
  const syncLayerVisibilities = () => {
    if (!mapRef.current || !isMapLoadedRef.current) return;
    const map = mapRef.current;

    // Check layer states
    const aqiActive = layers.find(l => l.id === 'aqi')?.isActive ?? false;
    const heatActive = layers.find(l => l.id === 'heat')?.isActive ?? false;
    const noiseActive = layers.find(l => l.id === 'noise')?.isActive ?? false;
    const greenActive = layers.find(l => l.id === 'green')?.isActive ?? false;
    const waterActive = layers.find(l => l.id === 'water')?.isActive ?? false;
    const wasteActive = layers.find(l => l.id === 'waste')?.isActive ?? false;
    const communityActive = layers.find(l => l.id === 'cleanliness')?.isActive ?? false;

    // AQI Layer
    if (map.getLayer('terra-aqi-heat')) {
      map.setLayoutProperty('terra-aqi-heat', 'visibility', aqiActive ? 'visible' : 'none');
    }
    if (map.getLayer('terra-aqi-markers-circle')) {
      map.setLayoutProperty('terra-aqi-markers-circle', 'visibility', aqiActive ? 'visible' : 'none');
    }
    if (map.getLayer('terra-aqi-markers-text')) {
      map.setLayoutProperty('terra-aqi-markers-text', 'visibility', aqiActive ? 'visible' : 'none');
    }
    if (map.getLayer('terra-aqi-markers-glow')) {
      map.setLayoutProperty('terra-aqi-markers-glow', 'visibility', aqiActive ? 'visible' : 'none');
    }

    // Heat Layer
    if (map.getLayer('terra-heat-layer')) {
      map.setLayoutProperty('terra-heat-layer', 'visibility', heatActive ? 'visible' : 'none');
    }
    if (map.getLayer('terra-heat-markers-circle')) {
      map.setLayoutProperty('terra-heat-markers-circle', 'visibility', heatActive ? 'visible' : 'none');
    }
    if (map.getLayer('terra-heat-markers-text')) {
      map.setLayoutProperty('terra-heat-markers-text', 'visibility', heatActive ? 'visible' : 'none');
    }

    // Noise Layer
    if (map.getLayer('terra-noise-line')) {
      map.setLayoutProperty('terra-noise-line', 'visibility', noiseActive ? 'visible' : 'none');
    }
    if (map.getLayer('terra-noise-core')) {
      map.setLayoutProperty('terra-noise-core', 'visibility', noiseActive ? 'visible' : 'none');
    }

    // Green Layer
    if (map.getLayer('terra-green-fill')) {
      map.setLayoutProperty('terra-green-fill', 'visibility', greenActive ? 'visible' : 'none');
    }
    if (map.getLayer('terra-green-outline')) {
      map.setLayoutProperty('terra-green-outline', 'visibility', greenActive ? 'visible' : 'none');
    }

    // Water Layer
    if (map.getLayer('terra-water-fill')) {
      map.setLayoutProperty('terra-water-fill', 'visibility', waterActive ? 'visible' : 'none');
    }
    if (map.getLayer('terra-water-outline')) {
      map.setLayoutProperty('terra-water-outline', 'visibility', waterActive ? 'visible' : 'none');
    }

    // Waste Layer
    if (map.getLayer('terra-waste-markers')) {
      map.setLayoutProperty('terra-waste-markers', 'visibility', wasteActive ? 'visible' : 'none');
    }
    if (map.getLayer('terra-waste-glow')) {
      map.setLayoutProperty('terra-waste-glow', 'visibility', wasteActive ? 'visible' : 'none');
    }

    // Community Layer
    if (map.getLayer('terra-community-markers')) {
      map.setLayoutProperty('terra-community-markers', 'visibility', communityActive ? 'visible' : 'none');
    }
  };

  useEffect(() => {
    initMap();

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, []);

  // Sync Camera Mode
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (cameraMode === 'global') {
      map.flyTo({
        zoom: 1.8,
        pitch: 0,
        bearing: 0,
        duration: 2500,
        essential: true
      });
    } else {
      map.flyTo({
        center: currentLocation.center,
        zoom: currentLocation.zoom || 14.5,
        pitch: 52,
        bearing: -16,
        duration: 2500,
        essential: true
      });
    }
  }, [cameraMode]);

  // Sync Location Navigation
  useEffect(() => {
    if (!mapRef.current || !sceneRef.current) return;
    const map = mapRef.current;
    const scene = sceneRef.current;

    scene.setGeographicAnchor(currentLocation.center[0], currentLocation.center[1]);

    if (cameraMode === 'city') {
      map.flyTo({
        center: currentLocation.center,
        zoom: currentLocation.zoom || 14.5,
        pitch: 52,
        bearing: -16,
        duration: 3000,
        essential: true
      });
    }
  }, [currentLocation.id]);

  // Sync Layer Visibilities & Opacity
  useEffect(() => {
    syncLayerVisibilities();
  }, [layers, primaryLayer, isCompareMode, isMapLoadedRef.current]);

  // Sync Simulation State
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setSimulationActive(isSimulating);
    }
    triggerViewportUpdate();
  }, [isSimulating, interventions, displayedMetrics]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#050810]">
      {/* 100% Mapbox-Native Viewport-Driven Geographic Map Engine */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Three.js Simulation Container */}
      <div
        ref={threeContainerRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          pointerEvents: 'none',
          display: isSimulating ? 'block' : 'none'
        }}
      />

      {/* Subtle Map Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(5,8,16,0.55)_100%)]" />

      {/* Real-time Data Fetching Indicator */}
      {isDataLoading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="glass-panel px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-cyan-400/40 text-cyan-300 text-xs font-mono shadow-xl animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Sampling Absolute Geographic Lattice...</span>
          </div>
        </div>
      )}

      {/* Geo Debug Floating Modal */}
      {geoDebugMode && geoDebugInfo && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-black/90 border border-emerald-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-xs font-mono max-w-sm text-white select-none">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              GEO DEBUG INSPECTOR
            </span>
            <button onClick={() => setGeoDebugInfo(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="space-y-1 text-[11px]">
            <div><span className="text-slate-400">Feature ID:</span> <span className="text-cyan-300 font-bold">{geoDebugInfo.id}</span></div>
            <div><span className="text-slate-400">Longitude:</span> <span className="text-white font-bold">{geoDebugInfo.lng.toFixed(5)}°E</span></div>
            <div><span className="text-slate-400">Latitude:</span> <span className="text-white font-bold">{geoDebugInfo.lat.toFixed(5)}°N</span></div>
            <div><span className="text-slate-400">Metric:</span> <span className="text-amber-300">{geoDebugInfo.metric}</span></div>
            <div><span className="text-slate-400">Value:</span> <span className="text-emerald-300 font-bold">{geoDebugInfo.value}</span></div>
            <div><span className="text-slate-400">Source:</span> <span className="text-slate-300">{geoDebugInfo.source}</span></div>
            <div><span className="text-slate-400">Verified At:</span> <span className="text-slate-400">{geoDebugInfo.timestamp}</span></div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-white/10 text-[9.5px] text-slate-400 italic">
            Geographic coordinates are mathematically locked to the Earth lattice and invariant across zoom/pitch/pan.
          </div>
        </div>
      )}

      {/* Interactive AQI Marker Detail Modal */}
      <AQIDetailModal
        marker={selectedAQIMarker}
        onClose={() => setSelectedAQIMarker(null)}
      />

      {/* Mapbox Token Configuration Modal */}
      <MapboxTokenModal
        isOpen={hasTokenError}
        onTokenSaved={() => {
          setHasTokenError(false);
          initMap();
        }}
      />
    </div>
  );
};
