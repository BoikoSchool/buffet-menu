// Слайд топ-позицій — без фіксованих vh всередині карток
// Архітектура:
//   • Жовтий фон + шум — на батьківському контейнері (єдиний для всіх карток)
//   • Темна зона — окремий absolute div на всю ширину слайда
//   • Картки — прозорі, тільки структурують photo / назву / цінник
// Математика цінника (ландшафт, vmin=vh):
//   badge = 20vmin = 20% висоти картки → пів-badge = 10%
//   bottom = 22% (темна зона) − 8% (40% badge) = 14% → 60% у жовтому, 40% у темному

import Image from "next/image";

const NOISE_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.18'/%3E%3C/svg%3E")`;

interface TopDish {
  id: string;
  name: string;
  price: number;
  photoUrl: string | null;
}

interface TopPositionSlideProps {
  dishes: TopDish[];
}

function TopCard({ dish }: { dish: TopDish }) {
  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 0,
        height: "100%",
        position: "relative",
        overflow: "hidden",
        marginLeft: "0.25vw",
        marginRight: "0.25vw",
      }}
    >
      {/* ── Фото — від 3% зверху до межі темної зони ── */}
      {dish.photoUrl ? (
        <div
          style={{
            position: "absolute",
            top: "3%",
            left: "5%",
            right: "5%",
            bottom: "22%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Image
              src={dish.photoUrl}
              alt={dish.name}
              fill
              sizes="33vw"
              style={{
                objectFit: "contain",
                filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.35))",
              }}
            />
          </div>
        </div>
      ) : null}

      {/* ── Назва — поверх спільної темної зони (прозорий фон картки) ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "22%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: "5%",
          paddingRight: "5%",
        }}
      >
        <p
          style={{
            margin: 0,
            padding: 0,
            fontSize: "2.5vw",
            fontWeight: 900,
            color: "#FFFFFF",
            textTransform: "uppercase",
            textAlign: "center",
            lineHeight: 1.1,
            wordWrap: "break-word",
          }}
        >
          {dish.name}
        </p>
      </div>

      {/* ── Червоний цінник — 60% у жовтому, 40% у темному ── */}
      <div
        style={{
          position: "absolute",
          bottom: "14%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "20vmin",
          height: "20vmin",
          borderRadius: "50%",
          background: "#DC1F26",
          border: "0.4vmin solid #FFFFFF",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.35), 0 0 20px rgba(220,31,38,0.4), 0 0 35px rgba(220,31,38,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: "3.8vw",
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
            fontSize: "1.1vw",
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1,
            marginTop: "0.3em",
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
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "calc(var(--vh, 1vh) * 100)" as string,
        overflow: "hidden",
        // Єдиний жовтий фон + шум для всіх карток — усуває чорні смуги між ними
        background: `${NOISE_BG}, radial-gradient(ellipse at 50% 35%, #FFD11A 0%, #F8C300 55%, #D9A800 100%)`,
        backgroundBlendMode: "overlay",
      }}
    >
      {/* ── Спільна темна зона — вся ширина слайда, 22% висоти ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "22%",
          background: "#1A1A1A",
          zIndex: 1,
        }}
      />

      {/* ── Картки — прозорі, zIndex вище темної зони ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "row",
          zIndex: 2,
        }}
      >
        {dishes.map((dish) => (
          <TopCard key={dish.id} dish={dish} />
        ))}
      </div>
    </div>
  );
}
