const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const preloader = document.getElementById("preloader");
window.addEventListener("load", () => {
  setTimeout(() => preloader.classList.add("hidden"), reduce ? 0 : 700);
});
setTimeout(() => preloader.classList.add("hidden"), 2200);

const phrases = ["Laravel APIs", "booking platforms", "REST services", "payment flows"];
const typed = document.getElementById("typed");
let phrase = 0;
let char = 0;
let deleting = false;
function typeLoop() {
  if (reduce) {
    typed.textContent = phrases[0];
    return;
  }
  const word = phrases[phrase];
  typed.textContent = word.slice(0, char);
  if (!deleting && char < word.length) {
    char += 1;
    setTimeout(typeLoop, 70);
  } else if (!deleting && char === word.length) {
    deleting = true;
    setTimeout(typeLoop, 1400);
  } else if (deleting && char > 0) {
    char -= 1;
    setTimeout(typeLoop, 36);
  } else {
    deleting = false;
    phrase = (phrase + 1) % phrases.length;
    setTimeout(typeLoop, 280);
  }
}
typeLoop();

const canvas = document.getElementById("particle-canvas");
if (!reduce && canvas) {
  const ctx = canvas.getContext("2d");
  let dots = [];
  function sizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.min(70, Math.floor(window.innerWidth / 24));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dots.forEach((dot, i) => {
      dot.x += dot.vx;
      dot.y += dot.vy;
      if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
      if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;
      ctx.fillStyle = "rgba(0,212,255,0.45)";
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
      ctx.fill();
      for (let j = i + 1; j < dots.length; j += 1) {
        const other = dots[j];
        const dx = dot.x - other.x;
        const dy = dot.y - other.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          ctx.strokeStyle = "rgba(168,85,247," + (1 - dist / 120) * 0.25 + ")";
          ctx.beginPath();
          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }
  sizeCanvas();
  draw();
  window.addEventListener("resize", sizeCanvas);
}

if (fine && !reduce) {
  document.body.classList.add("cursor-on");
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-outline");
  dot.hidden = false;
  ring.hidden = false;
  let x = 0;
  let y = 0;
  let rx = 0;
  let ry = 0;
  window.addEventListener("mousemove", (event) => {
    x = event.clientX;
    y = event.clientY;
    dot.style.left = x + "px";
    dot.style.top = y + "px";
  });
  (function follow() {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    requestAnimationFrame(follow);
  })();
  document.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("hot"));
    el.addEventListener("mouseleave", () => ring.classList.remove("hot"));
  });
}

const navbar = document.getElementById("navbar");
const toTop = document.getElementById("backToTop");
const links = [...document.querySelectorAll(".nav-link")];
const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

function onScroll() {
  navbar.classList.toggle("scrolled", window.scrollY > 12);
  toTop.classList.toggle("visible", window.scrollY > 500);
  const mark = window.scrollY + 140;
  let current = sections[0];
  sections.forEach((section) => {
    if (section.offsetTop <= mark) current = section;
  });
  links.forEach((link) => link.classList.toggle("active", current && link.getAttribute("href") === "#" + current.id));
}
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

const toggle = document.getElementById("navToggle");
const mobile = document.getElementById("mobileMenu");
function setMenu(open) {
  mobile.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.classList.toggle("menu-open", open);
}
toggle.addEventListener("click", () => setMenu(!mobile.classList.contains("open")));
mobile.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

function runCounters() {
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    if (reduce) {
      el.textContent = String(target);
      return;
    }
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / 900);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

function fillBars(root) {
  root.querySelectorAll(".skill-bar-fill").forEach((bar) => {
    bar.style.width = bar.dataset.width + "%";
  });
}

const revealNodes = document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right");
if ("IntersectionObserver" in window && !reduce) {
  let counted = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("revealed");
      if (entry.target.querySelector(".skill-bar-fill")) fillBars(entry.target);
      if (!counted && entry.target.closest("#home, body") && entry.target.classList.contains("hero-stats")) return;
      io.unobserve(entry.target);
    });
  }, { threshold: 0.18 });
  revealNodes.forEach((node) => io.observe(node));
  const stats = document.querySelector(".hero-stats");
  const statsIO = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      runCounters();
      statsIO.disconnect();
    }
  }, { threshold: 0.4 });
  statsIO.observe(stats);
  const skillsIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      fillBars(entry.target);
      skillsIO.disconnect();
    });
  }, { threshold: 0.25 });
  skillsIO.observe(document.getElementById("skills"));
} else {
  revealNodes.forEach((node) => node.classList.add("revealed"));
  runCounters();
  fillBars(document);
}
setTimeout(() => {
  revealNodes.forEach((node) => node.classList.add("revealed"));
  fillBars(document);
}, 1600);
