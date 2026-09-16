import { useEffect, useRef, useState } from "react";
import { getContentUrl, parseContentFile } from "../../utils/contentFiles";

const BOOK_VIEWS = {
  front: { angle: 14, label: "앞표지" },
  spine: { angle: 40, label: "책등" },
  back: { angle: 194, label: "뒤표지" },
};
const BOOK_VIEW_ORDER = ["front", "spine", "back"];

function AlbumBook3D({ album }) {
  const [view, setView] = useState("front");
  const [angle, setAngle] = useState(BOOK_VIEWS.front.angle);
  const pointerStartRef = useRef(null);
  const introTimersRef = useRef([]);

  const cancelIntro = () => {
    introTimersRef.current.forEach(window.clearTimeout);
    introTimersRef.current = [];
  };

  const showView = (nextView) => {
    cancelIntro();
    setView(nextView);
    setAngle(BOOK_VIEWS[nextView].angle);
  };

  const stepView = (direction) => {
    const currentIndex = BOOK_VIEW_ORDER.indexOf(view);
    const nextIndex = Math.max(0, Math.min(BOOK_VIEW_ORDER.length - 1, currentIndex + direction));
    showView(BOOK_VIEW_ORDER[nextIndex]);
  };

  useEffect(() => {
    cancelIntro();
    setView("front");
    setAngle(BOOK_VIEWS.front.angle);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let readyTimer;
    const startIntro = () => {
      const pageGate = document.querySelector(".page-image-gate");
      if (pageGate && !pageGate.classList.contains("is-ready")) {
        readyTimer = window.setTimeout(startIntro, 100);
        return;
      }
      introTimersRef.current = [
        window.setTimeout(() => setAngle(BOOK_VIEWS.back.angle), 500),
        window.setTimeout(() => {
          setAngle(BOOK_VIEWS.front.angle);
          introTimersRef.current = [];
        }, 2400),
      ];
    };
    if (!reducedMotion.matches) startIntro();
    return () => {
      window.clearTimeout(readyTimer);
      cancelIntro();
    };
  }, [album.directory]);

  const handleImageError = (event) => { event.currentTarget.hidden = true; };
  const handleImageLoad = (event) => { event.currentTarget.hidden = false; };

  return (
    <section className="music-book3d" aria-label={`${album.title} 앨범 자켓 3D 미리보기`}>
      <div
        className="music-book3d__scene"
        tabIndex="0"
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          stepView(event.key === "ArrowRight" ? 1 : -1);
        }}
        onPointerDown={(event) => {
          pointerStartRef.current = event.clientX;
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }}
        onPointerUp={(event) => {
          if (pointerStartRef.current === null) return;
          const distance = event.clientX - pointerStartRef.current;
          pointerStartRef.current = null;
          if (Math.abs(distance) >= 35) stepView(distance < 0 ? 1 : -1);
        }}
        onPointerCancel={() => { pointerStartRef.current = null; }}
      >
        <div className="music-book3d__book" style={{ "--music-book-angle": `${angle}deg` }} aria-hidden="true">
          <div className="music-book3d__face music-book3d__front">
            <img src={album.frontCover} alt="" onLoad={handleImageLoad} onError={handleImageError} />
          </div>
          <div className="music-book3d__face music-book3d__spine">
            <span><img src={album.frontCover} alt="" onLoad={handleImageLoad} onError={handleImageError} /></span>
          </div>
          <div className="music-book3d__edge music-book3d__fore-edge" />
          <div className="music-book3d__edge music-book3d__top-edge" />
          <div className="music-book3d__edge music-book3d__bottom-edge" />
          <div className="music-book3d__face music-book3d__back">
            <img src={album.backCover} alt="" onLoad={handleImageLoad} onError={handleImageError} />
          </div>
        </div>
      </div>

      <div className="music-book3d__controls" aria-label="앨범 자켓 방향 선택">
        {BOOK_VIEW_ORDER.map((key) => (
          <button type="button" aria-pressed={view === key} onClick={() => showView(key)} key={key}>{BOOK_VIEWS[key].label}</button>
        ))}
      </div>
      <p className="music-book3d__status" role="status" aria-live="polite">{BOOK_VIEWS[view].label}</p>
      <p className="music-book3d__hint">좌우로 밀거나 화살표 키를 눌러도 전환됩니다.</p>
    </section>
  );
}

