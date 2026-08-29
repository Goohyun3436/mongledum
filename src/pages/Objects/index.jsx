import { useEffect, useRef, useState } from "react";
import { getContentUrl, parseContentFile } from "../../utils/contentFiles";

const bubblePresets = [
  { x: 17, y: 29, size: "lg", delay: "-2.4s" },
  { x: 42, y: 17, size: "sm", delay: "-4.1s" },
  { x: 66, y: 31, size: "md", delay: "-1.2s" },
  { x: 30, y: 62, size: "sm", delay: "-3.3s" },
  { x: 59, y: 66, size: "lg", delay: "-0.5s" },
];

function navigate(href) {
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}

function getObjectAsset(directory, ...segments) {
  return getContentUrl("objects", directory, ...segments);
}

export default function ObjectsPage() {
  const [objects, setObjects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [poppingId, setPoppingId] = useState("");
  const [status, setStatus] = useState("loading");
  const timerRef = useRef(null);
  const detailDirectory = decodeURIComponent(window.location.pathname.replace(/^\/objects\/?/, ""));
  const isDetail = Boolean(detailDirectory);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/docs/files.json", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("사물 목록을 불러오지 못했습니다.");
        const manifest = await response.json();
        return Promise.all((manifest.objects ?? []).filter((item) => item.objectFile).map(async (item) => {
          const response = await fetch(getObjectAsset(item.directory, item.objectFile), { signal: controller.signal });
          if (!response.ok) throw new Error("사물 정보를 불러오지 못했습니다.");
          const info = parseContentFile(await response.text());
          return {
            ...item,
            ...info,
            title: info.title || item.title,
            coverUrl: item.cover ? getObjectAsset(item.directory, item.cover) : "",
            galleryUrls: item.gallery.map((image) => getObjectAsset(item.directory, "images", image)),
          };
        }));
      })
      .then((loadedObjects) => {
        const visibleObjects = loadedObjects.filter((item) => item.status !== "0");
        setObjects(visibleObjects);
        setSelectedId((current) => current || visibleObjects[0]?.directory || "");
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setStatus("error");
      });

    return () => controller.abort();
  }, []);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const selectedObject = objects.find((item) => item.directory === selectedId) ?? objects[0];
  const detailObject = objects.find((item) => item.directory === detailDirectory);

  const selectObject = (directory) => {
    if (poppingId) return;
    setPoppingId(directory);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setSelectedId(directory);
      setPoppingId("");
    }, 360);
  };

  if (status === "loading") return <main className="objects-page"><p className="objects-page__status">사물을 띄우는 중...</p></main>;
  if (status === "error" || objects.length === 0) return <main className="objects-page"><p className="objects-page__status">사물을 불러오지 못했습니다.</p></main>;

  if (isDetail) {
    if (!detailObject) return <main className="object-detail"><button className="object-detail__back" type="button" onClick={() => navigate("/objects")}>← objects</button><p>사물을 찾지 못했습니다.</p></main>;

    return (
      <main className="object-detail">
        <button className="object-detail__back" type="button" onClick={() => navigate("/objects")}>← objects</button>
        <header className="object-detail__hero">
          <div className="object-detail__cover">{detailObject.coverUrl && <img src={detailObject.coverUrl} alt={`${detailObject.title} 대표 이미지`} />}</div>
          <div className="object-detail__summary">
            <p>{detailObject.index} · {detailObject.type || "object"}</p>
            <h1>{detailObject.title}</h1>
            {detailObject.album && <span className="object-detail__album">연결된 앨범 · {detailObject.album}</span>}
            <div className="object-detail__description">{detailObject.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>)}</div>
            {detailObject.link && <a href={detailObject.link} target="_blank" rel="noreferrer">외부 사이트에서 보기 ↗</a>}
          </div>
        </header>

        {detailObject.galleryUrls.length > 0 && <section className="object-detail__life">
          <div className="object-detail__life-heading"><p>OBJECTS IN OUR DAYS</p><h2>우리의 일상에 놓인 사물</h2><span>만들어진 사물이 실제 하루 안에서 사용되는 모습을 모았습니다.</span></div>
          <div className="object-detail__gallery">{detailObject.galleryUrls.map((image, index) => <figure key={image} className={index % 3 === 0 ? "is-wide" : ""}><img src={image} alt={`${detailObject.title} 사용 모습 ${index + 1}`} /><figcaption>{String(index + 1).padStart(2, "0")}</figcaption></figure>)}</div>
        </section>}
      </main>
    );
  }

  return (
    <main className="objects-page">
      <header className="objects-page__intro"><p>몽글덤이 주워 모은 작은 것들</p><h1>objects</h1></header>
      <section className="objects-playground" aria-label="오브젝트 비눗방울">
        <p className="objects-playground__hint">마음에 드는 비눗방울을 터뜨려보세요</p>
        {["one", "two", "three", "four", "five"].map((name, index) => <div className={`objects-thrower objects-thrower--${name}`} key={name} aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span></div>)}
        <div className="objects-bubbles">{objects.map((item, index) => {
          const preset = bubblePresets[index % bubblePresets.length];
          return <button className={`objects-bubble objects-bubble--${preset.size}${item.directory === selectedId ? " is-selected" : ""}${item.directory === poppingId ? " is-popping" : ""}`} key={item.directory} type="button" style={{ "--bubble-x": `${preset.x}%`, "--bubble-y": `${preset.y}%`, "--bubble-delay": preset.delay }} aria-label={`${item.title} 열기`} onClick={() => selectObject(item.directory)}><span className="objects-bubble__shine" aria-hidden="true" />{item.coverUrl && <img src={item.coverUrl} alt="" draggable="false" />}<span className="objects-bubble__number">{item.index}</span></button>;
        })}</div>
        {selectedObject && <aside className="objects-selection" key={selectedObject.directory}><p>{selectedObject.index} / {String(objects.length).padStart(3, "0")}</p><h2>{selectedObject.title}</h2><span>{selectedObject.body}</span><button type="button" onClick={() => navigate(`/objects/${encodeURIComponent(selectedObject.directory)}`)}>자세히 보기 <b aria-hidden="true">↗</b></button></aside>}
      </section>
    </main>
  );
}
