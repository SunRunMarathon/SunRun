// @ts-nocheck
"use client";

import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RouteMap.css';

// Przybliżona trasa 5 km przez Park Ludowy w Lublinie (2 pętle × ~2.5 km)
const ROUTE: [number, number][] = [
  [51.2478, 22.5508], // Start / Meta
  [51.2483, 22.5527],
  [51.2483, 22.5549],
  [51.2475, 22.5572],
  [51.2463, 22.5583],
  [51.2451, 22.5574],
  [51.2442, 22.5557],
  [51.2441, 22.5534],
  [51.2448, 22.5516],
  [51.2459, 22.5504],
  [51.2470, 22.5501],
  [51.2478, 22.5508], // Koniec pętli 1
  [51.2481, 22.5521],
  [51.2480, 22.5543],
  [51.2473, 22.5562],
  [51.2462, 22.5572],
  [51.2451, 22.5564],
  [51.2445, 22.5549],
  [51.2446, 22.5531],
  [51.2453, 22.5516],
  [51.2463, 22.5510],
  [51.2472, 22.5509],
  [51.2478, 22.5508], // Meta
];

const CENTER: [number, number] = [51.2462, 22.5542];

export default function RouteMap() {
  const startIcon = L.divIcon({
    html: '<div class="route-start-pin"></div>',
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

  return (
    <MapContainer
      center={CENTER}
      zoom={15}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      scrollWheelZoom={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      <Polyline
        positions={ROUTE}
        pathOptions={{
          color: '#FFEC8E',
          weight: 5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
      <Marker position={ROUTE[0]} icon={startIcon}>
        <Popup className="route-popup">
          <strong>Start / Meta</strong><br />Park Ludowy, al. Piłsudskiego
        </Popup>
      </Marker>
    </MapContainer>
  );
}
