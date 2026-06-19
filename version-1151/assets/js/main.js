document.addEventListener('DOMContentLoaded', function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

  if (slides.length > 1) {
    var current = 0;
    var activate = function (index) {
      slides[current].classList.remove('is-active');
      if (dots[current]) {
        dots[current].classList.remove('is-active');
      }
      current = index;
      slides[current].classList.add('is-active');
      if (dots[current]) {
        dots[current].classList.add('is-active');
      }
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
      });
    });

    setInterval(function () {
      activate((current + 1) % slides.length);
    }, 5600);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var status = document.querySelector('[data-filter-status]');

  if (searchInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      searchInput.value = q;
    }

    var applyFilter = function () {
      var keyword = searchInput.value.trim().toLowerCase();
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.year || '',
          card.dataset.genre || '',
          card.dataset.tags || ''
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchRegion = !region || card.dataset.region === region;
        var matchYear = !year || card.dataset.year === year;
        var matched = matchKeyword && matchRegion && matchYear;
        card.classList.toggle('hidden-card', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = '当前展示 ' + visible + ' 部影片';
      }
    };

    searchInput.addEventListener('input', applyFilter);
    if (regionSelect) {
      regionSelect.addEventListener('change', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
    applyFilter();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-play-button]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var player = button.closest('[data-stream]');
      if (!player) {
        return;
      }

      var video = player.querySelector('video');
      var statusNode = player.querySelector('[data-player-status]');
      var stream = player.getAttribute('data-stream');

      if (!video || !stream) {
        return;
      }

      player.classList.add('is-playing');
      if (statusNode) {
        statusNode.textContent = '正在加载片源';
      }

      var startPlay = function () {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            if (statusNode) {
              statusNode.textContent = '点击视频画面继续播放';
            }
          });
        }
      };

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', startPlay, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, startPlay);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal && statusNode) {
            statusNode.textContent = '片源暂时无法播放';
          }
        });
        return;
      }

      video.src = stream;
      video.addEventListener('loadedmetadata', startPlay, { once: true });
      video.load();
    });
  });
});
