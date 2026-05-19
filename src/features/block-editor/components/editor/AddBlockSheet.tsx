import { useEffect, useState, useMemo } from 'react';
import { X, Search, Sparkles, LayoutGrid, UtensilsCrossed, Calendar } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { BLOCK_DEFINITIONS } from '../../config/constants';
import { isBlockTypeRegistered, getBlockDefaultContent } from '../../config/blockRegistry';
import type { BlockType } from '../../types/blocks';

interface AddBlockSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BlockTypeData {
  block_type: string;
  name: string;
  description: string;
  icon: string;
  category: 'common' | 'menu' | 'invitation' | 'bio_link';
  is_pro: boolean;
  allowed_site_types: string[];
}

interface ApiBlockTypeData {
  blockType: string;
  name: string;
  description: string | null;
  icon: string;
  category: 'common' | 'menu' | 'invitation' | 'bio_link';
  isPro: boolean;
  allowedSiteTypes: string[];
}

const CATEGORY_INFO: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  recommended: { label: 'Hızlı Ekle', icon: Sparkles },
  common: { label: 'Temel', icon: LayoutGrid },
  menu: { label: 'Restoran', icon: UtensilsCrossed },
  invitation: { label: 'Etkinlik', icon: Calendar },
};

export default function AddBlockSheet({ isOpen, onClose }: AddBlockSheetProps) {
  const { site, blocks, addBlock } = useEditor();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('recommended');
  const [adminBlockTypes, setAdminBlockTypes] = useState<BlockTypeData[] | null>(null);

  const hasProfileCard = blocks.some(b => b.block_type === 'profile_card');

  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;
    const params = new URLSearchParams();
    if (site?.site_type) params.set('siteType', site.site_type);

    fetch(`/api/block-types?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ApiBlockTypeData[] | null) => {
        if (ignore || !Array.isArray(data)) return;
        setAdminBlockTypes(
          data
            .filter((bt) => isBlockTypeRegistered(bt.blockType))
            .map((bt) => ({
              block_type: bt.blockType,
              name: bt.name,
              description: bt.description ?? '',
              icon: bt.icon,
              category: bt.category,
              is_pro: bt.isPro,
              allowed_site_types: bt.allowedSiteTypes,
            })),
        );
      })
      .catch(() => {
        if (!ignore) setAdminBlockTypes(null);
      });

    return () => {
      ignore = true;
    };
  }, [isOpen, site?.site_type]);

  const fallbackBlockTypes = useMemo<BlockTypeData[]>(
    () =>
      Object.entries(BLOCK_DEFINITIONS).map(([type, definition]) => ({
        block_type: type,
        name: definition.label,
        description: definition.userDescription,
        icon: definition.icon,
        category: definition.category,
        is_pro: false,
        allowed_site_types: definition.siteTypes ?? [],
      })),
    []
  );

  const blockTypes = adminBlockTypes?.length ? adminBlockTypes : fallbackBlockTypes;

  const { recommendedBlocks, categorizedBlocks } = useMemo(() => {
    const categories: Record<string, { type: BlockType; label: string; icon: string; description: string; isPro: boolean }[]> = {
      common: [],
      menu: [],
      invitation: [],
      bio_link: [],
    };

    const recommended: { type: BlockType; label: string; icon: string; description: string; isPro: boolean }[] = [];

    const availableBlocks = blockTypes.filter(
      (bt) => !bt.allowed_site_types.length || (site && bt.allowed_site_types.includes(site.site_type))
    );

    availableBlocks.forEach((bt) => {
      const blockInfo = {
        type: bt.block_type as BlockType,
        label: bt.name,
        icon: bt.icon,
        description: bt.description || '',
        isPro: bt.is_pro,
      };
      if (categories[bt.category]) {
        categories[bt.category].push(blockInfo);
      }
    });

    const recommendedTypes: Record<string, string[]> = {
      digital_menu: ['profile_card', 'menu_item', 'wifi_card', 'google_review', 'text'],
      restaurant_menu: ['profile_card', 'menu_item', 'wifi_card', 'google_review', 'text'],
      google_review: ['profile_card', 'menu_item', 'wifi_card', 'google_review', 'text'],
      digital_invitation: ['countdown', 'location_map', 'rsvp_form', 'text'],
      event_invitation: ['countdown', 'location_map', 'rsvp_form', 'text'],
      bio_link: ['profile_card', 'link_button', 'social_links', 'contact_form'],
      brand_bio: ['profile_card', 'link_button', 'social_links', 'skill_bars'],
      campaign_link: ['profile_card', 'link_button', 'text'],
    };

    const siteTypeRecommended = recommendedTypes[site?.site_type || ''] || [];

    siteTypeRecommended.forEach((type) => {
      const blockType = availableBlocks.find((bt) => bt.block_type === type);
      if (blockType) {
        recommended.push({
          type: blockType.block_type as BlockType,
          label: blockType.name,
          icon: blockType.icon,
          description: blockType.description || '',
          isPro: blockType.is_pro,
        });
      }
    });

    return {
      recommendedBlocks: recommended,
      categorizedBlocks: Object.entries(categories).filter(([, blocks]) => blocks.length > 0),
    };
  }, [site, blockTypes]);

  const filteredBlocks = useMemo(() => {
    if (!search.trim()) return null;
    const query = search.toLowerCase();
    const results: { type: BlockType; label: string; icon: string; description: string; isPro: boolean }[] = [];

    const availableBlocks = blockTypes.filter(
      (bt) => !bt.allowed_site_types.length || (site && bt.allowed_site_types.includes(site.site_type))
    );

    availableBlocks.forEach((bt) => {
      if (
        bt.name.toLowerCase().includes(query) ||
        bt.description?.toLowerCase().includes(query) ||
        bt.block_type.toLowerCase().includes(query)
      ) {
        results.push({
          type: bt.block_type as BlockType,
          label: bt.name,
          icon: bt.icon,
          description: bt.description || '',
          isPro: bt.is_pro,
        });
      }
    });

    return results;
  }, [search, site, blockTypes]);

  const handleAddBlock = (type: BlockType) => {
    if (type === 'profile_card' && hasProfileCard) {
      alert('Her site için yalnızca bir Profil Kartı ekleyebilirsiniz.');
      return;
    }
    addBlock(type);
    onClose();
    setSearch('');
    setActiveCategory('recommended');
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200" onClick={onClose} />
      <div className="fixed inset-x-0 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 bottom-0 z-50 animate-in slide-in-from-bottom duration-300 lg:w-full lg:max-w-2xl">
        <div className="bg-white rounded-t-3xl lg:rounded-3xl lg:mb-8 max-h-[85vh] lg:max-h-[80vh] flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Blok Ekle</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 py-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Blok ara..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-0 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto overscroll-contain ${!search ? 'pb-20' : ''}`}>
            {filteredBlocks ? (
              <div className="p-5">
                {filteredBlocks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">{`"${search}" için blok bulunamadı`}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredBlocks.map((block) => (
                      <BlockOption key={block.type} block={block} onSelect={handleAddBlock} getIcon={getIcon} disabled={block.type === 'profile_card' && hasProfileCard} />
                    ))}
                  </div>
                )}
              </div>
            ) : activeCategory === 'recommended' ? (
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  {recommendedBlocks.map((block) => (
                    <BlockOption key={block.type} block={block} onSelect={handleAddBlock} getIcon={getIcon} disabled={block.type === 'profile_card' && hasProfileCard} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  {categorizedBlocks
                    .find(([cat]) => cat === activeCategory)?.[1]
                    .map((block) => (
                      <BlockOption key={block.type} block={block} onSelect={handleAddBlock} getIcon={getIcon} disabled={block.type === 'profile_card' && hasProfileCard} />
                    ))}
                </div>
              </div>
            )}
          </div>

          {!search && (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200">
              <div className="grid grid-cols-4 gap-1 p-2">
                <button
                  onClick={() => {
                    setActiveCategory('recommended');
                    setSearch('');
                  }}
                  className={`flex flex-col items-center py-3 px-2 rounded-lg transition-colors ${
                    activeCategory === 'recommended'
                      ? 'bg-amber-50 text-amber-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{CATEGORY_INFO.recommended.label}</span>
                </button>
                {categorizedBlocks.map(([category]) => {
                  const CategoryIcon = CATEGORY_INFO[category]?.icon;
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setActiveCategory(category);
                        setSearch('');
                      }}
                      className={`flex flex-col items-center py-3 px-2 rounded-lg transition-colors ${
                        activeCategory === category
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {CategoryIcon && <CategoryIcon className="w-5 h-5 mb-1" />}
                      <span className="text-xs font-medium">{CATEGORY_INFO[category]?.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="h-safe-area-inset-bottom bg-white" />
        </div>
      </div>
    </>
  );
}

interface BlockOptionProps {
  block: { type: BlockType; label: string; icon: string; description: string; isPro?: boolean };
  onSelect: (type: BlockType) => void;
  getIcon: (iconName: string) => React.ReactNode;
  disabled?: boolean;
}

function BlockOption({ block, onSelect, getIcon, disabled }: BlockOptionProps) {
  return (
    <button
      onClick={() => !disabled && onSelect(block.type)}
      disabled={disabled}
      className={`relative flex flex-col items-center p-3 rounded-xl transition-colors text-center ${
        disabled
          ? 'bg-slate-100 opacity-50 cursor-not-allowed'
          : 'bg-slate-50 hover:bg-slate-100'
      }`}
    >
      {block.isPro && !disabled && (
        <div className="absolute top-1.5 right-1.5 px-1 py-0.5 bg-amber-500 text-white text-[10px] font-semibold rounded">
          PRO
        </div>
      )}
      <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mb-1.5 ${
        disabled ? 'text-slate-400' : 'text-slate-600'
      }`}>
        {getIcon(block.icon)}
      </div>
      <p className={`font-medium text-xs ${disabled ? 'text-slate-500' : 'text-slate-900'}`}>
        {block.label}
      </p>
      {block.description && (
        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
          {disabled ? 'Zaten eklendi' : block.description}
        </p>
      )}
    </button>
  );
}
