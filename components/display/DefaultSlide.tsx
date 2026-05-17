// Слайд-заглушка: показується коли немає активних страв

import Image from "next/image";

export function DefaultSlide() {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ width: 1920, height: 1080, background: "#1A1A1A" }}
    >
      {/* Логотип школи */}
      <div className="mb-10">
        <Image
          src="/logo.png"
          alt="Private Boiko School"
          width={240}
          height={240}
          style={{ objectFit: "contain" }}
          priority
        />
      </div>

      <h1
        className="font-display tracking-widest uppercase mb-4"
        style={{ fontSize: 72, color: "#F8C300" }}
      >
        Private Boiko School
      </h1>

      <p
        className="font-display tracking-widest uppercase"
        style={{ fontSize: 48, color: "#FFFFFF" }}
      >
        Меню оновлюється
      </p>
    </div>
  );
}
