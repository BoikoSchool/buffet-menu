// Слайд топ-позицій — сумісний зі старими браузерами Smart TV (WebKit 2016+)
// Розміри через vw/vh (1vw=19.2px, 1vh=10.8px на 1920×1080)
// Позиціонування через position:absolute + %, без gap, без clamp

import Image from "next/image";

interface TopDish {
  id: string;
  name: string;
  price: number;
  photoUrl: string | null;
}

interface TopPositionSlideProps {
  dishes: TopDish[]; // від 1 до 3 страв
}

// L-куточок у кутку картки
// Товщина: 0.8vw (~15px), Довжина: 5vw (~96px)
function LCorner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const isTop = position[0] === "t";
  const isLeft = position[1] === "l";

  const edge: React.CSSProperties = {
    position: "absolute",
    pointerEvents: "none",
  };

  if (isTop) { edge.top = 0; } else { edge.bottom = 0; }
  if (isLeft) { edge.left = 0; } else { edge.right = 0; }

  return (
    <div style={{ ...edge, width: "5vw", height: "5vw" }}>
      {/* Горизонтальна смуга */}
      <div
        style={{
          position: "absolute",
          top: isTop ? 0 : undefined,
          bottom: !isTop ? 0 : undefined,
          left: isLeft ? 0 : undefined,
          right: !isLeft ? 0 : undefined,
          width: "5vw",
          height: "0.8vw",
          background: "#1A1A1A",
        }}
      />
      {/* Вертикальна смуга */}
      <div
        style={{
          position: "absolute",
          top: isTop ? 0 : undefined,
          bottom: !isTop ? 0 : undefined,
          left: isLeft ? 0 : undefined,
          right: !isLeft ? 0 : undefined,
          width: "0.8vw",
          height: "5vw",
          background: "#1A1A1A",
        }}
      />
    </div>
  );
}

// Картка однієї топ-позиції
// Ширина: 29vw (~557px), Висота: 88vh (~950px)
//
// Розбиття висоти (% від висоти картки):
//   5%  — верхній відступ
//  43%  — зона фото
//   3%  — відступ
//  16%  — назва (2 рядки)
//   4%  — відступ
//  23%  — діаметр червоного кола
//   6%  — нижній відступ
// = 100%
function TopCard({ dish }: { dish: TopDish }) {
  // Діаметр кола: 23% * 88vh = 20.24vh = 218px = 11.4vw (на 16:9)
  // Використовуємо vw щоб і width і height були однаковою одиницею → ідеальне коло
  const circleDiam = "11.4vw";

  return (
    <div
      style={{
        position: "relative",
        width: "29vw",
        height: "88vh",
        flexShrink: 0,
        marginLeft: "1.5vw",
        marginRight: "1.5vw",
      }}
    >
      {/* Куточки */}
      <LCorner position="tl" />
      <LCorner position="tr" />
      <LCorner position="bl" />
      <LCorner position="br" />

      {/* ── Зона фото: top=5%, height=43% ── */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "12.5%",   // (100% - 75%) / 2
          width: "75%",
          height: "43%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {dish.photoUrl ? (
          // Обгортка з position:relative потрібна для Image fill
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Image
              src={dish.photoUrl}
              alt={dish.name}
              fill
              sizes="22vw"
              style={{
                objectFit: "contain",
                mixBlendMode: "multiply",
              }}
            />
          </div>
        ) : (
          <span style={{ fontSize: "8vw", lineHeight: 1 }}>🍽</span>
        )}
      </div>

      {/* ── Назва: top=51% (5+43+3), height=16% ── */}
      <div
        style={{
          position: "absolute",
          top: "51%",
          left: "10%",
          width: "80%",
          height: "16%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <p
          style={{
            margin: 0,
            padding: 0,
            fontSize: "3.5vw",
            fontWeight: 900,
            color: "#1A1A1A",
            textTransform: "uppercase",
            textAlign: "center",
            lineHeight: 1.1,
            // Обрізання до 2 рядків (webkit — єдиний надійний спосіб для старих браузерів)
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {dish.name}
        </p>
      </div>

      {/* ── Червоне коло: top=71% (5+43+3+16+4), центроване по X ── */}
      <div
        style={{
          position: "absolute",
          top: "71%",
          left: "50%",
          // translateX(-50%) — стабільно з WebKit 2013+
          transform: "translateX(-50%)",
          width: circleDiam,
          height: circleDiam,
          borderRadius: "50%",
          background: "#DC1F26",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: "4.5vw",
            fontWeight: 900,
            color: "#FFFFFF",
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          {dish.price}
        </span>
        <span
          style={{
            display: "block",
            fontSize: "1.3vw",
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1,
            marginTop: "0.3vw",
            textAlign: "center",
          }}
        >
          грн
        </span>
      </div>
    </div>
  );
}

export function TopPositionSlide({ dishes }: TopPositionSlideProps) {
  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: "#F8C300",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {dishes.map((dish) => (
        <TopCard key={dish.id} dish={dish} />
      ))}
    </div>
  );
}
