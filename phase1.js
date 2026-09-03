/* phase1.js — Phase 1 enhancements (Stats Counter, Mobile Menu, Parallax).
 *
 * Progressive-enhancement contract:
 *   - Stats section displays the final number inline (data-counter attribute
 *     is the source of truth). This JS only animates the COUNT-UP, never the
 *     final value. If JS fails, users still see real numbers.
 *   - Mobile menu uses <button aria-expanded> + classList. No layout shift
 *     without JS: nav is visible at desktop, hidden at mobile, button is
 *     hidden at desktop.
 *   - Parallax uses rAF + pageYOffset, throttled to scroll. Honors
 *     prefers-reduced-motion (skips transform).
 */
(function () {
  "use strict";

  /* =========================
     COUNTER ANIMATION
  ========================= */
  function initCounters() {
    const counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;

    if (!("IntersectionObserver" in window)) return;

    const animate = (el) => {
      const target = parseInt(el.dataset.counter, 10) || 0;
      const suffix = el.dataset.suffix || "";
      const duration = 1400;
      const start = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 3);

      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const v = Math.floor(ease(p) * target);
        el.textContent = v + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((c) => io.observe(c));
  }

  /* =========================
     MOBILE MENU
  ========================= */
  function initMobileMenu() {
    const btn = document.getElementById("menuToggle");
    const navUl = document.querySelector("nav ul");
    if (!btn || !navUl) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const close = () => {
      navUl.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    };

    const toggle = () => {
      const isOpen = navUl.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("menu-open", isOpen);
    };

    btn.addEventListener("click", toggle);
    navUl.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
    if (!reduced) return;
    btn.addEventListener("click", () => {
      navUl.style.transition = "none";
      requestAnimationFrame(() => (navUl.style.transition = ""));
    });
  }

  /* =========================
     PARALLAX ORBS
  ========================= */
  function initParallax() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const hero = document.querySelector(".hero");
    if (!hero) return;

    const before = window.getComputedStyle(hero, "::before");
    if (!before) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.pageYOffset;
        const heroH = hero.offsetHeight;
        if (y > heroH * 1.2) {
          ticking = false;
          return;
        }
        hero.style.setProperty("--parallax-y", y * 0.15 + "px");
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* =========================
     BOOT
  ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    initCounters();
    initMobileMenu();
    initParallax();
  });
})();
