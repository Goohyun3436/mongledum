import { useState } from "react";
import { IoVolumeHighOutline } from "react-icons/io5";
import styled from "styled-components";

const members = [
  { name: "박서음", english: "parkse0eum", image: "/assets/profile/seoeum/main_001_zoom.JPG" },
  { name: "구진", english: "Goo Jin", image: "/assets/profile/jin/main_001_zoom.jpg" },
  { name: "구현", english: "Goo Hyun", image: "/assets/profile/hyun/main_001_zoom.JPG" },
  { name: "박재욱", english: "Park Jaewook", image: "/assets/profile/jaewook/main_001_zoom.jpg" },
  { name: "이재균", english: "Lee Jaegyun", image: "/assets/profile/jeagyun/main_001_zoom.JPG" },
  { name: "전형우", english: "Jeon Hyeongwoo", image: "/assets/profile/hyeongu/main_001_zoom.jpg" },
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
          <h1>몽글덤 <span>mongledum</span></h1>
          <p className="dictionary-entry__part"><strong>동사</strong> verb</p>
          <div className="dictionary-entry__pronunciation">
            <span>/ˈmɒŋ.gl.dʌm/</span>
            <button
              type="button"
              aria-label="몽글덤 발음 듣기"
              onClick={() => playPronunciation()}
            >
              <IoVolumeHighOutline aria-hidden="true" />
            </button>
          </div>
        </header>

        <section className="pronunciation-list" aria-labelledby="pronunciation-title">
          <h2 id="pronunciation-title">발음 <span>Pronunciation</span></h2>
          <div className="pronunciation-list__items">
            <button
              className={activeMember === "all" ? "is-active" : undefined}
              type="button"
              onClick={() => playPronunciation()}
            >
              <IoVolumeHighOutline aria-hidden="true" />
              <span>ALL</span>
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
                <span><strong>{member.name}</strong> {member.english}</span>
              </button>
            ))}
          </div>
          <p className="pronunciation-list__guide">
            각자의 프로필을 눌러 여섯 가지 ‘몽글덤’의 발음을 들어보세요.<br />
            <em>Click each profile to hear six different pronunciations of “mongledum.”</em>
          </p>
        </section>

        <section className="dictionary-section dictionary-forms" aria-labelledby="forms-title">
          <h2 id="forms-title">Forms</h2>
          <dl>
            <div>
              <dt>past tense</dt>
              <dd>mongledummed</dd>
            </div>
            <div>
              <dt>past participle</dt>
              <dd>mongledummed</dd>
            </div>
            <div>
              <dt>-ing form</dt>
              <dd>mongledumming</dd>
            </div>
          </dl>
        </section>

        <section className="dictionary-section dictionary-meaning" aria-labelledby="meaning-title">
          <h2 id="meaning-title">뜻 <span>Meaning</span></h2>
          <ol>
            <li>
              <div>
                <strong>서로의 문장으로부터 음악을 발굴하다.</strong>
                <p><em>to uncover music from one another’s words.</em></p>
                <p className="dictionary-example"><em>We mongledummed until dawn.</em><br />우리는 새벽까지 서로의 문장으로부터 음악을 발굴했다.</p>
              </div>
            </li>
            <li>
              <div>
                <strong>서로의 이야기를 다른 예술의 형태로 이어가며 존재들이 덤으로 불어나다.</strong>
                <p><em>to carry one another’s stories into other forms of art, gathering more beings along the way.</em></p>
                <p className="dictionary-example"><em>The more we mongledummed, the more beings joined the story.</em><br />우리가 몽글덤할수록 이야기에는 더 많은 존재들이 덤으로 불어났다.</p>
              </div>
            </li>
          </ol>
        </section>

        <section className="dictionary-section dictionary-usage" aria-labelledby="usage-title">
          <h2 id="usage-title">용례 <span>Usage</span></h2>
          <p><strong>“오늘 뭐 몽글덤?”</strong><br /><em>“What are we mongledumming today?”</em></p>
          <p><strong>“이 문장에서 몽글덤.”</strong><br /><em>“mongledum from this sentence.”</em></p>
          <p><strong>“우리 여름 내내 몽글덤.”</strong><br /><em>“We mongledummed all summer.”</em></p>
        </section>

        <section className="dictionary-section dictionary-etymology" aria-labelledby="etymology-title">
          <h2 id="etymology-title">유래 <span>Origin</span></h2>
          <p><strong>2024, 한국어 Korean</strong></p>
          <p>2024년 결성되어 대한민국 서울을 기반으로 활동하는 밴드 <strong>몽글덤</strong>의 이름에서 비롯되었다.</p>
          <p>서로의 삶과 사유에서 문장을 꺼내어 함께 읽고, 가사와 연주를 거쳐 음악으로 발굴하는 이들의 작업 방식이 하나의 행위를 가리키는 말이 되었다. 오늘날에는 그렇게 만들어진 음악이 다시 만화와 사물, 공연 등 다른 형태의 예술로 이어지는 일까지 아울러 이른다.</p>
          <p><em>From “Mongledum,” the name of a band formed in Seoul, South Korea, in 2024. The word came to describe their practice of uncovering music from one another’s writing, and later, the ways that music continues into other forms of art.</em></p>
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
    width: 100%;
    min-height: calc(100svh - var(--site-header-height));
    margin: 0;
    padding: clamp(36px, 6vw, 92px) clamp(22px, 5vw, 84px);
    background: #ffffff;
  }

  .dictionary-entry {
    width: min(100%, 1500px);
    margin: 0 auto;
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
    font-size: clamp(1.7rem, 3vw, 3.1rem);
    font-weight: 700;
    letter-spacing: -0.055em;
    line-height: 0.9;
  }

  .dictionary-entry__header h1 span {
    color: #59616a;
    font-size: 0.48em;
    letter-spacing: -0.035em;
  }

  .dictionary-entry__part {
    margin: 18px 0 6px;
    color: #3d6f9f;
    font-size: clamp(0.86rem, 1.15vw, 1.1rem);
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
  }

  .pronunciation-list h2 span,
  .dictionary-section h2 span {
    color: #3d6f9f;
    font-weight: 700;
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
    font-weight: 700;
    text-align: center;
    border: 0;
    background: transparent;
  }

  .pronunciation-list__items button > span:last-child { line-height: 1.35; }
  .pronunciation-list__items button > span:last-child strong { display: block; }

  .pronunciation-list__guide {
    margin: 24px 0 0;
    color: #555d66;
    font-size: 0.86rem;
    line-height: 1.7;
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
    font-weight: 700;
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
    grid-template-columns: auto minmax(0, 1fr);
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

  .dictionary-meaning .dictionary-example { margin-top: 16px; color: #3f464d; }
  .dictionary-usage p + p,
  .dictionary-etymology p + p { margin-top: 18px; }

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
      padding: 12px 8px 36px;
    }

    .dictionary-entry {
      padding: 16px 10px 24px;
      box-shadow: 0 12px 28px rgba(35, 45, 55, 0.08);
    }

    .dictionary-entry__header h1 {
      font-size: 1.35rem;
      line-height: 1;
    }

    .dictionary-entry__part {
      margin: 11px 0 4px;
      font-size: 0.7rem;
    }

    .dictionary-entry__pronunciation {
      gap: 7px;
      font-size: 0.78rem;
    }

    .dictionary-entry__pronunciation button {
      width: 28px;
      height: 25px;
      border-radius: 4px;
    }

    .pronunciation-list {
      margin-top: 21px;
    }

    .pronunciation-list h2,
    .dictionary-section h2 {
      margin-bottom: 9px;
      font-size: 0.7rem;
    }

    .pronunciation-list__items {
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 4px;
    }

    .pronunciation-list__items button {
      gap: 4px;
      font-size: 0.48rem;
    }

    .pronunciation-list__items button:first-child,
    .pronunciation-list__portrait {
      border-radius: 5px;
    }

    .pronunciation-list__items button:first-child svg {
      font-size: 0.75rem;
    }

    .pronunciation-list__items button:not(:first-child) > span:last-child {
      font-size: 0;
    }

    .pronunciation-list__items button > span:last-child strong {
      font-size: 0.48rem;
      line-height: 1.2;
    }

    .pronunciation-list__guide {
      margin-top: 15px;
      font-size: 0.65rem;
      line-height: 1.55;
    }

    .dictionary-section {
      margin-top: 22px;
      padding-top: 16px;
    }

    .dictionary-forms dl {
      grid-template-columns: minmax(0, 1fr);
      gap: 7px;
      font-size: 0.67rem;
    }

    .dictionary-forms dl > div {
      grid-template-columns: minmax(90px, 0.8fr) 1fr;
      gap: 8px;
    }

    .dictionary-meaning li {
      gap: 6px;
    }

    .dictionary-meaning ol {
      gap: 20px;
    }

    .dictionary-meaning strong {
      font-size: 0.74rem;
    }

    .dictionary-meaning p,
    .dictionary-usage p,
    .dictionary-etymology p {
      margin-top: 4px;
      font-size: 0.67rem;
      line-height: 1.5;
    }

    .dictionary-meaning .dictionary-example {
      margin-top: 10px;
    }

    .dictionary-usage p + p,
    .dictionary-etymology p + p {
      margin-top: 12px;
    }
  }
`;
