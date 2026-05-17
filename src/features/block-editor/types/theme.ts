import type { Theme, ThemeStyle } from './database';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
}

export interface ThemeStyleConfig {
  borderRadius: string;
  borderWidth: string;
  shadow: string;
  blur?: string;
  spacing?: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  fonts: ThemeFonts;
  style: ThemeStyleConfig;
}

export interface ParsedTheme extends Theme {
  config: ThemeConfig;
}

export type { Theme, ThemeStyle };
