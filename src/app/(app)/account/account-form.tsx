"use client";

import { useState } from "react";

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black";

export function AccountForm({
  initialName,
  initialEmail,
}: {
  initialName: string;
  initialEmail: string;
}) {
  // --- Ad ---
  const [name, setName] = useState(initialName);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState("");

  // --- Şifre ---
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  async function saveName() {
    if (!name.trim()) return;
    setNameSaving(true);
    setNameMsg("");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setNameSaving(false);
    setNameMsg(res.ok ? "Kaydedildi ✓" : "Kaydedilemedi");
    if (res.ok) setTimeout(() => setNameMsg(""), 2500);
  }

  async function changePassword() {
    setPwError("");
    setPwMsg("");
    if (newPw !== newPw2) {
      setPwError("Yeni şifreler eşleşmiyor.");
      return;
    }
    if (newPw.length < 8) {
      setPwError("Şifre en az 8 karakter olmalı.");
      return;
    }
    setPwSaving(true);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    setPwSaving(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setPwMsg("Şifre değiştirildi ✓");
      setCurrentPw("");
      setNewPw("");
      setNewPw2("");
      setTimeout(() => setPwMsg(""), 3000);
    } else {
      setPwError(data.error ?? "Şifre değiştirilemedi.");
    }
  }

  return (
    <div className="space-y-4">
      {/* Profil bilgileri */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-4">Profil Bilgileri</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Ad Soyad</label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="Ad Soyad"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              E-posta
            </label>
            <input
              className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`}
              value={initialEmail}
              readOnly
            />
            <p className="text-[11px] text-gray-400 mt-1">
              E-posta adresi değiştirilemez.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-green-600">{nameMsg}</span>
          <button
            onClick={saveName}
            disabled={nameSaving || !name.trim()}
            className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40"
          >
            {nameSaving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>

      {/* Şifre değiştir */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-4">Şifre Değiştir</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Mevcut Şifre</label>
            <input
              className={inputCls}
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Yeni Şifre</label>
            <input
              className={inputCls}
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              autoComplete="new-password"
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Yeni Şifre (tekrar)</label>
            <input
              className={inputCls}
              type="password"
              value={newPw2}
              onChange={(e) => setNewPw2(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>
        {pwError && (
          <p className="text-xs text-red-600 mt-3">{pwError}</p>
        )}
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-green-600">{pwMsg}</span>
          <button
            onClick={changePassword}
            disabled={pwSaving || !currentPw || !newPw || !newPw2}
            className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40"
          >
            {pwSaving ? "Değiştiriliyor…" : "Şifreyi Değiştir"}
          </button>
        </div>
      </div>
    </div>
  );
}
