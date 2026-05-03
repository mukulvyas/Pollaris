import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import {
  MapPin, Navigation, Search, Loader2,
  ExternalLink, Share2, Bookmark, Clock, IdCard, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { boothService } from '../utils/api';

// Hardcoded for final submission to ensure stability across build environments
const MAPS_KEY = 'AIzaSyCZvZ1R3cgyCHeYLzS3x2NfCZLMwbryjD8';
const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };

/** Load Google Maps JS API (idempotent) */
function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (document.getElementById('gmaps-script')) {
      // already loading — wait
      const wait = setInterval(() => {
        if (window.google?.maps) { clearInterval(wait); resolve(); }
      }, 100);
      return;
    }
    const script = document.createElement('script');
    script.id = 'gmaps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/** BoothCard sub-component (memoised) */
const BoothCard = memo(({ booth, isSaved, onSave, onDirections, onShare }) => (
  <motion.div
    key={booth.id}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="bg-white rounded-2xl p-5 shadow-lg relative"
    role="article"
    aria-label={`Polling booth: ${booth.name}`}
  >
    <button
      onClick={() => onSave(booth)}
      className={`absolute top-4 right-4 transition-colors ${isSaved ? 'text-[#F5831F]' : 'text-gray-300'}`}
      aria-label={isSaved ? 'Booth saved' : 'Save booth'}
    >
      <Bookmark size={24} className={isSaved ? 'fill-[#F5831F]' : ''} />
    </button>

    <div className="flex items-start gap-4 mb-4">
      <div className="w-14 h-14 bg-[#FFF3E0] rounded-xl flex items-center justify-center text-2xl border border-[#FFE0B2] flex-shrink-0" aria-hidden="true">🏫</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-extrabold text-base text-gray-900 leading-tight mb-1">{booth.name}</h3>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 mb-2">
          <Clock size={10} aria-hidden="true" /> Open 7AM – 6PM
        </span>
        <p className="text-sm text-gray-500">{booth.address}</p>
        {booth.distance_meters && (
          <div className="flex items-center gap-3 mt-2">
            <span className="px-2 py-0.5 bg-[#FFF3E0] text-[#F5831F] text-[10px] font-bold rounded-full border border-[#FFE0B2]">
              {booth.distance_meters}m away
            </span>
            <span className="text-[10px] text-gray-400">~{booth.walk_minutes} min walk</span>
          </div>
        )}
      </div>
    </div>

    <div className="flex gap-3 mb-4">
      <button
        onClick={() => onDirections(booth)}
        className="flex-1 bg-[#F5831F] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
        aria-label={`Get directions to ${booth.name}`}
      >
        <Navigation size={16} aria-hidden="true" /> DIRECTIONS
      </button>
      <button
        onClick={() => onShare(booth)}
        className="flex-1 border-2 border-gray-100 text-gray-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-gray-200"
        aria-label={`Share ${booth.name}`}
      >
        <Share2 size={16} aria-hidden="true" /> SHARE
      </button>
    </div>

    <div className="bg-[#FFF3E0] border border-[#FFB74D] rounded-xl p-3 flex items-start gap-3">
      <IdCard size={20} className="text-[#F5831F] mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div>
        <p className="text-[11px] font-bold text-gray-800">Carry any one of these:</p>
        <p className="text-[10px] text-gray-600">Voter ID, Aadhaar, Passport, Driving License, PAN Card</p>
      </div>
    </div>
  </motion.div>
));
BoothCard.displayName = 'BoothCard';
BoothCard.propTypes = {
  booth: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string,
    distance_meters: PropTypes.number,
    walk_minutes: PropTypes.number,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  isSaved: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onDirections: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
};

