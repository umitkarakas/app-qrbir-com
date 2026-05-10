import React from "react";
import type { ThemeTemplate } from "@/lib/theme-editor/contract";
import type { RestaurantMenuV1Type } from "@/schemas/restaurant_menu/v1";
import { FONT_MAP, RADIUS_MAP, bgStyle } from "@/types/theme";

const CURRENCY_SYMBOL: Record<string, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

// Crown SVG for premium badge
function CrownIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 19l2-9 5 4 3-8 3 8 5-4 2 9H2zm2-2h16l-1.4-6.3-4.1 3.3-3.5-9.4-3.5 9.4-4.1-3.3L4 17z" />
    </svg>
  );
}

function ArrowCircle({ accent }: { accent: string }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%",
      background: accent,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  );
}

export const darkPremium: ThemeTemplate<RestaurantMenuV1Type> = {
  id: "restaurant-menu/dark-premium",
  name: "Dark Premium",
  productType: "restaurant_menu",
  version: 1,
  viewport: {
    baseWidth: 390,
    minWidth: 320,
    maxWidth: 430,
    safeArea: "mobile",
  },
  capabilities: ["darkMode", "itemImage", "premiumBadge", "categoryGrid", "offerSection", "bottomNav", "logoImage"],

  defaultConfig: {
    colors: {
      bg: "#1a1a2e",
      fg: "#ffffff",
      accent: "#c9922a",
      card: "#252545",
      cardFg: "#ffffff",
      muted: "rgba(255,255,255,0.45)",
    },
    font: "sans",
    radius: "lg",
  },

  editorSchema: {
    sections: [
      {
        label: "Renkler",
        fields: [
          { type: "color", key: "colors.bg", label: "Arka Plan" },
          { type: "color", key: "colors.card", label: "Kart" },
          { type: "color", key: "colors.fg", label: "Metin" },
          { type: "color", key: "colors.accent", label: "Vurgu (Altın)" },
          { type: "color", key: "colors.muted", label: "Soluk Metin" },
        ],
      },
      {
        label: "Tipografi & Şekil",
        fields: [
          { type: "font", key: "font", label: "Font" },
          { type: "radius", key: "radius", label: "Köşe Yuvarlama" },
        ],
      },
    ],
  },

  render({ content, theme, mode }) {
    const { colors, font = "sans", radius = "lg" } = theme;
    const fontFamily = FONT_MAP[font];
    const br = RADIUS_MAP[radius];
    const sym = CURRENCY_SYMBOL[content?.currency ?? "TRY"] ?? "₺";
    const restaurant = content?.restaurant;
    const categories = content?.categories ?? [];

    // First category → 2-col grid, rest → horizontal list
    const [mainCategory, ...offerCategories] = categories;

    return (
      <div style={{
        ...bgStyle(colors.bg),
        fontFamily,
        color: colors.fg,
        minHeight: 667,
        position: "relative",
        overflowX: "hidden",
      }}>
        {/* ── Header ── */}
        <div style={{ padding: "20px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {restaurant?.logoUrl ? (
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: `2px solid ${colors.accent}` }}
              />
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: colors.accent,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 700, color: "#fff",
              }}>
                {(restaurant?.name ?? "R").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: colors.fg }}>
                {restaurant?.name || "Restoran"}
              </p>
              {restaurant?.address && (
                <p style={{ margin: 0, fontSize: 11, color: colors.muted ?? "rgba(255,255,255,0.45)" }}>
                  {restaurant.address}
                </p>
              )}
            </div>
          </div>

          {/* Cart badge */}
          <div style={{
            background: colors.fg,
            borderRadius: br,
            padding: "8px 12px",
            display: "flex", flexDirection: "column", alignItems: "center",
            minWidth: 48,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.bg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span style={{ fontSize: 10, fontWeight: 700, color: colors.bg, lineHeight: 1.2 }}>
              {(mainCategory?.items?.length ?? 0)} ürün
            </span>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div style={{ paddingBottom: 80, overflowY: mode === "preview" ? "auto" : undefined }}>

          {/* ── Main category (2-column grid) ── */}
          {mainCategory && (
            <div style={{ padding: "4px 16px 20px" }}>
              {/* Section header */}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 4 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: colors.fg, letterSpacing: -0.5 }}>
                    {mainCategory.name}
                  </h2>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: colors.accent }}>Premium</p>
                </div>
                <span style={{ fontSize: 12, color: colors.muted ?? "rgba(255,255,255,0.45)", marginBottom: 2 }}>
                  Tümü →
                </span>
              </div>

              {/* 2-column grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                {mainCategory.items.slice(0, 4).map((item) => (
                  <div key={item.id} style={{
                    background: colors.card ?? "#252545",
                    borderRadius: br,
                    paddingTop: 60,
                    paddingBottom: 14,
                    paddingLeft: 12,
                    paddingRight: 12,
                    position: "relative",
                    minHeight: 160,
                  }}>
                    {/* Floating image */}
                    <div style={{
                      position: "absolute",
                      top: -28,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.08)",
                      border: `3px solid ${colors.card ?? "#252545"}`,
                    }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: colors.cardFg ?? colors.fg, lineHeight: 1.2 }}>
                      {item.name}
                    </p>

                    {/* Premium badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
                      <CrownIcon />
                      <span style={{ fontSize: 10, fontWeight: 700, color: colors.accent, letterSpacing: "0.04em" }}>
                        PREMIUM
                      </span>
                    </div>

                    {/* Price + arrow */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: colors.cardFg ?? colors.fg }}>
                        {item.price !== undefined ? `${sym}${item.price}` : "—"}
                      </span>
                      <ArrowCircle accent={colors.accent} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Offer categories (horizontal cards) ── */}
          {offerCategories.map((category) => (
            <div key={category.id} style={{ padding: "0 16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: colors.fg, letterSpacing: -0.5 }}>
                  {category.name}
                </h2>
                <span style={{ fontSize: 12, color: colors.muted ?? "rgba(255,255,255,0.45)" }}>
                  Tümü →
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {category.items.slice(0, 3).map((item) => (
                  <div key={item.id} style={{
                    background: colors.card ?? "#252545",
                    borderRadius: br,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                  }}>
                    {/* Image */}
                    <div style={{ width: 60, height: 60, borderRadius: br, overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.08)" }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🍽️</div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: colors.cardFg ?? colors.fg }}>
                        {item.name}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                        <CrownIcon />
                        <span style={{ fontSize: 10, fontWeight: 700, color: colors.accent }}>PREMIUM</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {item.price !== undefined && (
                          <span style={{ fontSize: 14, fontWeight: 700, color: colors.cardFg ?? colors.fg }}>
                            {sym}{item.price}
                          </span>
                        )}
                      </div>
                    </div>

                    <ArrowCircle accent={colors.accent} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom nav ── */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 72,
          ...bgStyle(colors.bg),
          borderTop: `1px solid rgba(255,255,255,0.06)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 32px",
        }}>
          {[
            <svg key="home" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>,
            <svg key="search" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
            <svg key="cart" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>,
          ].map((icon, i) => (
            <div key={i} style={{
              width: 48, height: 48,
              borderRadius: "50%",
              background: i === 0 ? colors.accent : "rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: i === 0 ? "#fff" : colors.muted ?? "rgba(255,255,255,0.45)",
            }}>
              {icon}
            </div>
          ))}
        </div>
      </div>
    );
  },
};
