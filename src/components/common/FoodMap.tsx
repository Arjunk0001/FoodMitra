import React, { useEffect, useRef } from 'react';
import { Donation } from '../../types';
import { MapPin, Navigation } from 'lucide-react';
import L from 'leaflet';

interface FoodMapProps {
  donations: Donation[];
  selectedDonation?: Donation | null;
  onSelectDonation?: (donation: Donation) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export const FoodMap: React.FC<FoodMapProps> = ({
  donations,
  selectedDonation,
  onSelectDonation,
  height = '420px',
  center = [20.5937, 78.9629], // India center default
  zoom = 5,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map already initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Custom SVG icon creator
    const createCustomIcon = (isUrgent: boolean, isSelected: boolean) => {
      const bgColor = isUrgent ? '#E89A26' : '#066B4B';
      const ring = isSelected ? 'border: 3px solid #B9E769;' : 'border: 2px solid white;';

      return L.divIcon({
        className: 'custom-food-marker',
        html: `
          <div style="
            background: ${bgColor};
            ${ring}
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            font-size: 16px;
            transform: translate(-16px, -16px);
            cursor: pointer;
          ">
            🍲
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    };

    const validDonations = donations.filter((d) => d.latitude && d.longitude);

    validDonations.forEach((d) => {
      const isSelected = selectedDonation?.id === d.id;
      const marker = L.marker([d.latitude!, d.longitude!], {
        icon: createCustomIcon(Boolean(d.is_urgent), isSelected),
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; max-width: 220px;">
          <strong style="color: #066B4B; display: block; margin-bottom: 4px;">${d.title}</strong>
          <div style="font-size: 12px; color: #4B5563; margin-bottom: 4px;">📍 ${d.pickup_address}, ${d.city}</div>
          <div style="font-size: 12px; font-weight: 600; color: #1F2937;">👥 ${d.estimated_servings} Servings (${d.quantity})</div>
          <div style="font-size: 11px; color: ${d.is_urgent ? '#B45309' : '#047857'}; margin-top: 4px; font-weight: bold;">
            ⏱️ ${d.hours_remaining ?? 4}h remaining
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectDonation) onSelectDonation(d);
      });

      markersRef.current.push(marker);
    });

    // If specific donation selected, fly to it
    if (selectedDonation && selectedDonation.latitude && selectedDonation.longitude) {
      map.flyTo([selectedDonation.latitude, selectedDonation.longitude], 13, { duration: 1.2 });
    } else if (validDonations.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.2));
    }
  }, [donations, selectedDonation, onSelectDonation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-xs py-1.5 px-3 rounded-lg shadow-sm border border-gray-200 text-xs font-medium text-gray-700 flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#066B4B]"></span> Safe Window
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E89A26]"></span> Urgent (&lt;4h)
        </span>
      </div>
    </div>
  );
};
