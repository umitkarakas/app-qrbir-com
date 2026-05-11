export type SiteGoal = 'restaurant' | 'biolink' | 'event' | 'business';

export interface GoalOption {
  id: SiteGoal;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  goal: SiteGoal;
  blocks: TemplateBlock[];
  theme: {
    primaryColor: string;
    backgroundColor: string;
    style: 'minimal' | 'bold' | 'elegant';
  };
}

export interface TemplateBlock {
  type: string;
  content: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

export interface OnboardingData {
  goal: SiteGoal | null;
  templateId: string | null;
  businessName: string;
  ownerName: string;
  tagline: string;
  avatarUrl: string;
  eventDate: string;
  eventLocation: string;
  phone: string;
  email: string;
}

export type OnboardingStep = 'welcome' | 'goal' | 'template' | 'info' | 'complete';
