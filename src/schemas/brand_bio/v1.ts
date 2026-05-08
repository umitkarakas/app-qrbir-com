import { z } from "zod";

export const BrandBioV1Schema = z.object({
  $version: z.literal(1).default(1),
  brand: z.object({
    name: z.string().default(""),
    tagline: z.string().optional(),
    description: z.string().optional(),
    logoUrl: z.string().optional(),
    coverUrl: z.string().optional(),
    website: z.string().optional(),
  }),
  contact: z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
  }),
  social: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
    linkedin: z.string().optional(),
    tiktok: z.string().optional(),
  }),
  links: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        url: z.string(),
      })
    )
    .default([]),
});

export type BrandBioV1Type = z.infer<typeof BrandBioV1Schema>;

export const defaultBrandBio: BrandBioV1Type = {
  $version: 1,
  brand: { name: "" },
  contact: {},
  social: {},
  links: [],
};
