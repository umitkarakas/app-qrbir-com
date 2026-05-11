import { X, ExternalLink, Smartphone, Monitor } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import BlockRenderer from '../blocks/BlockRenderer';
import { getThemeVariables } from '../../lib/theme';
import type { ThemeConfig } from '../../types/theme';

interface PreviewSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreviewSheet({ isOpen, onClose }: PreviewSheetProps) {
  const { site, blocks, selectedTheme } = useEditor();
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');

  const themeConfig = selectedTheme?.config as ThemeConfig | undefined;
  const themeVariables = useMemo(() => {
    return themeConfig ? getThemeVariables(themeConfig) : {};
  }, [themeConfig]);

  if (!isOpen || !site) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex flex-col animate-in fade-in duration-300">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-slate-900">Önizleme</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-1.5 rounded transition-colors ${
                  previewMode === 'mobile' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 rounded transition-colors ${
                  previewMode === 'desktop' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>

            {site.is_published && (
              <a
                href={`/${site.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Canlı Aç</span>
              </a>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 p-4 lg:p-8 flex items-center justify-center">
          <div className="relative flex items-center justify-center w-full h-full">
            <div
              className={`relative transition-all ${
                previewMode === 'mobile' ? 'w-full max-w-[375px]' : 'w-full max-w-3xl'
              }`}
            >
              {previewMode === 'mobile' && (
                <>
                  <div className="hidden lg:block absolute -inset-3 bg-slate-900 rounded-[3rem] shadow-2xl" />
                  <div className="hidden lg:block absolute -inset-2 bg-slate-800 rounded-[2.5rem]" />
                  <div className="hidden lg:block absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-full z-10" />
                </>
              )}

              <div
                className={`relative shadow-xl overflow-hidden h-fit ${
                  previewMode === 'mobile' ? 'lg:rounded-[2rem] rounded-2xl' : 'rounded-2xl'
                }`}
                style={{
                  ...themeVariables,
                  backgroundColor: themeConfig?.colors.background || '#FFFFFF',
                  color: themeConfig?.colors.text || '#111827',
                  fontFamily: themeConfig?.fonts.body || 'Inter, sans-serif',
                } as React.CSSProperties}
              >
                <div className={`min-h-[500px] p-4 ${previewMode === 'mobile' ? 'lg:max-h-[680px] overflow-y-auto' : ''}`}>
                  {blocks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-20" style={{ color: themeConfig?.colors.textSecondary || '#64748B' }}>
                      <p className="text-center">Henüz önizlenecek blok yok.</p>
                      <p className="text-sm mt-1">Blokları burada görmek için ekleyin.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {blocks.map((block) => (
                        <BlockRenderer key={block.id} block={block} siteId={site.id} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
