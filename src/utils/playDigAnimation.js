const dirtParticles = [
  { x: -30, y: -18, color: "#8a6036", delay: 0 },
  { x: -20, y: -30, color: "#c79555", delay: 18 },
  { x: -8, y: -38, color: "#6f4b2b", delay: 30 },
  { x: 9, y: -34, color: "#d2aa6d", delay: 12 },
  { x: 23, y: -25, color: "#95683c", delay: 28 },
  { x: 33, y: -13, color: "#bd8a4d", delay: 42 },
  { x: -36, y: -7, color: "#d2aa6d", delay: 38 },
  { x: 38, y: -3, color: "#6f4b2b", delay: 50 },
];

function createDirtBurst(clientX, clientY) {
  const burst = document.createElement("span");
  burst.className = "cursor-dirt-burst";
  burst.style.left = `${clientX - 4}px`;
  burst.style.top = `${clientY + 4}px`;

  const mound = document.createElement("span");
  mound.className = "cursor-dirt-mound";
  burst.append(mound);

  dirtParticles.forEach((particle, index) => {
    const pixel = document.createElement("span");
    pixel.className = `cursor-dirt-pixel cursor-dirt-pixel--${(index % 3) + 1}`;
    pixel.style.setProperty("--dirt-x", `${particle.x}px`);
    pixel.style.setProperty("--dirt-y", `${particle.y}px`);
    pixel.style.setProperty("--dirt-color", particle.color);
    pixel.style.setProperty("--dirt-delay", `${particle.delay}ms`);
    burst.append(pixel);
  });

  document.body.append(burst);
  window.setTimeout(() => burst.remove(), 420);
}

export default function playDigAnimation(cursor, event) {
  if (!cursor) return;

  const shovel = cursor.querySelector("img");
  shovel.getAnimations().forEach((animation) => animation.cancel());
  shovel.animate(
    [
      { transform: "translate(0, 0) rotate(0deg)" },
      { transform: "translate(-9px, 14px) rotate(-12deg)", offset: 0.42 },
      { transform: "translate(-9px, 14px) rotate(-12deg)", offset: 0.58 },
      { transform: "translate(2px, -3px) rotate(3deg)", offset: 0.8 },
      { transform: "translate(0, 0) rotate(0deg)" },
    ],
    { duration: 280, easing: "steps(4, end)" },
  );

  createDirtBurst(event.clientX, event.clientY);
}
