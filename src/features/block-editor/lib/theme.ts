/**
 * theme.ts — CSS variable üretici ve uygulayıcı
 *
 * Bu dosya RUNTIME ThemeConfig ile çalışır (primary/background/text formatı).
 * DB formatından (bg/fg/accent) dönüşüm için normalize-theme.ts kullanın.
 */
import { ThemeConfig } from '../types/theme';

export const applyTheme = (config: ThemeConfig, element: HTMLElement = document.documentElement): void => {
  const variables = getThemeVariables(config);

  Object.entries(variables).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
};

export const removeTheme = (element: HTMLElement = document.documentElement): void => {
  const variableNames = [
    '--theme-primary',
    '--theme-secondary',
    '--theme-accent',
    '--theme-background',
    '--theme-surface',
    '--theme-text',
    '--theme-text-secondary',
    '--theme-border',
    '--theme-error',
    '--theme-success',
    '--theme-warning',
    '--theme-font-heading',
    '--theme-font-body',
    '--theme-border-radius',
    '--theme-border-width',
    '--theme-shadow',
    '--theme-blur',
    '--theme-spacing',
  ];

  variableNames.forEach(name => {
    element.style.removeProperty(name);
  });
};

export const getThemeVariables = (config: ThemeConfig): Record<string, string> => {
  return {
    '--theme-primary': config.colors.primary,
    '--theme-secondary': config.colors.secondary,
    '--theme-accent': config.colors.accent,
    '--theme-background': config.colors.background,
    '--theme-surface': config.colors.surface,
    '--theme-text': config.colors.text,
    '--theme-text-secondary': config.colors.textSecondary,
    '--theme-border': config.colors.border,
    '--theme-error': config.colors.error,
    '--theme-success': config.colors.success,
    '--theme-warning': config.colors.warning,
    '--theme-font-heading': config.fonts.heading,
    '--theme-font-body': config.fonts.body,
    '--theme-border-radius': config.style.borderRadius,
    '--theme-border-width': config.style.borderWidth,
    '--theme-shadow': config.style.shadow,
    '--theme-blur': config.style.blur || 'none',
    '--theme-spacing': config.style.spacing || '0.875rem',
  };
};

export const getThemeStyles = (config: ThemeConfig): string => {
  const variables = getThemeVariables(config);
  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n');
};
