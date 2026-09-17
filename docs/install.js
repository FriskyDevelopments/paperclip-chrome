/* FR!sky Paperclip — installer ceremony.
   Vanilla only. No libraries, no tracking. */

// When the Chrome Web Store listing is live, paste the URL here and the
// ACT 01 button links straight to it. Empty = scroll to sideload instructions.
const CWS_URL = "";

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Scroll progress ---------- */
const progress = document.getElementById("progress");
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  progress.style.transform = `scaleX(${ratio})`;
}
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

/* ---------- Browser detection (ACT 01) ---------- */
// Chrome-family UAs all carry "Chrome" (Brave and Arc included), Edge adds
// "Edg", Opera adds "OPR". Firefox and Safari never contain "Chrome".
const ua = navigator.userAgent;
const isChromium = /Chrome|Chromium|Edg|OPR\//.test(ua) && !/Firefox/.test(ua);

const cwsBtn = document.getElementById("cws-btn");
const noteText = document.getElementById("browser-note-text");
const note = document.getElementById("browser-note");
const sideload = document.getElementById("sideload");

if (CWS_URL) {
  cwsBtn.href = CWS_URL;
  cwsBtn.target = "_blank";
  cwsBtn.rel = "noopener";
}

if (isChromium) {
  noteText.textContent = CWS_URL
    ? "Chromium detected — Chrome, Edge, Brave and Arc all work."
    : "Chromium detected — sideload below takes 60 seconds while review finishes.";
} else {
  note.classList.add("warn");
  noteText.textContent = "Open this page in Chrome — Clip lives there.";
}

// With no store URL, the button opens the sideload <details> and scrolls to it.
if (!CWS_URL) {
  cwsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    sideload.open = true;
    sideload.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "center" });
  });
}

/* ---------- Scroll reveals ---------- */
const revealEls = document.querySelectorAll(".reveal");
if (REDUCED || !("IntersectionObserver" in window)) {
  revealEls.forEach((el) => el.classList.add("in"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
}

/* ---------- Hero heading text-scramble ---------- */
const GLYPHS = "!<>-_\\/[]{}—=+*^?#";
function scramble(el) {
  const target = el.dataset.final;
  const len = target.length;
  let frame = 0;
  const total = 26 + len * 3;
  function tick() {
    let out = "";
    for (let i = 0; i < len; i++) {
      const revealAt = 10 + i * 4;
      out += frame >= revealAt ? target[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    frame++;
    if (frame < total) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}
document.querySelectorAll("[data-scramble]").forEach((el, i) => {
  el.dataset.final = el.textContent;
  if (REDUCED) return;
  setTimeout(() => scramble(el), 250 + i * 220);
});

/* ---------- Magnetic CTAs ---------- */
if (!REDUCED && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    const strength = 0.28;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
      el.style.transform = "";
      setTimeout(() => (el.style.transition = ""), 360);
    });
  });
}

/* ---------- ACT 02 copy button ---------- */
const BREW_CMD = "brew install FriskyDevelopments/paperclip/frisky-paperclip";
const copyBtn = document.getElementById("copy-btn");
const brewBlock = document.getElementById("brew-block");

function burst(x, y) {
  if (REDUCED) return;
  const colors = ["#b8ff3c", "#ffd100", "#00e5ff", "#f7f5f2"];
  for (let i = 0; i < 14; i++) {
    const p = document.createElement("span");
    p.className = "burst";
    p.style.background = colors[i % colors.length];
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    document.body.appendChild(p);
    const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
    const dist = 42 + Math.random() * 46;
    const anim = p.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        {
          transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 18}px) scale(0)`,
          opacity: 0,
        },
      ],
      { duration: 520 + Math.random() * 260, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
    );
    anim.onfinish = () => p.remove();
  }
}

async function copyBrew() {
  let ok = false;
  try {
    await navigator.clipboard.writeText(BREW_CMD);
    ok = true;
  } catch {
    // Fallback for non-secure contexts (plain http://localhost)
    const ta = document.createElement("textarea");
    ta.value = BREW_CMD;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    ta.remove();
  }
  if (!ok) {
    copyBtn.textContent = "Select ↑";
    return;
  }
  const r = copyBtn.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2);
  copyBtn.classList.add("done");
  copyBtn.textContent = "Copied";
  brewBlock.classList.add("copied");
  setTimeout(() => {
    copyBtn.classList.remove("done");
    copyBtn.textContent = "Copy";
    brewBlock.classList.remove("copied");
  }, 1800);
}
copyBtn.addEventListener("click", copyBrew);

/* ---------- Hero particle field (canvas) ---------- */
const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");
const hero = document.querySelector(".hero");
let particles = [];
let rafId = null;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

function sizeCanvas() {
  const r = hero.getBoundingClientRect();
  canvas.width = r.width * dpr;
  canvas.height = r.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function seedParticles() {
  const r = hero.getBoundingClientRect();
  const count = Math.min(90, Math.floor((r.width * r.height) / 16000));
  const palette = ["#ffd100", "#b8ff3c", "#00e5ff", "#4b4059", "#b9b0c9"];
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * r.width,
    y: Math.random() * r.height,
    r: 0.6 + Math.random() * 1.8,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    a: 0.12 + Math.random() * 0.4,
    c: palette[(Math.random() * palette.length) | 0],
  }));
}

function drawFrame() {
  const r = hero.getBoundingClientRect();
  ctx.clearRect(0, 0, r.width, r.height);
  for (const p of particles) {
    ctx.globalAlpha = p.a;
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function stepField() {
  const r = hero.getBoundingClientRect();
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < -4) p.x = r.width + 4;
    if (p.x > r.width + 4) p.x = -4;
    if (p.y < -4) p.y = r.height + 4;
    if (p.y > r.height + 4) p.y = -4;
  }
  drawFrame();
  rafId = requestAnimationFrame(stepField);
}

function startField() {
  if (REDUCED || rafId !== null) return;
  rafId = requestAnimationFrame(stepField);
}

function stopField() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function initField() {
  sizeCanvas();
  seedParticles();
  drawFrame(); // static frame even when reduced-motion or paused
  startField();
}

window.addEventListener("resize", () => {
  stopField();
  initField();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopField();
  else startField();
});

initField();
