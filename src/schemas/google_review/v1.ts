import { z } from "zod";

export const GoogleReviewV1 = z.object({
  business: z.object({
    name: z.string().min(1, "İşletme adı zorunlu").max(120),
    description: z.string().max(280).optional().default(""),
    logoUrl: z.string().url().optional().or(z.literal("")),
  }),
  googlePlaceId: z.string().max(200).optional().default(""),
  googleReviewUrl: z.string().url("Geçerli bir Google yorum URL'i girin"),
  ctaText: z.string().min(1).max(80).default("Bize 5 yıldız verin!"),
  ratingThreshold: z.number().int().min(1).max(5).default(4),
  feedbackEmail: z.string().email().optional().or(z.literal("")),
});

export type GoogleReviewV1Type = z.infer<typeof GoogleReviewV1>;

export const GOOGLE_REVIEW_DEFAULT_V1: GoogleReviewV1Type = {
  business: { name: "", description: "", logoUrl: "" },
  googlePlaceId: "",
  googleReviewUrl: "",
  ctaText: "Bize 5 yıldız verin!",
  ratingThreshold: 4,
  feedbackEmail: "",
};
