"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await signIn.email({ email, password });
    setLoading(false);
    if (authError) { setError("E-posta veya şifre hatalı."); return; }
    router.push("/dashboard");
  }

  return (
    <div className="lum-glass" style={{ width: "100%", maxWidth: 400, padding: 36, position: "relative", zIndex: 1 }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <div className="lum-logomark" style={{ width: 40, height: 40 }}>
          <div className="lum-logomark__diamond" style={{ width: 16, height: 16 }} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--color-fg-1)" }}>QRbir</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-fg-3)" }}>Hesabınıza giriş yapın</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {error && (
          <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--color-danger-bg)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "var(--color-danger)" }}>
            {error}
          </div>
        )}

        <div>
          <label className="lum-label">E-posta</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="lum-input"
            placeholder="ornek@mail.com"
          />
        </div>

        <div>
          <label className="lum-label">Şifre</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="lum-input"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="lum-cta"
          style={{ marginTop: 4, opacity: loading ? 0.7 : 1, width: "100%", justifyContent: "center" }}
        >
          {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
        </button>
      </form>

      <p style={{ margin: "20px 0 0", textAlign: "center", fontSize: 13, color: "var(--color-fg-3)" }}>
        Hesabınız yok mu?{" "}
        <Link href="/register" style={{ color: "var(--color-accent-violet-deep)", fontWeight: 600, textDecoration: "none" }}>
          Kayıt olun
        </Link>
      </p>
    </div>
  );
}
