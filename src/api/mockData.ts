import { Location, EnvironmentalMetrics, WasteHotspot, CommunityReport, CommunityAction, WhatIfInterventions } from '../types';

export const SUPPORTED_LOCATIONS: Location[] = [
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    country: 'India',
    center: [77.5946, 12.9716],
    zoom: 14.5,
    pitch: 58,
    bearing: -22,
    description: 'Silicon Plateau of India. Known as the Garden City, facing rapid urbanization, lake pollution, and localized heat anomalies.',
    population: '13.6 Million',
    altitudeMeters: 920,
    climateZone: 'Tropical Savanna (Aw)'
  },
  {
    id: 'delhi',
    name: 'Delhi NCR',
    country: 'India',
    center: [77.2090, 28.6139],
    zoom: 14.2,
    pitch: 62,
    bearing: 15,
    description: 'National Capital Territory. Faces severe seasonal particulate smog (PM2.5), high thermal inertia, and Yamuna basin challenges.',
    population: '33.0 Million',
    altitudeMeters: 216,
    climateZone: 'Semi-arid Continental (BSh)'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    center: [72.8777, 19.0760],
    zoom: 14.3,
    pitch: 55,
    bearing: -40,
    description: 'Peninsular megacity. High maritime humidity, crucial mangrove buffers, marine waste hotspots, and intense acoustic corridors.',
    population: '21.3 Million',
    altitudeMeters: 14,
    climateZone: 'Tropical Wet & Dry (Aw)'
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    center: [2.3522, 48.8566],
    zoom: 14.4,
    pitch: 54,
    bearing: 30,
    description: 'Dense historical basin. Active low-emission zones, urban forest initiatives, and Seine ecological rehabilitation.',
    population: '11.1 Million',
    altitudeMeters: 35,
    climateZone: 'Oceanic Temperate (Cfb)'
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    center: [139.6917, 35.6895],
    zoom: 14.6,
    pitch: 60,
    bearing: -10,
    description: 'World’s most populous metropolitan area. Advanced waste circularity, urban heat island mitigation, and precision acoustic engineering.',
    population: '37.4 Million',
    altitudeMeters: 40,
    climateZone: 'Humid Subtropical (Cfa)'
  }
];

export const CITY_METRICS: Record<string, EnvironmentalMetrics> = {
  bengaluru: {
    airQuality: {
      aqi: 142,
      pm25: 58.4,
      pm10: 104.2,
      dominantPollutant: 'PM2.5',
      no2: 38.6,
      o3: 42.1,
      co: 1.2,
      category: 'Unhealthy for Sensitive Groups'
    },
    greenCoverPercentage: 31.8,
    wasteIndex: 64,
    waterQualityIndex: 42,
    heatIslandAnomaly: 2.8,
    noiseLevelDb: 68.4,
    cleanlinessScore: 61,
    terraIndex: 58
  },
  delhi: {
    airQuality: {
      aqi: 278,
      pm25: 168.2,
      pm10: 245.0,
      dominantPollutant: 'PM2.5 / Biomass Haze',
      no2: 64.2,
      o3: 56.4,
      co: 2.8,
      category: 'Very Unhealthy'
    },
    greenCoverPercentage: 19.4,
    wasteIndex: 82,
    waterQualityIndex: 26,
    heatIslandAnomaly: 4.6,
    noiseLevelDb: 76.8,
    cleanlinessScore: 44,
    terraIndex: 38
  },
  mumbai: {
    airQuality: {
      aqi: 165,
      pm25: 72.8,
      pm10: 122.5,
      dominantPollutant: 'PM10 & Marine Aerosol',
      no2: 45.1,
      o3: 31.0,
      co: 1.6,
      category: 'Unhealthy'
    },
    greenCoverPercentage: 24.2,
    wasteIndex: 71,
    waterQualityIndex: 39,
    heatIslandAnomaly: 3.2,
    noiseLevelDb: 79.2,
    cleanlinessScore: 52,
    terraIndex: 49
  },
  paris: {
    airQuality: {
      aqi: 54,
      pm25: 12.8,
      pm10: 22.4,
      dominantPollutant: 'NO2',
      no2: 24.1,
      o3: 38.5,
      co: 0.4,
      category: 'Moderate'
    },
    greenCoverPercentage: 42.6,
    wasteIndex: 28,
    waterQualityIndex: 74,
    heatIslandAnomaly: 1.4,
    noiseLevelDb: 58.2,
    cleanlinessScore: 84,
    terraIndex: 82
  },
  tokyo: {
    airQuality: {
      aqi: 38,
      pm25: 8.5,
      pm10: 16.2,
      dominantPollutant: 'O3',
      no2: 18.2,
      o3: 34.0,
      co: 0.3,
      category: 'Good'
    },
    greenCoverPercentage: 36.4,
    wasteIndex: 14,
    waterQualityIndex: 88,
    heatIslandAnomaly: 1.9,
    noiseLevelDb: 54.6,
    cleanlinessScore: 94,
    terraIndex: 91
  }
};

