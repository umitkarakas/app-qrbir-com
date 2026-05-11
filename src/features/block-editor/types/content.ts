import type { Block, Site, SiteType, Theme } from "./database";

export type QrbirProjectType =
  | "restaurant_menu"
  | "bio_link"
  | "brand_bio"
  | "google_review"
  | "event_invitation"
  | "campaign_link";

export type BlockEditorContent = {
  editor: "qr1-blocks";
  version: 1;
  site: Pick<
    Site,
    "title" | "description" | "site_type" | "theme" | "theme_id" | "settings"
  >;
  blocks: Block[];
};

export type EditorProject = {
  id: number;
  title: string;
  slug: string;
  projectType: string;
  subdomainType: string;
  status: string;
  viewCount: number | null;
  qrCount: number | null;
  themeName: string | null;
};

export function isBlockEditorContent(input: unknown): input is BlockEditorContent {
  if (!input || typeof input !== "object") return false;
  const value = input as Partial<BlockEditorContent>;
  return value.editor === "qr1-blocks" && Array.isArray(value.blocks);
}

export function mapProjectTypeToSiteType(projectType: string): SiteType {
  if (projectType === "restaurant_menu" || projectType === "google_review") {
    return "digital_menu";
  }
  if (projectType === "event_invitation") return "digital_invitation";
  return "bio_link";
}

export function createEditorSite(project: EditorProject, content: unknown): Site {
  const blockContent = isBlockEditorContent(content) ? content : null;
  const now = new Date().toISOString();

  return {
    id: String(project.id),
    user_id: "",
    slug: project.slug,
    title: project.title,
    description: blockContent?.site.description ?? null,
    site_type: blockContent?.site.site_type ?? mapProjectTypeToSiteType(project.projectType),
    theme: blockContent?.site.theme ?? {},
    theme_id: blockContent?.site.theme_id ?? null,
    settings: blockContent?.site.settings ?? {},
    favicon_url: null,
    og_image_url: null,
    is_published: project.status === "published",
    published_at: project.status === "published" ? now : null,
    created_at: now,
    updated_at: now,
  };
}

export function createBlocksFromContent(project: EditorProject, content: unknown): Block[] {
  if (isBlockEditorContent(content)) {
    return normalizeBlocks(content.blocks, project.id);
  }

  const siteId = String(project.id);
  const data = (content && typeof content === "object" ? content : {}) as Record<string, unknown>;

  if (project.projectType === "restaurant_menu") {
    return restaurantMenuToBlocks(siteId, data);
  }
  if (project.projectType === "bio_link" || project.projectType === "brand_bio") {
    return bioLinkToBlocks(siteId, data);
  }
  if (project.projectType === "google_review") {
    return googleReviewToBlocks(siteId, data);
  }
  if (project.projectType === "event_invitation") {
    return eventInvitationToBlocks(siteId, data);
  }
  if (project.projectType === "campaign_link") {
    return campaignLinkToBlocks(siteId, data);
  }

  return [];
}

export function buildBlockEditorContent(site: Site, blocks: Block[]): BlockEditorContent {
  return {
    editor: "qr1-blocks",
    version: 1,
    site: {
      title: site.title,
      description: site.description,
      site_type: site.site_type,
      theme: site.theme,
      theme_id: site.theme_id,
      settings: site.settings,
    },
    blocks: normalizeBlocks(blocks, site.id),
  };
}

export function createThemeList(): Theme[] {
  return [];
}

function normalizeBlocks(blocks: Block[], projectId: string | number): Block[] {
  return blocks
    .map((block, index) => ({
      ...block,
      id: block.id || cryptoRandomId(),
      site_id: String(projectId),
      position: Number.isFinite(block.position) ? block.position : index,
      settings: block.settings ?? { isVisible: true, padding: "md", margin: "md" },
    }))
    .sort((a, b) => a.position - b.position)
    .map((block, index) => ({ ...block, position: index }));
}

function makeBlock(
  siteId: string,
  block_type: Block["block_type"],
  position: number,
  content: Record<string, unknown>
): Block {
  const now = new Date().toISOString();
  return {
    id: cryptoRandomId(),
    site_id: siteId,
    block_type,
    position,
    content,
    settings: { isVisible: true, padding: "md", margin: "md" },
    created_at: now,
    updated_at: now,
  };
}

