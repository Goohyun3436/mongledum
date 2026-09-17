import { FaApple, FaInstagram, FaSpotify, FaYoutube } from "react-icons/fa";
import { FiArrowUpRight, FiMail, FiMusic } from "react-icons/fi";

const contactLinks = [
  { label: "email", account: "mongledum@gmail.com", href: "mailto:mongledum@gmail.com", icon: FiMail },
  { label: "instagram", account: "@mongledum_official", href: "https://www.instagram.com/mongledum_official", icon: FaInstagram },
  { label: "youtube music", account: "@mongledum_official", href: "https://music.youtube.com/@mongledum_official?si=kYjnH3swiHl_vhJS", icon: FaYoutube },
  { label: "melon", account: "몽글덤", href: "https://www.melon.com/artist/timeline.htm?artistId=4605070", icon: FiMusic },
  { label: "apple music", account: "mongledum", href: "https://music.apple.com/kr/artist/%EB%AA%BD%EA%B8%80%EB%8D%A4/1838861127", icon: FaApple },
  { label: "spotify", account: "mongledum", href: "https://open.spotify.com/artist/1K7iuUuJdIwcCILqikSzGY?si=FlO95sGMTj2l-wWtHekG0Q", icon: FaSpotify },
  { label: "genie", account: "mongledum", href: "https://www.genie.co.kr/detail/artistInfo?xxnm=83045978", icon: FiMusic },
  { label: "bugs", account: "mongledum", href: "https://music.bugs.co.kr/artist/20244620", icon: FiMusic },
  { label: "vibe", account: "mongledum", href: "https://vibe.naver.com/artist/10050419", icon: FiMusic },
  { label: "flo", account: "mongledum", href: "https://www.music-flo.com/detail/artist/412548537/track?sortType=POPULARITY&roleType=ALL", icon: FiMusic },
];

export default function ContactPage() {
  return (
    <main className="contact-page">
      <header className="contact-page__header">
        <h1>contact</h1>
        <p className="contact-page__copy">
          안녕하세요. 놀이터에서 놀고 있던 우리는 몽글덤이에요.<br />
          우리 몽들은 서로의 문장으로부터 음악을 발굴합니다.<br />
          음악, 공연, 협업 그리고 다정한 인사를 기다립니다.
        </p>
      </header>
      <section className="contact-links" aria-label="몽글덤 연락처와 소셜 미디어">
        {contactLinks.map(({ label, account, href, icon: Icon }) => (
          <a href={href} target="_blank" rel="noreferrer" key={label}>
            <Icon className="contact-links__icon" aria-hidden="true" />
            <span className="contact-links__content"><strong>{label}</strong><small>{account}</small></span>
            <FiArrowUpRight className="contact-links__arrow" aria-hidden="true" />
          </a>
        ))}
      </section>
    </main>
  );
}
