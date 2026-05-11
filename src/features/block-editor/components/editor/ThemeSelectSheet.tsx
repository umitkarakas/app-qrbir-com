import { useState, useMemo } from 'react';
import { X, Search, Palette, Check, Lock, Eye, EyeOff } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import type { Theme } from '../../types/database';
import type { ThemeConfig } from '../../types/theme';
import ThemePreviewPanel from './ThemePreviewPanel';

interface ThemeSelectSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const STYLE_LABELS: Record<string, string> = {
  'flat': 'Flat/Minimal',
  'neo-brutalism': 'Neo-Brutalism',
  'glassmorphism': 'Glassmorphism',
};

export default function ThemeSelectSheet({ isOpen, onClose }: ThemeSelectSheetProps) {
  const { themes, selectedTheme, selectTheme } = useEditor();
  const [search, setSearch] = useState('');
  const [hoveredTheme, setHoveredTheme] = useState<Theme | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const filteredThemes = useMemo(() => {
    if (!search.trim()) return themes;
    const query = search.toLowerCase();
    return themes.filter(
      (theme) =>
        theme.name.toLowerCase().includes(query) ||
        theme.description.toLowerCase().includes(query) ||
        theme.style.toLowerCase().includes(query)
    );
  }, [search, themes]);

  const handleSelectTheme = (themeId: string | null, isPremium: boolean = false) => {
    void isPremium;
    selectTheme(themeId);
    onClose();
  };

  const previewConfig = useMemo(() => {
    if (hoveredTheme) {
      return hoveredTheme.config as ThemeConfig;
    }
    if (selectedTheme) {
      return selectedTheme.config as ThemeConfig;
    }
    return null;
  }, [hoveredTheme, selectedTheme]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200" onClick={onClose} />
      <div className="fixed inset-4 lg:inset-8 z-50 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl h-full flex flex-col lg:flex-row shadow-2xl overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 lg:max-w-md lg:border-r border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Tasarim Sec</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title={showPreview ? 'Listeyi goster' : 'Onizlemeyi goster'}
                >
                  {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className={`flex-1 flex flex-col overflow-hidden ${showPreview ? 'hidden lg:flex' : 'flex'}`}>
              <div className="px-5 py-3 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tema ara..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-0 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain p-5">
                <div className="mb-4">
                  <button
                    onClick={() => handleSelectTheme(null)}
                    onMouseEnter={() => setHoveredTheme(null)}
                    onMouseLeave={() => setHoveredTheme(null)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      !selectedTheme
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                          <Palette className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-slate-900">Varsayilan</h3>
                          <p className="text-sm text-slate-500">Temasiz kullan</p>
                        </div>
                      </div>
                      {!selectedTheme && (
                        <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                {filteredThemes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">{`"${search}" icin tema bulunamadi`}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredThemes.map((theme) => (
                      <ThemeOption
                        key={theme.id}
                        theme={theme}
                        isSelected={selectedTheme?.id === theme.id}
                        isLocked={false}
                        onSelect={handleSelectTheme}
                        onHover={setHoveredTheme}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={`flex-1 lg:hidden p-4 ${showPreview ? 'block' : 'hidden'}`}>
              <div className="h-full bg-slate-100 rounded-xl overflow-hidden">
                <ThemePreviewPanel config={previewConfig} />
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-1 bg-slate-100 p-6 items-center justify-center">
            <div className="w-full max-w-sm">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-slate-400">qr1.site/preview</span>
                  </div>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  <ThemePreviewPanel config={previewConfig} />
                </div>
              </div>
              <p className="text-center text-sm text-slate-500 mt-4">
                {hoveredTheme ? (
                  <>
                    Onizleme: <span className="font-medium text-slate-700">{hoveredTheme.name}</span>
                  </>
                ) : selectedTheme ? (
                  <>
                    Secili tema: <span className="font-medium text-slate-700">{selectedTheme.name}</span>
                  </>
                ) : (
                  'Varsayilan tema'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface ThemeOptionProps {
  theme: Theme;
  isSelected: boolean;
  isLocked: boolean;
  onSelect: (themeId: string, isPremium: boolean) => void;
  onHover: (theme: Theme | null) => void;
}

function ThemeOption({ theme, isSelected, isLocked, onSelect, onHover }: ThemeOptionProps) {
  const config = theme.config as ThemeConfig;

  return (
    <button
      onClick={() => onSelect(theme.id, theme.is_premium)}
      onMouseEnter={() => onHover(theme)}
      onMouseLeave={() => onHover(null)}
      disabled={isLocked}
      className={`relative w-full p-4 rounded-xl border-2 transition-all text-left ${
        isLocked
          ? 'opacity-60 cursor-not-allowed'
          : isSelected
          ? 'border-slate-900 bg-slate-50'
          : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
      }`}
    >
      {isLocked && (
        <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
          <div className="bg-white rounded-full p-3 shadow-lg">
            <Lock className="w-6 h-6 text-slate-700" />
          </div>
        </div>
      )}
      <div className="flex items-center gap-3">
        <ThemePreviewMini config={config} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 truncate">{theme.name}</h3>
            {theme.is_premium && (
              <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded shrink-0">
                PRO
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 truncate">{theme.description}</p>
          <p className="text-xs text-slate-400 mt-0.5">{STYLE_LABELS[theme.style]}</p>
        </div>
        {isSelected && !isLocked && (
          <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </button>
  );
}

interface ThemePreviewMiniProps {
  config: ThemeConfig;
}

function ThemePreviewMini({ config }: ThemePreviewMiniProps) {
  const { colors, style } = config;

  return (
    <div
      className="w-14 h-14 rounded-lg shrink-0 p-2 flex flex-col gap-1"
      style={{
        backgroundColor: colors.background,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div
        className="w-4 h-4 rounded-full mx-auto"
        style={{ backgroundColor: colors.surface }}
      />
      <div
        className="h-2 w-full"
        style={{
          backgroundColor: colors.primary,
          borderRadius: style.borderRadius,
        }}
      />
      <div
        className="h-1.5 w-3/4 mx-auto"
        style={{ backgroundColor: colors.border }}
      />
    </div>
  );
}
