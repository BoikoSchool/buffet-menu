import { redirect } from "next/navigation";

// Головна сторінка перенаправляє на екран-плеєр
export default function HomePage() {
  redirect("/display");
}
