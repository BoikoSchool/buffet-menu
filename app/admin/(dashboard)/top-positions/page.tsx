"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SortableList } from "@/components/admin/SortableList";
import { useToast } from "@/components/admin/Toast";

interface TopDish {
  id: string;
  name: string;
  price: number;
  photoUrl: string | null;
  topOrder: number;
  category: { name: string };
}

// Мінімальна картка-превью у стилі екрану-плеєра
function TopPreviewCard({ dish }: { dish: TopDish }) {
  return (
    <div
      className="relative rounded-xl overflow-hidden flex flex-col items-center justify-between p-4 bg-[#F8C300]"
      style={{ width: 180, minHeight: 240 }}
    >
      {/* L-куточки */}
      {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map((pos) => (
        <div
          key={pos}
          className="absolute"
          style={{
            top: pos.includes("top") ? 8 : undefined,
            bottom: pos.includes("bottom") ? 8 : undefined,
            left: pos.includes("left") ? 8 : undefined,
            right: pos.includes("right") ? 8 : undefined,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderColor: "#1A1A1A",
              borderTopWidth: pos.includes("top") ? 3 : 0,
              borderBottomWidth: pos.includes("bottom") ? 3 : 0,
              borderLeftWidth: pos.includes("left") ? 3 : 0,
              borderRightWidth: pos.includes("right") ? 3 : 0,
              borderStyle: "solid",
            }}
          />
        </div>
      ))}

      {/* Фото */}
      <div className="w-24 h-24 flex items-center justify-center mt-4">
        {dish.photoUrl ? (
          <Image
            src={dish.photoUrl}
            alt={dish.name}
            width={96}
            height={96}
            className="object-contain"
            style={{ mixBlendMode: "multiply" }}
          />
        ) : (
          <div className="w-20 h-20 bg-[#1A1A1A]/10 rounded-lg flex items-center justify-center text-2xl">
            🍽
          </div>
        )}
      </div>

      {/* Назва */}
      <p className="text-center font-black text-[#1A1A1A] text-sm uppercase leading-tight mt-2 px-2">
        {dish.name}
      </p>

      {/* Ціна */}
      <div className="w-14 h-14 rounded-full bg-[#DC1F26] flex flex-col items-center justify-center mt-2 mb-2">
        <span className="text-white font-bold text-lg leading-none">{dish.price}</span>
        <span className="text-white text-xs leading-none">грн</span>
      </div>
    </div>
  );
}

export default function TopPositionsPage() {
  const [dishes, setDishes] = useState<TopDish[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchDishes = useCallback(async () => {
    try {
      const res = await fetch("/api/dishes?topOnly=true");
      const all = await res.json();
      const top = all
        .filter((d: TopDish & { isTopPosition: boolean }) => d.isTopPosition)
        .sort((a: TopDish, b: TopDish) => a.topOrder - b.topOrder);
      setDishes(top);
    } catch {
      showToast("Помилка завантаження", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchDishes(); }, [fetchDishes]);

  async function handleReorder(newOrder: TopDish[]) {
    setDishes(newOrder);
    try {
      await fetch("/api/dishes/reorder-top", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder.map((d, i) => ({ id: d.id, topOrder: i + 1 }))),
      });
      showToast("Порядок збережено");
    } catch {
      showToast("Помилка збереження порядку", "error");
      fetchDishes();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#1A1A1A] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Топ-позиції</h1>
          <p className="text-sm text-gray-500 mt-1">
            Показуються на жовтих слайдах · по 3 в ряд · перетягуйте для зміни порядку
          </p>
        </div>
        <Link href="/admin/dishes">
          <Button variant="secondary">Перейти до страв</Button>
        </Link>
      </div>

      {dishes.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">Немає топ-позицій</p>
          <p className="text-sm mt-1">
            Позначте страви як «Топ-позиція» на сторінці Страви
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <SortableList
            items={dishes}
            onReorder={handleReorder}
            renderItem={(dish) => (
              <div className="flex items-center gap-4 pl-10">
                <TopPreviewCard dish={dish} />
                <div>
                  <p className="font-semibold text-[#1A1A1A]">{dish.name}</p>
                  <p className="text-sm text-gray-500">{dish.price} ₴</p>
                  <p className="text-xs text-gray-400 mt-1">{dish.category.name}</p>
                </div>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}
