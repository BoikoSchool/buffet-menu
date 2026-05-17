import sharp from "sharp";

const MAX_SIZE = 800; // максимальна довжина сторони в пікселях
const BLACK_THRESHOLD = 30; // поріг RGB для видалення чорного фону

// Змінює розмір і видаляє чорний фон → повертає PNG з прозорістю
export async function processImage(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  // Змінюємо розмір, зберігаючи пропорції
  let resized = image;
  if (width > MAX_SIZE || height > MAX_SIZE) {
    resized = image.resize(MAX_SIZE, MAX_SIZE, { fit: "inside", withoutEnlargement: true });
  }

  // Конвертуємо в raw RGBA для обробки пікселів
  const { data, info } = await resized
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);
  const { width: w, height: h } = info;

  // Видаляємо чорний фон: пікселі з R,G,B < порогу стають прозорими
  for (let i = 0; i < w * h; i++) {
    const offset = i * 4;
    const r = pixels[offset];
    const g = pixels[offset + 1];
    const b = pixels[offset + 2];

    if (r < BLACK_THRESHOLD && g < BLACK_THRESHOLD && b < BLACK_THRESHOLD) {
      pixels[offset + 3] = 0; // alpha = 0 (прозорий)
    }
  }

  // Конвертуємо назад у PNG
  const result = await sharp(Buffer.from(pixels), {
    raw: { width: w, height: h, channels: 4 },
  })
    .png()
    .toBuffer();

  return result;
}
