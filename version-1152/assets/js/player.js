(function () {
    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-player-video");
        var button = document.getElementById("movie-player-button");
        var mounted = false;
        var hlsInstance = null;

        if (!video || !button || !streamUrl) {
            return;
        }

        function mount() {
            if (mounted) {
                return;
            }
            mounted = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function start() {
            mount();
            button.classList.add("is-hidden");
            var playAction = video.play();
            if (playAction && typeof playAction.catch === "function") {
                playAction.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
