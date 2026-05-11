import { useState } from 'react';
import type { WifiCardContent } from '../../../types/blocks';
import { Wifi, Copy, Check } from 'lucide-react';

interface WifiCardProps {
  content: WifiCardContent;
}

export default function WifiCard({ content }: WifiCardProps) {
  const [copied, setCopied] = useState(false);

  const copyPassword = async () => {
    if (content.password) {
      await navigator.clipboard.writeText(content.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="theme-surface theme-rounded theme-shadow p-4 border theme-border">
      <div className="flex items-center gap-2 mb-4">
        <Wifi className="w-5 h-5 theme-primary-text" />
        <span className="font-medium theme-text">WiFi Erişim</span>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs theme-text-secondary uppercase tracking-wider">Ağ</p>
          <p className="font-medium theme-text">{content.networkName || 'Ağ Adı'}</p>
        </div>
        <div>
          <p className="text-xs theme-text-secondary uppercase tracking-wider">Şifre</p>
          <div className="flex items-center gap-2">
            <p className="font-mono theme-text">{content.password || '••••••••'}</p>
            {content.password && (
              <button
                onClick={copyPassword}
                className="p-1 hover:theme-surface theme-rounded transition-colors theme-text"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
