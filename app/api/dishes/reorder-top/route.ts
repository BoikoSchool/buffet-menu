import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const reorderTopSchema = z.array(
  z.object({ id: z.string(), topOrder: z.number().int().min(0) })
);

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = reorderTopSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Невірний формат даних" }, { status: 400 });
    }

    await prisma.$transaction(
      result.data.map(({ id, topOrder }) =>
        prisma.dish.update({ where: { id }, data: { topOrder } })
      )
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Помилка зміни порядку топ-позицій" }, { status: 500 });
  }
}
