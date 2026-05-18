import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { processImage } from "@/lib/image-processing";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 МБ

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не знайдено" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Підтримуються лише JPG, PNG, WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Файл занадто великий (максимум 10 МБ)" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Обробляємо зображення ПЕРЕД завантаженням: ресайз + видалення чорного фону
    const processedBuffer = await processImage(buffer);

    const filename = `dishes/${randomUUID()}.png`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // --- Production: Vercel Blob ---
      const { put } = await import("@vercel/blob");
      const blob = await put(filename, processedBuffer, {
        access: "public",
        contentType: "image/png",
      });
      return NextResponse.json({ url: blob.url });
    } else {
      // --- Локальна розробка: файлова система ---
      const uploadsDir = join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });
      const localFilename = `${randomUUID()}.png`;
      const filepath = join(uploadsDir, localFilename);
      await writeFile(filepath, processedBuffer);
      return NextResponse.json({ url: `/uploads/${localFilename}` });
    }
  } catch (error) {
    console.error("Помилка завантаження файлу:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "Помилка завантаження файлу",
        ...(process.env.NODE_ENV !== "production" && { details: message }),
      },
      { status: 500 }
    );
  }
}
