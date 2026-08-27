import { useCallback, useEffect, useRef, useState } from "react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { MdMovieFilter } from "react-icons/md";
import { createGlobalStyle } from "styled-components";

const ripplesContent = {
  backgroundImage: "ep/001/pool-background.png",
};
const playerOverlayState =
  window.MONGLEDUM_PLAYER_OVERLAY ||
  (window.MONGLEDUM_PLAYER_OVERLAY = {
    visible: false,
    image: null,
    isLoaded: false,
  });
const playerOverlayImage = playerOverlayState.image || new Image();

if (!playerOverlayState.image) {
  playerOverlayState.image = playerOverlayImage;
  playerOverlayImage.addEventListener("load", () => {
    playerOverlayState.isLoaded = true;

    if (playerOverlayState.visible) {
      window.MONGLEDUM_RIPPLES_INSTANCE?.updateBackgroundTexture();
    }
  });
  playerOverlayImage.src = "/assets/ep/001/player.png";
} else if (playerOverlayImage.complete) {
  playerOverlayState.isLoaded = true;
}

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
  backgroundSizing: "width",
  backgroundColor: "#c7e0ff",
  backgroundPosition: "center",
  drawBackgroundOverlay(context, liquid) {
    const overlayImage = playerOverlayState.image;
    const viewportWidth = window.innerWidth || liquid.wrap?.clientWidth || liquid.w;
    const viewportHeight =
      window.innerHeight || liquid.wrap?.clientHeight || liquid.h;
    const isMobileViewport = viewportWidth <= 720;
    const scaleX = liquid.w / viewportWidth;
    const scaleY = liquid.h / viewportHeight;

    if (!playerOverlayState.visible || !playerOverlayState.isLoaded) {
      return;
    }

    const maxWidthCss = isMobileViewport
      ? Math.min(viewportWidth * 0.28, 228)
      : Math.min(viewportWidth * 0.36, 460);
    const minWidthCss = isMobileViewport
      ? Math.min(viewportWidth * 0.38, 152)
      : Math.min(viewportWidth * 0.5, 320);
    const drawWidthCss = Math.max(minWidthCss, maxWidthCss);
    const drawHeightCss =
      drawWidthCss * (overlayImage.naturalHeight / overlayImage.naturalWidth);
    const drawXCss = (viewportWidth - drawWidthCss) / 2 + drawWidthCss * 0.16;
    const drawYCss =
      (viewportHeight - drawHeightCss) / 2 + drawHeightCss * 0.16;
    const drawWidth = drawWidthCss * scaleX;
    const drawHeight = drawHeightCss * scaleY;
    const drawX = drawXCss * scaleX;
    const drawY = drawYCss * scaleY;

    context.drawImage(overlayImage, drawX, drawY, drawWidth, drawHeight);
  },
};

