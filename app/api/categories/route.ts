import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createCategorySchema = z.object({
  name: z.string().min(1, "Назва не може бути порожньою").max(100, "Назва занадто довга"),
  slideGroup: z.number().int().min(1).max(20).optional().default(1),
  columnPosition: z.enum(["FULL", "LEFT", "RIGHT"]).optional().default("FULL"),
});

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: { select: { dishes: true } },
      },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: "Помилка завантаження категорій" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = createCategorySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    // Визначаємо наступний порядковий номер
    const lastCategory = await prisma.category.findFirst({ orderBy: { order: "desc" } });
    const order = (lastCategory?.order ?? 0) + 1;

    const category = await prisma.category.create({
      data: {
        name: result.data.name,
        order,
        slideGroup: result.data.slideGroup,
        columnPosition: result.data.columnPosition,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Помилка створення категорії" }, { status: 500 });
  }
}
