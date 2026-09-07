document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

document.addEventListener("DOMContentLoaded", function () {

  // ── Header scroll state ──
  const header = document.querySelector(".js-header");
  const scrollThreshold = 80;

  function updateHeader() {
    if (!header) return;
    if (window.scrollY > scrollThreshold) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  // ── Hero load sequence ──
  // Staggered reveal based on data-delay
  const heroItems = document.querySelectorAll(".animate-in");
  heroItems.forEach(function (el) {
    var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
    setTimeout(function () {
      el.classList.add("revealed");
    }, 300 + delay);
  });

  // ── Scroll-triggered reveals ──
  var learnItems = document.querySelectorAll(".learn-item");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    learnItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    learnItems.forEach(function (item) {
      item.classList.add("visible");
    });
  }

  // ── Chapter cards expand / collapse ──
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var chapterDetails = document.querySelectorAll(".module-card details");

  function openChapter(details) {
    details.open = true;
    if (reduceMotion) {
      details.classList.add("is-expanded");
      return;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        details.classList.add("is-expanded");
      });
    });
  }

  function closeChapter(details) {
    var panel = details.querySelector(".module-card-panel");
    details.classList.remove("is-expanded");

    if (reduceMotion || !panel) {
      details.open = false;
      return;
    }

    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      panel.removeEventListener("transitionend", onEnd);
      if (!details.classList.contains("is-expanded")) {
        details.open = false;
      }
    }

    function onEnd(event) {
      if (event.target !== panel || event.propertyName !== "grid-template-rows") return;
      finish();
    }

    panel.addEventListener("transitionend", onEnd);
    window.setTimeout(finish, 400);
  }

  chapterDetails.forEach(function (details) {
    var summary = details.querySelector("summary");
    if (!summary) return;

    summary.addEventListener("click", function (event) {
      event.preventDefault();
      if (details.classList.contains("is-expanded")) {
        closeChapter(details);
      } else {
        openChapter(details);
      }
    });
  });
});
