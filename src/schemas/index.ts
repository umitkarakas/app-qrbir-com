import * as restaurantMenu from "./restaurant_menu";
import * as bioLink from "./bio_link";
import * as googleReview from "./google_review";
import type { z } from "zod";

export type SchemaModule = {
  CURRENT_VERSION: number;
  schema: z.ZodTypeAny;
  defaultContent: unknown;
  migrations: Record<number, (input: unknown) => unknown>;
};

/**
 * Faz 4'te 3 ürün tipi için schema mevcut.
 * Diğerleri (brand_bio, event_invitation, campaign_link) sonra eklenecek.
 */
export const SCHEMAS: Partial<Record<string, SchemaModule>> = {
  restaurant_menu: restaurantMenu,
  bio_link: bioLink,
  google_review: googleReview,
};

export function getSchemaModule(projectType: string): SchemaModule | null {
  return SCHEMAS[projectType] ?? null;
}
