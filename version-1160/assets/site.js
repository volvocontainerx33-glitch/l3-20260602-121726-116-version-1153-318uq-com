(function () {
  var menuButton = document.querySelector(".menu-button");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll(".site-search").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      var target = "search.html";
      if (value) {
        target += "?q=" + encodeURIComponent(value);
      }
      window.location.href = target;
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === heroIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showHero(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var filterPanel = document.querySelector(".filter-panel");

  if (filterPanel) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q") || "";
    var input = filterPanel.querySelector(".filter-input");
    var region = filterPanel.querySelector(".filter-region");
    var year = filterPanel.querySelector(".filter-year");
    var type = filterPanel.querySelector(".filter-type");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".empty-result");

    if (input && queryValue) {
      input.value = queryValue;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      var text = normalize(input ? input.value : "");
      var regionValue = region ? region.value : "";
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var matchedText = !text || haystack.indexOf(text) !== -1;
        var matchedRegion = !regionValue || card.getAttribute("data-region") === regionValue;
        var matchedYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var matchedType = !typeValue || card.getAttribute("data-type") === typeValue;
        var matched = matchedText && matchedRegion && matchedYear && matchedType;
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, region, year, type].forEach(function (element) {
      if (element) {
        element.addEventListener("input", applyFilter);
        element.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  }

  window.mountMoviePlayer = function (video, playLayer, streamUrl) {
    if (!video || !playLayer || !streamUrl) {
      return;
    }

    var shell = video.closest(".player-shell");
    var mounted = false;
    var hlsInstance = null;

    function mountStream() {
      if (mounted) {
        return;
      }
      mounted = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startPlayback() {
      mountStream();
      if (shell) {
        shell.classList.add("is-playing");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    playLayer.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("is-playing");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
