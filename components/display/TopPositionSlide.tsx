// Слайд топ-позицій — фіксована темна зона 30%, однакова геометрія всіх карток
// Шапка: position absolute, h=10%, один div на весь слайд (не на кожну картку)
// Цінник: absolute у темній зоні, translateY(-60%) → 60% у жовтому, 40% у темному
// Назва: 2.2vw, max 3 рядки через maxHeight 8vw — симетрія важливіша за автоадаптацію

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
        position: "relative",
        flex: "1 1 0",
        minWidth: 0,
        height: "100%",
        marginLeft: "0.25vw",
        marginRight: "0.25vw",
      }}
    >
      {/* ── Фото — починається після шапки (11% = 10% шапка + 1% зазор) ── */}
      {dish.photoUrl ? (
        <div
          style={{
            position: "absolute",
            top: "11%",
            left: "5%",
            right: "5%",
            bottom: "30%",
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

      {/* ── Темна зона — фіксована 30% висоти, однакова для всіх карток ── */}
      {/* overflow: visible (default) — дозволяє цінникові виступати у жовту зону */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "30%",
          background: "#1A1A1A",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "4vw 2vw 2vw 2vw",
          boxSizing: "border-box",
        }}
      >
        {/* ── Цінник — top: 0 + translateY(-60%) → завжди на межі зон ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translate(-50%, -60%)",
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

        {/* ── Назва — фіксований шрифт 2.2vw, макс 3 рядки ── */}
        <p
          style={{
            margin: 0,
            padding: 0,
            fontSize: "2.2vw",
            fontWeight: 900,
            color: "#FFFFFF",
            textTransform: "uppercase",
            textAlign: "center",
            lineHeight: 1.15,
            wordWrap: "break-word",
            overflowWrap: "break-word",
            maxWidth: "90%",
            maxHeight: "8vw",
            overflow: "hidden",
          }}
        >
          {dish.name}
        </p>
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
        background: `${NOISE_BG}, radial-gradient(ellipse at 50% 35%, #FFD11A 0%, #F8C300 55%, #D9A800 100%)`,
        backgroundBlendMode: "overlay",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {/* ── Шапка бренду — один div на весь слайд, поверх карток ── */}
      {/* boxSizing border-box: paddingTop не виходить за height 10% */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "10%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "2.5vh",
          paddingLeft: "3vw",
          paddingRight: "3vw",
          zIndex: 5,
        }}
      >
        <span
          style={{
            fontSize: "1.8vw",
            fontWeight: 900,
            color: "#1A1A1A",
            textTransform: "uppercase",
            letterSpacing: "0.1vw",
            lineHeight: 1,
          }}
        >
          BOIKO FOOD
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Boiko School"
          style={{
            height: "7vh",
            width: "auto",
            // Перетворює логотип на чорний силует — добре видно на жовтому
            // Прибери filter якщо логотип вже темного кольору
            filter: "brightness(0) saturate(100%)",
          }}
        />
        <span
          style={{
            fontSize: "1.2vw",
            fontWeight: 700,
            color: "#1A1A1A",
            textTransform: "uppercase",
            letterSpacing: "0.08vw",
            lineHeight: 1,
          }}
        >
          ◆ ТОП ТИЖНЯ ◆
        </span>
      </div>

      {dishes.map((dish) => (
        <TopCard key={dish.id} dish={dish} />
      ))}
    </div>
  );
}
