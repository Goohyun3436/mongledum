import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getContentUrl, parseContentFile } from "../../utils/contentFiles";

function getCircularOffset(index, activeIndex, total) {
  let offset = index - activeIndex;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

function getCoverUrl(year, album, item) {
  if (item?.cover) return getContentUrl(year, album.directory, item.directory, item.cover);
  if (album.cover) return getContentUrl(year, album.directory, album.cover);
  return null;
}

export default function MusicPage() {
  const [albums, setAlbums] = useState([]);
  const [activeAlbumIndex, setActiveAlbumIndex] = useState(0);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [status, setStatus] = useState("loading");
  const [isAlbumHeaderScrolled, setIsAlbumHeaderScrolled] = useState(false);
  const albumMetaRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("is-music-page");
    return () => document.body.classList.remove("is-music-page");
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      setIsAlbumHeaderScrolled(isScrolled);
      document.body.classList.toggle("is-music-header-scrolled", isScrolled);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.classList.remove("is-music-header-scrolled");
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/docs/files.json", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("음악 목록을 불러오지 못했습니다.");
        const manifest = await response.json();

        const loadedAlbums = await Promise.all(
          (manifest.years ?? []).flatMap((year) =>
            (year.albums ?? []).filter((album) => album.items?.some((item) => item.hasMusic)).map(async (album) => {
              const albumSource = album.albumFile
                ? await fetch(getContentUrl(year.year, album.directory, album.albumFile), { signal: controller.signal }).then((result) => result.text())
                : "";
              const albumInfo = parseContentFile(albumSource);
              const tracks = await Promise.all(
                album.items.filter((item) => item.hasMusic).map(async (item) => {
                  const source = await fetch(getContentUrl(year.year, album.directory, item.directory, "music.txt"), { signal: controller.signal }).then((result) => {
                    if (!result.ok) throw new Error("곡 정보를 불러오지 못했습니다.");
                    return result.text();
                  });
                  const info = parseContentFile(source);
                  return {
                    ...info,
                    index: item.index,
                    title: item.title,
                    directory: item.directory,
                    image: getCoverUrl(year.year, album, item),
                  };
                }),
              );

              return { ...album, ...albumInfo, year: year.year, tracks };
            }),
          ),
        );

        return loadedAlbums;
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
      .catch((error) => {
        if (error.name !== "AbortError") setStatus("error");
      });

    return () => controller.abort();
  }, []);

  const activeAlbum = albums[activeAlbumIndex];
  const tracks = activeAlbum?.tracks ?? [];
  const activeTrack = tracks[activeTrackIndex];

  useLayoutEffect(() => {
    const albumMeta = albumMetaRef.current;
    if (!albumMeta || !activeAlbum || !activeTrack) return undefined;

    let frameId;
    const updateHeight = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const documentTop = albumMeta.getBoundingClientRect().top + window.scrollY;
        const remainingHeight = Math.max(0, window.innerHeight - documentTop - 60);
        albumMeta.style.setProperty("--music-meta-height", `${remainingHeight}px`);
      });
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    document.fonts?.ready.then(updateHeight);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateHeight);
    };
  }, [activeAlbum, activeTrack]);

  const selectAlbum = (index) => {
    setActiveAlbumIndex(index);
    setActiveTrackIndex(0);
  };

  const move = (direction) => {
    setActiveTrackIndex((current) => (current + direction + tracks.length) % tracks.length);
  };

  const selectTrack = (index) => {
    if (index === activeTrackIndex) {
      if (tracks[index].youtube) window.open(tracks[index].youtube, "_blank", "noopener,noreferrer");
      return;
    }
    setActiveTrackIndex(index);
  };

  if (status === "loading") return <main className="music-page"><p className="music-page__status">음악을 펼치는 중...</p></main>;
  if (status === "error" || !activeAlbum || !activeTrack) return <main className="music-page"><p className="music-page__status">음악을 불러오지 못했습니다.</p></main>;

  return (
    <main className="music-page">
      <nav className={`music-project-tabs${isAlbumHeaderScrolled ? " is-scrolled" : ""}`} aria-label="앨범">
        {albums.map((album, index) => (
          <button className={index === activeAlbumIndex ? "is-active" : ""} key={`${album.year}-${album.directory}`} type="button" onClick={() => selectAlbum(index)}>
            {album.title}
          </button>
        ))}
      </nav>

      <header className="music-intro">
        <h1>{activeAlbum.title}</h1>
        <p className="music-intro__subtitle">{activeAlbum.year} · {activeAlbum.index}</p>
        <span className="music-intro__line" aria-hidden="true" />
        <div className="music-intro__description">
          {activeAlbum.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>)}
        </div>
      </header>

      <section className="music-carousel" aria-roledescription="carousel" aria-label={`${activeAlbum.title} 수록곡`}>
        <div className="music-carousel__stage">
          {tracks.map((track, index) => {
            const offset = getCircularOffset(index, activeTrackIndex, tracks.length);
            const isVisible = Math.abs(offset) <= 2;
            return (
              <button key={track.directory} type="button" className={`music-album-card${offset === 0 ? " is-active" : ""}`} data-offset={Math.max(-2, Math.min(2, offset))} aria-label={offset === 0 ? `${track.title} 듣기` : `${track.title} 선택`} aria-hidden={!isVisible} tabIndex={isVisible ? 0 : -1} onClick={() => selectTrack(index)}>
                {track.image && <img src={track.image} alt={`${track.title} 커버`} />}
                {track.youtube && <span className="music-album-card__play" aria-hidden="true">▶</span>}
              </button>
            );
          })}
          {tracks.length > 1 && (
            <>
              <button className="music-carousel__arrow music-carousel__arrow--prev" type="button" aria-label="이전 곡" onClick={() => move(-1)}><span aria-hidden="true">‹</span></button>
              <button className="music-carousel__arrow music-carousel__arrow--next" type="button" aria-label="다음 곡" onClick={() => move(1)}><span aria-hidden="true">›</span></button>
            </>
          )}
        </div>

        <div className="music-album-meta" ref={albumMetaRef} key={`${activeAlbum.directory}-${activeTrack.directory}`}>
          <p className="music-album-meta__track-number">Track. {activeTrack.index}</p>
          <h2>{activeTrack.title}</h2>
          {activeTrack.date && <p className="music-album-meta__date">{activeTrack.date}</p>}
          {activeTrack.composition && <p className="music-album-meta__credit"><span>작곡</span>{activeTrack.composition}</p>}
          {activeTrack.lyrics && <p className="music-album-meta__credit"><span>작사</span>{activeTrack.lyrics}</p>}
          <div className="music-album-meta__description">
            {activeTrack.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>)}
          </div>
        </div>
        <p className="music-album-meta__index">
          <span>{activeTrackIndex + 1}</span>
          <span aria-hidden="true">/</span>
          <span>{tracks.length}</span>
        </p>
      </section>
    </main>
  );
}
