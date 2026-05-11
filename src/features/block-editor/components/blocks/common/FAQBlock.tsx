import { useState } from 'react';
import type { FAQContent } from '../../../types/blocks';
import { ChevronDown } from 'lucide-react';

interface FAQBlockProps {
  content: FAQContent;
}

export default function FAQBlock({ content }: FAQBlockProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!content.items || content.items.length === 0) {
    return (
      <div className="text-center theme-text-secondary py-4">
        Henüz soru eklenmedi
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {content.items.map((item, index) => (
        <div key={index} className="border theme-border theme-rounded overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-4 text-left hover:theme-surface"
          >
            <span className="font-medium theme-text">{item.question}</span>
            <ChevronDown
              className={`w-5 h-5 theme-text-secondary transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === index && (
            <div className="px-4 pb-4 theme-text-secondary">{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}
