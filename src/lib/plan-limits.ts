/**
 * Free plan içerik limitleri.
 * isPremium === true olan projelerde bu limitler geçerli değildir.
 */

export const FREE_LIMITS = {
  restaurant_menu: {
    maxCategories: 3,
    maxItemsPerCategory: 10,
    maxTotalItems: 10,
  },
  bio_link: {
    maxLinks: 5,
  },
  brand_bio: {
    maxLinks: 3,
  },
  google_review: {}, // limit yok
  event_invitation: {}, // limit yok
  campaign_link: {}, // limit yok
} as const;

/**
 * İçerik objesindeki değerleri free plan limitiyle kırpar.
 * isPremium projeler için kırpma yapılmaz, içerik aynen döner.
 */
export function applyFreeLimits(
  projectType: string,
  content: unknown,
  isPremium: boolean
): { content: unknown; truncated: boolean } {
  if (isPremium) return { content, truncated: false };

  const limits = FREE_LIMITS[projectType as keyof typeof FREE_LIMITS];
  if (!limits || Object.keys(limits).length === 0) {
    return { content, truncated: false };
  }

  const data = content as Record<string, unknown>;
  let truncated = false;

  if (projectType === "restaurant_menu") {
    const l = FREE_LIMITS.restaurant_menu;
    const categories = (data.categories as unknown[]) ?? [];
    let totalItems = 0;
    const clampedCats = categories.slice(0, l.maxCategories).map((cat) => {
      const c = cat as Record<string, unknown>;
      const items = (c.items as unknown[]) ?? [];
      const remaining = l.maxTotalItems - totalItems;
      const clampedItems = items.slice(0, Math.min(l.maxItemsPerCategory, remaining));
      totalItems += clampedItems.length;
      if (clampedItems.length < items.length) truncated = true;
      return { ...c, items: clampedItems };
    });
    if (clampedCats.length < categories.length) truncated = true;
    return { content: { ...data, categories: clampedCats }, truncated };
  }

  if (projectType === "bio_link") {
    const l = FREE_LIMITS.bio_link;
    const links = (data.links as unknown[]) ?? [];
    if (links.length > l.maxLinks) truncated = true;
    return { content: { ...data, links: links.slice(0, l.maxLinks) }, truncated };
  }

  if (projectType === "brand_bio") {
    const l = FREE_LIMITS.brand_bio;
    const links = (data.links as unknown[]) ?? [];
    if (links.length > l.maxLinks) truncated = true;
    return { content: { ...data, links: links.slice(0, l.maxLinks) }, truncated };
  }

  return { content, truncated };
}

/**
 * İçerik objesini validate ederek kaç limit aşımı var döner.
 * Save endpoint'inde uyarı vermek için kullanılır (engellemez, sadece bildirir).
 */
export function checkFreeLimitWarnings(
  projectType: string,
  content: unknown,
  isPremium: boolean
): string[] {
  if (isPremium) return [];

  const warnings: string[] = [];
  const data = content as Record<string, unknown>;
  const limits = FREE_LIMITS[projectType as keyof typeof FREE_LIMITS];
  if (!limits) return [];

  if (projectType === "restaurant_menu") {
    const l = FREE_LIMITS.restaurant_menu;
    const cats = (data.categories as unknown[]) ?? [];
    if (cats.length > l.maxCategories) {
      warnings.push(`Free planda en fazla ${l.maxCategories} kategori olabilir. Fazlası yayında gösterilmez.`);
    }
    const totalItems = cats.reduce((sum: number, c) => {
      return sum + ((c as Record<string, unknown[]>).items?.length ?? 0);
    }, 0);
    if (totalItems > l.maxTotalItems) {
      warnings.push(`Free planda en fazla ${l.maxTotalItems} ürün gösterilir.`);
    }
  }

  if (projectType === "bio_link") {
    const l = FREE_LIMITS.bio_link;
    const links = (data.links as unknown[]) ?? [];
    if (links.length > l.maxLinks) {
      warnings.push(`Free planda en fazla ${l.maxLinks} link gösterilir. Fazlası yayında gösterilmez.`);
    }
  }

  if (projectType === "brand_bio") {
    const l = FREE_LIMITS.brand_bio;
    const links = (data.links as unknown[]) ?? [];
    if (links.length > l.maxLinks) {
      warnings.push(`Free planda en fazla ${l.maxLinks} link gösterilir.`);
    }
  }

  return warnings;
}
