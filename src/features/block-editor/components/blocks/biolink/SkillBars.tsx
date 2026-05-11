import type { SkillBarsContent } from '../../../types/blocks';

interface SkillBarsProps {
  content: SkillBarsContent;
}

export default function SkillBars({ content }: SkillBarsProps) {
  const skills = content.skills || [];

  if (skills.length === 0) {
    return (
      <div className="text-center theme-text-secondary py-4">Henüz yetenek eklenmedi</div>
    );
  }

  return (
    <div className="space-y-4">
      {skills.map((skill, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium theme-text">{skill.name}</span>
            <span className="text-sm theme-text-secondary">{skill.level}%</span>
          </div>
          <div className="w-full h-2 theme-surface rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(100, Math.max(0, skill.level))}%`,
                backgroundColor: skill.color || 'var(--theme-primary)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
