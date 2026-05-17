"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DishForm } from "@/components/admin/DishForm";
import { SortableList } from "@/components/admin/SortableList";
import { useToast } from "@/components/admin/Toast";

interface Category {
  id: string;
  name: string;
}

interface Dish {
  id: string;
  name: string;
  price: number;
  photoUrl: string | null;
  isTopPosition: boolean;
  isActive: boolean;
  order: number;
  topOrder: number;
  categoryId: string;
  category: { id: string; name: string };
}

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editDish, setEditDish] = useState<Dish | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showToast } = useToast();

  const fetchAll = useCallback(async () => {
    try {
      const [dishRes, catRes] = await Promise.all([
        fetch("/api/dishes"),
        fetch("/api/categories"),
      ]);
      const [dishData, catData] = await Promise.all([dishRes.json(), catRes.json()]);
      setDishes(dishData);
      setCategories(catData);
    } catch {
      showToast("Помилка завантаження даних", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Фільтрація та пошук (клієнтська сторона)
  const filteredDishes = dishes.filter((d) => {
    const matchCat = !filterCategory || d.categoryId === filterCategory;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Групування по категоріях
  const grouped = categories
    .filter((cat) => !filterCategory || cat.id === filterCategory)
    .map((cat) => ({
      category: cat,
      dishes: filteredDishes
        .filter((d) => d.categoryId === cat.id)
        .sort((a, b) => a.order - b.order),
    }))
    .filter((g) => g.dishes.length > 0);

  async function handleToggleActive(dish: Dish) {
    const newValue = !dish.isActive;
    setDishes((prev) =>
      prev.map((d) => (d.id === dish.id ? { ...d, isActive: newValue } : d))
    );
    const res = await fetch(`/api/dishes/${dish.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: newValue }),
    });
    if (!res.ok) {
      showToast("Помилка оновлення", "error");
      setDishes((prev) =>
        prev.map((d) => (d.id === dish.id ? { ...d, isActive: dish.isActive } : d))
      );
    }
  }

  async function handleReorderInCategory(categoryId: string, newOrder: Dish[]) {
    setDishes((prev) => {
      const others = prev.filter((d) => d.categoryId !== categoryId);
      const reordered = newOrder.map((d, i) => ({ ...d, order: i + 1 }));
      return [...others, ...reordered];
    });
    try {
      await fetch("/api/dishes/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder.map((d, i) => ({ id: d.id, order: i + 1 }))),
      });
    } catch {
      showToast("Помилка збереження порядку", "error");
      fetchAll();
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/dishes/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error, "error");
        return;
      }
      showToast("Страву видалено");
      setDeleteTarget(null);
      fetchAll();
    } catch {
      showToast("Помилка видалення", "error");
    } finally {
      setDeleteLoading(false);
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
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Страви</h1>
          <p className="text-sm text-gray-500 mt-1">{dishes.length} страв загалом</p>
        </div>
        <Button onClick={() => { setEditDish(null); setFormOpen(true); }}>
          + Додати страву
        </Button>
      </div>

      {/* Фільтри */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
        >
          <option value="">Всі категорії</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Пошук за назвою..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Список по категоріях */}
      {grouped.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">Нічого не знайдено</p>
          <p className="text-sm mt-1">Спробуйте змінити фільтри або додайте страви</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map(({ category, dishes: catDishes }) => (
            <div key={category.id}>
              <h2 className="text-lg font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
                {category.name}
                <span className="text-sm text-gray-400 font-normal">({catDishes.length})</span>
              </h2>
              <SortableList
                items={catDishes}
                onReorder={(newOrder) => handleReorderInCategory(category.id, newOrder)}
                renderItem={(dish) => (
                  <div className="flex items-center gap-3 pl-10 pr-4 py-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    {/* Мініатюра */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {dish.photoUrl ? (
                        <Image
                          src={dish.photoUrl}
                          alt={dish.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Назва та бейджі */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-[#1A1A1A] truncate">{dish.name}</p>
                        {dish.isTopPosition && (
                          <span className="text-xs bg-[#F8C300] text-[#1A1A1A] font-semibold px-2 py-0.5 rounded-full shrink-0">
                            ТОП
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{dish.price} ₴</p>
                    </div>

                    {/* Toggle активності */}
                    <Toggle
                      checked={dish.isActive}
                      onChange={() => handleToggleActive(dish)}
                    />

                    {/* Кнопки дій */}
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => { setEditDish(dish); setFormOpen(true); }}
                        aria-label="Редагувати"
                        className="p-1.5 text-gray-400 hover:text-[#1A1A1A] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(dish)}
                        aria-label="Видалити"
                        className="p-1.5 text-gray-400 hover:text-[#DC1F26] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              />
            </div>
          ))}
        </div>
      )}

      {/* Форма страви */}
      <DishForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={fetchAll}
        categories={categories}
        initialData={editDish ? {
          id: editDish.id,
          name: editDish.name,
          price: editDish.price,
          categoryId: editDish.categoryId,
          photoUrl: editDish.photoUrl,
          isTopPosition: editDish.isTopPosition,
          isActive: editDish.isActive,
        } : undefined}
      />

      {/* Confirm видалення */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Видалити страву?"
        message={deleteTarget ? `Ви впевнені, що хочете видалити «${deleteTarget.name}»?` : ""}
        loading={deleteLoading}
      />
    </div>
  );
}
