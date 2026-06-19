document.addEventListener('DOMContentLoaded', function () {
  var root = document.querySelector('[data-player]');

  if (!root) {
    return;
  }

  var video = root.querySelector('video');
  var overlay = root.querySelector('.play-overlay');
  var button = root.querySelector('.play-button');
  var status = root.querySelector('.player-status');
  var url = window.__videoUrl || '';
  var hls = null;
  var ready = false;

  function setStatus(text) {
    if (status) {
      status.textContent = text || '';
    }
  }

  function prepare() {
    if (ready || !url || !video) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function () {
        setStatus('播放未成功加载，请刷新重试');
      });
      ready = true;
      return;
    }

    video.src = url;
    ready = true;
  }

  function start() {
    prepare();

    if (!video) {
      return;
    }

    if (overlay) {
      overlay.hidden = true;
    }

    setStatus('正在加载');
    video.play().then(function () {
      setStatus('');
    }).catch(function () {
      setStatus('点击画面继续播放');

      if (overlay) {
        overlay.hidden = false;
      }
    });
  }

  if (button) {
    button.addEventListener('click', start);
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.hidden = true;
      }
      setStatus('');
    });

    video.addEventListener('pause', function () {
      if (overlay) {
        overlay.hidden = false;
      }
    });
  }
});
