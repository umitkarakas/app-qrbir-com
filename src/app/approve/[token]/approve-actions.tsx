"use client";

import { useState } from "react";

export function ApproveActions({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<"approved" | "revision" | null>(null);
  const [showRevision, setShowRevision] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(decision: "approve" | "revision") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/approve/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, note: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir hata oluştu.");
        return;
      }
      setDone(decision === "approve" ? "approved" : "revision");
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  if (done === "approved") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-center space-y-1">
        <div className="text-2xl">✅</div>
        <p className="text-sm font-semibold text-green-800">Projeniz onaylandı!</p>
        <p className="text-xs text-green-600">
          Ödeme tamamlandıktan sonra projeniz yayına alınacak.
        </p>
      </div>
    );
  }

  if (done === "revision") {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 text-center space-y-1">
        <div className="text-2xl">🔄</div>
        <p className="text-sm font-semibold text-orange-800">Revizyon talebiniz alındı.</p>
        <p className="text-xs text-orange-600">
          Ekibimiz notunuzu inceleyip düzenlemeleri yapacak.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Revizyon alanı */}
      {showRevision && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Revizyon notunuz
          </label>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-300"
            rows={4}
            placeholder="Neyin değişmesini istediğinizi yazın..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
          />
          <p className="text-xs text-gray-400 text-right">{note.length}/1000</p>
        </div>
      )}

      {/* Butonlar */}
      <div className="flex flex-col sm:flex-row gap-2">
        {!showRevision ? (
          <>
            <button
              onClick={() => submit("approve")}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "İşleniyor..." : "✅ Onayla"}
            </button>
            <button
              onClick={() => setShowRevision(true)}
              disabled={loading}
              className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              🔄 Revizyon İste
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => submit("revision")}
              disabled={loading || !note.trim()}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Gönderiliyor..." : "Revizyon Talebi Gönder"}
            </button>
            <button
              onClick={() => { setShowRevision(false); setNote(""); }}
              disabled={loading}
              className="px-4 py-3 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              İptal
            </button>
          </>
        )}
      </div>
    </div>
  );
}
