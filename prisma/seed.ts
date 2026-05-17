import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Починаємо seed...");

  // Видаляємо існуючі дані
  await prisma.dish.deleteMany();
  await prisma.category.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.user.deleteMany();

  // Адмін — логін/пароль з env-змінних
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "ADMIN_USERNAME та ADMIN_PASSWORD мають бути задані в .env"
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { username, passwordHash },
  });
  console.log(`✅ Адмін створений: ${username}`);

  // Налаштування за замовчуванням
  await prisma.settings.create({
    data: {
      categorySlideDuration: 10,
      topSlideDuration: 7,
      fadeDuration: 500,
      itemsPerCategorySlide: 8,
    },
  });
  console.log("✅ Налаштування створені");

  // Категорії
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Гарячі страви", order: 1 } }),
    prisma.category.create({ data: { name: "Випічка", order: 2 } }),
    prisma.category.create({ data: { name: "Десерти", order: 3 } }),
    prisma.category.create({ data: { name: "Напої", order: 4 } }),
  ]);

  const [hotDishes, bakery, desserts, drinks] = categories;
  console.log("✅ Категорії створені:", categories.map((c) => c.name));

  // Гарячі страви
  const hotDishesData = [
    { name: "Борщ зі сметаною", price: 65, order: 1, isTopPosition: true },
    { name: "Суп курячий", price: 55, order: 2, isTopPosition: false },
    { name: "Картопля відварна з котлетою", price: 95, order: 3, isTopPosition: true },
    { name: "Гречана каша з підливою", price: 75, order: 4, isTopPosition: false },
    { name: "Рис з курячою ніжкою", price: 105, order: 5, isTopPosition: false },
    { name: "Макарони з сиром", price: 60, order: 6, isTopPosition: false },
  ];

  for (const dish of hotDishesData) {
    await prisma.dish.create({
      data: {
        ...dish,
        categoryId: hotDishes.id,
        isActive: true,
        topOrder: dish.isTopPosition ? hotDishesData.indexOf(dish) + 1 : 0,
      },
    });
  }

  // Випічка
  const bakeryData = [
    { name: "Пиріжок з капустою", price: 25, order: 1, isTopPosition: false },
    { name: "Пиріжок з картоплею", price: 25, order: 2, isTopPosition: false },
    { name: "Хачапурі", price: 45, order: 3, isTopPosition: true },
    { name: "Булочка з маком", price: 20, order: 4, isTopPosition: false },
    { name: "Рогалик з сиром", price: 30, order: 5, isTopPosition: false },
  ];

  for (const dish of bakeryData) {
    await prisma.dish.create({
      data: {
        ...dish,
        categoryId: bakery.id,
        isActive: true,
        topOrder: dish.isTopPosition ? bakeryData.indexOf(dish) + 1 : 0,
      },
    });
  }

  // Десерти
  const dessertsData = [
    { name: "Кекс шоколадний", price: 35, order: 1, isTopPosition: true },
    { name: "Тістечко «Наполеон»", price: 55, order: 2, isTopPosition: true },
    { name: "Блинчики з джемом", price: 40, order: 3, isTopPosition: false },
    { name: "Сирники зі сметаною", price: 65, order: 4, isTopPosition: false },
  ];

  for (const dish of dessertsData) {
    await prisma.dish.create({
      data: {
        ...dish,
        categoryId: desserts.id,
        isActive: true,
        topOrder: dish.isTopPosition ? dessertsData.indexOf(dish) + 1 : 0,
      },
    });
  }

  // Напої
  const drinksData = [
    { name: "Чай чорний", price: 15, order: 1, isTopPosition: false },
    { name: "Чай зелений", price: 15, order: 2, isTopPosition: false },
    { name: "Какао з молоком", price: 25, order: 3, isTopPosition: false },
    { name: "Компот з сухофруктів", price: 20, order: 4, isTopPosition: false },
    { name: "Вода мінеральна", price: 15, order: 5, isTopPosition: false },
  ];

  for (const dish of drinksData) {
    await prisma.dish.create({
      data: {
        ...dish,
        categoryId: drinks.id,
        isActive: true,
        topOrder: 0,
      },
    });
  }

  const totalDishes = hotDishesData.length + bakeryData.length + dessertsData.length + drinksData.length;
  console.log(`✅ Створено ${totalDishes} страв`);

  const topCount = [...hotDishesData, ...bakeryData, ...dessertsData].filter(
    (d) => d.isTopPosition
  ).length;
  console.log(`✅ З них ${topCount} — топ-позиції`);
  console.log("🎉 Seed завершено успішно!");
}

main()
  .catch((e) => {
    console.error("❌ Помилка seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
