import type { BlockType } from '../types/blocks';
import type { SiteType } from '../types/database';

export const SITE_TYPES: { value: SiteType; label: string; description: string; icon: string }[] = [
  {
    value: 'digital_menu',
    label: 'Digital Menu',
    description: 'Create contactless restaurant menus with WiFi info and review links',
    icon: 'UtensilsCrossed',
  },
  {
    value: 'digital_invitation',
    label: 'Digital Invitation',
    description: 'Design beautiful event invitations with RSVP and countdown',
    icon: 'PartyPopper',
  },
  {
    value: 'bio_link',
    label: 'Bio Link',
    description: 'Build a link-in-bio page to share all your important links',
    icon: 'Link2',
  },
];

export const BLOCK_DEFINITIONS: Record<
  BlockType,
  {
    label: string;
    icon: string;
    category: 'common' | 'menu' | 'invitation' | 'biolink';
    siteTypes?: SiteType[];
    defaultContent: Record<string, unknown>;
    adminDescription: string;
    userDescription: string;
  }
> = {
  profile_card: {
    label: 'Profil Kartı',
    icon: 'UserCircle',
    category: 'common',
    defaultContent: { name: '', title: '', bio: '', avatarUrl: '' },
    adminDescription: 'Fotoğraf, isim ve kısa biyografi ile sayfanın kimliğini oluşturur. Profil fotoğrafı, başlık (isim/unvan) ve açıklama alanı içerir. Sayfanın en başında yer alır. Silinemez, kopyalanamaz ve ikinci kez eklenemez. Konumu sabittir.',
    userDescription: 'Sayfanın en üstünde görünen profil alanıdır. Fotoğrafınız, isminiz ve kısa bir açıklama ile ziyaretçilere kendinizi tanıtmanızı sağlar.',
  },
  social_media: {
    label: 'Sosyal Medya',
    icon: 'Share2',
    category: 'common',
    defaultContent: { links: [] },
    adminDescription: 'Sosyal medya ve iletişim bağlantılarının ikonlu şekilde eklenmesini sağlar. Her bağlantı türü için uygun doğrulama kontrolleri bulunur (telefon numarası, e-posta formatı vb.). Sıralama ve görünürlük ayarları desteklenir.',
    userDescription: 'Sosyal medya hesaplarınıza tek dokunuşla ulaşılmasını sağlar. Instagram, WhatsApp, telefon ve e-posta gibi bağlantıları ikonlarla gösterebilirsiniz.',
  },
  map: {
    label: 'Harita',
    icon: 'MapPin',
    category: 'common',
    defaultContent: { address: '', lat: 0, lng: 0 },
    adminDescription: 'Etkileşimli harita üzerinde konum gösterimi sağlar. Adres, yakınlaştırma ve yol tarifi özelliklerini destekler.',
    userDescription: 'İşletmenizin veya etkinliğinizin konumunu harita üzerinde gösterir.',
  },
  video: {
    label: 'Video',
    icon: 'Video',
    category: 'common',
    defaultContent: { url: '', title: '' },
    adminDescription: 'YouTube, Vimeo veya doğrudan bağlantı ile video içeriği eklenmesini sağlar. Önizleme görseli ve oynatma kontrollerini destekler.',
    userDescription: 'Tanıtım veya bilgilendirme videolarınızı sayfanızda oynatabilirsiniz.',
  },
  text: {
    label: 'Metin Bloğu',
    icon: 'Type',
    category: 'common',
    defaultContent: { text: '', alignment: 'left' },
    adminDescription: 'Başlık, paragraf ve vurgulu metinlerle açıklayıcı içerik eklenmesini sağlar. Kalın, italik, bağlantı ve satır aralığı gibi temel metin biçimlendirme seçeneklerini destekler.',
    userDescription: 'Açıklama, duyuru veya bilgi vermek için metin eklemenizi sağlar. Başlık ve paragraf yapısıyla içeriğinizi düzenli şekilde sunabilirsiniz.',
  },
  image_gallery: {
    label: 'Foto Galeri',
    icon: 'Images',
    category: 'common',
    defaultContent: { images: [], layout: 'grid' },
    adminDescription: 'Birden fazla görselin galeri formatında sunulmasını sağlar. Sıralama, dokunarak büyütme ve kaydırma etkileşimlerini destekler.',
    userDescription: 'Fotoğraflarınızı galeri halinde sergileyerek mekânınızı, ürünlerinizi veya çalışmalarınızı görsel olarak anlatabilirsiniz.',
  },
  link_button: {
    label: 'Link Butonu',
    icon: 'Link',
    category: 'common',
    defaultContent: { text: 'Tıklayın', url: '', style: 'filled' },
    adminDescription: 'Özel bir bağlantıya yönlendiren çağrı-aksiyon (CTA) butonu ekler. Buton metni, URL ve stil seçeneklerini içerir.',
    userDescription: 'Ziyaretçileri belirli bir sayfaya yönlendirmek için dikkat çekici bir buton eklemenizi sağlar.',
  },
  divider: {
    label: 'Ayırıcı',
    icon: 'Minus',
    category: 'common',
    defaultContent: { style: 'solid', color: '#E5E7EB' },
    adminDescription: 'Sayfa bölümleri arasında görsel ayrım oluşturur. Tasarım öğesidir. Farklı stil ve boşluk seçenekleriyle içeriğin okunabilirliğini artırır.',
    userDescription: 'İçerik bölümlerini ayırarak sayfanın daha düzenli ve okunabilir görünmesini sağlar.',
  },
  vcard: {
    label: 'vCard',
    icon: 'Contact',
    category: 'common',
    defaultContent: { fullName: '', email: '', phone: '', company: '', title: '' },
    adminDescription: 'İndirilebilir dijital kartvizit (vCard) oluşturur. İsim, telefon, e-posta ve şirket bilgilerini içerir. QR kod ve indirme butonu ile birlikte sunulur.',
    userDescription: 'Dijital kartvizitinizi ziyaretçilerin tek dokunuşla telefonlarına kaydetmesini sağlar.',
  },
  pdf: {
    label: 'PDF Görüntüleyici',
    icon: 'FileText',
    category: 'common',
    defaultContent: { url: '', title: '' },
    adminDescription: 'PDF belgelerinin sayfa içerisinde görüntülenmesini sağlar. Menü, katalog, broşür veya döküman paylaşımı için kullanılır.',
    userDescription: 'PDF formatındaki menü, katalog veya belgelerinizi sayfanızda kolayca paylaşabilirsiniz.',
  },
  faq: {
    label: 'SSS',
    icon: 'HelpCircle',
    category: 'common',
    defaultContent: { items: [] },
    adminDescription: 'Soru–cevap içeriklerini açılır–kapanır (akordeon) formatta sunar. Birden fazla soru eklenmesini destekler.',
    userDescription: 'Sık sorulan soruları düzenli şekilde göstererek ziyaretçilerin hızlıca bilgi almasını sağlar.',
  },
  menu_item: {
    label: 'Menü Öğesi',
    icon: 'UtensilsCrossed',
    category: 'menu',
    siteTypes: ['digital_menu'],
    defaultContent: { name: '', description: '', price: 0, currency: '₺', tags: [], isAvailable: true, category: '' },
    adminDescription: 'Fiyat ve açıklama içeren menü öğesi ekler. Kategori seçimi ile menü öğelerini gruplandırabilirsiniz. Restoran ve kafe menüleri için optimize edilmiştir.',
    userDescription: 'Menünüzdeki ürünleri fiyat ve açıklamalarıyla birlikte düzenli şekilde sergilemenizi sağlar.',
  },
  wifi_card: {
    label: 'WiFi Kartı',
    icon: 'Wifi',
    category: 'menu',
    siteTypes: ['digital_menu'],
    defaultContent: { networkName: '', password: '', securityType: 'WPA2' },
    adminDescription: 'WiFi ağ bilgilerini QR kod ve kopyalanabilir metin formatında sunar. Ağ adı ve şifre ile otomatik bağlantıyı destekler.',
    userDescription: 'Misafirlerinizin WiFi ağına hızlı ve kolay şekilde bağlanmasını sağlar.',
  },
  google_review: {
    label: 'Google Yorum',
    icon: 'Star',
    category: 'menu',
    siteTypes: ['digital_menu'],
    defaultContent: { placeId: '', buttonText: 'Yorum Yap' },
    adminDescription: 'Google İşletme panelinden alınan özel yorum bağlantısı kullanılarak çalışır. Bağlantıya tıklandığında kullanıcıyı Google İşletme profiline yönlendirir ve yorum yazma penceresini otomatik olarak açar.',
    userDescription: 'Müşterilerinizi Google\'da yorum yapmaya yönlendirir. Tek dokunuşla Google profilinize gider ve yorum sayfası açılır.',
  },
  countdown: {
    label: 'Geri Sayım Sayacı',
    icon: 'Clock',
    category: 'invitation',
    siteTypes: ['digital_invitation'],
    defaultContent: {
      targetDate: '',
      title: '',
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
      completedMessage: 'Etkinlik başladı!',
    },
    adminDescription: 'Belirlenen tarih ve saate kadar kalan süreyi dinamik olarak gösterir. Etkinlik, lansman veya kampanya senaryolarını destekler.',
    userDescription: 'Etkinlik veya kampanya için geri sayım göstererek dikkat oluşturur.',
  },
  rsvp_form: {
    label: 'Katılım Bildirim Formu',
    icon: 'Calendar',
    category: 'invitation',
    siteTypes: ['digital_invitation'],
    defaultContent: {
      eventName: '',
      eventDate: '',
      fields: [],
      maxGuests: 1,
      confirmationMessage: 'Yanıtınız için teşekkürler!',
    },
    adminDescription: 'Etkinlik katılım onaylarını toplamak için kullanılan form bloğudur. Özel alanlar ve yanıt takibi desteklenir.',
    userDescription: 'Ziyaretçilerin etkinliğe katılıp katılmayacağını kolayca bildirmesini sağlar.',
  },
  skill_bars: {
    label: 'Yetenek Çubukları',
    icon: 'BarChart',
    category: 'biolink',
    siteTypes: ['bio_link'],
    defaultContent: { skills: [] },
    adminDescription: 'Beceri ve deneyimleri yüzde veya seviye bazlı görsel çubuklarla gösterir.',
    userDescription: 'Yetkinliklerinizi ve deneyim seviyelerinizi görsel olarak sergilemenizi sağlar.',
  },
  contact_form: {
    label: 'İletişim Formu',
    icon: 'Mail',
    category: 'biolink',
    siteTypes: ['bio_link'],
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
    adminDescription: 'Kullanıcılardan mesaj toplamak için özelleştirilebilir form bloğudur. Ad, e-posta, mesaj ve isteğe bağlı özel alanlar içerir.',
    userDescription: 'Ziyaretçilerin sizinle doğrudan iletişime geçmesini sağlar.',
  },
  location_map: {
    label: 'Konum Bilgisi',
    icon: 'MapPin',
    category: 'invitation',
    siteTypes: ['digital_invitation', 'digital_menu'],
    defaultContent: { venueName: '', address: '', showDirectionsButton: true },
    adminDescription: 'Etkinlik veya işletme konumunu harita üzerinde gösterir. Mekan adı, adres ve yol tarifi butonu içerir.',
    userDescription: 'Etkinliğinizin veya işletmenizin konumunu harita ile gösterir ve yol tarifi sağlar.',
  },
  social_links: {
    label: 'Sosyal Medya V2',
    icon: 'Share2',
    category: 'biolink',
    siteTypes: ['bio_link', 'digital_invitation', 'digital_menu'],
    defaultContent: { links: [], style: 'icons' },
    adminDescription: 'Sosyal medya bağlantılarını ikon veya buton formatında sunar. Birden fazla platform desteği sağlar.',
    userDescription: 'Sosyal medya hesaplarınıza şık bağlantılar ekleyin.',
  },
};

