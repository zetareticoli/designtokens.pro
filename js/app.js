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
});
