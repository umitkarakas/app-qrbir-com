import * as restaurantMenu from "./restaurant_menu";
import * as bioLink from "./bio_link";
import * as googleReview from "./google_review";
import * as brandBio from "./brand_bio";
import * as eventInvitation from "./event_invitation";
import * as campaignLink from "./campaign_link";
import type { z } from "zod";

export type SchemaModule = {
  CURRENT_VERSION: number;
  schema: z.ZodTypeAny;
  defaultContent: unknown;
  migrations: Record<number, (input: unknown) => unknown>;
};

export const SCHEMAS: Partial<Record<string, SchemaModule>> = {
  restaurant_menu: restaurantMenu,
  bio_link: bioLink,
  google_review: googleReview,
  brand_bio: brandBio,
  event_invitation: eventInvitation,
  campaign_link: campaignLink,
};

export function getSchemaModule(projectType: string): SchemaModule | null {
  return SCHEMAS[projectType] ?? null;
}
