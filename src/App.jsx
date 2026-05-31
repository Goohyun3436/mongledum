import { useCallback, useEffect, useRef, useState } from "react";
import { IoIosClose } from "react-icons/io";
import DummyPage from "./pages/Dummy";

const routes = {
  "/": DummyPage,
};

const GESTURE_POINT_COUNT = 32;
const GESTURE_SQUARE_SIZE = 200;
const HALF_DIAGONAL =
  0.5 * Math.hypot(GESTURE_SQUARE_SIZE, GESTURE_SQUARE_SIZE);
const ANGLE_RANGE = Math.PI / 4;
const ANGLE_PRECISION = Math.PI / 90;
const GOLDEN_RATIO = 0.5 * (-1 + Math.sqrt(5));
const STAR_TEMPLATE_POINTS = [
  { x: 0.5, y: 0.04 },
  { x: 0.62, y: 0.36 },
  { x: 0.96, y: 0.36 },
  { x: 0.68, y: 0.56 },
  { x: 0.8, y: 0.92 },
  { x: 0.5, y: 0.68 },
  { x: 0.2, y: 0.92 },
  { x: 0.32, y: 0.56 },
  { x: 0.04, y: 0.36 },
  { x: 0.38, y: 0.36 },
  { x: 0.5, y: 0.04 },
];

function getDistance(pointA, pointB) {
  return Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
}

function getPathLength(points) {
  let length = 0;

  for (let index = 1; index < points.length; index += 1) {
    length += getDistance(points[index - 1], points[index]);
  }

  return length;
}

function getCentroid(points) {
  const total = points.reduce(
    (accumulator, point) => ({
      x: accumulator.x + point.x,
      y: accumulator.y + point.y,
    }),
    { x: 0, y: 0 },
  );

  return {
    x: total.x / points.length,
    y: total.y / points.length,
  };
}

function resample(points, targetCount) {
  if (points.length === 0) {
    return [];
  }

  const interval = getPathLength(points) / (targetCount - 1);
  const sampledPoints = [points[0]];
  const mutablePoints = points.map((point) => ({ ...point }));
  let accumulatedDistance = 0;
  let previousPoint = mutablePoints[0];

  for (let index = 1; index < mutablePoints.length; index += 1) {
    const currentPoint = mutablePoints[index];
    const segmentLength = getDistance(previousPoint, currentPoint);

    if (segmentLength === 0) {
      continue;
    }

    if (accumulatedDistance + segmentLength >= interval) {
      const ratio = (interval - accumulatedDistance) / segmentLength;
      const interpolatedPoint = {
        x: previousPoint.x + ratio * (currentPoint.x - previousPoint.x),
        y: previousPoint.y + ratio * (currentPoint.y - previousPoint.y),
      };

      sampledPoints.push(interpolatedPoint);
      previousPoint = interpolatedPoint;
      accumulatedDistance = 0;
    } else {
      accumulatedDistance += segmentLength;
      previousPoint = currentPoint;
    }
  }

  while (sampledPoints.length < targetCount) {
    sampledPoints.push(mutablePoints[mutablePoints.length - 1]);
  }

  return sampledPoints;
}

function rotateBy(points, angle) {
  const centroid = getCentroid(points);
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return points.map((point) => {
    const translatedX = point.x - centroid.x;
    const translatedY = point.y - centroid.y;

    return {
      x: translatedX * cosine - translatedY * sine + centroid.x,
      y: translatedX * sine + translatedY * cosine + centroid.y,
    };
  });
}

function rotateToZero(points) {
  const centroid = getCentroid(points);
  const angle = Math.atan2(points[0].y - centroid.y, points[0].x - centroid.x);

  return rotateBy(points, -angle);
}

