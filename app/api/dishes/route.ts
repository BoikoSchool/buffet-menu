import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createDishSchema = z.object({
  name: z.string().min(1, "Назва не може бути порожньою").max(100, "Назва занадто довга"),
  price: z.number().positive("Ціна має бути більше 0"),
  categoryId: z.string().min(1, "Оберіть категорію"),
  photoUrl: z.string().optional().nullable(),
  isTopPosition: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    const dishes = await prisma.dish.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(search ? { name: { contains: search } } : {}),
      },
      orderBy: [{ categoryId: "asc" }, { order: "asc" }],
      include: { category: { select: { id: true, name: true } } },
    });

    return NextResponse.json(dishes);
  } catch {
    return NextResponse.json({ error: "Помилка завантаження страв" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = createDishSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { categoryId, isTopPosition } = result.data;

    // Перевіряємо, що категорія існує
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Категорію не знайдено" }, { status: 400 });
    }

    // Наступний order у категорії
    const lastDish = await prisma.dish.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
    });
    const order = (lastDish?.order ?? 0) + 1;

    // Наступний topOrder серед топ-позицій
    let topOrder = 0;
    if (isTopPosition) {
      const lastTop = await prisma.dish.findFirst({
        where: { isTopPosition: true },
        orderBy: { topOrder: "desc" },
      });
      topOrder = (lastTop?.topOrder ?? 0) + 1;
    }

    const dish = await prisma.dish.create({
      data: { ...result.data, order, topOrder },
      include: { category: { select: { id: true, name: true } } },
    });

    return NextResponse.json(dish, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Помилка створення страви" }, { status: 500 });
  }
}
