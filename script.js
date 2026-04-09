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

  (function initContactForm() {
    var form = document.querySelector(".contact-form");
    if (!form) return;
    var statusEl = document.getElementById("contact-form-status");
    var submitBtn = document.getElementById("contact-form-submit");

    function setStatus(kind, text) {
      if (!statusEl) return;
      if (!text) {
        statusEl.hidden = true;
        statusEl.textContent = "";
        statusEl.className = "contact-form-status";
        return;
      }
      statusEl.hidden = false;
      statusEl.textContent = text;
      statusEl.className = "contact-form-status contact-form-status--" + kind;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var payload = {
        nombre: String(fd.get("nombre") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        mensaje: String(fd.get("mensaje") || "").trim(),
      };
      setStatus("", "");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute("aria-busy", "true");
        var prevLabel = submitBtn.textContent;
        submitBtn.textContent = "Enviando…";
      }
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().then(function (body) {
            return { ok: res.ok, status: res.status, body: body };
          });
        })
        .then(function (r) {
          if (r.ok) {
            setStatus(
              "success",
              "Gracias. Hemos recibido tu consulta y te responderemos pronto."
            );
            form.reset();
          } else {
            var hint =
              r.status === 400
                ? "Revisa nombre, email y mensaje."
                : "No se pudo enviar. Inténtalo de nuevo en unos minutos.";
            var extra = r.body && r.body.error ? " (" + r.body.error + ")" : "";
            setStatus("error", hint + extra);
          }
        })
        .catch(function () {
          setStatus("error", "No se pudo enviar. Comprueba tu conexión e inténtalo de nuevo.");
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.removeAttribute("aria-busy");
            submitBtn.textContent = "Enviar consulta";
          }
        });
    });
  })();

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
    var multi = slideCount > 1;

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
        900: {
          perPage: 1,
          gap: "1.5rem",
        },
        480: {
          gap: "1.35rem",
        },
      },
    }).mount();
  }

  var locationSection = document.getElementById("ubicacion");
  if (locationSection && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var locTicking = false;
    function updateLocationParallax() {
      var rect = locationSection.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      if (rect.bottom < 0 || rect.top > vh) {
        locationSection.style.setProperty("--location-parallax-y", "0px");
        locTicking = false;
        return;
      }
      var centerY = rect.top + rect.height * 0.35;
      var py = (centerY - vh * 0.5) * -0.45;
      locationSection.style.setProperty("--location-parallax-y", Math.round(py * 10) / 10 + "px");
      locTicking = false;
    }
    function onLocScroll() {
      if (!locTicking) {
        locTicking = true;
        requestAnimationFrame(updateLocationParallax);
      }
    }
    updateLocationParallax();
    window.addEventListener("scroll", onLocScroll, { passive: true });
    window.addEventListener("resize", onLocScroll, { passive: true });
  }

  initTestimonialsSplide();
})();