function scaleToSquare(points, size) {
  const bounds = points.reduce(
    (accumulator, point) => ({
      minX: Math.min(accumulator.minX, point.x),
      minY: Math.min(accumulator.minY, point.y),
      maxX: Math.max(accumulator.maxX, point.x),
      maxY: Math.max(accumulator.maxY, point.y),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  );

  const width = Math.max(bounds.maxX - bounds.minX, 1);
  const height = Math.max(bounds.maxY - bounds.minY, 1);

  return points.map((point) => ({
    x: (point.x * size) / width,
    y: (point.y * size) / height,
  }));
}

function translateToOrigin(points) {
  const centroid = getCentroid(points);

  return points.map((point) => ({
    x: point.x - centroid.x,
    y: point.y - centroid.y,
  }));
}

function normalizeGesture(points) {
  return translateToOrigin(
    scaleToSquare(
      rotateToZero(resample(points, GESTURE_POINT_COUNT)),
      GESTURE_SQUARE_SIZE,
    ),
  );
}

function getPathDistance(pointsA, pointsB) {
  let distance = 0;

  for (let index = 0; index < pointsA.length; index += 1) {
    distance += getDistance(pointsA[index], pointsB[index]);
  }

  return distance / pointsA.length;
}

function distanceAtAngle(points, template, angle) {
  return getPathDistance(rotateBy(points, angle), template);
}

function distanceAtBestAngle(
  points,
  template,
  angleStart,
  angleEnd,
  anglePrecision,
) {
  let start = angleStart;
  let end = angleEnd;
  let angleA = GOLDEN_RATIO * start + (1 - GOLDEN_RATIO) * end;
  let angleB = (1 - GOLDEN_RATIO) * start + GOLDEN_RATIO * end;
  let distanceA = distanceAtAngle(points, template, angleA);
  let distanceB = distanceAtAngle(points, template, angleB);

  while (Math.abs(end - start) > anglePrecision) {
    if (distanceA < distanceB) {
      end = angleB;
      angleB = angleA;
      distanceB = distanceA;
      angleA = GOLDEN_RATIO * start + (1 - GOLDEN_RATIO) * end;
      distanceA = distanceAtAngle(points, template, angleA);
    } else {
      start = angleA;
      angleA = angleB;
      distanceA = distanceB;
      angleB = (1 - GOLDEN_RATIO) * start + GOLDEN_RATIO * end;
      distanceB = distanceAtAngle(points, template, angleB);
    }
  }

  return Math.min(distanceA, distanceB);
}

const STAR_TEMPLATE = normalizeGesture(
  STAR_TEMPLATE_POINTS.map((point) => ({
    x: point.x * GESTURE_SQUARE_SIZE,
    y: point.y * GESTURE_SQUARE_SIZE,
  })),
);

function isStarGesture(points) {
  if (points.length < 12) {
    return false;
  }

  const bounds = points.reduce(
    (accumulator, point) => ({
      minX: Math.min(accumulator.minX, point.x),
      minY: Math.min(accumulator.minY, point.y),
      maxX: Math.max(accumulator.maxX, point.x),
      maxY: Math.max(accumulator.maxY, point.y),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  );

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const pathLength = getPathLength(points);

  if (width < 48 || height < 48 || pathLength < 150) {
    return false;
  }

  const normalizedPoints = normalizeGesture(points);
  const distance = distanceAtBestAngle(
    normalizedPoints,
    STAR_TEMPLATE,
    -ANGLE_RANGE,
    ANGLE_RANGE,
    ANGLE_PRECISION,
  );
  const score = 1 - distance / HALF_DIAGONAL;

  return score > 0.48;
}

function NotFoundPage() {
  return (
    <div id="ripples3">
      <span id="fps">404</span>
    </div>
  );
}

function EasterEggPopup({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="easter-egg-popup"
      role="dialog"
      aria-modal="true"
      aria-labelledby="easter-egg-title"
    >
      <button
        className="easter-egg-popup__backdrop"
        type="button"
        aria-label="팝업 닫기"
        onClick={onClose}
      />
      <div className="easter-egg-popup__card">
        <button
          className="easter-egg-popup__close"
          type="button"
          aria-label="팝업 닫기"
          onClick={onClose}
        >
          <IoIosClose className="easter-egg-popup__close-icon" aria-hidden="true" />
        </button>
        <p className="easter-egg-popup__eyebrow">
          별을 아주 잘 그려주신 당신에게..
        </p>
        <h2 id="easter-egg-title" className="easter-egg-popup__title">
          NFC 키링 이스터에그 특별 콘텐츠
        </h2>
        <div className="easter-egg-popup__content">
          <section
            className="easter-egg-popup__panel"
            aria-labelledby="easter-egg-preview-title"
          >
            <h3
              id="easter-egg-preview-title"
              className="easter-egg-popup__panel-title"
            >
              제작과정 비하인드 영상
            </h3>
            <div className="easter-egg-popup__video-frame">
              <iframe
                className="easter-egg-popup__video"
                src="https://www.youtube-nocookie.com/embed/jDTh3jdxxBw?rel=0"
                title="몽글덤 MV 유튜브 미리보기"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </section>
          <section
            className="easter-egg-popup__panel"
            aria-labelledby="easter-egg-ticket-title"
          >
            <h3
              id="easter-egg-ticket-title"
              className="easter-egg-popup__panel-title"
            >
              후원해주신 분들께
            </h3>
            <img
              className="easter-egg-popup__ticket"
              src="/assets/ticket.png"
              alt="몽글덤 티켓 할인권 이미지"
            />
          </section>
        </div>
      </div>
    </div>
  );
}

function MousePointerTrail({ onStarGesture }) {
  const imageAspectRatio = 408 / 468;
  const releaseAnimationMs = 560;
  const trailRef = useRef(null);
  const pointerRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const releasePointRef = useRef(null);
  const pathRef = useRef([]);
  const frameRef = useRef(0);
  const isPressedRef = useRef(false);
  const releaseTimeoutRef = useRef(0);

  useEffect(() => {
    const trailNode = trailRef.current;

    if (!trailNode) {
      return undefined;
    }

    const clearReleaseAnimation = () => {
      if (releaseTimeoutRef.current) {
        window.clearTimeout(releaseTimeoutRef.current);
        releaseTimeoutRef.current = 0;
      }
    };

    const hideTrailImmediately = () => {
      trailNode.classList.add("is-hidden");
      trailNode.classList.remove("is-visible", "is-releasing");
    };

    const dispatchReleaseClick = () => {
      const releasePoint = releasePointRef.current;

      if (!releasePoint) {
        return;
      }

      const target = document.elementFromPoint(releasePoint.x, releasePoint.y);

      if (!target) {
        return;
      }

      target.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: releasePoint.x,
          clientY: releasePoint.y,
          view: window,
        }),
      );
    };

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
      const { x, y } = pointerRef.current;

      if (!isPressedRef.current) {
        trailNode.classList.remove("is-releasing");
        trailNode.classList.remove("is-hidden");
        trailNode.classList.add("is-visible");
        trailNode.style.transform = `translate(${x}px, ${y}px) rotate(0rad)`;
        trailNode.style.width = "24px";
        return;
      }

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
      const angle =
        Math.atan2(deltaY, deltaX) - Math.atan2(imageAspectRatio, 1);

      trailNode.classList.remove("is-releasing");
      trailNode.classList.remove("is-hidden");
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

      if (isPressedRef.current) {
        pushPoint(event.clientX, event.clientY);
      } else {
        pathRef.current = [
          { x: event.clientX, y: event.clientY, time: performance.now() },
        ];
      }

      requestUpdate();
    };

    const handlePointerDown = (event) => {
      clearReleaseAnimation();
      isPressedRef.current = true;
      pathRef.current = [];
      trailNode.classList.remove("is-hidden");
      trailNode.classList.remove("is-releasing");
      trailNode.classList.add("is-visible");
      pointerRef.current = { x: event.clientX, y: event.clientY };
      pushPoint(event.clientX, event.clientY);
      requestUpdate();
    };

    const handlePointerUp = (event) => {
      clearReleaseAnimation();
      isPressedRef.current = false;
      const gesturePath = pathRef.current.slice();
      releasePointRef.current = {
        x: event.clientX,
        y: event.clientY,
      };

      if (!trailNode.classList.contains("is-visible")) {
        return;
      }

      if (isStarGesture(gesturePath)) {
        hideTrailImmediately();
        onStarGesture();
        return;
      }

      trailNode.classList.add("is-releasing");
      releaseTimeoutRef.current = window.setTimeout(() => {
        dispatchReleaseClick();
        hideTrailImmediately();
        releaseTimeoutRef.current = 0;
      }, releaseAnimationMs);
    };

    const handlePointerLeave = () => {
      clearReleaseAnimation();
      isPressedRef.current = false;
      hideTrailImmediately();
    };

    pushPoint(pointerRef.current.x, pointerRef.current.y);

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, {
      passive: true,
    });
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      clearReleaseAnimation();

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [onStarGesture]);

  return (
    <div ref={trailRef} className="mouse-pointer-trail" aria-hidden="true">
      <img
        src="/assets/mouse-point.png"
        alt=""
        className="mouse-pointer-trail__image"
        draggable="false"
      />
    </div>
  );
}

export default function App() {
  const [isEasterEggOpen, setIsEasterEggOpen] = useState(false);
  const handleStarGesture = useCallback(() => {
    setIsEasterEggOpen(true);
  }, []);
  const pathname = window.location.pathname;
  const Page = routes[pathname] || NotFoundPage;

  return (
    <>
      <Page />
      <MousePointerTrail onStarGesture={handleStarGesture} />
      {isEasterEggOpen ? (
        <EasterEggPopup onClose={() => setIsEasterEggOpen(false)} />
      ) : null}
    </>
  );
}
