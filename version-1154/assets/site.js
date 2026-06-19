(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var previous = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === activeIndex);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }

        carousel.addEventListener('mouseenter', stopTimer);
        carousel.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupFilters() {
        var toolbar = document.querySelector('[data-filter-toolbar]');
        var list = document.querySelector('[data-movie-list]');
        if (!toolbar || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var count = document.querySelector('[data-filter-count]');
        var inputs = Array.prototype.slice.call(toolbar.querySelectorAll('[data-filter]'));
        var reset = toolbar.querySelector('[data-filter-reset]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery) {
            var queryInput = toolbar.querySelector('[data-filter="query"]');
            if (queryInput) {
                queryInput.value = initialQuery;
            }
        }

        function matches(card, filters) {
            var haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags
            ].join(' '));

            if (filters.query && haystack.indexOf(filters.query) === -1) {
                return false;
            }
            if (filters.type && normalize(card.dataset.type).indexOf(filters.type) === -1) {
                return false;
            }
            if (filters.year && normalize(card.dataset.year).indexOf(filters.year) === -1) {
                return false;
            }
            if (filters.category && normalize(card.dataset.category) !== filters.category) {
                return false;
            }
            return true;
        }

        function applyFilters() {
            var filters = {};
            inputs.forEach(function (input) {
                filters[input.dataset.filter] = normalize(input.value);
            });

            var visible = 0;
            cards.forEach(function (card) {
                var isVisible = matches(card, filters);
                card.classList.toggle('is-hidden', !isVisible);
                if (isVisible) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部影片';
            }
        }

        inputs.forEach(function (input) {
            input.addEventListener('input', applyFilters);
            input.addEventListener('change', applyFilters);
        });

        if (reset) {
            reset.addEventListener('click', function () {
                inputs.forEach(function (input) {
                    input.value = '';
                });
                applyFilters();
            });
        }

        applyFilters();
    }

    ready(function () {
        setupMobileNavigation();
        setupHeroCarousel();
        setupFilters();
    });
})();
