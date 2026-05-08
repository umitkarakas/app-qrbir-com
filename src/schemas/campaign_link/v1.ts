import { z } from "zod";

export const campaignLinkV1Schema = z.object({
  url: z.string().url("Geçerli bir URL girin").max(2000),
  title: z.string().max(120).optional().default(""),
  description: z.string().max(500).optional().default(""),
  // UTM parametreleri (opsiyonel — otomatik URL'e eklenir)
  utmSource: z.string().max(100).optional().default(""),
  utmMedium: z.string().max(100).optional().default(""),
  utmCampaign: z.string().max(100).optional().default(""),
  // Görsel (opsiyonel — sosyal paylaşım için)
  imageUrl: z.string().max(500).optional().default(""),
});

export type CampaignLinkV1Type = z.infer<typeof campaignLinkV1Schema>;
