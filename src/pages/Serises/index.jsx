import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { getContentUrl, parseContentFile } from "../../utils/contentFiles";

const YEAR = "2026";
const ALBUM = "001-mongledum 001 (feat. 김먼지)";
const WORKS_ROOT = getContentUrl(YEAR, ALBUM, "works");

function navigate(href) {
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}

function getYoutubeId(url = "") {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/);
  return match?.[1] ?? "";
}

function getWorkRoute(work) {
  const directoryName = work.directory.split("/").at(-1);
  return `/serises/${[YEAR, ALBUM, "works", work.type, directoryName].map(encodeURIComponent).join("/")}`;
}

function getWorkAssetRoot(work) {
  return `${WORKS_ROOT}/${work.directory.split("/").map(encodeURIComponent).join("/")}`;
}

function getWorkCover(work) {
  return `${getWorkAssetRoot(work)}/cover.png`;
}

async function findNumberedImage(root, index, signal) {
  const basename = String(index).padStart(3, "0");
  const extensions = ["png", "PNG", "jpg", "JPG", "jpeg", "JPEG", "webp", "WEBP"];
  const candidates = await Promise.all(extensions.map(async (extension) => {
    const file = `${basename}.${extension}`;
    const url = `${root}/${file}`;
    try {
      const response = await fetch(url, { method: "HEAD", signal });
      return response.ok && response.headers.get("content-type")?.startsWith("image/") ? url : null;
    } catch (error) {
      if (error.name === "AbortError") throw error;
      return null;
    }
  }));
  return candidates.find(Boolean) ?? null;
}

async function discoverComicPages(work, signal) {
  const discovered = [];
  const batchSize = 24;
  for (let start = 1; start <= 999; start += batchSize) {
    const batch = await Promise.all(Array.from({ length: batchSize }, (_, offset) => findNumberedImage(`${getWorkAssetRoot(work)}/pages`, start + offset, signal)));
    const firstMissing = batch.indexOf(null);
    discovered.push(...(firstMissing === -1 ? batch : batch.slice(0, firstMissing)));
    if (firstMissing !== -1) break;
  }
  return discovered;
}

const ComicPage = forwardRef(function ComicPage({ src, number }, ref) {
  return <div className="serises-comic__page" ref={ref} data-density="soft">{src && <img src={src} alt={`만화 ${number}페이지`} draggable="false" />}</div>;
});

