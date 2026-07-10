(function () {
  function initMobileStickyNav() {
    var nav = document.querySelector("[data-mobile-sticky-nav]");
    if (!nav) return;

    var showAfter = Number(nav.getAttribute("data-show-after")) || 96;
    var rafId = null;

    function getScrollTop() {
      return window.scrollY || document.documentElement.scrollTop || 0;
    }

    function updateNav() {
      rafId = null;
      nav.classList.toggle("is-visible", getScrollTop() > showAfter);
    }

    function requestUpdate() {
      if (rafId !== null) return;
      if (window.requestAnimationFrame) {
        rafId = window.requestAnimationFrame(updateNav);
        return;
      }
      rafId = window.setTimeout(updateNav, 16);
    }

    updateNav();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  }

  document.addEventListener("DOMContentLoaded", initMobileStickyNav);
})();
