"use client";

import { useState } from "react";

export function AccountForm({
  initialName,
  initialEmail,
}: {
  initialName: string;
  initialEmail: string;
}) {
  const [name, setName] = useState(initialName);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  async function saveName() {
    if (!name.trim()) return;
    setNameSaving(true); setNameMsg("");
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
    setPwError(""); setPwMsg("");
    if (newPw !== newPw2) { setPwError("Yeni şifreler eşleşmiyor."); return; }
    if (newPw.length < 8) { setPwError("Şifre en az 8 karakter olmalı."); return; }
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
      setCurrentPw(""); setNewPw(""); setNewPw2("");
      setTimeout(() => setPwMsg(""), 3000);
    } else {
      setPwError(data.error ?? "Şifre değiştirilemedi.");
    }
  }

  const card = {
    padding: 24,
    marginBottom: 16,
  } as const;

  return (
    <div>
      {/* Profil */}
      <div className="lum-glass" style={card}>
        <h2 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "var(--color-fg-1)" }}>
          Profil Bilgileri
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="lum-label">Ad Soyad</label>
            <input className="lum-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Ad Soyad" />
          </div>
          <div>
            <label className="lum-label">E-posta</label>
            <input
              className="lum-input"
              value={initialEmail}
              readOnly
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
            <p style={{ margin: "5px 0 0", fontSize: 11, color: "var(--color-fg-4)" }}>E-posta adresi değiştirilemez.</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
          <span style={{ fontSize: 13, color: "var(--color-success)" }}>{nameMsg}</span>
          <button
            onClick={saveName}
            disabled={nameSaving || !name.trim()}
            className="lum-cta"
            style={{ height: 38, padding: "0 20px", fontSize: 13, opacity: (nameSaving || !name.trim()) ? 0.5 : 1 }}
          >
            {nameSaving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>

      {/* Şifre */}
      <div className="lum-glass" style={card}>
        <h2 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "var(--color-fg-1)" }}>
          Şifre Değiştir
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="lum-label">Mevcut Şifre</label>
            <input className="lum-input" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} autoComplete="current-password" />
          </div>
          <div>
            <label className="lum-label">Yeni Şifre</label>
            <input className="lum-input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" minLength={8} />
          </div>
          <div>
            <label className="lum-label">Yeni Şifre (tekrar)</label>
            <input className="lum-input" type="password" value={newPw2} onChange={(e) => setNewPw2(e.target.value)} autoComplete="new-password" />
          </div>
        </div>
        {pwError && <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--color-danger)" }}>{pwError}</p>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
          <span style={{ fontSize: 13, color: "var(--color-success)" }}>{pwMsg}</span>
          <button
            onClick={changePassword}
            disabled={pwSaving || !currentPw || !newPw || !newPw2}
            className="lum-cta"
            style={{ height: 38, padding: "0 20px", fontSize: 13, opacity: (pwSaving || !currentPw || !newPw || !newPw2) ? 0.5 : 1 }}
          >
            {pwSaving ? "Değiştiriliyor…" : "Şifreyi Değiştir"}
          </button>
        </div>
      </div>
    </div>
  );
}
