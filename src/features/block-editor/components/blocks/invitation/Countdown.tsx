import { useState, useEffect } from 'react';
import type { CountdownContent } from '../../../types/blocks';

interface CountdownProps {
  content: CountdownContent;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

function calculateTimeLeft(targetDate: string): TimeLeft {
  const difference = new Date(targetDate).getTime() - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isComplete: false,
  };
}

export default function Countdown({ content }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(content.targetDate || '')
  );

  useEffect(() => {
    if (!content.targetDate) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(content.targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [content.targetDate]);

  if (!content.targetDate) {
    return (
      <div className="text-center theme-text-secondary py-4">
        Geri sayım için bir hedef tarih belirleyin
      </div>
    );
  }

  if (timeLeft.isComplete) {
    return (
      <div className="text-center py-4">
        <p className="text-xl font-semibold theme-text">
          {content.completedMessage || 'Etkinlik başladı!'}
        </p>
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: 'Gün', show: content.showDays !== false },
    { value: timeLeft.hours, label: 'Saat', show: content.showHours !== false },
    { value: timeLeft.minutes, label: 'Dakika', show: content.showMinutes !== false },
    { value: timeLeft.seconds, label: 'Saniye', show: content.showSeconds !== false },
  ].filter((unit) => unit.show);

  return (
    <div className="text-center">
      {content.title && (
        <h3 className="text-lg font-semibold theme-text mb-4">{content.title}</h3>
      )}
      <div className="flex justify-center gap-3">
        {units.map((unit) => (
          <div key={unit.label} className="theme-surface theme-rounded p-3 min-w-[70px]">
            <div className="text-2xl font-bold theme-text">
              {unit.value.toString().padStart(2, '0')}
            </div>
            <div className="text-xs theme-text-secondary uppercase tracking-wider">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
