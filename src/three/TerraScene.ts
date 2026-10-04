import * as THREE from 'three';
import mapboxgl from 'mapbox-gl';
import { geoToWorldCoordinate } from '../utils/geoCoordinates';

/**
 * Three.js Simulation Engine
 * STRICT ARCHITECTURAL RULE:
 * In NORMAL MODE (simulationActive = false), this scene contains ZERO environmental objects (no trees, no particles, no ground meshes).
 * All normal environmental layers (AQI, Temperature, Green, Water, Waste, Community) are rendered natively by Mapbox GL JS.
 * Three.js is reserved exclusively for explicit WHAT-IF simulation visualization.
 */
export class TerraScene {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;

  // Simulation State
  public simulationActive: boolean = false;
  public simulationGroup: THREE.Group;

  // Current geographic anchor coordinates
  private currentAnchorLng: number = 77.5946;
  private currentAnchorLat: number = 12.9716;

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    // Scene
    this.scene = new THREE.Scene();

    // Camera matching Mapbox viewport
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(36.87, aspect, 1, 3000000);
    this.camera.position.set(0, 1500, 2000);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    // Dedicated group for simulation mode only (empty in normal mode)
    this.simulationGroup = new THREE.Group();
    this.simulationGroup.name = 'SimulationGroup';
    this.simulationGroup.visible = false;
    this.scene.add(this.simulationGroup);

    window.addEventListener('resize', this.onWindowResize);

    // Render loop
    this.animate();
  }

  /**
   * Sets whether WHAT-IF simulation mode is active.
   * If false, completely cleans up and hides any simulation objects.
   */
  public setSimulationActive(active: boolean) {
    this.simulationActive = active;
    this.simulationGroup.visible = active;

    if (!active) {
      this.clearSimulationObjects();
    }
  }

  /**
   * Cleans up all simulation objects.
   */
  public clearSimulationObjects() {
    while (this.simulationGroup.children.length > 0) {
      const child = this.simulationGroup.children[0];
      this.simulationGroup.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
      if ((child as any).material) {
        if (Array.isArray((child as any).material)) {
          (child as any).material.forEach((m: any) => m.dispose());
        } else {
          (child as any).material.dispose();
        }
      }
    }
  }

  public setGeographicAnchor(centerLng: number, centerLat: number) {
    this.currentAnchorLng = centerLng;
    this.currentAnchorLat = centerLat;
  }

  /**
   * Synchronizes Three.js camera with Mapbox camera.
   */
  public syncWithMapbox(map: mapboxgl.Map) {
    if (!this.simulationActive || !map || !map.getCanvas()) return;

    const center = map.getCenter();
    const zoom = map.getZoom();
    const pitch = map.getPitch();
    const bearing = map.getBearing();

    const latRad = (center.lat * Math.PI) / 180;
    const metersPerPixel = (156543.03392 * Math.cos(latRad)) / Math.pow(2, zoom);
    const viewportHeight = this.container.clientHeight || window.innerHeight;
    const fov = 36.87;
    const altitude = (viewportHeight * metersPerPixel) / (2 * Math.tan((fov * Math.PI) / 360));

    const target = geoToWorldCoordinate(
      center.lng,
      center.lat,
      0,
      this.currentAnchorLng,
      this.currentAnchorLat
    );

    const radPitch = (pitch * Math.PI) / 180;
    const radBearing = (bearing * Math.PI) / 180;

    const sinPitch = Math.sin(radPitch);
    const cosPitch = Math.cos(radPitch);

    const camX = target.x + altitude * sinPitch * Math.sin(radBearing);
    const camZ = target.z + altitude * sinPitch * Math.cos(radBearing);
    const camY = altitude * cosPitch;

    this.camera.position.set(camX, Math.max(10, camY), camZ);
    this.camera.lookAt(target.x, target.y, target.z);
    this.camera.up.set(0, 1, 0);

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width > 0 && height > 0) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  private onWindowResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Only render Three.js if simulation is active
    if (this.simulationActive && this.simulationGroup.children.length > 0) {
      this.renderer.render(this.scene, this.camera);
    } else {
      this.renderer.clear();
    }
  };

  public dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    this.clearSimulationObjects();
    this.renderer.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
