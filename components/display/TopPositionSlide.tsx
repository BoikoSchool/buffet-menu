// Слайд топ-позицій — сумісний зі старими браузерами Smart TV (WebKit 2014+)
// Двосекційна картка: жовта "вітрина" 70% + темний "постамент" 30%
// Цінник на межі зон: bottom = 30vh - 11vh = 19vh
// Без gap, без clamp, без aspect-ratio — vw/vh і position:absolute

import Image from "next/image";

// SVG-шум для тактильної текстури жовтої зони (feTurbulence — WebKit 2011+)
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
        height: "100%",
        overflow: "hidden",
        marginLeft: "0.25vw",
        marginRight: "0.25vw",
      }}
    >
      {/* ── Верхня зона 70% — жовта "вітрина" з текстурою шуму ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "70%",
          background: `${NOISE_BG}, radial-gradient(circle at center, #FFD11A 0%, #F8C300 50%, #D9A800 100%)`,
          backgroundBlendMode: "overlay",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {dish.photoUrl ? (
          <div
            style={{
              marginTop: "2vh",
              width: "95%",
              height: "50vh",
              position: "relative",
            }}
          >
            <Image
              src={dish.photoUrl}
              alt={dish.name}
              fill
              sizes="33vw"
              style={{
                objectFit: "contain",
                filter: "drop-shadow(0 1.5vh 2vh rgba(0,0,0,0.3))",
              }}
            />
          </div>
        ) : null}
      </div>

      {/* ── Нижня зона 30% — темний "постамент" ── */}
      {/* paddingTop 12vh: текст одразу під цінником (11vh нижня половина + 1vh зазор) */}
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
          justifyContent: "flex-start",
          paddingTop: "12vh",
          paddingBottom: "2vh",
          paddingLeft: "5%",
          paddingRight: "5%",
        }}
      >
        <p
          style={{
            margin: 0,
            padding: 0,
            fontSize: "3vw",
            fontWeight: 900,
            color: "#FFFFFF",
            textTransform: "uppercase",
            textAlign: "center",
            lineHeight: 1.1,
            wordWrap: "break-word",
            maxWidth: "90%",
          }}
        >
          {dish.name}
        </p>
      </div>

      {/* ── Червоний цінник — центр рівно на межі 70%/30% ── */}
      {/* bottom: 19vh = 30vh (межа зон) − 11vh (половина 22vh кола) */}
      <div
        style={{
          position: "absolute",
          bottom: "19vh",
          left: "50%",
          transform: "translateX(-50%)",
          width: "22vh",
          height: "22vh",
          borderRadius: "50%",
          background: "#DC1F26",
          border: "0.4vh solid #FFFFFF",
          boxShadow:
            "0 1vh 3vh rgba(0,0,0,0.35), 0 0 5vh rgba(220,31,38,0.4), 0 0 8vh rgba(220,31,38,0.2)",
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
            fontSize: "1.5vw",
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1,
            marginTop: "0.5vh",
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
        overflow: "hidden",
        display: "flex",
        alignItems: "stretch",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {dishes.map((dish) => (
        <TopCard key={dish.id} dish={dish} />
      ))}
    </div>
  );
}
