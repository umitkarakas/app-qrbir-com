import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { themes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

const VALID_PROJECT_TYPES = [
  "restaurant_menu",
  "bio_link",
  "brand_bio",
  "google_review",
  "event_invitation",
  "campaign_link",
] as const;

type ProjectType = (typeof VALID_PROJECT_TYPES)[number];

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectType = request.nextUrl.searchParams.get("projectType");

  const conditions = [eq(themes.status, "active")];
  if (projectType && VALID_PROJECT_TYPES.includes(projectType as ProjectType)) {
    conditions.push(eq(themes.productType, projectType as ProjectType));
  }

  const list = await db
    .select()
    .from(themes)
    .where(and(...conditions))
    .orderBy(themes.isPremium, themes.id);

  return NextResponse.json(list);
}
