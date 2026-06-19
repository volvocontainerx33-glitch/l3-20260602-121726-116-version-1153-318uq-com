(function() {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs(".menu-button");
  var mobilePanel = qs(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function() {
      mobilePanel.classList.toggle("open");
    });
  }

  var backTop = qs(".back-top");

  if (backTop) {
    window.addEventListener("scroll", function() {
      if (window.scrollY > 420) {
        backTop.classList.add("show");
      } else {
        backTop.classList.remove("show");
      }
    });

    backTop.addEventListener("click", function() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var slides = qsa(".hero-slide");
  var dots = qsa(".hero-dot");
  var activeSlide = 0;

  function setHeroSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === activeSlide);
    });

    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === activeSlide);
    });
  }

  dots.forEach(function(dot, dotIndex) {
    dot.addEventListener("click", function() {
      setHeroSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function() {
      setHeroSlide(activeSlide + 1);
    }, 5600);
  }

  var filterPanel = qs(".filter-panel");
  var searchInput = qs("[data-filter-search]");
  var yearSelect = qs("[data-filter-year]");
  var regionSelect = qs("[data-filter-region]");
  var categorySelect = qs("[data-filter-category]");
  var cards = qsa(".movie-card");
  var noResult = qs(".no-result");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilters() {
    if (!filterPanel || !cards.length) {
      return;
    }

    var keyword = normalize(searchInput && searchInput.value);
    var year = normalize(yearSelect && yearSelect.value);
    var region = normalize(regionSelect && regionSelect.value);
    var category = normalize(categorySelect && categorySelect.value);
    var shown = 0;

    cards.forEach(function(card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-category"),
        card.getAttribute("data-tags")
      ].join(" "));
      var cardYear = normalize(card.getAttribute("data-year"));
      var cardRegion = normalize(card.getAttribute("data-region"));
      var cardCategory = normalize(card.getAttribute("data-category"));

      var matched = (!keyword || haystack.indexOf(keyword) !== -1) &&
        (!year || cardYear === year) &&
        (!region || cardRegion === region) &&
        (!category || cardCategory === category);

      card.classList.toggle("hidden-card", !matched);

      if (matched) {
        shown += 1;
      }
    });

    if (noResult) {
      noResult.style.display = shown ? "none" : "block";
    }
  }

  if (filterPanel) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && searchInput) {
      searchInput.value = query;
    }

    [searchInput, yearSelect, regionSelect, categorySelect].forEach(function(control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }

  qsa(".player-shell").forEach(function(player) {
    var video = qs("video", player);
    var overlay = qs(".player-overlay", player);
    var sourceUrl = player.getAttribute("data-video-url");
    var hlsInstance = null;
    var prepared = false;

    if (!video || !overlay || !sourceUrl) {
      return;
    }

    function prepareVideo() {
      if (prepared) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }

      prepared = true;
    }

    function startVideo() {
      prepareVideo();
      overlay.classList.add("is-hidden");
      video.controls = true;

      var playTask = video.play();

      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function() {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", startVideo);

    video.addEventListener("click", function() {
      if (!prepared || video.paused) {
        startVideo();
      }
    });

    video.addEventListener("play", function() {
      overlay.classList.add("is-hidden");
    });

    window.addEventListener("pagehide", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
