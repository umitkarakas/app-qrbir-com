import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Pencil
} from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import type { Block } from '../../types/database';
import BlockRenderer from '../blocks/BlockRenderer';

interface SortableBlockProps {
  block: Block;
}

export default function SortableBlock({ block }: SortableBlockProps) {
  const {
    blocks,
    selectedBlockId,
    selectBlock,
    editBlock,
    deleteBlock,
    duplicateBlock,
    updateBlock,
    moveBlockUp,
    moveBlockDown
  } = useEditor();
  const isSelected = selectedBlockId === block.id;
  const settings = block.settings as { isVisible?: boolean } | null;
  const isVisible = settings?.isVisible !== false;
  const isProfileCard = block.block_type === 'profile_card';

  const blockIndex = blocks.findIndex(b => b.id === block.id);
  const isFirst = blockIndex === 0;
  const isLast = blockIndex === blocks.length - 1;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateBlock(block.id, { settings: { isVisible: !isVisible } });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProfileCard) return;
    if (confirm('Bu bloğu silmek istediğinizden emin misiniz?')) {
      deleteBlock(block.id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProfileCard) return;
    duplicateBlock(block.id);
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProfileCard || isFirst) return;
    moveBlockUp(block.id);
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProfileCard || isLast) return;
    moveBlockDown(block.id);
  };

  const toolbarPosition = isProfileCard ? 'bottom' : 'top';

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => selectBlock(block.id)}
      className={`group relative rounded-lg transition-all cursor-pointer ${
        isSelected
          ? 'ring-2 ring-slate-900 ring-offset-2'
          : 'hover:ring-2 hover:ring-slate-300 hover:ring-offset-2'
      } ${!isVisible ? 'opacity-50' : ''}`}
    >
      {isSelected && (
        <div className={`absolute left-1/2 -translate-x-1/2 z-50 animate-in fade-in duration-200 ${
          toolbarPosition === 'bottom'
            ? '-bottom-14 slide-in-from-top-2'
            : '-top-14 slide-in-from-bottom-2'
        }`}>
          <div className="bg-slate-900 rounded-lg shadow-xl flex items-center gap-0.5 p-1">
            {!isProfileCard && (
              <>
                <button
                  {...attributes}
                  {...listeners}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors cursor-grab active:cursor-grabbing"
                  title="Sürükle"
                >
                  <GripVertical className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-white/10" />

                <button
                  onClick={handleMoveUp}
                  disabled={isFirst}
                  className={`p-2 rounded transition-colors ${
                    isFirst
                      ? 'text-white/20 cursor-not-allowed'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  title="Yukarı taşı"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                <button
                  onClick={handleMoveDown}
                  disabled={isLast}
                  className={`p-2 rounded transition-colors ${
                    isLast
                      ? 'text-white/20 cursor-not-allowed'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  title="Aşağı taşı"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-white/10" />
              </>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                editBlock(block.id);
              }}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Düzenle"
            >
              <Pencil className="w-4 h-4" />
            </button>

            <button
              onClick={toggleVisibility}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
              title={isVisible ? 'Gizle' : 'Göster'}
            >
              {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            {!isProfileCard && (
              <>
                <button
                  onClick={handleDuplicate}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                  title="Kopyala"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-white/10" />

                <button
                  onClick={handleDelete}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className={`absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
        isSelected ? 'opacity-100' : ''
      }`}>
        <div className="w-1 h-8 bg-slate-300 rounded-full" />
      </div>

      <BlockRenderer block={block} isEditing />
    </div>
  );
}
