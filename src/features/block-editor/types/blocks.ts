export interface BlockSettings {
  isVisible: boolean;
  padding: 'none' | 'sm' | 'md' | 'lg';
  margin: 'none' | 'sm' | 'md' | 'lg';
  backgroundColor?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export interface ProfileCardContent {
  name: string;
  title?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface SocialMediaContent {
  links: { platform: string; url: string }[];
}

export interface MapContent {
  address: string;
  lat?: number;
  lng?: number;
}

export interface VideoContent {
  url: string;
  title?: string;
}

export interface TextContent {
  text: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface ImageGalleryContent {
  images: { url: string; caption?: string }[];
  layout?: 'grid' | 'carousel';
}

export interface LinkButtonContent {
  text: string;
  url: string;
  style?: 'filled' | 'outline' | 'ghost';
  icon?: string;
}

export interface DividerContent {
  style?: 'solid' | 'dashed' | 'dotted' | 'gradient';
  color?: string;
}

export interface VCardContent {
  fullName: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  website?: string;
  address?: string;
}

export interface PDFContent {
  url: string;
  title?: string;
}

export interface FAQContent {
  items: { question: string; answer: string }[];
}


export interface MenuItemContent {
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  isAvailable: boolean;
  category?: string;
}

export interface WifiCardContent {
  networkName: string;
  password: string;
  securityType?: 'WPA' | 'WPA2' | 'WEP' | 'none';
}

export interface GoogleReviewContent {
  placeId: string;
  buttonText?: string;
}

export interface CountdownContent {
  targetDate: string;
  title?: string;
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
  completedMessage: string;
}

export interface RSVPFormField {
  name: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea';
  label: string;
  required: boolean;
  options?: string[];
}

export interface RSVPFormContent {
  eventName: string;
  eventDate?: string;
  maxGuestCount: number;
  confirmationMessage: string;
  updateMessage: string;
}


export interface SkillBarsContent {
  skills: { name: string; level: number; color?: string }[];
}

export interface ContactFormContent {
  title?: string;
  fields: RSVPFormField[];
  submitText: string;
  successMessage: string;
}

export interface LocationMapContent {
  venueName?: string;
  address: string;
  lat?: number;
  lng?: number;
  showDirectionsButton?: boolean;
}

export interface SocialLinksContent {
  links: { platform: string; url: string }[];
  style?: 'icons' | 'buttons';
}

export type BlockContent =
  | ProfileCardContent
  | SocialMediaContent
  | MapContent
  | VideoContent
  | TextContent
  | ImageGalleryContent
  | LinkButtonContent
  | DividerContent
  | VCardContent
  | PDFContent
  | FAQContent
  | MenuItemContent
  | WifiCardContent
  | GoogleReviewContent
  | CountdownContent
  | RSVPFormContent
  | SkillBarsContent
  | ContactFormContent
  | LocationMapContent
  | SocialLinksContent;

export type BlockType =
  | 'profile_card'
  | 'social_media'
  | 'map'
  | 'video'
  | 'text'
  | 'image_gallery'
  | 'link_button'
  | 'divider'
  | 'vcard'
  | 'pdf'
  | 'faq'
  | 'menu_item'
  | 'wifi_card'
  | 'google_review'
  | 'countdown'
  | 'rsvp_form'
  | 'skill_bars'
  | 'contact_form'
  | 'location_map'
  | 'social_links';
