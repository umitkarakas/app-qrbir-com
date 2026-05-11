import type { MapContent } from '../../../types/blocks';
import { MapPin } from 'lucide-react';

interface MapBlockProps {
  content: MapContent;
}

export default function MapBlock({ content }: MapBlockProps) {
  const { address, lat, lng } = content;

  const mapUrl = lat && lng
    ? `https://www.google.com/maps?q=${lat},${lng}&output=embed`
    : address
    ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
    : null;

  return (
    <div className="space-y-3">
      {address && (
        <div className="flex items-start gap-2 theme-text">
          <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{address}</p>
        </div>
      )}
      {mapUrl ? (
        <div className="w-full h-64 theme-rounded overflow-hidden border theme-border">
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
        <div className="w-full h-64 theme-rounded theme-surface flex items-center justify-center border theme-border">
          <div className="text-center theme-text-secondary">
            <MapPin className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Konum ayarlanmadı</p>
          </div>
        </div>
      )}
    </div>
  );
}
