import { useState } from "react";
import { MousePointerTrail } from "../../pages/Preparing";

const ignoreStarGesture = () => {};

export default function PoolSection() {
  const [isFishCursorActive, setIsFishCursorActive] = useState(false);

  const showFishCursor = (event) => {
    setIsFishCursorActive(true);
    event.currentTarget.closest(".home-page")?.classList.add("is-pool-cursor");
  };

  const hideFishCursor = (event) => {
    setIsFishCursorActive(false);
    event.currentTarget
      .closest(".home-page")
      ?.classList.remove("is-pool-cursor");
  };

  return (
    <section className="pool-scene" aria-labelledby="pool-scene-title">
      <h2 id="pool-scene-title" className="visually-hidden">
        수영장 밖으로 나온 날치
      </h2>

      <div className="pool-scene__deck" aria-hidden="true" />
      <div className="pool-scene__wall" aria-hidden="true" />
      <div className="pool-scene__water-edge" aria-hidden="true" />

      <div
        id="ripples3"
        className="pool-scene__interior"
        onPointerEnter={showFishCursor}
        onPointerLeave={hideFishCursor}
        style={{
          "--ripples-background-image": 'url("/assets/pool-background.png")',
        }}
      >
        <span id="fps" hidden aria-hidden="true">
          -- --
        </span>
      </div>

      <div className="pool-scene__ladder" aria-hidden="true">
        <span className="pool-scene__ladder-rail pool-scene__ladder-rail--back" />
        <span className="pool-scene__ladder-rail pool-scene__ladder-rail--front" />
        <span className="pool-scene__ladder-step pool-scene__ladder-step--one" />
        <span className="pool-scene__ladder-step pool-scene__ladder-step--two" />
        <span className="pool-scene__ladder-step pool-scene__ladder-step--three" />
      </div>

      <a
        className="pool-scene__fish-link"
        href="/serises"
        aria-label="serises 페이지로 이동"
      >
        <img
          src="/assets/cursor/flying-fish.png"
          alt="수영장 밖으로 나온 날치"
        />
        <span>go to serises</span>
      </a>

      {isFishCursorActive ? (
        <MousePointerTrail onStarGesture={ignoreStarGesture} />
      ) : null}
    </section>
  );
}
