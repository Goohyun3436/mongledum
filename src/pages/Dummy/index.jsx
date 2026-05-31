import { FaInstagram, FaYoutube } from "react-icons/fa";
import { MdMovieFilter } from "react-icons/md";

const ripplesContent = {
  backgroundImage: "pool-background.png",
};

const externalLinks = [
  {
    icon: FaInstagram,
    label: "Instagram",
    href: "https://www.instagram.com/mongledum_official",
  },
  {
    icon: FaYoutube,
    label: "YouTube",
    href: "https://www.youtube.com/@mongledum_official",
  },
  {
    icon: MdMovieFilter,
    label: "MV. 인간은 별안간",
    href: "https://youtu.be/jDTh3jdxxBw?si=WU12qpwCVSldVNjA",
  },
];

window.MONGLEDUM_RIPPLES_CUSTOMIZER = {
  backgroundImage: ripplesContent.backgroundImage,
};

export default function DummyPage() {
  return (
    <div id="ripples3">
      <aside className="floating-links" aria-label="몽글덤 외부 링크">
        <div className="floating-links__card">
          <p className="floating-links__eyebrow">mongledum official</p>
          <div className="floating-links__content">
            <div className="floating-links__actions">
              {externalLinks.map((link) => (
                <a
                  key={link.href}
                  className="floating-links__button"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <link.icon
                    className="floating-links__button-icon"
                    aria-hidden="true"
                  />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
            <div className="floating-links__qr">
              <div className="floating-links__qr-copy">
                <strong>Mobile QR</strong>
              </div>
              <img
                className="floating-links__qr-image"
                src="/assets/mongledum-linktree-qr.svg"
                alt="몽글덤 Linktree QR 코드"
              />
            </div>
          </div>
        </div>
      </aside>
      <span id="fps" hidden aria-hidden="true">
        -- --
      </span>
    </div>
  );
}