function restaurantMenuToBlocks(siteId: string, data: Record<string, unknown>): Block[] {
  const restaurant = objectValue(data.restaurant);
  const categories = arrayValue(data.categories);
  const currency = data.currency === "USD" ? "$" : data.currency === "EUR" ? "€" : "₺";
  const blocks: Block[] = [
    makeBlock(siteId, "profile_card", 0, {
      name: stringValue(restaurant.name),
      title: stringValue(restaurant.address),
      bio: stringValue(restaurant.phone),
      avatarUrl: stringValue(restaurant.logoUrl),
    }),
  ];

  categories.forEach((category) => {
    const cat = objectValue(category);
    arrayValue(cat.items).forEach((item) => {
      const product = objectValue(item);
      blocks.push(
        makeBlock(siteId, "menu_item", blocks.length, {
          name: stringValue(product.name),
          description: stringValue(product.description),
          price: numberValue(product.price),
          currency,
          imageUrl: stringValue(product.imageUrl),
          isAvailable: true,
          category: stringValue(cat.name),
        })
      );
    });
  });

  return blocks;
}

function bioLinkToBlocks(siteId: string, data: Record<string, unknown>): Block[] {
  const profile = objectValue(data.profile ?? data.brand);
  const blocks: Block[] = [
    makeBlock(siteId, "profile_card", 0, {
      name: stringValue(profile.name),
      title: stringValue(profile.tagline),
      bio: stringValue(profile.bio ?? profile.description),
      avatarUrl: stringValue(profile.avatarUrl ?? profile.logoUrl),
    }),
  ];

  arrayValue(data.links).forEach((link) => {
    const item = objectValue(link);
    blocks.push(
      makeBlock(siteId, "link_button", blocks.length, {
        text: stringValue(item.label ?? item.title),
        url: stringValue(item.url),
        style: "filled",
      })
    );
  });

  const social = objectValue(data.social);
  const links = Object.entries(social)
    .filter(([, value]) => typeof value === "string" && value.trim())
    .map(([platform, url]) => ({ platform, url }));
  if (links.length) {
    blocks.push(makeBlock(siteId, "social_links", blocks.length, { links, style: "icons" }));
  }

  return blocks;
}

function googleReviewToBlocks(siteId: string, data: Record<string, unknown>): Block[] {
  const business = objectValue(data.business);
  return [
    makeBlock(siteId, "profile_card", 0, {
      name: stringValue(business.name),
      bio: stringValue(business.description),
      avatarUrl: stringValue(business.logoUrl),
    }),
    makeBlock(siteId, "google_review", 1, {
      placeId: stringValue(data.googleReviewUrl ?? data.placeId),
      buttonText: stringValue(data.ctaText) || "Yorum Yap",
    }),
  ];
}

function eventInvitationToBlocks(siteId: string, data: Record<string, unknown>): Block[] {
  const event = objectValue(data.event);
  const venue = objectValue(data.venue);
  return [
    makeBlock(siteId, "profile_card", 0, {
      name: stringValue(event.title ?? event.name),
      title: stringValue(event.date),
      bio: stringValue(event.description),
    }),
    makeBlock(siteId, "countdown", 1, {
      targetDate: stringValue(event.date),
      title: stringValue(event.title ?? event.name),
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: false,
      completedMessage: "Etkinlik başladı!",
    }),
    makeBlock(siteId, "location_map", 2, {
      venueName: stringValue(venue.name),
      address: stringValue(venue.address),
      showDirectionsButton: true,
    }),
    makeBlock(siteId, "rsvp_form", 3, {
      eventName: stringValue(event.title ?? event.name),
      maxGuestCount: 4,
      confirmationMessage: "Yanıtınız için teşekkürler!",
      updateMessage: "Katılım bilgileriniz güncellendi!",
    }),
  ];
}

function campaignLinkToBlocks(siteId: string, data: Record<string, unknown>): Block[] {
  return [
    makeBlock(siteId, "profile_card", 0, {
      name: stringValue(data.title),
      bio: stringValue(data.description),
      avatarUrl: stringValue(data.imageUrl),
    }),
    makeBlock(siteId, "link_button", 1, {
      text: stringValue(data.ctaText) || "Devam Et",
      url: stringValue(data.url),
      style: "filled",
    }),
  ];
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
