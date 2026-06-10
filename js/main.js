/* PERIGEE — motion system
   Lenis smooth scroll + GSAP ScrollTrigger.
   Everything degrades: no JS or reduced motion → static, fully readable page. */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof gsap !== "undefined";

  if (!hasGsap || reduced) {
    var veil = document.querySelector(".veil");
    if (veil) veil.style.display = "none";
    return;
  }

  document.documentElement.classList.add("js");
  gsap.registerPlugin(ScrollTrigger);

  /* ── smooth scroll ─────────────────────── */
  var lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add("lenis");

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var target = document.querySelector(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { duration: 1.6, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
      });
    });
  }

  /* ── split headlines into masked lines ─── */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines.map(function (line) {
      return '<span class="split-line"><span>' + line.trim() + "</span></span>";
    }).join("");
  });

  function splitTargets(el) { return el.querySelectorAll(".split-line > span"); }

  /* ── intro: veil + hero timeline ───────── */
  var intro = gsap.timeline({ defaults: { ease: "power4.out" } });
  intro
    .to(".veil-mark", { opacity: 0, letterSpacing: "1em", duration: 0.9, ease: "power2.in", delay: 0.45 })
    .to(".veil", { yPercent: -100, duration: 1.1, ease: "power4.inOut" }, "-=0.25")
    .set(".veil", { display: "none" })
    .from(".hero-moon", { y: 140, scale: 0.92, opacity: 0, duration: 2.2, ease: "power3.out" }, "-=1.0")
    .from(splitTargets(document.querySelector(".hero-title")), {
      yPercent: 110, duration: 1.4, stagger: 0.12, ease: "power4.out"
    }, "-=1.7")
    .to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.9, startAt: { y: 14 } }, "-=1.1")
    .to(".hero-foot",    { opacity: 1, y: 0, duration: 0.9, startAt: { y: 18 } }, "-=0.8")
    .from(".nav", { yPercent: -120, duration: 1, ease: "power3.out" }, "-=0.9");

  /* hero parallax: moon drifts up slower than scroll, sky fades */
  gsap.to(".hero-moon", {
    yPercent: -28, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  gsap.to(".hero-copy", {
    yPercent: 12, opacity: 0.25, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 30%", scrub: true }
  });

  /* ── generic reveals ───────────────────── */
  gsap.utils.toArray("[data-reveal]").forEach(function (el) {
    if (el.closest(".hero")) { return; } // hero handled by intro timeline
    gsap.fromTo(el,
      { opacity: 0, y: 28 },
      {
        opacity: 1, y: 0, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
  });

  /* split headlines outside hero reveal on scroll */
  gsap.utils.toArray("[data-split]").forEach(function (el) {
    if (el.closest(".hero")) return;
    gsap.from(splitTargets(el), {
      yPercent: 115, duration: 1.2, stagger: 0.1, ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 86%" }
    });
  });

  /* ── 02 manifesto: word-by-word scrub ──── */
  var manifesto = document.querySelector("[data-scrub-words]");
  if (manifesto) {
    var nodes = Array.prototype.slice.call(manifesto.childNodes);
    manifesto.innerHTML = nodes.map(function (n) {
      if (n.nodeType === 3) {
        return n.textContent.split(/\s+/).filter(Boolean).map(function (w) {
          return '<span class="w">' + w + "</span>";
        }).join(" ");
      }
      return n.outerHTML ? '<span class="w">' + n.outerHTML + "</span>" : "";
    }).join(" ");
    gsap.to(manifesto.querySelectorAll(".w"), {
      opacity: 1, stagger: 0.06, ease: "none",
      scrollTrigger: { trigger: ".manifesto", start: "top 72%", end: "center 45%", scrub: 0.6 }
    });
  }

  /* ── 03 instrument: inner image parallax ─ */
  gsap.utils.toArray("[data-parallax-img]").forEach(function (img) {
    gsap.fromTo(img, { yPercent: -8, scale: 1.16 }, {
      yPercent: 8, scale: 1.16, ease: "none",
      scrollTrigger: { trigger: img.closest("figure"), start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  /* ── 04 bento: clip reveal stagger ─────── */
  ScrollTrigger.batch("[data-bento]", {
    start: "top 86%",
    onEnter: function (batch) {
      gsap.fromTo(batch,
        { opacity: 0, clipPath: "inset(0 0 100% 0)" },
        { opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 1.2, stagger: 0.14, ease: "power4.inOut" });
    },
    once: true
  });

  /* ── 05 field: background settle + zoom ── */
  var fieldImg = document.querySelector("[data-field-img]");
  if (fieldImg) {
    gsap.fromTo(fieldImg, { scale: 1.18, yPercent: -6 }, {
      scale: 1.02, yPercent: 0, ease: "none",
      scrollTrigger: { trigger: ".field", start: "top bottom", end: "bottom top", scrub: true }
    });
  }

  /* ── 06 voices: paper sheet settles in ─── */
  var paper = document.querySelector("[data-paper]");
  if (paper) {
    gsap.fromTo(paper,
      { y: 110, rotation: 1.4, opacity: 0 },
      {
        y: 0, rotation: 0, opacity: 1, duration: 1.5, ease: "power3.out",
        scrollTrigger: { trigger: ".voices", start: "top 75%" }
      });
  }

  /* ── 07 editions: card stagger ─────────── */
  ScrollTrigger.batch("[data-card]", {
    start: "top 88%",
    onEnter: function (batch) {
      gsap.fromTo(batch,
        { opacity: 0, y: 70 },
        { opacity: 1, y: 0, duration: 1.1, stagger: 0.15, ease: "power3.out" });
    },
    once: true
  });

  /* ── 08 close: crescent float ──────────── */
  gsap.to("[data-float]", {
    y: -18, duration: 3.6, ease: "sine.inOut", yoyo: true, repeat: -1
  });
  gsap.from("[data-float]", {
    opacity: 0, scale: 0.85, duration: 1.6, ease: "power3.out",
    scrollTrigger: { trigger: ".close", start: "top 70%" }
  });

  /* ── simple parallax helpers ───────────── */
  gsap.utils.toArray("[data-parallax]").forEach(function (el) {
    var amount = parseFloat(el.getAttribute("data-parallax")) || -10;
    gsap.to(el, {
      yPercent: amount, ease: "none",
      scrollTrigger: { trigger: el.closest("section"), start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  /* ── nav hide / show ───────────────────── */
  var nav = document.querySelector("[data-nav]");
  var lastY = 0;
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: function (self) {
      var y = self.scroll();
      nav.classList.toggle("is-hidden", y > 140 && y > lastY);
      nav.classList.toggle("is-solid", y > 60);
      lastY = y;
    }
  });

  /* ── custom cursor + magnetic links ────── */
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine) {
    var cursor = document.querySelector(".cursor");
    var dot = cursor.querySelector(".cursor-dot");
    var ring = cursor.querySelector(".cursor-ring");
    var dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power2.out" });
    var dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power2.out" });
    var ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    var ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
    window.addEventListener("mousemove", function (e) {
      dotX(e.clientX); dotY(e.clientY); ringX(e.clientX); ringY(e.clientY);
    });
    document.querySelectorAll("a, button").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cursor.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { cursor.classList.remove("is-hover"); });
    });

    document.querySelectorAll("[data-magnet]").forEach(function (el) {
      var mx = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
      var my = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.22);
        my((e.clientY - (r.top + r.height / 2)) * 0.22);
      });
      el.addEventListener("mouseleave", function () { mx(0); my(0); });
    });
  }
})();
