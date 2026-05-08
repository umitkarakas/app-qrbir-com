/**
 * Migration zinciri: v1 itibariyle başka versiyon yok.
 * Yeni versiyon eklendiğinde:
 *   export function migrateV1ToV2(input: V1Type): V2Type { ... }
 * Migration fonksiyonu veri kaybetmemeli.
 */

export const migrations: Record<number, (input: unknown) => unknown> = {
  // 1: (input) => migrateV1ToV2(input as RestaurantMenuV1Type),
};
