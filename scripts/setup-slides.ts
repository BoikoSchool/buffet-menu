import { PrismaClient, ColumnPosition } from "@prisma/client";

const prisma = new PrismaClient();

const SLIDE_CONFIG: { name: string; slideGroup: number; columnPosition: ColumnPosition }[] = [
  { name: "Гарячі страви", slideGroup: 1, columnPosition: "FULL" },
  { name: "Випічка",       slideGroup: 2, columnPosition: "LEFT" },
  { name: "Десерти",       slideGroup: 2, columnPosition: "RIGHT" },
  { name: "Напої",         slideGroup: 3, columnPosition: "FULL" },
];

async function main() {
  console.log("🔧 Налаштовуємо slideGroup / columnPosition...\n");

  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  console.log("Поточні категорії в БД:");
  for (const c of categories) {
    console.log(`  [${c.order}] "${c.name}"  slideGroup=${c.slideGroup}  columnPosition=${c.columnPosition}`);
  }
  console.log();

  for (const cfg of SLIDE_CONFIG) {
    const cat = categories.find((c) => c.name === cfg.name);
    if (!cat) {
      console.warn(`⚠️  Категорію "${cfg.name}" не знайдено — пропускаємо`);
      continue;
    }
    await prisma.category.update({
      where: { id: cat.id },
      data: { slideGroup: cfg.slideGroup, columnPosition: cfg.columnPosition },
    });
    console.log(`✅ "${cfg.name}"  →  slideGroup=${cfg.slideGroup}, columnPosition=${cfg.columnPosition}`);
  }

  console.log("\n📋 Фінальний стан:");
  const updated = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { name: true, slideGroup: true, columnPosition: true },
  });
  console.table(updated);
}

main()
  .catch((e) => { console.error("❌ Помилка:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
