import { useEffect, useState } from "react";
import Header from "./components/Header";
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";
import EssayPage from "./pages/Essay";
import MainPage from "./pages/Main";
import MusicPage from "./pages/Music";
import ObjectsPage from "./pages/Objects";
import PreparingPage from "./pages/Preparing";
import SerisesPage from "./pages/Serises";

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

  const Page = routes[pathname] || (pathname.startsWith("/objects/") ? ObjectsPage : MainPage);

  if (pathname === "/preparing") {
    return <PreparingPage />;
  }

  return (
    <div className="site-shell">
      <Header currentPath={pathname} onNavigate={handleNavigate} />
      <Page />
    </div>
  );
}
