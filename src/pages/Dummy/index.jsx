import { useEffect, useRef, useState } from "react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { MdMovieFilter } from "react-icons/md";

const ripplesContent = {
  backgroundImage: "pool-background.png",
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
  playerOverlayImage.src = "/assets/player.png";
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

export default function DummyPage() {
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
      <audio ref={audioRef} src="/assets/player.mp3" preload="auto" />
    </div>
  );
}
