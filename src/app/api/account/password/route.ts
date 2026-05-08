import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { currentPassword, newPassword } = body ?? {};

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Eksik alan" }, { status: 400 });
  }
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json(
      { error: "Şifre en az 8 karakter olmalı" },
      { status: 400 }
    );
  }

  // Better Auth'un changePassword endpoint'ini kullan
  const res = await auth.api.changePassword({
    headers: await headers(),
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: false,
    },
  });

  if (!res) {
    return NextResponse.json(
      { error: "Mevcut şifre yanlış" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
