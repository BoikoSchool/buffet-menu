"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Modal } from "@/components/ui/Modal";
import { ImageUpload } from "./ImageUpload";
import { useToast } from "./Toast";

interface Category {
  id: string;
  name: string;
}

interface DishFormData {
  id?: string;
  name: string;
  price: number;
  categoryId: string;
  photoUrl: string | null;
  isTopPosition: boolean;
  isActive: boolean;
}

interface DishFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  categories: Category[];
  initialData?: DishFormData;
}

const EMPTY_FORM: DishFormData = {
  name: "",
  price: 0,
  categoryId: "",
  photoUrl: null,
  isTopPosition: false,
  isActive: true,
};

export function DishForm({ open, onClose, onSaved, categories, initialData }: DishFormProps) {
  const [form, setForm] = useState<DishFormData>(initialData ?? EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof DishFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Синхронізуємо форму при відкритті з новими initialData
  useState(() => {
    setForm(initialData ?? EMPTY_FORM);
    setErrors({});
  });

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = "Назва не може бути порожньою";
    if (form.name.length > 100) newErrors.name = "Назва занадто довга (макс. 100 символів)";
    if (!form.price || form.price <= 0) newErrors.price = "Ціна має бути більше 0";
    if (!form.categoryId) newErrors.categoryId = "Оберіть категорію";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const url = form.id ? `/api/dishes/${form.id}` : "/api/dishes";
      const method = form.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          price: form.price,
          categoryId: form.categoryId,
          photoUrl: form.photoUrl,
          isTopPosition: form.isTopPosition,
          isActive: form.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Помилка збереження", "error");
        return;
      }

      showToast(form.id ? "Страву оновлено" : "Страву додано", "success");
      onSaved();
      handleClose();
    } catch {
      showToast("Помилка підключення до сервера", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={form.id ? "Редагувати страву" : "Нова страва"}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Скасувати
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {form.id ? "Зберегти" : "Додати"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Назва"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
          placeholder="Наприклад: Борщ зі сметаною"
          maxLength={100}
          required
        />

        <Input
          label="Ціна, ₴"
          type="number"
          min={0.01}
          step={0.01}
          value={form.price || ""}
          onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
          error={errors.price}
          placeholder="0.00"
          required
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Категорія</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]
              ${errors.categoryId ? "border-red-500" : "border-gray-300"}`}
            required
          >
            <option value="">— Оберіть категорію —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="text-xs text-red-600">{errors.categoryId}</p>}
        </div>

        <ImageUpload
          value={form.photoUrl}
          onChange={(url) => setForm({ ...form, photoUrl: url })}
          onError={(msg) => showToast(msg, "error")}
        />

        <div className="flex flex-col gap-3 pt-1">
          <Toggle
            checked={form.isTopPosition}
            onChange={(v) => setForm({ ...form, isTopPosition: v })}
            label="Топ-позиція (показується на жовтому слайді)"
          />
          <Toggle
            checked={form.isActive}
            onChange={(v) => setForm({ ...form, isActive: v })}
            label="Активна (відображається у меню)"
          />
        </div>
      </form>
    </Modal>
  );
}
