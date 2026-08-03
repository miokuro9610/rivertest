(function () {
  var toggle = document.getElementById('menuToggle');
  var menu = document.getElementById('mobileMenu');
  var backdrop = document.getElementById('menuBackdrop');

  if (!toggle || !menu || !backdrop) return;

  function openMenu() {
    toggle.classList.add('is-open');
    menu.classList.add('is-open');
    backdrop.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    toggle.classList.remove('is-open');
    menu.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  }

  toggle.addEventListener('click', function () {
    if (menu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  backdrop.addEventListener('click', closeMenu);

  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) closeMenu();
  });
})();

(function () {
  var video = document.getElementById('heroVideo');
  if (!video) return;

  video.addEventListener('playing', function () {
    video.classList.add('is-ready');
  }, { once: true });
})();

(function () {
  var mainImage = document.getElementById('stoolMainImage');
  var mainImageWrap = document.querySelector('.stool__image');
  var dots = Array.prototype.slice.call(document.querySelectorAll('.stool__dot'));
  if (!mainImage || !dots.length) return;

  function activate(dot) {
    var src = dot.getAttribute('data-image');
    if (src) mainImage.src = src;

    dots.forEach(function (d) {
      d.classList.remove('is-active');
      d.setAttribute('aria-current', 'false');
    });
    dot.classList.add('is-active');
    dot.setAttribute('aria-current', 'true');
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      activate(dot);
    });
  });

  if (mainImageWrap) {
    mainImageWrap.addEventListener('click', function () {
      var activeIndex = dots.findIndex(function (d) {
        return d.classList.contains('is-active');
      });
      var nextIndex = (activeIndex + 1) % dots.length;
      activate(dots[nextIndex]);
    });
  }
})();

(function () {
  var container = document.getElementById('heroLogo');
  if (!container || typeof lottie === 'undefined' || !window.__HERO_LOGO_DATA) return;

  // logo_mov.json's layers all end (their "op") at frame 90, well before
  // the composition's own end at frame 120 - frames 90-120 render nothing
  // because every layer has already finished. Playing only the segment
  // that actually contains artwork avoids that blank tail entirely.
  var LAST_DRAWN_FRAME = 90;

  var anim = lottie.loadAnimation({
    container: container,
    renderer: 'svg',
    loop: false,
    autoplay: false,
    animationData: window.__HERO_LOGO_DATA
  });

  anim.addEventListener('DOMLoaded', function () {
    anim.playSegments([0, LAST_DRAWN_FRAME], true);
  });

  // Safety net: if it still reaches "complete" past the drawn range for
  // any reason, freeze it on the last frame that actually has artwork
  // instead of letting it render blank.
  anim.addEventListener('complete', function () {
    anim.goToAndStop(LAST_DRAWN_FRAME - 1, true);
  });
})();