export const WASTE_HOTSPOTS: Record<string, WasteHotspot[]> = {
  bengaluru: [
    {
      id: 'blr-w1',
      title: 'Bellandur Lake Catchment Inflow',
      coordinates: [77.6710, 12.9352],
      severity: 'high',
      volumeEst: 14200,
      wasteType: 'Plastic/Microplastics',
      detectionMethod: 'Satellite Spectral Analysis',
      recommendation: 'Deploy floating retention booms and automated microplastic skimming unit.'
    },
    {
      id: 'blr-w2',
      title: 'Electronic City Peripheral Dump',
      coordinates: [77.6650, 12.8450],
      severity: 'medium',
      volumeEst: 8400,
      wasteType: 'Electronic/Hazardous',
      detectionMethod: 'Drone LiDAR',
      recommendation: 'Hazardous materials segregation facility and municipal rapid cleanup crew.'
    },
    {
      id: 'blr-w3',
      title: 'KR Market Produce Terminal',
      coordinates: [77.5750, 12.9640],
      severity: 'high',
      volumeEst: 18600,
      wasteType: 'Organic Accumulation',
      detectionMethod: 'Citizen Ground Report',
      recommendation: 'Localized biomethanation plant and daily decentralized composting.'
    },
    {
      id: 'blr-w4',
      title: 'Hebbal Flyover Junction Sector',
      coordinates: [77.5920, 13.0360],
      severity: 'low',
      volumeEst: 3100,
      wasteType: 'Construction Debris',
      detectionMethod: 'Municipal IoT Sensor',
      recommendation: 'Recycled aggregate recovery route and nighttime enforcement.'
    }
  ],
  delhi: [
    {
      id: 'del-w1',
      title: 'Ghazipur Landfill Embankment',
      coordinates: [77.3280, 28.6250],
      severity: 'high',
      volumeEst: 85000,
      wasteType: 'Municipal Solid',
      detectionMethod: 'Satellite Spectral Analysis',
      recommendation: 'Methane extraction capture and continuous bio-mining operation.'
    },
    {
      id: 'del-w2',
      title: 'Okhla Industrial Catchment',
      coordinates: [77.2850, 28.5300],
      severity: 'high',
      volumeEst: 28400,
      wasteType: 'Electronic/Hazardous',
      detectionMethod: 'Drone LiDAR',
      recommendation: 'Industrial effluent treatment barrier and zero-sludge mandate.'
    }
  ],
  mumbai: [
    {
      id: 'mum-w1',
      title: 'Deonar Reclamation Edge',
      coordinates: [72.9300, 19.0600],
      severity: 'high',
      volumeEst: 62000,
      wasteType: 'Municipal Solid',
      detectionMethod: 'Satellite Spectral Analysis',
      recommendation: 'Gas recovery flaring upgrade and coastal runoff sealing.'
    },
    {
      id: 'mum-w2',
      title: 'Mithi River Outfall Buffer',
      coordinates: [72.8400, 19.0550],
      severity: 'high',
      volumeEst: 31000,
      wasteType: 'Plastic/Microplastics',
      detectionMethod: 'Drone LiDAR',
      recommendation: 'Automated solar trash interceptors and mangrove trash dredging.'
    }
  ],
  paris: [
    {
      id: 'par-w1',
      title: 'Canal Saint-Martin Overflow Point',
      coordinates: [2.3660, 48.8710],
      severity: 'low',
      volumeEst: 1800,
      wasteType: 'Plastic/Microplastics',
      detectionMethod: 'Citizen Ground Report',
      recommendation: 'Bi-weekly underwater robotic sweepers and riverside eco-bins.'
    }
  ],
  tokyo: [
    {
      id: 'tyo-w1',
      title: 'Sumida River Silt Reclaim Zone',
      coordinates: [139.7900, 35.7000],
      severity: 'low',
      volumeEst: 950,
      wasteType: 'Plastic/Microplastics',
      detectionMethod: 'Municipal IoT Sensor',
      recommendation: 'Precision acoustic bubble barriers to divert micro-debris.'
    }
  ]
};

