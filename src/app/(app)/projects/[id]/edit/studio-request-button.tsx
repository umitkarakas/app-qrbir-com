"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StudioRequestButton({
  projectId,
  currentStatus,
}: {
  projectId: number;
  currentStatus: string;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const isActive =
    currentStatus === "studio_pending" || currentStatus === "in_design";

  async function handleSubmit() {
    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}/studio-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setLoading(false);

    if (res.ok) {
      setSent(true);
      setOpen(false);
      router.refresh();
    }
  }

  if (sent || isActive) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎨</span>
          <div>
            <p className="text-sm font-semibold text-blue-800">
              Studio talebi oluşturuldu
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              QRbir ekibi en kısa sürede sizinle iletişime geçecek.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl px-5 py-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎨</span>
            <div>
              <p className="text-sm font-semibold text-indigo-900">
                QRbir Studio&apos;dan Yardım İste
              </p>
              <p className="text-xs text-indigo-600 mt-0.5">
                Ekibimiz projenizi sizin için hazırlasın
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Talep Oluştur
          </button>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Studio Talebi Oluştur
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              QRbir ekibi projenizi seçtiğiniz temada hazırlayacak. Notunuz
              varsa aşağıya ekleyin.
            </p>

            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notunuz (opsiyonel)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-5"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Logo görseli, özel istek, renk tercihi… Dilediğinizi paylaşabilirsiniz."
              maxLength={1000}
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
              >
                İptal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Gönderiliyor…" : "Talebi Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
