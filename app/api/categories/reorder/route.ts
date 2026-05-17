import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const reorderSchema = z.array(
  z.object({ id: z.string(), order: z.number().int().min(0) })
);

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = reorderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Невірний формат даних" }, { status: 400 });
    }

    // Оновлюємо порядок усіх категорій в одній транзакції
    await prisma.$transaction(
      result.data.map(({ id, order }) =>
        prisma.category.update({ where: { id }, data: { order } })
      )
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Помилка зміни порядку категорій" }, { status: 500 });
  }
}