export const COMMUNITY_REPORTS: Record<string, CommunityReport[]> = {
  bengaluru: [
    {
      id: 'cr-blr-1',
      coordinates: [77.6100, 12.9350],
      type: 'dumping',
      severity: 'high',
      title: 'Illegal Chemical Runoff near Koramangala Drain',
      description: 'Noticed dark chemical effluents entering stormwater channel with strong sulfuric odor.',
      locationName: '80ft Road, Koramangala 4th Block',
      timestamp: '14 minutes ago',
      upvotes: 47,
      author: 'Ananya S. (EcoGuard Volunteer)',
      status: 'Investigating'
    },
    {
      id: 'cr-blr-2',
      coordinates: [77.5850, 12.9750],
      type: 'green',
      severity: 'medium',
      title: 'Unauthorized Pruning & Tree Girdling',
      description: 'Three mature Gulmohar trees stripped down to trunks outside commercial development site.',
      locationName: 'Cubbon Park Peripheral Road',
      timestamp: '1 hour ago',
      upvotes: 112,
      author: 'Rohan K. (Urban Forestry Watch)',
      status: 'Action Scheduled'
    },
    {
      id: 'cr-blr-3',
      coordinates: [77.6400, 12.9800],
      type: 'air',
      severity: 'high',
      title: 'Open Commercial Plastic Smoldering',
      description: 'Recurring nighttime burning of shipping packaging producing thick toxic black plume.',
      locationName: 'Indiranagar 100ft Metro Corridor',
      timestamp: '3 hours ago',
      upvotes: 89,
      author: 'Dr. Vivek Sharma',
      status: 'Verified'
    },
    {
      id: 'cr-blr-4',
      coordinates: [77.6700, 12.9400],
      type: 'water',
      severity: 'high',
      title: 'Sudden Lake Foam Spillage into Traffic Artery',
      description: 'Wind-driven detergent/phosphate foam blowing onto the bridge causing hazardous visibility.',
      locationName: 'Yemalur Lake Culvert',
      timestamp: '5 hours ago',
      upvotes: 231,
      author: 'Citizens for Bengaluru Lakes',
      status: 'Verified'
    },
    {
      id: 'cr-blr-5',
      coordinates: [77.5600, 12.9250],
      type: 'noise',
      severity: 'medium',
      title: 'Heavy Diesel Generator Exceeding 85dB at Night',
      description: 'Unenclosed 250kVA generator operating within residential silence buffer.',
      locationName: 'Jayanagar 4th Block',
      timestamp: '7 hours ago',
      upvotes: 34,
      author: 'Pooja Hegde',
      status: 'Resolved'
    }
  ],
  delhi: [
    {
      id: 'cr-del-1',
      coordinates: [77.2200, 28.6300],
      type: 'air',
      severity: 'high',
      title: 'Construction Dust Cloud without Water Cannons',
      description: 'Demolition work active without mandatory anti-smog water sprinklers.',
      locationName: 'Connaught Place Outer Ring',
      timestamp: '35 minutes ago',
      upvotes: 142,
      author: 'CleanAir Delhi Taskforce',
      status: 'Investigating'
    }
  ],
  mumbai: [
    {
      id: 'cr-mum-1',
      coordinates: [72.8250, 18.9800],
      type: 'water',
      severity: 'high',
      title: 'Plastic Bottle Silt Trap Blockage',
      description: 'Over 2,000 PET bottles damming the tidal canal outlet prior to high tide.',
      locationName: 'Mahim Bay Estuary',
      timestamp: '42 minutes ago',
      upvotes: 98,
      author: 'Afroz Shah Beach Crew',
      status: 'Action Scheduled'
    }
  ],
  paris: [
    {
      id: 'cr-par-1',
      coordinates: [2.3400, 48.8500],
      type: 'noise',
      severity: 'low',
      title: 'Acoustic Barrier Defect near RER Track',
      description: 'Vibration absorbing rubber strip detached causing amplified rail rumble.',
      locationName: 'Saint-Michel Notre-Dame',
      timestamp: '2 hours ago',
      upvotes: 28,
      author: 'Jean-Luc M.',
      status: 'Investigating'
    }
  ],
  tokyo: [
    {
      id: 'cr-tyo-1',
      coordinates: [139.7000, 35.6900],
      type: 'waste',
      severity: 'low',
      title: 'Smart Reverse Vending Machine Full',
      description: 'Aluminum can sensor at maximum capacity outside Shinjuku Station east exit.',
      locationName: 'Shinjuku 3-Chome',
      timestamp: '18 minutes ago',
      upvotes: 19,
      author: 'Kenji T.',
      status: 'Resolved'
    }
  ]
};

