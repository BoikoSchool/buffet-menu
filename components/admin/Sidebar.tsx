"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "./Toast";

const NAV_ITEMS = [
  { href: "/admin/dishes", label: "Страви", icon: "🍽" },
  { href: "/admin/categories", label: "Категорії", icon: "📋" },
  { href: "/admin/top-positions", label: "Топ-позиції", icon: "⭐" },
  { href: "/admin/settings", label: "Налаштування", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    showToast("До побачення!", "success");
    router.push("/admin/login");
  }

  return (
    <aside className="w-64 bg-[#1A1A1A] text-white flex flex-col shrink-0">
      {/* Логотип / назва */}
      <div className="px-6 py-5 border-b border-white/10">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Адмін-панель</p>
        <p className="font-semibold mt-1">Private Boiko School</p>
        <p className="text-xs text-gray-400">Меню буфету</p>
      </div>

      {/* Навігація */}
      <nav className="flex-1 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors
                ${active
                  ? "bg-white/10 text-white font-medium"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Кнопка виходу */}
      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Вийти
        </button>
      </div>
    </aside>
  );
}
