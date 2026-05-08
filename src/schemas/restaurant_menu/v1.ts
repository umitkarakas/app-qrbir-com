import { z } from "zod";

export const RestaurantMenuItemV1 = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Ürün adı zorunlu").max(100),
  description: z.string().max(500).optional().default(""),
  price: z.number().nonnegative().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const RestaurantMenuCategoryV1 = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Kategori adı zorunlu").max(80),
  items: z.array(RestaurantMenuItemV1).default([]),
});

export const RestaurantMenuV1 = z.object({
  restaurant: z.object({
    name: z.string().min(1, "Restoran adı zorunlu").max(120),
    phone: z.string().max(30).optional().default(""),
    address: z.string().max(300).optional().default(""),
    instagram: z.string().max(80).optional().default(""),
    logoUrl: z.string().url().optional().or(z.literal("")),
  }),
  currency: z.enum(["TRY", "USD", "EUR"]).default("TRY"),
  categories: z.array(RestaurantMenuCategoryV1).default([]),
});

export type RestaurantMenuV1Type = z.infer<typeof RestaurantMenuV1>;

export const RESTAURANT_MENU_DEFAULT_V1: RestaurantMenuV1Type = {
  restaurant: {
    name: "",
    phone: "",
    address: "",
    instagram: "",
    logoUrl: "",
  },
  currency: "TRY",
  categories: [],
};
