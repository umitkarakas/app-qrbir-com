"use client";

import { useEffect } from "react";

export function ViewTracker({
  projectId,
  src,
}: {
  projectId: number;
  src: "qr" | "direct";
}) {
  useEffect(() => {
    // Fire-and-forget — tracking hatası sayfa yüklenmesini engellememeli
    fetch("/api/pub/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, src }),
    }).catch(() => {});
  }, [projectId, src]);

  return null;
}
