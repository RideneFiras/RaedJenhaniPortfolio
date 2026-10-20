(function () {
  "use strict";

  try {
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

    /* ---------- career line: recompute bars, durations and totals from today's date ---------- */
    document.querySelectorAll("[data-career]").forEach(function (career) {
      try {
        var now = new Date();
        var nowM = now.getFullYear() * 12 + now.getMonth() + (now.getDate() - 1) / 31;

        function toM(s) { var p = s.split("-"); return (+p[0]) * 12 + (+p[1] - 1); }
        function endM(el) { return el.getAttribute("data-end") ? toM(el.getAttribute("data-end")) : nowM; }
        function pct(m) { return ((m - startM) / (nowM - startM) * 100).toFixed(2) + "%"; }
        function duration(months) {
          var m = Math.round(months), y = Math.floor(m / 12), r = m % 12, out = [];
          if (m < 1) return "< 1 mois";
          if (y) out.push(y + (y > 1 ? " ans" : " an"));
          if (r) out.push(r + " mois");
          return out.join(" ");
        }

        var startM = Infinity;
        career.querySelectorAll(".seg").forEach(function (s) { startM = Math.min(startM, toM(s.getAttribute("data-start"))); });

        career.querySelectorAll(".seg").forEach(function (s) {
          var a = toM(s.getAttribute("data-start"));
          s.style.left = pct(a);
          s.style.width = ((endM(s) - a) / (nowM - startM) * 100).toFixed(2) + "%";
        });

        var years = career.querySelector(".career-years");
        var firstYear = Math.ceil(startM / 12), lastYear = Math.floor(nowM / 12);
        years.querySelectorAll("[data-year]").forEach(function (y) { y.parentNode.removeChild(y); });
        for (var yr = firstYear; yr <= lastYear; yr++) {
          if ((nowM - yr * 12) < 4) continue; // too close to "auj." to fit a label
          var tick = document.createElement("span");
          tick.setAttribute("data-year", yr);
          tick.style.left = pct(yr * 12);
          tick.textContent = yr;
          years.insertBefore(tick, years.firstChild);
        }

        career.querySelectorAll(".step").forEach(function (step) {
          var dur = step.querySelector(".step-dur");
          if (dur && step.getAttribute("data-end")) dur.textContent = duration(endM(step) - toM(step.getAttribute("data-start")));
        });

        var total = career.querySelector("[data-career-years]");
        if (total) total.textContent = Math.floor((nowM - startM) / 12) + "+";
      } catch (e) {}
    });

  } catch (err) {
    console.error(err);
  }
})();
