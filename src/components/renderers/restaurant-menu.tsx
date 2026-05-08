"use client";

import { useState } from "react";
import type { RestaurantMenuV1Type } from "@/schemas/restaurant_menu/v1";
import type { ThemeConfig } from "@/types/theme";
import { FONT_MAP, RADIUS_MAP, bgStyle } from "@/types/theme";

const CURRENCY_SYMBOL: Record<RestaurantMenuV1Type["currency"], string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

export function RestaurantMenuRenderer({
  content,
  theme,
}: {
  content: RestaurantMenuV1Type;
  theme: ThemeConfig;
}) {
  const colors = theme.colors;
  const font = FONT_MAP[theme.font ?? "sans"];
  const radius = RADIUS_MAP[theme.radius ?? "md"];
  const symbol = CURRENCY_SYMBOL[content.currency];
  const [activeIdx, setActiveIdx] = useState(0);

  const activeCat = content.categories[activeIdx];

  return (
    <div style={{ ...bgStyle(colors.bg), color: colors.fg, fontFamily: font, minHeight: "100%" }}>
      {/* Header */}
      <div style={{ backgroundColor: colors.accent, padding: "20px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          {content.restaurant.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.restaurant.logoUrl}
              alt=""
              style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", background: "rgba(255,255,255,0.2)" }}
            />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              🍽
            </div>
          )}
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 17, lineHeight: 1.2 }}>
              {content.restaurant.name || "Restoran Adı"}
            </div>
            {content.restaurant.address && (
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 2 }}>
                📍 {content.restaurant.address}
              </div>
            )}
          </div>
        </div>

        {/* Kategori sekmeleri */}
        {content.categories.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              paddingBottom: 12,
              scrollbarWidth: "none",
            }}
          >
            {content.categories.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => setActiveIdx(i)}
                style={{
                  padding: "5px 14px",
                  borderRadius: "9999px",
                  border: "none",
                  background: activeIdx === i ? "#fff" : "rgba(255,255,255,0.2)",
                  color: activeIdx === i ? colors.accent : "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: font,
                }}
              >
                {cat.name || "Kategori"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* İçerik */}
      <div style={{ padding: "14px 12px" }}>
        {content.categories.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 16px", color: colors.muted ?? "#9ca3af" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🍴</div>
            <div style={{ fontSize: 13 }}>Henüz kategori eklenmedi</div>
          </div>
        )}

        {activeCat?.items.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 16px", color: colors.muted ?? "#9ca3af", fontSize: 13 }}>
            Bu kategoride henüz ürün yok
          </div>
        )}

        {activeCat?.items.map((item) => (
          <div
            key={item.id}
            style={{
              background: colors.card ?? "#fff",
              border: `1px solid ${colors.border ?? "#e5e7eb"}`,
              borderRadius: radius,
              padding: "10px 12px",
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: colors.cardFg ?? colors.fg, lineHeight: 1.3 }}>
                {item.name || "Ürün Adı"}
              </div>
              {item.description && (
                <div
                  style={{
                    fontSize: 11,
                    color: colors.muted ?? "#6b7280",
                    marginTop: 3,
                    lineHeight: 1.4,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {item.description}
                </div>
              )}
            </div>
            {item.price != null && (
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: colors.accent,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {symbol}{item.price.toFixed(2)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      {(content.restaurant.phone || content.restaurant.instagram) && (
        <div
          style={{
            borderTop: `1px solid ${colors.border ?? "#e5e7eb"}`,
            padding: "12px 16px",
            display: "flex",
            gap: 12,
            justifyContent: "center",
          }}
        >
          {content.restaurant.phone && (
            <span style={{ fontSize: 12, color: colors.muted ?? "#6b7280" }}>
              📞 {content.restaurant.phone}
            </span>
          )}
          {content.restaurant.instagram && (
            <span style={{ fontSize: 12, color: colors.accent }}>
              @{content.restaurant.instagram.replace(/^@/, "")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
