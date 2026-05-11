import type { MenuItemContent } from '../../../types/blocks';
import Badge from '../../ui/Badge';

interface MenuItemProps {
  content: MenuItemContent;
}

export default function MenuItem({ content }: MenuItemProps) {
  return (
    <div className={`flex gap-4 ${!content.isAvailable ? 'opacity-50' : ''}`}>
      {content.imageUrl && (
        <img
          src={content.imageUrl}
          alt={content.name}
          className="w-20 h-20 theme-rounded object-cover shrink-0 theme-shadow"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold theme-text">{content.name || 'Ürün Adı'}</h4>
          <span className="font-bold theme-text whitespace-nowrap">
            {content.currency || '₺'}{(content.price || 0).toFixed(2)}
          </span>
        </div>
        {content.description && (
          <p className="text-sm theme-text-secondary mt-1 line-clamp-2">{content.description}</p>
        )}
        {!content.isAvailable && (
          <Badge size="sm" variant="error" className="mt-2">
            Mevcut Değil
          </Badge>
        )}
      </div>
    </div>
  );
}
