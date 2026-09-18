import { useEffect, useRef, useState } from "react";
import { FaApple, FaInstagram, FaSpotify, FaYoutube } from "react-icons/fa";
import { FiArrowUpRight, FiMusic } from "react-icons/fi";
import { getContentUrl, parseContentFile } from "../../utils/contentFiles";

const MUSIC_LINK_TYPES = [
  { key: "youtube", label: "youtube", icon: FaYoutube },
  { key: "youtube_music", label: "youtube music", icon: FaYoutube },
  { key: "instagram", label: "instagram", icon: FaInstagram },
  { key: "melon", label: "melon", icon: FiMusic },
  { key: "apple_music", label: "apple music", icon: FaApple },
  { key: "spotify", label: "spotify", icon: FaSpotify },
  { key: "genie", label: "genie", icon: FiMusic },
  { key: "bugs", label: "bugs", icon: FiMusic },
  { key: "vibe", label: "vibe", icon: FiMusic },
  { key: "flo", label: "flo", icon: FiMusic },
];

const BOOK_VIEWS = {
  front: { angle: 14, label: "앞표지" },
  spine: { angle: 40, label: "책등" },
  back: { angle: 194, label: "뒤표지" },
};
const BOOK_VIEW_ORDER = ["front", "spine", "back"];

function formatReleaseDate(value = "") {
  const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return value;
  return `${match[1]}년 ${match[2].padStart(2, "0")}월 ${match[3].padStart(2, "0")}일`;
}

