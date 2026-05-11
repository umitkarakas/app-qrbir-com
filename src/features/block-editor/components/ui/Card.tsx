interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export default function Card({ children, className = '', padding = 'md', hover, onClick }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-xl border border-slate-200 shadow-sm
        ${paddingStyles[padding]}
        ${hover ? 'hover:shadow-md hover:border-slate-300 transition-all cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
