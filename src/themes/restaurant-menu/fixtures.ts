import type { RestaurantMenuV1Type } from "@/schemas/restaurant_menu/v1";

export const RESTAURANT_MENU_DEMO: RestaurantMenuV1Type = {
  restaurant: {
    name: "Sakib's Bakery",
    phone: "+90 555 000 00 00",
    address: "Kadıköy, İstanbul",
    instagram: "sakibsbakery",
    logoUrl: "",
  },
  currency: "TRY",
  categories: [
    {
      id: "cat-1",
      name: "Kurabiyeler",
      items: [
        {
          id: "item-1",
          name: "Çikolatalı Chip",
          description: "Bol çikolata parçacıklı ev yapımı kurabiye",
          price: 120,
          imageUrl: "",
        },
        {
          id: "item-2",
          name: "Yulaf & Üzüm",
          description: "Sağlıklı yulaf ezmeli kurabiye",
          price: 95,
          imageUrl: "",
        },
        {
          id: "item-3",
          name: "Fıstık Ezmeli",
          description: "Bol fıstık ezmeli yumuşak kurabiye",
          price: 110,
          imageUrl: "",
        },
        {
          id: "item-4",
          name: "Vanilya Sablé",
          description: "Fransız usulü vanilya sablé",
          price: 130,
          imageUrl: "",
        },
      ],
    },
    {
      id: "cat-2",
      name: "Fırsatlar",
      items: [
        {
          id: "offer-1",
          name: "Çift Çikolata",
          description: "Özel indirimli çift çikolatalı kurabiye",
          price: 75,
          imageUrl: "",
        },
        {
          id: "offer-2",
          name: "Karma Kutu (6'lı)",
          description: "6 farklı kurabiyeden oluşan karma kutu",
          price: 380,
          imageUrl: "",
        },
      ],
    },
  ],
};
