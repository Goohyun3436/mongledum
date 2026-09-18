import { FaInstagram, FaYoutube } from "react-icons/fa";

export default function HomeContentSections() {
  return (
    <>
      <section className="home-content-section home-content-section--news">
        <h2>monglenews</h2>
      </section>

      <section className="home-content-section home-content-section--calendar">
        <h2>calendum</h2>
      </section>

      <footer className="site-footer">
        <div className="site-footer__socials" aria-label="몽글덤 소셜 미디어">
          <a href="https://www.instagram.com/mongledum_official" target="_blank" rel="noreferrer" aria-label="몽글덤 Instagram 열기">
            <FaInstagram aria-hidden="true" />
          </a>
          <a href="https://www.youtube.com/@mongledum_official" target="_blank" rel="noreferrer" aria-label="몽글덤 YouTube 열기">
            <FaYoutube aria-hidden="true" />
          </a>
        </div>
        <img className="site-footer__logo" src="/assets/logo/white.png" alt="mongledum" />
        <a className="site-footer__email" href="mailto:mongledum@gmail.com">mongledum@gmail.com</a>
      </footer>
    </>
  );
}
