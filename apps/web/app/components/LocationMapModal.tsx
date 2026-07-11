'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Search, Navigation } from 'lucide-react';

interface LocationMapModalProps {
  onClose: () => void;
  onSave: (lat: number, lng: number, address: string, placeName: string) => void;
  initialLat?: number;
  initialLng?: number;
}

const defaultCenter = { lat: 25.5941, lng: 85.1376 };

export default function LocationMapModal({ onClose, onSave, initialLat, initialLng }: LocationMapModalProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [provider, setProvider] = useState<'GOOGLE_MAPS' | 'OPENSTREETMAP'>('GOOGLE_MAPS');
  
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Instance refs
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const searchBoxRef = useRef<any>(null);

  const [markerPos, setMarkerPos] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : defaultCenter
  );
  const [address, setAddress] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [manualLat, setManualLat] = useState(markerPos.lat.toString());
  const [manualLng, setManualLng] = useState(markerPos.lng.toString());
  
  // Custom search state for OSM
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadMapConfigAndScript = async () => {
      let activeProvider: 'GOOGLE_MAPS' | 'OPENSTREETMAP' = 'GOOGLE_MAPS';
      let apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
      let mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || '';
      
      try {
        const res = await fetch('/api/maps/active-config');
        if (res.ok) {
          const text = await res.text();
          if (text) {
            const config = JSON.parse(text);
            if (config) {
              if (config.providerName) activeProvider = config.providerName;
              if (config.apiKey) apiKey = config.apiKey;
              if (config.mapId) mapId = config.mapId;
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch map config', err);
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
  
  // ============================================
  // OPENSTREETMAP IMPLEMENTATION
  // ============================================
  const initOSM = () => {
    const existingScript = document.getElementById('leaflet-script');
    
    const initLeaflet = () => {
      if (!mapRef.current || !(window as any).L) return;
      
      const L = (window as any).L;
      
      // Cleanup previous map instance if any (React strict mode resilience)
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

      // Handle map click
      map.on('click', (e: any) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        marker.setLatLng({ lat, lng });
        setMarkerPos({ lat, lng });
        setManualLat(lat.toString());
        setManualLng(lng.toString());
        osmReverseGeocode(lat, lng);
      });

      // Handle marker drag
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setMarkerPos({ lat: pos.lat, lng: pos.lng });
        setManualLat(pos.lat.toString());
        setManualLng(pos.lng.toString());
        osmReverseGeocode(pos.lat, pos.lng);
      });

      // Initial reverse geocode if no address yet
      if (!address) {
        osmReverseGeocode(markerPos.lat, markerPos.lng);
      }

      setIsLoaded(true);
    };

    if (!existingScript) {
      // Inject CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.id = 'leaflet-css';
      document.head.appendChild(link);
      
      // Inject JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.id = 'leaflet-script';
      script.async = true;
      script.onload = initLeaflet;
      script.onerror = () => setLoadError(true);
      document.head.appendChild(script);
    } else {
      if ((window as any).L) {
        initLeaflet();
      } else {
        existingScript.addEventListener('load', initLeaflet);
      }
    }
  };
  
  const osmReverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
          
          let pName = '';
          if (data.address) {
            pName = data.address.amenity || data.address.shop || data.address.building || data.address.road || '';
          }
          setPlaceName(pName);
          setSearchTerm(data.display_name);
        }
      }
    } catch (e) {
      console.error('OSM reverse geocode error', e);
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
    
    setMarkerPos({ lat, lng });
    setManualLat(lat.toString());
    setManualLng(lng.toString());
    setAddress(result.display_name);
    setPlaceName(result.name || '');
    setSearchTerm(result.display_name);
    setShowResults(false);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
      markerRef.current.setLatLng([lat, lng]);
    }
  };


  // ============================================
  // GOOGLE MAPS IMPLEMENTATION
  // ============================================
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
      if (mapId) {
        mapOptions.mapId = mapId;
      }
      const map = new google.maps.Map(mapRef.current, mapOptions);
      
      mapInstanceRef.current = map;

      const marker = new google.maps.Marker({
        position: markerPos,
        map: map,
        draggable: true
      });
      markerRef.current = marker;

      // Handle map click
      map.addListener('click', (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        marker.setPosition({ lat, lng });
        setMarkerPos({ lat, lng });
        setManualLat(lat.toString());
        setManualLng(lng.toString());
        googleGeocodePosition(lat, lng, google);
      });

      // Handle marker drag
      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        const lat = pos.lat();
        const lng = pos.lng();
        setMarkerPos({ lat, lng });
        setManualLat(lat.toString());
        setManualLng(lng.toString());
        googleGeocodePosition(lat, lng, google);
      });

      // Setup Search Box
      if (inputRef.current) {
        const searchBox = new google.maps.places.SearchBox(inputRef.current);
        searchBoxRef.current = searchBox;
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(inputRef.current);

        searchBox.addListener('places_changed', () => {
          const places = searchBox.getPlaces();
          if (places.length === 0) return;

          const place = places[0];
          if (!place.geometry || !place.geometry.location) return;

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          map.setCenter(place.geometry.location);
          map.setZoom(15);
          marker.setPosition(place.geometry.location);
          
          setMarkerPos({ lat, lng });
          setManualLat(lat.toString());
          setManualLng(lng.toString());
          setAddress(place.formatted_address || place.name || '');
          setPlaceName(place.name || '');
        });
      }
      
      // Initial geocode if no address yet
      if (!address) {
        googleGeocodePosition(markerPos.lat, markerPos.lng, google);
      }
      
      setIsLoaded(true);
    };

    if (!existingScript) {
      if (!apiKey) {
        console.warn("Using Dummy Google Maps API Key for development. Maps will have a watermark.");
        apiKey = "AIzaSyDummyKeyForDevelopment1234567890";
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.id = 'google-maps-script';
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => setLoadError(true);
      document.head.appendChild(script);
    } else {
      if ((window as any).google) {
        initMap();
      } else {
        existingScript.addEventListener('load', initMap);
      }
    }
  };

  const googleGeocodePosition = (lat: number, lng: number, google: any) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        setAddress(results[0].formatted_address);
        
        // Try to extract a place name or sublocality
        let pName = '';
        const components = results[0].address_components;
        if (components) {
          const poi = components.find((c: any) => c.types.includes('point_of_interest') || c.types.includes('premise') || c.types.includes('sublocality'));
          if (poi) pName = poi.long_name;
        }
        setPlaceName(pName);

        if (inputRef.current) {
          inputRef.current.value = results[0].formatted_address;
        }
      } else {
        console.error("Geocoding failed: " + status);
        if (status === 'REQUEST_DENIED') {
           alert("Geocoding failed: Your API Key is restricted. Please ensure both Geocoding API and Places API are enabled and allowed for this key.");
        }
      }
    });
  };

  // ============================================
  // COMMON UI
  // ============================================
  const handleSave = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      onSave(lat, lng, address || 'Custom Location', placeName);
    }
  };
  
  // Custom handler for manual lat/lng updates
  const handleCoordinateChange = (lat: number, lng: number) => {
    const pos = { lat, lng };
    setMarkerPos(pos);
    
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
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          handleCoordinateChange(lat, lng);
          
          if (provider === 'GOOGLE_MAPS') {
            if ((window as any).google) {
              googleGeocodePosition(lat, lng, (window as any).google);
            }
          } else {
            osmReverseGeocode(lat, lng);
          }
        },
        (error) => {
          console.error("Error getting location: ", error);
          alert("Unable to retrieve your location. Please check your browser permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', width: '95%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin /> Set Delivery Location</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
        </div>
        
        {loadError ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
            Warning: Failed to load Maps API. Ensure you have an active internet connection.
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
             {/* 
                For Google Maps, we push the input inside the map controls.
                For OSM, we render a custom search bar overlay on top of the map container.
             */}
             
             {provider === 'GOOGLE_MAPS' && (
               <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for your building, street, or area..."
                  style={{
                    boxSizing: `border-box`, border: `1px solid #cbd5e1`,
                    width: `80%`, height: `40px`, padding: `0 12px`,
                    borderRadius: `8px`, boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                    fontSize: `14px`, outline: `none`, textOverflow: `ellipses`,
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

            <div style={{ position: 'relative', height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9' }}>
              <div ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
              {!isLoaded && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                  Loading Map Engine...
                </div>
              )}
            </div>
            
            {/* Locate Me Button */}
            {isLoaded && (
              <button
                onClick={handleLocateMe}
                style={{
                  position: 'absolute',
                  top: '70px',
                  right: '10px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'white',
                  border: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 1000,
                  color: '#0f172a'
                }}
                title="Locate Me"
              >
                <Navigation size={20} />
              </button>
            )}
            
            {/* Added OSM attribution since Leaflet attribution might get hidden */}
            {provider === 'OPENSTREETMAP' && isLoaded && (
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(255,255,255,0.8)', padding: '2px 6px', fontSize: '10px', borderRadius: '4px', zIndex: 1000, pointerEvents: 'none', color: '#64748b' }}>
                © OpenStreetMap contributors
              </div>
            )}
          </div>
        )}

        <div>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem', marginTop: 0 }}>Or enter coordinates manually:</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" placeholder="Latitude" 
              value={manualLat} onChange={e => {
                setManualLat(e.target.value);
                const lat = parseFloat(e.target.value);
                if(!isNaN(lat)) {
                  handleCoordinateChange(lat, markerPos.lng);
                }
              }}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
            <input 
              type="text" placeholder="Longitude" 
              value={manualLng} onChange={e => {
                setManualLng(e.target.value);
                const lng = parseFloat(e.target.value);
                if(!isNaN(lng)) {
                  handleCoordinateChange(markerPos.lat, lng);
                }
              }}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          <button onClick={handleSave} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#2563EB', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Confirm Location</button>
        </div>
      </div>
    </div>
  );
}
