import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { generateUniqueSlug } from "@/lib/slug";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

type ProjectType =
  | "restaurant_menu"
  | "bio_link"
  | "brand_bio"
  | "google_review"
  | "event_invitation"
  | "campaign_link";

type SubdomainType = "m" | "b" | "r" | "e" | "go";

const PROJECT_TYPE_TO_SUBDOMAIN: Record<ProjectType, SubdomainType> = {
  restaurant_menu: "m",
  bio_link: "b",
  brand_bio: "b",
  google_review: "r",
  event_invitation: "e",
  campaign_link: "go",
};

const VALID_PROJECT_TYPES = Object.keys(PROJECT_TYPE_TO_SUBDOMAIN) as ProjectType[];

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, session.user.id))
    .orderBy(projects.createdAt);

  return NextResponse.json(userProjects);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { projectType, title } = body as { projectType: string; title: string };

  if (!VALID_PROJECT_TYPES.includes(projectType as ProjectType)) {
    return NextResponse.json({ error: "Invalid project_type" }, { status: 400 });
  }

  if (!title || title.trim().length === 0) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const type = projectType as ProjectType;
  const subdomainType = PROJECT_TYPE_TO_SUBDOMAIN[type];
  const slug = await generateUniqueSlug(title.trim(), subdomainType);

  const [project] = await db
    .insert(projects)
    .values({
      userId: session.user.id,
      projectType: type,
      title: title.trim(),
      slug,
      subdomainType,
      status: "draft",
      isFree: true,
      isPremium: false,
    })
    .returning();

  return NextResponse.json(project, { status: 201 });
}
