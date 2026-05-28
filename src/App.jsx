import DummyPage from "./pages/Dummy";

const routes = {
  "/": DummyPage,
};

function NotFoundPage() {
  return (
    <div id="ripples3">
      <span id="fps">404</span>
    </div>
  );
}

export default function App() {
  const pathname = window.location.pathname;
  const Page = routes[pathname] || NotFoundPage;

  return <Page />;
}
