import { FaInstagram, FaYoutube } from "react-icons/fa";
import { FiArrowUpRight, FiMusic } from "react-icons/fi";

const contactLinks = [
  { label: "instagram", account: "@mongledum_official", href: "https://www.instagram.com/mongledum_official", icon: FaInstagram },
  { label: "youtube music", account: "@mongledum_official", href: "https://music.youtube.com/@mongledum_official?si=kYjnH3swiHl_vhJS", icon: FaYoutube },
  { label: "melon", account: "몽글덤", href: "https://www.melon.com/artist/timeline.htm?artistId=4605070", icon: FiMusic },
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
        {contactLinks.map(({ label, account, href, icon: Icon }, index) => (
          <a href={href} target="_blank" rel="noreferrer" key={label}>
            <span className="contact-links__number">{String(index + 1).padStart(2, "0")}</span>
            <Icon className="contact-links__icon" aria-hidden="true" />
            <span className="contact-links__content"><strong>{label}</strong><small>{account}</small></span>
            <FiArrowUpRight className="contact-links__arrow" aria-hidden="true" />
          </a>
        ))}
      </section>
    </main>
  );
}
