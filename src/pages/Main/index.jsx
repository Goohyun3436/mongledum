import { useRef } from "react";
import HomeContentSections from "../../components/HomeContentSections";
import PoolSection from "../../components/PoolSection";
import playDigAnimation from "../../utils/playDigAnimation";

const staffSentence =
  "그러니까 예를 들면 이렇게나 작은 글씨로 한 줄 별로 각자의 문장을 적어두는 것이에요";
const staffLine = `${staffSentence} `.repeat(8);

const scoreNotes = [
  { name: "jaewook", label: "재욱", src: "/assets/profile/jaewook/note.png" },
  { name: "hyeongu", label: "형우", src: "/assets/profile/hyeongu/note.png" },
  { name: "jin", label: "구진", src: "/assets/profile/jin/note.png" },
  { name: "jeagyun", label: "재균", src: "/assets/profile/jeagyun/note.png" },
  { name: "seoeum", label: "서음", src: "/assets/profile/seoeum/note.png" },
  { name: "hyun", label: "구헌", src: "/assets/profile/hyun/note.png" },
];

export default function MainPage() {
  const cursorRef = useRef(null);

  const moveCursor = (event) => {
    const cursor = cursorRef.current;

    if (!cursor) {
      return;
    }

    cursor.classList.add("is-visible");
    cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY - 70}px, 0)`;
  };

  const dig = (event) => playDigAnimation(cursorRef.current, event);

  const openMember = (name) => {
    window.history.pushState({}, "", `/about?member=${name}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo(0, 0);
  };

  return (
    <main
      className="home-page"
      onPointerEnter={() => cursorRef.current?.classList.add("is-visible")}
      onPointerLeave={() => cursorRef.current?.classList.remove("is-visible")}
      onPointerMove={moveCursor}
      onPointerDown={dig}
    >
      <section className="home-page__hero">
        <div className="home-stage">
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
                src="/assets/main/treble-clef.png"
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

          <div className="home-score__notes" aria-label="몽글듬 멤버">
            {scoreNotes.map((note, index) => (
              <button
                className={`home-score__note home-score__note--${index + 1}`}
                type="button"
                onClick={() => openMember(note.name)}
                onPointerDown={(event) => event.stopPropagation()}
                aria-label={`${note.label} 소개 보기`}
                key={note.name}
              >
                {note.name === "hyun" && (
                  <img
                    className="home-score__hole"
                    src="/assets/main/dirt-hole.png"
                    alt=""
                    draggable="false"
                  />
                )}
                <img className="home-score__person" src={note.src} alt="" draggable="false" />
              </button>
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
