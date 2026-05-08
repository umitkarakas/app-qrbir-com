"use client";

import { useState, useMemo } from "react";
import { AdminStatusSelect } from "./admin-status-select";
import { SendApprovalButton } from "./send-approval-button";
import { ActivateButton } from "./activate-button";

type Project = {
  id: number;
  title: string;
  slug: string;
  projectType: string;
  subdomainType: string;
  status: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  themeName: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Taslak",
  info_missing: "Bilgi Eksik",
  studio_pending: "Stüdyo Bekliyor",
  in_design: "Tasarımda",
  preview_ready: "Önizleme Hazır",
  customer_revision: "Revizyon",
  approved: "Onaylandı",
  payment_pending: "Ödeme Bekliyor",
  paid: "Ödendi",
  published: "Yayında",
  paused: "Duraklatıldı",
  expired: "Süresi Doldu",
  cancelled: "İptal",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  info_missing: "bg-yellow-50 text-yellow-700",
  studio_pending: "bg-blue-50 text-blue-700",
  in_design: "bg-purple-50 text-purple-700",
  preview_ready: "bg-indigo-50 text-indigo-700",
  customer_revision: "bg-orange-50 text-orange-700",
  approved: "bg-teal-50 text-teal-700",
  payment_pending: "bg-amber-50 text-amber-700",
  paid: "bg-green-50 text-green-700",
  published: "bg-green-100 text-green-800",
  paused: "bg-gray-100 text-gray-500",
  expired: "bg-red-50 text-red-600",
  cancelled: "bg-red-50 text-red-400",
};

const SUBDOMAIN_DOMAIN: Record<string, string> = {
  m: "m.qrbir.com", b: "b.qrbir.com", r: "r.qrbir.com",
  e: "e.qrbir.com", go: "go.qrbir.com",
};

export function ProjectFilter({ projects }: { projects: Project[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const allStatuses = useMemo(
    () => [...new Set(projects.map((p) => p.status))].sort(),
    [projects]
  );

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase()) ||
        p.userId.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [projects, search, statusFilter]);

  return (
    <div>
      {/* Filtreler */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Proje adı, slug veya kullanıcı ID ara…"
          className="lum-input"
          style={{ width: 280 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="lum-input"
          style={{ width: "auto" }}
        >
          <option value="">Tüm durumlar</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s] ?? s}
            </option>
          ))}
        </select>
        {(search || statusFilter) && (
          <button
            onClick={() => { setSearch(""); setStatusFilter(""); }}
            style={{ fontSize: 12, color: "var(--color-fg-3)", background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.55)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit" }}
          >
            Temizle
          </button>
        )}
        <span style={{ fontSize: 12, color: "var(--color-fg-4)" }}>
          {filtered.length} / {projects.length} proje
        </span>
      </div>

      {/* Tablo */}
      <div className="lum-glass" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.35)" }}>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "var(--color-fg-3)" }}>Proje</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "var(--color-fg-3)" }}>Tür</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "var(--color-fg-3)" }}>Durum</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "var(--color-fg-3)" }}>Tarih</th>
              <th style={{ textAlign: "right", padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "var(--color-fg-3)" }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "40px 0", fontSize: 13, color: "var(--color-fg-4)" }}>
                  Sonuç bulunamadı
                </td>
              </tr>
            ) : (
              filtered.map((project) => (
                <tr key={project.id} className="lum-project-row" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 500, color: "var(--color-fg-1)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {project.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-fg-4)", fontFamily: "var(--font-geist-mono, monospace)", marginTop: 2 }}>
                      {SUBDOMAIN_DOMAIN[project.subdomainType] ?? project.subdomainType}/{project.slug}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, color: "var(--color-fg-3)" }}>{project.projectType}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 500, background: "rgba(255,255,255,0.5)", color: "var(--color-fg-2)", border: "1px solid rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>
                      {STATUS_LABELS[project.status] ?? project.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, color: "var(--color-fg-4)" }}>
                      {new Date(project.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, flexWrap: "wrap" }}>
                      <AdminStatusSelect
                        projectId={project.id}
                        currentStatus={project.status}
                        statusLabels={STATUS_LABELS}
                        statusColors={STATUS_COLORS}
                      />
                      <SendApprovalButton projectId={project.id} />
                      {["payment_pending", "approved", "paid"].includes(project.status) && (
                        <ActivateButton projectId={project.id} />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
