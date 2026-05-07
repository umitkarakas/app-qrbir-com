import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

type SubdomainType = InferSelectModel<typeof projects>["subdomainType"];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export async function generateUniqueSlug(
  title: string,
  subdomainType: SubdomainType,
  maxRetries = 10
): Promise<string> {
  const base = slugify(title) || "proje";

  for (let i = 0; i < maxRetries; i++) {
    const candidate = i === 0 ? base : `${base}-${i}`;

    const existing = await db
      .select({ id: projects.id })
      .from(projects)
      .where(
        and(
          eq(projects.subdomainType, subdomainType),
          eq(projects.slug, candidate)
        )
      )
      .limit(1);

    if (existing.length === 0) return candidate;
  }

  // Son çare: timestamp suffix
  return `${base}-${Date.now()}`;
}
