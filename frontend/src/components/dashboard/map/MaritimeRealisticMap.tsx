import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CorridorInfo } from '../../../types';
import { Compass, Plus, Minus, Refresh } from 'iconoir-react';

interface MaritimeRealisticMapProps {
  corridors: CorridorInfo[];
  activeCorridorId: string;
  onSelectCorridor: (routeId: string) => void;
  speedKnots?: number;
  initialBasemap?: BasemapStyle;
}

type BasemapStyle = 'voyager' | 'ocean' | 'dark';

export const MaritimeRealisticMap: React.FC<MaritimeRealisticMapProps> = ({
  corridors,
  activeCorridorId,
  onSelectCorridor,
  speedKnots = 14.6,
  initialBasemap = 'ocean',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const routeLayersRef = useRef<L.LayerGroup | null>(null);

  const [currentBasemap, setCurrentBasemap] = useState<BasemapStyle>(initialBasemap);
  const [mapReady, setMapReady] = useState(false);

  const activeCorridor = corridors.find((c) => c.route_id === activeCorridorId) || corridors[0];

  // Tile Layer Definitions (100% free, high-availability, zero API keys, no watermarks)
  const basemapTiles: Record<BasemapStyle, { url: string; attribution: string; subdomains?: string[] }> = {
    voyager: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; Sources: Esri, USGS, NOAA, DeLorme, TomTom',
    },
    ocean: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, GEBCO, NOAA, National Geographic',
    },
    dark: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
    },
  };

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 40],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true,
    });

    const initialTiles = basemapTiles[currentBasemap];
    const tileLayer = L.tileLayer(initialTiles.url, {
      attribution: initialTiles.attribution,
      subdomains: initialTiles.subdomains || ['a', 'b', 'c'],
      maxZoom: 18,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Dedicated layer group for polylines and markers
    const routeLayers = L.layerGroup().addTo(map);
    routeLayersRef.current = routeLayers;

    mapInstanceRef.current = map;
    setMapReady(true);

    // Resize observer to ensure map handles layout shifts smoothly
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Switch Basemap Layer on Style Toggle
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const map = mapInstanceRef.current;
    map.removeLayer(tileLayerRef.current);

    const config = basemapTiles[currentBasemap];
    const newTiles = L.tileLayer(config.url, {
      attribution: config.attribution,
      subdomains: config.subdomains || ['a', 'b', 'c'],
      maxZoom: 18,
    }).addTo(map);

    tileLayerRef.current = newTiles;
  }, [currentBasemap]);

  // 3. Render Corridors, Waypoints, Beacons, and Animated Camera Zoom
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !routeLayersRef.current) return;

    const map = mapInstanceRef.current;
    const routeLayers = routeLayersRef.current;
    routeLayers.clearLayers();

    if (!activeCorridor) return;

    // Helper: Convert [lon, lat] from backend to [lat, lon] for Leaflet
    const convertCoords = (pts: [number, number][]): [number, number][] => {
      return pts.map(([lon, lat]) => [lat, lon]);
    };

    // A. Render Inactive Corridors (Faint, clickable dashed tracks)
    corridors.forEach((c) => {
      if (c.route_id === activeCorridor.route_id || !c.coordinates || c.coordinates.length < 2) return;
      const latlngs = convertCoords(c.coordinates);

      const inactiveLine = L.polyline(latlngs, {
        color: currentBasemap === 'dark' ? '#64748b' : '#94a3b8',
        weight: 1.5,
        dashArray: '4, 4',
        opacity: 0.55,
      });

      inactiveLine.on('click', () => {
        onSelectCorridor(c.route_id);
      });

      inactiveLine.bindTooltip(
        `<div class="font-mono text-xs font-semibold">${c.name} (${c.distance_nm.toLocaleString()} NM)</div><div class="text-[10px] text-stone-500">Click to activate corridor</div>`,
        { sticky: true }
      );

      routeLayers.addLayer(inactiveLine);
    });

    // B. Render Active Corridor Route Track
    if (activeCorridor.coordinates && activeCorridor.coordinates.length >= 2) {
      const activeLatLngs = convertCoords(activeCorridor.coordinates);

      // Glowing underlayer path
      const glowPath = L.polyline(activeLatLngs, {
        color: '#ff6b00',
        weight: 6,
        opacity: 0.28,
        lineCap: 'round',
      });
      routeLayers.addLayer(glowPath);

      // Sharp primary navigation path
      const mainPath = L.polyline(activeLatLngs, {
        color: '#ea580c',
        weight: 2.75,
        dashArray: '6, 5',
        opacity: 0.95,
        lineCap: 'round',
      });
      routeLayers.addLayer(mainPath);

      // C. Intermediate Waypoints (Navigational Choke Points)
      if (activeCorridor.coordinates.length > 2) {
        const intermediates = activeCorridor.coordinates.slice(1, -1);
        intermediates.forEach(([lon, lat], idx) => {
          const wpIcon = L.divIcon({
            className: 'custom-wp-icon',
            html: `
              <div class="relative flex items-center justify-center" style="width: 14px; height: 14px;">
                <span class="w-2.5 h-2.5 rounded-full bg-stone-700 border-2 border-white shadow-xs"></span>
              </div>
            `,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });

          const marker = L.marker([lat, lon], { icon: wpIcon });
          marker.bindTooltip(
            `<div class="font-mono text-xs"><strong>Waypoint ${idx + 1}</strong> (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)</div>`,
            { direction: 'top' }
          );
          routeLayers.addLayer(marker);
        });
      }

      // D. Midpoint Vessel Position Indicator
      const midIdx = Math.floor(activeLatLngs.length / 2);
      const vesselPos = activeLatLngs[midIdx];
      const vesselIcon = L.divIcon({
        className: 'custom-vessel-icon',
        html: `
          <div class="relative flex items-center justify-center" style="width: 32px; height: 32px;">
            <span class="absolute w-8 h-8 rounded-full bg-amber-500/20 animate-ping"></span>
            <span class="absolute w-6 h-6 rounded-full bg-amber-500/30"></span>
            <div class="relative w-5 h-5 bg-stone-900 border border-amber-400 rounded-full flex items-center justify-center shadow-md">
              <svg class="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4 20l8-4 8 4L12 2z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const vesselMarker = L.marker(vesselPos, { icon: vesselIcon });
      vesselMarker.bindTooltip(
        `
        <div class="font-mono text-xs p-1">
          <div class="font-bold text-stone-900">Q-FLEET CONTAINER 15k TEU</div>
          <div class="text-[11px] text-amber-700 font-semibold">Speed: ${speedKnots} kts (Pareto Optimal)</div>
          <div class="text-[10px] text-stone-500">Position: ${vesselPos[0].toFixed(2)}°N, ${vesselPos[1].toFixed(2)}°E</div>
        </div>
        `,
        { direction: 'top' }
      );
      routeLayers.addLayer(vesselMarker);
    }

    // E. Point A: Origin Port Beacon
    if (activeCorridor.origin_port) {
      const { lat, lon, port_id, name, country } = activeCorridor.origin_port;
      const originIcon = L.divIcon({
        className: 'custom-origin-beacon',
        html: `
          <div class="relative flex items-center justify-center select-none" style="width: 28px; height: 28px;">
            <span class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></span>
            <span class="absolute w-5 h-5 rounded-full bg-emerald-500/40"></span>
            <span class="relative w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-md"></span>
            <div class="absolute -top-7 px-2 py-0.5 bg-stone-900/95 text-white text-[10px] font-mono font-bold rounded-md shadow-lg border border-white/20 whitespace-nowrap flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>A: ${port_id}</span>
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const originMarker = L.marker([lat, lon], { icon: originIcon });
      originMarker.bindTooltip(
        `
        <div class="font-mono text-xs p-1">
          <div class="font-bold text-emerald-800">POINT A: ${name} (${port_id})</div>
          <div class="text-[11px] text-stone-600">Country: ${country}</div>
          <div class="text-[10px] text-stone-500 font-mono">${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E</div>
          <div class="mt-1 text-[10px] text-emerald-700 font-semibold">Cold Ironing: ${activeCorridor.origin_port.has_cold_ironing ? 'Available' : 'Standard'}</div>
        </div>
        `,
        { direction: 'top' }
      );
      routeLayers.addLayer(originMarker);
    }

    // F. Point B: Destination Port Beacon
    if (activeCorridor.destination_port) {
      const { lat, lon, port_id, name, country } = activeCorridor.destination_port;
      const destIcon = L.divIcon({
        className: 'custom-dest-beacon',
        html: `
          <div class="relative flex items-center justify-center select-none" style="width: 28px; height: 28px;">
            <span class="absolute w-8 h-8 rounded-full bg-amber-500/30 animate-ping"></span>
            <span class="absolute w-5 h-5 rounded-full bg-amber-500/40"></span>
            <span class="relative w-3.5 h-3.5 rounded-full bg-[#ff6b00] border-2 border-white shadow-md"></span>
            <div class="absolute -top-7 px-2 py-0.5 bg-stone-900/95 text-white text-[10px] font-mono font-bold rounded-md shadow-lg border border-white/20 whitespace-nowrap flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>B: ${port_id}</span>
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const destMarker = L.marker([lat, lon], { icon: destIcon });
      destMarker.bindTooltip(
        `
        <div class="font-mono text-xs p-1">
          <div class="font-bold text-amber-800">POINT B: ${name} (${port_id})</div>
          <div class="text-[11px] text-stone-600">Country: ${country}</div>
          <div class="text-[10px] text-stone-500 font-mono">${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E</div>
          <div class="mt-1 text-[10px] text-amber-700 font-semibold">Cold Ironing: ${activeCorridor.destination_port.has_cold_ironing ? 'Available' : 'Standard'}</div>
        </div>
        `,
        { direction: 'top' }
      );
      routeLayers.addLayer(destMarker);
    }

    // G. Animated Camera Fly-To & Zoom Transition
    if (activeCorridor.coordinates && activeCorridor.coordinates.length >= 2) {
      const activeLatLngs = convertCoords(activeCorridor.coordinates);
      const bounds = L.latLngBounds(activeLatLngs);

      // Smooth animated zoom-in to frame the active route with margins
      map.flyToBounds(bounds, {
        padding: [60, 60],
        maxZoom: 6,
        duration: 1.4,
        easeLinearity: 0.25,
      });
    }
  }, [mapReady, activeCorridorId, corridors, currentBasemap, speedKnots]);

  // Handlers for Custom Tactical Map Controls
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleFitRoute = () => {
    if (!mapInstanceRef.current || !activeCorridor?.coordinates || activeCorridor.coordinates.length < 2) return;
    const latlngs = activeCorridor.coordinates.map(([lon, lat]) => [lat, lon] as [number, number]);
    const bounds = L.latLngBounds(latlngs);
    mapInstanceRef.current.flyToBounds(bounds, {
      padding: [60, 60],
      duration: 1.0,
      easeLinearity: 0.25,
    });
  };

  return (
    <div
      data-testid="realistic-maritime-map"
      className="relative w-full h-[400px] sm:h-[480px] lg:h-[500px] bg-[#eef1f5] overflow-hidden select-none"
    >
      {/* 1. Underlying Leaflet Map Engine Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0 focus:outline-none" />

      {/* 2. Top-Right: Map Style & Bathymetric Layer Switcher */}
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-lg shadow-sm p-1 flex items-center gap-1 font-mono text-xs">
        <button
          onClick={() => setCurrentBasemap('voyager')}
          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
            currentBasemap === 'voyager'
              ? 'bg-stone-900 text-white font-semibold shadow-2xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
          title="Google-Maps Style Clean Vector Topography (CartoDB Voyager)"
        >
          Google Style
        </button>
        <button
          onClick={() => setCurrentBasemap('ocean')}
          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
            currentBasemap === 'ocean'
              ? 'bg-stone-900 text-white font-semibold shadow-2xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
          title="Hydrographic Bathymetry & Oceanic Relief (Esri Ocean)"
        >
          Bathymetry
        </button>
        <button
          onClick={() => setCurrentBasemap('dark')}
          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
            currentBasemap === 'dark'
              ? 'bg-stone-900 text-white font-semibold shadow-2xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
          title="Nighttime Tactical Dark Mode (CartoDB Dark)"
        >
          Dark HUD
        </button>
      </div>

      {/* 3. Bottom-Right: Tactical Zoom & Fit-Route Controls */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1.5 shadow-sm">
        <div className="bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-lg overflow-hidden flex flex-col divide-y divide-stone-100">
          <button
            onClick={handleZoomIn}
            className="p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors cursor-pointer"
            title="Zoom In (+)"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors cursor-pointer"
            title="Zoom Out (-)"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleFitRoute}
          className="p-2 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-lg text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors cursor-pointer shadow-2xs flex items-center justify-center"
          title="Re-Center & Zoom to Active Route"
        >
          <Refresh className="w-4 h-4 text-amber-600" />
        </button>
      </div>
    </div>
  );
};