export default function MusicPage() {
  const [albums, setAlbums] = useState([]);
  const [activeAlbumIndex, setActiveAlbumIndex] = useState(0);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [status, setStatus] = useState("loading");
  const [isAlbumHeaderScrolled, setIsAlbumHeaderScrolled] = useState(false);

  useEffect(() => {
    document.body.classList.add("is-music-page");
    return () => document.body.classList.remove("is-music-page");
  }, []);

  useEffect(() => {
    const innerScroller = document.querySelector(".music-page");
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0 || (innerScroller?.scrollTop ?? 0) > 0;
      setIsAlbumHeaderScrolled(isScrolled);
      document.body.classList.toggle("is-music-header-scrolled", isScrolled);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    innerScroller?.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      innerScroller?.removeEventListener("scroll", handleScroll);
      document.body.classList.remove("is-music-header-scrolled");
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/docs/files.json", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("음악 목록을 불러오지 못했습니다.");
        const manifest = await response.json();
        return Promise.all((manifest.years ?? []).flatMap((year) =>
          (year.albums ?? []).filter((album) => album.items?.some((item) => item.hasMusic)).map(async (album) => {
            const albumSource = album.albumFile
              ? await fetch(getContentUrl(year.year, album.directory, album.albumFile), { signal: controller.signal }).then((result) => result.text())
              : "";
            const albumInfo = parseContentFile(albumSource);
            const tracks = await Promise.all(album.items.filter((item) => item.hasMusic).map(async (item) => {
              const source = await fetch(getContentUrl(year.year, album.directory, item.directory, "music.txt"), { signal: controller.signal }).then((result) => {
                if (!result.ok) throw new Error("곡 정보를 불러오지 못했습니다.");
                return result.text();
              });
              return { ...parseContentFile(source), index: item.index, title: item.title, directory: item.directory };
            }));
            return {
              ...album,
              ...albumInfo,
              year: year.year,
              tracks,
              frontCover: getContentUrl(year.year, album.directory, album.cover || "cover.png"),
              backCover: getContentUrl(year.year, album.directory, album.coverBack || "cover-back.png"),
            };
          }),
        ));
      })
      .then((loadedAlbums) => {
        setAlbums(loadedAlbums);
        const params = new URLSearchParams(window.location.search);
        const requestedAlbumIndex = loadedAlbums.findIndex((album) => album.year === params.get("year") && album.directory === params.get("album"));
        const latestAlbumIndex = loadedAlbums.reduce((latestIndex, album, index, list) => {
          if (latestIndex < 0) return index;
          const latest = list[latestIndex];
          const yearOrder = album.year.localeCompare(latest.year, "ko", { numeric: true });
          const albumOrder = album.index.localeCompare(latest.index, "ko", { numeric: true });
          return yearOrder > 0 || (yearOrder === 0 && albumOrder > 0) ? index : latestIndex;
        }, -1);
        const initialAlbumIndex = requestedAlbumIndex >= 0 ? requestedAlbumIndex : Math.max(0, latestAlbumIndex);
        const requestedTrack = params.get("track");
        const requestedTrackIndex = loadedAlbums[initialAlbumIndex]?.tracks.findIndex((track) => track.directory === requestedTrack) ?? -1;
        setActiveAlbumIndex(initialAlbumIndex);
        setActiveTrackIndex(requestedTrackIndex >= 0 ? requestedTrackIndex : 0);
        setStatus("ready");
      })
      .catch((error) => { if (error.name !== "AbortError") setStatus("error"); });
    return () => controller.abort();
  }, []);

  const activeAlbum = albums[activeAlbumIndex];
  const tracks = activeAlbum?.tracks ?? [];
  const activeTrack = tracks[activeTrackIndex];

  const selectAlbum = (index) => {
    setActiveAlbumIndex(index);
    setActiveTrackIndex(0);
  };
  const moveTrack = (direction) => setActiveTrackIndex((current) => (current + direction + tracks.length) % tracks.length);

  if (status === "loading") return <main className="music-page"><p className="music-page__status">음악을 펼치는 중...</p></main>;
  if (status === "error" || !activeAlbum || !activeTrack) return <main className="music-page"><p className="music-page__status">음악을 불러오지 못했습니다.</p></main>;

  return (
    <main className="music-page">
      <nav className={`music-project-tabs${isAlbumHeaderScrolled ? " is-scrolled" : ""}`} aria-label="앨범">
        {albums.map((album, index) => (
          <button className={index === activeAlbumIndex ? "is-active" : ""} key={`${album.year}-${album.directory}`} type="button" onClick={() => selectAlbum(index)}>{album.title}</button>
        ))}
      </nav>

      <div className="music-album-layout">
        <AlbumBook3D album={activeAlbum} />
        <header className="music-intro music-intro--side">
          <h1>{activeAlbum.title}</h1>
          <p className="music-intro__subtitle">{activeAlbum.year} · {activeAlbum.index}</p>
          <span className="music-intro__line" aria-hidden="true" />
          <div className="music-intro__description">{(activeAlbum.paragraphs ?? []).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>)}</div>
        </header>
      </div>

      <section className="music-track-panel music-track-panel--below" aria-label={`${activeAlbum.title} 수록곡`}>
          <div className="music-track-panel__list" role="tablist" aria-label="곡 선택">
            {tracks.map((track, index) => (
              <button type="button" role="tab" aria-selected={index === activeTrackIndex} className={index === activeTrackIndex ? "is-active" : ""} onClick={() => setActiveTrackIndex(index)} key={track.directory}>
                <span>{track.index}</span>{track.title}
              </button>
            ))}
          </div>

          <article className="music-track-copy" key={`${activeAlbum.directory}-${activeTrack.directory}`}>
            <p className="music-track-copy__number">Track. {activeTrack.index}</p>
            <h2>{activeTrack.title}</h2>
            {activeTrack.date && <p className="music-track-copy__date">{activeTrack.date}</p>}
            {activeTrack.composition && <p className="music-track-copy__credit"><span>작곡</span>{activeTrack.composition}</p>}
            {activeTrack.lyrics && <p className="music-track-copy__credit"><span>작사</span>{activeTrack.lyrics}</p>}
            <div className="music-track-copy__description">{(activeTrack.paragraphs ?? []).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>)}</div>
            {activeTrack.youtube && <a href={activeTrack.youtube} target="_blank" rel="noreferrer">{activeTrack.title} 들으러 가기 ↗</a>}
          </article>

          {tracks.length > 1 && (
            <div className="music-track-panel__navigation">
              <button type="button" onClick={() => moveTrack(-1)}>이전 곡</button>
              <span>{activeTrackIndex + 1} / {tracks.length}</span>
              <button type="button" onClick={() => moveTrack(1)}>다음 곡</button>
            </div>
          )}
      </section>
    </main>
  );
}
