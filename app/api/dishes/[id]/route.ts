import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

const updateDishSchema = z.object({
  name: z.string().min(1, "Назва не може бути порожньою").max(100).optional(),
  price: z.number().positive("Ціна має бути більше 0").optional(),
  categoryId: z.string().min(1).optional(),
  photoUrl: z.string().nullable().optional(),
  isTopPosition: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

function isBlobUrl(url: string | null | undefined): boolean {
  return typeof url === "string" && url.includes("blob.vercel-storage.com");
}

async function deletePhoto(url: string | null | undefined): Promise<void> {
  if (!url) return;

  if (isBlobUrl(url)) {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { del } = await import("@vercel/blob");
      await del(url);
    }
    return;
  }

  if (url.startsWith("/uploads/")) {
    const filePath = join(process.cwd(), "public", url);
    try {
      await unlink(filePath);
    } catch {
      // Ігноруємо — файл міг бути вже видалений
    }
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = updateDishSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const existing = await prisma.dish.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Страву не знайдено" }, { status: 404 });
    }

    // Якщо photoUrl змінюється — видаляємо старе фото
    if (
      "photoUrl" in result.data &&
      result.data.photoUrl !== existing.photoUrl &&
      existing.photoUrl
    ) {
      await deletePhoto(existing.photoUrl);
    }

    // Якщо ставимо топ-позицію і її не було — призначаємо topOrder
    const updates: Record<string, unknown> = { ...result.data };
    if (result.data.isTopPosition === true && !existing.isTopPosition) {
      const lastTop = await prisma.dish.findFirst({
        where: { isTopPosition: true },
        orderBy: { topOrder: "desc" },
      });
      updates.topOrder = (lastTop?.topOrder ?? 0) + 1;
    }

    const dish = await prisma.dish.update({
      where: { id },
      data: updates,
      include: { category: { select: { id: true, name: true } } },
    });

    return NextResponse.json(dish);
  } catch {
    return NextResponse.json({ error: "Помилка оновлення страви" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const dish = await prisma.dish.findUnique({ where: { id } });
    if (!dish) {
      return NextResponse.json({ error: "Страву не знайдено" }, { status: 404 });
    }

    // Видаляємо фото (Blob або локальний файл)
    await deletePhoto(dish.photoUrl);

    await prisma.dish.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Помилка видалення страви" }, { status: 500 });
  }
}
