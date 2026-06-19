(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      const isOpen = mobilePanel.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
    const prev = carousel.querySelector(".hero-prev");
    const next = carousel.querySelector(".hero-next");
    let current = 0;
    let timer = null;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    };

    const start = function () {
      stop();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    const stop = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    showSlide(0);
    start();
  }

  const searchInputs = Array.from(document.querySelectorAll(".movie-search"));
  const filterButtonsWrap = document.querySelector("[data-filter-buttons]");
  const filterButtons = filterButtonsWrap ? Array.from(filterButtonsWrap.querySelectorAll("button")) : [];
  let activeYear = "";

  const filterCards = function () {
    const query = searchInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).find(Boolean) || "";
    const cards = Array.from(document.querySelectorAll(".movie-card, .rank-item"));

    cards.forEach(function (card) {
      const text = [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-type"),
        card.textContent
      ].join(" ").toLowerCase();
      const year = card.getAttribute("data-year") || "";
      const matchesQuery = !query || text.indexOf(query) !== -1;
      const matchesYear = !activeYear || year === activeYear;
      card.classList.toggle("is-hidden", !(matchesQuery && matchesYear));
    });
  };

  searchInputs.forEach(function (input) {
    input.addEventListener("input", filterCards);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeYear = button.getAttribute("data-filter-value") || "";
      filterButtons.forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      filterCards();
    });
  });
})();

function initVideoPlayer(videoId, overlayId, sourceUrl) {
  const video = document.getElementById(videoId);
  const overlay = document.getElementById(overlayId);

  if (!video || !overlay || !sourceUrl) {
    return;
  }

  let prepared = false;

  const prepare = function () {
    if (prepared) {
      return;
    }
    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        maxBufferLength: 45,
        backBufferLength: 30
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  };

  const play = function () {
    prepare();
    overlay.classList.add("hidden");
    const promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        overlay.classList.remove("hidden");
      });
    }
  };

  overlay.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", function () {
    overlay.classList.add("hidden");
  });
}
