export interface GeocodingResult {
  latitude: string;
  longitude: string;
  label: string;
}

export async function geocodeAddress(address: string, city: string, postalCode: string): Promise<GeocodingResult | null> {
  try {
    const query = `${address}, ${postalCode} ${city}`;
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.features || data.features.length === 0) return null;

    const feature = data.features[0];
    const [lng, lat] = feature.geometry.coordinates;
    return {
      latitude: lat.toString(),
      longitude: lng.toString(),
      label: feature.properties.label || query,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
