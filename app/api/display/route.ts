import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Фільтруємо категорії без активних страв
    const activeCategories = categories
      .filter((cat) => cat.dishes.length > 0)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        dishes: cat.dishes,
      }));

    const settingsData = settings ?? {
      categorySlideDuration: 10,
      topSlideDuration: 7,
      fadeDuration: 500,
      itemsPerCategorySlide: 8,
    };

    return NextResponse.json(
      {
        categories: activeCategories,
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
