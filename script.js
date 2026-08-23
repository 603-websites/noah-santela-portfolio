/* =========================================================
   Noah Santella  -  interactions
   ========================================================= */
(function () {
  "use strict";

  // Honor the visitor's reduced-motion preference (used to pause auto-animations).
  var prefersReducedMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---------- PayPal payment link ----------
     Paste Noah's PayPal checkout URL between the quotes to switch on the
     "Pay with PayPal" button in the contact section. Leave it empty and the
     button stays hidden. This can be a PayPal.me link (paypal.me/<handle>) or a
     hosted "Payment link / button" URL generated in the PayPal business
     dashboard. See docs/paypal-setup.md for step-by-step instructions. */
  var PAYPAL_PAYMENT_LINK = "";

  /* ---------- Collection data ---------- */
  var PIECES = [
    {
      img: "uploads/IMG_3088.jpeg",
      imgs: ["uploads/IMG_3088.jpeg", "uploads/IMG_3087.jpeg"],
      name: "Nightfall",
      desc: "Azurite cabochon framed in twisted silver rope, crowned with twin hand-chased feathers.",
      alt: "Nightfall pendant: a deep blue azurite cabochon in a twisted sterling rope bezel, crowned with two chased silver feathers, on a rope chain",
      mat: "Sterling · Azurite"
    },
    {
      img: "images/float/labradorite-baroque.png",
      imgs: ["images/float/labradorite-baroque.png", "uploads/IMG_3253.jpeg", "uploads/IMG_3251.jpeg", "uploads/IMG_3250.jpeg"],
      name: "Moon's Tear",
      desc: "A teardrop of labradorite that wakes in blue fire, set in an engraved Baroque bezel.",
      alt: "Moon's Tear pendant: a teardrop labradorite flashing blue, set in an engraved sterling bezel with Baroque scrollwork",
      mat: "Sterling · 32.5 ct Labradorite"
    },
    {
      img: "images/float/polychrome-1.jpg",
      imgs: ["images/float/polychrome-1.jpg", "images/float/polychrome-2.jpg", "images/float/polychrome-3.jpg", "images/float/polychrome-4.jpg", "images/float/polychrome-5.jpg"],
      name: "Prairie Fire",
      desc: "Polychrome Jasper sourced direct from a mine in Montana, antiqued with a raw sulphur patina, cradled in sterling with chased feathers oxidized to a rainbow finish.",
      alt: "Prairie Fire pendant: a round Montana polychrome jasper with amber and cream banding, flanked by two oxidized silver feathers on a sterling rope chain",
      mat: "Sterling · Polychrome Jasper"
    },
    {
      img: "uploads/20260612_230302.jpg",
      imgs: ["uploads/20260612_230302.jpg", "uploads/20260612_230554.jpg", "uploads/20260612_230636.jpg"],
      name: "Smoked Whiskey",
      desc: "A second ember from the same fire, deep Red Jasper set in an engraved sterling cuff, its scrollwork cut freehand and worn like something that has always belonged.",
      alt: "Smoked Whiskey cuff: a deep red jasper stone set in a wide sterling silver cuff engraved with freehand scrollwork",
      mat: "Sterling · Red Jasper"
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

  /* ---------- Optimized-image manifest ----------
     Intrinsic dimensions of the WebP renditions generated for each gallery
     source. Each source has a `<base>.webp` (long edge <= 1200) and a
     `<base>-sm.webp` (long edge <= 640) sitting next to the original. The
     original JPEG/PNG stays referenced as the <img> fallback. */
  var DIMS = {
    "uploads/IMG_3253.jpeg": [900, 1200],
    "uploads/IMG_3251.jpeg": [900, 1200],
    "uploads/IMG_3087.jpeg": [900, 1200],
    "uploads/IMG_3250.jpeg": [900, 1200],
    "uploads/IMG_3088.jpeg": [900, 1200],
    "uploads/20260612_230302.jpg": [1200, 560],
    "uploads/20260612_230554.jpg": [1200, 560],
    "uploads/20260612_230636.jpg": [1200, 560],
    "images/float/labradorite-baroque.png": [720, 993],
    "images/float/polychrome-1.jpg": [600, 800],
    "images/float/polychrome-2.jpg": [600, 800],
    "images/float/polychrome-3.jpg": [600, 800],
    "images/float/polychrome-4.jpg": [600, 800],
    "images/float/polychrome-5.jpg": [600, 800]
  };

  // Build a lazy-loaded <picture> with a WebP srcset source and the original
  // as fallback. Falls back to a plain <img> when the source has no WebP
  // rendition or when running as an inlined standalone bundle.
  function pictureMarkup(src, imgClass, alt) {
    var d = DIMS[src];
    var imgAttrs = 'class="' + imgClass + ' piece-image" src="' + res(src) + '" alt="' + alt + '"' +
      (d ? ' width="' + d[0] + '" height="' + d[1] + '"' : '') +
      ' loading="lazy" decoding="async" draggable="false"';
    if (window.__resources || !d) return '<img ' + imgAttrs + ' />';
    var base = src.replace(/\.[^.]+$/, "");
    var srcset = base + '-sm.webp 640w, ' + base + '.webp 1200w';
    return '<picture class="pic"><source type="image/webp" srcset="' + srcset +
      '" sizes="(max-width:600px) 90vw, 430px" /><img ' + imgAttrs + ' /></picture>';
  }

  /* ---------- piece media (single image or multi-photo carousel) ---------- */
  function pieceAlt(p, i) {
    var base = p.alt || p.name;
    return i > 0 ? base + " (alternate view)" : base;
  }
  function mediaMarkup(p, cls) {
    if (p.imgs && p.imgs.length > 1) {
      var frames = p.imgs.map(function (src, i) {
        return pictureMarkup(src, 'carousel__frame float-img' + (i === 0 ? ' is-on' : ''), pieceAlt(p, i));
      }).join('');
      return '<div class="' + cls + ' carousel" data-carousel>' + frames + '</div>';
    }
    return pictureMarkup(p.img, cls + ' float-img', pieceAlt(p, 0));
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
  // Lazy images injected into the (initially display:none) modal never get
  // picked up by the browser's lazy loader once it opens, because the
  // shrink-to-fit frames have no box until the image loads. Flip them to
  // eager at open time; the visitor has explicitly asked to see the piece.
  function forceEagerLoad(root) {
    Array.prototype.forEach.call(root.querySelectorAll('img[loading="lazy"]'), function (img) {
      img.loading = 'eager';
    });
  }
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
        '<div class="slide__stage piece-halo">' +
          mediaMarkup(p, 'slide__img') +
          '<span class="slide__shimmer"></span>' +
        '</div>' +
        '<div class="slide__body">' +
          '<h3 class="slide__name">' + p.name + '</h3>' +
          '<span class="slide__mat">' + p.mat + '</span>' +
          '<span class="slide__cue">One of a kind &middot; Inquire</span>' +
        '</div>' +
      '</article>';
    }

    // [cloneLast] real0..realN-1 [cloneFirst]
    var html = slideHTML(PIECES[N - 1], N - 1, true);
    for (var i = 0; i < N; i++) html += slideHTML(PIECES[i], i, false);
    html += slideHTML(PIECES[0], 0, true);
    track.innerHTML = html;
    initCarouselsIn(track);

    // The shrink-to-fit slide images have no box until they load, so the
    // browser's native lazy loader never picks them up. Load the whole track
    // once the slider approaches the viewport. IO is the primary trigger,
    // with a scroll check and a timeout as fail-opens (IO callbacks don't
    // fire in some throttled/sandboxed contexts  -  same reason reveals()
    // probes before trusting transitions).
    var trackLoaded = false;
    var trackIO = null;
    function loadTrack() {
      if (trackLoaded) return;
      trackLoaded = true;
      forceEagerLoad(track);
      if (trackIO) trackIO.disconnect();
      window.removeEventListener("scroll", trackNearCheck);
    }
    function trackNearCheck() {
      if (slider.getBoundingClientRect().top < window.innerHeight + 600) loadTrack();
    }
    if ("IntersectionObserver" in window) {
      trackIO = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) loadTrack();
      }, { rootMargin: "600px" });
      trackIO.observe(slider);
    }
    window.addEventListener("scroll", trackNearCheck, { passive: true });
    trackNearCheck();
    setTimeout(loadTrack, 4000);

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
      if (current < 1 || current > N) {
        current = ((current - 1) % N + N) % N + 1;
        position(false);
      }
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
    var lastFocus = null;
    var closeBtn = m.querySelector(".modal__close");

    // Keep keyboard focus inside the open modal (basic focus trap).
    function focusables() {
      return Array.prototype.slice.call(m.querySelectorAll(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      )).filter(function (el) {
        return !el.disabled && el.offsetParent !== null;
      });
    }
    function onTrap(e) {
      if (e.key !== "Tab") return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }

    window.openInquiry = function (idx) {
      var P = window.__pieces || PIECES;
      var p = P[idx]; if (!p) return;
      current = p;
      var mediaEl = m.querySelector('.modal__media');
      var prevCar = mediaEl.querySelector('.carousel');
      if (prevCar) stopCarousel(prevCar);
      Array.prototype.forEach.call(mediaEl.querySelectorAll('.modal__gen'), function (el) { el.remove(); });
      imgEl.style.display = 'none';
      if (p.imgs && p.imgs.length > 1) {
        var car = document.createElement('div');
        car.className = 'modal__img carousel modal__gen';
        car.setAttribute('data-carousel', '');
        car.innerHTML = p.imgs.map(function (src, i) {
          return pictureMarkup(src, 'carousel__frame float-img' + (i === 0 ? ' is-on' : ''), pieceAlt(p, i));
        }).join('');
        mediaEl.appendChild(car);
        forceEagerLoad(mediaEl);
        startCarousel(car);
      } else {
        var single = document.createElement('div');
        single.className = 'modal__gen pic';
        single.innerHTML = pictureMarkup(p.img, 'modal__img float-img', pieceAlt(p, 0));
        mediaEl.appendChild(single);
        forceEagerLoad(mediaEl);
      }
      nameEl.textContent = p.name;
      descEl.textContent = p.desc;
      m.hidden = false;
      void m.offsetWidth;
      m.classList.add("open");
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
      lastFocus = document.activeElement;
      m.addEventListener("keydown", onTrap);
      if (closeBtn) closeBtn.focus();
    };
    function close() {
      var mediaEl = m.querySelector('.modal__media');
      var car = mediaEl.querySelector('.carousel');
      if (car) stopCarousel(car);
      Array.prototype.forEach.call(mediaEl.querySelectorAll('.modal__gen'), function (el) { el.remove(); });
      if (imgEl) imgEl.style.display = 'none';
      m.classList.remove("open");
      m.removeEventListener("keydown", onTrap);
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      setTimeout(function () { m.hidden = true; }, 420);
      // Return focus to the element that opened the modal.
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
      lastFocus = null;
    }
    m.querySelectorAll("[data-close]").forEach(function (el) { el.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && m.classList.contains("open")) close(); });

    // modal form → mailto with piece name in subject
    setupForm(document.getElementById("modal-form"), function (vals, onSuccess, onError) {
      var subject = "Inquiry: " + (current ? current.name : "a piece");
      sendMail(subject, vals, onSuccess, onError);
    });
  }

  /* ---------- inquiry submission ----------
     Posts to the inquiry endpoint. Success is shown ONLY on a genuine 2xx
     response. On any failure (non-2xx, network error, timeout) we surface an
     honest error asking the visitor to email directly, rather than faking a
     success or silently hijacking the tab with a mailto: redirect.
     NOTE: the endpoint below is the legacy unauthenticated n8n webhook. The
     real fix is an authenticated, server-rate-limited endpoint tracked in
     SCRUM-270; the client-side hardening here is a best-effort deterrent. */
  var INQUIRY_ENDPOINT = "https://n8n-production-512d.up.railway.app/webhook/santella-inquiry";
  var SEND_ERROR_MSG = "We could not send your inquiry just now. Please email noah@santelladesigns.com directly and Noah will follow up.";

  function sendMail(subject, v, onSuccess, onError) {
    var ctrl = ("AbortController" in window) ? new AbortController() : null;
    var timeoutId = ctrl ? setTimeout(function () { ctrl.abort(); }, 12000) : null;
    function fail() { if (timeoutId) clearTimeout(timeoutId); if (onError) onError(SEND_ERROR_MSG); }
    try {
      fetch(INQUIRY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject, name: v.name || "", email: v.email || "",
          phone: v.phone || "", message: v.message || "", botcheck: v.botcheck || ""
        }),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (r) {
        if (timeoutId) clearTimeout(timeoutId);
        if (r.ok) { if (onSuccess) onSuccess(); }
        else { fail(); }
      }).catch(fail);
    } catch (e) { fail(); }
  }

  /* ---------- Client-side rate limiting ----------
     Best-effort throttle to blunt casual spam/abuse of the inquiry endpoint.
     This is NOT a security control (it lives in the client and clears with
     storage); authoritative rate limiting belongs server-side (SCRUM-270). */
  var RL_KEY = "santella_inq_rl";
  var RL_MAX = 3;                 // max sends
  var RL_WINDOW = 10 * 60 * 1000; // per 10 minutes
  var RL_MIN_GAP = 4000;          // min ms between sends

  function rlTimes() {
    try {
      var s = JSON.parse(window.localStorage.getItem(RL_KEY)) || {};
      var now = Date.now();
      return (s.t || []).filter(function (t) { return now - t < RL_WINDOW; });
    } catch (e) { return null; } // storage unavailable: skip client throttle
  }
  function rlCheck() {
    var times = rlTimes();
    if (!times) return null;
    var now = Date.now();
    if (times.length && now - times[times.length - 1] < RL_MIN_GAP) {
      return "Please wait a moment before sending again.";
    }
    if (times.length >= RL_MAX) {
      return "You have sent several inquiries recently. Please email noah@santelladesigns.com directly.";
    }
    return null;
  }
  function rlRecord() {
    var times = rlTimes();
    if (!times) return;
    times.push(Date.now());
    try { window.localStorage.setItem(RL_KEY, JSON.stringify({ t: times })); } catch (e) {}
  }

  /* ---------- Generic form validation ---------- */
  var MAX_LEN = { name: 100, email: 150, message: 2000 };

  function setupForm(f, onValid) {
    if (!f) return;
    var success = f.querySelector("[data-success]");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var fields = ["name", "email", "message"]; // phone optional, not validated

    // Honest, non-field error surface (network/rate-limit failures).
    var formErr = f.querySelector("[data-formerr]");
    if (!formErr) {
      formErr = document.createElement("p");
      formErr.className = "form__error";
      formErr.setAttribute("data-formerr", "");
      formErr.setAttribute("role", "alert");
      formErr.hidden = true;
      if (success && success.parentNode === f) f.insertBefore(formErr, success);
      else f.appendChild(formErr);
    }
    function showErr(msg) { formErr.textContent = msg || SEND_ERROR_MSG; formErr.hidden = false; }
    function hideErr() { formErr.hidden = true; }

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
        else if (name.value.trim().length > MAX_LEN.name) { setErr(fieldOf(name), "Name is too long."); ok = false; }
        else setErr(fieldOf(name), "");
      }
      if (showAll || email.dataset.touched) {
        if (!email.value.trim()) { setErr(fieldOf(email), "Email required."); ok = false; }
        else if (email.value.trim().length > MAX_LEN.email) { setErr(fieldOf(email), "Email is too long."); ok = false; }
        else if (!emailRe.test(email.value.trim())) { setErr(fieldOf(email), "Invalid email format."); ok = false; }
        else setErr(fieldOf(email), "");
      }
      if (showAll || msg.dataset.touched) {
        if (msg.value.trim().length < 8) { setErr(fieldOf(msg), "Add a little more (8+ characters)."); ok = false; }
        else if (msg.value.trim().length > MAX_LEN.message) { setErr(fieldOf(msg), "Message is too long (2000 characters max)."); ok = false; }
        else setErr(fieldOf(msg), "");
      }
      return ok;
    }

    fields.forEach(function (n) {
      var el = f.elements[n]; if (!el) return;
      el.addEventListener("blur", function () { el.dataset.touched = "1"; validate(false); });
      el.addEventListener("input", function () { if (el.dataset.touched) validate(false); if (success) success.hidden = true; hideErr(); });
    });

    function clearTouched() {
      fields.forEach(function (n) { var el = f.elements[n]; if (el) delete el.dataset.touched; });
    }

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      fields.forEach(function (n) { if (f.elements[n]) f.elements[n].dataset.touched = "1"; });
      if (!validate(true)) { if (success) success.hidden = true; return; }

      // Honeypot: a filled hidden field means a bot. Show the normal success
      // state so the bot gets no signal, but never send or count it.
      var honeypot = f.elements["botcheck"] ? f.elements["botcheck"].value : "";
      if (honeypot) {
        hideErr();
        if (success) success.hidden = false;
        f.reset();
        clearTouched();
        return;
      }

      // Client-side throttle (best-effort; server-side is the real control).
      var rlMsg = rlCheck();
      if (rlMsg) { if (success) success.hidden = true; showErr(rlMsg); return; }

      var vals = {
        name: f.elements["name"] ? f.elements["name"].value.trim() : "",
        email: f.elements["email"] ? f.elements["email"].value.trim() : "",
        phone: f.elements["phone"] ? f.elements["phone"].value.trim() : "",
        message: f.elements["message"] ? f.elements["message"].value.trim() : "",
        botcheck: honeypot
      };
      if (success) success.hidden = true;
      hideErr();
      var btn = f.querySelector('[type="submit"]');
      var btnInner = btn && btn.querySelector('span');
      var origText = btnInner ? btnInner.textContent : (btn ? btn.textContent : '');
      if (btn) btn.disabled = true;
      if (btnInner) btnInner.textContent = 'Sending…';
      else if (btn) btn.textContent = 'Sending…';
      function restoreBtn() {
        if (btn) btn.disabled = false;
        if (btnInner) btnInner.textContent = origText;
        else if (btn) btn.textContent = origText;
      }
      if (typeof onValid === "function") {
        onValid(vals,
          function () {
            rlRecord();
            hideErr();
            if (success) success.hidden = false;
            f.reset();
            clearTouched();
            restoreBtn();
          },
          function (msg) {
            if (success) success.hidden = true;
            showErr(msg);
            restoreBtn();
          }
        );
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

    /* hamburger menu (<=768px) */
    var toggle = n.querySelector(".nav__toggle");
    var linksWrap = n.querySelector(".nav__links");
    if (toggle && linksWrap) {
      var setOpen = function (open) {
        n.classList.toggle("menu-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      };
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        setOpen(!n.classList.contains("menu-open"));
      });
      Array.prototype.forEach.call(linksWrap.querySelectorAll("a"), function (a) {
        a.addEventListener("click", function () { setOpen(false); });
      });
      document.addEventListener("click", function (e) {
        if (n.classList.contains("menu-open") && !n.contains(e.target)) setOpen(false);
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && n.classList.contains("menu-open")) setOpen(false);
      });
    }

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
        t.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      });
    });
  }

  /* ---------- PayPal button ---------- */
  function paymentLink() {
    var block = document.querySelector("[data-paypal-block]");
    if (!block) return;
    var url = (PAYPAL_PAYMENT_LINK || "").trim();
    if (!url) return; // no link configured yet -> button stays hidden
    var a = block.querySelector("[data-paypal-link]");
    if (a) a.setAttribute("href", url);
    block.hidden = false;
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
    paymentLink();
    setupForm(document.getElementById("inquiry"), function (vals, onSuccess, onError) {
      sendMail("Commission inquiry for Noah Santella", vals, onSuccess, onError);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();


/* Sticky mobile inquire bar. Injected so every page gets it without markup
   duplication; hidden above 768px. */
(function () {
  if (document.getElementById('sd-sticky-cta')) return;
  var a = document.createElement('a');
  a.id = 'sd-sticky-cta';
  var onHome = /(?:^|\/)(index\.html)?$/.test(location.pathname);
  a.href = onHome ? '#contact' : '/index.html#contact';
  a.textContent = 'Inquire';
  a.setAttribute('aria-label', 'Start an inquiry');
  a.style.cssText = 'display:none;position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:999;padding:12px 34px;border-radius:40px;background:rgba(12,13,16,0.92);border:1px solid rgba(201,169,98,0.6);color:#e8dcc0;font-family:Jost,sans-serif;font-size:15px;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;box-shadow:0 6px 24px rgba(0,0,0,0.45);backdrop-filter:blur(6px)';
  function mount() {
    if (!document.body) return;
    document.body.appendChild(a);
    function show() { a.style.display = window.innerWidth <= 768 ? 'inline-block' : 'none'; }
    show();
    window.addEventListener('resize', show, { passive: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
