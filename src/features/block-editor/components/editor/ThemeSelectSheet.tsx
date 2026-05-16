import { useState, useMemo } from 'react';
import { X, Search, Check, Lock } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import type { Theme } from '../../types/database';
import type { ThemeConfig } from '../../types/theme';

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

  const handleSelectTheme = (themeId: string, isPremium: boolean = false) => {
    void isPremium;
    selectTheme(themeId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/35 animate-in fade-in duration-200" onClick={onClose} />
      <aside className="fixed bottom-0 left-0 top-0 z-50 w-full max-w-[380px] animate-in slide-in-from-left duration-300">
        <div className="flex h-full flex-col border-r border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Tasarım Seç</h2>
                <p className="mt-1 text-xs text-slate-500">/admin/themes tasarımları. Kaydet ile şablona bağlanır.</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tasarım ara..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-0 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain p-5">
                {filteredThemes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-500">
                      {search ? `"${search}" için tasarım bulunamadı` : "Bu ürün tipi için tasarım bulunamadı"}
                    </p>
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

            <div className="border-t border-slate-100 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                {hoveredTheme ? `Önizleme: ${hoveredTheme.name}` : selectedTheme ? `Seçili: ${selectedTheme.name}` : 'Tasarım seçilmedi'}
              </p>
              <AdminThemePreview theme={hoveredTheme ?? selectedTheme} />
            </div>
          </div>
      </aside>
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
  return (
    <button
      onClick={() => onSelect(theme.id, theme.is_premium)}
      onMouseEnter={() => onHover(theme)}
      onMouseLeave={() => onHover(null)}
      disabled={isLocked}
      className={`relative w-full rounded-xl border-2 p-3 text-left transition-all ${
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
      <div className="space-y-3">
        <AdminThemePreview theme={theme} />
        <div className="flex items-center gap-3">
          <ThemePreviewMini config={theme.config as ThemeConfig} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold text-slate-900">{theme.name}</h3>
              {theme.is_premium && (
                <span className="shrink-0 rounded bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                  PRO
                </span>
              )}
            </div>
            <p className="truncate text-sm text-slate-500">{theme.description}</p>
            {STYLE_LABELS[theme.style] ? (
              <p className="mt-0.5 text-xs text-slate-400">{STYLE_LABELS[theme.style]}</p>
            ) : null}
          </div>
          {isSelected && !isLocked && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function AdminThemePreview({ theme }: { theme: Theme | null }) {
  if (!theme) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-white p-5 text-center text-sm text-slate-400">
        Sol listeden bir tasarım seçin.
      </div>
    );
  }

  const config = theme.config as ThemeConfig;
  const { colors, style } = config;

  if (theme.preview_image) {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-100 bg-slate-100">
        <img
          src={theme.preview_image}
          alt={`${theme.name} önizleme`}
          className="h-44 w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-lg border border-slate-100 p-4"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        borderColor: colors.border,
        boxShadow: style.shadow,
      }}
    >
      <div
        className="space-y-3 border p-4"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: style.borderRadius,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full"
            style={{ backgroundColor: colors.primary }}
          />
          <div className="min-w-0 flex-1">
            <div
              className="h-3 w-28 rounded"
              style={{ backgroundColor: colors.text }}
            />
            <div
              className="mt-2 h-2 w-20 rounded"
              style={{ backgroundColor: colors.textSecondary }}
            />
          </div>
        </div>
        <div
          className="h-10 w-full rounded"
          style={{
            backgroundColor: colors.primary,
            borderRadius: style.borderRadius,
          }}
        />
        <div className="grid grid-cols-4 gap-2">
          {[colors.primary, colors.secondary, colors.accent, colors.border].map((color, index) => (
            <span
              key={`${color}-${index}`}
              className="h-6 rounded"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
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
