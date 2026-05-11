import { useMemo } from 'react';
import { User, ExternalLink, Send } from 'lucide-react';
import type { ThemeConfig } from '../../types/theme';
import { getThemeVariables } from '../../lib/theme';

interface ThemePreviewPanelProps {
  config: ThemeConfig | null;
  compact?: boolean;
}

export default function ThemePreviewPanel({ config, compact = false }: ThemePreviewPanelProps) {
  const themeStyles = useMemo(() => {
    if (!config) return {};
    return {
      ...getThemeVariables(config),
      backgroundColor: config.colors.background,
      color: config.colors.text,
      fontFamily: config.fonts.body,
    };
  }, [config]);

  const colors = config?.colors || {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  };

  const style = config?.style || {
    borderRadius: '0.75rem',
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  };

  const fonts = config?.fonts || {
    heading: 'system-ui, -apple-system, sans-serif',
    body: 'system-ui, -apple-system, sans-serif',
  };

  if (compact) {
    return (
      <div
        className="rounded-xl overflow-hidden"
        style={{
          ...themeStyles as React.CSSProperties,
          minHeight: '180px',
        }}
      >
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: colors.surface,
                boxShadow: style.shadow,
              }}
            >
              <User className="w-5 h-5" style={{ color: colors.textSecondary }} />
            </div>
            <div>
              <p style={{ color: colors.text, fontFamily: fonts.heading, fontWeight: 600, fontSize: '14px' }}>
                Ahmet Yilmaz
              </p>
              <p style={{ color: colors.textSecondary, fontSize: '12px' }}>Web Developer</p>
            </div>
          </div>

          <button
            className="w-full py-2 px-3 text-white text-sm font-medium flex items-center justify-center gap-2"
            style={{
              backgroundColor: colors.primary,
              borderRadius: style.borderRadius,
              boxShadow: style.shadow,
            }}
          >
            Portfolio
            <ExternalLink className="w-3 h-3" />
          </button>

          <div style={{ borderTop: `1px solid ${colors.border}` }} />

          <p style={{ color: colors.textSecondary, fontSize: '11px', textAlign: 'center' }}>
            Yazilim gelistirme ve tasarim
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden h-full"
      style={{
        ...themeStyles as React.CSSProperties,
        minHeight: '500px',
      }}
    >
      <div className="max-w-sm mx-auto p-6 space-y-5">
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{
              backgroundColor: colors.surface,
              boxShadow: style.shadow,
            }}
          >
            <User className="w-10 h-10" style={{ color: colors.textSecondary }} />
          </div>
          <h2
            style={{
              color: colors.text,
              fontFamily: fonts.heading,
              fontSize: '1.25rem',
              fontWeight: 700,
            }}
          >
            Ahmet Yilmaz
          </h2>
          <p style={{ color: colors.textSecondary, fontSize: '0.875rem', marginTop: '4px' }}>
            Web Developer & Designer
          </p>
          <p style={{ color: colors.textSecondary, fontSize: '0.75rem', marginTop: '8px' }}>
            Istanbul&apos;da yasayan full-stack developer. Modern web teknolojileri ile calismaktan keyif aliyorum.
          </p>
        </div>

        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="w-full py-3 px-4 text-white font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          style={{
            backgroundColor: colors.primary,
            borderRadius: style.borderRadius,
            boxShadow: style.shadow,
          }}
        >
          Portfolio
          <ExternalLink className="w-4 h-4" />
        </a>

        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="w-full py-3 px-4 font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
          style={{
            border: `2px solid ${colors.border}`,
            borderRadius: style.borderRadius,
            color: colors.primary,
          }}
        >
          LinkedIn
          <ExternalLink className="w-4 h-4" />
        </a>

        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="w-full py-3 px-4 font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
          style={{
            borderRadius: style.borderRadius,
            color: colors.primary,
          }}
        >
          GitHub
          <ExternalLink className="w-4 h-4" />
        </a>

        <div style={{ borderTop: `1px solid ${colors.border}`, margin: '20px 0' }} />

        <p style={{ color: colors.text, textAlign: 'center', fontSize: '0.875rem' }}>
          Yazilim gelistirme, UI/UX tasarim ve modern web teknolojileri konularinda 5+ yillik deneyim.
        </p>

        <div style={{ borderTop: `1px dashed ${colors.border}`, margin: '20px 0' }} />

        <div
          className="p-4"
          style={{
            backgroundColor: colors.surface,
            borderRadius: style.borderRadius,
            boxShadow: style.shadow,
          }}
        >
          <h3
            style={{
              color: colors.text,
              fontFamily: fonts.heading,
              fontWeight: 600,
              marginBottom: '12px',
            }}
          >
            Iletisime Gec
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Adiniz"
              className="w-full px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: style.borderRadius,
                color: colors.text,
              }}
              readOnly
            />
            <input
              type="email"
              placeholder="E-posta"
              className="w-full px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: style.borderRadius,
                color: colors.text,
              }}
              readOnly
            />
            <textarea
              placeholder="Mesajiniz"
              rows={3}
              className="w-full px-3 py-2 text-sm outline-none resize-none"
              style={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: style.borderRadius,
                color: colors.text,
              }}
              readOnly
            />
            <button
              className="w-full py-2.5 px-4 text-white text-sm font-medium flex items-center justify-center gap-2"
              style={{
                backgroundColor: colors.primary,
                borderRadius: style.borderRadius,
              }}
            >
              <Send className="w-4 h-4" />
              Mesaj Gonder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
