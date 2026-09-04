import { useState } from "react";
import { IoVolumeHighOutline } from "react-icons/io5";
import styled from "styled-components";

const members = [
  { name: "구진", image: "/assets/profile/jin/main_001_zoom.jpg" },
  { name: "서음", image: "/assets/profile/seoeum/main_001_zoom.JPG" },
  { name: "재균", image: "/assets/profile/jeagyun/main_001_zoom.JPG" },
  { name: "재욱", image: "/assets/profile/jaewook/main_001_zoom.jpg" },
  { name: "형우", image: "/assets/profile/hyeongu/main_001_zoom.jpg" },
  { name: "구헌", image: "/assets/profile/hyun/main_001_zoom.JPG" },
];

const meanings = [
  {
    english: "to uncover music from one another's words.",
    korean: "서로의 문장으로부터 음악을 발굴하다.",
  },
  {
    english: "We mongledummed until dawn.",
    korean: "우리는 새벽까지 서로의 문장으로부터 음악을 발굴했다.",
  },
  {
    english: "to stay with a sentence until it becomes a song.",
    korean: "문장이 노래가 될 때까지 곁에 머무르다.",
  },
  {
    english: "to believe that ordinary words can become extraordinary music.",
    korean: "평범한 말도 음악이 될 수 있다고 믿다.",
  },
];

function speakMongledum(member) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance("몽글덤");
  utterance.lang = "ko-KR";
  utterance.rate = 0.82;
  utterance.dataset = member;
  window.speechSynthesis.speak(utterance);
}

