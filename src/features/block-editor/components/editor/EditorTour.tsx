import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, RotateCcw } from 'lucide-react';

interface TourStep {
  id: string;
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    target: '',
    title: 'Editöre Hoş Geldiniz!',
    description: 'Sitenizi oluşturmak çok kolay. Size adım adım gösterelim.',
    position: 'bottom',
  },
  {
    id: 'add-block',
    target: '[data-tour="add-block"]',
    title: 'İçerik Ekleyin',
    description: 'Bu butona tıklayarak metin, resim, video ve daha fazlasını ekleyebilirsiniz.',
    position: 'top',
    highlight: true,
  },
  {
    id: 'theme',
    target: '[data-tour="theme"]',
    title: 'Tasarımı Seçin',
    description: 'Sitenizin renklerini ve görünümünü tek tıkla değiştirin.',
    position: 'top',
    highlight: true,
  },
  {
    id: 'save',
    target: '[data-tour="save"]',
    title: 'Kaydedin',
    description: 'Değişikliklerinizi kaybetmemek için kaydetmeyi unutmayın.',
    position: 'top',
    highlight: true,
  },
  {
    id: 'publish',
    target: '[data-tour="publish"]',
    title: 'Yayınlayın',
    description: 'Sitenizi herkese açık hale getirmek için bu butonu kullanın.',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'settings',
    target: '[data-tour="settings"]',
    title: 'Ayarlar',
    description: 'QR kod, önizleme ve diğer ayarlara buradan ulaşın.',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'blocks',
    target: '[data-tour="canvas"]',
    title: 'Blokları Düzenleyin',
    description: 'Eklediklerinize tıklayarak düzenleyin, sürükleyerek sıralayın.',
    position: 'top',
  },
  {
    id: 'done',
    target: '',
    title: 'Hazırsınız!',
    description: 'Şimdi sitenizi oluşturmaya başlayabilirsiniz. İyi eğlenceler!',
    position: 'bottom',
  },
];

const TOUR_STORAGE_KEY = 'qrbir_editor_tour_completed';

interface EditorTourProps {
  onComplete?: () => void;
}

export default function EditorTour({ onComplete }: EditorTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setIsActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateTargetRect = useCallback(() => {
    if (!step.target) {
      setTargetRect(null);
      return;
    }
    const element = document.querySelector(step.target);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
    }
  }, [step.target]);

  useEffect(() => {
    if (!isActive) return;
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [isActive, currentStep, updateTargetRect]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsActive(false);
    onComplete?.();
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  if (!isActive) {
    return (
      <button
        onClick={handleRestart}
        className="fixed bottom-24 right-4 z-30 p-3 bg-white rounded-full shadow-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all hover:scale-105"
        title="Turu yeniden başlat"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
    );
  }

  const getTooltipPosition = () => {
    if (!targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 180;

    switch (step.position) {
      case 'top':
        return {
          bottom: `${window.innerHeight - targetRect.top + padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        };
      case 'bottom':
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        };
      case 'left':
        return {
          top: `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`,
          right: `${window.innerWidth - targetRect.left + padding}px`,
        };
      case 'right':
        return {
          top: `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`,
          left: `${targetRect.right + padding}px`,
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  const getOverlayClipPath = () => {
    if (!targetRect || !step.highlight) {
      return 'none';
    }
    const padding = 8;
    const x = targetRect.left - padding;
    const y = targetRect.top - padding;
    const w = targetRect.width + padding * 2;
    const h = targetRect.height + padding * 2;
    const r = 16;

    return `polygon(
      0% 0%,
      0% 100%,
      ${x}px 100%,
      ${x}px ${y + r}px,
      ${x + r}px ${y}px,
      ${x + w - r}px ${y}px,
      ${x + w}px ${y + r}px,
      ${x + w}px ${y + h - r}px,
      ${x + w - r}px ${y + h}px,
      ${x + r}px ${y + h}px,
      ${x}px ${y + h - r}px,
      ${x}px 100%,
      100% 100%,
      100% 0%
    )`;
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-slate-900/70 transition-all duration-300"
        style={{ clipPath: getOverlayClipPath() }}
        onClick={handleSkip}
      />

      {targetRect && step.highlight && (
        <div
          className="absolute rounded-2xl pointer-events-none transition-all duration-300"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.8), 0 0 20px 4px rgba(59, 130, 246, 0.4)',
          }}
        />
      )}

      <div
        className="absolute bg-white rounded-2xl shadow-2xl p-5 w-[320px] animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={getTooltipPosition()}
      >
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-medium text-slate-400">
            {currentStep + 1} / {TOUR_STEPS.length}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-5">{step.description}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Turu Atla
          </button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
            >
              {isLastStep ? 'Başla' : 'İleri'}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-4">
          {TOUR_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-6 bg-blue-500'
                  : index < currentStep
                  ? 'w-1.5 bg-blue-300'
                  : 'w-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function useTourReset() {
  return () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  };
}
