import { useRef } from "react";
import HomeContentSections from "../../components/HomeContentSections";
import PoolSection from "../../components/PoolSection";

const staffSentence =
  "그러니까 예를 들면 이렇게나 작은 글씨로 한 줄 별로 각자의 문장을 적어두는 것이에요";
const staffLine = `${staffSentence} `.repeat(8);

export default function MainPage() {
  const cursorRef = useRef(null);

  const moveCursor = (event) => {
    const cursor = cursorRef.current;

    if (!cursor) {
      return;
    }

    cursor.classList.add("is-visible");
    cursor.style.transform = `translate3d(${event.clientX - 6}px, ${event.clientY - 63}px, 0)`;
  };

  return (
    <main
      className="home-page"
      onPointerEnter={() => cursorRef.current?.classList.add("is-visible")}
      onPointerLeave={() => cursorRef.current?.classList.remove("is-visible")}
      onPointerMove={moveCursor}
    >
      <section className="home-page__hero">
        <div className="home-page__statement" aria-labelledby="home-title">
          <h1 id="home-title">
            we uncover music from
            <br />
            one another&apos;s writing
          </h1>
        </div>

        <div className="home-score" aria-label="문장으로 만든 오선지">
          <div className="home-score__lines">
            <img
              className="home-score__clef"
              src="/assets/home/treble-clef.png"
              alt=""
              aria-hidden="true"
            />
            {Array.from({ length: 5 }, (_, index) => (
              <p className="home-score__line" key={index}>
                <span>{staffLine}</span>
              </p>
            ))}
          </div>
        </div>
      </section>

      <PoolSection />
      <HomeContentSections />

      <div ref={cursorRef} className="digging-cursor" aria-hidden="true">
        <img src="/assets/cursor/digging-pen.png" alt="" draggable="false" />
      </div>
    </main>
  );
}
