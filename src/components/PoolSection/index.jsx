const COMIC_DETAIL_HREF = `/serises/${[
  "2026",
  "001-mongledum 001 (feat. 김먼지)",
  "works",
  "cartoon",
  "001-그 순간에는 내가 있을게",
].map(encodeURIComponent).join("/")}`;

export default function PoolSection() {
  return (
    <section className="pool-scene" aria-labelledby="pool-scene-title">
      <h2 id="pool-scene-title" className="visually-hidden">
        김먼지 해변의 날치
      </h2>

      <a
        className="pool-scene__fish-link"
        href={COMIC_DETAIL_HREF}
        aria-label="그 순간에는 내가 있을게 만화 상세페이지로 이동"
      >
        <img
          src="/assets/cursor/flying-fish.png"
          alt="수영장 밖으로 나온 날치"
        />
        <span>{"<그 순간에는 내가 있을게> 중편 만화"}</span>
      </a>
    </section>
  );
}
