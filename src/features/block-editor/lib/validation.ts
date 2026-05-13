import { z } from "zod";

const KNOWN_BLOCK_TYPES = [
  "profile_card",
  "social_media",
  "map",
  "video",
  "text",
  "image_gallery",
  "link_button",
  "divider",
  "vcard",
  "pdf",
  "faq",
  "menu_item",
  "wifi_card",
  "google_review",
  "countdown",
  "rsvp_form",
  "skill_bars",
  "contact_form",
  "location_map",
  "social_links",
] as const;

function isKnownBlockType(value: string) {
  return (KNOWN_BLOCK_TYPES as readonly string[]).includes(value);
}

export const BlockEditorBlockSchema = z
  .object({
    id: z.string().min(1),
    site_id: z.string().min(1),
    block_type: z.string().refine(isKnownBlockType, {
      message: "Unknown block type",
    }),
    position: z.number().int().nonnegative(),
    content: z.record(z.string(), z.unknown()).default({}),
    settings: z.record(z.string(), z.unknown()).default({}),
    created_at: z.string().min(1),
    updated_at: z.string().min(1),
  })
  .passthrough();

export const BlockEditorSiteSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().nullable(),
    site_type: z.enum(["digital_menu", "digital_invitation", "bio_link"]),
    theme: z.record(z.string(), z.unknown()).default({}),
    theme_id: z.string().nullable(),
    settings: z.record(z.string(), z.unknown()).default({}),
  })
  .passthrough();

export const BlockEditorContentSchema = z.object({
  editor: z.literal("qr1-blocks"),
  version: z.literal(1),
  site: BlockEditorSiteSchema,
  blocks: z.array(BlockEditorBlockSchema),
});

export function parseBlockEditorContent(input: unknown) {
  return BlockEditorContentSchema.safeParse(input);
}
