import React, { useEffect, useMemo, useState } from "react";
import { PiDiscFill, PiX } from "react-icons/pi";
import { getContentUrl, parseContentFile } from "../../utils/contentFiles";

const ESSAY_ROOT = "/docs";

function renderInlineText(text, keyPrefix) {
  const normalizedText = text.replace(/\\\*/g, "*");
  return normalizedText.split(/(\*\*.+?\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function EssayFilter({ id, label, value, options, isOpen, onToggle, onChange }) {
  const selectedOption = options.find((option) => (typeof option === "string" ? option : option.value) === value);
  const selectedLabel = typeof selectedOption === "string" ? selectedOption : selectedOption?.label;
  return (
    <div className={`essay-filter${isOpen ? " is-open" : ""}`}>
      <button className="essay-filter__trigger" type="button" aria-expanded={isOpen} aria-controls={`essay-filter-${id}`} onClick={onToggle}>
        <span>{label}</span><strong>{selectedLabel || "전체"}</strong><i aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="essay-filter__options" id={`essay-filter-${id}`} role="listbox" aria-label={`${label} 필터`}>
          {[{ value: "", label: "전체" }, ...options.map((option) => typeof option === "string" ? { value: option, label: option } : option)].map((option) => (
            <button type="button" role="option" aria-selected={value === option.value} className={value === option.value ? "is-selected" : ""} key={option.value || "all"} onClick={() => onChange(option.value)}>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EssayPage() {
  const [essays, setEssays] = useState([]);
  const [status, setStatus] = useState("loading");
  const [filters, setFilters] = useState({ topic: "", project: "", song: "", author: "", year: "" });
  const [openFilter, setOpenFilter] = useState("");
  const [activeEssay, setActiveEssay] = useState(null);

  useEffect(() => {
    document.documentElement.classList.add("is-essay-page");
    document.body.classList.add("is-essay-page");
    return () => {
      document.documentElement.classList.remove("is-essay-page");
      document.body.classList.remove("is-essay-page");
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${ESSAY_ROOT}/files.json`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("에세이 목록을 불러오지 못했습니다.");
        const data = await response.json();
        return Promise.all((data.years ?? []).flatMap((year) =>
          (year.albums ?? []).flatMap((album) =>
            (album.items ?? []).filter((item) => item.hasEssay).map(async (item) => {
              const essayResponse = await fetch(getContentUrl(year.year, album.directory, item.directory, "essay.txt"), { signal: controller.signal });
              if (!essayResponse.ok) throw new Error("에세이를 불러오지 못했습니다.");
              const info = parseContentFile(await essayResponse.text());
              return {
                ...info,
                id: `${year.year}/${album.directory}/${item.directory}`,
                year: year.year,
                album: album.directory,
                albumTitle: album.title,
                file: item.directory,
                title: info.title || item.title,
                name: info.name || "",
                musicTitle: item.hasMusic ? item.title : "",
                coverUrl: getContentUrl(year.year, album.directory, item.directory, "cover-essay.png"),
                detailCoverUrl: getContentUrl(year.year, album.directory, item.directory, "cover-essay-detail.png"),
              };
            }),
          ),
        ));
      })
      .then((items) => {
        setEssays(items);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const closeDropdown = (event) => {
      if (!event.target.closest?.(".essay-filter")) setOpenFilter("");
    };
    document.addEventListener("pointerdown", closeDropdown);
    return () => document.removeEventListener("pointerdown", closeDropdown);
  }, []);

  useEffect(() => {
    const handlePopState = () => setActiveEssay(null);
    const handleEscape = (event) => {
      if (event.key !== "Escape" || !activeEssay) return;
      if (window.history.state?.essayReader) window.history.back();
      else setActiveEssay(null);
    };
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [activeEssay]);

  const filterOptions = useMemo(() => ({
    topic: [...new Set(essays.map((essay) => essay.topic).filter(Boolean))],
    project: [...new Set(essays.map((essay) => essay.albumTitle))],
    song: [...new Set(essays.map((essay) => essay.musicTitle).filter(Boolean))],
    author: [...new Set(essays.map((essay) => essay.name))].sort((first, second) => {
      if (first === "박서음") return -1;
      if (second === "박서음") return 1;
      return first.localeCompare(second, "ko");
    }),
    year: [...new Set(essays.map((essay) => essay.year))],
  }), [essays]);

  const visibleEssays = useMemo(() => essays.filter((essay) =>
    (!filters.topic || essay.topic === filters.topic)
    && (!filters.project || essay.albumTitle === filters.project)
    && (!filters.song || essay.musicTitle === filters.song)
    && (!filters.author || essay.name === filters.author)
    && (!filters.year || essay.year === filters.year)
  ), [essays, filters]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setOpenFilter("");
  };
  const openEssay = (essay) => {
    setActiveEssay(essay);
    window.history.pushState({ ...window.history.state, essayReader: essay.id }, "", window.location.href);
  };
  const closeEssay = () => {
    if (window.history.state?.essayReader) window.history.back();
    else setActiveEssay(null);
  };
  const openMusic = () => {
    if (!activeEssay?.musicTitle) return;
    const params = new URLSearchParams({
      year: activeEssay.year,
      album: activeEssay.album,
      track: activeEssay.file,
    });
    window.history.pushState({}, "", `/music?${params.toString()}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo(0, 0);
  };
  return (
    <main className="essay-catalog">
      <svg className="essay-noise-filter" aria-hidden="true">
        <filter id="essay-sudden-noise" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            values="0 0 0 0 0.937  0 0 0 0 0.788  0 0 0 0 0.816  0 0 0 1 0"
            result="tintedImage"
          />
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" seed="17" result="noise" />
          <feColorMatrix
            in="noise"
            values="2.4 0 0 0 -0.7  0 2.4 0 0 -0.7  0 0 2.4 0 -0.7  0 0 0 1 0"
            result="strongNoise"
          />
          <feBlend in="tintedImage" in2="strongNoise" mode="hard-light" result="tintedNoise" />
          <feComposite in="SourceGraphic" in2="tintedNoise" operator="arithmetic" k2="0.4" k3="0.6" result="softTintedNoise" />
          <feComposite in="softTintedNoise" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id="essay-mongledum-noise" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            values="0 0 0 0 0.976  0 0 0 0 0.969  0 0 0 0 0.820  0 0 0 1 0"
            result="tintedImage"
          />
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" seed="17" result="noise" />
          <feColorMatrix
            in="noise"
            values="2.4 0 0 0 -0.7  0 2.4 0 0 -0.7  0 0 2.4 0 -0.7  0 0 0 1 0"
            result="strongNoise"
          />
          <feBlend in="tintedImage" in2="strongNoise" mode="hard-light" result="tintedNoise" />
          <feComposite in="SourceGraphic" in2="tintedNoise" operator="arithmetic" k2="0.4" k3="0.6" result="softTintedNoise" />
          <feComposite in="softTintedNoise" in2="SourceAlpha" operator="in" />
        </filter>
      </svg>
      <div className="essay-catalog__filters" aria-label="에세이 필터" onPointerDown={(event) => event.stopPropagation()}>
        <EssayFilter id="topic" label="주제" value={filters.topic} options={filterOptions.topic} isOpen={openFilter === "topic"} onToggle={() => setOpenFilter((current) => current === "topic" ? "" : "topic")} onChange={(value) => updateFilter("topic", value)} />
        <EssayFilter id="project" label="프로젝트" value={filters.project} options={filterOptions.project} isOpen={openFilter === "project"} onToggle={() => setOpenFilter((current) => current === "project" ? "" : "project")} onChange={(value) => updateFilter("project", value)} />
        <EssayFilter id="song" label="노래" value={filters.song} options={filterOptions.song} isOpen={openFilter === "song"} onToggle={() => setOpenFilter((current) => current === "song" ? "" : "song")} onChange={(value) => updateFilter("song", value)} />
        <EssayFilter id="author" label="글쓴덤" value={filters.author} options={filterOptions.author} isOpen={openFilter === "author"} onToggle={() => setOpenFilter((current) => current === "author" ? "" : "author")} onChange={(value) => updateFilter("author", value)} />
        <EssayFilter id="year" label="연도" value={filters.year} options={filterOptions.year} isOpen={openFilter === "year"} onToggle={() => setOpenFilter((current) => current === "year" ? "" : "year")} onChange={(value) => updateFilter("year", value)} />
        <button className="essay-catalog__reset" type="button" onClick={() => { setFilters({ topic: "", project: "", song: "", author: "", year: "" }); setOpenFilter(""); }}>필터 초기화</button>
      </div>

      <section className="essay-catalog__scroll" aria-live="polite">
        {status === "loading" && <p className="essay-catalog__status">책을 정리하는 중...</p>}
        {status === "error" && <p className="essay-catalog__status">에세이를 불러오지 못했습니다.</p>}
        {status === "ready" && (
          <div className="essay-catalog__grid">
            {visibleEssays.map((essay) => (
              <button
                className={`essay-card ${essay.album.includes("인간은 별안간") ? "essay-card--sudden" : essay.album.includes("mongledum 001") ? "essay-card--mongledum" : ""}`}
                type="button"
                key={essay.id}
                onPointerDown={(event) => event.stopPropagation()}
                onPointerMove={(event) => {
                  const bounds = event.currentTarget.getBoundingClientRect();
                  const info = event.currentTarget.querySelector(".essay-card__hover-info");
                  info?.style.setProperty("--hover-x", `${event.clientX - bounds.left}px`);
                  info?.style.setProperty("--hover-y", `${event.clientY - bounds.top}px`);
                }}
                onClick={() => openEssay(essay)}
              >
                <span className="essay-card__cover">
                  <img src={essay.coverUrl} alt="" loading="lazy" draggable="false" />
                  <span className="essay-card__hover-info" aria-hidden="true">
                    <em>{essay.topic || "미분류"} 「{essay.title}」</em>
                    <em>{essay.albumTitle}</em>
                    <em>{essay.musicTitle || "-"}</em>
                    <em>{essay.name}</em>
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {activeEssay && (
        <div className="essay-reading-modal" role="dialog" aria-modal="true" aria-label={`${activeEssay.title} 읽기`} onPointerDown={(event) => event.stopPropagation()}>
          <button className="essay-reading-modal__close" type="button" aria-label="책 닫기" onClick={closeEssay}><PiX aria-hidden="true" /></button>
          <article className="essay-detail">
            <header className="essay-detail__header">
              <div className="essay-detail__cover">
                <img
                  src={activeEssay.detailCoverUrl}
                  alt={`${activeEssay.title} 표지`}
                  draggable="false"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = activeEssay.coverUrl;
                  }}
                />
              </div>
              <div className="essay-detail__info">
                {activeEssay.musicTitle && (
                  <button className="essay-detail__music" type="button" onClick={openMusic}>
                    <PiDiscFill aria-hidden="true" />[{activeEssay.musicTitle}] 들으러 가기
                  </button>
                )}
                <h1>{activeEssay.topic || "미분류"} 「{activeEssay.title}」</h1>
                <dl>
                  <div><dt>프로젝트</dt><dd>{activeEssay.albumTitle}</dd></div>
                  <div><dt>글쓴덤</dt><dd>{activeEssay.name}</dd></div>
                  <div><dt>연도</dt><dd>{activeEssay.year}</dd></div>
                  {activeEssay.musicTitle && <div><dt>노래</dt><dd>{activeEssay.musicTitle}</dd></div>}
                </dl>
              </div>
            </header>
            <div className="essay-detail__divider" aria-hidden="true" />
            <div className="essay-detail__body">
              {(activeEssay.paragraphs ?? []).map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 16)}`}>{renderInlineText(paragraph, `detail-${index}`)}</p>
              ))}
            </div>
          </article>
        </div>
      )}

    </main>
  );
}
