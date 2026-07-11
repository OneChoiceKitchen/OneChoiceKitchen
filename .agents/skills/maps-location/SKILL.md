---
name: maps-location
description: >
  Google Maps Platform integration for OneChoiceKitchen. Covers geolocation,
  restaurant discovery, delivery routing, rider real-time tracking, and
  distance-based delivery fee calculation.
---

# Maps & Location

## Google Maps Platform APIs Used

| API | Use Case |
|-----|---------|
| Maps JavaScript API | Customer map view, restaurant display |
| Places API | Address autocomplete, place details |
| Geocoding API | Address → coordinates conversion |
| Distance Matrix API | Delivery fee calculation |
| Directions API | Rider routing |
| Routes API | Optimized multi-stop delivery |

## Key Concepts

### Coordinates
Always store as (latitude, longitude) decimal degrees:
`prisma
model Restaurant {
  latitude  Float
  longitude Float
}
`

### Address Autocomplete (Frontend)
`	ypescript
import { useGooglePlaces } from '@/hooks/useGooglePlaces';

function AddressInput({ onSelect }: { onSelect: (place: Place) => void }) {
  const { suggestions, search } = useGooglePlaces();

  return (
    <>
      <input onChange={(e) => search(e.target.value)} />
      {suggestions.map(s => (
        <button key={s.placeId} onClick={() => onSelect(s)}>
          {s.description}
        </button>
      ))}
    </>
  );
}
`

### Distance Calculation (Backend)
`	ypescript
async calculateDeliveryFee(
  restaurantLat: number,
  restaurantLng: number,
  customerLat: number,
  customerLng: number
): Promise<number> {
  const matrix = await this.mapsClient.distancematrix({
    params: {
      origins: [${restaurantLat},],
      destinations: [${customerLat},],
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });

  const distanceMeters = matrix.data.rows[0].elements[0].distance.value;
  const distanceKm = distanceMeters / 1000;

  return this.calculateFee(distanceKm); // Apply business rule
}
`

### Rider Real-Time Tracking

`	ypescript
// Rider sends location updates via WebSocket
socket.on('location:update', (data: { lat: number; lng: number }) => {
  this.redis.setex(ider::location, 30, JSON.stringify(data));
  // Broadcast to customer tracking the order
  socket.to(order:).emit('rider:location', data);
});
`

## Environment Variables
`
GOOGLE_MAPS_API_KEY=           # Restricted by HTTP referrer (frontend)
GOOGLE_MAPS_SERVER_API_KEY=    # Restricted by IP (backend)
`

## Security
- Frontend uses HTTP-referrer-restricted API key
- Backend uses IP-restricted API key
- Never expose the server-side key to frontend
- Restrict API key to only needed APIs in Google Cloud Console

## Cost Optimization
- Cache geocoding results in Redis (TTL: 7 days)
- Cache distance matrix results for same restaurant-area pairs (TTL: 1 hour)
- Use Maps JS API billing alerts for anomaly detection