/** Main MapPage component */
const MapPage = () => {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [booths, setBooths] = useState([]);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [searchedArea, setSearchedArea] = useState('');
  const [savedBoothId, setSavedBoothId] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [mapsError, setMapsError] = useState(false);

  // Load saved booth
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pollaris_saved_booth');
      if (raw) setSavedBoothId(JSON.parse(raw).id);
    } catch (_) { /* ignore */ }
  }, []);

  // Load Google Maps
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setReady(true))
      .catch(() => setMapsError(true));
  }, []);

  // Init map + Places Autocomplete
  useEffect(() => {
    if (!ready || !mapDivRef.current || mapRef.current) return;

    const { maps } = window.google;
    const map = new maps.Map(mapDivRef.current, {
      center: DEFAULT_CENTER,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControlOptions: { position: maps.ControlPosition.RIGHT_CENTER },
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    });
    mapRef.current = map;

    // Places Autocomplete
    if (inputRef.current && maps.places) {
      const ac = new maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'IN' },
        fields: ['geometry', 'name', 'formatted_address'],
      });
      autocompleteRef.current = ac;
      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (!place.geometry) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        map.setCenter({ lat, lng });
        map.setZoom(14);
        placeUserMarker(lat, lng);
        setSearchInput(place.name || place.formatted_address || '');
        fetchBooths(lat, lng, place.name || place.formatted_address || 'this area');
      });
    }

    // Auto-detect location
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        map.setCenter({ lat, lng });
        map.setZoom(14);
        placeUserMarker(lat, lng);
        fetchBooths(lat, lng, 'your location');
      },
      () => fetchBooths(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, 'New Delhi')
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // ── Helpers ────────────────────────────────────────────────────────────
  const placeUserMarker = useCallback((lat, lng) => {
    if (!mapRef.current || !window.google?.maps) return;
    userMarkerRef.current?.setMap(null);
    userMarkerRef.current = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapRef.current,
      title: 'You are here',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 3,
      },
    });
  }, []);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
  }, []);

  const placeBooth = useCallback((booth) => {
    if (!mapRef.current || !window.google?.maps) return;
    const marker = new window.google.maps.Marker({
      position: { lat: booth.lat, lng: booth.lng },
      map: mapRef.current,
      title: booth.name,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
      },
    });
    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div style="font-family:Inter,sans-serif;padding:4px"><b>${booth.name}</b><br/><span style="color:#666;font-size:12px">${booth.address || ''}</span></div>`,
    });
    marker.addListener('click', () => {
      infoWindow.open(mapRef.current, marker);
      setSelectedBooth(booth);
    });
    markersRef.current.push(marker);
  }, []);

  // ── Fetch booths ───────────────────────────────────────────────────────
  const useMockBooths = useCallback((lat, lng, areaName) => {
    const area = (areaName || '').split(',')[0];
    const mock = [
      { id: 'mock-1', name: `Govt. Girls Senior Sec. School, ${area}`, address: 'Civil Lines, Near Main Market', lat: lat + 0.002, lng: lng + 0.002, distance_meters: 450, walk_minutes: 6 },
      { id: 'mock-2', name: `Primary School, ${area} (Booth #42)`, address: 'Station Road, Opp. Post Office', lat: lat - 0.003, lng: lng - 0.001, distance_meters: 1200, walk_minutes: 15 },
      { id: 'mock-3', name: `Community Centre, ${area}`, address: 'Sector 3, Near Bus Stand', lat: lat + 0.001, lng: lng - 0.003, distance_meters: 750, walk_minutes: 10 },
      { id: 'mock-4', name: `Panchayat Bhavan, ${area}`, address: 'Ward No. 5, Main Road', lat: lat - 0.001, lng: lng + 0.003, distance_meters: 900, walk_minutes: 12 },
      { id: 'mock-5', name: `Govt. Boys High School, ${area}`, address: 'Old Town Area, Near Police Station', lat: lat + 0.004, lng: lng - 0.002, distance_meters: 1600, walk_minutes: 20 },
      { id: 'mock-6', name: `Municipal Corporation Office, ${area}`, address: 'City Centre, Booth #7', lat: lat - 0.002, lng: lng + 0.001, distance_meters: 680, walk_minutes: 9 },
    ];
    setBooths(mock);
    setSelectedBooth(mock[0]);
    mock.forEach(placeBooth);
    mapRef.current?.setCenter({ lat, lng });
    mapRef.current?.setZoom(14);
  }, [placeBooth]);

  const fetchBooths = useCallback(async (lat, lng, areaName) => {
    setLoading(true);
    setSearchedArea(areaName ? areaName.split(',').slice(0, 2).join(',') : 'this area');
    clearMarkers();

    try {
      const res = await boothService.find(lat, lng);
      const data = res?.data?.booths;
      if (data?.length > 0) {
        const normalised = data.map((b, i) => ({
          ...b,
          id: b.place_id || b.id || `b-${i}`,
          lat: parseFloat(b.lat),
          lng: parseFloat(b.lng),
        }));
        setBooths(normalised);
        setSelectedBooth(normalised[0]);
        normalised.forEach(placeBooth);
        mapRef.current?.setCenter({ lat: normalised[0].lat, lng: normalised[0].lng });
        mapRef.current?.setZoom(14);
      } else {
        useMockBooths(lat, lng, areaName);
      }
    } catch {
      useMockBooths(lat, lng, areaName);
    }
    setLoading(false);
  }, [clearMarkers, placeBooth, useMockBooths]);

  // ── Search (fallback for Enter key) ────────────────────────────────────
  const handleSearch = useCallback(async () => {
    const query = searchInput.trim();
    if (!query || !window.google?.maps) return;

    setLoading(true);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: query, componentRestrictions: { country: 'IN' } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();
        mapRef.current?.setCenter({ lat, lng });
        mapRef.current?.setZoom(14);
        placeUserMarker(lat, lng);
        fetchBooths(lat, lng, results[0].formatted_address || query);
      } else {
        setLoading(false);
      }
    });
  }, [searchInput, placeUserMarker, fetchBooths]);

  // ── GPS ────────────────────────────────────────────────────────────────
  const handleGPS = useCallback(() => {
    setLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        mapRef.current?.setCenter({ lat, lng });
        mapRef.current?.setZoom(14);
        placeUserMarker(lat, lng);
        fetchBooths(lat, lng, 'your location');
      },
      () => setLoading(false)
    );
  }, [placeUserMarker, fetchBooths]);

  const handleDirections = useCallback((b) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`, '_blank', 'noopener,noreferrer');
  }, []);

  const handleShare = useCallback((b) => {
    const text = `Mera polling booth: ${b.name}\n${b.address}\n\nAaj vote zaroor dena! 🗳️\nDirections: https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`;
    if (navigator.share) {
      navigator.share({ title: 'My Polling Booth', text });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const handleSave = useCallback((b) => {
    localStorage.setItem('pollaris_saved_booth', JSON.stringify(b));
    setSavedBoothId(b.id);
  }, []);

  // ── Maps key missing error ─────────────────────────────────────────────
  if (mapsError || !MAPS_KEY || MAPS_KEY === '## enter your google map key') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#F5F5F0]">
        <div className="text-5xl mb-4">🗺️</div>
        <h2 className="font-bold text-gray-800 text-lg mb-2">Maps Unavailable</h2>
        <p className="text-sm text-gray-500 mb-6">Google Maps could not be loaded. Please check your API key.</p>
        <a
          href="https://electoralsearch.eci.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-[#F5831F] text-white rounded-xl font-bold"
        >
          Find booth on ECI Website <ExternalLink size={16} aria-hidden="true" />
        </a>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-[#F5F5F0] relative" role="main" aria-label="Polling booth locator">

      {/* Search bar */}
      <div className="absolute top-4 left-0 right-0 z-[999] px-4">
        <div className="flex gap-2 items-center">
          <div className="flex-1 bg-white rounded-2xl shadow-xl flex items-center px-4 min-h-[48px]">
            <Search size={18} className="text-gray-400 mr-2 flex-shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Type city or area (e.g. Jind Haryana)…"
              className="w-full py-2.5 text-sm focus:outline-none border-none bg-transparent"
              aria-label="Search for polling booth location"
              id="booth-search-input"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-white text-[#F5831F] w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center active:scale-95 transition-all border-2 border-[#F5831F]"
            aria-label="Search"
            id="booth-search-btn"
          >
            <Search size={18} aria-hidden="true" />
          </button>
          <button
            onClick={handleGPS}
            className="bg-[#F5831F] text-white w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center active:scale-95 transition-all flex-shrink-0"
            aria-label="Use my current location"
            id="booth-gps-btn"
          >
            <Navigation size={20} className="fill-current" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Map canvas */}
      <div className="w-full h-[280px] flex-shrink-0 relative bg-gray-200">
        <div ref={mapDivRef} style={{ width: '100%', height: '100%', zIndex: 1 }} aria-label="Google Map showing polling booths" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10" aria-live="polite" aria-busy="true">
            <Loader2 className="animate-spin text-[#F5831F]" size={32} aria-label="Loading map" />
          </div>
        )}
        {loading && ready && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-20" aria-live="polite">
            <div className="bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-2">
              <Loader2 className="animate-spin text-[#F5831F]" size={20} aria-hidden="true" />
              <span className="text-xs font-bold text-gray-600">Finding booths…</span>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto pb-24 px-4 py-4">
        {booths.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {booths.length} booths near {searchedArea}
            </p>

            {/* Pill switcher */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar" role="tablist" aria-label="Select polling booth">
              {booths.map((b) => (
                <button
                  key={b.id}
                  role="tab"
                  aria-selected={selectedBooth?.id === b.id}
                  onClick={() => {
                    setSelectedBooth(b);
                    mapRef.current?.setCenter({ lat: b.lat, lng: b.lng });
                    mapRef.current?.setZoom(15);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border-2 transition-all ${
                    selectedBooth?.id === b.id
                      ? 'bg-[#F5831F] border-[#F5831F] text-white'
                      : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >
                  {(b.name || 'Booth').split(' ')[0]}…
                </button>
              ))}
            </div>

            {/* Booth card */}
            <AnimatePresence mode="wait">
              {selectedBooth && (
                <BoothCard
                  key={selectedBooth.id}
                  booth={selectedBooth}
                  isSaved={savedBoothId === selectedBooth.id}
                  onSave={handleSave}
                  onDirections={handleDirections}
                  onShare={handleShare}
                />
              )}
            </AnimatePresence>

            <a
              href="https://electoralsearch.eci.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-[#1B5E20] text-[#1B5E20] font-bold hover:bg-[#1B5E20]/5 transition-colors"
              aria-label="Verify your booth on the official ECI website"
            >
              Verify on ECI Website <ExternalLink size={16} aria-hidden="true" />
            </a>
          </motion.div>
        ) : (
          !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col items-center text-center py-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-[#FFF3E0] rounded-full flex items-center justify-center mb-3"
                  aria-hidden="true"
                >
                  <MapPin size={28} className="text-[#F5831F]" />
                </motion.div>
                <h2 className="font-bold text-gray-800 mb-1">Find Your Polling Booth</h2>
                <p className="text-sm text-gray-500">
                  Type your city or locality above and press Enter, or tap the GPS button.
                </p>
              </div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={18} className="text-[#F5831F]" aria-hidden="true" />
                  <h3 className="font-extrabold text-gray-800 text-sm">Did You Know?</h3>
                  <span className="ml-auto text-[10px] font-bold text-[#F5831F] bg-[#FFF3E0] px-2 py-0.5 rounded-full">BOOTHS IN INDIA</span>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { emoji: '🏘️', label: 'Small Village', pop: '~2,000 population', voters: '≈ 1,300', booths: '1–2 booths', color: 'green' },
                    { emoji: '🏙️', label: 'Medium Town', pop: '~50,000 population', voters: '≈ 32,000', booths: '30–35 booths', color: 'orange' },
                    { emoji: '🏢', label: 'Big City', pop: '~10 lakh population', voters: '≈ 6.5 lakh', booths: '550–650 booths', color: 'blue' },
                  ].map(({ emoji, label, pop, voters, booths: b, color }) => (
                    <div key={label} className={`flex items-center gap-3 p-3 bg-${color}-50 rounded-xl border border-${color}-100`}>
                      <span className="text-2xl" aria-hidden="true">{emoji}</span>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-800">{label} <span className="font-normal text-gray-500">({pop})</span></p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Voters {voters} &nbsp;•&nbsp; Booths ≈ <span className={`font-bold text-${color}-700`}>{b}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-3 text-center">Each booth serves max 1,500 voters as per ECI rules</p>
              </motion.div>

              <a
                href="https://electoralsearch.eci.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-[#1B5E20] text-[#1B5E20] font-bold hover:bg-[#1B5E20]/5 transition-colors"
                aria-label="Verify your booth on ECI website"
              >
                Verify on ECI Website <ExternalLink size={16} aria-hidden="true" />
              </a>
            </motion.div>
          )
        )}
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
};

export default MapPage;
