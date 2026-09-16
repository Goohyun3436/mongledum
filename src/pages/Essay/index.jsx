import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { PiDiscFill, PiX } from "react-icons/pi";
import HTMLFlipBook from "react-pageflip";
import playDigAnimation from "../../utils/playDigAnimation";
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

function paginateEssay(paragraphs, { charactersPerLine = 27, linesPerPage = 17 } = {}) {
  const pages = [];
  let page = [];
  let usedLines = 0;
  const paragraphSpacing = 0.55;
  const maxChunkCharacters = Math.floor((linesPerPage - paragraphSpacing) * charactersPerLine);
  paragraphs.forEach((paragraph) => {
    const chunks = paragraph.length > maxChunkCharacters
      ? paragraph.match(new RegExp(`.{1,${maxChunkCharacters}}(?:\\s|$)|.{1,${maxChunkCharacters}}`, "gs")) ?? [paragraph]
      : [paragraph];
    chunks.forEach((chunk) => {
      const text = chunk.trim();
      if (!text) return;
      const textLines = Math.max(1, Math.ceil(text.length / charactersPerLine));
      const visualLines = textLines + paragraphSpacing;
      if (page.length && usedLines + visualLines > linesPerPage) {
        pages.push(page);
        page = [];
        usedLines = 0;
      }
      page.push(text);
      usedLines += visualLines;
    });
  });
  if (page.length) pages.push(page);
  return pages.length ? pages : [[]];
}

function getReaderPageLayout(width) {
  if (width <= 760) return { charactersPerLine: 17, linesPerPage: 10 };
  if (width <= 1000) return { charactersPerLine: 24, linesPerPage: 15 };
  return { charactersPerLine: 27, linesPerPage: 17 };
}

