import type { BioLinkV1Type } from "@/schemas/bio_link/v1";

export const BIO_LINK_DEMO: BioLinkV1Type = {
  profile: {
    name: "Ayşe Yıldız",
    bio: "Dijital pazarlama uzmanı & içerik üreticisi ✨ İstanbul",
    avatarUrl: "",
  },
  links: [
    { id: "1", label: "Web Sitem", url: "https://example.com", icon: "🌐" },
    { id: "2", label: "Blog", url: "https://blog.example.com", icon: "✍️" },
    { id: "3", label: "İletişim", url: "https://example.com/contact", icon: "📬" },
  ],
  social: {
    instagram: "ayseyildiz",
    twitter: "ayseyildiz",
    youtube: "",
    tiktok: "",
  },
};
