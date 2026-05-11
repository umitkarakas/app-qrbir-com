import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMemo } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import { getThemeVariables } from '../../lib/theme';
import type { ThemeConfig } from '../../types/theme';
import SortableBlock from './SortableBlock';
import { Plus, Sparkles } from 'lucide-react';

export default function EditorCanvas() {
  const { blocks, reorderBlocks, selectedTheme } = useEditor();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      reorderBlocks(oldIndex, newIndex);
    }
  };

  const themeConfig = selectedTheme?.config as ThemeConfig | undefined;
  const themeVariables = useMemo(() => {
    return themeConfig ? getThemeVariables(themeConfig) : {};
  }, [themeConfig]);

  return (
    <div className="h-full w-full overflow-hidden flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md h-full flex flex-col">
        <div
          className="flex-1 bg-white rounded-2xl overflow-hidden shadow-xl"
          style={{
            ...themeVariables,
            backgroundColor: themeConfig?.colors.background || '#FFFFFF',
            color: themeConfig?.colors.text || '#111827',
            fontFamily: themeConfig?.fonts.body || 'Inter, sans-serif',
          } as React.CSSProperties}
        >
          <div className="h-full overflow-y-auto overscroll-contain p-4 sm:p-6 pt-16">
            {blocks.length === 0 ? (
              <EmptyCanvasState />
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {blocks.map((block) => (
                      <SortableBlock key={block.id} block={block} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCanvasState() {
  return (
    <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="relative mb-6">
        <div className="w-16 h-16 theme-surface rounded-2xl flex items-center justify-center border theme-border theme-shadow">
          <Plus className="w-8 h-8 theme-text-secondary" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 theme-primary rounded-full flex items-center justify-center animate-bounce-slow">
          <Sparkles className="w-2.5 h-2.5 text-white" />
        </div>
      </div>
      <h3 className="text-base font-semibold theme-text mb-2">
        Henuz icerik yok
      </h3>
      <p className="theme-text-secondary text-sm max-w-[200px] leading-relaxed">
        Alttaki <span className="font-semibold theme-text">Ekle</span> butonuna tiklayin
      </p>
    </div>
  );
}
