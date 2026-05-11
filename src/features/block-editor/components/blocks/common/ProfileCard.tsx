import type { ProfileCardContent } from '../../../types/blocks';
import { User } from 'lucide-react';

interface ProfileCardProps {
  content: ProfileCardContent;
}

export default function ProfileCard({ content }: ProfileCardProps) {
  return (
    <div className="text-center">
      {content.avatarUrl ? (
        <img
          src={content.avatarUrl}
          alt={content.name}
          className="w-24 h-24 rounded-full object-cover mx-auto mb-4 theme-shadow"
        />
      ) : (
        <div className="w-24 h-24 rounded-full theme-surface flex items-center justify-center mx-auto mb-4 theme-shadow">
          <User className="w-10 h-10 theme-text-secondary" />
        </div>
      )}
      <h2 className="text-xl font-bold theme-text" style={{ fontFamily: 'var(--theme-font-heading)' }}>
        {content.name || 'İsminiz'}
      </h2>
      {content.title && <p className="theme-text-secondary mt-1">{content.title}</p>}
      {content.bio && <p className="theme-text-secondary mt-2 text-sm">{content.bio}</p>}
    </div>
  );
}
