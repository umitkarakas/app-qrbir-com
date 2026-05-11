import type { GoogleReviewContent } from '../../../types/blocks';
import { Star } from 'lucide-react';

interface GoogleReviewProps {
  content: GoogleReviewContent;
}

export default function GoogleReview({ content }: GoogleReviewProps) {
  const reviewUrl = content.placeId
    ? `https://search.google.com/local/writereview?placeid=${content.placeId}`
    : '#';

  return (
    <a
      href={reviewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full py-3 px-4 theme-surface border theme-border theme-rounded font-medium hover:opacity-90 transition-opacity theme-shadow"
    >
      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
      <span className="theme-text">{content.buttonText || 'Yorum Bırak'}</span>
    </a>
  );
}
