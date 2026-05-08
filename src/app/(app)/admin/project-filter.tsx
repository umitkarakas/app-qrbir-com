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
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Proje adı, slug veya kullanıcı ID ara…"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
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
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
          >
            Temizle
          </button>
        )}
        <span className="text-sm text-gray-400 self-center">
          {filtered.length} / {projects.length} proje
        </span>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Proje</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 hidden sm:table-cell">Tür</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Durum</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 hidden md:table-cell">Tarih</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                  Sonuç bulunamadı
                </td>
              </tr>
            ) : (
              filtered.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 truncate max-w-[200px]">
                      {project.title}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {SUBDOMAIN_DOMAIN[project.subdomainType] ?? project.subdomainType}/{project.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-gray-500">{project.projectType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[project.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[project.status] ?? project.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-gray-400">
                      {new Date(project.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
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