function AlbumBook3D({ album }) {
  const [view, setView] = useState("front");
  const [angle, setAngle] = useState(BOOK_VIEWS.front.angle);
  const [isDragging, setIsDragging] = useState(false);
  const [isFreeRotating, setIsFreeRotating] = useState(false);
  const angleRef = useRef(BOOK_VIEWS.front.angle);
  const pointerStartRef = useRef(null);
  const introTimersRef = useRef([]);
  const idleTimerRef = useRef(null);
  const animationFrameRef = useRef(null);

  const cancelIntro = () => {
    introTimersRef.current.forEach(window.clearTimeout);
    introTimersRef.current = [];
  };

  const updateAngle = (nextAngle) => {
    angleRef.current = nextAngle;
    setAngle(nextAngle);
  };

  const cancelFreeRotation = () => {
    window.clearTimeout(idleTimerRef.current);
    window.cancelAnimationFrame(animationFrameRef.current);
    idleTimerRef.current = null;
    animationFrameRef.current = null;
    setIsFreeRotating(false);
  };

  const startIdleRotation = () => {
    cancelFreeRotation();
    idleTimerRef.current = window.setTimeout(() => {
      setIsFreeRotating(true);
      let previousTime;
      const rotate = (time) => {
        if (previousTime !== undefined) updateAngle(angleRef.current + (time - previousTime) * 0.008);
        previousTime = time;
        animationFrameRef.current = window.requestAnimationFrame(rotate);
      };
      animationFrameRef.current = window.requestAnimationFrame(rotate);
    }, 1800);
  };

  const startInertia = (initialVelocity) => {
    cancelFreeRotation();
    if (Math.abs(initialVelocity) < 0.00005) {
      startIdleRotation();
      return;
    }
    setIsFreeRotating(true);
    let velocity = initialVelocity;
    let previousTime;
    const coast = (time) => {
      if (previousTime !== undefined) {
        const elapsed = Math.min(time - previousTime, 32);
        updateAngle(angleRef.current + velocity * elapsed);
        velocity *= Math.pow(0.97, elapsed / 16.67);
      }
      previousTime = time;
      if (Math.abs(velocity) < 0.0002) {
        animationFrameRef.current = null;
        setIsFreeRotating(false);
        startIdleRotation();
        return;
      }
      animationFrameRef.current = window.requestAnimationFrame(coast);
    };
    animationFrameRef.current = window.requestAnimationFrame(coast);
  };

  const getNearestEquivalentAngle = (targetAngle) => (
    targetAngle + Math.round((angleRef.current - targetAngle) / 360) * 360
  );

  const showView = (nextView) => {
    cancelIntro();
    cancelFreeRotation();
    setView(nextView);
    updateAngle(getNearestEquivalentAngle(BOOK_VIEWS[nextView].angle));
    startIdleRotation();
  };

  const stepView = (direction) => {
    const currentIndex = BOOK_VIEW_ORDER.indexOf(view);
    const nextIndex = Math.max(0, Math.min(BOOK_VIEW_ORDER.length - 1, currentIndex + direction));
    showView(BOOK_VIEW_ORDER[nextIndex]);
  };

  useEffect(() => {
    cancelIntro();
    cancelFreeRotation();
    setView("front");
    updateAngle(getNearestEquivalentAngle(BOOK_VIEWS.front.angle));
    introTimersRef.current = [
      window.setTimeout(() => updateAngle(getNearestEquivalentAngle(BOOK_VIEWS.back.angle)), 650),
      window.setTimeout(() => {
        updateAngle(getNearestEquivalentAngle(BOOK_VIEWS.front.angle));
        introTimersRef.current = [];
        startIdleRotation();
      }, 2500),
    ];
    return () => {
      cancelIntro();
      cancelFreeRotation();
    };
  }, [album.directory]);

  const handleImageError = (event) => { event.currentTarget.hidden = true; };
  const handleImageLoad = (event) => { event.currentTarget.hidden = false; };

  return (
    <section className="music-book3d" aria-label={`${album.title} 앨범 자켓 3D 미리보기`}>
      <div
        className={`music-book3d__scene${isDragging ? " is-dragging" : ""}${isFreeRotating ? " is-free-rotating" : ""}`}
        tabIndex="0"
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          stepView(event.key === "ArrowRight" ? 1 : -1);
        }}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          event.preventDefault();
          cancelIntro();
          cancelFreeRotation();
          setIsDragging(true);
          pointerStartRef.current = { x: event.clientX, angle: angleRef.current, lastX: event.clientX, lastTime: event.timeStamp, velocity: 0 };
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!pointerStartRef.current) {
            cancelFreeRotation();
            startIdleRotation();
            return;
          }
          const pointer = pointerStartRef.current;
          const distance = event.clientX - pointer.x;
          const elapsed = Math.max(event.timeStamp - pointer.lastTime, 1);
          const instantVelocity = (event.clientX - pointer.lastX) * 0.55 / elapsed;
          pointer.velocity = pointer.velocity * 0.35 + instantVelocity * 0.65;
          pointer.lastX = event.clientX;
          pointer.lastTime = event.timeStamp;
          updateAngle(pointer.angle + distance * 0.55);
        }}
        onPointerUp={() => {
          if (pointerStartRef.current === null) return;
          const velocity = pointerStartRef.current.velocity;
          pointerStartRef.current = null;
          setIsDragging(false);
          startInertia(velocity * 1.8);
        }}
        onPointerCancel={() => {
          pointerStartRef.current = null;
          setIsDragging(false);
          startIdleRotation();
        }}
      >
        <div className="music-book3d__book" style={{ "--music-book-angle": `${angle}deg` }} aria-hidden="true">
          <div className="music-book3d__face music-book3d__front">
            <img src={album.frontCover} alt="" draggable="false" onLoad={handleImageLoad} onError={handleImageError} />
          </div>
          <div className="music-book3d__face music-book3d__spine">
            <span><img src={album.spineCover} alt="" draggable="false" onLoad={handleImageLoad} onError={handleImageError} /></span>
          </div>
          <div className="music-book3d__edge music-book3d__fore-edge" />
          <div className="music-book3d__edge music-book3d__top-edge" />
          <div className="music-book3d__edge music-book3d__bottom-edge" />
          <div className="music-book3d__face music-book3d__back">
            <img src={album.backCover} alt="" draggable="false" onLoad={handleImageLoad} onError={handleImageError} />
          </div>
        </div>
      </div>

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
              title: album.title,
              introductionTitle: albumInfo.title || "",
              introductionAuthor: albumInfo.author || "",
              introductionAuthorUrl: albumInfo.author_url || "",
              year: year.year,
              tracks,
              frontCover: getContentUrl(year.year, album.directory, album.cover || "cover.png"),
              spineCover: getContentUrl(year.year, album.directory, album.coverSpine || album.cover || "cover.png"),
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
        setActiveTrackIndex(requestedTrackIndex >= 0 ? requestedTrackIndex : -1);
        setStatus("ready");
      })
      .catch((error) => { if (error.name !== "AbortError") setStatus("error"); });
    return () => controller.abort();
  }, []);

  const activeAlbum = albums[activeAlbumIndex];
  const tracks = activeAlbum?.tracks ?? [];
  const activeTrack = tracks[activeTrackIndex];
  const activeTrackLinks = MUSIC_LINK_TYPES.filter(({ key }) => activeTrack?.[key]);
  const displayedDate = formatReleaseDate(activeAlbum?.release_date ?? activeTrack?.date ?? tracks.find((track) => track.date)?.date);

  const selectAlbum = (index) => {
    setActiveAlbumIndex(index);
    setActiveTrackIndex(-1);
  };
  const moveTrack = (direction) => setActiveTrackIndex((current) => (current + direction + tracks.length) % tracks.length);

  if (status === "loading") return <main className="music-page"><p className="music-page__status">음악을 펼치는 중...</p></main>;
  if (status === "error" || !activeAlbum || tracks.length === 0) return <main className="music-page"><p className="music-page__status">음악을 불러오지 못했습니다.</p></main>;

  return (
    <main className="music-page">
      <nav className={`music-project-tabs${isAlbumHeaderScrolled ? " is-scrolled" : ""}`} aria-label="앨범">
        {albums.map((album, index) => (
          <button className={index === activeAlbumIndex ? "is-active" : ""} key={`${album.year}-${album.directory}`} type="button" onClick={() => selectAlbum(index)}>{album.title}</button>
        ))}
      </nav>

      <div className="music-album-layout">
        <AlbumBook3D album={activeAlbum} />
        <div className="music-album-info">
          <header className="music-intro music-intro--side">
            <h1>{activeAlbum.title}</h1>
            {displayedDate && <p className="music-intro__subtitle">{displayedDate}</p>}
          </header>

          <div className="music-track-panel__list" role="tablist" aria-label="곡 선택">
            <button type="button" role="tab" data-label="앨범소개글" aria-selected={activeTrackIndex === -1} className={activeTrackIndex === -1 ? "is-active" : ""} onClick={() => setActiveTrackIndex(-1)}>
              앨범소개글
            </button>
            {tracks.map((track, index) => (
              <button type="button" role="tab" data-label={`${track.index} ${track.title}`} aria-selected={index === activeTrackIndex} className={index === activeTrackIndex ? "is-active" : ""} onClick={() => setActiveTrackIndex(index)} key={track.directory}>
                <span>{track.index}</span>{track.title}
              </button>
            ))}
          </div>

          {activeTrackLinks.length > 0 && (
            <div className="music-track-services" aria-label={`${activeTrack.title} 외부 링크`}>
              {activeTrackLinks.map(({ key, label, icon: Icon }) => (
                <a href={activeTrack[key]} target="_blank" rel="noreferrer" key={key}>
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                  <FiArrowUpRight aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>

        <section className="music-track-panel" aria-label={`${activeAlbum.title} 수록곡`}>
          {activeTrack ? (
            <article className="music-track-copy" key={`${activeAlbum.directory}-${activeTrack.directory}`}>
              <p className="music-track-copy__number">track. {activeTrack.index}</p>
              <div className="music-track-copy__heading">
                <h2>{activeTrack.title}</h2>
              </div>
              {(activeTrack.composition || activeTrack.lyrics) && (
                <div className="music-track-copy__credits-summary">
                  {activeTrack.composition && <p className="music-track-copy__credit"><span>작곡</span>{activeTrack.composition}</p>}
                  {activeTrack.lyrics && <p className="music-track-copy__credit"><span>작사</span>{activeTrack.lyrics}</p>}
                </div>
              )}
              <div className="music-track-copy__description">{(activeTrack.paragraphs ?? []).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>)}</div>
              {activeTrack.lyricsText && (
                <section className="music-track-copy__section music-track-copy__lyrics" aria-labelledby="track-lyrics-heading">
                  <h3 id="track-lyrics-heading">lyrics</h3>
                  <div>{activeTrack.lyricsParagraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>)}</div>
                </section>
              )}
              {activeTrack.credits && (
                <section className="music-track-copy__section music-track-copy__credits" aria-labelledby="track-credits-heading">
                  <h3 id="track-credits-heading">credits</h3>
                  <div>{activeTrack.creditParagraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>)}</div>
                </section>
              )}
            </article>
          ) : (
            <article className="music-track-copy music-album-introduction" key={`${activeAlbum.directory}-introduction`}>
              {activeAlbum.introductionTitle && <h2>{activeAlbum.introductionTitle}</h2>}
              <div className="music-track-copy__description">{(activeAlbum.paragraphs ?? []).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>)}</div>
              {activeAlbum.introductionAuthor && (
                <p className="music-album-introduction__author">
                  {activeAlbum.introductionAuthorUrl ? (
                    <a href={activeAlbum.introductionAuthorUrl} target="_blank" rel="noreferrer">{activeAlbum.introductionAuthor} ↗</a>
                  ) : activeAlbum.introductionAuthor}
                </p>
              )}
              {activeAlbum.credits && (
                <section className="music-track-copy__section music-track-copy__credits" aria-labelledby="album-credits-heading">
                  <h3 id="album-credits-heading">credits</h3>
                  <div>{activeAlbum.creditParagraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>)}</div>
                </section>
              )}
            </article>
          )}

          {activeTrack && tracks.length > 1 && (
            <div className="music-track-panel__navigation">
              <button type="button" onClick={() => moveTrack(-1)}>이전 곡</button>
              <span>{activeTrackIndex + 1} / {tracks.length}</span>
              <button type="button" onClick={() => moveTrack(1)}>다음 곡</button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
