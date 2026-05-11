/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BlockType } from '../types/blocks';

import ProfileCard from '../components/blocks/common/ProfileCard';
import SocialMedia from '../components/blocks/common/SocialMedia';
import MapBlock from '../components/blocks/common/MapBlock';
import VideoBlock from '../components/blocks/common/VideoBlock';
import TextBlock from '../components/blocks/common/TextBlock';
import ImageGallery from '../components/blocks/common/ImageGallery';
import LinkButton from '../components/blocks/common/LinkButton';
import Divider from '../components/blocks/common/Divider';
import VCardBlock from '../components/blocks/common/VCardBlock';
import PDFViewer from '../components/blocks/common/PDFViewer';
import FAQBlock from '../components/blocks/common/FAQBlock';
import MenuItem from '../components/blocks/menu/MenuItem';
import WifiCard from '../components/blocks/menu/WifiCard';
import GoogleReview from '../components/blocks/menu/GoogleReview';
import Countdown from '../components/blocks/invitation/Countdown';
import RSVPForm from '../components/blocks/invitation/RSVPForm';
import LocationMap from '../components/blocks/invitation/LocationMap';
import SkillBars from '../components/blocks/biolink/SkillBars';
import ContactForm from '../components/blocks/biolink/ContactForm';
import SocialLinks from '../components/blocks/biolink/SocialLinks';

import type {
  ProfileCardContent,
  SocialMediaContent,
  MapContent,
  VideoContent,
  TextContent,
  ImageGalleryContent,
  LinkButtonContent,
  DividerContent,
  VCardContent,
  PDFContent,
  FAQContent,
  MenuItemContent,
  WifiCardContent,
  GoogleReviewContent,
  CountdownContent,
  RSVPFormContent,
  SkillBarsContent,
  ContactFormContent,
  LocationMapContent,
  SocialLinksContent,
} from '../types/blocks';

type BlockComponent<T = unknown> = React.ComponentType<{
  content: T;
  blockId?: string;
  siteId?: string;
}> | React.ComponentType<any>;

interface BlockRegistryEntry {
  component: BlockComponent;
  defaultContent: Record<string, unknown>;
}

export const BLOCK_REGISTRY: Record<BlockType, BlockRegistryEntry> = {
  profile_card: {
    component: ProfileCard as BlockComponent<ProfileCardContent>,
    defaultContent: { name: '', title: '', bio: '', avatarUrl: '' },
  },
  social_media: {
    component: SocialMedia as BlockComponent<SocialMediaContent>,
    defaultContent: { links: [] },
  },
  map: {
    component: MapBlock as BlockComponent<MapContent>,
    defaultContent: { address: '', lat: 0, lng: 0 },
  },
  video: {
    component: VideoBlock as BlockComponent<VideoContent>,
    defaultContent: { url: '', title: '' },
  },
  text: {
    component: TextBlock as BlockComponent<TextContent>,
    defaultContent: { text: '', alignment: 'left' },
  },
  image_gallery: {
    component: ImageGallery as BlockComponent<ImageGalleryContent>,
    defaultContent: { images: [], layout: 'grid' },
  },
  link_button: {
    component: LinkButton as BlockComponent<LinkButtonContent>,
    defaultContent: { text: 'Click here', url: '', style: 'filled' },
  },
  divider: {
    component: Divider as BlockComponent<DividerContent>,
    defaultContent: { style: 'solid', color: '#E5E7EB' },
  },
  vcard: {
    component: VCardBlock as BlockComponent<VCardContent>,
    defaultContent: { fullName: '', email: '', phone: '', company: '', title: '' },
  },
  pdf: {
    component: PDFViewer as BlockComponent<PDFContent>,
    defaultContent: { url: '', title: '' },
  },
  faq: {
    component: FAQBlock as BlockComponent<FAQContent>,
    defaultContent: { items: [] },
  },
  menu_item: {
    component: MenuItem as BlockComponent<MenuItemContent>,
    defaultContent: { name: '', description: '', price: 0, currency: '₺', isAvailable: true, category: '' },
  },
  wifi_card: {
    component: WifiCard as BlockComponent<WifiCardContent>,
    defaultContent: { networkName: '', password: '', securityType: 'WPA2' },
  },
  google_review: {
    component: GoogleReview as BlockComponent<GoogleReviewContent>,
    defaultContent: { placeId: '', buttonText: 'Leave a Review' },
  },
  countdown: {
    component: Countdown as BlockComponent<CountdownContent>,
    defaultContent: {
      targetDate: '',
      title: '',
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
      completedMessage: 'Event has started!',
    },
  },
  rsvp_form: {
    component: RSVPForm as BlockComponent<RSVPFormContent>,
    defaultContent: {
      eventName: '',
      maxGuestCount: 4,
      confirmationMessage: 'Yanitiniz icin tesekkurler!',
      updateMessage: 'Katilim bilgileriniz guncellendi!',
    },
  },
  skill_bars: {
    component: SkillBars as BlockComponent<SkillBarsContent>,
    defaultContent: { skills: [] },
  },
  contact_form: {
    component: ContactForm as BlockComponent<ContactFormContent>,
    defaultContent: {
      title: 'İletişime Geçin',
      fields: [
        { name: 'name', type: 'text', label: 'Ad', required: true },
        { name: 'email', type: 'email', label: 'E-posta', required: true },
        { name: 'message', type: 'textarea', label: 'Mesaj', required: true },
      ],
      submitText: 'Mesaj Gönder',
      successMessage: 'Mesajınız başarıyla gönderildi!',
    },
  },
  location_map: {
    component: LocationMap as BlockComponent<LocationMapContent>,
    defaultContent: { venueName: '', address: '', showDirectionsButton: true },
  },
  social_links: {
    component: SocialLinks as BlockComponent<SocialLinksContent>,
    defaultContent: { links: [], style: 'icons' },
  },
};

export function getBlockComponent(blockType: BlockType): BlockComponent | null {
  return BLOCK_REGISTRY[blockType]?.component || null;
}

export function getBlockDefaultContent(blockType: BlockType): Record<string, unknown> {
  return BLOCK_REGISTRY[blockType]?.defaultContent || {};
}

export function isBlockTypeRegistered(blockType: string): blockType is BlockType {
  return blockType in BLOCK_REGISTRY;
}
