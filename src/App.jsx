import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";
import EssayPage from "./pages/Essay";
import MainPage from "./pages/Main";
import MusicPage from "./pages/Music";
import ObjectsPage from "./pages/Objects";
import PreparingPage from "./pages/Preparing";
import SerisesPage from "./pages/Serises";
import playDigAnimation from "./utils/playDigAnimation";

const routes = {
  "/": MainPage,
  "/about": AboutPage,
  "/serises": SerisesPage,
  "/essay": EssayPage,
  "/music": MusicPage,
  "/objects": ObjectsPage,
  "/contact": ContactPage,
  "/preparing": PreparingPage,
};

function getPathname() {
  const pathname = window.location.pathname.replace(/\/+$/, "");
  return pathname || "/";
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 760px)").matches;
}

function PageImageGate({ routeKey, children }) {
  const gateRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const gate = gateRef.current;
    if (!gate) return undefined;

    let cancelled = false;
    let hasRevealed = false;
    let settleTimer;
    let frame;
    const watchedImages = new WeakSet();

    const revealWhenReady = () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        if (cancelled) return;
        const images = [...gate.querySelectorAll("img")];
        const pendingImages = images.filter((image) => !image.complete);

        if (pendingImages.length === 0) {
          frame = window.requestAnimationFrame(() => {
            if (!cancelled) {
              hasRevealed = true;
              setIsReady(true);
            }
          });
          return;
        }

        pendingImages.forEach((image) => {
          if (watchedImages.has(image)) return;
          watchedImages.add(image);
          const handleSettled = () => revealWhenReady();
          image.addEventListener("load", handleSettled, { once: true });
          image.addEventListener("error", handleSettled, { once: true });
        });
      }, 300);
    };

    setIsReady(false);
    const observer = new MutationObserver((mutations) => {
      if (hasRevealed) return;
      if (!mutations.some((mutation) => mutation.type === "childList" || mutation.attributeName === "src" || mutation.attributeName === "srcset")) return;
      setIsReady(false);
      revealWhenReady();
    });
    observer.observe(gate, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "srcset"] });
    revealWhenReady();

    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearTimeout(settleTimer);
      window.cancelAnimationFrame(frame);
    };
  }, [routeKey]);

  return <div ref={gateRef} className={`page-image-gate${isReady ? " is-ready" : ""}`} aria-busy={!isReady}>{children}</div>;
}

export default function App() {
  const [pathname, setPathname] = useState(getPathname);
  const diggingCursorRef = useRef(null);
  const pathSegments = pathname.split("/").filter(Boolean);

  useEffect(() => {
    const handlePopState = () => setPathname(getPathname());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigate = (event, href) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();

    if (href !== pathname) {
      window.history.pushState({}, "", href);
      setPathname(href);
      window.scrollTo(0, 0);
    }
  };

  const Page = routes[pathname]
    || (pathname.startsWith("/objects/") ? ObjectsPage : null)
    || (pathname.startsWith("/serises/") ? SerisesPage : MainPage);
  const hasDiggingCursor = pathname === "/"
    || pathname === "/about"
    || pathname === "/essay"
    || pathname === "/music"
    || pathname === "/contact"
    || pathname === "/serises"
    || pathname.startsWith("/serises/");
  const hasFixedContentScroll = pathname === "/"
    || pathname === "/about"
    || pathname === "/music"
    || pathname === "/contact"
    || pathSegments[0] === "objects";

  useEffect(() => {
    document.documentElement.classList.toggle("has-digging-cursor", hasDiggingCursor);
    document.body.classList.toggle("has-digging-cursor", hasDiggingCursor);
    return () => {
      document.documentElement.classList.remove("has-digging-cursor");
      document.body.classList.remove("has-digging-cursor");
    };
  }, [hasDiggingCursor]);

  useEffect(() => {
    document.documentElement.classList.toggle("has-fixed-content-scroll", hasFixedContentScroll);
    document.body.classList.toggle("has-fixed-content-scroll", hasFixedContentScroll);
    return () => {
      document.documentElement.classList.remove("has-fixed-content-scroll");
      document.body.classList.remove("has-fixed-content-scroll");
    };
  }, [hasFixedContentScroll]);

  const moveDiggingCursor = (event) => {
    if (!hasDiggingCursor || !diggingCursorRef.current || isMobileViewport()) return;
    if (event.target.closest?.(".site-header")) {
      diggingCursorRef.current.classList.remove("is-visible");
      return;
    }
    diggingCursorRef.current.classList.add("is-visible");
    diggingCursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY - 70}px, 0)`;
  };

  if (pathname === "/preparing") {
    return <PageImageGate key={pathname} routeKey={pathname}><PreparingPage /></PageImageGate>;
  }

  return (
    <div
      className="site-shell"
      onPointerEnter={(event) => hasDiggingCursor && !isMobileViewport() && !event.target.closest?.(".site-header") && diggingCursorRef.current?.classList.add("is-visible")}
      onPointerLeave={() => diggingCursorRef.current?.classList.remove("is-visible")}
      onPointerMove={moveDiggingCursor}
      onPointerDownCapture={(event) => hasDiggingCursor && !isMobileViewport() && !event.target.closest?.(".site-header") && playDigAnimation(diggingCursorRef.current, event)}
    >
      <Header currentPath={pathname} onNavigate={handleNavigate} />
      <PageImageGate key={pathname} routeKey={pathname}><Page /></PageImageGate>
      {hasDiggingCursor && <div ref={diggingCursorRef} className="essay-cursor" aria-hidden="true"><img src="/assets/cursor/digging-pen.png" alt="" draggable="false" /></div>}
    </div>
  );
}
