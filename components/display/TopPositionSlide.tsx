// Слайд топ-позицій — адаптивна висота темної зони, без фіксованих vh
// Цінник: top: 0 + translateY(-60%) у темній зоні → 60% у жовтому, 40% у темному
// Темна зона: flex 0 0 auto + minHeight 22% + boxSizing border-box → росте під назву
// paddingTop: calc(8vmin + 1.5vw) → текст завжди нижче цінника (8vmin = 40% badge)

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
        display: "flex",
        flexDirection: "column",
        marginLeft: "0.25vw",
        marginRight: "0.25vw",
      }}
    >
      {/* ── Жовта зона — займає весь простір над темною зоною ── */}
      <div style={{ flex: 1, position: "relative" }}>
        {dish.photoUrl ? (
          <div
            style={{
              position: "absolute",
              top: "3%",
              left: "5%",
              right: "5%",
              bottom: "3%",
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
      </div>

      {/* ── Темна зона — росте під вміст, мінімум 22% висоти картки ── */}
      {/* overflow: visible — цінник виступає вгору у жовту зону */}
      {/* boxSizing border-box — minHeight включає padding */}
      <div
        style={{
          flex: "0 0 auto",
          minHeight: "22%",
          background: "#1A1A1A",
          position: "relative",
          overflow: "visible",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "calc(8vmin + 1.5vw)",
          paddingBottom: "2vw",
          paddingLeft: "5%",
          paddingRight: "5%",
          boxSizing: "border-box",
        }}
      >
        {/* ── Цінник — top: 0 + translateY(-60%) → 60% у жовтому, 40% у темному ── */}
        {/* Позиція відносно темної зони: завжди на межі, незалежно від висоти зони */}
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

        {/* ── Назва — нижче цінника, без обрізання, 2-3 рядки вільно ── */}
        <p
          style={{
            margin: 0,
            padding: 0,
            fontSize: "2.5vw",
            fontWeight: 900,
            color: "#FFFFFF",
            textTransform: "uppercase",
            textAlign: "center",
            lineHeight: 1.15,
            wordWrap: "break-word",
            maxWidth: "100%",
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
      {dishes.map((dish) => (
        <TopCard key={dish.id} dish={dish} />
      ))}
    </div>
  );
}
