import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { SlideGroup } from "@/types";

// Публічний endpoint для екрану-плеєра
export async function GET() {
  try {
    const [categories, topPositions, settings] = await Promise.all([
      prisma.category.findMany({
        orderBy: { order: "asc" },
        include: {
          dishes: {
            where: { isActive: true },
            orderBy: { order: "asc" },
            select: { id: true, name: true, price: true, photoUrl: true },
          },
        },
      }),
      prisma.dish.findMany({
        where: { isTopPosition: true, isActive: true },
        orderBy: { topOrder: "asc" },
        select: { id: true, name: true, price: true, photoUrl: true },
      }),
      prisma.settings.findFirst(),
    ]);

    // Групуємо категорії по slideGroup
    const groupMap = new Map<number, typeof categories>();
    for (const cat of categories) {
      if (cat.dishes.length === 0) continue;
      const key = cat.slideGroup;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(cat);
    }

    const slideGroups: SlideGroup[] = [];
    const sortedKeys = [...groupMap.keys()].sort((a, b) => a - b);
    for (const key of sortedKeys) {
      const cats = groupMap.get(key)!;
      slideGroups.push({
        groupId: key,
        columns: cats.map((cat) => ({
          position: cat.columnPosition as "LEFT" | "RIGHT" | "FULL",
          category: {
            id: cat.id,
            name: cat.name,
            dishes: cat.dishes,
          },
        })),
      });
    }

    const settingsData = settings ?? {
      categorySlideDuration: 10,
      topSlideDuration: 7,
      fadeDuration: 500,
      itemsPerCategorySlide: 8,
    };

    console.log(
      "[/api/display] slideGroups:",
      JSON.stringify(
        slideGroups.map((g) => ({
          groupId: g.groupId,
          columns: g.columns.map((c) => ({ position: c.position, category: c.category.name, dishes: c.category.dishes.length })),
        })),
        null,
        2
      )
    );

    return NextResponse.json(
      {
        slideGroups,
        topPositions,
        settings: {
          categorySlideDuration: settingsData.categorySlideDuration,
          topSlideDuration: settingsData.topSlideDuration,
          fadeDuration: settingsData.fadeDuration,
          itemsPerCategorySlide: settingsData.itemsPerCategorySlide,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Помилка завантаження меню" },
      { status: 500 }
    );
  }
}
