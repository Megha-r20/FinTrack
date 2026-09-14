export function triggerConfetti() {
  if (typeof window === "undefined") return;

  const count = 50;
  const colors = ["#810100", "#e11d48", "#f59e0b", "#10b981", "#3b82f6", "#a855f7"];

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "100vw";
  container.style.height = "100vh";
  container.style.pointerEvents = "none";
  container.style.zIndex = "9999";
  container.style.overflow = "hidden";
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const size = Math.random() * 8 + 6;
    const duration = Math.random() * 2 + 1.5;
    const delay = Math.random() * 0.3;

    particle.style.position = "absolute";
    particle.style.left = `${left}vw`;
    particle.style.top = `-20px`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size * (Math.random() > 0.5 ? 1 : 2)}px`;
    particle.style.backgroundColor = color;
    particle.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    particle.style.opacity = "0.9";
    particle.style.transform = `rotate(${Math.random() * 360}deg)`;
    particle.style.transition = `transform ${duration}s linear, top ${duration}s ease-in, opacity ${duration}s ease-out`;

    container.appendChild(particle);

    setTimeout(() => {
      particle.style.top = `${100 + Math.random() * 20}vh`;
      particle.style.transform = `rotate(${Math.random() * 720}deg) translate(${Math.random() * 100 - 50}px)`;
      particle.style.opacity = "0";
    }, delay * 1000);
  }

  setTimeout(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 4000);
}
