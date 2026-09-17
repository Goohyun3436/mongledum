import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";
import { PiDiscFill } from "react-icons/pi";
import { getContentUrl, parseContentFile } from "../../utils/contentFiles";

function createBubbleEnvironment() {
  const palettes = [
    ["#f8fbff", "#8ec2de", "#ffd9ec"],
    ["#f7fbff", "#a8d7e8", "#fff0ba"],
    ["#ffffff", "#b8d8f1", "#e7c8ff"],
    ["#eef9ff", "#79aecf", "#ffd8e1"],
    ["#ffffff", "#c8e9ef", "#f6c8e6"],
    ["#f4f9ff", "#91bad8", "#fff0cf"],
  ];

  const faces = palettes.map(([top, bottom, glow], faceIndex) => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    const sky = context.createLinearGradient(0, 0, 256, 256);
    sky.addColorStop(0, top);
    sky.addColorStop(0.58, bottom);
    sky.addColorStop(1, "#edf6fb");
    context.fillStyle = sky;
    context.fillRect(0, 0, 256, 256);

    const light = context.createRadialGradient(72 + faceIndex * 13, 56, 2, 72 + faceIndex * 13, 56, 76);
    light.addColorStop(0, "rgba(255,255,255,1)");
    light.addColorStop(0.2, glow);
    light.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = light;
    context.fillRect(0, 0, 256, 256);
    return canvas;
  });

  const texture = new THREE.CubeTexture(faces);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function SoapBubbleMesh() {
  const meshRef = useRef(null);
  const materialRef = useRef(null);
  const environment = useMemo(createBubbleEnvironment, []);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    tCube: { value: environment },
    mRefractionRatio: { value: 0.985 },
    mFresnelBias: { value: 0.04 },
    mFresnelScale: { value: 1.12 },
    mFresnelPower: { value: 2.15 },
  }), [environment]);

  useEffect(() => () => environment.dispose(), [environment]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();
    if (materialRef.current) materialRef.current.uniforms.uTime.value = time;
    meshRef.current.rotation.x = Math.sin(time * 0.38) * 0.065;
    meshRef.current.rotation.y = time * 0.09 + Math.sin(time * 0.27) * 0.035;
    meshRef.current.rotation.z = Math.sin(time * 0.61) * 0.018;
    const squash = Math.sin(time * 0.82) * 0.014 + Math.sin(time * 0.39) * 0.007;
    meshRef.current.scale.set(
      1 + squash,
      1 - squash * 0.72,
      1 + Math.sin(time * 0.67) * 0.008,
    );
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.53, 96, 96]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          uniform float mRefractionRatio;
          uniform float mFresnelBias;
          uniform float mFresnelScale;
          uniform float mFresnelPower;
          varying vec3 vReflect;
          varying vec3 vRefract[3];
          varying float vReflectionFactor;

          vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
          vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
          float snoise(vec3 v) {
            const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod(i, 289.0);
            vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            float n_ = 1.0 / 7.0;
            vec3 ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ * ns.x + ns.yyyy;
            vec4 y = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            vec4 s0 = floor(b0) * 2.0 + 1.0;
            vec4 s1 = floor(b1) * 2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m *= m;
            return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
          }

          float liquidDisplacement(vec3 sphereDirection) {
            vec3 flow = vec3(uTime * 0.19, -uTime * 0.145, uTime * 0.11);
            float largeWave = snoise(sphereDirection * 1.35 + flow);
            float foldingWave = snoise(sphereDirection * 2.7 - flow.yzx * 1.18 + largeWave * 0.28);
            float skinWave = snoise(sphereDirection * 5.1 + flow.zxy * 0.72);
            return largeWave * 0.047 + foldingWave * 0.017 + skinWave * 0.0045;
          }

          vec3 deformSphere(vec3 spherePosition) {
            vec3 sphereDirection = normalize(spherePosition);
            return spherePosition + sphereDirection * liquidDisplacement(sphereDirection);
          }

          void main() {
            vec3 sphereDirection = normalize(position);
            vec3 helperAxis = abs(sphereDirection.y) < 0.92 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
            vec3 tangent = normalize(cross(helperAxis, sphereDirection));
            vec3 bitangent = normalize(cross(sphereDirection, tangent));
            float normalStep = 0.018;

            vec3 displaced = deformSphere(position);
            vec3 tangentPoint = deformSphere(normalize(position + tangent * normalStep) * length(position));
            vec3 bitangentPoint = deformSphere(normalize(position + bitangent * normalStep) * length(position));
            vec3 displacedNormal = normalize(cross(tangentPoint - displaced, bitangentPoint - displaced));
            vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
            vec3 worldNormal = normalize(mat3(modelMatrix) * displacedNormal);
            vec3 incident = normalize(worldPosition.xyz - cameraPosition);
            vReflect = reflect(incident, worldNormal);
            vRefract[0] = refract(incident, worldNormal, mRefractionRatio);
            vRefract[1] = refract(incident, worldNormal, mRefractionRatio * 0.99);
            vRefract[2] = refract(incident, worldNormal, mRefractionRatio * 0.98);
            vReflectionFactor = mFresnelBias + mFresnelScale * pow(1.0 + dot(incident, worldNormal), mFresnelPower);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
          }
        `}
        fragmentShader={`
          uniform samplerCube tCube;
          varying vec3 vReflect;
          varying vec3 vRefract[3];
          varying float vReflectionFactor;

          void main() {
            vec4 reflected = textureCube(tCube, vec3(-vReflect.x, vReflect.yz));
            vec4 refracted = vec4(1.0);
            refracted.r = textureCube(tCube, vec3(-vRefract[0].x, vRefract[0].yz)).r;
            refracted.g = textureCube(tCube, vec3(-vRefract[1].x, vRefract[1].yz)).g;
            refracted.b = textureCube(tCube, vec3(-vRefract[2].x, vRefract[2].yz)).b;
            float fresnel = clamp(vReflectionFactor, 0.0, 1.0);
            vec3 environmentColor = mix(refracted.rgb, reflected.rgb, fresnel);
            vec3 rimTint = mix(vec3(0.38, 0.72, 0.88), vec3(0.93, 0.55, 0.78), smoothstep(0.38, 0.92, fresnel));
            vec3 color = mix(environmentColor, rimTint, smoothstep(0.18, 0.95, fresnel) * 0.48);
            float alpha = mix(0.075, 0.76, smoothstep(0.06, 0.9, fresnel));
            gl_FragColor = vec4(color, alpha);
          }
        `}
        transparent
        blending={THREE.NormalBlending}
        side={THREE.FrontSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function MetaballBubbleMesh({ interactionRef }) {
  const physicsRef = useRef(null);
  const environment = useMemo(createBubbleEnvironment, []);
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      tCube: { value: environment },
    },
    vertexShader: `
      varying vec3 vWorldNormal;
      varying vec3 vViewDirection;
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vViewDirection = normalize(cameraPosition - worldPosition.xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform samplerCube tCube;
      varying vec3 vWorldNormal;
      varying vec3 vViewDirection;
      varying vec3 vWorldPosition;
      void main() {
        vec3 normalDirection = normalize(vWorldNormal);
        vec3 viewDirection = normalize(vViewDirection);
        float fresnel = pow(1.0 - max(dot(normalDirection, viewDirection), 0.0), 2.45);
        vec3 reflectedDirection = reflect(-viewDirection, normalDirection);
        vec3 environmentColor = textureCube(tCube, reflectedDirection).rgb;
        float colorShift = smoothstep(0.08, 0.95, fresnel);
        vec3 rimColor = mix(vec3(0.34, 0.82, 0.94), vec3(0.96, 0.48, 0.78), colorShift);
        vec3 color = mix(environmentColor, rimColor, 0.38 + colorShift * 0.42);
        float highlight = pow(max(dot(normalDirection, normalize(vec3(-0.4, 0.7, 0.58))), 0.0), 76.0);
        color += vec3(1.0) * highlight;
        float alpha = 0.035 + fresnel * 0.54 + highlight * 0.32;
        gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.72));
      }
    `,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
    blending: THREE.NormalBlending,
    toneMapped: false,
  }), [environment]);
  const metaballs = useMemo(() => {
    const surface = new MarchingCubes(56, material, false, false, 55000);
    surface.isolation = 34;
    surface.scale.setScalar(3);
    surface.frustumCulled = false;
    return surface;
  }, [material]);

  useEffect(() => () => {
    metaballs.geometry.dispose();
    material.dispose();
    environment.dispose();
  }, [environment, material, metaballs]);

  useEffect(() => {
    let cancelled = false;

    RAPIER.init().then(() => {
      if (cancelled) return;
      const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
      const bodies = Array.from({ length: 20 }, (_, index) => {
        const angle = (index / 20) * Math.PI * 2;
        const radius = 0.35 + (index % 5) * 0.14;
        const rigidBody = world.createRigidBody(
          RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(Math.cos(angle) * radius, Math.sin(angle) * radius, ((index % 3) - 1) * 0.12)
            .setLinearDamping(2),
        );
        world.createCollider(RAPIER.ColliderDesc.ball(0.2).setDensity(0.5).setRestitution(0.72), rigidBody);
        return rigidBody;
      });
      const mouseBody = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(20, 20, 0));
      world.createCollider(RAPIER.ColliderDesc.ball(0.5).setRestitution(1.1), mouseBody);
      physicsRef.current = { world, bodies, mouseBody };
    });

    return () => {
      cancelled = true;
      physicsRef.current?.world.free();
      physicsRef.current = null;
    };
  }, []);

  useFrame(() => {
    const target = interactionRef.current;
    const physics = physicsRef.current;
    if (!physics) return;

    const mouseX = target.active ? (target.x - 0.5) * 8 : 20;
    const mouseY = target.active ? (target.y - 0.5) * 8 : 20;
    physics.mouseBody.setNextKinematicTranslation({ x: mouseX, y: mouseY, z: 0 });
    physics.bodies.forEach((body) => {
      body.resetForces(true);
      const position = body.translation();
      body.addForce({ x: -position.x * 0.72, y: -position.y * 0.72, z: -position.z * 0.72 }, true);
    });
    physics.world.step();

    metaballs.reset();
    physics.bodies.forEach((body) => {
      const position = body.translation();
      metaballs.addBall(position.x * 0.1 + 0.5, position.y * 0.1 + 0.5, position.z * 0.1 + 0.5, 0.5, 10);
    });
    metaballs.update();
  });

  return <primitive object={metaballs} />;
}

function BubbleCamera({ hostRef }) {
  useFrame(({ camera, size }) => {
    const hostHeight = hostRef.current?.offsetHeight || 500;
    const hostWidth = hostRef.current?.offsetWidth || 500;
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const bubbleDiameter = isMobile
      ? Math.min(hostWidth, hostHeight)
      : Math.min(Math.max(hostWidth * 0.38, 320), 560, Math.max(hostHeight - 120, 1));
    const nextZ = 3.55 * (size.height / bubbleDiameter);
    if (Math.abs(camera.position.z - nextZ) < 0.001) return;
    camera.position.z = nextZ;
    camera.updateProjectionMatrix();
  });
  return null;
}

function SoapBubbleCanvas({ interactionRef, hostRef }) {
  return (
    <span className="objects-bubble__webgl" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 5.7], fov: 50 }} dpr={[1, 1.75]} gl={{ alpha: true, antialias: true, premultipliedAlpha: true }}>
        <BubbleCamera hostRef={hostRef} />
        <ambientLight intensity={1.1} />
        <directionalLight position={[-3, 4, 5]} intensity={2.2} />
        <directionalLight position={[4, -1, 3]} intensity={0.75} color="#b8eaff" />
        <MetaballBubbleMesh interactionRef={interactionRef} />
      </Canvas>
    </span>
  );
}

function navigate(href) {
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}

function getObjectAsset(item, ...segments) {
  return getContentUrl(...item.path, ...segments);
}

function getObjectRoute(item) {
  return `/objects/${item.id.split("/").map(encodeURIComponent).join("/")}`;
}

function getAlbumRoute(item) {
  return `/objects/${item.album.split("/").map(encodeURIComponent).join("/")}`;
}

export default function ObjectsPage() {
  const [objects, setObjects] = useState([]);
  const [isPopping, setIsPopping] = useState(false);
  const [status, setStatus] = useState("loading");
  const timerRef = useRef(null);
  const bubbleButtonRef = useRef(null);
  const bubbleInteractionRef = useRef({ x: 0.5, y: 0.5, active: false, impulse: 0, velocityX: 0, velocityY: 0 });
  const pointerMotionRef = useRef({ x: 0.5, y: 0.5, time: 0 });
  const lastBurstRef = useRef(0);
  const agitationTimerRef = useRef(null);
  const routePath = decodeURIComponent(window.location.pathname.replace(/^\/objects\/?/, ""));

  useEffect(() => {
    const controller = new AbortController();

    fetch("/docs/files.json", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("사물 목록을 불러오지 못했습니다.");
        const manifest = await response.json();
        return Promise.all((manifest.objects ?? []).filter((item) => item.objectFile).map(async (item) => {
          const response = await fetch(getObjectAsset(item, item.objectFile), { signal: controller.signal });
          if (!response.ok) throw new Error("사물 정보를 불러오지 못했습니다.");
          const info = parseContentFile(await response.text());
          return {
            ...item,
            ...info,
            coverUrl: item.cover ? getObjectAsset(item, item.cover) : "",
            galleryUrls: item.gallery.map((image) => getObjectAsset(item, "images", image)),
          };
        }));
      })
      .then((loadedObjects) => {
        const visibleObjects = loadedObjects.filter((item) => item.status !== "0");
        setObjects(visibleObjects);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setStatus("error");
      });

    return () => controller.abort();
  }, []);

  useEffect(() => () => {
    window.clearTimeout(timerRef.current);
    window.clearTimeout(agitationTimerRef.current);
  }, []);

  const detailObject = objects.find((item) => item.id === routePath);
  const albumObjects = objects.filter((item) => item.album === routePath);
  const isAlbum = albumObjects.length > 0;
  const isDetail = Boolean(detailObject);
  const hasUnknownRoute = Boolean(routePath) && !isAlbum && !isDetail;
  const visibleObjects = isAlbum ? albumObjects : objects;
  const albumTitle = albumObjects[0]?.albumTitle ?? objects[0]?.albumTitle ?? "";

  const openBubble = () => {
    if (isPopping) return;
    setIsPopping(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setIsPopping(false);
      if (objects[0]) navigate(getAlbumRoute(objects[0]));
    }, 240);
  };

  const closeObjects = () => {
    setIsPopping(false);
    navigate("/objects");
  };

  const moveBubble = (event) => {
    const bubbleElement = event.currentTarget;
    const bounds = bubbleElement.getBoundingClientRect();
    const normalizedX = THREE.MathUtils.clamp((event.clientX - bounds.left) / bounds.width, 0.12, 0.88);
    const normalizedY = THREE.MathUtils.clamp(1 - ((event.clientY - bounds.top) / bounds.height), 0.12, 0.88);
    const now = performance.now();
    const elapsed = Math.max(now - pointerMotionRef.current.time, 8);
    const velocityX = (normalizedX - pointerMotionRef.current.x) * (16.67 / elapsed);
    const velocityY = (normalizedY - pointerMotionRef.current.y) * (16.67 / elapsed);
    const speed = Math.min(Math.hypot(velocityX, velocityY) * 7.5, 1);
    pointerMotionRef.current = { x: normalizedX, y: normalizedY, time: now };
    bubbleInteractionRef.current.x = normalizedX;
    bubbleInteractionRef.current.y = normalizedY;
    bubbleInteractionRef.current.velocityX = velocityX;
    bubbleInteractionRef.current.velocityY = velocityY;
    bubbleInteractionRef.current.impulse = Math.max(bubbleInteractionRef.current.impulse, speed);
    bubbleInteractionRef.current.active = true;
    bubbleInteractionRef.current.bubbleElement = bubbleElement;
    bubbleElement.style.setProperty("--object-push-x", `${velocityX * 95}px`);
    bubbleElement.style.setProperty("--object-push-y", `${-velocityY * 80}px`);
    bubbleElement.style.setProperty("--burst-direction-x", `${velocityX * 135}px`);
    bubbleElement.style.setProperty("--burst-direction-y", `${-velocityY * 120}px`);

    if (speed > 0.12 && now - lastBurstRef.current > 150) {
      lastBurstRef.current = now;
      bubbleElement.classList.remove("is-agitated");
      void bubbleElement.offsetWidth;
      bubbleElement.classList.add("is-agitated");
      window.clearTimeout(agitationTimerRef.current);
      agitationTimerRef.current = window.setTimeout(() => bubbleElement.classList.remove("is-agitated"), 620);
    }
  };

  const leaveBubble = (event) => {
    bubbleInteractionRef.current.active = false;
    bubbleInteractionRef.current.velocityX = 0;
    bubbleInteractionRef.current.velocityY = 0;
    event.currentTarget.style.setProperty("--object-push-x", "0px");
    event.currentTarget.style.setProperty("--object-push-y", "0px");
  };

  if (status === "loading") return <main className="objects-page"><p className="objects-page__status">사물을 띄우는 중...</p></main>;
  if (status === "error" || objects.length === 0) return <main className="objects-page"><p className="objects-page__status">사물을 불러오지 못했습니다.</p></main>;

  if (hasUnknownRoute) return <main className="object-detail"><button className="object-detail__back" type="button" onClick={() => navigate("/objects")}>← objects</button><p>사물을 찾지 못했습니다.</p></main>;

  if (isDetail) {
    return (
      <main className="object-detail">
        <button className="object-detail__back" type="button" onClick={() => navigate(getAlbumRoute(detailObject))}>← {detailObject.albumTitle}</button>
        <header className="object-detail__hero">
          <div className="object-detail__cover">{detailObject.coverUrl && <img src={detailObject.coverUrl} alt={`${detailObject.title} 대표 이미지`} />}</div>
          <div className="object-detail__summary">
            <p>{detailObject.index}</p>
            <h1>{detailObject.title}</h1>
            {detailObject.albumTitle && <span className="object-detail__album"><PiDiscFill aria-hidden="true" />{detailObject.albumTitle}</span>}
            <div className="object-detail__description">{detailObject.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>)}</div>
            {detailObject.link && <a href={detailObject.link} target="_blank" rel="noreferrer">외부 사이트에서 보기 ↗</a>}
          </div>
        </header>

        {detailObject.galleryUrls.length > 0 && <section className="object-detail__life" aria-label={`${detailObject.title} 상세 이미지`}>
          <div className="object-detail__gallery">{detailObject.galleryUrls.map((image, index) => <figure key={image}><img src={image} alt={`${detailObject.title} 사용 모습 ${index + 1}`} /></figure>)}</div>
        </section>}
      </main>
    );
  }

  return (
    <main className={`objects-page${isAlbum ? "" : " objects-page--landing"}`}>
      <section className="objects-playground" aria-label="오브젝트 비눗방울">
        {isAlbum && <button className="objects-playground__back" type="button" aria-label="뒤로가기" onClick={closeObjects}>← <span>뒤로가기</span></button>}
        {albumTitle && <p className={`objects-playground__hint is-album-title${isAlbum ? "" : " is-bubble-title"}`}>{albumTitle}</p>}
        {!isAlbum ? (
          <button ref={bubbleButtonRef} className={`objects-bubble objects-bubble--collection${isPopping ? " is-popping" : ""}`} type="button" aria-label="비눗방울 터뜨리기" onClick={openBubble} onPointerMove={moveBubble} onPointerLeave={leaveBubble}>
            <SoapBubbleCanvas interactionRef={bubbleInteractionRef} hostRef={bubbleButtonRef} />
            <span className="objects-bubble__shine" aria-hidden="true" />
            <span className="objects-bubble__pop-pixels" aria-hidden="true">{Array.from({ length: 10 }, (_, pixel) => <i key={pixel} />)}</span>
            <span
              className="objects-bubble__products"
              style={{ "--objects-grid-columns": Math.ceil(Math.sqrt(objects.length)) }}
            >
              {visibleObjects.map((item) => item.coverUrl && <img src={item.coverUrl} alt="" draggable="false" key={item.id} />)}
            </span>
          </button>
        ) : (
          <div
            className="objects-revealed-list"
            style={{ "--objects-count": visibleObjects.length }}
          >
            {visibleObjects.map((item) => <button type="button" key={item.id} onClick={() => navigate(getObjectRoute(item))}><span>{item.index}</span><div>{item.coverUrl && <img src={item.coverUrl} alt="" />}</div><h2>{item.title}</h2><p>{item.body}</p></button>)}
          </div>
        )}
      </section>
    </main>
  );
}
