import { z } from "zod";

export const BioLinkItemV1 = z.object({
  id: z.string().min(1),
  label: z.string().min(1, "Link adı zorunlu").max(80),
  url: z.string().url("Geçerli bir URL girin"),
  icon: z.string().max(40).optional().default(""),
});

export const BioLinkV1 = z.object({
  profile: z.object({
    name: z.string().min(1, "İsim zorunlu").max(80),
    bio: z.string().max(280).optional().default(""),
    avatarUrl: z.string().url().optional().or(z.literal("")),
  }),
  links: z.array(BioLinkItemV1).default([]),
  social: z
    .object({
      instagram: z.string().max(80).optional().default(""),
      twitter: z.string().max(80).optional().default(""),
      youtube: z.string().max(80).optional().default(""),
      tiktok: z.string().max(80).optional().default(""),
    })
    .default({ instagram: "", twitter: "", youtube: "", tiktok: "" }),
});

export type BioLinkV1Type = z.infer<typeof BioLinkV1>;

export const BIO_LINK_DEFAULT_V1: BioLinkV1Type = {
  profile: { name: "", bio: "", avatarUrl: "" },
  links: [],
  social: { instagram: "", twitter: "", youtube: "", tiktok: "" },
};
