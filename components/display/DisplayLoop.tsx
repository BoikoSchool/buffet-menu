"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CategorySlide } from "./CategorySlide";
import { TopPositionSlide } from "./TopPositionSlide";
import { DefaultSlide } from "./DefaultSlide";
import type { DisplayData } from "@/types";

const POLL_INTERVAL = 30_000; // 30 секунд
const LS_CACHE_KEY = "buffet_display_cache";

// Розбиваємо масив на чанки заданого розміру
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// Будуємо плоску чергу слайдів з даних
function buildSlideQueue(data: DisplayData): SlideDescriptor[] {
  const slides: SlideDescriptor[] = [];
  const { itemsPerCategorySlide } = data.settings;

  // Слайди категорій
  for (const cat of data.categories) {
    const chunks = chunkArray(cat.dishes, itemsPerCategorySlide);
    chunks.forEach((chunk, idx) => {
      slides.push({
        type: "category",
        categoryName: cat.name,
        dishes: chunk,
        partIndex: idx,
        totalParts: chunks.length,
      });
    });
  }

  // Слайди топ-позицій (по 3 в ряд)
  const topChunks = chunkArray(data.topPositions, 3);
  for (const chunk of topChunks) {
    slides.push({ type: "top", dishes: chunk });
  }

  return slides;
}

type SlideDescriptor =
  | {
      type: "category";
      categoryName: string;
      dishes: DisplayData["categories"][number]["dishes"];
      partIndex: number;
      totalParts: number;
    }
  | {
      type: "top";
      dishes: DisplayData["topPositions"];
    };

export function DisplayLoop() {
  const [data, setData] = useState<DisplayData | null>(null);
  const [slides, setSlides] = useState<SlideDescriptor[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true); // для fade-ефекту
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Завантажуємо дані (з мережі або з кешу)
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/display");
      if (!res.ok) throw new Error("Помилка відповіді сервера");
      const json: DisplayData = await res.json();

      // Зберігаємо в localStorage для offline-режиму
      try { localStorage.setItem(LS_CACHE_KEY, JSON.stringify(json)); } catch { /* */ }

      setData(json);
      setSlides(buildSlideQueue(json));
    } catch {
      // Offline: намагаємося отримати кеш
      try {
        const cached = localStorage.getItem(LS_CACHE_KEY);
        if (cached) {
          const json: DisplayData = JSON.parse(cached);
          setData(json);
          setSlides(buildSlideQueue(json));
        }
      } catch { /* */ }
    }
  }, []);

  // Початкове завантаження
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling кожні 30 секунд
  useEffect(() => {
    pollRef.current = setInterval(fetchData, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchData]);

  // Автоматична ротація слайдів
  useEffect(() => {
    if (!data || slides.length === 0) return;

    const currentSlide = slides[currentIndex];
    const duration =
      currentSlide.type === "category"
        ? data.settings.categorySlideDuration * 1000
        : data.settings.topSlideDuration * 1000;
    const fadeDuration = data.settings.fadeDuration;

    timerRef.current = setTimeout(() => {
      // Починаємо fade out
      setVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
        setVisible(true);
      }, fadeDuration);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, slides, data]);

  // Якщо даних немає — показуємо заглушку
  if (!data || slides.length === 0) {
    return <DefaultSlide />;
  }

  const fadeDuration = data.settings.fadeDuration;
  const currentSlide = slides[currentIndex];

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          opacity: visible ? 1 : 0,
          transition: `opacity ${fadeDuration}ms ease-in-out`,
          position: "absolute",
          inset: 0,
        }}
      >
        {currentSlide.type === "category" ? (
          <CategorySlide
            categoryName={currentSlide.categoryName}
            dishes={currentSlide.dishes}
            partIndex={currentSlide.partIndex}
            totalParts={currentSlide.totalParts}
          />
        ) : (
          <TopPositionSlide dishes={currentSlide.dishes} />
        )}
      </div>
    </div>
  );
}
