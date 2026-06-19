(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setMessage(box, message) {
        if (!box) {
            return;
        }
        box.hidden = !message;
        box.textContent = message || '';
    }

    function attachSource(player) {
        var video = player.querySelector('video');
        var source = player.dataset.src;
        var message = player.querySelector('.player-message');

        if (!video || !source) {
            setMessage(message, '当前播放源不可用');
            return Promise.resolve(false);
        }

        if (player.dataset.ready === 'true') {
            return Promise.resolve(true);
        }

        if (window.Hls && window.Hls.isSupported()) {
            return new Promise(function (resolve) {
                var resolved = false;
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                function finish(value) {
                    if (resolved) {
                        return;
                    }
                    resolved = true;
                    resolve(value);
                }

                player._hls = hls;
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    player.dataset.ready = 'true';
                    setMessage(message, '');
                    finish(true);
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setMessage(message, '网络加载异常，正在重新连接播放源');
                        hls.startLoad();
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setMessage(message, '媒体解码异常，正在尝试恢复');
                        hls.recoverMediaError();
                        return;
                    }
                    setMessage(message, '播放初始化失败，请刷新页面重试');
                    finish(false);
                });
            });
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            player.dataset.ready = 'true';
            return Promise.resolve(true);
        }

        setMessage(message, '当前浏览器不支持 HLS 播放');
        return Promise.resolve(false);
    }

    function setupPlayer(player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('.play-overlay');
        var message = player.querySelector('.player-message');

        if (!video || !overlay) {
            return;
        }

        function startPlayback() {
            setMessage(message, '正在加载播放源');
            attachSource(player).then(function (isReady) {
                if (!isReady) {
                    return;
                }
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        setMessage(message, '浏览器阻止了自动播放，请再次点击播放按钮');
                    });
                }
            });
        }

        overlay.addEventListener('click', startPlayback);
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
            setMessage(message, '');
        });
        video.addEventListener('pause', function () {
            player.classList.remove('is-playing');
        });
        video.addEventListener('error', function () {
            setMessage(message, '视频播放出错，请稍后再试');
        });
    }

    ready(function () {
        var players = document.querySelectorAll('[data-player]');
        players.forEach(setupPlayer);
    });
})();
