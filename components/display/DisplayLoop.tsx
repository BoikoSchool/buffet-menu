"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CategorySlide } from "./CategorySlide";
import { TopPositionSlide } from "./TopPositionSlide";
import { DefaultSlide } from "./DefaultSlide";
import type { DisplayData, SlideGroup } from "@/types";

const POLL_INTERVAL = 30_000;
const LS_CACHE_KEY = "buffet_display_cache";
const CATEGORY_SLIDE_OFFSET = 80;  // px — зменшити до 40-60 якщо смикається на TV
const CATEGORY_DURATION     = 950; // ms — більше = плавніше
const CATEGORY_EASING = "cubic-bezier(0.33, 1, 0.68, 1)"; // плавне гальмування
// Альтернативи — розкоментуй для тесту:
// const CATEGORY_EASING = "cubic-bezier(0.25, 0.1, 0.25, 1)"; // класичний ease
// const CATEGORY_EASING = "cubic-bezier(0.45, 0, 0.55, 1)";   // м'який ease-in-out

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

type SlideDescriptor =
  | { type: "category"; group: SlideGroup }
  | { type: "top"; dishes: DisplayData["topPositions"] };

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function buildSlideQueue(data: DisplayData): SlideDescriptor[] {
  const categorySlides: SlideDescriptor[] = data.slideGroups.map((group) => ({
    type: "category",
    group,
  }));

  const topSlides: SlideDescriptor[] = chunkArray(data.topPositions, 3).map((chunk) => ({
    type: "top",
    dishes: chunk,
  }));

  if (topSlides.length === 0) return categorySlides;
  if (categorySlides.length === 0) return topSlides;

  // Повний цикл = LCM пар: К і Т крутяться незалежно, жоден слайд не губиться
  const cycles = (categorySlides.length * topSlides.length) / gcd(categorySlides.length, topSlides.length);
  const result: SlideDescriptor[] = [];
  for (let i = 0; i < cycles; i++) {
    result.push(categorySlides[i % categorySlides.length]);
    result.push(topSlides[i % topSlides.length]);
  }
  return result;
}

export function DisplayLoop() {
  const [data, setData] = useState<DisplayData | null>(null);
  const [slides, setSlides] = useState<SlideDescriptor[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/display");
      if (!res.ok) throw new Error("Помилка відповіді сервера");
      const json: DisplayData = await res.json();
      try { localStorage.setItem(LS_CACHE_KEY, JSON.stringify(json)); } catch { /* */ }
      setData(json);
      setSlides(buildSlideQueue(json));
    } catch {
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

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    pollRef.current = setInterval(fetchData, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchData]);

  useEffect(() => {
    if (!data || slides.length === 0) return;

    const currentSlide = slides[currentIndex];
    const duration =
      currentSlide.type === "category"
        ? data.settings.categorySlideDuration * 1000
        : data.settings.topSlideDuration * 1000;

    // Тривалість exit-анімації: топ відходить 450ms, категорія гасне 400ms
    const exitDuration = currentSlide.type === "top" ? 450 : 400;

    timerRef.current = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      setPrevIndex(currentIndex);
      setCurrentIndex(nextIndex);

      // Прибираємо попередній слайд після завершення exit-анімації
      exitTimerRef.current = setTimeout(() => {
        setPrevIndex(null);
      }, exitDuration + 50);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [currentIndex, slides, data]);

  if (!data || slides.length === 0) {
    return <DefaultSlide />;
  }

  const currentSlide = slides[currentIndex];

  const exitClass =
    prevIndex !== null
      ? slides[prevIndex].type === "top"
        ? "slide-exit-top-to-left"
        : "slide-exit-category-fade"
      : "";

  const entryClass =
    currentSlide.type === "category" ? "slide-enter-category-from-right" : "";

  return (
    <div
      style={{
        width: "100vw",
        height: "calc(var(--vh, 1vh) * 100)" as string,
        overflow: "hidden",
        position: "relative",
        "--category-slide-offset": `${CATEGORY_SLIDE_OFFSET}px`,
        "--category-duration": `${CATEGORY_DURATION}ms`,
        "--category-easing": CATEGORY_EASING,
      } as React.CSSProperties}
    >
      {/* Слайд що виходить — грає exit-анімацію під новим */}
      {prevIndex !== null && (
        <div className={exitClass} style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          {slides[prevIndex].type === "category" ? (
            <CategorySlide group={slides[prevIndex].group} />
          ) : (
            <TopPositionSlide dishes={slides[prevIndex].dishes} />
          )}
        </div>
      )}

      {/* Слайд що входить — key форсує ремонт і перезапускає CSS-анімації */}
      <div
        key={currentIndex}
        className={entryClass}
        style={{ position: "absolute", inset: 0, zIndex: 2 }}
      >
        {currentSlide.type === "category" ? (
          <CategorySlide group={currentSlide.group} />
        ) : (
          <TopPositionSlide dishes={currentSlide.dishes} />
        )}
      </div>
    </div>
  );
}