export const COMMUNITY_ACTIONS: CommunityAction[] = [
  {
    id: 'act-1',
    coordinates: [77.6000, 12.9600],
    type: 'tree_planting',
    title: 'Miyawaki Micro-Forest Blitz: 500 Saplings',
    description: 'Community volunteers planted native biodiversity grove reducing localized surface heat.',
    participants: 124,
    targetMetric: '+1.4% Green Cover',
    timestamp: '2 hours ago'
  },
  {
    id: 'act-2',
    coordinates: [77.6710, 12.9352],
    type: 'cleanup_drive',
    title: 'Bellandur Shoreline De-weeding & Plastic Recovery',
    description: '1.8 Tons of multi-layer plastic recovered and diverted to pyrolysis fuel research.',
    participants: 86,
    targetMetric: '-8.2 Waste Index',
    timestamp: '5 hours ago'
  },
  {
    id: 'act-3',
    coordinates: [77.6150, 12.9380],
    type: 'sensor_install',
    title: 'TERRA Hyperlocal Hyper-Spectrometric Sensor #408',
    description: 'Solar-powered ambient PM2.5 + VOC sensor hooked into the real-time public mesh.',
    participants: 12,
    targetMetric: 'Precision AQI Tracking',
    timestamp: '8 hours ago'
  },
  {
    id: 'act-4',
    coordinates: [77.5800, 12.9700],
    type: 'water_restoration',
    title: 'Wetland Bio-Filter Floating Reed Installation',
    description: 'Constructed wetland islands installed to naturally oxidize dissolved contaminants.',
    participants: 45,
    targetMetric: '+6.1 Water Quality Index',
    timestamp: 'Yesterday'
  }
];

/**
 * Calculates simulated environmental impact based on WHAT-IF interventions.
 * Models urban canopy cooling, particulate deposition, waste diversion, and transit shift.
 */
