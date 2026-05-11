import type { VideoContent } from '../../../types/blocks';
import { Video } from 'lucide-react';

interface VideoBlockProps {
  content: VideoContent;
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
}

export default function VideoBlock({ content }: VideoBlockProps) {
  const embedUrl = getEmbedUrl(content.url || '');

  if (!embedUrl) {
    return (
      <div className="aspect-video theme-surface theme-rounded flex flex-col items-center justify-center theme-text-secondary">
        <Video className="w-8 h-8 mb-2" />
        <span className="text-sm">YouTube veya Vimeo URL&apos;si girin</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {content.title && (
        <h3 className="font-semibold theme-text">{content.title}</h3>
      )}
      <div className="aspect-video theme-rounded overflow-hidden">
        <iframe
          src={embedUrl}
          title={content.title || 'Video'}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
