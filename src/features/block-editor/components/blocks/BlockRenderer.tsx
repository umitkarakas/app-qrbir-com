import type { Block } from '../../types/database';
import { getBlockComponent, isBlockTypeRegistered } from '../../config/blockRegistry';

interface BlockRendererProps {
  block: Block;
  isEditing?: boolean;
  siteId?: string;
}

const paddingMap = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export default function BlockRenderer({ block, isEditing, siteId }: BlockRendererProps) {
  const settings = block.settings as { padding?: string; isVisible?: boolean } | null;
  const padding = paddingMap[(settings?.padding as keyof typeof paddingMap) || 'md'];
  const isVisible = settings?.isVisible !== false;

  if (!isVisible && !isEditing) return null;

  const renderBlock = () => {
    if (!isBlockTypeRegistered(block.block_type)) {
      return (
        <div className="theme-text-secondary text-sm text-center py-4">
          {`Blok tipi "${block.block_type}" henüz eklenmedi`}
        </div>
      );
    }

    const BlockComponent = getBlockComponent(block.block_type);

    if (!BlockComponent) {
      return (
        <div className="theme-text-secondary text-sm text-center py-4">
          {`Blok tipi "${block.block_type}" render edilemiyor`}
        </div>
      );
    }

    return <BlockComponent content={block.content} blockId={block.id} siteId={siteId} />;
  };

  return <div className={padding}>{renderBlock()}</div>;
}
