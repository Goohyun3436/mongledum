import { useEffect, useRef } from "react";
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

function MousePointerTrail() {
  const imageAspectRatio = 408 / 468;
  const trailRef = useRef(null);
  const pointerRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const pathRef = useRef([]);
  const frameRef = useRef(0);
  const isPressedRef = useRef(false);

  useEffect(() => {
    const trailNode = trailRef.current;

    if (!trailNode) {
      return undefined;
    }

    const pushPoint = (x, y) => {
      const nextPoint = { x, y, time: performance.now() };
      const currentPath = pathRef.current;
      const lastPoint = currentPath[currentPath.length - 1];

      if (!lastPoint || Math.hypot(lastPoint.x - x, lastPoint.y - y) > 2) {
        currentPath.push(nextPoint);
      } else {
        currentPath[currentPath.length - 1] = nextPoint;
      }

      if (currentPath.length > 120) {
        currentPath.splice(0, currentPath.length - 120);
      }
    };

    const updateImage = () => {
      frameRef.current = 0;

      if (!isPressedRef.current) {
        trailNode.classList.remove("is-visible");
        return;
      }

      const { x, y } = pointerRef.current;
      const path = pathRef.current;
      const targetDistance = 72;

      let trailingPoint = { x: x - targetDistance, y };
      let remainingDistance = targetDistance;

      for (let index = path.length - 1; index > 0; index -= 1) {
        const start = path[index];
        const end = path[index - 1];
        const segmentLength = Math.hypot(start.x - end.x, start.y - end.y);

        if (segmentLength >= remainingDistance) {
          const ratio = remainingDistance / segmentLength;
          trailingPoint = {
            x: start.x + (end.x - start.x) * ratio,
            y: start.y + (end.y - start.y) * ratio,
          };
          remainingDistance = 0;
          break;
        }

        remainingDistance -= segmentLength;
        trailingPoint = end;
      }

      const deltaX = trailingPoint.x - x;
      const deltaY = trailingPoint.y - y;
      const distance = Math.max(28, Math.hypot(deltaX, deltaY));
      const width = Math.max(18, distance / Math.hypot(1, imageAspectRatio));
      const angle = Math.atan2(deltaY, deltaX) - Math.atan2(imageAspectRatio, 1);

      trailNode.classList.add("is-visible");
      trailNode.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad)`;
      trailNode.style.width = `${width}px`;
    };

    const requestUpdate = () => {
      if (!frameRef.current) {
        frameRef.current = window.requestAnimationFrame(updateImage);
      }
    };

    const handlePointerMove = (event) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      pushPoint(event.clientX, event.clientY);
      requestUpdate();
    };

    const handlePointerDown = (event) => {
      isPressedRef.current = true;
      pointerRef.current = { x: event.clientX, y: event.clientY };
      pushPoint(event.clientX, event.clientY);
      requestUpdate();
    };

    const handlePointerUp = () => {
      isPressedRef.current = false;
      trailNode.classList.remove("is-visible");
    };

    const handlePointerLeave = () => {
      isPressedRef.current = false;
      trailNode.classList.remove("is-visible");
    };

    pushPoint(pointerRef.current.x, pointerRef.current.y);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div ref={trailRef} className="mouse-pointer-trail" aria-hidden="true">
      <img src="/assets/mouse-point.png" alt="" className="mouse-pointer-trail__image" draggable="false" />
    </div>
  );
}

export default function App() {
  const pathname = window.location.pathname;
  const Page = routes[pathname] || NotFoundPage;

  return (
    <>
      <Page />
      <MousePointerTrail />
    </>
  );
}
