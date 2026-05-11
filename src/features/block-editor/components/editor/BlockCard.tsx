import { GripVertical, Pencil, Trash2, Copy, EyeOff, Eye } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { BLOCK_DEFINITIONS } from '../../config/constants';
import type { Block } from '../../types/database';

interface BlockCardProps {
  block: Block;
  index: number;
  isDragging: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragEnd: () => void;
}

export default function BlockCard({
  block,
  isDragging,
  onDragStart,
  onDragOver,
  onDragEnd,
}: BlockCardProps) {
  const { selectBlock, deleteBlock, duplicateBlock, updateBlock } = useEditor();
  const definition = BLOCK_DEFINITIONS[block.block_type as keyof typeof BLOCK_DEFINITIONS];
  const content = block.content as Record<string, unknown>;
  const settings = block.settings as { isVisible?: boolean } | null;
  const isVisible = settings?.isVisible !== false;

  const getIcon = () => {
    if (!definition?.icon) return null;
    const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[definition.icon];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  const getBlockPreview = (): string => {
    switch (block.block_type) {
      case 'profile_card':
        return (content.name as string) || 'Untitled Profile';
      case 'text':
        return ((content.text as string) || 'Empty text block').substring(0, 50) + ((content.text as string)?.length > 50 ? '...' : '');
      case 'link_button':
        return (content.text as string) || 'Button';
      case 'menu_category':
        return (content.name as string) || 'Category';
      case 'menu_item':
        return (content.name as string) || 'Menu Item';
      case 'wifi_card':
        return (content.networkName as string) || 'WiFi';
      case 'countdown':
        return (content.title as string) || 'Countdown';
      case 'social_links':
        const links = (content.links as { platform: string }[]) || [];
        return links.length > 0 ? `${links.length} social link${links.length > 1 ? 's' : ''}` : 'No links added';
      case 'contact_form':
        return (content.title as string) || 'Contact Form';
      case 'vcard':
        return (content.fullName as string) || 'Contact Card';
      case 'faq':
        const items = (content.items as unknown[]) || [];
        return items.length > 0 ? `${items.length} question${items.length > 1 ? 's' : ''}` : 'No questions';
      case 'video':
        return (content.title as string) || (content.url as string) || 'Video';
      case 'divider':
        return 'Divider line';
      default:
        return definition?.label || 'Block';
    }
  };

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateBlock(block.id, { settings: { isVisible: !isVisible } });
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateBlock(block.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBlock(block.id);
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragEnd={onDragEnd}
      className={`
        bg-white rounded-xl border border-slate-200 overflow-hidden transition-all
        ${isDragging ? 'opacity-50 scale-[0.98] shadow-lg' : 'shadow-sm'}
        ${!isVisible ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-stretch">
        <div
          className="flex items-center justify-center w-10 bg-slate-50 border-r border-slate-100 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={(e) => {
            void e.touches[0];
            const element = e.currentTarget.parentElement?.parentElement;
            if (element) {
              element.draggable = true;
            }
          }}
        >
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>

        <button
          onClick={() => selectBlock(block.id)}
          className="flex-1 flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 text-slate-500">
            {getIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900 text-sm">{definition?.label || 'Block'}</p>
            <p className="text-xs text-slate-500 truncate">{getBlockPreview()}</p>
          </div>
          <Pencil className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
      </div>

      <div className="flex items-center border-t border-slate-100 divide-x divide-slate-100">
        <button
          onClick={toggleVisibility}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
        >
          {isVisible ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Visible</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hidden</span>
            </>
          )}
        </button>
        <button
          onClick={handleDuplicate}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Duplicate</span>
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
