/* =========================================================
   Noah Santela — interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Collection data ---------- */
  var PIECES = [
    {
      img: "images/azurite-detail.jpg",
      name: "Caelum Nocturnum",
      desc: "Azurite-malachite cabochon framed in twisted silver rope, crowned with a chevron bale.",
      mat: "Sterling · Azurite",
      price: "$680",
      cls: "card--a"
    },
    {
      img: "images/labradorite-detail.jpg",
      name: "Lacrima Lunae",
      desc: "A teardrop of labradorite that wakes in blue fire, set in an engraved Baroque bezel.",
      mat: "Sterling · Labradorite",
      price: "$540",
      cls: "card--b"
    },
    {
      img: "images/azurite-bust.jpg",
      name: "Pluma Duplex",
      desc: "Two hand-chased feathers fall from the stone, mixing warm and white metal.",
      mat: "Sterling · Mixed metal",
      price: "$725",
      cls: "card--c"
    },
    {
      img: "images/labradorite-side.jpg",
      name: "Umbra Profunda",
      desc: "Seen from the side — scrollwork curls around the cabochon like rising smoke.",
      mat: "Sterling · Labradorite",
      price: "$595",
      cls: "card--d"
    },
    {
      img: "images/labradorite-rope.jpg",
      name: "Catena Antiqua",
      desc: "The full pendant on a hand-laid rope chain, photographed on aged patina.",
      mat: "Sterling · 24\" rope",
      price: "$610",
      cls: "card--e"
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

  function buildCarousel() {
    var ring = document.getElementById("carousel");
    if (!ring) return;
    var N = PIECES.length;
    var html = "";
    for (var i = 0; i < N; i++) {
      var p = PIECES[i];
      html +=
        '<article class="cw-card no-tween" data-i="' + i + '" data-screen-label="piece-' + (i + 1) + '">' +
          '<div class="cw-card__swing">' +
            '<div class="cw-card__lift">' +
              '<div class="cw-card__media">' +
                '<img src="' + res(p.img) + '" alt="' + p.name + '" draggable="false" />' +
                '<span class="cw-card__shimmer"></span>' +
              '</div>' +
              '<div class="cw-card__body">' +
                '<h3 class="cw-card__name">' + p.name + "</h3>" +
                '<div class="cw-card__meta">' +
                  '<span class="cw-card__mat">' + p.mat + "</span>" +
                  '<span class="cw-card__price">' + p.price + "</span>" +
                "</div>" +
                '<a class="cw-card__inquire" href="#contact">Inquire</a>' +
              "</div>" +
            "</div>" +
          "</div>" +
        "</article>";
    }
    ring.innerHTML = html;

    var cards = Array.prototype.slice.call(ring.querySelectorAll(".cw-card"));
    var stage = document.querySelector(".carousel-stage");
    var dotsWrap = document.querySelector(".carousel-dots");

    // build dots
    var dotsHtml = "";
    for (var d = 0; d < N; d++) dotsHtml += '<button data-i="' + d + '" aria-label="Go to piece ' + (d + 1) + '"></button>';
    if (dotsWrap) dotsWrap.innerHTML = dotsHtml;
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.querySelectorAll("button")) : [];

    var step = (Math.PI * 2) / N;            // radians between cards
    var PERIOD = 8000;                       // ms per full revolution
    var spreadX = 0;                         // computed from stage width
    function measure() {
      var w = stage ? stage.clientWidth : 900;
      spreadX = Math.min(440, Math.max(170, w * 0.34));
    }
    measure();

    var angle = 0;            // current ring rotation (radians)
    var target = null;        // tween target (radians) when snapping
    var paused = false;       // hover pause
    var last = performance.now();
    var frontIdx = -1;

    function place(now) {
      var dt = now - last; last = now;

      if (target !== null) {
        // ease toward the clicked target
        var diff = target - angle;
        angle += diff * Math.min(1, dt / 220);
        if (Math.abs(diff) < 0.0008) { angle = target; target = null; }
      } else if (!paused) {
        angle += (dt / PERIOD) * Math.PI * 2;
      }

      var best = -2, best_i = 0;
      for (var i = 0; i < N; i++) {
        var theta = angle + i * step;
        var cos = Math.cos(theta);
        var sin = Math.sin(theta);
        var depth = (cos + 1) / 2;                 // 0 (back) .. 1 (front)
        var x = sin * spreadX;
        var y = (1 - depth) * 26;                  // back cards ride higher → arc
        var scale = 0.58 + 0.42 * depth;
        var rotY = -sin * 34;                      // coverflow turn
        var card = cards[i];
        card.style.transform =
          "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) " +
          "scale(" + scale.toFixed(3) + ") rotateY(" + rotY.toFixed(1) + "deg)";
        card.style.zIndex = Math.round(depth * 100);
        card.style.setProperty("--depth", depth.toFixed(3));
        if (cos > best) { best = cos; best_i = i; }
      }

      if (best_i !== frontIdx) {
        frontIdx = best_i;
        for (var j = 0; j < N; j++) cards[j].classList.toggle("is-front", j === frontIdx);
        for (var k = 0; k < dots.length; k++) dots[k].classList.toggle("active", k === frontIdx);
      }

      requestAnimationFrame(place);
    }

    // remove the no-tween guard after first paint so clicks animate
    requestAnimationFrame(function (t) {
      place(t);
      setTimeout(function () { cards.forEach(function (c) { c.classList.remove("no-tween"); }); }, 60);
    });

    function snapTo(i) {
      // choose the rotation that brings card i to front (theta ≈ 0),
      // taking the nearest equivalent angle to avoid long spins
      var basis = -i * step;
      var k = Math.round((angle - basis) / (Math.PI * 2));
      target = basis + k * Math.PI * 2;
    }

    // interactions
    if (stage) {
      stage.addEventListener("pointerenter", function () { paused = true; });
      stage.addEventListener("pointerleave", function () { paused = false; last = performance.now(); });
    }
    cards.forEach(function (card) {
      card.addEventListener("click", function (e) {
        if (e.target.closest(".cw-card__inquire")) return; // let the link work
        snapTo(parseInt(card.getAttribute("data-i"), 10));
      });
    });
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () { snapTo(parseInt(dot.getAttribute("data-i"), 10)); });
    });
    document.querySelectorAll(".carousel-arrow").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dir = parseInt(btn.getAttribute("data-dir"), 10);
        snapTo(((frontIdx - dir) % N + N) % N);
      });
    });

    window.addEventListener("resize", measure);
  }

  /* ---------- Hero mouse shimmer ---------- */
  function heroShimmer() {
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var raf = null, tx = 50, ty = 40, cx = 50, cy = 40;

    function onMove(e) {
      var r = hero.getBoundingClientRect();
      var px = ((e.clientX - r.left) / r.width) * 100;
      var py = ((e.clientY - r.top) / r.height) * 100;
      tx = Math.max(0, Math.min(100, px));
      ty = Math.max(0, Math.min(100, py));
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function loop() {
      cx += (tx - cx) * 0.09;
      cy += (ty - cy) * 0.09;
      hero.style.setProperty("--mx", cx.toFixed(2) + "%");
      hero.style.setProperty("--my", cy.toFixed(2) + "%");
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }
    hero.addEventListener("pointermove", onMove);
  }

  /* ---------- Reveal on scroll (rect-based; fail-open in throttled contexts) ---------- */
  function reveals() {
    // give masonry cards a stagger
    document.querySelectorAll(".masonry .card").forEach(function (c, i) {
      c.classList.add("d" + ((i % 3) + 1));
    });

    var els = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

    function showAll() {
      els.forEach(function (el) { el.style.transition = "none"; el.classList.add("in"); });
    }

    // Probe whether CSS transitions actually advance in this context.
    // Some sandboxed/background iframes freeze them — in that case we must
    // not leave content stuck at opacity:0, so we reveal everything.
    var probe = document.createElement("div");
    probe.style.cssText = "position:fixed;left:-9px;top:-9px;width:1px;height:1px;opacity:0;pointer-events:none;transition:opacity .15s linear";
    document.body.appendChild(probe);
    void probe.offsetWidth;
    probe.style.opacity = "1";

    setTimeout(function () {
      var animates = parseFloat(getComputedStyle(probe).opacity) > 0.05;
      probe.remove();
      if (!animates) { showAll(); return; }
      runScrollReveal();
    }, 180);

    function runScrollReveal() {
      var ticking = false;
      function check() {
        ticking = false;
        var trigger = window.innerHeight * 0.88;
        for (var i = els.length - 1; i >= 0; i--) {
          var el = els[i];
          if (el.getBoundingClientRect().top < trigger) {
            el.classList.add("in");
            els.splice(i, 1);
          }
        }
        if (els.length === 0) {
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("resize", onScroll);
        }
      }
      function onScroll() {
        if (!ticking) { ticking = true; requestAnimationFrame(check); }
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      check();
      // safety net: nothing should stay hidden longer than this
      setTimeout(function () { if (els.length) showAll(); }, 4000);
    }
  }

  /* ---------- Smooth scroll for CTA ---------- */
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

  /* ---------- Form validation ---------- */
  function form() {
    var f = document.getElementById("inquiry");
    if (!f) return;
    var success = f.querySelector("[data-success]");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
        if (!name.value.trim()) { setErr(fieldOf(name), "Nomen requiritur."); ok = false; }
        else setErr(fieldOf(name), "");
      }
      if (showAll || email.dataset.touched) {
        if (!email.value.trim()) { setErr(fieldOf(email), "Epistula requiritur."); ok = false; }
        else if (!emailRe.test(email.value.trim())) { setErr(fieldOf(email), "Forma invalida."); ok = false; }
        else setErr(fieldOf(email), "");
      }
      if (showAll || msg.dataset.touched) {
        if (msg.value.trim().length < 8) { setErr(fieldOf(msg), "Dic paulo plus (8+ litterae)."); ok = false; }
        else setErr(fieldOf(msg), "");
      }
      return ok;
    }

    ["name", "email", "message"].forEach(function (n) {
      var el = f.elements[n];
      el.addEventListener("blur", function () { el.dataset.touched = "1"; validate(false); });
      el.addEventListener("input", function () { if (el.dataset.touched) validate(false); if (success) success.hidden = true; });
    });

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      ["name", "email", "message"].forEach(function (n) { f.elements[n].dataset.touched = "1"; });
      if (validate(true)) {
        if (success) success.hidden = false;
        var btn = f.querySelector("button[type=submit] span");
        if (btn) btn.textContent = "Sent ✓";
        f.querySelectorAll("input, textarea").forEach(function (el) { el.value = ""; el.dataset.touched = ""; });
        f.querySelectorAll(".field").forEach(function (fl) { fl.classList.remove("invalid"); });
      } else if (success) {
        success.hidden = true;
      }
    });
  }

  /* ---------- init ---------- */
  function init() {
    buildCarousel();
    heroShimmer();
    reveals();
    smoothLinks();
    form();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
