/* Schreinerei Fritz Gfeller AG — interactions.
   All assistants are front-end demo mocks: they structure an enquiry,
   they do not send anything. Business name = one constant. */
(function () {
  "use strict";
  var BUSINESS = "Schreinerei Fritz Gfeller AG";
  document.documentElement.dataset.business = BUSINESS;

  /* ---------- sticky header shadow ---------- */
  var header = document.querySelector("header.site");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "SCHLIESSEN" : "MENÜ";
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); toggle.textContent = "MENÜ"; });
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else { revealEls.forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- generic stepper ---------- */
  function setupStepper(root) {
    if (!root) return;
    var stepBtns = Array.prototype.slice.call(root.querySelectorAll(".ai-stepbtn"));
    var panels = Array.prototype.slice.call(root.querySelectorAll(".ai-panel"));
    var state = { step: 0 };
    var maxUnlocked = 0;
    function show(i) {
      state.step = i;
      stepBtns.forEach(function (b, j) {
        b.setAttribute("aria-selected", j === i ? "true" : "false");
        b.disabled = j > maxUnlocked;
      });
      panels.forEach(function (p, j) { p.classList.toggle("active", j === i); });
      var active = panels[i];
      if (active) { var f = active.querySelector("input,select,textarea,button"); }
    }
    stepBtns.forEach(function (b, j) { b.addEventListener("click", function () { if (j <= maxUnlocked) show(j); }); });
    root.querySelectorAll("[data-next]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = parseInt(btn.getAttribute("data-next"), 10);
        if (next > maxUnlocked) maxUnlocked = next;
        show(next);
        root.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    root.querySelectorAll("[data-prev]").forEach(function (btn) {
      btn.addEventListener("click", function () { show(parseInt(btn.getAttribute("data-prev"), 10)); });
    });
    show(0);
    return { show: show, unlock: function (i) { if (i > maxUnlocked) maxUnlocked = i; stepBtns.forEach(function (b, j) { b.disabled = j > maxUnlocked; }); } };
  }

  /* ---------- option groups (radio-style) ---------- */
  function setupOptions(root, onChange) {
    if (!root) return;
    root.querySelectorAll("[data-opt-group]").forEach(function (group) {
      var key = group.getAttribute("data-opt-group");
      group.querySelectorAll(".opt").forEach(function (opt) {
        opt.addEventListener("click", function () {
          group.querySelectorAll(".opt").forEach(function (o) { o.setAttribute("aria-checked", "false"); });
          opt.setAttribute("aria-checked", "true");
          onChange(key, opt.getAttribute("data-value"), opt);
        });
      });
    });
  }
  function setupSegs(root, onChange) {
    if (!root) return;
    root.querySelectorAll("[data-seg-group]").forEach(function (group) {
      var key = group.getAttribute("data-seg-group");
      group.querySelectorAll("button").forEach(function (btn) {
        btn.addEventListener("click", function () {
          group.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
          btn.setAttribute("aria-pressed", "true");
          onChange(key, btn.getAttribute("data-value"), btn);
        });
      });
    });
  }

  /* ---------- homepage assistant (4 steps) ---------- */
  var home = document.getElementById("ai-home");
  if (home) {
    var hs = { bereich: "Küchenbau nach Mass", masse: "—", material: "—" };
    var hSummary = home.querySelector(".ai-summary");
    function hRender() {
      var rows = [
        ["Projektbereich", hs.bereich],
        ["Masse / Raum", hs.masse],
        ["Materialwunsch", hs.material]
      ];
      hSummary.querySelector("dl").innerHTML = rows.map(function (r) {
        return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>";
      }).join("");
    }
    setupOptions(home, function (key, val) {
      if (key === "bereich") hs.bereich = val;
      if (key === "masse") hs.masse = val;
      if (key === "material") hs.material = val;
      hRender();
    });
    setupSegs(home, function (key, val) {
      if (key === "masse") hs.masse = val;
      if (key === "material") hs.material = val;
      hRender();
    });
    var hStep = setupStepper(home);
    var hSend = home.querySelector("[data-send]");
    if (hSend) hSend.addEventListener("click", function () {
      var c = home.querySelector(".ai-confirm");
      if (c) { c.classList.add("show"); c.scrollIntoView({ behavior: "smooth", block: "center" }); }
    });
    hRender();
  }

  /* ---------- kitchen configurator ---------- */
  var kueche = document.getElementById("cfg-kueche");
  if (kueche) {
    var ks = { projekt: "Kompletter Neubau", layout: "—", material: "—", laenge: 4.2 };
    var kOut = kueche.querySelector("[data-k-summary]");
    function kRender() {
      kOut.innerHTML =
        "<dt>Gewerk</dt><dd>Küchenbau nach Mass</dd>" +
        "<dt>Projekt</dt><dd>" + ks.projekt + "</dd>" +
        "<dt>Layout</dt><dd>" + ks.layout + "</dd>" +
        "<dt>Material</dt><dd>" + ks.material + "</dd>" +
        "<dt>Länge</dt><dd>ca. " + ks.laenge.toFixed(1).replace(".", ",") + " m</dd>";
    }
    setupSegs(kueche, function (key, val) {
      if (key === "projekt") ks.projekt = val;
      if (key === "layout") ks.layout = val;
      if (key === "material") ks.material = val;
      kRender();
    });
    var slider = kueche.querySelector('input[type="range"]');
    var sliderOut = kueche.querySelector("[data-k-length]");
    if (slider) slider.addEventListener("input", function () {
      ks.laenge = parseFloat(slider.value);
      if (sliderOut) sliderOut.textContent = ks.laenge.toFixed(1).replace(".", ",") + " m";
      kRender();
    });
    kRender();
  }

  /* ---------- furniture configurator (Möbelbau) ---------- */
  var moebel = document.getElementById("cfg-moebel");
  if (moebel) {
    var ms = { kategorie: "Einbauschrank", breite: 2400, hoehe: 2600, tiefe: 620, holz: "Eiche" };
    var mOut = moebel.querySelector("[data-m-summary]");
    function mRender() {
      mOut.innerHTML =
        "<dt>Kategorie</dt><dd>" + ms.kategorie + "</dd>" +
        "<dt>Masse (B × H × T)</dt><dd>" + ms.breite + " × " + ms.hoehe + " × " + ms.tiefe + " mm</dd>" +
        "<dt>Holzart</dt><dd>" + ms.holz + "</dd>";
    }
    setupSegs(moebel, function (key, val) {
      if (key === "kategorie") ms.kategorie = val;
      if (key === "holz") ms.holz = val;
      mRender();
    });
    moebel.querySelectorAll('input[type="range"]').forEach(function (r) {
      r.addEventListener("input", function () {
        var key = r.getAttribute("data-dim");
        var out = moebel.querySelector('[data-m-out="' + key + '"]');
        ms[key] = parseInt(r.value, 10);
        if (out) out.textContent = ms[key] + " mm";
        mRender();
      });
    });
    mRender();
  }

  /* ---------- window dimensioning tool ---------- */
  var dim = document.getElementById("dimtool");
  if (dim) {
    var d = { typ: "Fenster", b: 1400, h: 2100 };
    var bRange = dim.querySelector('[data-dim="b"]');
    var hRange = dim.querySelector('[data-dim="h"]');
    var bOut = dim.querySelector('[data-out="b"]');
    var hOut = dim.querySelector('[data-out="h"]');
    var cadRect = dim.querySelector("#cad-rect");
    var cadLabel = dim.querySelector("#cad-label");
    var cadArea = dim.querySelector("#cad-area");
    function dRender() {
      var area = (d.b * d.h / 1000000).toFixed(2).replace(".", ",");
      if (bOut) bOut.textContent = d.b + " mm";
      if (hOut) hOut.textContent = d.h + " mm";
      if (cadLabel) cadLabel.textContent = d.b + " × " + d.h + " mm";
      if (cadArea) cadArea.textContent = "Fläche: " + area + " m²";
      if (cadRect) {
        var vw = 300, vh = 380;
        var rw = Math.max(40, Math.round((d.b - 600) / (3600 - 600) * 240 + 40));
        var rh = Math.max(40, Math.round((d.h - 800) / (2800 - 800) * 320 + 40));
        cadRect.setAttribute("x", (vw - rw) / 2);
        cadRect.setAttribute("y", (vh - rh) / 2);
        cadRect.setAttribute("width", rw);
        cadRect.setAttribute("height", rh);
      }
      var typOut = dim.querySelector('[data-out="typ"]');
      if (typOut) typOut.textContent = d.typ;
    }
    if (bRange) bRange.addEventListener("input", function () { d.b = parseInt(bRange.value, 10); dRender(); });
    if (hRange) hRange.addEventListener("input", function () { d.h = parseInt(hRange.value, 10); dRender(); });
    setupSegs(dim, function (key, val) { if (key === "typ") { d.typ = val; dRender(); } });
    dRender();
  }

  /* ---------- machine park tabs (Über uns) ---------- */
  var tabs = document.getElementById("werkstatt-tabs");
  if (tabs) {
    var tabBtns = Array.prototype.slice.call(tabs.querySelectorAll(".tabs button"));
    var panels = Array.prototype.slice.call(tabs.querySelectorAll(".tabpanel"));
    tabBtns.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        tabBtns.forEach(function (b, j) { b.setAttribute("aria-selected", j === i ? "true" : "false"); });
        panels.forEach(function (p, j) { p.classList.toggle("active", j === i); });
      });
    });
  }

  /* ---------- full assistant (Anfrage, 5 steps) ---------- */
  var anfrage = document.getElementById("ai-anfrage");
  if (anfrage) {
    var as = {
      bereich: "Küchenbau nach Mass", masse: "—", material: "Massivholz Eiche natur",
      plaene: "Keine Datei gewählt", name: "—", kontakt: "—"
    };
    var sumDl = document.querySelector("[data-a-summary]");
    var statusEl = document.querySelector("[data-a-status]");
    function aRender() {
      var rows = [
        ["Projektbereich", as.bereich],
        ["Masse (B × H × T)", as.masse],
        ["Materialwunsch", as.material],
        ["Pläne / Fotos", as.plaene],
        ["Kontakt", as.name === "—" ? "Noch nicht vollständig eingegeben" : as.name + " · " + as.kontakt]
      ];
      sumDl.innerHTML = rows.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>"; }).join("");
      var done = as.name !== "—" && as.kontakt !== "—";
      if (statusEl) statusEl.textContent = done ? "Kontaktdaten: vollständig" : "Kontaktdaten: noch nicht vollständig eingegeben";
    }
    setupOptions(anfrage, function (key, val) { if (key === "bereich") { as.bereich = val; aRender(); } });
    setupSegs(anfrage, function (key, val) {
      if (key === "material") { as.material = val; aRender(); }
      if (key === "einbau") { as.einbau = val; aRender(); }
    });
    /* measurements */
    anfrage.querySelectorAll('[data-mass]').forEach(function (inp) {
      inp.addEventListener("input", function () {
        var b = anfrage.querySelector('[data-mass="b"]').value || "—";
        var h = anfrage.querySelector('[data-mass="h"]').value || "—";
        var t = anfrage.querySelector('[data-mass="t"]').value || "—";
        as.masse = b + " mm × " + h + " mm × " + t + " mm";
        aRender();
      });
    });
    /* file mock */
    var fileInput = anfrage.querySelector('input[type="file"]');
    var fileList = anfrage.querySelector(".file-list");
    if (fileInput) fileInput.addEventListener("change", function () {
      var names = Array.prototype.map.call(fileInput.files, function (f) { return f.name; });
      as.plaene = names.length ? names.join(", ") + " (Demo — wird nicht hochgeladen)" : "Keine Datei gewählt";
      if (fileList) fileList.textContent = names.length ? "Gewählt: " + names.join(", ") : "";
      aRender();
    });
    /* contact fields */
    var nameInp = anfrage.querySelector('[name="name"]');
    var mailInp = anfrage.querySelector('[name="email"]');
    var telInp = anfrage.querySelector('[name="telefon"]');
    function contactSync() {
      as.name = nameInp.value.trim() || "—";
      var mail = mailInp.value.trim(), tel = telInp.value.trim();
      as.kontakt = [mail, tel].filter(Boolean).join(" · ") || "—";
      aRender();
    }
    [nameInp, mailInp, telInp].forEach(function (inp) { if (inp) inp.addEventListener("input", contactSync); });
    /* preset from URL ?bereich= */
    var params = new URLSearchParams(window.location.search);
    var preset = params.get("bereich");
    if (preset) {
      var map = { kueche: "Küchenbau nach Mass", moebel: "Möbelbau & Innenausbau", fenster: "Fenster & Türen", petwalk: "Petwalk Hundetür", reparatur: "Reparatur & Service" };
      if (map[preset]) {
        as.bereich = map[preset];
        anfrage.querySelectorAll('[data-opt-group="bereich"] .opt').forEach(function (o) {
          o.setAttribute("aria-checked", o.getAttribute("data-value") === map[preset] ? "true" : "false");
        });
      }
    }
    var aStep = setupStepper(anfrage);
    /* submit with validation */
    var submitBtn = anfrage.querySelector("[data-send]");
    var confirmBox = anfrage.querySelector(".ai-confirm");
    if (submitBtn) submitBtn.addEventListener("click", function () {
      var ok = true;
      function mark(inp, valid) {
        var f = inp.closest(".field");
        if (f) f.classList.toggle("invalid", !valid);
        if (!valid) ok = false;
      }
      mark(nameInp, nameInp.value.trim().length >= 2);
      var hasContact = mailInp.value.trim().length > 3 || telInp.value.trim().length >= 7;
      mark(mailInp, hasContact); mark(telInp, hasContact);
      if (!ok) { aStep.show(4); return; }
      contactSync();
      if (confirmBox) {
        confirmBox.querySelector("[data-confirm-ref]").textContent =
          "REF: GF-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000));
        confirmBox.classList.add("show");
        confirmBox.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
    aRender();
  }

  /* ---------- repair quick assistant (Service page) ---------- */
  var rep = document.getElementById("cfg-reparatur");
  if (rep) {
    var rs = { bauteil: "Tür / Scharnier", problem: "Klemmt / schliesst nicht richtig" };
    var rOut = rep.querySelector("[data-r-summary]");
    function rRender() {
      rOut.innerHTML = "<dt>Bauteil</dt><dd>" + rs.bauteil + "</dd><dt>Problem</dt><dd>" + rs.problem + "</dd>";
    }
    setupSegs(rep, function (key, val) {
      if (key === "bauteil") rs.bauteil = val;
      if (key === "problem") rs.problem = val;
      rRender();
    });
    rRender();
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
