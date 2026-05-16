import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, projectContents, templates } from "@/db/schema";
import { generateUniqueSlug } from "@/lib/slug";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import {
  getTemplateContractFromMetadata,
} from "@/features/block-editor/lib/template-contract";
import { mapProjectTypeToSiteType } from "@/features/block-editor/types/content";
import type { BlockEditorContent } from "@/features/block-editor/types/content";

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

  const { projectType, title, templateId } = body as {
    projectType: string;
    title: string;
    templateId?: number | null;
  };

  if (!VALID_PROJECT_TYPES.includes(projectType as ProjectType)) {
    return NextResponse.json({ error: "Invalid project_type" }, { status: 400 });
  }

  if (!title || title.trim().length === 0) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const type = projectType as ProjectType;
  const subdomainType = PROJECT_TYPE_TO_SUBDOMAIN[type];

  let resolvedTemplateId: number | null = null;
  let resolvedThemeId: number | null = null;
  let seedBlocks: Array<Record<string, unknown>> = [];
  let seedSettings: Record<string, unknown> = {};

  if (typeof templateId === "number") {
    const [template] = await db
      .select({
        id: templates.id,
        productType: templates.productType,
        themeId: templates.themeId,
        blocks: templates.blocks,
        metadata: templates.metadata,
        isActive: templates.isActive,
      })
      .from(templates)
      .where(and(eq(templates.id, templateId), eq(templates.isActive, true)))
      .limit(1);

    if (!template) {
      return NextResponse.json({ error: "Şablon bulunamadı" }, { status: 404 });
    }
    if (template.productType !== type) {
      return NextResponse.json(
        { error: "Şablon bu proje tipiyle uyumlu değil" },
        { status: 400 }
      );
    }

    resolvedTemplateId = template.id;
    resolvedThemeId = template.themeId ?? null;

    const contract = getTemplateContractFromMetadata(template.metadata);
    const fromContract = contract?.defaults.blocks as Array<Record<string, unknown>> | undefined;
    const fromTemplate = Array.isArray(template.blocks)
      ? (template.blocks as Array<Record<string, unknown>>)
      : [];

    seedBlocks = fromContract?.length ? fromContract : fromTemplate;
    seedSettings = (contract?.defaults.settings as Record<string, unknown>) ?? {};
  }

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
      themeId: resolvedThemeId,
      templateId: resolvedTemplateId,
    })
    .returning();

  if (resolvedTemplateId !== null) {
    const now = new Date().toISOString();
    const siteId = String(project.id);
    const content: BlockEditorContent = {
      editor: "qr1-blocks",
      version: 1,
      site: {
        title: project.title,
        description: null,
        site_type: mapProjectTypeToSiteType(type),
        theme: {},
        theme_id: null,
        settings: seedSettings,
      },
      blocks: seedBlocks.map((block, index) => ({
        id: crypto.randomUUID(),
        site_id: siteId,
        block_type: String(block.block_type ?? block.blockType ?? "text"),
        position: index,
        content: (block.content as Record<string, unknown>) ?? {},
        settings: (block.settings as Record<string, unknown>) ?? {
          isVisible: true,
          padding: "md",
          margin: "md",
        },
        created_at: now,
        updated_at: now,
      })) as BlockEditorContent["blocks"],
    };

    await db.insert(projectContents).values({
      projectId: project.id,
      contentJson: content,
      schemaVersion: 1,
    });
  }

  return NextResponse.json(project, { status: 201 });
}
