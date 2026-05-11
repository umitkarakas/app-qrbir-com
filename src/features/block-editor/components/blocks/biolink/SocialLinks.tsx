import type { SocialLinksContent } from '../../../types/blocks';
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

interface SocialLinksProps {
  content: SocialLinksContent;
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

export default function SocialLinks({ content }: SocialLinksProps) {
  const links = content.links || [];
  const style = content.style || 'icons';

  if (links.length === 0) {
    return (
      <div className="text-center theme-text-secondary py-4">Henuz sosyal medya linki eklenmedi</div>
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

  if (style === 'buttons') {
    return (
      <div className="space-y-2">
        {links.map((link, index) => {
          const Icon = iconMap[link.platform] || MessageCircle;
          const platform = SOCIAL_PLATFORMS[link.platform as keyof typeof SOCIAL_PLATFORMS];
          return (
            <a
              key={index}
              href={buildUrl(link.platform, link.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full py-3 px-4 rounded-xl font-medium text-white transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ backgroundColor: platform?.color || '#64748B' }}
            >
              <Icon className="w-5 h-5" />
              <span>{platform?.name || link.platform}</span>
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
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
