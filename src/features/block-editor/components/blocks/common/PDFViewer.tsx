import type { PDFContent } from '../../../types/blocks';
import { FileText, ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  content: PDFContent;
}

export default function PDFViewer({ content }: PDFViewerProps) {
  const { url, title } = content;

  if (!url) {
    return (
      <div className="w-full h-48 theme-rounded theme-surface flex items-center justify-center border theme-border">
        <div className="text-center theme-text-secondary">
          <FileText className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">PDF dosyası belirlenmedi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {title && (
        <h3 className="text-lg font-semibold theme-text">{title}</h3>
      )}
      <div className="border theme-border theme-rounded overflow-hidden">
        <iframe
          src={url}
          className="w-full h-96"
          title={title || 'PDF Document'}
        />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm theme-primary-text hover:opacity-80"
      >
        <ExternalLink className="w-4 h-4" />
        Yeni sekmede aç
      </a>
    </div>
  );
}
