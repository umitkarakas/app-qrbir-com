import type { GoalOption, TemplatePreset, TemplateBlock } from '../types/onboarding';

export const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'restaurant',
    title: 'Restoran / Kafe',
    description: 'Menu, WiFi bilgisi, iletisim',
    icon: 'UtensilsCrossed',
    color: 'bg-amber-500',
  },
  {
    id: 'biolink',
    title: 'Kisisel Sayfa',
    description: 'Sosyal medya, biyografi, linkler',
    icon: 'User',
    color: 'bg-sky-500',
  },
  {
    id: 'event',
    title: 'Etkinlik / Davetiye',
    description: 'Tarih, konum, RSVP formu',
    icon: 'PartyPopper',
    color: 'bg-rose-500',
  },
  {
    id: 'business',
    title: 'Dijital Kartvizit',
    description: 'Iletisim bilgileri, hizmetler',
    icon: 'Briefcase',
    color: 'bg-emerald-500',
  },
];

const createRestaurantBlocks = (data: {
  businessName: string;
  tagline: string;
  avatarUrl: string;
}): TemplateBlock[] => {
  const blocks: TemplateBlock[] = [
    {
      type: 'profile_card',
      content: {
        name: data.businessName,
        title: data.tagline || '',
        bio: 'Hosgeldiniz! Menumuzu inceleyebilir ve bizimle iletisime gecebilirsiniz.',
        avatarUrl: data.avatarUrl || '',
      },
    },
    {
      type: 'contact_form',
      content: {
        title: 'Bizimle Iletisime Gecin',
        submitText: 'Gonder',
        successMessage: 'Mesajiniz alindi, en kisa surede donecegiz!',
      },
    },
  ];

  return blocks;
};

const createBiolinkBlocks = (data: {
  ownerName: string;
  tagline: string;
  avatarUrl: string;
}): TemplateBlock[] => {
  const blocks: TemplateBlock[] = [
    {
      type: 'profile_card',
      content: {
        name: data.ownerName,
        title: data.tagline || '',
        bio: 'Merhaba! Bu sayfada beni ve calismalarimi kesfedebilirsiniz.',
        avatarUrl: data.avatarUrl || '',
      },
    },
    {
      type: 'contact_form',
      content: {
        title: 'Iletisime Gec',
        submitText: 'Gonder',
        successMessage: 'Mesajiniz alindi!',
      },
    },
  ];

  return blocks;
};

const createEventBlocks = (data: {
  businessName: string;
  ownerName: string;
  eventDate: string;
  eventLocation: string;
}): TemplateBlock[] => {
  const blocks: TemplateBlock[] = [
    {
      type: 'profile_card',
      content: {
        name: data.businessName,
        title: data.ownerName ? `${data.ownerName} davet ediyor` : 'Sizi davet ediyoruz',
        bio: 'Bu ozel gunde sizleri aramizda gormekten mutluluk duyariz.',
        avatarUrl: '',
      },
    },
  ];

  if (data.eventDate) {
    blocks.push({
      type: 'countdown',
      content: {
        title: 'Etkinlige Kalan Sure',
        targetDate: data.eventDate,
        completedMessage: 'Etkinlik basladi!',
        showDays: true,
        showHours: true,
        showMinutes: true,
        showSeconds: true,
      },
    });
  }

  if (data.eventLocation) {
    blocks.push({
      type: 'location_map',
      content: {
        venueName: 'Etkinlik Mekani',
        address: data.eventLocation,
        showDirectionsButton: true,
      },
    });
  }

  blocks.push({
    type: 'rsvp_form',
    content: {
      title: 'Katilim Bildir',
      fields: ['name', 'email', 'guests', 'message'],
    },
  });

  return blocks;
};

