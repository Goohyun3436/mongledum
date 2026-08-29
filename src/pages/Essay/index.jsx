import { useEffect, useRef, useState } from "react";
import playDigAnimation from "../../utils/playDigAnimation";
import { getContentUrl, parseContentFile } from "../../utils/contentFiles";

const ESSAY_ROOT = "/docs";

function renderInlineText(text, keyPrefix) {
  const normalizedText = text.replace(/\\\*/g, "*");
  return normalizedText.split(/(\*\*.+?\*\*)/g).filter(Boolean).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderParagraph(paragraph, paragraphIndex) {
  const lines = paragraph.split("\n");
  return lines.flatMap((line, lineIndex) => {
    const content = renderInlineText(line, `${paragraphIndex}-${lineIndex}`);
    return lineIndex < lines.length - 1
      ? [...content, <br key={`break-${paragraphIndex}-${lineIndex}`} />]
      : content;
  });
}

export default function EssayPage() {
  const [archive, setArchive] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [essay, setEssay] = useState(null);
  const [status, setStatus] = useState("loading");
  const cursorRef = useRef(null);

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
    setStatus("loading");
    fetch(`${ESSAY_ROOT}/files.json`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("아카이브를 불러오지 못했습니다.");
        const data = await response.json();
        await Promise.all(
          (data.years ?? []).flatMap((year) =>
            (year.albums ?? []).map(async (album) => {
              album.people = await Promise.all(
                (album.items ?? []).filter((item) => item.hasEssay).map(async (item) => {
                  const essayResponse = await fetch(getContentUrl(year.year, album.directory, item.directory, "essay.txt"), { signal: controller.signal });
                  if (!essayResponse.ok) throw new Error("멤버 정보를 불러오지 못했습니다.");
                  const info = parseContentFile(await essayResponse.text());
                  let musicTitle = "";

                  if (item.hasMusic) {
                    const musicResponse = await fetch(getContentUrl(year.year, album.directory, item.directory, "music.txt"), { signal: controller.signal });
                    if (musicResponse.ok) musicTitle = parseContentFile(await musicResponse.text()).title || item.title;
                  }

                  return { file: item.directory, item, ...info, title: info.title || item.title, musicTitle };
                }),
              );
            }),
          ),
        );
        data.years = (data.years ?? [])
          .map((year) => ({ ...year, albums: (year.albums ?? []).filter((album) => album.people.length > 0) }))
          .filter((year) => year.albums.length > 0);
        return data;
      })
      .then((data) => {
        const firstYear = data.years?.[0];
        const firstAlbum = firstYear?.albums?.[0];
        const firstPerson = firstAlbum?.people?.[0];
        setArchive(data);
        setSelectedYear(firstYear?.year ?? "");
        setSelectedAlbum(firstAlbum?.directory ?? "");
        setSelectedFile(firstPerson?.file ?? "");
        setEssay(firstPerson ?? null);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, []);

  const years = archive?.years ?? [];
  const albums = years.find((item) => item.year === selectedYear)?.albums ?? [];
  const activeAlbum = albums.find((item) => item.directory === selectedAlbum);
  const activePerson = activeAlbum?.people?.find((item) => item.file === selectedFile);
  const essayPathLabel = [activeAlbum?.index, activeAlbum?.title, activePerson?.name].filter(Boolean).join(" · ");

  const selectPerson = (year, album, person) => {
    setSelectedYear(year);
    setSelectedAlbum(album.directory);
    setSelectedFile(person.file);
    setEssay(person);
    setStatus("ready");
  };

  const moveCursor = (event) => {
    if (!cursorRef.current) return;
    cursorRef.current.classList.add("is-visible");
    cursorRef.current.style.transform = `translate3d(${event.clientX - 8}px, ${event.clientY - 69}px, 0)`;
  };

  const dig = (event) => playDigAnimation(cursorRef.current, event);

  const openMusic = () => {
    if (!activePerson?.musicTitle) return;
    const params = new URLSearchParams({ year: selectedYear, album: selectedAlbum, track: selectedFile });
    window.history.pushState({}, "", `/music?${params.toString()}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo(0, 0);
  };

  return (
    <main className="essay-page" onPointerEnter={() => cursorRef.current?.classList.add("is-visible")} onPointerLeave={() => cursorRef.current?.classList.remove("is-visible")} onPointerMove={moveCursor} onPointerDown={dig}>
      <h1 className="essay-page__title">essay</h1>
      <div className="essay-layout">
        <aside className="essay-archive" aria-label="에세이 아카이브">
          <div className="essay-archive__labels" aria-hidden="true">
            <p className="essay-archive__label">년도</p>
            <p className="essay-archive__label">앨범</p>
            <p className="essay-archive__label">멤버</p>
          </div>
          <div className="essay-archive__scroll">
            <div className="essay-archive__tree">
              {years.flatMap((year) =>
                (year.albums ?? []).map((album, albumIndex) => [
                  <div className="essay-archive__year-cell" key={`${year.year}-${album.directory}-year`}>
                    {albumIndex === 0 && <span className={`essay-archive__year${year.year === selectedYear ? " is-active" : ""}`}>{year.year}</span>}
                  </div>,
                  <div className="essay-archive__albums" key={`${year.year}-${album.directory}-album`} title={album.title}>
                    <span className={year.year === selectedYear && album.directory === selectedAlbum ? "is-active" : ""}>{album.title}</span>
                  </div>,
                  <div className="essay-archive__people" key={`${year.year}-${album.directory}-people`}>
                    {(album.people ?? []).map((person) => (
                      <div className="essay-archive__person" key={person.file} onClick={() => selectPerson(year.year, album, person)}>
                        <button type="button" className={year.year === selectedYear && album.directory === selectedAlbum && person.file === selectedFile ? "is-active" : ""}><span>{person.name}</span></button>
                      </div>
                    ))}
                  </div>,
                ]),
              )}
            </div>
          </div>
        </aside>

        <article className="essay-reader" aria-live="polite">
          {status === "loading" && <p className="essay-reader__status">글을 펼치는 중...</p>}
          {status === "error" && <p className="essay-reader__status">글을 불러오지 못했습니다.</p>}
          {status === "ready" && essay && (
            <>
              <header className="essay-reader__header">
                <div>
                  <p className="essay-reader__eyebrow">{essayPathLabel}</p>
                  <div className="essay-reader__title-row">
                    <h2>{essay.title}</h2>
                    {activePerson?.musicTitle && <button className="essay-reader__music-link" type="button" onClick={openMusic}>[{activePerson.musicTitle}] 들으러 가기</button>}
                  </div>
                </div>
              </header>
              <div className="essay-reader__body">
                {essay.paragraphs.map((paragraph, index) => (
                  <p key={`${index}-${paragraph.slice(0, 12)}`}>{renderParagraph(paragraph, index)}</p>
                ))}
              </div>
            </>
          )}
        </article>
      </div>
      <div ref={cursorRef} className="essay-cursor" aria-hidden="true">
        <img src="/assets/cursor/digging-pen.png" alt="" draggable="false" />
      </div>
    </main>
  );
}
