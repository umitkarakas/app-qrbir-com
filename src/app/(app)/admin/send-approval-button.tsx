"use client";

import { useState } from "react";

export function SendApprovalButton({ projectId }: { projectId: number }) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Hata oluştu.");
        return;
      }
      setUrl(data.approvalUrl);
      setOpen(false);
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  async function copyUrl() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (url) {
    return (
      <div className="flex items-center gap-1">
        <input
          readOnly
          value={url}
          className="text-xs font-mono border border-gray-200 rounded-lg px-2 py-1 w-44 truncate text-gray-600 bg-gray-50"
        />
        <button
          onClick={copyUrl}
          className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap px-1"
          title="Kopyala"
        >
          {copied ? "✓" : "Kopyala"}
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap"
      >
        Önizleme Gönder
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">
              Onay Linki Gönder
            </h2>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                Admin notu (isteğe bağlı)
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                rows={3}
                placeholder="Müşteriye gösterilecek not..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
              />
            </div>
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setOpen(false); setNote(""); setError(null); }}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
              >
                İptal
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Gönderiliyor..." : "Gönder & Linki Al"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
