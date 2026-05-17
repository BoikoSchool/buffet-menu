// Слайд категорії — стиль кав'ярні «Клава»: таблиця назва↔ціна, жовтий/кремовий фон

import Image from "next/image";

interface Dish {
  id: string;
  name: string;
  price: number;
  photoUrl: string | null;
}

interface CategorySlideProps {
  categoryName: string;
  dishes: Dish[];
  // Якщо категорія розбита на кілька слайдів
  partIndex?: number;
  totalParts?: number;
}

export function CategorySlide({
  categoryName,
  dishes,
  partIndex,
  totalParts,
}: CategorySlideProps) {
  const showPartLabel = totalParts && totalParts > 1 && partIndex !== undefined;
  const heading = showPartLabel
    ? `${categoryName} (${partIndex! + 1}/${totalParts})`
    : categoryName;

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: "#FFF8E7",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Шапка */}
      <div
        style={{
          background: "#1A1A1A",
          height: 108,
          display: "flex",
          alignItems: "center",
          padding: "0 60px",
          gap: 32,
          flexShrink: 0,
        }}
      >
        {/* Логотип школи */}
        <div style={{ width: 80, height: 80, flexShrink: 0 }}>
          <Image
            src="/logo.png"
            alt="Private Boiko School"
            width={80}
            height={80}
            style={{ objectFit: "contain", width: 80, height: 80 }}
            priority
          />
        </div>

        <div style={{ flex: 1 }}>
          <p
            className="font-display"
            style={{ color: "#FFFFFF", fontSize: 28, letterSpacing: "0.15em", textTransform: "uppercase" }}
          >
            Private Boiko School
          </p>
          <p
            style={{ color: "#F8C300", fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}
          >
            Меню буфету
          </p>
        </div>
      </div>

      {/* Основна область */}
      <div
        style={{
          flex: 1,
          padding: "40px 80px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Заголовок категорії у рамці */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 32,
            padding: "12px 0",
            borderTop: "3px solid #1A1A1A",
            borderBottom: "3px solid #1A1A1A",
          }}
        >
          <h2
            className="font-display"
            style={{
              fontSize: 56,
              color: "#1A1A1A",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            {heading}
          </h2>
        </div>

        {/* Список страв */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
          {dishes.map((dish, idx) => (
            <div
              key={dish.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "16px 0",
                borderBottom: idx < dishes.length - 1 ? "1px solid #E0D8C0" : "none",
              }}
            >
              {/* Зарезервоване місце під фото 100×100 */}
              <div style={{ width: 100, height: 100, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {dish.photoUrl && (
                  <Image
                    src={dish.photoUrl}
                    alt={dish.name}
                    width={100}
                    height={100}
                    style={{ objectFit: "contain", mixBlendMode: "multiply" }}
                  />
                )}
              </div>

              {/* Назва (розтягується) */}
              <span
                style={{
                  flex: 1,
                  fontSize: 44,
                  fontWeight: 600,
                  color: "#1A1A1A",
                  lineHeight: 1.2,
                }}
              >
                {dish.name}
              </span>

              {/* Ціна */}
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  color: "#1A1A1A",
                  minWidth: 180,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {dish.price} ₴
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
