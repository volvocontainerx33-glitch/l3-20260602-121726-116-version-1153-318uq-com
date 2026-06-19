(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-mobile-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var topButton = document.querySelector("[data-back-to-top]");
    if (topButton) {
      window.addEventListener("scroll", function () {
        topButton.classList.toggle("visible", window.scrollY > 600);
      });
      topButton.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.style.display = "none";
        var frame = image.closest(".poster-frame, .hero-poster, .detail-poster");
        if (frame) {
          frame.classList.add("poster-empty");
        }
      });
    });

    initHero();
    initFilters();
  });

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));

    if (slides.length <= 1) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = parseInt(dot.getAttribute("data-hero-dot"), 10) || 0;
        show(next);
        restart();
      });
    });

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    restart();
  }

  function initFilters() {
    var filterRoot = document.querySelector("[data-filter-root]");
    if (!filterRoot) {
      return;
    }

    var input = filterRoot.querySelector("[data-filter-input]");
    var yearSelect = filterRoot.querySelector("[data-filter-year]");
    var categorySelect = filterRoot.querySelector("[data-filter-category]");
    var resetButton = filterRoot.querySelector("[data-filter-reset]");
    var countLine = filterRoot.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var emptyResult = document.querySelector("[data-empty-result]");

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && input) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : "");
      var year = yearSelect ? yearSelect.value : "";
      var category = categorySelect ? categorySelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-category"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();

        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute("data-year") === year;
        var matchCategory = !category || card.getAttribute("data-category") === category;
        var show = matchKeyword && matchYear && matchCategory;

        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (countLine) {
        countLine.textContent = "当前显示 " + visible + " 部影片，共 " + cards.length + " 部";
      }

      if (emptyResult) {
        emptyResult.classList.toggle("visible", visible === 0);
      }
    }

    [input, yearSelect, categorySelect].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", applyFilter);
      control.addEventListener("change", applyFilter);
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (yearSelect) {
          yearSelect.value = "";
        }
        if (categorySelect) {
          categorySelect.value = "";
        }
        applyFilter();
      });
    }

    applyFilter();
  }
})();
