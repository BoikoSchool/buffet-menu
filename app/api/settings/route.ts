import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  categorySlideDuration: z.number().int().min(5, "Мінімум 5 сек").max(60, "Максимум 60 сек"),
  topSlideDuration: z.number().int().min(5, "Мінімум 5 сек").max(60, "Максимум 60 сек"),
  fadeDuration: z.number().int().min(200, "Мінімум 200 мс").max(2000, "Максимум 2000 мс"),
  itemsPerCategorySlide: z.number().int().min(4, "Мінімум 4 страви").max(15, "Максимум 15 страв"),
});

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          categorySlideDuration: 10,
          topSlideDuration: 7,
          fadeDuration: 500,
          itemsPerCategorySlide: 8,
        },
      });
    }
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Помилка завантаження налаштувань" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = settingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    let settings = await prisma.settings.findFirst();
    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: result.data,
      });
    } else {
      settings = await prisma.settings.create({ data: result.data });
    }

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Помилка збереження налаштувань" }, { status: 500 });
  }
}