function ComicReader({ work, onBack }) {
  const bookRef = useRef(null);
  const bookShellRef = useRef(null);
  const [pages, setPages] = useState([]);
  const [page, setPage] = useState(0);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [targetPage, setTargetPage] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    discoverComicPages(work, controller.signal)
      .then((urls) => {
        urls.forEach((url) => { const image = new Image(); image.src = url; });
        setPages(urls);
      })
      .catch((error) => { if (error.name !== "AbortError") setPages([]); });
    return () => controller.abort();
  }, [work]);

  const bookPages = useMemo(() => {
    const elements = pages.map((src, index) => <ComicPage key={src} src={src} number={index + 1} />);
    if (elements.length % 2 !== 0) elements.push(<ComicPage key="blank" src="" number={elements.length + 1} />);
    return elements;
  }, [pages]);

  useEffect(() => {
    if (isOverviewOpen || targetPage === null) return undefined;
    const frame = window.requestAnimationFrame(() => {
      bookRef.current?.pageFlip().turnToPage(targetPage);
      setPage(targetPage);
      bookShellRef.current?.focus({ preventScroll: true });
      setTargetPage(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isOverviewOpen, targetPage]);

  const openPage = (index) => {
    setTargetPage(index);
    setIsOverviewOpen(false);
  };

  return (
    <main className="serises-comic">
      <button className="serises-comic__close" type="button" onClick={onBack} aria-label="만화 닫기">×</button>
      <h1 className="serises-comic__title">{work.title}</h1>
      {bookPages.length > 0 ? (
        <div className="serises-comic__book-shell" ref={bookShellRef} tabIndex={-1}>
          <HTMLFlipBook width={450} height={640} size="stretch" minWidth={200} maxWidth={450} minHeight={284} maxHeight={640} startPage={0} drawShadow={true} flippingTime={1000} usePortrait={true} startZIndex={0} autoSize={true} maxShadowOpacity={0.5} showCover={false} mobileScrollSupport={true} clickEventForward={true} useMouseEvents={true} swipeDistance={30} showPageCorners={true} disableFlipByClick={false} onFlip={(event) => setPage(event.data)} className="serises-comic__book" style={{}} ref={bookRef}>
            {bookPages}
          </HTMLFlipBook>
          <div className="serises-comic__controls">
            <button type="button" onClick={() => bookRef.current?.pageFlip().flipPrev()}>이전</button>
            <span>{Math.min(page + 1, pages.length)} / {pages.length}</span>
            <button type="button" onClick={() => bookRef.current?.pageFlip().flipNext()}>다음</button>
            <button className="serises-comic__overview-open" type="button" onClick={() => setIsOverviewOpen(true)}>전체보기</button>
          </div>
        </div>
      ) : <div className="serises-comic__empty"><p>만화 페이지 이미지를 준비 중입니다.</p><small>pages 폴더에 001.png부터 연속된 이름으로 추가하면 자동으로 표시됩니다.</small></div>}
      {isOverviewOpen && (
        <section className="serises-comic-overview" aria-label="만화 전체 페이지">
          <header className="serises-comic-overview__header">
            <h2>전체보기 <span>{work.title}</span></h2>
            <button type="button" onClick={() => setIsOverviewOpen(false)} aria-label="전체보기 닫기">×</button>
          </header>
          <div className="serises-comic-overview__grid">
            {pages.map((src, index) => (
              <button className={index === page ? "is-current" : ""} type="button" onClick={() => openPage(index)} key={src} aria-label={`${index + 1}페이지로 이동`}>
                <img src={src} alt="" draggable="false" />
                <span>{index + 1}p</span>
              </button>
            ))}
          </div>
          <footer className="serises-comic-overview__footer">TOTAL: {pages.length}p</footer>
        </section>
      )}
    </main>
  );
}

function ImageWorkDetail({ work, onBack }) {
  const cover = getWorkCover(work);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    const loadImages = async () => {
      const discovered = [];
      const batchSize = 24;
      for (let start = 1; start <= 999; start += batchSize) {
        const batch = await Promise.all(Array.from({ length: batchSize }, (_, offset) => findNumberedImage(`${getWorkAssetRoot(work)}/images`, start + offset, controller.signal)));
        const firstMissing = batch.indexOf(null);
        discovered.push(...(firstMissing === -1 ? batch : batch.slice(0, firstMissing)));
        if (firstMissing !== -1) break;
      }
      setImages(discovered);
    };
    loadImages().catch((error) => { if (error.name !== "AbortError") setImages([]); });
    return () => controller.abort();
  }, [work]);

  return (
    <main className="serises-image-detail">
      <button type="button" onClick={onBack}>← serises</button>
      <header><small>{work.label}</small><h1>{work.title}</h1></header>
      <img src={cover} alt={`${work.title} 대표 이미지`} draggable="false" />
      {images.length > 0 && <section className="serises-image-detail__gallery">{images.map((src, index) => <img src={src} alt={`${work.title} ${index + 1}`} key={src} draggable="false" />)}</section>}
    </main>
  );
}

