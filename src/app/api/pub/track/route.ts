import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const Body = z.object({
  projectId: z.number().int().positive(),
  src: z.enum(["qr", "direct"]).optional().default("direct"),
});

export async function POST(req: NextRequest) {
  try {
    const body = Body.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    const { projectId, src } = body.data;

    if (src === "qr") {
      await db
        .update(projects)
        .set({
          viewCount: sql`${projects.viewCount} + 1`,
          qrCount: sql`${projects.qrCount} + 1`,
        })
        .where(eq(projects.id, projectId));
    } else {
      await db
        .update(projects)
        .set({ viewCount: sql`${projects.viewCount} + 1` })
        .where(eq(projects.id, projectId));
    }

    return NextResponse.json({ ok: true });
  } catch {
    // tracking hatası kullanıcıyı etkilememeli
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
