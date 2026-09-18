import { useEffect, useState } from "react";

const navigationItems = [
  { label: "about", href: "/about" },
  { label: "essay", href: "/essay" },
  { label: "music", href: "/music" },
  { label: "serises", href: "/serises" },
  { label: "objects", href: "/objects" },
  { label: "contact", href: "/contact" },
];

export default function Header({ currentPath, onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const innerScroller = document.querySelector(
        "body.has-fixed-content-scroll .home-page, body.has-fixed-content-scroll .about-page, body.has-fixed-content-scroll .music-page, body.has-fixed-content-scroll .contact-page, body.has-fixed-content-scroll .object-detail",
      );
      setIsScrolled(window.scrollY > 0 || (innerScroller?.scrollTop ?? 0) > 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    const frame = window.requestAnimationFrame(handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll, true);
      window.cancelAnimationFrame(frame);
    };
  }, [currentPath]);

  useEffect(() => setIsMenuOpen(false), [currentPath]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  return (
    <header className={`site-header${isScrolled ? " is-scrolled" : ""}${isMenuOpen ? " is-menu-open" : ""}`}>
      <a
        className="site-header__logo-link"
        href="/"
        aria-label="main"
        aria-current={currentPath === "/" ? "page" : undefined}
        onClick={(event) => onNavigate(event, "/")}
      >
        <img
          className="site-header__logo"
          src="/assets/logo/theme.png"
          alt="mongledum"
        />
      </a>

      <button
        className="site-header__menu-button"
        type="button"
        aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={isMenuOpen}
        aria-controls="site-navigation"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <span />
        <span />
      </button>

      <nav id="site-navigation" className="site-header__navigation" aria-label="주요 메뉴">
        {navigationItems.map((item) => (
          <a
            key={item.href}
            className="site-header__navigation-link"
            href={item.href}
            aria-current={currentPath === item.href || currentPath.startsWith(`${item.href}/`) ? "page" : undefined}
            onClick={(event) => {
              setIsMenuOpen(false);
              onNavigate(event, item.href);
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