export const SOCIAL_PLATFORMS = {
  instagram: { name: 'Instagram', color: '#E4405F', baseUrl: 'https://instagram.com/', placeholder: 'username' },
  facebook: { name: 'Facebook', color: '#1877F2', baseUrl: 'https://facebook.com/', placeholder: 'username' },
  twitter: { name: 'Twitter/X', color: '#1DA1F2', baseUrl: 'https://x.com/', placeholder: 'username' },
  linkedin: { name: 'LinkedIn', color: '#0A66C2', baseUrl: 'https://linkedin.com/in/', placeholder: 'username' },
  youtube: { name: 'YouTube', color: '#FF0000', baseUrl: 'https://youtube.com/@', placeholder: 'username' },
  tiktok: { name: 'TikTok', color: '#000000', baseUrl: 'https://tiktok.com/@', placeholder: 'username' },
  pinterest: { name: 'Pinterest', color: '#BD081C', baseUrl: 'https://pinterest.com/', placeholder: 'username' },
  spotify: { name: 'Spotify', color: '#1DB954', baseUrl: 'https://open.spotify.com/user/', placeholder: 'username' },
  soundcloud: { name: 'SoundCloud', color: '#FF5500', baseUrl: 'https://soundcloud.com/', placeholder: 'username' },
  telegram: { name: 'Telegram', color: '#0088CC', baseUrl: 'https://t.me/', placeholder: 'username' },
  whatsapp: { name: 'WhatsApp', color: '#25D366', baseUrl: 'https://wa.me/', placeholder: '+90 555 123 4567' },
  discord: { name: 'Discord', color: '#5865F2', baseUrl: 'https://discord.com/users/', placeholder: 'user ID' },
} as const;

export const DIETARY_TAGS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'spicy',
  'halal',
  'kosher',
];
