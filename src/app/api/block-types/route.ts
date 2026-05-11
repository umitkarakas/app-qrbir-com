import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blockTypes } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const siteType = request.nextUrl.searchParams.get("siteType");

  const list = await db
    .select({
      blockType: blockTypes.blockType,
      name: blockTypes.name,
      description: blockTypes.description,
      icon: blockTypes.icon,
      category: blockTypes.category,
      isPro: blockTypes.isPro,
      allowedSiteTypes: blockTypes.allowedSiteTypes,
      sortOrder: blockTypes.sortOrder,
    })
    .from(blockTypes)
    .where(and(eq(blockTypes.isEnabled, true)))
    .orderBy(asc(blockTypes.sortOrder), asc(blockTypes.name));

  const filtered = siteType
    ? list.filter(
        (block) =>
          block.allowedSiteTypes.length === 0 ||
          block.allowedSiteTypes.includes(siteType),
      )
    : list;

  return NextResponse.json(filtered);
}
