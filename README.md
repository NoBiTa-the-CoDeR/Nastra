# TERRA — 3D Environmental Intelligence & Climate Digital Twin Platform

> **"See the environment. Understand it. Change it."**

TERRA is a next-generation **3D Environmental Digital Twin** built to diagnose urban environmental stress, model micro-climates, and project sustainable interventions in real time. It combines real-world numerical weather prediction models, European Copernicus CAMS atmospheric chemistry reanalysis, and Mapbox 3D geographic vectors into a responsive digital twin.

---

## Key Features

### 1. Viewport-Driven Atmospheric Intelligence (Air Quality)
- **Continuous Atmospheric Field**: Real-time US Air Quality Index (AQI), $\text{PM}_{2.5}$, and $\text{PM}_{10}$ sampled from Open-Meteo and Copernicus CAMS.
- **Readable Ground Indicator Badges**: Clean floating numeric badges (e.g. `● 42`, `● 74`, `● 107`) anchored to an **Absolute Geographic Lattice Grid** that never shift or drift during zoom, pitch, or pan.
- **Detailed Sample Inspector**: Inspect pollutant mass concentration ($\mu\text{g/m}^3$), geographic coordinates, and scientific provenance.

### 2. Thermal & Climate Modeling
- **Ambient Air Temperature**: 2m ambient temperature and apparent feels-like differential.
- **Urban Heat Risk**: Modeled heat island anomaly estimations contrasting dense built-up corridors with vegetation canopies.

### 3. Real Mapped Geography
- **Vegetation & Green Canopy**: Vector highlights of gazetted parks, botanic gardens, nature reserves, and urban woodlands.
- **Hydrography**: Real surface water features (rivers, lakes, canals, reservoirs) with verified data status flags.
- **Modeled Acoustic Exposure**: Real road-locked noise corridors derived from motorway, railway, and primary transit hierarchies ($62\text{–}78\text{ dB(A)}$).

### 4. Interactive "What-If" Policy Simulator
- Model urban policy interventions:
  - **Urban Forest Expansion** (Tree canopy density)
  - **Public Transit Electrification** (Emissions reduction)
  - **Industrial Emission Caps**
  - **Green Corridor Integration**
- Live illustrative recalculation of AQI mitigation, localized cooling, and the composite TERRA Index.

### 5. AI Copilot & Digital Twin Projection
- **TERRA-AI Copilot**: Multi-turn conversational diagnostics powered by Google Gemini (`@google/genai` SDK) delivering contextual policy recommendations.
- **Future Vision Projection**: Environmental future scenario synthesis for sustainable urban planning.

### 6. Citizen Ground Truth & Community Action
- Georeferenced community waste reporting with photo upload and coordinate pinning.
- Collaborative municipal cleanup initiatives and community action tracking.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React
- **Geospatial & 3D**: Mapbox GL JS (Globe projection + 3D Terrain DEM + 3D Buildings), Three.js
- **Backend**: Node.js, Express, tsx
- **AI Engine**: Google Gemini API (`@google/genai` TypeScript SDK)
- **Data Providers**:
  - Open-Meteo Air Quality API / Copernicus CAMS
  - Open-Meteo Weather Forecast API (NOAA GFS / ECMWF IFS)
  - OpenStreetMap & Mapbox Vector Tiles

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or bun

### 1. Clone the Repository
```bash
git clone https://github.com/NoBiTa-the-CoDeR/Climate_Change_C-2.git
cd Climate_Change_C-2
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env
```

Configure your API keys in `.env` (or pass via environment):
```env
# Google Gemini API Key (Server-side)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Mapbox Access Token (can also be entered in the in-app prompt)
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_public_token_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## Data Provenance & Methodology

Every metric in the TERRA platform is tagged with its scientific classification:
- **`EXTERNAL_MODEL`**: Atmospheric and meteorological numerical prediction data (Open-Meteo / Copernicus CAMS).
- **`REAL_MAPPED`**: Verified geographic vector features from Mapbox & OpenStreetMap.
- **`MODELED_GEOGRAPHIC`**: Transport network proximity models (Acoustic exposure).
- **`COMMUNITY_VERIFIED`**: Citizen ground truth reports pinned to GPS coordinates.
- **`UNAVAILABLE`**: Clear, transparent indicators when physical sensors (e.g., in-situ water biochemistry) are not publicly connected for a basin.

### TERRA Index Composite Formula
$$\text{TERRA Score} = (\text{AQI Resiliency Score} \times 0.65) + (\text{Thermal Comfort Score} \times 0.35)$$
*Unavailable sensor domains are excluded from scoring to prevent deceptive representations.*

---

## License

MIT License. Designed and built with the Google AI Studio build engine.
