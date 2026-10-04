import * as THREE from 'three';

/**
 * High-precision WGS84 geographic coordinate transformation utility.
 * Projects GPS [longitude, latitude, altitude] to metric Three.js world space relative to any anchor point.
 * Absolutely NO hardcoded Bengaluru origin offsets!
 */

export function getMetersPerDegree(latitude: number): { metersPerLng: number; metersPerLat: number } {
  const latRad = (latitude * Math.PI) / 180;
  // WGS-84 ellipsoid standard approximations
  const metersPerLat = 111132.92 - 559.82 * Math.cos(2 * latRad) + 1.175 * Math.cos(4 * latRad);
  const metersPerLng = 111412.84 * Math.cos(latRad) - 93.5 * Math.cos(3 * latRad);
  return { metersPerLng, metersPerLat };
}

/**
 * Converts GPS [longitude, latitude, altitude] to a Three.js Vector3 in meters relative to anchor center.
 * X: East (+), West (-)
 * Y: Altitude (elevation in meters above ground)
 * Z: North (-), South (+) (Standard Three.js coordinate convention)
 */
export function geoToWorldCoordinate(
  lng: number,
  lat: number,
  altitude: number = 0,
  centerLng: number,
  centerLat: number
): THREE.Vector3 {
  const { metersPerLng, metersPerLat } = getMetersPerDegree(centerLat);
  const x = (lng - centerLng) * metersPerLng;
  const z = -(lat - centerLat) * metersPerLat;
  const y = altitude;
  return new THREE.Vector3(x, y, z);
}

/**
 * Converts a Three.js world coordinate back to GPS [longitude, latitude, altitude] relative to anchor center.
 */
export function worldToGeoCoordinate(
  position: THREE.Vector3,
  centerLng: number,
  centerLat: number
): [number, number, number] {
  const { metersPerLng, metersPerLat } = getMetersPerDegree(centerLat);
  const lng = centerLng + position.x / metersPerLng;
  const lat = centerLat - position.z / metersPerLat;
  const altitude = position.y;
  return [lng, lat, altitude];
}
