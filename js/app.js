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

  // ── Hero / CTA grid cell hover ──
  // Each cell lights up independently when the pointer enters it
  function resolveGridCellSize(grid) {
    var width = grid.clientWidth;
    return Math.min(80, Math.max(40, width / 6));
  }

  function initGridHover(grid) {
    var section = grid.parentElement;
    if (!section) return;

    var wrap = document.createElement("div");
    wrap.className = "hero-grid__cells";
    grid.appendChild(wrap);

    var cols = 0;
    var rows = 0;
    var cellSize = 0;
    var lit = null;

    function buildCells() {
      cellSize = resolveGridCellSize(grid);
      var nextCols = Math.max(1, Math.ceil(grid.clientWidth / cellSize));
      var nextRows = Math.max(1, Math.ceil(grid.clientHeight / cellSize));
      if (nextCols === cols && nextRows === rows) return;

      cols = nextCols;
      rows = nextRows;
      lit = null;
      wrap.style.gridTemplateColumns = "repeat(" + cols + ", " + cellSize + "px)";
      wrap.style.gridTemplateRows = "repeat(" + rows + ", " + cellSize + "px)";
      wrap.replaceChildren();

      var fragment = document.createDocumentFragment();
      var total = cols * rows;
      for (var i = 0; i < total; i++) {
        var cell = document.createElement("div");
        cell.className = "hero-grid__cell";
        fragment.appendChild(cell);
      }
      wrap.appendChild(fragment);
    }

    function cellAt(x, y) {
      if (x < 0 || y < 0 || x >= cols * cellSize || y >= rows * cellSize) return null;
      var col = Math.min(cols - 1, Math.floor(x / cellSize));
      var row = Math.min(rows - 1, Math.floor(y / cellSize));
      return wrap.children[row * cols + col] || null;
    }

    function onMove(event) {
      var rect = grid.getBoundingClientRect();
      var next = cellAt(event.clientX - rect.left, event.clientY - rect.top);
      if (next === lit) return;
      if (lit) lit.classList.remove("is-lit");
      lit = next;
      if (lit) lit.classList.add("is-lit");
    }

    function onLeave() {
      if (lit) lit.classList.remove("is-lit");
      lit = null;
    }

    buildCells();
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(buildCells).observe(grid);
    } else {
      window.addEventListener("resize", buildCells);
    }

    section.addEventListener("mousemove", onMove, { passive: true });
    section.addEventListener("mouseleave", onLeave);
  }

  document.querySelectorAll(".hero-grid").forEach(initGridHover);

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
  var slideInItems = document.querySelectorAll(".animation-slide-in");

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
    slideInItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    slideInItems.forEach(function (item) {
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
