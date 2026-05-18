"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SortableList } from "@/components/admin/SortableList";
import { useToast } from "@/components/admin/Toast";

type ColumnPosition = "FULL" | "LEFT" | "RIGHT";

interface Category {
  id: string;
  name: string;
  order: number;
  slideGroup: number;
  columnPosition: ColumnPosition;
  _count: { dishes: number };
}

const COLUMN_LABELS: Record<ColumnPosition, string> = {
  FULL: "Повна ширина",
  LEFT: "Ліва колонка",
  RIGHT: "Права колонка",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlideGroup, setFormSlideGroup] = useState(1);
  const [formColumnPosition, setFormColumnPosition] = useState<ColumnPosition>("FULL");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showToast } = useToast();

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch {
      showToast("Помилка завантаження категорій", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  function openAdd() {
    setEditCategory(null);
    setFormName("");
    setFormSlideGroup(1);
    setFormColumnPosition("FULL");
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditCategory(cat);
    setFormName(cat.name);
    setFormSlideGroup(cat.slideGroup);
    setFormColumnPosition(cat.columnPosition);
    setFormError("");
    setModalOpen(true);
  }

  async function handleSave() {
    if (!formName.trim()) { setFormError("Назва не може бути порожньою"); return; }
    setSaving(true);
    try {
      const url = editCategory ? `/api/categories/${editCategory.id}` : "/api/categories";
      const method = editCategory ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          slideGroup: formSlideGroup,
          columnPosition: formColumnPosition,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error, "error"); return; }
      showToast(editCategory ? "Категорію оновлено" : "Категорію додано");
      setModalOpen(false);
      fetchCategories();
    } catch {
      showToast("Помилка збереження", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { showToast(data.error, "error"); return; }
      showToast("Категорію видалено");
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      showToast("Помилка видалення", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleReorder(newOrder: Category[]) {
    setCategories(newOrder);
    try {
      await fetch("/api/categories/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder.map((c, i) => ({ id: c.id, order: i + 1 }))),
      });
    } catch {
      showToast("Помилка збереження порядку", "error");
      fetchCategories();
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
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Категорії</h1>
          <p className="text-sm text-gray-500 mt-1">Перетягуйте для зміни порядку відображення</p>
        </div>
        <Button onClick={openAdd}>+ Додати категорію</Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">Немає категорій</p>
          <p className="text-sm mt-1">Додайте першу категорію для початку</p>
        </div>
      ) : (
        <SortableList
          items={categories}
          onReorder={handleReorder}
          renderItem={(cat) => (
            <div className="flex items-center gap-4 pl-10 pr-4 py-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex-1">
                <p className="font-medium text-[#1A1A1A]">{cat.name}</p>
                <p className="text-xs text-gray-400">
                  {cat._count.dishes} страв&nbsp;·&nbsp;
                  Слайд&nbsp;{cat.slideGroup}&nbsp;·&nbsp;
                  {COLUMN_LABELS[cat.columnPosition]}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(cat)}
                  aria-label="Редагувати"
                  className="p-1.5 text-gray-400 hover:text-[#1A1A1A] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setDeleteTarget(cat)}
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
      )}

      {/* Модалка додавання/редагування */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCategory ? "Редагувати категорію" : "Нова категорія"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Скасувати</Button>
            <Button onClick={handleSave} loading={saving}>{editCategory ? "Зберегти" : "Додати"}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Назва категорії"
            value={formName}
            onChange={(e) => { setFormName(e.target.value); setFormError(""); }}
            error={formError}
            placeholder="Наприклад: Гарячі страви"
            autoFocus
          />

          {/* Номер слайду */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Номер слайду (група)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={formSlideGroup}
              onChange={(e) => setFormSlideGroup(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
            />
            <p className="text-xs text-gray-400 mt-1">
              Категорії з однаковим номером показуються на одному слайді (ліва + права колонки)
            </p>
          </div>

          {/* Позиція колонки */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Розташування на слайді
            </label>
            <select
              value={formColumnPosition}
              onChange={(e) => setFormColumnPosition(e.target.value as ColumnPosition)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
            >
              <option value="FULL">Повна ширина — одна категорія, страви в двох колонках</option>
              <option value="LEFT">Ліва колонка — поруч з іншою категорією</option>
              <option value="RIGHT">Права колонка — поруч з іншою категорією</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Confirm видалення */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Видалити категорію?"
        message={
          deleteTarget
            ? `Ви впевнені, що хочете видалити категорію «${deleteTarget.name}»?${deleteTarget._count.dishes > 0 ? ` В ній є ${deleteTarget._count.dishes} страв — їх потрібно перенести або видалити спочатку.` : ""}`
            : ""
        }
        loading={deleteLoading}
      />
    </div>
  );
}