function PreparingContent() {
  const audioRef = useRef(null);
  const openedAtRef = useRef(0);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return undefined;
    }

    const handleEnded = () => {
      setIsPlayerVisible(false);
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      playerOverlayState.visible = false;
      if (window.MONGLEDUM_RIPPLES_INSTANCE) {
        window.MONGLEDUM_RIPPLES_INSTANCE.freezeAutoScale = false;
      }
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    playerOverlayState.visible = isPlayerVisible;
    if (window.MONGLEDUM_RIPPLES_INSTANCE) {
      window.MONGLEDUM_RIPPLES_INSTANCE.freezeAutoScale = isPlayerVisible;
    }

    if (playerOverlayState.isLoaded) {
      window.MONGLEDUM_RIPPLES_INSTANCE?.updateBackgroundTexture();
    }
  }, [isPlayerVisible]);

  const handlePlayerHotspotClick = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    try {
      audio.currentTime = 0;
      await audio.play();
      openedAtRef.current = performance.now();
      setIsPlayerVisible(true);
    } catch {
      setIsPlayerVisible(false);
    }
  };

  const handleBackgroundClick = (event) => {
    const { innerWidth, innerHeight } = window;
    const hotspotWidth = innerWidth * 0.5;
    const hotspotHeight = innerHeight * 0.5;
    const hotspotLeft = (innerWidth - hotspotWidth) / 2;
    const hotspotTop = (innerHeight - hotspotHeight) / 2;
    const isInsideHotspot =
      event.clientX >= hotspotLeft &&
      event.clientX <= hotspotLeft + hotspotWidth &&
      event.clientY >= hotspotTop &&
      event.clientY <= hotspotTop + hotspotHeight;

    if (!isInsideHotspot) {
      return;
    }

    if (isPlayerVisible) {
      if (performance.now() - openedAtRef.current < 1200) {
        return;
      }

      handlePlayerOverlayClick();
      return;
    }

    handlePlayerHotspotClick();
  };

  const handlePlayerOverlayClick = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    setIsPlayerVisible(false);
  };

  return (
    <div
      id="ripples3"
      onClick={handleBackgroundClick}
      style={{
        "--ripples-background-image": `url("/assets/${ripplesContent.backgroundImage}")`,
      }}
    >
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
                src="/assets/share/mongledum-linktree-qr.svg"
                alt="몽글덤 Linktree QR 코드"
              />
            </div>
          </div>
        </div>
      </aside>
      <span id="fps" hidden aria-hidden="true">
        -- --
      </span>
      <audio ref={audioRef} src="/assets/etc/player.mp3" preload="auto" />
    </div>
  );
}
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

  return score > 0.5;
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
          <IoIosClose
            className="easter-egg-popup__close-icon"
            aria-hidden="true"
          />
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
              src="/assets/ep/001/ticket.png"
              alt="몽글덤 티켓 할인권 이미지"
            />
          </section>
        </div>
      </div>
    </div>
  );
}

export function MousePointerTrail({ onStarGesture }) {
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
  const isReleasingRef = useRef(false);
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

      isReleasingRef.current = false;
    };

    const hideTrailImmediately = () => {
      isReleasingRef.current = false;
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

      if (isReleasingRef.current) {
        return;
      }

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

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }

      isReleasingRef.current = true;
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
        src="/assets/cursor/flying-fish.png"
        alt=""
        className="mouse-pointer-trail__image"
        draggable="false"
      />
    </div>
  );
}

export default function PreparingPage() {
  const [isEasterEggOpen, setIsEasterEggOpen] = useState(false);
  const handleStarGesture = useCallback(() => {
    setIsEasterEggOpen(true);
  }, []);

  return (
    <div className="preparing-page">
      <PreparingGlobalStyles />
      <PreparingContent />
      <MousePointerTrail onStarGesture={handleStarGesture} />
      {isEasterEggOpen ? (
        <EasterEggPopup onClose={() => setIsEasterEggOpen(false)} />
      ) : null}
    </div>
  );
}

