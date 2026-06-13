/* =========================================================
   Noah Santella  -  interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Collection data ---------- */
  var PIECES = [
    {
      img: "images/float/smoked-whiskey-1.png",
      imgs: ["images/float/smoked-whiskey-1.png", "images/float/smoked-whiskey-2.png", "images/float/smoked-whiskey-3.png"],
      name: "Smoked Whiskey",
      desc: "A whiskey-warm Red Jasper cabochon cradled in a hand-engraved silver cuff, scrollwork curling down each shoulder like wisps of smoke.",
      mat: "Sterling · Red Jasper"
    },
    {
      img: "images/float/azurite-feathers.png",
      name: "Nightfall",
      desc: "Azurite cabochon framed in twisted silver rope, crowned with twin hand-chased feathers.",
      mat: "Sterling · Azurite"
    },
    {
      img: "images/float/labradorite-baroque.png",
      name: "Moon's Tear",
      desc: "A teardrop of labradorite that wakes in blue fire, set in an engraved Baroque bezel.",
      mat: "Sterling · 32.5 ct Labradorite"
    }
  ];

  // Resolve an image path to an inlined blob URL when running as a
  // standalone bundle (window.__resources), else use the normal path.
  function res(path) {
    if (window.__resources) {
      var key = path.split("/").pop().replace(/\.[^.]+$/, "");
      if (window.__resources[key]) return window.__resources[key];
    }
    return path;
  }

  /* ---------- piece media (single image or multi-photo carousel) ---------- */
  function mediaMarkup(p, cls) {
    if (p.imgs && p.imgs.length > 1) {
      var frames = p.imgs.map(function (src, i) {
        return '<img class="carousel__frame float-img' + (i === 0 ? ' is-on' : '') + '" src="' + res(src) + '" alt="' + p.name + '" draggable="false" />';
      }).join('');
      return '<div class="' + cls + ' carousel" data-carousel>' + frames + '</div>';
    }
    return '<img class="' + cls + ' float-img" src="' + res(p.img) + '" alt="' + p.name + '" draggable="false" />';
  }
  function startCarousel(el) {
    var frames = el.querySelectorAll('.carousel__frame');
    if (frames.length < 2 || prefersReducedMotion) return;
    var i = 0;
    el.__carInt = setInterval(function () {
      frames[i].classList.remove('is-on');
      i = (i + 1) % frames.length;
      frames[i].classList.add('is-on');
    }, 2600);
  }
  function stopCarousel(el) { if (el && el.__carInt) { clearInterval(el.__carInt); el.__carInt = null; } }
  function initCarouselsIn(root) {
    Array.prototype.forEach.call(root.querySelectorAll('[data-carousel]'), startCarousel);
  }

  /* ---------- Horizontal slider (seamless loop) ---------- */
  function buildSlider() {
    var track = document.getElementById("track");
    var slider = document.getElementById("slider");
    if (!track || !slider) return;
    var N = PIECES.length;

    function slideHTML(p, i, clone) {
      return '<article class="slide" data-piece="' + i + '"' + (clone ? ' data-clone="1" aria-hidden="true"' : ' data-screen-label="piece-' + (i + 1) + '"') + '>' +
        '<div class="slide__stage">' +
          mediaMarkup(p, 'slide__img') +
          '<span class="slide__shimmer"></span>' +
        '</div>' +
        '<div class="slide__body">' +
          '<h3 class="slide__name">' + p.name + '</h3>' +
          '<span class="slide__mat">' + p.mat + '</span>' +
          '<span class="slide__cue">Click to inquire</span>' +
        '</div>' +
      '</article>';
    }

    // [cloneLast] real0..realN-1 [cloneFirst]
    var html = slideHTML(PIECES[N - 1], N - 1, true);
    for (var i = 0; i < N; i++) html += slideHTML(PIECES[i], i, false);
    html += slideHTML(PIECES[0], 0, true);
    track.innerHTML = html;
    initCarouselsIn(track);

    var slides = Array.prototype.slice.call(track.children);
    var dotsWrap = slider.querySelector(".slider-dots");
    var dh = "";
    for (var d = 0; d < N; d++) dh += '<button data-r="' + d + '" aria-label="Go to piece ' + (d + 1) + '"></button>';
    dotsWrap.innerHTML = dh;
    var dots = Array.prototype.slice.call(dotsWrap.querySelectorAll("button"));

    var current = 1;          // DOM index of active slide (real slides 1..N)
    var slideW = 0, unit = 0, vpW = 0, normT = null;

    function measure() {
      var vp = slider.querySelector(".slider__viewport");
      vpW = vp.clientWidth;
      var first = slides[1];
      slideW = first.getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      unit = slideW + gap;
      position(false);
    }

    function position(animate) {
      track.classList.toggle("no-tween", !animate);
      var off = (vpW - slideW) / 2;
      track.style.transform = "translateX(" + (off - current * unit) + "px)";
      if (!animate) void track.offsetWidth;
      setActive();
    }

    function setActive() {
      for (var i = 0; i < slides.length; i++) slides[i].classList.toggle("is-active", i === current);
      var real = ((current - 1) % N + N) % N;
      for (var k = 0; k < dots.length; k++) dots[k].classList.toggle("active", k === real);
    }

    function normalize() {
      if (current === N + 1) { current = 1; position(false); }
      else if (current === 0) { current = N; position(false); }
    }

    function go(dir) {
      current += dir;
      position(true);
      clearTimeout(normT);
      normT = setTimeout(normalize, 480);
    }
    function goReal(r) {
      current = r + 1;
      position(true);
      clearTimeout(normT);
      normT = setTimeout(normalize, 480);
    }

    track.addEventListener("transitionend", function (e) {
      // ignore transitions that bubbled up from child elements (e.g. the
      // active slide's stage scaling)  -  only the track's own slide movement
      // should trigger the seamless loop reset.
      if (e.target !== track || e.propertyName !== "transform") return;
      normalize();
    });

    // autoplay (5s), pause on hover / when a modal is open
    var paused = false, timer = null;
    function play() { clearInterval(timer); timer = setInterval(function () { if (!paused && !document.body.classList.contains("modal-open")) go(1); }, 2500); }
    function bump() { play(); }
    slider.addEventListener("pointerenter", function () { paused = true; });
    slider.addEventListener("pointerleave", function () { paused = false; });

    // arrows + dots
    slider.querySelectorAll(".slider-arrow").forEach(function (btn) {
      btn.addEventListener("click", function () { go(parseInt(btn.getAttribute("data-dir"), 10)); bump(); });
    });
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () { goReal(parseInt(dot.getAttribute("data-r"), 10)); bump(); });
    });

    // click a slide: active → open modal; neighbour → slide to it
    slides.forEach(function (s, i) {
      s.addEventListener("click", function () {
        if (i === current) {
          window.openInquiry(parseInt(s.getAttribute("data-piece"), 10));
        } else {
          goReal(parseInt(s.getAttribute("data-piece"), 10));
          bump();
        }
      });
    });

    window.addEventListener("resize", measure);
    measure();
    requestAnimationFrame(function () { setTimeout(function () { track.classList.remove("no-tween"); play(); }, 60); });

    // expose pieces for modal
    window.__pieces = PIECES;
    window.__resPiece = res;
  }

  /* ---------- Inquiry modal ---------- */
  function modal() {
    var m = document.getElementById("modal");
    if (!m) return;
    var imgEl = document.getElementById("modal-img");
    var nameEl = document.getElementById("modal-name");
    var descEl = document.getElementById("modal-desc");
    var current = null;

    window.openInquiry = function (idx) {
      var P = window.__pieces || PIECES;
      var p = P[idx]; if (!p) return;
      current = p;
      var mediaEl = m.querySelector('.modal__media');
      var prevCar = mediaEl.querySelector('.carousel');
      if (prevCar) { stopCarousel(prevCar); prevCar.remove(); }
      if (p.imgs && p.imgs.length > 1) {
        imgEl.style.display = 'none';
        var car = document.createElement('div');
        car.className = 'modal__img carousel';
        car.setAttribute('data-carousel', '');
        car.innerHTML = p.imgs.map(function (src, i) {
          return '<img class="carousel__frame float-img' + (i === 0 ? ' is-on' : '') + '" src="' + res(src) + '" alt="' + p.name + '">';
        }).join('');
        mediaEl.appendChild(car);
        startCarousel(car);
      } else {
        imgEl.style.display = '';
        imgEl.src = res(p.img);
        imgEl.alt = p.name;
      }
      nameEl.textContent = p.name;
      descEl.textContent = p.desc;
      m.hidden = false;
      void m.offsetWidth;
      m.classList.add("open");
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
    };
    function close() {
      var car = m.querySelector('.modal__media .carousel');
      if (car) { stopCarousel(car); car.remove(); }
      if (imgEl) imgEl.style.display = '';
      m.classList.remove("open");
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      setTimeout(function () { m.hidden = true; }, 420);
    }
    m.querySelectorAll("[data-close]").forEach(function (el) { el.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && m.classList.contains("open")) close(); });

    // modal form → mailto with piece name in subject
    setupForm(document.getElementById("modal-form"), function (vals) {
      var subject = "Inquiry: " + (current ? current.name : "a piece");
      sendMail(subject, vals);
    });
  }

  /* ---------- mailto helper ---------- */
  function sendMail(subject, v) {
    var lines = [
      "Name: " + (v.name || ""),
      "Email: " + (v.email || ""),
      v.phone ? "Phone: " + v.phone : null,
      "",
      v.message || ""
    ].filter(function (x) { return x !== null; });
    var href = "mailto:noahsantella@gmail.com?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(lines.join("\n"));
    window.location.href = href;
  }

  /* ---------- Generic form validation ---------- */
  function setupForm(f, onValid) {
    if (!f) return;
    var success = f.querySelector("[data-success]");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var fields = ["name", "email", "message"]; // phone optional, not validated

    function setErr(field, msg) {
      field.classList.toggle("invalid", !!msg);
      var span = field.querySelector("[data-err]");
      if (span) span.textContent = msg || "";
    }
    function fieldOf(input) { return input.closest(".field"); }

    function validate(showAll) {
      var ok = true;
      var name = f.elements["name"], email = f.elements["email"], msg = f.elements["message"];
      if (showAll || name.dataset.touched) {
        if (!name.value.trim()) { setErr(fieldOf(name), "Name required."); ok = false; }
        else setErr(fieldOf(name), "");
      }
      if (showAll || email.dataset.touched) {
        if (!email.value.trim()) { setErr(fieldOf(email), "Email required."); ok = false; }
        else if (!emailRe.test(email.value.trim())) { setErr(fieldOf(email), "Invalid email format."); ok = false; }
        else setErr(fieldOf(email), "");
      }
      if (showAll || msg.dataset.touched) {
        if (msg.value.trim().length < 8) { setErr(fieldOf(msg), "Add a little more (8+ characters)."); ok = false; }
        else setErr(fieldOf(msg), "");
      }
      return ok;
    }

    fields.forEach(function (n) {
      var el = f.elements[n]; if (!el) return;
      el.addEventListener("blur", function () { el.dataset.touched = "1"; validate(false); });
      el.addEventListener("input", function () { if (el.dataset.touched) validate(false); if (success) success.hidden = true; });
    });

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      fields.forEach(function (n) { if (f.elements[n]) f.elements[n].dataset.touched = "1"; });
      if (validate(true)) {
        var vals = {
          name: f.elements["name"] ? f.elements["name"].value.trim() : "",
          email: f.elements["email"] ? f.elements["email"].value.trim() : "",
          phone: f.elements["phone"] ? f.elements["phone"].value.trim() : "",
          message: f.elements["message"] ? f.elements["message"].value.trim() : ""
        };
        if (success) success.hidden = false;
        if (typeof onValid === "function") onValid(vals);
      } else if (success) {
        success.hidden = true;
      }
    });
  }

  /* ---------- Site-wide atmosphere (cursor-reactive) ---------- */
  function atmosphere() {
    var layer = document.querySelector(".site-atmosphere");
    if (!layer) return;
    var root = document.documentElement, raf = null, tx = 50, ty = 38, cx = 50, cy = 38;
    function onMove(e) {
      tx = Math.max(0, Math.min(100, (e.clientX / window.innerWidth) * 100));
      ty = Math.max(0, Math.min(100, (e.clientY / window.innerHeight) * 100));
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function loop() {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      root.style.setProperty("--mx", cx.toFixed(2) + "%");
      root.style.setProperty("--my", cy.toFixed(2) + "%");
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) raf = requestAnimationFrame(loop);
      else raf = null;
    }
    window.addEventListener("pointermove", onMove, { passive: true });
  }

  /* ---------- Hero mouse shimmer ---------- */
  function heroShimmer() {
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var raf = null, tx = 50, ty = 40, cx = 50, cy = 40;
    function onMove(e) {
      var r = hero.getBoundingClientRect();
      tx = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      ty = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function loop() {
      cx += (tx - cx) * 0.09; cy += (ty - cy) * 0.09;
      hero.style.setProperty("--mx", cx.toFixed(2) + "%");
      hero.style.setProperty("--my", cy.toFixed(2) + "%");
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) raf = requestAnimationFrame(loop);
      else raf = null;
    }
    hero.addEventListener("pointermove", onMove);
  }

  /* ---------- Nav: scrolled state + active link ---------- */
  function nav() {
    var n = document.getElementById("nav");
    if (!n) return;
    var links = Array.prototype.slice.call(n.querySelectorAll('.nav__links a[href^="#"]'));
    var map = links.map(function (a) { return { a: a, sec: document.querySelector(a.getAttribute("href")) }; })
                   .filter(function (x) { return x.sec; });
    function onScroll() {
      n.classList.toggle("scrolled", window.scrollY > 40);
      var y = window.scrollY + window.innerHeight * 0.32, cur = null;
      map.forEach(function (mm) { if (mm.sec.offsetTop <= y) cur = mm; });
      links.forEach(function (l) { l.classList.remove("active"); });
      if (cur) cur.a.classList.add("active");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Reveal on scroll (fail-open in throttled contexts) ---------- */
  function reveals() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    function showAll() { els.forEach(function (el) { el.style.transition = "none"; el.classList.add("in"); }); }

    var probe = document.createElement("div");
    probe.style.cssText = "position:fixed;left:-9px;top:-9px;width:1px;height:1px;opacity:0;pointer-events:none;transition:opacity .15s linear";
    document.body.appendChild(probe);
    void probe.offsetWidth;
    probe.style.opacity = "1";
    setTimeout(function () {
      var animates = parseFloat(getComputedStyle(probe).opacity) > 0.05;
      probe.remove();
      if (!animates) { document.documentElement.classList.add("no-anim"); showAll(); return; }
      run();
    }, 180);

    function run() {
      var ticking = false;
      function check() {
        ticking = false;
        var trigger = window.innerHeight * 0.9;
        for (var i = els.length - 1; i >= 0; i--) {
          if (els[i].getBoundingClientRect().top < trigger) { els[i].classList.add("in"); els.splice(i, 1); }
        }
        if (els.length === 0) { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); }
      }
      function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(check); } }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      check();
      setTimeout(function () { if (els.length) showAll(); }, 4000);
    }
  }

  /* ---------- Smooth scroll for in-page links ---------- */
  function smoothLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ---------- init ---------- */
  function init() {
    buildSlider();
    modal();
    nav();
    heroShimmer();
    atmosphere();
    reveals();
    smoothLinks();
    setupForm(document.getElementById("inquiry"), function (vals) {
      sendMail("Commission inquiry  -  Noah Santella", vals);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
