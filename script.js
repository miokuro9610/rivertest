(function () {
  // PC header: transparent over the hero, solid #ACACAC once scrolled
  // past it (SP overrides the resulting class in CSS to stay always gray).
  var header = document.querySelector('.header');
  var hero = document.querySelector('.hero');
  if (!header || !hero) return;

  function updateHeaderScrollState() {
    var pastHero = hero.getBoundingClientRect().bottom <= 0;
    header.classList.toggle('is-scrolled', pastHero);
  }

  window.addEventListener('scroll', updateHeaderScrollState, { passive: true });
  updateHeaderScrollState();
})();

(function () {
  // Fade + slide-up reveal for .reveal elements the first time they
  // scroll into view (see style.css for what's deliberately excluded -
  // header, hero, buttons, footer, etc).
  //
  // .story__stage (PC's fixed+stacking scroll effect: background+title+
  // water-card pinned, "yamatowa x inquire" rising to cover them) is
  // explicitly excluded here too, defensively, at the selection step -
  // not just by omitting the .reveal class in the HTML - so this
  // observer can never add opacity/transform to anything inside it,
  // even if a future edit accidentally adds that class there. It
  // manages its own opacity/transform entirely through its own scroll-
  // linked positioning; layering this generic animation on top of that
  // would fight it. .story__mobile (SP's separate, non-stacking normal-
  // scroll version of the same content) has no such conflict and keeps
  // its reveal animation.
  var els = Array.prototype.slice.call(document.querySelectorAll('.reveal')).filter(function (el) {
    return !el.closest('.story__stage');
  });
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  els.forEach(function (el) { observer.observe(el); });
})();

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
  // "You can interact with this" hint: shown once automatically the
  // first time the gallery scrolls into view, then only on demand -
  // continuously while hovering on PC (handled entirely in CSS, see
  // .stool__image:hover), or as a brief flash on tap on SP (no hover
  // state to hold it open there).
  var image = document.querySelector('.stool__image');
  var arrow = document.querySelector('.stool__arrow');
  if (!image || !arrow) return;

  var hideTimer = null;

  function showArrow(autoHideDelay) {
    arrow.classList.add('is-visible');
    if (hideTimer) clearTimeout(hideTimer);
    if (autoHideDelay) {
      hideTimer = setTimeout(function () {
        arrow.classList.remove('is-visible');
      }, autoHideDelay);
    }
  }

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          showArrow(2500);
          revealObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });
    revealObserver.observe(image);
  } else {
    showArrow(2500);
  }

  image.addEventListener('click', function () {
    showArrow(1200);
  });
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

(function () {
  var track = document.getElementById('jointSteps');
  var prev = document.getElementById('jointPrev');
  var next = document.getElementById('jointNext');
  if (!track || !prev || !next) return;

  function step(direction) {
    var item = track.querySelector('.steps__item');
    if (!item) return;
    var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    var delta = (item.getBoundingClientRect().width + gap) * direction;
    track.scrollBy({ left: delta, behavior: 'smooth' });
  }

  prev.addEventListener('click', function () { step(-1); });
  next.addEventListener('click', function () { step(1); });
})();


