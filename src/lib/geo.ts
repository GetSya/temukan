export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function obfuscateLocation(lat: number, lng: number, offset = 0.002) {
  // add small random offset for privacy (orang/hewan)
  return {
    latitude: lat + (Math.random() - 0.5) * offset,
    longitude: lng + (Math.random() - 0.5) * offset,
  };
}
