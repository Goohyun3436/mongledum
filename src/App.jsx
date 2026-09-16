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

export default function App() {
  const [pathname, setPathname] = useState(getPathname);
  const diggingCursorRef = useRef(null);

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
    || pathname === "/essay"
    || pathname === "/music"
    || pathname === "/contact"
    || pathname === "/serises"
    || pathname.startsWith("/serises/");

  const moveDiggingCursor = (event) => {
    if (!hasDiggingCursor || !diggingCursorRef.current) return;
    diggingCursorRef.current.classList.add("is-visible");
    diggingCursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY - 70}px, 0)`;
  };

  if (pathname === "/preparing") {
    return <PreparingPage />;
  }

  return (
    <div
      className="site-shell"
      onPointerEnter={() => hasDiggingCursor && diggingCursorRef.current?.classList.add("is-visible")}
      onPointerLeave={() => diggingCursorRef.current?.classList.remove("is-visible")}
      onPointerMove={moveDiggingCursor}
      onPointerDownCapture={(event) => hasDiggingCursor && playDigAnimation(diggingCursorRef.current, event)}
    >
      <Header currentPath={pathname} onNavigate={handleNavigate} />
      <Page />
      {hasDiggingCursor && <div ref={diggingCursorRef} className="essay-cursor" aria-hidden="true"><img src="/assets/cursor/digging-pen.png" alt="" draggable="false" /></div>}
    </div>
  );
}
