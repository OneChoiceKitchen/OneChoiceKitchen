import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, X } from 'lucide-react';

interface AdminLocationMapProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

const defaultCenter = { lat: 12.9716, lng: 77.5946 }; // Bangalore

export default function AdminLocationMap({ lat, lng, onChange }: AdminLocationMapProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [provider, setProvider] = useState<'GOOGLE_MAPS' | 'OPENSTREETMAP'>('GOOGLE_MAPS');
  
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const searchBoxRef = useRef<any>(null);

  const markerPos = { lat: lat || defaultCenter.lat, lng: lng || defaultCenter.lng };

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadMapConfigAndScript = async () => {
      let activeProvider: 'GOOGLE_MAPS' | 'OPENSTREETMAP' = 'GOOGLE_MAPS';
      let apiKey = '';
      let mapId = '';
      
      try {
        const res = await fetch('/api/maps/active-config', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
        });
        if (res.ok) {
          const config = await res.json();
          if (config) {
            if (config.providerName) activeProvider = config.providerName;
            if (config.apiKey) apiKey = config.apiKey;
            if (config.mapId) mapId = config.mapId;
          }
        } else {
          // Fallback to reading config list if active-config endpoint doesn't exist
          const listRes = await fetch('/api/maps/config', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
          });
          if (listRes.ok) {
            const list = await listRes.json();
            const active = list.find((c: any) => c.isActive);
            if (active) {
              activeProvider = active.providerName;
              apiKey = active.apiKey || '';
              mapId = active.mapId || '';
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch map config, checking mock storage or falling back to OSM', err);
        const stored = localStorage.getItem('mock_maps_configs');
        let mockActive = null;
        if (stored) {
          try {
            const configs = JSON.parse(stored);
            mockActive = configs.find((c: any) => c.isActive);
          } catch (e) {}
        }
        
        if (mockActive) {
          activeProvider = mockActive.providerName;
          apiKey = mockActive.apiKey || '';
        } else {
          activeProvider = 'OPENSTREETMAP';
        }
      }

      // Check if API key is dummy/invalid and force OSM if so
      if (activeProvider === 'GOOGLE_MAPS') {
        if (!apiKey || apiKey.startsWith('AIzaSyA') || apiKey.includes('Dummy')) {
          console.warn('Invalid or dummy Google Maps API key detected. Forcing fallback to OpenStreetMap.');
          activeProvider = 'OPENSTREETMAP';
        }
      }

      if (!isMounted) return;
      setProvider(activeProvider);

      if (activeProvider === 'OPENSTREETMAP') {
        initOSM();
      } else {
        initGoogleMaps(apiKey, mapId);
      }
    };

    loadMapConfigAndScript();

    return () => {
      isMounted = false;
    };
  }, []);
  
  // When props change from outside (e.g., Locate Me clicked in parent or manual input)
  useEffect(() => {
    if (!isLoaded || lat === null || lng === null) return;
    
    const pos = { lat, lng };
    if (provider === 'GOOGLE_MAPS') {
      if (mapInstanceRef.current && markerRef.current && (window as any).google) {
         markerRef.current.setPosition(pos);
         mapInstanceRef.current.panTo(pos);
      }
    } else {
      if (mapInstanceRef.current && markerRef.current && (window as any).L) {
         markerRef.current.setLatLng([lat, lng]);
         mapInstanceRef.current.panTo([lat, lng]);
      }
    }
  }, [lat, lng, isLoaded, provider]);

  const initOSM = () => {
    const existingScript = document.getElementById('leaflet-script');
    
    const initLeaflet = () => {
      if (!mapRef.current || !(window as any).L) return;
      const L = (window as any).L;
      
      if (mapInstanceRef.current && typeof mapInstanceRef.current.remove === 'function') {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapRef.current, {
        center: [markerPos.lat, markerPos.lng],
        zoom: 13,
        zoomControl: true
      });
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      
      mapInstanceRef.current = map;

      const marker = L.marker([markerPos.lat, markerPos.lng], {
        draggable: true
      }).addTo(map);
      
      markerRef.current = marker;

      map.on('click', (e: any) => {
        onChange(e.latlng.lat, e.latlng.lng);
      });

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
      });

      setIsLoaded(true);
    };

    if (!existingScript) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.id = 'leaflet-css';
      document.head.appendChild(link);
      
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.id = 'leaflet-script';
      script.async = true;
      script.onload = initLeaflet;
      script.onerror = () => setLoadError(true);
      document.head.appendChild(script);
    } else {
      if ((window as any).L) initLeaflet();
      else existingScript.addEventListener('load', initLeaflet);
    }
  };

  const handleOSMSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        setShowResults(true);
      }
    } catch (e) {
      console.error('OSM Search error', e);
    }
  };

  const selectOSMResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    onChange(lat, lng);
    setSearchTerm(result.display_name);
    setShowResults(false);
  };

  const initGoogleMaps = (apiKey: string, mapId: string) => {
    const existingScript = document.getElementById('google-maps-script');
    
    const initMap = () => {
      if (!mapRef.current || !(window as any).google) return;
      const google = (window as any).google;
      const mapOptions: any = {
        center: markerPos,
        zoom: 13,
        zoomControl: true,
      };
      if (mapId) mapOptions.mapId = mapId;
      
      const map = new google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      const marker = new google.maps.Marker({
        position: markerPos,
        map: map,
        draggable: true
      });
      markerRef.current = marker;

      map.addListener('click', (e: any) => {
        onChange(e.latLng.lat(), e.latLng.lng());
      });

      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        onChange(pos.lat(), pos.lng());
      });

      if (inputRef.current) {
        const searchBox = new google.maps.places.SearchBox(inputRef.current);
        searchBoxRef.current = searchBox;
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(inputRef.current);

        searchBox.addListener('places_changed', () => {
          const places = searchBox.getPlaces();
          if (places.length === 0) return;
          const place = places[0];
          if (!place.geometry || !place.geometry.location) return;
          
          onChange(place.geometry.location.lat(), place.geometry.location.lng());
        });
      }
      
      setIsLoaded(true);
    };

    if (!existingScript) {
      if (!apiKey) apiKey = "AIzaSyDummyKeyForDevelopment1234567890";
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.id = 'google-maps-script';
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => setLoadError(true);
      document.head.appendChild(script);
    } else {
      if ((window as any).google) initMap();
      else existingScript.addEventListener('load', initMap);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '350px', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--bdr)' }}>
      {loadError ? (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fee2e2', color: '#991b1b', padding: '1rem', textAlign: 'center' }}>
          Warning: Failed to load Maps API. Ensure you have an active internet connection.
        </div>
      ) : (
        <>
          {provider === 'GOOGLE_MAPS' && (
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for your building, street, or area..."
              style={{
                boxSizing: 'border-box', border: '1px solid #cbd5e1',
                width: '80%', height: '40px', padding: '0 12px',
                borderRadius: '8px', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                fontSize: '14px', outline: 'none', textOverflow: 'ellipsis',
                marginTop: '10px', display: isLoaded ? 'block' : 'none',
                backgroundColor: 'white'
              }}
            />
          )}
          
          {provider === 'OPENSTREETMAP' && isLoaded && (
            <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', width: '80%', zIndex: 1000 }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'white', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                <Search size={18} style={{ marginLeft: '12px', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search for your building, street, or area..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleOSMSearch(e.target.value);
                  }}
                  onFocus={() => { if(searchResults.length > 0) setShowResults(true); }}
                  style={{
                    boxSizing: 'border-box', border: 'none',
                    width: '100%', height: '40px', padding: '0 12px',
                    borderRadius: '8px', fontSize: '14px', outline: 'none',
                    background: 'transparent'
                  }}
                />
                {searchTerm && (
                  <button 
                    type="button"
                    onClick={() => { setSearchTerm(''); setSearchResults([]); setShowResults(false); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px', color: '#94a3b8' }}>
                    <X size={16} />
                  </button>
                )}
              </div>
              {showResults && searchResults.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', maxHeight: '200px', overflowY: 'auto' }}>
                  {searchResults.map((result: any, i: number) => (
                    <div 
                      key={i}
                      onClick={() => selectOSMResult(result)}
                      style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '0.9rem', color: '#334155', textAlign: 'left' }}
                    >
                      {result.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div ref={mapRef} style={{ height: '100%', width: '100%', background: 'var(--surf2)' }}></div>
          {!isLoaded && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10, background: 'var(--surf2)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text2)' }}>
                <MapPin size={24} className="animate-bounce" />
                <span>Loading Map Engine...</span>
              </div>
            </div>
          )}
          
          {provider === 'OPENSTREETMAP' && isLoaded && (
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(255,255,255,0.8)', padding: '2px 6px', fontSize: '10px', borderRadius: '4px', zIndex: 1000, pointerEvents: 'none', color: '#64748b' }}>
              © OpenStreetMap contributors
            </div>
          )}
        </>
      )}
    </div>
  );
}
