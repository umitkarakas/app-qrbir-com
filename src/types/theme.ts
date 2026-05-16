export type ThemeColors = {
  /** Hex rengi veya CSS gradient (örn. "linear-gradient(...)") */
  bg: string;
  /** Ana metin rengi */
  fg: string;
  /** Baslik rengi (opsiyonel) */
  heading?: string;
  /** Link rengi (opsiyonel) */
  link?: string;
  /** Vurgu / buton rengi */
  accent: string;
  /** Buton arka plan rengi (opsiyonel) */
  button?: string;
  /** Buton metin rengi (opsiyonel) */
  buttonFg?: string;
  /** Kart arka planı (opsiyonel) */
  card?: string;
  /** Kart metin rengi (opsiyonel) */
  cardFg?: string;
  /** Kenar çizgisi rengi (opsiyonel) */
  border?: string;
  /** İkincil / soluk metin (opsiyonel) */
  muted?: string;
  /** Arka plan uzeri dekoratif katman rengi (opsiyonel) */
  overlay?: string;
};

export type ThemeSurface = {
  borderWidth?: number;
  shadow?: "none" | "soft" | "medium" | "strong" | "glow";
  background?: "solid" | "gradient" | "pattern";
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;
  cardOpacity?: number;
  spacing?: "compact" | "comfortable" | "spacious";
};

export type ThemeConfig = {
  colors: ThemeColors;
  font?: "sans" | "serif" | "mono" | "rounded";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  surface?: ThemeSurface;
  layout?: string;
  style?: string;
  effect?: string;
};

// --- Yardımcı sabitler ---

export const FONT_MAP: Record<NonNullable<ThemeConfig["font"]>, string> = {
  sans: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"Courier New", Courier, monospace',
  rounded: 'system-ui, sans-serif',
};

export const RADIUS_MAP: Record<NonNullable<ThemeConfig["radius"]>, string> = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "14px",
  full: "9999px",
};

/** `colors.bg` gradient olabilir — inline style'a doğru prop yaz. */
export function bgStyle(bg: string): React.CSSProperties {
  if (bg.startsWith("linear-gradient") || bg.startsWith("radial-gradient")) {
    return { background: bg };
  }
  return { backgroundColor: bg };
}
