# Меню шкільного буфету — Private Boiko School

Веб-додаток для відображення меню буфету на екрані та управління ним через адмін-панель.

## Можливості

- **Екран-плеєр** (`/display`) — безкінечна ротація слайдів для Smart TV (1920×1080)
  - Слайди категорій з таблицею назва ↔ ціна
  - Жовті слайди топ-позицій з L-куточками та червоними колами
  - Fade-переходи, polling кожні 30 сек, offline-кеш у localStorage
- **Адмін-панель** (`/admin`) — управління з будь-якого пристрою
  - Страви: CRUD, drag-and-drop, фото, toggle активності
  - Категорії: drag-and-drop порядок
  - Топ-позиції: превʼю карток, drag-and-drop порядок
  - Налаштування таймінгів

---

## Локальна розробка

### 1. Клонування та встановлення залежностей

```bash
git clone <repo-url>
cd buffet-menu
npm install
```

### 2. Налаштування змінних середовища

```bash
cp .env.example .env
```

Відредагуйте `.env`:

```env
DATABASE_URL="file:./dev.db"
ADMIN_USERNAME="your_login"
ADMIN_PASSWORD="YourSecurePassword123!"
JWT_SECRET="your-secret-min-32-chars-long"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Ініціалізація бази даних

```bash
npm run db:migrate     # Створити таблиці
npm run db:seed        # Заповнити тестовими даними
```

### 4. Запуск

```bash
npm run dev
```

Відкрийте:
- `http://localhost:3000/display` — екран-плеєр
- `http://localhost:3000/admin` — адмін-панель (логін: `admin` / пароль з `.env`)

### Корисні команди

```bash
npm run db:studio      # Prisma Studio (веб-інтерфейс БД)
npm run db:reset       # Скинути і перезаповнити БД
npm run build          # Production-збірка
npm run lint           # ESLint перевірка
```

---

## Деплой на Vercel + Neon (PostgreSQL)

### 1. Підготовка БД

1. Зареєструйтесь на [neon.tech](https://neon.tech) (безкоштовний план)
2. Створіть новий проєкт → скопіюйте `DATABASE_URL` (формат `postgresql://...`)

### 2. Зміна provider в Prisma

Відредагуйте `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // змінити з "sqlite"
  url      = env("DATABASE_URL")
}
```

### 3. Деплой на Vercel

```bash
# Встановити Vercel CLI
npm i -g vercel

# Деплой
vercel

# Або через GitHub: підключіть репозиторій у vercel.com
```

### 4. Env-змінні у Vercel

У Settings → Environment Variables додайте:

| Змінна | Значення |
|--------|----------|
| `DATABASE_URL` | postgresql://... (з Neon) |
| `ADMIN_USERNAME` | ваш_логін |
| `ADMIN_PASSWORD` | ваш_пароль |
| `JWT_SECRET` | (генеруйте: `openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | https://ваш-домен.vercel.app |

### 5. Міграції та seed на production

```bash
# Якщо є Vercel CLI
vercel env pull .env.local
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." ADMIN_USERNAME="admin" ADMIN_PASSWORD="SecurePass" npm run db:seed
```

---

## Структура проєкту

```
app/
  display/          ← екран-плеєр
  admin/            ← адмін-панель (login, dishes, categories, top-positions, settings)
  api/              ← REST API endpoints

components/
  display/          ← CategorySlide, TopPositionSlide, DefaultSlide, DisplayLoop
  admin/            ← Sidebar, DishForm, SortableList, ImageUpload, Toast, ConfirmDialog
  ui/               ← Button, Input, Toggle, Modal

lib/
  prisma.ts         ← singleton Prisma client
  auth.ts           ← JWT helpers
  image-processing.ts ← обробка фото через sharp

prisma/
  schema.prisma     ← схема БД
  seed.ts           ← seed-скрипт

types/index.ts      ← TypeScript типи
middleware.ts       ← захист маршрутів
```

---

## Безпека

- Паролі ніколи не зберігаються у відкритому вигляді (bcrypt, cost=12)
- JWT зберігається у httpOnly cookie (недоступний для JS)
- Усі адмін-маршрути захищені middleware
- Env-файл у `.gitignore` — **не комітити `.env` у репозиторій**
- Перед деплоєм обов'язково змінити `ADMIN_PASSWORD` та `JWT_SECRET`

---

## Технічний стек

- **Next.js 15** (App Router, TypeScript)
- **Prisma 5** (SQLite → PostgreSQL для production)
- **Tailwind CSS 4**
- **jose** (JWT)
- **bcryptjs** (хешування паролів)
- **sharp** (обробка зображень)
- **@dnd-kit** (drag-and-drop)
- **zod** (валідація)