export const PreparingGlobalStyles = createGlobalStyle`
.preparing-page {
  --back: rgba(255, 255, 255, 0.65);
  --col: rgba(0, 0, 0, 1);
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  background: #000000;
  font-family: "Courier New", Courier, monospace;
  touch-action: none;
  user-select: none;
}

.preparing-page #ripples3 {
  height: 100%;
}

.floating-links {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 999;
  display: flex;
  justify-content: flex-end;
  width: min(100% - 32px, 300px);
  pointer-events: none;
}

.floating-links__card {
  position: relative;
  display: grid;
  gap: 14px;
  width: 100%;
  padding: 18px;
  color: #143848;
  pointer-events: auto;
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(245, 251, 255, 0.5)),
    rgba(255, 255, 255, 0.5);
  box-shadow:
    0 24px 50px rgba(12, 28, 38, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(18px) saturate(150%);
}

.floating-links__eyebrow {
  margin: 0;
  color: rgba(20, 56, 72, 0.62);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-family: "Trebuchet MS", "Segoe UI", sans-serif;
}

.floating-links__content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: stretch;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.floating-links__actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(8px, 1.5vw, 12px);
  min-width: 0;
  width: 100%;
}

.floating-links__button {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: clamp(4px, 0.9vw, 8px);
  min-height: clamp(36px, 6vw, 42px);
  min-width: 0;
  padding: 0 clamp(12px, 1.6vw, 16px);
  width: 100%;
  max-width: 100%;
  color: inherit;
  font-family: "Trebuchet MS", "Segoe UI", sans-serif;
  font-size: clamp(0.78rem, 1.8vw, 0.8rem);
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  border-radius: 8px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.96),
    rgba(238, 247, 252, 0.86)
  );
  box-shadow:
    0 7px 14px rgba(75, 119, 138, 0.1),
    inset 0 -1px 0 rgba(255, 255, 255, 0.45);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
  box-sizing: border-box;
  overflow: hidden;
}

.floating-links__button span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.floating-links__button:hover,
.floating-links__button:focus-visible {
  transform: translateY(-2px);
  box-shadow:
    0 10px 18px rgba(75, 119, 138, 0.14),
    inset 0 -1px 0 rgba(255, 255, 255, 0.55);
}

.floating-links__button-icon {
  flex: 0 0 auto;
  font-size: clamp(0.82rem, 1.8vw, 1rem);
  color: #3b748d;
}

.floating-links__qr {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 10px;
  min-width: 0;
  width: 100%;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.52);
  box-sizing: border-box;
  overflow: hidden;
}

.floating-links__qr-image {
  display: block;
  width: min(100%, 108px);
  height: auto;
  aspect-ratio: 1;
  padding: 6px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.96);
  box-sizing: border-box;
}

.floating-links__qr-copy {
  text-align: center;
}

.floating-links__qr-copy strong {
  display: block;
  font-family: "Trebuchet MS", "Segoe UI", sans-serif;
  font-size: 0.84rem;
}

.easter-egg-popup {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  place-items: center;
  padding: 20px;
}

.easter-egg-popup__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background:
    radial-gradient(circle at top, rgba(255, 240, 197, 0.22), transparent 36%),
    rgba(9, 20, 35, 0.52);
  backdrop-filter: blur(10px);
}

.easter-egg-popup__card {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 16px;
  width: min(100%, 40vw);
  padding: 24px 24px 26px;
  border-radius: 16px;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.95),
      rgba(246, 251, 255, 0.9)
    ),
    rgba(255, 255, 255, 0.9);
  box-shadow:
    0 28px 60px rgba(10, 25, 41, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
  text-align: center;
}

.easter-egg-popup__close {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  color: #476779;
  font: inherit;
  font-size: 1rem;
  line-height: 1;
  border: 0;
  border-radius: 999px;
  background: rgba(229, 241, 248, 0.96);
  cursor: pointer;
  font-family: "Trebuchet MS", "Segoe UI", sans-serif;
}

.easter-egg-popup__close-icon {
  flex: 0 0 auto;
  font-size: 1.8rem;
}

.easter-egg-popup__eyebrow {
  margin: 0;
  color: rgba(71, 103, 121, 0.76);
  font-family: "Trebuchet MS", "Segoe UI", sans-serif;
  font-size: 0.74rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.easter-egg-popup__title {
  margin: 0;
  color: #173848;
  font-family: "Trebuchet MS", "Segoe UI", sans-serif;
  font-size: clamp(1.2rem, 1rem + 0.8vw, 1.65rem);
  line-height: 1.45;
}

.easter-egg-popup__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.easter-egg-popup__panel {
  display: grid;
  gap: 10px;
}

.easter-egg-popup__panel-title {
  margin: 0;
  color: #31566a;
  font-family: "Trebuchet MS", "Segoe UI", sans-serif;
  font-size: 0.92rem;
  font-weight: 700;
}

.easter-egg-popup__video-frame {
  overflow: hidden;
  border-radius: 8px;
  background: rgba(229, 241, 248, 0.92);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82);
}

.easter-egg-popup__video {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
}

.easter-egg-popup__ticket {
  display: block;
  width: 100%;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 18px 36px rgba(30, 66, 86, 0.18);
}

.mouse-pointer-trail {
  --pointer-scale: 0.76;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 4000;
  width: 56px;
  aspect-ratio: 468 / 408;
  pointer-events: none;
  transform-origin: 0 0;
  opacity: 0;
  transition: opacity 300ms ease-out;
  will-change: transform, width, opacity;
}

.mouse-pointer-trail.is-visible {
  opacity: 1;
}

.mouse-pointer-trail.is-hidden {
  opacity: 0;
  transition: none;
}

.mouse-pointer-trail__image {
  width: 100%;
  height: auto;
  display: block;
  transform-origin: 0 0;
  transform: scale(var(--pointer-scale));
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.2));
  transition:
    transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1),
    filter 320ms ease-out;
  will-change: transform, filter;
}

.mouse-pointer-trail.is-visible .mouse-pointer-trail__image {
  --pointer-scale: 1;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.28));
}

.mouse-pointer-trail.is-releasing {
  opacity: 1;
  transition: none;
}

.mouse-pointer-trail.is-releasing .mouse-pointer-trail__image {
  animation: mouse-pointer-release 560ms cubic-bezier(0.22, 0.9, 0.3, 1)
    forwards;
}

@keyframes mouse-pointer-release {
  0% {
    transform: scale(1);
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.28));
  }

  28% {
    transform: scale(2.5);
    filter: drop-shadow(0 16px 28px rgba(0, 0, 0, 0.22));
  }

  100% {
    transform: scale(0);
    filter: drop-shadow(0 0 0 rgba(0, 0, 0, 0));
  }
}

#ripples3 {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #c7e0ff;
}

#ripples3::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: var(--ripples-background-image);
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 100% auto;
  opacity: 0.96;
  pointer-events: none;
}

#ripples3.ripples-fallback {
  background-color: #c7e0ff;
}

#ripples3.ripples-fallback::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    linear-gradient(to bottom, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.38)),
    radial-gradient(
      circle at 50% 18%,
      rgba(255, 255, 255, 0.18),
      transparent 42%
    );
  pointer-events: none;
}

#ripples3.ripples-fallback canvas {
  display: none;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  touch-action: none;
  opacity: 0.99;
}

.err {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1000;
  width: 90%;
  max-width: 460px;
  box-sizing: border-box;
  transform: translate(-50%, -50%);
  padding: 1em 0.5em;
  color: #bababa;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.66);
}

.err div {
  color: #ff8400;
  font-size: 1.5em;
}

#fps {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 100;
  padding: 0.1em 0.2em 0;
  color: var(--col);
  font-size: 1.1em;
  pointer-events: none;
  opacity: 0.5;
  background: var(--back);
}

@media (max-width: 720px) {
  .floating-links {
    top: 14px;
    right: 14px;
    width: min(100% - 20px, 280px);
  }

  .floating-links__card {
    gap: 12px;
    padding: 16px;
    border-radius: 26px;
  }

  .floating-links__button {
    min-height: clamp(34px, 8vw, 38px);
  }

  .floating-links__qr {
    padding: 10px;
  }

  .floating-links__qr-image {
    width: min(100%, 96px);
  }

  .easter-egg-popup__card {
    width: min(100%, 420px);
    padding: 22px 18px 22px;
    border-radius: 24px;
  }

  .easter-egg-popup__content {
    grid-template-columns: minmax(0, 1fr);
  }

}

@media (max-width: 520px) {
  .floating-links {
    left: 12px;
    right: 12px;
    width: auto;
  }

  .floating-links__title {
    max-width: 15ch;
  }

  .floating-links__button {
    padding: 0 clamp(4px, 1.8vw, 7px);
  }

  .floating-links__content {
    grid-template-columns: 62% 38%;
    gap: 10px;
  }
}
`;
