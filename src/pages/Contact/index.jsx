import { useState } from "react";
import { FaApple, FaInstagram, FaSpotify, FaYoutube } from "react-icons/fa";
import {
  FiArrowUpRight,
  FiChevronDown,
  FiMail,
  FiMusic,
  FiSend,
} from "react-icons/fi";

const contactLinks = [
  {
    label: "youtube",
    account: "@mongledum_official",
    href: "https://www.youtube.com/@mongledum_official",
    icon: FaYoutube,
  },
  {
    label: "youtube music",
    account: "@mongledum_official",
    href: "https://music.youtube.com/@mongledum_official?si=kYjnH3swiHl_vhJS",
    icon: FaYoutube,
  },
  {
    label: "instagram",
    account: "@mongledum_official",
    href: "https://www.instagram.com/mongledum_official",
    icon: FaInstagram,
  },
  {
    label: "melon",
    account: "몽글덤",
    href: "https://www.melon.com/artist/timeline.htm?artistId=4605070",
    icon: FiMusic,
  },
  {
    label: "apple music",
    account: "mongledum",
    href: "https://music.apple.com/kr/artist/%EB%AA%BD%EA%B8%80%EB%8D%A4/1838861127",
    icon: FaApple,
  },
  {
    label: "spotify",
    account: "mongledum",
    href: "https://open.spotify.com/artist/1K7iuUuJdIwcCILqikSzGY?si=FlO95sGMTj2l-wWtHekG0Q",
    icon: FaSpotify,
  },
  {
    label: "genie",
    account: "mongledum",
    href: "https://www.genie.co.kr/detail/artistInfo?xxnm=83045978",
    icon: FiMusic,
  },
  {
    label: "bugs",
    account: "mongledum",
    href: "https://music.bugs.co.kr/artist/20244620",
    icon: FiMusic,
  },
  {
    label: "vibe",
    account: "mongledum",
    href: "https://vibe.naver.com/artist/10050419",
    icon: FiMusic,
  },
  {
    label: "flo",
    account: "mongledum",
    href: "https://www.music-flo.com/detail/artist/412548537/track?sortType=POPULARITY&roleType=ALL",
    icon: FiMusic,
  },
];

export default function ContactPage() {
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  const sendEmail = (event) => {
    event.preventDefault();
    if (!window.confirm("작성한 내용으로 메일을 보내시겠습니까?")) return;
    const data = new FormData(event.currentTarget);
    const name = data.get("name")?.toString().trim();
    const contact = ["contactFirst", "contactMiddle", "contactLast"]
      .map((key) => data.get(key)?.toString().trim())
      .join("-");
    const subject = data.get("subject")?.toString().trim();
    const message = data.get("message")?.toString().trim();
    const body = [`보낸 사람: ${name}`, `연락처: ${contact}`, "", message].join(
      "\n",
    );
    window.location.href = `mailto:mongledum@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <main className="contact-page">
      <header className="contact-page__header">
        <h1>contact</h1>
        <p className="contact-page__copy">
          서로의 문장으로부터 음악을 발굴하는 밴드 몽글덤입니다.
          <br />
          우리와 함께 덤으로 불어날 존재들의 연락을 기다립니덤.
        </p>
      </header>
      <section
        className="contact-links"
        aria-label="몽글덤 연락처와 소셜 미디어"
      >
        <div className={`contact-email${isEmailOpen ? " is-open" : ""}`}>
          <button
            className="contact-email__trigger"
            type="button"
            aria-expanded={isEmailOpen}
            aria-controls="contact-email-form"
            onClick={() => setIsEmailOpen((current) => !current)}
          >
            <FiMail className="contact-links__icon" aria-hidden="true" />
            <span className="contact-links__content">
              <strong>email</strong>
              <small>mongledum@gmail.com</small>
            </span>
            <FiChevronDown
              className="contact-email__chevron"
              aria-hidden="true"
            />
          </button>
          <div
            className="contact-email__dropdown"
            id="contact-email-form"
            hidden={!isEmailOpen}
          >
            <form className="contact-email__form" onSubmit={sendEmail}>
              <label>
                <span>이름</span>
                <input type="text" name="name" autoComplete="name" required />
              </label>
              <label>
                <span>연락처</span>
                <span className="contact-email__phone">
                  <input
                    type="tel"
                    name="contactFirst"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    pattern="[0-9]{2,3}"
                    maxLength="3"
                    aria-label="연락처 앞자리"
                    required
                  />
                  <i aria-hidden="true">-</i>
                  <input
                    type="tel"
                    name="contactMiddle"
                    inputMode="numeric"
                    pattern="[0-9]{3,4}"
                    maxLength="4"
                    aria-label="연락처 중간자리"
                    required
                  />
                  <i aria-hidden="true">-</i>
                  <input
                    type="tel"
                    name="contactLast"
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                    maxLength="4"
                    aria-label="연락처 뒷자리"
                    required
                  />
                </span>
              </label>
              <label className="contact-email__subject">
                <span>제목</span>
                <input type="text" name="subject" required />
              </label>
              <label className="contact-email__message">
                <span>내용</span>
                <textarea name="message" rows="4" required />
              </label>
              <section
                className="contact-email__privacy"
                aria-labelledby="contact-privacy-title"
              >
                <h3 id="contact-privacy-title">
                  개인정보 수집 및 이용 동의 <span aria-hidden="true">*</span>
                </h3>
                <div className="contact-email__privacy-content" tabIndex="0">
                  <p>
                    몽글덤은 문의 접수와 답변을 위해 아래와 같이 개인정보를
                    수집·이용합니다.
                  </p>
                  <dl>
                    <div>
                      <dt>수집·이용 목적</dt>
                      <dd>문의 내용 확인, 답변 및 연락</dd>
                    </div>
                    <div>
                      <dt>수집 항목</dt>
                      <dd>이름, 연락처</dd>
                    </div>
                    <div>
                      <dt>보유 및 이용 기간</dt>
                      <dd>문의 처리 완료 후 1년</dd>
                    </div>
                  </dl>
                  <p>
                    동의를 거부할 권리가 있으나, 필수 정보 수집에 동의하지
                    않으면 문의 접수와 답변이 제한됩니다.
                  </p>
                </div>
                <label className="contact-email__privacy-agreement">
                  <input type="checkbox" name="privacyAgreement" required />
                  <span>개인정보 수집 및 이용에 동의합니다.</span>
                </label>
              </section>
              <button className="contact-email__submit" type="submit">
                <FiSend aria-hidden="true" />
                메일 보내기
              </button>
            </form>
          </div>
        </div>
        {contactLinks.map(({ label, account, href, icon: Icon }) => (
          <a href={href} target="_blank" rel="noreferrer" key={label}>
            <Icon className="contact-links__icon" aria-hidden="true" />
            <span className="contact-links__content">
              <strong>{label}</strong>
              <small>{account}</small>
            </span>
            <FiArrowUpRight
              className="contact-links__arrow"
              aria-hidden="true"
            />
          </a>
        ))}
      </section>
    </main>
  );
}
