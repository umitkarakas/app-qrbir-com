import type { VCardContent } from '../../../types/blocks';
import { Download, Mail, Phone, Globe, Building } from 'lucide-react';

interface VCardBlockProps {
  content: VCardContent;
}

export default function VCardBlock({ content }: VCardBlockProps) {
  const generateVCard = () => {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${content.fullName || ''}`,
      content.email ? `EMAIL:${content.email}` : '',
      content.phone ? `TEL:${content.phone}` : '',
      content.company ? `ORG:${content.company}` : '',
      content.title ? `TITLE:${content.title}` : '',
      content.website ? `URL:${content.website}` : '',
      content.address ? `ADR:;;${content.address};;;` : '',
      'END:VCARD',
    ].filter(Boolean);

    const blob = new Blob([lines.join('\n')], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.fullName || 'contact'}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="theme-surface theme-rounded p-4">
      <div className="space-y-2 mb-4">
        {content.email && (
          <a href={`mailto:${content.email}`} className="flex items-center gap-2 theme-text-secondary hover:theme-primary-text">
            <Mail className="w-4 h-4" />
            <span className="text-sm">{content.email}</span>
          </a>
        )}
        {content.phone && (
          <a href={`tel:${content.phone}`} className="flex items-center gap-2 theme-text-secondary hover:theme-primary-text">
            <Phone className="w-4 h-4" />
            <span className="text-sm">{content.phone}</span>
          </a>
        )}
        {content.company && (
          <div className="flex items-center gap-2 theme-text-secondary">
            <Building className="w-4 h-4" />
            <span className="text-sm">{content.company}</span>
          </div>
        )}
        {content.website && (
          <a href={content.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 theme-text-secondary hover:theme-primary-text">
            <Globe className="w-4 h-4" />
            <span className="text-sm">{content.website}</span>
          </a>
        )}
      </div>
      <button
        onClick={generateVCard}
        className="w-full py-2 px-4 theme-primary text-white theme-rounded font-medium flex items-center justify-center gap-2 hover:opacity-90 theme-shadow"
      >
        <Download className="w-4 h-4" />
        Kişiyi Kaydet
      </button>
    </div>
  );
}