const createBusinessBlocks = (data: {
  ownerName: string;
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  avatarUrl: string;
}): TemplateBlock[] => {
  const blocks: TemplateBlock[] = [
    {
      type: 'profile_card',
      content: {
        name: data.ownerName,
        title: data.tagline || data.businessName || '',
        bio: 'Profesyonel hizmetler icin benimle iletisime gecebilirsiniz.',
        avatarUrl: data.avatarUrl || '',
      },
    },
  ];

  if (data.phone || data.email) {
    blocks.push({
      type: 'vcard',
      content: {
        fullName: data.ownerName,
        email: data.email || '',
        phone: data.phone || '',
        company: data.businessName || '',
        title: data.tagline || '',
        website: '',
      },
    });
  }

  blocks.push({
    type: 'contact_form',
    content: {
      title: 'Mesaj Gonder',
      submitText: 'Iletisime Gec',
      successMessage: 'En kisa surede donecegim!',
    },
  });

  return blocks;
};

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'restaurant-classic',
    name: 'Klasik Menu',
    description: 'Sade ve okunak',
    previewImage: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=400',
    goal: 'restaurant',
    blocks: [],
    theme: { primaryColor: '#78350f', backgroundColor: '#fffbeb', style: 'elegant' },
  },
  {
    id: 'restaurant-modern',
    name: 'Modern Kafe',
    description: 'Cagdas ve sik',
    previewImage: 'https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?auto=compress&cs=tinysrgb&w=400',
    goal: 'restaurant',
    blocks: [],
    theme: { primaryColor: '#1e293b', backgroundColor: '#f8fafc', style: 'minimal' },
  },
  {
    id: 'biolink-minimal',
    name: 'Minimalist',
    description: 'Sade ve temiz',
    previewImage: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
    goal: 'biolink',
    blocks: [],
    theme: { primaryColor: '#0f172a', backgroundColor: '#ffffff', style: 'minimal' },
  },
  {
    id: 'biolink-creative',
    name: 'Yaratici',
    description: 'Renkli ve enerjik',
    previewImage: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=400',
    goal: 'biolink',
    blocks: [],
    theme: { primaryColor: '#0284c7', backgroundColor: '#f0f9ff', style: 'bold' },
  },
  {
    id: 'event-elegant',
    name: 'Zarif Davetiye',
    description: 'Ozel gunler icin',
    previewImage: 'https://images.pexels.com/photos/1616113/pexels-photo-1616113.jpeg?auto=compress&cs=tinysrgb&w=400',
    goal: 'event',
    blocks: [],
    theme: { primaryColor: '#be185d', backgroundColor: '#fdf2f8', style: 'elegant' },
  },
  {
    id: 'event-celebration',
    name: 'Kutlama',
    description: 'Dogum gunu, parti',
    previewImage: 'https://images.pexels.com/photos/1405528/pexels-photo-1405528.jpeg?auto=compress&cs=tinysrgb&w=400',
    goal: 'event',
    blocks: [],
    theme: { primaryColor: '#ea580c', backgroundColor: '#fff7ed', style: 'bold' },
  },
  {
    id: 'business-professional',
    name: 'Profesyonel',
    description: 'Is dunyasi icin',
    previewImage: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    goal: 'business',
    blocks: [],
    theme: { primaryColor: '#1e40af', backgroundColor: '#eff6ff', style: 'minimal' },
  },
  {
    id: 'business-personal',
    name: 'Kisisel Marka',
    description: 'Freelancer ve girisimciler',
    previewImage: 'https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg?auto=compress&cs=tinysrgb&w=400',
    goal: 'business',
    blocks: [],
    theme: { primaryColor: '#059669', backgroundColor: '#ecfdf5', style: 'elegant' },
  },
];

export function generateBlocksForGoal(
  goal: string,
  data: Partial<{
    businessName: string;
    ownerName: string;
    tagline: string;
    avatarUrl: string;
    eventDate: string;
    eventLocation: string;
    phone: string;
    email: string;
  }>
): TemplateBlock[] {
  switch (goal) {
    case 'restaurant':
      return createRestaurantBlocks({
        businessName: data.businessName || '',
        tagline: data.tagline || '',
        avatarUrl: data.avatarUrl || '',
      });
    case 'biolink':
      return createBiolinkBlocks({
        ownerName: data.ownerName || '',
        tagline: data.tagline || '',
        avatarUrl: data.avatarUrl || '',
      });
    case 'event':
      return createEventBlocks({
        businessName: data.businessName || '',
        ownerName: data.ownerName || '',
        eventDate: data.eventDate || '',
        eventLocation: data.eventLocation || '',
      });
    case 'business':
      return createBusinessBlocks({
        ownerName: data.ownerName || '',
        businessName: data.businessName || '',
        tagline: data.tagline || '',
        phone: data.phone || '',
        email: data.email || '',
        avatarUrl: data.avatarUrl || '',
      });
    default:
      return [];
  }
}