export default function AboutPage() {
  const [activeMember, setActiveMember] = useState("all");

  const playPronunciation = (member = "all") => {
    setActiveMember(member);
    speakMongledum(member);
  };

  return (
    <AboutPageLayout className="about-page">
      <article className="dictionary-entry">
        <header className="dictionary-entry__header">
          <h1>mongledum</h1>
          <p className="dictionary-entry__part">verb</p>
          <div className="dictionary-entry__pronunciation">
            <span>/ˈmɒŋɡl.dʌm/</span>
            <button
              type="button"
              aria-label="몽글덤 발음 듣기"
              onClick={() => playPronunciation()}
            >
              <IoVolumeHighOutline aria-hidden="true" />
            </button>
          </div>
          <p className="dictionary-entry__summary">
            서로의 언어로부터 음악을 발굴하는 행위를 뜻한다.
          </p>
        </header>

        <section className="pronunciation-list" aria-labelledby="pronunciation-title">
          <h2 id="pronunciation-title">pronunciation</h2>
          <div className="pronunciation-list__items">
            <button
              className={activeMember === "all" ? "is-active" : undefined}
              type="button"
              onClick={() => playPronunciation()}
            >
              <IoVolumeHighOutline aria-hidden="true" />
              <span>all</span>
            </button>

            {members.map((member) => (
              <button
                key={member.name}
                className={activeMember === member.name ? "is-active" : undefined}
                type="button"
                aria-label={`${member.name}의 몽글덤 발음 듣기`}
                onClick={() => playPronunciation(member.name)}
              >
                <span className="pronunciation-list__portrait">
                  <img
                    src={member.image}
                    alt={`${member.name} 프로필`}
                  />
                </span>
                <span>{member.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="dictionary-section dictionary-forms" aria-labelledby="forms-title">
          <h2 id="forms-title">forms</h2>
          <dl>
            <div>
              <dt>3rd person singular</dt>
              <dd>mongledums</dd>
            </div>
            <div>
              <dt>past tense</dt>
              <dd>mongledummed</dd>
            </div>
            <div>
              <dt>past participle</dt>
              <dd>mongledummed</dd>
            </div>
            <div>
              <dt>gerund</dt>
              <dd>mongledumming</dd>
            </div>
          </dl>
        </section>

        <section className="dictionary-section dictionary-meaning" aria-labelledby="meaning-title">
          <h2 id="meaning-title">meaning</h2>
          <ol>
            {meanings.map((meaning) => (
              <li key={meaning.english}>
                <div>
                  <strong>{meaning.english}</strong>
                  <p>{meaning.korean}</p>
                </div>
                <button
                  type="button"
                  aria-label="뜻 발음 듣기"
                  onClick={() => playPronunciation()}
                >
                  <IoVolumeHighOutline aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        </section>

        <section className="dictionary-section dictionary-usage" aria-labelledby="usage-title">
          <h2 id="usage-title">usage</h2>
          <p>“let&apos;s mongledum.”</p>
          <p>“we&apos;ve been mongledumming.”</p>
          <p>“they mongledummed together.”</p>
        </section>

        <section className="dictionary-section dictionary-etymology" aria-labelledby="etymology-title">
          <h2 id="etymology-title">etymology</h2>
          <p>from korean, <em>mongledum.</em></p>
          <p>
            first used by six musicians who believed that music could be
            excavated from words.
          </p>
        </section>
      </article>

    </AboutPageLayout>
  );
}

const AboutPageLayout = styled.main`
  & {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: clamp(32px, 6vw, 100px);
    width: min(100%, 1500px);
    min-height: calc(100svh - 45px);
    margin: 0 auto;
    padding: clamp(36px, 6vw, 92px) clamp(22px, 5vw, 84px);
    background: #ffffff;
  }

  .dictionary-entry {
    padding: clamp(28px, 4vw, 54px);
    color: #15171a;
    border: 1px solid #dfe2e6;
    background:
      radial-gradient(circle at 80% 16%, rgba(184, 216, 236, 0.2), transparent 28%),
      #ffffff;
    box-shadow: 0 24px 55px rgba(35, 45, 55, 0.1);
  }

  .dictionary-entry button {
    color: inherit;
    font: inherit;
    cursor: pointer;
  }

  .dictionary-entry__header h1 {
    margin: 0;
    font-size: clamp(2.8rem, 6vw, 5.8rem);
    font-weight: 700;
    letter-spacing: -0.055em;
    line-height: 0.9;
  }

  .dictionary-entry__part {
    margin: 18px 0 6px;
    color: #3d6f9f;
    font-size: clamp(1.15rem, 2vw, 1.65rem);
    font-weight: 700;
  }

  .dictionary-entry__pronunciation {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #4d535b;
    font-size: clamp(1rem, 1.6vw, 1.3rem);
  }

  .dictionary-entry__summary {
    max-width: 34rem;
    margin: 22px 0 0;
    color: #555d66;
    font-family: "Apple SD Gothic Neo", "Noto Sans KR", Arial, sans-serif;
    font-size: clamp(0.9rem, 1.2vw, 1.02rem);
    line-height: 1.65;
    word-break: keep-all;
  }

  .dictionary-entry__pronunciation button,
  .dictionary-meaning li > button {
    display: inline-grid;
    width: 38px;
    height: 34px;
    padding: 0;
    border: 1px solid #cfd5dc;
    border-radius: 5px;
    place-items: center;
    background: #f4f6f8;
  }

  .pronunciation-list {
    margin-top: 34px;
  }

  .pronunciation-list h2,
  .dictionary-section h2 {
    margin: 0 0 14px;
    color: #3d6f9f;
    font-size: 0.92rem;
    font-weight: 700;
    text-transform: lowercase;
  }

  .pronunciation-list__items {
    display: grid;
    grid-template-columns: repeat(7, minmax(54px, 1fr));
    gap: clamp(8px, 1.2vw, 14px);
  }

  .pronunciation-list__items button {
    display: grid;
    gap: 7px;
    min-width: 0;
    padding: 0;
    color: #454b52;
    font-size: 0.68rem;
    text-align: center;
    border: 0;
    background: transparent;
  }

  .pronunciation-list__items button:first-child,
  .pronunciation-list__portrait {
    width: 100%;
    min-height: 0;
    aspect-ratio: 1 / 1;
    border: 1px solid #cfd5dc;
    border-radius: 10px;
  }

  .pronunciation-list__items button:first-child {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: #3d6f9f;
    background: #f4f7fa;
  }

  .pronunciation-list__portrait {
    position: relative;
    display: block;
    overflow: hidden;
  }

  .pronunciation-list__portrait img {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .pronunciation-list__items button.is-active:first-child,
  .pronunciation-list__items button.is-active .pronunciation-list__portrait,
  .pronunciation-list__items button:hover .pronunciation-list__portrait,
  .pronunciation-list__items button:focus-visible .pronunciation-list__portrait {
    border-color: #9fc6ff;
    box-shadow: 0 0 0 2px rgba(159, 198, 255, 0.2);
  }

  .dictionary-section {
    margin-top: 32px;
    padding-top: 23px;
    border-top: 1px solid #dfe2e6;
  }

  .dictionary-forms dl {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 34px;
    margin: 0;
  }

  .dictionary-forms dl > div {
    display: grid;
    grid-template-columns: minmax(110px, 1fr) 1fr;
    gap: 14px;
  }

  .dictionary-forms dt {
    color: #777f88;
  }

  .dictionary-forms dd {
    margin: 0;
    color: #24282d;
  }

  .dictionary-meaning ol {
    display: grid;
    gap: 28px;
    margin: 0;
    padding: 0;
    counter-reset: meaning-item;
  }

  .dictionary-meaning li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 20px;
    counter-increment: meaning-item;
  }

  .dictionary-meaning li::before {
    content: counter(meaning-item) ".";
    color: #111111;
    font-weight: 800;
  }

  .dictionary-meaning strong {
    font-size: 0.95rem;
  }

  .dictionary-meaning p,
  .dictionary-usage p,
  .dictionary-etymology p {
    margin: 6px 0 0;
    color: #69717a;
    font-size: 0.86rem;
    line-height: 1.55;
  }

  .dictionary-usage,
  .dictionary-etymology {
    color: #31363c;
  }

  .word-gallery {
    position: sticky;
    top: 81px;
    padding: clamp(24px, 3vw, 38px);
    color: #15171a;
    border: 1px solid #dfe2e6;
    background: #ffffff;
    box-shadow: 0 20px 45px rgba(35, 45, 55, 0.1);
  }

  .word-gallery h2 {
    margin: 0 0 28px;
    font-size: clamp(1.6rem, 3vw, 2.4rem);
    letter-spacing: -0.04em;
    text-transform: lowercase;
  }

  .word-gallery__placeholder {
    display: grid;
    width: 100%;
    aspect-ratio: 1 / 1;
    color: #69572a;
    border-radius: 8px;
    place-content: center;
    text-align: center;
    background:
      radial-gradient(circle at 50% 42%, #fff9df 0 18%, transparent 19%),
      linear-gradient(145deg, #dca466, #945236);
  }

  .word-gallery__placeholder span {
    font-size: 1.3rem;
    font-weight: 800;
  }

  .word-gallery__placeholder small {
    margin-top: 4px;
  }

  .word-gallery > p {
    margin: 12px 0 0;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .word-gallery > p span,
  .word-gallery .word-gallery__meaning {
    color: #747b83;
    font-size: 0.82rem;
    font-weight: 400;
  }

  @media (max-width: 980px) {
    & {
      grid-template-columns: minmax(0, 1fr);
    }

    .word-gallery {
      position: static;
      width: min(100%, 460px);
    }
  }

  @media (max-width: 660px) {
    & {
      padding: 24px 14px 52px;
    }

    .dictionary-entry {
      padding: 24px 18px 32px;
    }

    .pronunciation-list__items {
      grid-template-columns: repeat(4, minmax(50px, 1fr));
    }

    .dictionary-forms dl {
      grid-template-columns: minmax(0, 1fr);
    }

    .dictionary-meaning li {
      gap: 8px;
    }
  }
`;
