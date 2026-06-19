document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var index = 0;

  function showSlide(next) {
    if (!slides.length) {
      return;
    }

    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === index);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var input = document.querySelector('[data-search-input]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  function applyFilters() {
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var type = typeFilter ? typeFilter.value : '';

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchesType = !type || card.getAttribute('data-type') === type;
      card.classList.toggle('hidden-card', !(matchesKeyword && matchesType));
    });
  }

  if (input) {
    input.addEventListener('input', applyFilters);
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', applyFilters);
  }
});