const PageCover = forwardRef(function PageCover({ essay, onOpenMusic }, ref) {
  return (
    <div className="page page-cover" ref={ref} data-density="soft">
      <div className="page-content">
        <p className="page-cover__author">{essay.name}</p>
        <div className="page-cover__title">
          <h2>{essay.title}</h2>
          <p>{essay.year} · {essay.albumTitle}</p>
          {essay.musicTitle && (
            <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={onOpenMusic}>
              <PiDiscFill aria-hidden="true" />[{essay.musicTitle}] 들으러 가기
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

const Page = forwardRef(function Page({ children, number, title }, ref) {
  return (
    <div className="page" ref={ref} data-density="soft">
      <div className="page-content">
        <h2 className="page-header">{title}</h2>
        <div className="page-image" />
        <div className="page-text">{children}</div>
        <div className="page-footer">{number + 1}</div>
      </div>
    </div>
  );
});

class DemoBook extends React.Component {
  constructor(props) {
    super(props);
    this.state = { page: 0, totalPage: Math.max(1, props.pages.length + 1), orientation: "landscape", state: "read" };
  }

  nextButtonClick = () => this.flipBook.getPageFlip().flipNext();
  prevButtonClick = () => this.flipBook.getPageFlip().flipPrev();
  onPage = (event) => this.setState({ page: event.data });
  onChangeOrientation = (event) => this.setState({ orientation: event.data });
  onChangeState = (event) => this.setState({ state: event.data });

  componentDidMount() {
    this.setState({ totalPage: Math.max(1, this.props.pages.length + 1) });
  }

  render() {
    const { essay, pages } = this.props;
    const bookPages = [
      <PageCover key="cover" essay={essay} onOpenMusic={this.props.onOpenMusic} />,
      ...pages.map((paragraphs, index) => (
        <Page number={index + 1} title={essay.title} key={`${essay.id}-${index}`}>
          {paragraphs.map((paragraph, paragraphIndex) => (
            <p key={`${index}-${paragraphIndex}-${paragraph.slice(0, 10)}`}>{renderInlineText(paragraph, `${index}-${paragraphIndex}`)}</p>
          ))}
        </Page>
      )),
    ];
    if (bookPages.length % 2 !== 0) {
      bookPages.push(<Page number={pages.length + 1} title={essay.title} key="blank-page"><span aria-hidden="true" /></Page>);
    }
    return (
      <div className="essay-demo-book">
        <HTMLFlipBook
          width={450}
          height={600}
          size="stretch"
          minWidth={260}
          maxWidth={450}
          minHeight={347}
          maxHeight={600}
          startPage={0}
          drawShadow={true}
          flippingTime={1000}
          usePortrait={false}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          showCover={false}
          mobileScrollSupport={true}
          clickEventForward={true}
          useMouseEvents={pages.length > 1}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
          onFlip={this.onPage}
          onChangeOrientation={this.onChangeOrientation}
          onChangeState={this.onChangeState}
          className="demo-book"
          style={{}}
          ref={(element) => { this.flipBook = element; }}
        >
          {bookPages}
        </HTMLFlipBook>

        <div className="essay-reading-modal__controls">
          <button type="button" onClick={this.prevButtonClick}>이전</button>
          <span>{Math.min(this.state.page + 1, this.state.totalPage)} / {this.state.totalPage}</span>
          <button type="button" onClick={this.nextButtonClick}>다음</button>
        </div>
      </div>
    );
  }
}

function EssayFilter({ id, label, value, options, isOpen, onToggle, onChange }) {
  return (
    <div className={`essay-filter${isOpen ? " is-open" : ""}`}>
      <button className="essay-filter__trigger" type="button" aria-expanded={isOpen} aria-controls={`essay-filter-${id}`} onClick={onToggle}>
        <span>{label}</span><strong>{value || "전체"}</strong><i aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="essay-filter__options" id={`essay-filter-${id}`} role="listbox" aria-label={`${label} 필터`}>
          {["", ...options].map((option) => (
            <button type="button" role="option" aria-selected={value === option} className={value === option ? "is-selected" : ""} key={option || "all"} onClick={() => onChange(option)}>
              {option || "전체"}
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
  const [filters, setFilters] = useState({ title: "", album: "", author: "", year: "" });
  const [openFilter, setOpenFilter] = useState("");
  const [activeEssay, setActiveEssay] = useState(null);
  const [readerPageLayout, setReaderPageLayout] = useState(() => {
    const width = typeof window !== "undefined" ? window.innerWidth : 1440;
    return getReaderPageLayout(width);
  });
  const cursorRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.add("is-essay-page");
    document.body.classList.add("is-essay-page");
    const updateReaderPageSize = () => {
      const nextLayout = getReaderPageLayout(window.innerWidth);
      setReaderPageLayout((currentLayout) =>
        currentLayout.charactersPerLine === nextLayout.charactersPerLine
        && currentLayout.linesPerPage === nextLayout.linesPerPage
          ? currentLayout
          : nextLayout,
      );
    };
    window.addEventListener("resize", updateReaderPageSize);
    return () => {
      window.removeEventListener("resize", updateReaderPageSize);
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
              let musicTitle = "";
              if (item.hasMusic) {
                const musicResponse = await fetch(getContentUrl(year.year, album.directory, item.directory, "music.txt"), { signal: controller.signal });
                if (musicResponse.ok) musicTitle = parseContentFile(await musicResponse.text()).title || item.title;
              }
              return {
                ...info,
                id: `${year.year}/${album.directory}/${item.directory}`,
                year: year.year,
                album: album.directory,
                albumTitle: album.title,
                file: item.directory,
                title: info.title || item.title,
                name: info.name || "",
                musicTitle,
                coverUrl: getContentUrl(year.year, album.directory, item.directory, "cover-essay.png"),
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
    title: [...new Set(essays.map((essay) => essay.title))],
    album: [...new Set(essays.map((essay) => essay.albumTitle))],
    author: [...new Set(essays.map((essay) => essay.name))],
    year: [...new Set(essays.map((essay) => essay.year))],
  }), [essays]);

  const visibleEssays = useMemo(() => essays.filter((essay) =>
    (!filters.title || essay.title === filters.title)
    && (!filters.album || essay.albumTitle === filters.album)
    && (!filters.author || essay.name === filters.author)
    && (!filters.year || essay.year === filters.year)
  ), [essays, filters]);

  const textPages = useMemo(
    () => paginateEssay(activeEssay?.paragraphs ?? [], readerPageLayout),
    [activeEssay, readerPageLayout],
  );

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
  const moveCursor = (event) => {
    if (!cursorRef.current) return;
    cursorRef.current.classList.add("is-visible");
    cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY - 70}px, 0)`;
  };

  return (
    <main className="essay-catalog" onPointerEnter={() => cursorRef.current?.classList.add("is-visible")} onPointerLeave={() => cursorRef.current?.classList.remove("is-visible")} onPointerMove={moveCursor} onPointerDown={(event) => playDigAnimation(cursorRef.current, event)}>
      <div className="essay-catalog__filters" aria-label="에세이 필터" onPointerDown={(event) => event.stopPropagation()}>
        <EssayFilter id="title" label="제목" value={filters.title} options={filterOptions.title} isOpen={openFilter === "title"} onToggle={() => setOpenFilter((current) => current === "title" ? "" : "title")} onChange={(value) => updateFilter("title", value)} />
        <EssayFilter id="album" label="앨범" value={filters.album} options={filterOptions.album} isOpen={openFilter === "album"} onToggle={() => setOpenFilter((current) => current === "album" ? "" : "album")} onChange={(value) => updateFilter("album", value)} />
        <EssayFilter id="author" label="저작자" value={filters.author} options={filterOptions.author} isOpen={openFilter === "author"} onToggle={() => setOpenFilter((current) => current === "author" ? "" : "author")} onChange={(value) => updateFilter("author", value)} />
        <EssayFilter id="year" label="연도" value={filters.year} options={filterOptions.year} isOpen={openFilter === "year"} onToggle={() => setOpenFilter((current) => current === "year" ? "" : "year")} onChange={(value) => updateFilter("year", value)} />
        <button className="essay-catalog__reset" type="button" onClick={() => { setFilters({ title: "", album: "", author: "", year: "" }); setOpenFilter(""); }}>필터 초기화</button>
      </div>

      <section className="essay-catalog__scroll" aria-live="polite">
        {status === "loading" && <p className="essay-catalog__status">책을 정리하는 중...</p>}
        {status === "error" && <p className="essay-catalog__status">에세이를 불러오지 못했습니다.</p>}
        {status === "ready" && (
          <div className="essay-catalog__grid">
            {visibleEssays.map((essay) => (
              <button className="essay-card" type="button" key={essay.id} onPointerDown={(event) => event.stopPropagation()} onClick={() => openEssay(essay)}>
                <span className="essay-card__cover"><img src={essay.coverUrl} alt="" loading="lazy" draggable="false" /></span>
              </button>
            ))}
          </div>
        )}
      </section>

      {activeEssay && (
        <div className="essay-reading-modal" role="dialog" aria-modal="true" aria-label={`${activeEssay.title} 읽기`} onPointerDown={(event) => event.stopPropagation()}>
          <button className="essay-reading-modal__close" type="button" aria-label="책 닫기" onClick={closeEssay}><PiX aria-hidden="true" /></button>
          <div className="essay-reading-modal__book">
            <DemoBook key={`${activeEssay.id}-landscape-book-${textPages.length}`} essay={activeEssay} pages={textPages} onOpenMusic={openMusic} />
          </div>
        </div>
      )}

      <div ref={cursorRef} className="essay-cursor" aria-hidden="true"><img src="/assets/cursor/digging-pen.png" alt="" draggable="false" /></div>
    </main>
  );
}
