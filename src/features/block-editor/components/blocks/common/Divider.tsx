import type { DividerContent } from '../../../types/blocks';

interface DividerProps {
  content: DividerContent;
}

export default function Divider({ content }: DividerProps) {
  const style = content.style || 'solid';
  const color = content.color || 'var(--theme-border)';

  if (style === 'gradient') {
    return (
      <div
        className="h-px w-full"
        style={{
          background: `linear-gradient(to right, transparent, ${color}, transparent)`,
        }}
      />
    );
  }

  const styleMap = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };

  return (
    <hr
      className={`border-t ${styleMap[style]}`}
      style={{ borderColor: color }}
    />
  );
}
