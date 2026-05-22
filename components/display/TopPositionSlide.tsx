// Слайд топ-позицій — фіксована темна зона 30%, однакова геометрія всіх карток
// Шапка: position absolute, h=10%, один div на весь слайд (не на кожну картку)
// Цінник: absolute у темній зоні, translateY(-60%) → 60% у жовтому, 40% у темному
// Фото: PNG з вбудованою декорацією (арка, тінь) — жодних CSS-ефектів на зображенні

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
      {/* ── Фото — PNG з вбудованою декорацією, без CSS-ефектів ── */}
      {dish.photoUrl ? (
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: 0,
            right: 0,
            bottom: "30%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dish.photoUrl}
            alt={dish.name}
            style={{
              maxWidth: "95%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
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
        background: "#f8de80ff",
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
            height: "8vh",
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
