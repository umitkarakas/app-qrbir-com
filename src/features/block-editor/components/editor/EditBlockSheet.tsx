/* eslint-disable */
// @ts-nocheck
import { useState } from 'react';
import { X, Trash2, Plus, GripVertical } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { BLOCK_DEFINITIONS } from '../../config/constants';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import ImageUpload from '../ui/ImageUpload';
import type { Block } from '../../types/database';
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
  LocationMapContent,
  SkillBarsContent,
  ContactFormContent,
  SocialLinksContent,
} from '../../types/blocks';

export default function EditBlockSheet() {
  const { blocks, editingBlockId, editBlock, updateBlock, deleteBlock } = useEditor();
  const block = blocks.find((b) => b.id === editingBlockId);

  if (!block) return null;

  const definition = BLOCK_DEFINITIONS[block.block_type as keyof typeof BLOCK_DEFINITIONS];
  const content = block.content as Record<string, unknown>;
  const isProfileCard = block.block_type === 'profile_card';

  const updateContent = (updates: Record<string, unknown>) => {
    updateBlock(block.id, { content: updates });
  };

  const handleClose = () => {
    editBlock(null);
  };

  const handleDelete = () => {
    if (confirm('Bu bloğu silmek istediğinizden emin misiniz?')) {
      deleteBlock(block.id);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
        onClick={handleClose}
      />
      <div className="fixed inset-x-0 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 bottom-0 z-50 animate-in slide-in-from-bottom duration-300 lg:w-full lg:max-w-2xl">
        <div className="bg-white rounded-t-3xl lg:rounded-3xl lg:mb-8 max-h-[85vh] lg:max-h-[80vh] flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">
              {definition?.label || 'Blok'} Düzenle
            </h2>
            <div className="flex items-center gap-2">
              {!isProfileCard && (
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
            <BlockSpecificFields
              blockType={block.block_type}
              content={content}
              updateContent={updateContent}
              allBlocks={blocks}
            />
          </div>

          <div className="px-5 py-4 border-t border-slate-100">
            <button
              onClick={handleClose}
              className="w-full py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
            >
              Tamam
            </button>
          </div>

          <div className="h-safe-area-inset-bottom bg-white" />
        </div>
      </div>
    </>
  );
}

interface BlockSpecificFieldsProps {
  blockType: string;
  content: Record<string, unknown>;
  updateContent: (updates: Record<string, unknown>) => void;
  allBlocks: Block[];
}

function BlockSpecificFields({ blockType, content, updateContent, allBlocks }: BlockSpecificFieldsProps) {
  switch (blockType) {
    case 'profile_card': {
      const c = content as ProfileCardContent;
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Profil Fotoğrafı
            </label>
            <div className="max-w-xs mx-auto">
              <ImageUpload
                value={c.avatarUrl || ''}
                onChange={(url) => updateContent({ avatarUrl: url })}
                folder="profile"
                aspectRatio="square"
              />
            </div>
          </div>
          <Input
            label="Adınız"
            value={c.name || ''}
            onChange={(e) => updateContent({ name: e.target.value })}
            placeholder="Ahmet Yılmaz"
          />
          <Input
            label="Ünvan / Rol"
            value={c.title || ''}
            onChange={(e) => updateContent({ title: e.target.value })}
            placeholder="Tasarımcı, Geliştirici, vb."
          />
          <Textarea
            label="Hakkınızda"
            value={c.bio || ''}
            onChange={(e) => updateContent({ bio: e.target.value })}
            placeholder="Kendiniz hakkında bilgi verin..."
            rows={3}
          />
        </>
      );
    }

    case 'text': {
      const c = content as TextContent;
      const alignmentLabels = { left: 'Sol', center: 'Orta', right: 'Sağ' };
      return (
        <>
          <Textarea
            label="Metin İçeriği"
            value={c.text || ''}
            onChange={(e) => updateContent({ text: e.target.value })}
            placeholder="Metninizi buraya yazın..."
            rows={5}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Metin Hizalama</label>
            <div className="grid grid-cols-3 gap-2">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => updateContent({ alignment: align })}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    (c.alignment || 'left') === align
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {alignmentLabels[align]}
                </button>
              ))}
            </div>
          </div>
        </>
      );
    }

    case 'link_button': {
      const c = content as LinkButtonContent;
      const styleLabels = { filled: 'Dolu', outline: 'Çerçeveli', ghost: 'Hayalet' };
      return (
        <>
          <Input
            label="Buton Metni"
            value={c.text || ''}
            onChange={(e) => updateContent({ text: e.target.value })}
            placeholder="Web Siteme Git"
          />
          <Input
            label="Bağlantı URL"
            value={c.url || ''}
            onChange={(e) => updateContent({ url: e.target.value })}
            placeholder="https://example.com"
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Buton Stili</label>
            <div className="grid grid-cols-3 gap-2">
              {(['filled', 'outline', 'ghost'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => updateContent({ style })}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    (c.style || 'filled') === style
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {styleLabels[style]}
                </button>
              ))}
            </div>
          </div>
        </>
      );
    }

    case 'menu_item': {
      const c = content as MenuItemContent;
      const existingCategories = Array.from(
        new Set(
          allBlocks
            .filter((b) => b.block_type === 'menu_item')
            .map((b) => (b.content as MenuItemContent)?.category)
            .filter((cat): cat is string => !!cat && cat.trim() !== '')
        )
      );
      return (
        <MenuItemFields
          content={c}
          updateContent={updateContent}
          existingCategories={existingCategories}
        />
      );
    }

    case 'wifi_card': {
      const c = content as WifiCardContent;
      return (
        <>
          <Input
            label="Ağ Adı (SSID)"
            value={c.networkName || ''}
            onChange={(e) => updateContent({ networkName: e.target.value })}
            placeholder="KafeWiFi"
          />
          <Input
            label="Şifre"
            value={c.password || ''}
            onChange={(e) => updateContent({ password: e.target.value })}
            placeholder="WiFi şifresini girin"
          />
          <Select
            label="Güvenlik Türü"
            value={c.securityType || 'WPA2'}
            onChange={(e) => updateContent({ securityType: e.target.value })}
            options={[
              { value: 'WPA2', label: 'WPA2 (En yaygın)' },
              { value: 'WPA', label: 'WPA' },
              { value: 'WEP', label: 'WEP' },
              { value: 'none', label: 'Şifresiz' },
            ]}
          />
        </>
      );
    }

    case 'countdown': {
      const c = content as CountdownContent;
      return (
        <>
          <Input
            label="Başlık"
            value={c.title || ''}
            onChange={(e) => updateContent({ title: e.target.value })}
            placeholder="Etkinliğe kalan süre..."
          />
          <Input
            label="Etkinlik Tarihi ve Saati"
            type="datetime-local"
            value={c.targetDate ? c.targetDate.slice(0, 16) : ''}
            onChange={(e) => updateContent({ targetDate: e.target.value })}
          />
          <Input
            label="Etkinlik Başladıktan Sonraki Mesaj"
            value={c.completedMessage || ''}
            onChange={(e) => updateContent({ completedMessage: e.target.value })}
            placeholder="Etkinlik başladı!"
          />
        </>
      );
    }

    case 'social_links': {
      const c = content as SocialLinksContent;
      const links = c.links || [];
      return (
        <>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Sosyal Bağlantılarınız</label>
            {links.map((link, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                <Select
                  value={link.platform}
                  onChange={(e) => {
                    const newLinks = [...links];
                    newLinks[index] = { ...link, platform: e.target.value };
                    updateContent({ links: newLinks });
                  }}
                  options={[
                    { value: 'instagram', label: 'Instagram' },
                    { value: 'facebook', label: 'Facebook' },
                    { value: 'twitter', label: 'Twitter/X' },
                    { value: 'linkedin', label: 'LinkedIn' },
                    { value: 'youtube', label: 'YouTube' },
                    { value: 'tiktok', label: 'TikTok' },
                    { value: 'spotify', label: 'Spotify' },
                    { value: 'telegram', label: 'Telegram' },
                    { value: 'whatsapp', label: 'WhatsApp' },
                  ]}
                />
                <Input
                  type={link.platform === 'whatsapp' ? 'tel' : 'text'}
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...links];
                    newLinks[index] = { ...link, url: e.target.value };
                    updateContent({ links: newLinks });
                  }}
                  placeholder={link.platform === 'whatsapp' ? '+90 555 123 4567' : 'Profil URL'}
                  className="flex-1"
                />
                <button
                  onClick={() => {
                    const newLinks = links.filter((_, i) => i !== index);
                    updateContent({ links: newLinks });
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => updateContent({ links: [...links, { platform: 'instagram', url: '' }] })}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Sosyal Bağlantı Ekle
            </button>
          </div>
        </>
      );
    }

    case 'contact_form': {
      const c = content as ContactFormContent;
      return (
        <>
          <Input
            label="Form Başlığı"
            value={c.title || ''}
            onChange={(e) => updateContent({ title: e.target.value })}
            placeholder="İletişime Geçin"
          />
          <Input
            label="Buton Metni"
            value={c.submitText || ''}
            onChange={(e) => updateContent({ submitText: e.target.value })}
            placeholder="Mesaj Gönder"
          />
          <Input
            label="Başarı Mesajı"
            value={c.successMessage || ''}
            onChange={(e) => updateContent({ successMessage: e.target.value })}
            placeholder="Mesajınız için teşekkürler!"
          />
        </>
      );
    }

    case 'vcard': {
      const c = content as VCardContent;
      return (
        <>
          <Input
            label="Tam Ad"
            value={c.fullName || ''}
            onChange={(e) => updateContent({ fullName: e.target.value })}
            placeholder="Ahmet Yılmaz"
          />
          <Input
            label="E-posta"
            type="email"
            value={c.email || ''}
            onChange={(e) => updateContent({ email: e.target.value })}
            placeholder="ahmet@example.com"
          />
          <Input
            label="Telefon"
            type="tel"
            value={c.phone || ''}
            onChange={(e) => updateContent({ phone: e.target.value })}
            placeholder="+90 555 123 4567"
          />
          <Input
            label="Şirket"
            value={c.company || ''}
            onChange={(e) => updateContent({ company: e.target.value })}
            placeholder="Şirket Adı"
          />
          <Input
            label="İş Ünvanı"
            value={c.title || ''}
            onChange={(e) => updateContent({ title: e.target.value })}
            placeholder="Pazarlama Müdürü"
          />
          <Input
            label="Web Sitesi"
            value={c.website || ''}
            onChange={(e) => updateContent({ website: e.target.value })}
            placeholder="https://example.com"
          />
        </>
      );
    }

    case 'video': {
      const c = content as VideoContent;
      return (
        <>
          <Input
            label="Video URL"
            value={c.url || ''}
            onChange={(e) => updateContent({ url: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
            helperText="YouTube veya Vimeo bağlantısı yapıştırın"
          />
          <Input
            label="Başlık (İsteğe Bağlı)"
            value={c.title || ''}
            onChange={(e) => updateContent({ title: e.target.value })}
            placeholder="Videom"
          />
        </>
      );
    }

    case 'faq': {
      const c = content as FAQContent;
      const items = c.items || [];
      return (
        <>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Sorular ve Cevaplar</label>
            {items.map((item, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">Soru {index + 1}</span>
                  <button
                    onClick={() => {
                      const newItems = items.filter((_, i) => i !== index);
                      updateContent({ items: newItems });
                    }}
                    className="p-1 text-red-500 hover:bg-red-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  value={item.question}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = { ...item, question: e.target.value };
                    updateContent({ items: newItems });
                  }}
                  placeholder="Sorunuz nedir?"
                />
                <Textarea
                  value={item.answer}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = { ...item, answer: e.target.value };
                    updateContent({ items: newItems });
                  }}
                  placeholder="Cevabı yazın..."
                  rows={2}
                />
              </div>
            ))}
            <button
              onClick={() => updateContent({ items: [...items, { question: '', answer: '' }] })}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Soru Ekle
            </button>
          </div>
        </>
      );
    }

    case 'location_map': {
      const c = content as LocationMapContent;
      return (
        <>
          <Input
            label="Mekan Adı"
            value={c.venueName || ''}
            onChange={(e) => updateContent({ venueName: e.target.value })}
            placeholder="Grand Hotel Balo Salonu"
          />
          <Textarea
            label="Adres"
            value={c.address || ''}
            onChange={(e) => updateContent({ address: e.target.value })}
            placeholder="Atatürk Cad. No:123, İstanbul, Türkiye"
            rows={2}
          />
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <input
              type="checkbox"
              checked={c.showDirectionsButton !== false}
              onChange={(e) => updateContent({ showDirectionsButton: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            <span className="text-sm font-medium text-slate-700">Yol Tarifi Al butonunu göster</span>
          </label>
        </>
      );
    }

    case 'rsvp_form': {
      const c = content as RSVPFormContent;
      return (
        <>
          <Input
            label="Etkinlik Adi"
            value={c.eventName || ''}
            onChange={(e) => updateContent({ eventName: e.target.value })}
            placeholder="Dugun Kutlamasi"
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Maksimum Katilimci Sayisi
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Her davetli en fazla kac kisi olarak katilabilir?
            </p>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => updateContent({ maxGuestCount: num })}
                  className={`w-12 h-10 rounded-lg font-medium transition-all ${
                    (c.maxGuestCount || 4) === num
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Onay Mesaji"
            value={c.confirmationMessage || ''}
            onChange={(e) => updateContent({ confirmationMessage: e.target.value })}
            placeholder="Yanitiniz icin tesekkurler!"
            helperText="Ilk kez kayit yapan kullanicilara gosterilir"
          />
          <Input
            label="Guncelleme Mesaji"
            value={c.updateMessage || ''}
            onChange={(e) => updateContent({ updateMessage: e.target.value })}
            placeholder="Katilim bilgileriniz guncellendi!"
            helperText="Mevcut kaydi guncelleyen kullanicilara gosterilir"
          />
        </>
      );
    }

    case 'divider': {
      const c = content as DividerContent;
      return (
        <>
          <Select
            label="Cizgi Stili"
            value={c.style || 'solid'}
            onChange={(e) => updateContent({ style: e.target.value })}
            options={[
              { value: 'solid', label: 'Duz Cizgi' },
              { value: 'dashed', label: 'Kesik Cizgi' },
              { value: 'dotted', label: 'Noktali Cizgi' },
              { value: 'gradient', label: 'Gradient' },
            ]}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Cizgi Rengi</label>
            <input
              type="color"
              value={c.color || '#E5E7EB'}
              onChange={(e) => updateContent({ color: e.target.value })}
              className="w-full h-10 rounded-lg border border-slate-200"
            />
          </div>
        </>
      );
    }

    case 'social_media': {
      const c = content as SocialMediaContent;
      const links = c.links || [];
      return (
        <>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Sosyal Medya Bağlantıları</label>
            {links.map((link, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                <Select
                  value={link.platform}
                  onChange={(e) => {
                    const newLinks = [...links];
                    newLinks[index] = { ...link, platform: e.target.value };
                    updateContent({ links: newLinks });
                  }}
                  options={[
                    { value: 'instagram', label: 'Instagram' },
                    { value: 'facebook', label: 'Facebook' },
                    { value: 'twitter', label: 'Twitter/X' },
                    { value: 'linkedin', label: 'LinkedIn' },
                    { value: 'youtube', label: 'YouTube' },
                    { value: 'tiktok', label: 'TikTok' },
                    { value: 'spotify', label: 'Spotify' },
                    { value: 'telegram', label: 'Telegram' },
                    { value: 'whatsapp', label: 'WhatsApp' },
                  ]}
                />
                <Input
                  type={link.platform === 'whatsapp' ? 'tel' : 'text'}
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...links];
                    newLinks[index] = { ...link, url: e.target.value };
                    updateContent({ links: newLinks });
                  }}
                  placeholder={link.platform === 'whatsapp' ? '+90 555 123 4567' : 'username'}
                  className="flex-1"
                />
                <button
                  onClick={() => {
                    const newLinks = links.filter((_, i) => i !== index);
                    updateContent({ links: newLinks });
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => updateContent({ links: [...links, { platform: 'instagram', url: '' }] })}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Sosyal Bağlantı Ekle
            </button>
          </div>
        </>
      );
    }

    case 'map': {
      const c = content as MapContent;
      return (
        <>
          <Textarea
            label="Adres"
            value={c.address || ''}
            onChange={(e) => updateContent({ address: e.target.value })}
            placeholder="Atatürk Cad. No:123, İstanbul, Türkiye"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Enlem"
              type="number"
              value={c.lat || ''}
              onChange={(e) => updateContent({ lat: parseFloat(e.target.value) || 0 })}
              placeholder="41.0082"
            />
            <Input
              label="Boylam"
              type="number"
              value={c.lng || ''}
              onChange={(e) => updateContent({ lng: parseFloat(e.target.value) || 0 })}
              placeholder="28.9784"
            />
          </div>
        </>
      );
    }

    case 'image_gallery': {
      const c = content as ImageGalleryContent;
      const images = c.images || [];
      return (
        <>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Galeri Resimleri</label>
            {images.map((img, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">Resim {index + 1}</span>
                  <button
                    onClick={() => {
                      const newImages = images.filter((_, i) => i !== index);
                      updateContent({ images: newImages });
                    }}
                    className="p-1 text-red-500 hover:bg-red-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Resim
                  </label>
                  <div className="max-w-xs mx-auto">
                    <ImageUpload
                      value={img.url}
                      onChange={(url) => {
                        const newImages = [...images];
                        newImages[index] = { ...img, url };
                        updateContent({ images: newImages });
                      }}
                      folder="gallery"
                      aspectRatio="landscape"
                    />
                  </div>
                </div>
                <Input
                  label="Açıklama (İsteğe Bağlı)"
                  value={img.caption || ''}
                  onChange={(e) => {
                    const newImages = [...images];
                    newImages[index] = { ...img, caption: e.target.value };
                    updateContent({ images: newImages });
                  }}
                  placeholder="Resim açıklaması"
                />
              </div>
            ))}
            <button
              onClick={() => updateContent({ images: [...images, { url: '', caption: '' }] })}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Resim Ekle
            </button>
          </div>
          <Select
            label="Düzen Stili"
            value={c.layout || 'grid'}
            onChange={(e) => updateContent({ layout: e.target.value })}
            options={[
              { value: 'grid', label: 'Izgara Düzeni' },
              { value: 'carousel', label: 'Karusel' },
            ]}
          />
        </>
      );
    }

    case 'pdf': {
      const c = content as PDFContent;
      return (
        <>
          <Input
            label="PDF URL"
            value={c.url || ''}
            onChange={(e) => updateContent({ url: e.target.value })}
            placeholder="https://example.com/belge.pdf"
            helperText="PDF dosyanızı yükleyin ve bağlantıyı buraya yapıştırın"
          />
          <Input
            label="Başlık (İsteğe Bağlı)"
            value={c.title || ''}
            onChange={(e) => updateContent({ title: e.target.value })}
            placeholder="Belge Başlığı"
          />
        </>
      );
    }

    case 'google_review': {
      const c = content as GoogleReviewContent;
      return (
        <>
          <Input
            label="Google Place ID"
            value={c.placeId || ''}
            onChange={(e) => updateContent({ placeId: e.target.value })}
            placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
            helperText="Place ID'nizi Google Cloud Console'dan bulabilirsiniz"
          />
          <Input
            label="Buton Metni"
            value={c.buttonText || ''}
            onChange={(e) => updateContent({ buttonText: e.target.value })}
            placeholder="Değerlendirme Bırakın"
          />
        </>
      );
    }

    case 'skill_bars': {
      const c = content as SkillBarsContent;
      const skills = c.skills || [];
      return (
        <>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Yetenekleriniz</label>
            {skills.map((skill, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">Yetenek {index + 1}</span>
                  <button
                    onClick={() => {
                      const newSkills = skills.filter((_, i) => i !== index);
                      updateContent({ skills: newSkills });
                    }}
                    className="p-1 text-red-500 hover:bg-red-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  value={skill.name}
                  onChange={(e) => {
                    const newSkills = [...skills];
                    newSkills[index] = { ...skill, name: e.target.value };
                    updateContent({ skills: newSkills });
                  }}
                  placeholder="JavaScript"
                />
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={skill.level}
                  onChange={(e) => {
                    const newSkills = [...skills];
                    newSkills[index] = { ...skill, level: parseInt(e.target.value) || 0 };
                    updateContent({ skills: newSkills });
                  }}
                  placeholder="80"
                  helperText="Yetenek seviyesi (0-100%)"
                />
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Çubuk Rengi</label>
                  <input
                    type="color"
                    value={skill.color || '#3B82F6'}
                    onChange={(e) => {
                      const newSkills = [...skills];
                      newSkills[index] = { ...skill, color: e.target.value };
                      updateContent({ skills: newSkills });
                    }}
                    className="w-full h-10 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => updateContent({ skills: [...skills, { name: '', level: 50, color: '#3B82F6' }] })}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Yetenek Ekle
            </button>
          </div>
        </>
      );
    }

    default:
      return (
        <div className="text-center py-6">
          <p className="text-slate-500">Bu blok için ayarlar henüz mevcut değil.</p>
        </div>
      );
  }
}

interface MenuItemFieldsProps {
  content: MenuItemContent;
  updateContent: (updates: Record<string, unknown>) => void;
  existingCategories: string[];
}

function MenuItemFields({ content, updateContent, existingCategories }: MenuItemFieldsProps) {
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryValue, setNewCategoryValue] = useState('');

  const handleCategorySelect = (value: string) => {
    if (value === '__new__') {
      setShowNewCategory(true);
      setNewCategoryValue('');
    } else {
      updateContent({ category: value });
      setShowNewCategory(false);
    }
  };

  const handleNewCategoryConfirm = () => {
    if (newCategoryValue.trim()) {
      updateContent({ category: newCategoryValue.trim() });
      setShowNewCategory(false);
      setNewCategoryValue('');
    }
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Kategori (Opsiyonel)
        </label>
        {!showNewCategory ? (
          <div className="space-y-2">
            <select
              value={content.category || ''}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
            >
              <option value="">Kategorisiz</option>
              {existingCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__new__">+ Yeni Kategori Ekle</option>
            </select>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={newCategoryValue}
              onChange={(e) => setNewCategoryValue(e.target.value)}
              placeholder="Yeni kategori adı..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleNewCategoryConfirm();
                }
              }}
            />
            <button
              type="button"
              onClick={handleNewCategoryConfirm}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shrink-0"
            >
              Ekle
            </button>
            <button
              type="button"
              onClick={() => setShowNewCategory(false)}
              className="px-3 py-2 text-slate-500 hover:text-slate-700 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      <Input
        label="Ürün Adı"
        value={content.name || ''}
        onChange={(e) => updateContent({ name: e.target.value })}
        placeholder="Izgara Somon"
      />
      <Textarea
        label="Açıklama"
        value={content.description || ''}
        onChange={(e) => updateContent({ description: e.target.value })}
        placeholder="Taze Atlantik somonu, otlarla..."
        rows={2}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Fiyat"
          type="number"
          value={content.price || ''}
          onChange={(e) => updateContent({ price: parseFloat(e.target.value) || 0 })}
          placeholder="25.99"
        />
        <Input
          label="Para Birimi"
          value={content.currency || '₺'}
          onChange={(e) => updateContent({ currency: e.target.value })}
          placeholder="₺"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Ürün Resmi (İsteğe Bağlı)
        </label>
        <div className="max-w-xs mx-auto">
          <ImageUpload
            value={content.imageUrl || ''}
            onChange={(url) => updateContent({ imageUrl: url })}
            folder="menu"
            aspectRatio="square"
          />
        </div>
      </div>
      <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
        <input
          type="checkbox"
          checked={content.isAvailable !== false}
          onChange={(e) => updateContent({ isAvailable: e.target.checked })}
          className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
        />
        <span className="text-sm font-medium text-slate-700">Ürün mevcut</span>
      </label>
    </>
  );
}
