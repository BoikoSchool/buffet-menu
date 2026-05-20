// Слайд топ-позицій — без фіксованих vh всередині карток
// Висоти через flex % — стабільно на будь-якому viewport (960×434 або 1920×1080)
// Цінник через vmin: на ландшафті vmin=vh, тому 20vmin=20% висоти картки
// bottom: 15% = 25% (темна зона) − 10% (пів-цінника) → центр точно на межі
// Без aspect-ratio, без clamp, без gap

import Image from "next/image";

// SVG-шум для тактильності жовтої зони (feTurbulence — Chrome 26+)
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
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        marginLeft: "0.25vw",
        marginRight: "0.25vw",
      }}
    >
      {/* ── Жовта "вітрина" — займає весь простір після темної зони ── */}
      <div
        style={{
          flex: 1,
          background: `${NOISE_BG}, radial-gradient(circle at center, #FFD11A 0%, #F8C300 50%, #D9A800 100%)`,
          backgroundBlendMode: "overlay",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {dish.photoUrl ? (
          <div
            style={{
              position: "relative",
              width: "85%",
              height: "80%",
            }}
          >
            <Image
              src={dish.photoUrl}
              alt={dish.name}
              fill
              sizes="33vw"
              style={{
                objectFit: "contain",
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
              }}
            />
          </div>
        ) : null}
      </div>

      {/* ── Темний "постамент" — фіксовані 25% висоти картки ── */}
      <div
        style={{
          flex: "0 0 25%",
          background: "#1A1A1A",
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
            fontSize: "1.6vw",
            fontWeight: 900,
            color: "#FFFFFF",
            textTransform: "uppercase",
            textAlign: "center",
            lineHeight: 1.1,
            wordWrap: "break-word",
            maxWidth: "100%",
          }}
        >
          {dish.name}
        </p>
      </div>

      {/* ── Червоний цінник — vmin для розміру, bottom: 15% для позиції ── */}
      {/* На ландшафті: vmin=vh, 20vmin=20% картки, пів=10%, bottom=25%-10%=15% */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
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
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: "4vmin",
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
            fontSize: "1.2vmin",
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
        // JS у DisplayLoop виставляє --vh = window.innerHeight * 0.01
        // calc() з var() підтримується в Chrome 49+ (TV: Chrome 132 ✓)
        height: "calc(var(--vh, 1vh) * 100)" as string,
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
        background: "#F8C300",
      }}
    >
      {dishes.map((dish) => (
        <TopCard key={dish.id} dish={dish} />
      ))}
    </div>
  );
}
