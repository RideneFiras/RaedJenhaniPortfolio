(function () {
  "use strict";

  function makeRevealsVisible() {
    try {
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
    } catch (e) {}
  }

  try {
    document.documentElement.classList.add("js");

    /* ---------- theme toggle ("calque clair / sombre") ---------- */
    var root = document.body;
    var toggle = document.getElementById("themeToggle");
    var themeIcon = document.getElementById("themeIcon");
    var themeIconUse = themeIcon && themeIcon.querySelector ? themeIcon.querySelector("use") : null;
    var STORAGE_KEY = "rj-theme";

    function applyTheme(theme) {
      if (root) root.setAttribute("data-theme", theme);
      if (themeIconUse) themeIconUse.setAttribute("href", theme === "dark" ? "#ic-moon" : "#ic-sun");
      if (toggle) toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }

    function initTheme() {
      var stored = null;
      try { stored = window.localStorage.getItem(STORAGE_KEY); } catch (e) { stored = null; }
      if (stored === "light" || stored === "dark") { applyTheme(stored); return; }
      var prefersDark = false;
      try { prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) {}
      applyTheme(prefersDark ? "dark" : "light");
    }

    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = (root && root.getAttribute("data-theme") === "dark") ? "light" : "dark";
        applyTheme(next);
        try { window.localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
      });
    }

    initTheme();

    /* ---------- mobile nav ---------- */
    var navToggle = document.getElementById("navToggle");
    var navLinks = document.getElementById("navLinks");

    if (navToggle && navLinks) {
      navToggle.addEventListener("click", function () {
        var open = navLinks.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      });

      navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          navLinks.classList.remove("is-open");
          navToggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    /* ---------- scroll-spy active section ---------- */
    var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id], header + .hero[id]"));
    var navAnchors = (navLinks) ? navLinks.querySelectorAll("a") : [];

    if (typeof IntersectionObserver !== "undefined" && sections.length) {
      var spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              navAnchors.forEach(function (a) {
                a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
              });
            }
          });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );
      sections.forEach(function (s) { spy.observe(s); });
    }

    /* ---------- reveal on scroll (safe fallback) ---------- */
    var revealEls = document.querySelectorAll(".reveal");
    if (typeof IntersectionObserver !== "undefined" && revealEls.length) {
      var reveal = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      revealEls.forEach(function (el) { reveal.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }

    /* ---------- timeline: default-scroll to the present end on narrow screens ---------- */
    document.querySelectorAll(".timeline-card").forEach(function (card) {
      try { card.scrollLeft = card.scrollWidth; } catch (e) {}
    });

  } catch (err) {
    makeRevealsVisible();
    console.error(err);
  }
})();
