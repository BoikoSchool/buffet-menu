import type { Metadata } from "next";
import { DisplayClient } from "@/components/display/DisplayClient";

export const metadata: Metadata = {
  title: "Меню буфету — Private Boiko School",
};

// Сторінка екрану-плеєра — режим kiosk 1920×1080
export default function DisplayPage() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        cursor: "none",
        background: "#1A1A1A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <DisplayClient />
    </div>
  );
}
