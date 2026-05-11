import type { SocialMediaContent } from '../../../types/blocks';
import { SOCIAL_PLATFORMS } from '../../../config/constants';
import {
  Camera,
  Users,
  MessageCircleMore,
  BriefcaseBusiness,
  Play,
  Music2,
  Music,
  Send,
  MessageCircle,
} from 'lucide-react';

interface SocialMediaProps {
  content: SocialMediaContent;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Camera,
  facebook: Users,
  twitter: MessageCircleMore,
  linkedin: BriefcaseBusiness,
  youtube: Play,
  tiktok: Music2,
  spotify: Music,
  telegram: Send,
  whatsapp: MessageCircle,
};

export default function SocialMedia({ content }: SocialMediaProps) {
  const links = content.links || [];

  if (links.length === 0) {
    return (
      <div className="text-center theme-text-secondary py-4">Henüz sosyal medya linki eklenmedi</div>
    );
  }

  const buildUrl = (platform: string, url: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    if (platform === 'whatsapp') {
      const cleanedPhone = url.replace(/\D/g, '');
      return `https://wa.me/${cleanedPhone}`;
    }

    const platformData = SOCIAL_PLATFORMS[platform as keyof typeof SOCIAL_PLATFORMS];
    return platformData?.baseUrl ? `${platformData.baseUrl}${url}` : url;
  };

  return (
    <div className="flex justify-center gap-4">
      {links.map((link, index) => {
        const Icon = iconMap[link.platform] || MessageCircle;
        const platform = SOCIAL_PLATFORMS[link.platform as keyof typeof SOCIAL_PLATFORMS];
        return (
          <a
            key={index}
            href={buildUrl(link.platform, link.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110"
            style={{ backgroundColor: platform?.color || '#64748B' }}
            title={platform?.name || link.platform}
          >
            <Icon className="w-6 h-6 text-white" />
          </a>
        );
      })}
    </div>
  );
}