export default function SerisesPage() {
  const [works, setWorks] = useState([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [titleTrack, setTitleTrack] = useState(null);
  const routeParts = decodeURIComponent(window.location.pathname).split("/").filter(Boolean);
  const activeType = routeParts[4] ?? "";
  const activeDirectoryName = routeParts[5] ?? "";

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch(`${WORKS_ROOT}/works.json`, { signal: controller.signal }).then((response) => response.json()),
      fetch(getContentUrl(YEAR, ALBUM, "001-물방울이 두근두근", "music.txt"), { signal: controller.signal }).then((response) => response.ok ? response.text() : "").then((source) => parseContentFile(source).youtube ?? ""),
      fetch("/docs/files.json", { signal: controller.signal })
        .then((response) => response.json())
        .then(async (manifest) => {
          const album = (manifest.years ?? []).find((item) => item.year === YEAR)?.albums?.find((item) => item.directory === ALBUM);
          const tracks = await Promise.all((album?.items ?? []).filter((item) => item.hasMusic).map(async (item) => {
            const response = await fetch(getContentUrl(YEAR, ALBUM, item.directory, "music.txt"), { signal: controller.signal });
            const metadata = response.ok ? parseContentFile(await response.text()) : {};
            return {
              directory: item.directory,
              title: item.title,
              isTitle: metadata.title === "1",
              coverUrl: getContentUrl(YEAR, ALBUM, item.directory, item.cover || "cover.png"),
            };
          }));
          return tracks.find((track) => track.isTitle) ?? null;
        })
        .catch((error) => {
          if (error.name === "AbortError") throw error;
          return null;
        }),
    ]).then(([manifest, video, selectedTitleTrack]) => {
      setWorks(manifest.works ?? []);
      setYoutubeUrl(video);
      setTitleTrack(selectedTitleTrack);
    }).catch((error) => { if (error.name !== "AbortError") setWorks([]); });
    return () => controller.abort();
  }, []);

  const activeWork = works.find((work) => work.type === activeType && work.directory.split("/").at(-1) === activeDirectoryName);
  if (activeWork?.type === "cartoon") return <ComicReader work={activeWork} onBack={() => navigate("/serises")} />;
  if (activeWork?.type === "image") return <ImageWorkDetail work={activeWork} onBack={() => navigate("/serises")} />;

  const openWork = (work) => {
    if (work.type === "tumblbug") { if (work.url) window.open(work.url, "_blank", "noopener,noreferrer"); return; }
    if (work.type === "object") return navigate(work.href || "/objects");
    if (work.type === "essay") return navigate(work.href || "/essay");
    if (work.type === "music") return navigate(work.href || `/music?year=${YEAR}&album=${encodeURIComponent(ALBUM)}`);
    if (work.type === "video") { if (youtubeUrl) window.open(youtubeUrl, "_blank", "noopener,noreferrer"); return; }
    navigate(getWorkRoute(work));
  };

  return (
    <main className="serises-focus">
      <img className="serises-focus__background-preload" src="/assets/serises-pool-tiles.png" alt="" aria-hidden="true" />
      <header className="serises-focus__header"><p>{YEAR}</p><h1>mongledum 001 <small>(feat. 김먼지)</small></h1></header>
      <section className="serises-focus__wall" aria-label="mongledum 001 작업물">
        {works.map((work, index) => {
          const youtubeId = work.type === "video" ? getYoutubeId(youtubeUrl) : "";
          const cover = work.type === "music" ? titleTrack?.coverUrl : youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : getWorkCover(work);
          const title = work.type === "music" ? titleTrack?.title : work.title;
          return <button className={`serises-work serises-work--${work.type} serises-work--position-${index + 1}`} type="button" key={work.directory} onClick={() => openWork(work)} aria-label={`${title || work.label} 열기`}>
            <span className="serises-work__media">{cover && <img src={cover} alt="" draggable="false" onError={(event) => {
              if (work.type !== "music" && event.currentTarget.src.endsWith("/cover.png")) event.currentTarget.src = `${getWorkAssetRoot(work)}/cover.PNG`;
              else event.currentTarget.hidden = true;
            }} />}</span>
            {title && <strong>{title}</strong>}
          </button>;
        })}
      </section>
    </main>
  );
}
