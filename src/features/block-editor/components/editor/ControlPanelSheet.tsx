import { X, QrCode, Link2, Copy, ExternalLink, Check } from 'lucide-react';
import { useState } from 'react';
import type { Site } from '../../types/database';

interface ControlPanelSheetProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site;
  onNavigateToQR: () => void;
}

export default function ControlPanelSheet({ isOpen, onClose, site, onNavigateToQR }: ControlPanelSheetProps) {
  const [copied, setCopied] = useState(false);

  const siteUrl = `${window.location.origin}/${site.slug}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openInNewTab = () => {
    window.open(siteUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[80vh] overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Kontrol Paneli</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900">Site Linki</h3>
                <p className="text-sm text-slate-500 truncate">{siteUrl}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Kopyalandi</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
              <button
                onClick={openInNewTab}
                disabled={!site.is_published}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ac</span>
              </button>
            </div>
            {!site.is_published && (
              <p className="text-xs text-amber-600 mt-2 text-center">
                Linki goruntulemek icin siteyi yayinlayin
              </p>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900">QR Kod</h3>
                <p className="text-sm text-slate-500">QR kodunuzu indirin ve paylasin</p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onNavigateToQR();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Kod Olustur</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
