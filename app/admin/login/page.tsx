"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Suspense } from "react";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Помилка входу");
        return;
      }

      const from = searchParams.get("from") ?? "/admin/dishes";
      router.push(from);
      router.refresh();
    } catch {
      setError("Помилка підключення до сервера");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-[#F8C300] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🍽</span>
          </div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Вхід в адмін-панель</h1>
          <p className="text-sm text-gray-500 mt-1">Private Boiko School · Меню буфету</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Логін"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" loading={loading} className="mt-2 w-full">
            Увійти
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
