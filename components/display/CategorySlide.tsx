import Image from "next/image";
import type { SlideGroup } from "@/types";

interface Dish {
  id: string;
  name: string;
  price: number;
  photoUrl: string | null;
}

function CategoryHeader({ name }: { name: string }) {
  return (
    <div
      style={{
        height: "14vh",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <span
        style={{
          color: "#F8C300",
          fontSize: "2.2vw",
          fontWeight: 900,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        &#9670;&nbsp;&nbsp;{name.toUpperCase()}&nbsp;&nbsp;&#9670;
      </span>
      <div
        style={{
          width: "70%",
          height: "1px",
          background: "#F8C300",
          marginTop: "1vh",
          opacity: 0.35,
        }}
      />
    </div>
  );
}

function DishRow({ dish }: { dish: Dish }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        paddingBottom: "1.9vh",
        marginBottom: "0.2vh",
      }}
    >
      <span
        style={{
          color: "#FFFFFF",
          fontSize: "2.2vw",
          fontWeight: 400,
          flexShrink: 1,
          lineHeight: 1.2,
          wordBreak: "break-word",
        }}
      >
        {dish.name}
      </span>
      <span
        style={{
          flex: 1,
          minWidth: "1.5vw",
          borderBottom: "2px dotted #444",
          marginLeft: "0.7vw",
          marginRight: "0.7vw",
          marginBottom: "0.45vw",
        }}
      />
      <span
        style={{
          color: "#F8C300",
          fontSize: "2.2vw",
          fontWeight: 700,
          flexShrink: 0,
          whiteSpace: "nowrap",
          lineHeight: 1.2,
        }}
      >
        {dish.price}&nbsp;&#8372;
      </span>
    </div>
  );
}

function DishList({
  dishes,
  paddingLeft,
  paddingRight,
  borderRight,
}: {
  dishes: Dish[];
  paddingLeft?: string;
  paddingRight?: string;
  borderRight?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        paddingLeft: paddingLeft ?? "3vw",
        paddingRight: paddingRight ?? "3vw",
        paddingTop: "1.5vh",
        paddingBottom: "1.5vh",
        borderRight: borderRight ? "1px solid #2A2A2A" : undefined,
        overflow: "hidden",
      }}
    >
      {dishes.map((dish) => (
        <DishRow key={dish.id} dish={dish} />
      ))}
    </div>
  );
}

interface CategorySlideProps {
  group: SlideGroup;
}

export function CategorySlide({ group }: CategorySlideProps) {
  const isFull =
    group.columns.length === 1 && group.columns[0].position === "FULL";
  const leftCol = group.columns.find((c) => c.position === "LEFT");
  const rightCol = group.columns.find((c) => c.position === "RIGHT");

  return (
    <div
      className="category-slide-enter"
      style={{
        width: "100vw",
        height: "100vh",
        background: "#1A1A1A",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: "3vh 2vw",
        boxSizing: "border-box",
      }}
    >
      {/* Шапка — 8vh, ліво: лого + назва школи, право: заголовок меню */}
      <div
        style={{
          height: "8vh",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #282828",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "5.5vh",
              height: "5.5vh",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <Image
              src="/logo.png"
              alt="Private Boiko School"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <p
            style={{
              marginLeft: "1.4vw",
              color: "#FFFFFF",
              fontSize: "1.3vw",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            PRIVATE BOIKO SCHOOL
          </p>
        </div>
        <p
          style={{
            color: "#F8C300",
            fontSize: "1.4vw",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          МЕНЮ БУФЕТУ
        </p>
      </div>

      {/* Основний вміст — 92vh */}
      {isFull ? (
        // FULL: один заголовок — страви в двох колонках
        <>
          <CategoryHeader name={group.columns[0].category.name} />
          <div
            style={{
              display: "flex",
              flex: 1,
              overflow: "hidden",
            }}
          >
            {(() => {
              const dishes = group.columns[0].category.dishes;
              const half = Math.ceil(dishes.length / 2);
              return (
                <>
                  <DishList
                    dishes={dishes.slice(0, half)}
                    paddingLeft="4vw"
                    paddingRight="3vw"
                    borderRight
                  />
                  <DishList
                    dishes={dishes.slice(half)}
                    paddingLeft="3vw"
                    paddingRight="4vw"
                  />
                </>
              );
            })()}
          </div>
        </>
      ) : (
        // PAIR: дві категорії — кожна у своїй колонці
        <div
          style={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
          }}
        >
          {leftCol && (
            <div
              style={{
                width: "50%",
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid #2A2A2A",
              }}
            >
              <CategoryHeader name={leftCol.category.name} />
              <DishList
                dishes={leftCol.category.dishes}
                paddingLeft="4vw"
                paddingRight="3vw"
              />
            </div>
          )}
          {rightCol && (
            <div
              style={{
                width: "50%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CategoryHeader name={rightCol.category.name} />
              <DishList
                dishes={rightCol.category.dishes}
                paddingLeft="3vw"
                paddingRight="4vw"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
