(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === current);
                });
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });

            if (slides.length > 1) {
                setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
        });

        document.querySelectorAll("[data-filter-input]").forEach(function (input) {
            var targetSelector = input.getAttribute("data-filter-target");
            var target = targetSelector ? document.querySelector(targetSelector) : null;
            if (!target) {
                return;
            }
            var empty = document.querySelector("[data-empty-state]");
            var cards = Array.prototype.slice.call(target.querySelectorAll("[data-card]"));

            input.addEventListener("input", function () {
                var keyword = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                    var matched = !keyword || text.indexOf(keyword) !== -1;
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            });
        });
    });
})();
