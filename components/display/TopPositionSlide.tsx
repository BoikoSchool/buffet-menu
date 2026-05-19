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

// Картка однієї топ-позиції
// Ширина: 29vw (~557px), Висота: 88vh (~950px)
//
// Розбиття висоти (% від висоти картки):
//   3%  — верхній відступ
//  52%  — зона фото (максимальний герой)
//   3%  — відступ фото→назва
//  13%  — назва (1-2 рядки)
//   3%  — відступ назва→коло
//  23%  — діаметр червоного кола (11.4vw ≈ 219px = 23% від 88vh)
//   3%  — нижній відступ
// = 100%
function TopCard({ dish }: { dish: TopDish }) {
  const circleDiam = "11.4vw";

  return (
    <div
      style={{
        position: "relative",
        width: "29vw",
        height: "88vh",
        flexShrink: 0,
        marginLeft: "2vw",
        marginRight: "2vw",
      }}
    >
      {/* ── Зона фото: top=3%, height=52%, width=90% ── */}
      <div
        style={{
          position: "absolute",
          top: "3%",
          left: "5%",
          width: "90%",
          height: "52%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {dish.photoUrl ? (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Image
              src={dish.photoUrl}
              alt={dish.name}
              fill
              sizes="26vw"
              style={{
                objectFit: "contain",
                mixBlendMode: "multiply",
              }}
            />
          </div>
        ) : null}
      </div>

      {/* ── Назва: top=58% (3+52+3), height=13% ── */}
      <div
        style={{
          position: "absolute",
          top: "58%",
          left: "8%",
          width: "84%",
          height: "13%",
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
            // Обрізання до 2 рядків — надійно для WebKit 2013+
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {dish.name}
        </p>
      </div>

      {/* ── Червоне коло: top=74% (58+13+3), центроване по X ── */}
      <div
        style={{
          position: "absolute",
          top: "74%",
          left: "50%",
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
