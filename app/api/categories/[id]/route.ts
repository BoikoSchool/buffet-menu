import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(1, "Назва не може бути порожньою").max(100, "Назва занадто довга"),
  slideGroup: z.number().int().min(1).max(20).optional(),
  columnPosition: z.enum(["FULL", "LEFT", "RIGHT"]).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { name, slideGroup, columnPosition } = result.data;
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        ...(slideGroup !== undefined && { slideGroup }),
        ...(columnPosition !== undefined && { columnPosition }),
      },
    });

    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Помилка оновлення категорії" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const dishCount = await prisma.dish.count({ where: { categoryId: id } });
    if (dishCount > 0) {
      return NextResponse.json(
        { error: `Неможливо видалити: в категорії є ${dishCount} страв(а). Перенесіть або видаліть страви спочатку.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Помилка видалення категорії" }, { status: 500 });
  }
}
