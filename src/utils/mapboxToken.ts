/**
 * Mapbox Access Token Management
 * Checks environment variable VITE_MAPBOX_ACCESS_TOKEN or browser localStorage.
 */
export function getMapboxToken(): string {
  // Check localStorage first (user customized in UI)
  try {
    const customToken = localStorage.getItem('terra_mapbox_token');
    if (customToken && customToken.trim().startsWith('pk.')) {
      return customToken.trim();
    }
  } catch {
    // ignore localStorage access issues in iframe/incognito
  }

  // Check Vite client env
  const envToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  if (typeof envToken === 'string' && envToken.trim().startsWith('pk.')) {
    return envToken.trim();
  }

  return '';
}

export function setMapboxToken(token: string): void {
  try {
    localStorage.setItem('terra_mapbox_token', token.trim());
  } catch (e) {
    console.warn('Failed to save Mapbox token to localStorage', e);
  }
}

export function hasValidMapboxToken(): boolean {
  const token = getMapboxToken();
  return Boolean(token && token.startsWith('pk.') && token.length > 20);
}
