"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProjectType = "restaurant_menu" | "bio_link" | "brand_bio" | "google_review" | "event_invitation" | "campaign_link";

const PRODUCT_TYPES = [
  { type: "restaurant_menu" as ProjectType, label: "Restoran Menüsü", description: "Dijital QR menü oluşturun", subdomain: "m.qrbir.com", icon: "🍽️", gradient: "var(--gradient-tile-peach)" },
  { type: "bio_link" as ProjectType, label: "Bio Link", description: "Tüm linklerinizi tek sayfada toplayın", subdomain: "b.qrbir.com", icon: "🔗", gradient: "var(--gradient-tile-violet)" },
  { type: "brand_bio" as ProjectType, label: "Marka Bio", description: "Kurumsal marka sayfası oluşturun", subdomain: "b.qrbir.com", icon: "🏢", gradient: "var(--gradient-tile-violet-fuchsia)" },
  { type: "google_review" as ProjectType, label: "Google Yorum", description: "Müşterileri değerlendirmeye yönlendirin", subdomain: "r.qrbir.com", icon: "⭐", gradient: "var(--gradient-tile-sky)" },
  { type: "event_invitation" as ProjectType, label: "Etkinlik Daveti", description: "Dijital davetiye ve etkinlik sayfası", subdomain: "e.qrbir.com", icon: "🎉", gradient: "var(--gradient-tile-violet)" },
  { type: "campaign_link" as ProjectType, label: "Kampanya Linki", description: "Promosyon ve kampanya sayfası", subdomain: "go.qrbir.com", icon: "📣", gradient: "var(--gradient-tile-sky)" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<ProjectType | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError(""); setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectType: selected, title }),
    });
    if (!res.ok) {
      setLoading(false);
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Proje oluşturulamadı.");
      return;
    }
    const project = await res.json();
    router.push(`/projects/${project.id}/theme`);
  }

  const selectedProduct = PRODUCT_TYPES.find((p) => p.type === selected);

  return (
    <>
      {/* Inline minimal header — no search needed on this page */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="lum-section-title">Yeni Proje</h1>
          <p className="lum-section-sub">Ürün tipini seçin, birkaç adımda yayına alın</p>
        </div>
      </div>

      {/* Type grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {PRODUCT_TYPES.map((product) => {
          const isSelected = selected === product.type;
          return (
            <button
              key={product.type}
              onClick={() => { setSelected(product.type); setTitle(""); setError(""); }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 10,
                padding: 20,
                borderRadius: 20,
                border: isSelected ? "1.5px solid rgba(124,109,255,0.45)" : "1px solid rgba(255,255,255,0.55)",
                background: isSelected ? "rgba(124,109,255,0.08)" : "rgba(255,255,255,0.36)",
                boxShadow: isSelected ? "inset 0 1px 0 rgba(255,255,255,0.68), 0 0 0 3px rgba(124,109,255,0.08)" : "inset 0 1px 0 rgba(255,255,255,0.68)",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                transition: "all var(--duration-base)",
              }}
            >
              <div className="lum-tile" style={{ width: 40, height: 40, background: product.gradient, fontSize: 18 }}>
                {product.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--color-fg-1)" }}>{product.label}</p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--color-fg-3)" }}>{product.description}</p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--color-fg-4)", fontFamily: "var(--font-geist-mono, monospace)" }}>{product.subdomain}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Create form */}
      {selected && selectedProduct && (
        <div className="lum-glass" style={{ padding: 28, maxWidth: 480 }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: "var(--color-fg-1)" }}>
            {selectedProduct.icon} {selectedProduct.label}
          </h2>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {error && (
              <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--color-danger-bg)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "var(--color-danger)" }}>
                {error}
              </div>
            )}
            <div>
              <label className="lum-label">Proje adı</label>
              <input
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="lum-input"
                placeholder={`ör. ${selectedProduct.label}`}
              />
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--color-fg-4)" }}>
                Slug:{" "}
                <span style={{ fontFamily: "var(--font-geist-mono, monospace)" }}>
                  {selectedProduct.subdomain}/{title ? title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 30) : "proje-adi"}
                </span>
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || title.trim().length === 0}
              className="lum-cta"
              style={{ justifyContent: "center", opacity: (loading || !title.trim()) ? 0.6 : 1 }}
            >
              {loading ? "Oluşturuluyor…" : "Projeyi Oluştur →"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