export function calculateSimulation(
  baseline: EnvironmentalMetrics,
  interventions: WhatIfInterventions
): EnvironmentalMetrics {
  const { urbanTrees, wasteCollection, recycling, greenSpace, publicTransport } = interventions;

  // Trees & Green space absorb PM2.5, cool ambient temperature, increase water absorption
  const treeFactor = (urbanTrees * 0.6 + greenSpace * 0.4) / 100;
  const wasteFactor = (wasteCollection * 0.65 + recycling * 0.35) / 100;
  const transitFactor = publicTransport / 100;

  // AQI reduction: transit cuts emissions, trees trap particulates
  const aqiDrop = baseline.airQuality.aqi * (transitFactor * 0.32 + treeFactor * 0.24);
  const simAqi = Math.max(22, Math.round(baseline.airQuality.aqi - aqiDrop));

  const pm25Drop = baseline.airQuality.pm25 * (transitFactor * 0.35 + treeFactor * 0.28);
  const simPm25 = Math.max(5.0, Number((baseline.airQuality.pm25 - pm25Drop).toFixed(1)));

  const pm10Drop = baseline.airQuality.pm10 * (transitFactor * 0.30 + treeFactor * 0.25);
  const simPm10 = Math.max(10.0, Number((baseline.airQuality.pm10 - pm10Drop).toFixed(1)));

  // Green cover expansion
  const greenBonus = (urbanTrees * 0.14 + greenSpace * 0.22);
  const simGreen = Math.min(85, Number((baseline.greenCoverPercentage + greenBonus).toFixed(1)));

  // Waste index drops with collection and recycling
  const wasteReduction = baseline.wasteIndex * (wasteFactor * 0.72);
  const simWaste = Math.max(8, Math.round(baseline.wasteIndex - wasteReduction));

  // Water quality improves with less waste runoff and more green filtration
  const waterBonus = (wasteFactor * 24 + treeFactor * 16);
  const simWater = Math.min(96, Math.round(baseline.waterQualityIndex + waterBonus));

  // Heat island anomaly drops significantly with vegetation shading and reduced asphalt heat
  const heatReduction = (treeFactor * 1.8 + transitFactor * 0.4);
  const simHeat = Math.max(0.2, Number((baseline.heatIslandAnomaly - heatReduction).toFixed(1)));

  // Noise drops with public electric transit and vegetative acoustic dampening
  const noiseReduction = (transitFactor * 7.5 + treeFactor * 3.2);
  const simNoise = Math.max(45, Number((baseline.noiseLevelDb - noiseReduction).toFixed(1)));

  // Cleanliness improves
  const cleanBonus = (wasteFactor * 28 + greenSpace * 0.1);
  const simClean = Math.min(98, Math.round(baseline.cleanlinessScore + cleanBonus));

  // Overall TERRA Index composite
  const aqiScore = Math.max(0, 100 - (simAqi / 3));
  const heatScore = Math.max(0, 100 - (simHeat * 15));
  const simTerra = Math.min(99, Math.round(
    aqiScore * 0.25 +
    simGreen * 0.20 +
    (100 - simWaste) * 0.20 +
    simWater * 0.15 +
    simClean * 0.10 +
    heatScore * 0.10
  ));

  let category: EnvironmentalMetrics['airQuality']['category'] = 'Good';
  if (simAqi > 200) category = 'Very Unhealthy';
  else if (simAqi > 150) category = 'Unhealthy';
  else if (simAqi > 100) category = 'Unhealthy for Sensitive Groups';
  else if (simAqi > 50) category = 'Moderate';

  return {
    airQuality: {
      ...baseline.airQuality,
      aqi: simAqi,
      pm25: simPm25,
      pm10: simPm10,
      category
    },
    greenCoverPercentage: simGreen,
    wasteIndex: simWaste,
    waterQualityIndex: simWater,
    heatIslandAnomaly: simHeat,
    noiseLevelDb: simNoise,
    cleanlinessScore: simClean,
    terraIndex: simTerra
  };
}
