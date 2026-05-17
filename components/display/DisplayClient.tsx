"use client";

import dynamic from "next/dynamic";

// Завантажуємо DisplayLoop тільки на клієнті (використовує localStorage, браузерні API)
const DisplayLoop = dynamic(
  () => import("./DisplayLoop").then((m) => ({ default: m.DisplayLoop })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: 1920,
          height: 1080,
          background: "#1A1A1A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: "6px solid #F8C300",
            borderTopColor: "transparent",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    ),
  }
);

export function DisplayClient() {
  return <DisplayLoop />;
}
