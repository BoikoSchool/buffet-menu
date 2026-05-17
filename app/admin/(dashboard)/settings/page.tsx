"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/admin/Toast";

interface Settings {
  id: string;
  categorySlideDuration: number;
  topSlideDuration: number;
  fadeDuration: number;
  itemsPerCategorySlide: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Settings, string>>>({});
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => showToast("Помилка завантаження налаштувань", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  function validate(): boolean {
    if (!settings) return false;
    const e: typeof errors = {};
    if (settings.categorySlideDuration < 5 || settings.categorySlideDuration > 60)
      e.categorySlideDuration = "Від 5 до 60 секунд";
    if (settings.topSlideDuration < 5 || settings.topSlideDuration > 60)
      e.topSlideDuration = "Від 5 до 60 секунд";
    if (settings.fadeDuration < 200 || settings.fadeDuration > 2000)
      e.fadeDuration = "Від 200 до 2000 мс";
    if (settings.itemsPerCategorySlide < 4 || settings.itemsPerCategorySlide > 15)
      e.itemsPerCategorySlide = "Від 4 до 15 страв";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categorySlideDuration: settings!.categorySlideDuration,
          topSlideDuration: settings!.topSlideDuration,
          fadeDuration: settings!.fadeDuration,
          itemsPerCategorySlide: settings!.itemsPerCategorySlide,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error, "error");
        return;
      }
      showToast("Налаштування збережено");
    } catch {
      showToast("Помилка збереження", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#1A1A1A] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Налаштування</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">
        <Input
          label="Тривалість слайда категорії (сек)"
          type="number"
          min={5}
          max={60}
          value={settings.categorySlideDuration}
          onChange={(e) =>
            setSettings({ ...settings, categorySlideDuration: parseInt(e.target.value) || 5 })
          }
          error={errors.categorySlideDuration}
        />

        <Input
          label="Тривалість слайда топ-позицій (сек)"
          type="number"
          min={5}
          max={60}
          value={settings.topSlideDuration}
          onChange={(e) =>
            setSettings({ ...settings, topSlideDuration: parseInt(e.target.value) || 5 })
          }
          error={errors.topSlideDuration}
        />

        <Input
          label="Тривалість анімації переходу (мс)"
          type="number"
          min={200}
          max={2000}
          step={100}
          value={settings.fadeDuration}
          onChange={(e) =>
            setSettings({ ...settings, fadeDuration: parseInt(e.target.value) || 200 })
          }
          error={errors.fadeDuration}
        />

        <Input
          label="Кількість страв на одному слайді категорії"
          type="number"
          min={4}
          max={15}
          value={settings.itemsPerCategorySlide}
          onChange={(e) =>
            setSettings({ ...settings, itemsPerCategorySlide: parseInt(e.target.value) || 4 })
          }
          error={errors.itemsPerCategorySlide}
        />

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} loading={saving}>
            Зберегти
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.open("/display", "_blank")}
            type="button"
          >
            Попередній перегляд
          </Button>
        </div>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          💡 Зміни набувають чинності на екрані протягом 30 секунд (polling).
        </p>
      </div>
    </div>
  );
}
