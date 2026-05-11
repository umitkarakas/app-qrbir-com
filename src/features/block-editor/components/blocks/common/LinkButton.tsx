import type { LinkButtonContent } from '../../../types/blocks';
import { ExternalLink } from 'lucide-react';

interface LinkButtonProps {
  content: LinkButtonContent;
}

export default function LinkButton({ content }: LinkButtonProps) {
  const baseStyles = 'w-full py-3 px-4 theme-rounded font-medium flex items-center justify-center gap-2 transition-all theme-shadow';

  const getVariantStyles = () => {
    const style = content.style || 'filled';
    switch (style) {
      case 'filled':
        return 'theme-primary text-white hover:opacity-90';
      case 'outline':
        return 'border-2 theme-border theme-primary-text hover:opacity-80';
      case 'ghost':
        return 'theme-primary-text hover:theme-surface';
      default:
        return 'theme-primary text-white hover:opacity-90';
    }
  };

  const variant = getVariantStyles();

  if (!content.url) {
    return (
      <div className={`${baseStyles} ${variant} cursor-default`}>
        {content.text || 'Buton Metni'}
      </div>
    );
  }

  return (
    <a
      href={content.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseStyles} ${variant}`}
    >
      {content.text || 'Buton Metni'}
      <ExternalLink className="w-4 h-4" />
    </a>
  );
}
