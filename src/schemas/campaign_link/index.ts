import { campaignLinkV1Schema, type CampaignLinkV1Type } from "./v1";

export const CURRENT_VERSION = 1;
export const schema = campaignLinkV1Schema;

export const defaultContent: CampaignLinkV1Type = {
  url: "",
  title: "",
  description: "",
  utmSource: "qr",
  utmMedium: "qr_code",
  utmCampaign: "",
  imageUrl: "",
};

export const migrations: Record<number, (input: unknown) => unknown> = {
  // v1 zaten güncel
};
