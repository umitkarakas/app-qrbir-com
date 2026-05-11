import type { LocationMapContent } from '../../../types/blocks';
import { MapPin, Navigation } from 'lucide-react';

interface LocationMapProps {
  content: LocationMapContent;
}

export default function LocationMap({ content }: LocationMapProps) {
  const { venueName, address, lat, lng, showDirectionsButton = true } = content;

  const mapUrl = lat && lng
    ? `https://www.google.com/maps?q=${lat},${lng}&output=embed`
    : address
    ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
    : null;

  const directionsUrl = lat && lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
    : null;

  return (
    <div className="space-y-4">
      {(venueName || address) && (
        <div className="space-y-1">
          {venueName && (
            <h3 className="font-semibold theme-text">{venueName}</h3>
          )}
          {address && (
            <div className="flex items-start gap-2 theme-text-secondary">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-sm">{address}</p>
            </div>
          )}
        </div>
      )}

      {mapUrl ? (
        <div className="w-full h-56 theme-rounded overflow-hidden border theme-border">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="w-full h-56 theme-rounded theme-surface flex items-center justify-center border theme-border">
          <div className="text-center theme-text-secondary">
            <MapPin className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Konum ayarlanmadi</p>
          </div>
        </div>
      )}

      {showDirectionsButton && directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 theme-primary text-white theme-rounded font-medium hover:opacity-90 transition-opacity theme-shadow"
        >
          <Navigation className="w-4 h-4" />
          Yol Tarifi Al
        </a>
      )}
    </div>
  );
}
