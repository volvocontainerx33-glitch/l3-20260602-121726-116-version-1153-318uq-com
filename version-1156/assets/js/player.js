import { H as Hls } from "./hls-vendor-dru42stk.js";

document.addEventListener("click", function (event) {
  var button = event.target.closest("[data-play-button]");

  if (!button) {
    return;
  }

  var player = button.closest("[data-player]");
  if (!player) {
    return;
  }

  var video = player.querySelector("video");
  var cover = player.querySelector("[data-player-cover]");
  var source = player.getAttribute("data-m3u8");

  if (!video || !source) {
    button.textContent = "暂无播放源";
    return;
  }

  button.disabled = true;
  button.textContent = "正在加载...";

  function startPlayback() {
    if (cover) {
      cover.classList.add("hidden");
    }

    video.controls = true;
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        button.disabled = false;
        button.textContent = "点击播放";
        if (cover) {
          cover.classList.remove("hidden");
        }
      });
    }
  }

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, startPlayback);
    hls.on(Hls.Events.ERROR, function (_, data) {
      if (data && data.fatal) {
        button.disabled = false;
        button.textContent = "重新播放";
      }
    });
    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    video.addEventListener("loadedmetadata", startPlayback, { once: true });
    return;
  }

  button.disabled = false;
  button.textContent = "浏览器不支持播放";
});
