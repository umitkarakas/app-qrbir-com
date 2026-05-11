import type { TextContent } from '../../../types/blocks';

interface TextBlockProps {
  content: TextContent;
}

export default function TextBlock({ content }: TextBlockProps) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[content.alignment || 'left'];

  return (
    <div className={`theme-text ${alignmentClass}`}>
      {content.text || <span className="theme-text-secondary">Metninizi girin...</span>}
    </div>
  );
}
