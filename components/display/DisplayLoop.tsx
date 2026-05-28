"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CategorySlide } from "./CategorySlide";
import { TopPositionSlide } from "./TopPositionSlide";
import { DefaultSlide } from "./DefaultSlide";
import type { DisplayData, SlideGroup } from "@/types";

const POLL_INTERVAL = 30_000;
const LS_CACHE_KEY = "buffet_display_cache";

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
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    const fadeDuration = data.settings.fadeDuration;

    timerRef.current = setTimeout(() => {
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

  if (!data || slides.length === 0) {
    return <DefaultSlide />;
  }

  const fadeDuration = data.settings.fadeDuration;
  const currentSlide = slides[currentIndex];

  return (
    <div
      style={{
        width: "100vw",
        height: "calc(var(--vh, 1vh) * 100)" as string,
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
          <CategorySlide key={currentIndex} group={currentSlide.group} />
        ) : (
          <TopPositionSlide key={currentIndex} dishes={currentSlide.dishes} />
        )}
      </div>
    </div>
  );
}
