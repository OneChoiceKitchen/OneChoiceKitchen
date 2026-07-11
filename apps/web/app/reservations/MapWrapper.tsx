'use client';
import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';


export default function MapWrapper({ userLocation, branches }: { userLocation: [number, number] | null; branches: any[] }) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const L = require('leaflet');

    // Fix leaflet default icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    if (!containerRef.current) return;

    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView(userLocation || [20.5937, 78.9629], userLocation ? 13 : 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
    } else {
      mapRef.current.setView(userLocation || [20.5937, 78.9629], userLocation ? 13 : 5);
    }

    // Clear existing markers (a simple way is to remove all layers that are markers)
    mapRef.current?.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    if (userLocation) {
      L.marker(userLocation).addTo(mapRef.current).bindPopup('You are here');
    }

    branches.forEach((b: any) => {
      if (b.lat && b.lng && mapRef.current) {
        L.marker([b.lat, b.lng])
          .addTo(mapRef.current)
          .bindPopup(`<strong>${b.restaurantName} - ${b.name}</strong><br/>${b.distance ? `${b.distance.toFixed(1)} km away` : ''}`);
      }
    });

    return () => {
      // Cleanup map on unmount if necessary, but usually keeping the instance is fine
      // mapRef.current?.remove();
    };
  }, [userLocation, branches]);

  const handleLocateMe = () => {
    if (navigator.geolocation && mapRef.current) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const L = require('leaflet');
          mapRef.current?.setView([lat, lng], 14);
          L.marker([lat, lng]).addTo(mapRef.current!).bindPopup('You are here').openPopup();
          setIsLocating(false);
        },
        (error) => {
          console.error("Geolocation error", error);
          alert("Could not find your location.");
          setIsLocating(false);
        }
      );
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%', zIndex: 1 }} />
      <button
        onClick={handleLocateMe}
        disabled={isLocating}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '10px',
          zIndex: 1000,
          background: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          color: '#3b82f6',
          opacity: isLocating ? 0.7 : 1
        }}
        title="Locate Me"
      >
        <Navigation size={22} />
      </button>
    </div>
  );
}
