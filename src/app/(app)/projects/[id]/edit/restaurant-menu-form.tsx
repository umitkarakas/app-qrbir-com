"use client";

import { useState } from "react";
import { Field, FormSection, SaveBar, inputCls, useSaver } from "./_form-shell";
import type { RestaurantMenuV1Type } from "@/schemas/restaurant_menu/v1";

type Category = RestaurantMenuV1Type["categories"][number];
type Item = Category["items"][number];

const CURRENCY_LABELS: Record<RestaurantMenuV1Type["currency"], string> = {
  TRY: "₺ TL",
  USD: "$ USD",
  EUR: "€ EUR",
};

export default function RestaurantMenuForm({
  projectId,
  initial,
}: {
  projectId: number;
  initial: RestaurantMenuV1Type;
}) {
  const [c, setC] = useState<RestaurantMenuV1Type>(initial);
  const { saving, error, message, save } = useSaver(projectId);

  // ---- Restaurant alanları ----
  function setRestaurant<K extends keyof RestaurantMenuV1Type["restaurant"]>(
    k: K,
    v: RestaurantMenuV1Type["restaurant"][K]
  ) {
    setC({ ...c, restaurant: { ...c.restaurant, [k]: v } });
  }

  // ---- Kategori işlemleri ----
  function addCategory() {
    setC({
      ...c,
      categories: [
        ...c.categories,
        { id: crypto.randomUUID(), name: "", items: [] },
      ],
    });
  }

  function updateCategory(idx: number, patch: Partial<Category>) {
    setC({
      ...c,
      categories: c.categories.map((cat, i) =>
        i === idx ? { ...cat, ...patch } : cat
      ),
    });
  }

  function removeCategory(idx: number) {
    if (!confirm("Bu kategoriyi tüm ürünleriyle silmek istediğinize emin misiniz?")) return;
    setC({ ...c, categories: c.categories.filter((_, i) => i !== idx) });
  }

  // ---- Ürün işlemleri ----
  function addItem(catIdx: number) {
    const newItem: Item = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      price: undefined,
      imageUrl: "",
    };
    updateCategory(catIdx, {
      items: [...c.categories[catIdx].items, newItem],
    });
  }

  function updateItem(catIdx: number, itemIdx: number, patch: Partial<Item>) {
    const cat = c.categories[catIdx];
    updateCategory(catIdx, {
      items: cat.items.map((it, i) => (i === itemIdx ? { ...it, ...patch } : it)),
    });
  }

  function removeItem(catIdx: number, itemIdx: number) {
    const cat = c.categories[catIdx];
    updateCategory(catIdx, {
      items: cat.items.filter((_, i) => i !== itemIdx),
    });
  }

  return (
    <>
      <FormSection title="Restoran Bilgileri">
        <Field label="Restoran adı *">
          <input
            className={inputCls}
            value={c.restaurant.name}
            onChange={(e) => setRestaurant("name", e.target.value)}
            maxLength={120}
            placeholder="Lezzet Durağı"
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Telefon">
            <input
              className={inputCls}
              value={c.restaurant.phone ?? ""}
              onChange={(e) => setRestaurant("phone", e.target.value)}
            />
          </Field>
          <Field label="Instagram">
            <input
              className={inputCls}
              value={c.restaurant.instagram ?? ""}
              onChange={(e) => setRestaurant("instagram", e.target.value)}
              placeholder="@lezzetduragi"
            />
          </Field>
        </div>
        <Field label="Adres">
          <input
            className={inputCls}
            value={c.restaurant.address ?? ""}
            onChange={(e) => setRestaurant("address", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Logo URL">
            <input
              className={inputCls}
              type="url"
              value={c.restaurant.logoUrl ?? ""}
              onChange={(e) => setRestaurant("logoUrl", e.target.value)}
              placeholder="https://…"
            />
          </Field>
          <Field label="Para birimi">
            <select
              className={inputCls}
              value={c.currency}
              onChange={(e) =>
                setC({
                  ...c,
                  currency: e.target.value as RestaurantMenuV1Type["currency"],
                })
              }
            >
              {Object.entries(CURRENCY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Menü"
        description="Kategoriler ve ürünler"
      >
        {c.categories.length === 0 && (
          <p className="text-xs text-gray-400">Henüz kategori eklenmedi.</p>
        )}

        {c.categories.map((cat, catIdx) => (
          <div
            key={cat.id}
            className="border border-gray-200 rounded-lg p-3 space-y-3"
          >
            <div className="flex gap-2 items-center">
              <input
                className={`${inputCls} font-medium`}
                placeholder="Kategori adı (Başlangıçlar, Ana Yemekler…)"
                value={cat.name}
                onChange={(e) =>
                  updateCategory(catIdx, { name: e.target.value })
                }
                maxLength={80}
              />
              <button
                type="button"
                onClick={() => removeCategory(catIdx)}
                className="text-red-500 hover:text-red-700 text-sm shrink-0 px-2"
              >
                Kategori sil
              </button>
            </div>

            <div className="space-y-2 pl-3 border-l-2 border-gray-100">
              {cat.items.map((item, itemIdx) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-lg p-2 space-y-1"
                >
                  <div className="flex gap-2">
                    <input
                      className={inputCls}
                      placeholder="Ürün adı"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(catIdx, itemIdx, { name: e.target.value })
                      }
                    />
                    <input
                      className={`${inputCls} w-28`}
                      type="number"
                      step="0.01"
                      placeholder="Fiyat"
                      value={item.price ?? ""}
                      onChange={(e) =>
                        updateItem(catIdx, itemIdx, {
                          price:
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value),
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(catIdx, itemIdx)}
                      className="text-red-500 hover:text-red-700 text-sm shrink-0 px-2"
                    >
                      ×
                    </button>
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Açıklama (opsiyonel)"
                    value={item.description ?? ""}
                    onChange={(e) =>
                      updateItem(catIdx, itemIdx, {
                        description: e.target.value,
                      })
                    }
                    maxLength={500}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem(catIdx)}
                className="text-xs text-blue-600 hover:underline"
              >
                + Ürün ekle
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addCategory}
          className="text-sm text-blue-600 hover:underline"
        >
          + Kategori ekle
        </button>
      </FormSection>

      <SaveBar
        saving={saving}
        error={error}
        message={message}
        onSave={() => save(c)}
      />
    </>
  );
}
