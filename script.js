(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".nav-menu");
  var yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 48);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
      document.body.style.overflow = !open ? "hidden" : "";
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  document.querySelector(".contact-form")?.addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Gracias por tu mensaje. Conecta este formulario a tu email o backend cuando lo tengas listo.");
  });

  var floatBtn = document.querySelector(".whatsapp-float");
  var hero = document.querySelector(".hero");
  if (floatBtn && hero) {
    function setWhatsappFloatVisible(show) {
      floatBtn.classList.toggle("is-visible", show);
      if (show) {
        floatBtn.removeAttribute("aria-hidden");
        floatBtn.removeAttribute("tabindex");
      } else {
        floatBtn.setAttribute("aria-hidden", "true");
        floatBtn.setAttribute("tabindex", "-1");
      }
    }

    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            setWhatsappFloatVisible(!entry.isIntersecting);
          });
        },
        { threshold: 0, rootMargin: "0px" }
      );
      obs.observe(hero);
    } else {
      setWhatsappFloatVisible(true);
    }
  }

  function initTestimonialsSplide() {
    var el = document.getElementById("testimonials-splide");
    if (!el || typeof Splide === "undefined") return;

    var slideCount = el.querySelectorAll(".splide__slide").length;
    if (slideCount === 0) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var perPage = 2;
    var multi = slideCount > perPage;

    new Splide(el, {
      type: multi ? "loop" : "slide",
      perPage: perPage,
      perMove: 1,
      gap: "2rem",
      pagination: multi,
      arrows: multi,
      drag: multi,
      keyboard: multi,
      speed: reduceMotion ? 0 : 450,
      easing: "cubic-bezier(0.33, 1, 0.68, 1)",
      i18n: {
        prev: "Opinión anterior",
        next: "Siguiente opinión",
        first: "Primera opinión",
        last: "Última opinión",
        slideX: "Ir a la opinión %s",
        pageX: "Ir a la página %s",
        play: "Reproducir",
        pause: "Pausar",
      },
      breakpoints: {
        480: {
          gap: "1.35rem",
        },
      },
    }).mount();
  }

  initTestimonialsSplide();
})();
