import { useEffect, useState } from "react";

const navigationItems = [
  { label: "about", href: "/about" },
  { label: "serises", href: "/serises" },
  { label: "essay", href: "/essay" },
  { label: "music", href: "/music" },
  { label: "objects", href: "/objects" },
  { label: "contact", href: "/contact" },
];

export default function Header({ currentPath, onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          src="/assets/logo/white.png"
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
