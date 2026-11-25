(function () {
  "use strict";
  var CFG = window.CCL_CONFIG || {};
  var form = document.getElementById("regForm");
  var btn = document.getElementById("submitBtn");
  var errBox = document.getElementById("formError");

  /* ---------- which form: boys or girls ---------- */
  // Picking Boys/Girls switches the form in place (no page reload), so the welcome
  // screen isn't shown again and the music keeps playing.
  var CATS = { boys: "Boys", girls: "Girls" };
  var catKey = "", CAT = "", DRAFT_KEY = "ccl27-draft-none";
  var BASE_TITLE = document.title;
  var formReady = false; // set once the form code below has run
  var chooseCard = document.getElementById("chooseCard"), formCard = document.getElementById("formCard");

  function urlCat() { return (new URLSearchParams(location.search).get("for") || "").toLowerCase(); }
  function applyCat(key) {
    catKey = CATS[key] ? key : "";
    CAT = CATS[catKey] || "";
    DRAFT_KEY = "ccl27-draft-" + (catKey || "none");
    chooseCard.hidden = !!CAT;
    formCard.hidden = !CAT;
    document.getElementById("doneCard").hidden = true;
    formCard.classList.remove("cat-boys", "cat-girls");
    if (CAT) {
      var other = catKey === "boys" ? "girls" : "boys";
      formCard.classList.add("cat-" + catKey);
      document.getElementById("catTag").textContent = CAT + " form";
      document.getElementById("formTitle").textContent = CAT + "' Registration";
      document.getElementById("switchLine").innerHTML =
        "Registering a " + (other === "girls" ? "girl" : "boy") + '? Use the <a href="?for=' + other +
        '#register" data-cat="' + other + '">' + CATS[other] + "' form</a>.";
      document.title = CAT + "' Registration · Majestique CCL 2027";
    } else {
      document.title = BASE_TITLE;
    }
    if (formReady) resetForm(true);
  }
  applyCat(urlCat());

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-cat]");
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    var key = a.getAttribute("data-cat");
    try { history.pushState(null, "", "?for=" + key + "#register"); } catch (err) {}
    applyCat(key);
    formCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  window.addEventListener("popstate", function () { applyCat(urlCat()); });

  /* ---------- countdown ---------- */
  var cd = document.getElementById("countdown");
  function tick() {
    var ms = new Date(CFG.EVENT_START || "2027-02-06T08:00:00+05:30") - Date.now();
    if (ms <= 0) { cd.innerHTML = "<b>Match day is here!</b> 🏏"; return; }
    var d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24;
    cd.innerHTML = d > 0 ? "<b>" + d + " days</b> to go" : "<b>" + h + " hours</b> to go";
  }
  tick(); setInterval(tick, 60000);

  /* ---------- title sponsor ---------- */
  var SP = CFG.TITLE_SPONSOR || {};
  (function sponsor() {
    var name = (SP.NAME || "").trim();
    if (!name) return;
    document.getElementById("sponsorNameTop").textContent = name;
    document.getElementById("sponsorName").textContent = name;
    document.getElementById("sponsorTag").textContent = SP.TAGLINE || "";
    document.getElementById("sponsorFoot").textContent = " · Title sponsor " + name;
    if (SP.LOGO) {
      ["sponsorLogoTop", "sponsorLogo"].forEach(function (id) {
        var img = document.getElementById(id);
        img.src = SP.LOGO; img.alt = name; img.hidden = false;
      });
      document.getElementById("sponsorNameTop").hidden = true; // logo says it
    }
  })();

  /* ---------- music ---------- */
  var audio = document.getElementById("anthem");
  var mBtn = document.getElementById("musicBtn"), mLbl = document.getElementById("musicLbl");
  function musicUI(on) {
    mBtn.classList.toggle("on", on);
    mBtn.setAttribute("aria-pressed", on ? "true" : "false");
    mLbl.textContent = on ? "Music on" : "Music";
    mBtn.setAttribute("aria-label", on ? "Stop music" : "Play music");
  }
  function startMusic() {
    audio.volume = 0.6;
    var p = audio.play();
    if (p && p.catch) p.catch(function () { musicUI(false); });
  }
  mBtn.addEventListener("click", function () {
    if (audio.paused) startMusic(); else audio.pause();
  });

  /* ---------- welcome screen ----------
     Phones only allow sound after the visitor taps something. The big button on
     the welcome screen is that tap: it starts the anthem and opens the page. */
  var gate = document.getElementById("gate");
  function openSite(withMusic) {
    if (withMusic) startMusic();
    document.documentElement.classList.remove("gated");
    gate.classList.add("leaving");
    setTimeout(function () { gate.remove(); }, 600);
    var main = document.querySelector(".hero");
    if (main) { main.setAttribute("tabindex", "-1"); main.focus({ preventScroll: true }); }
  }
  if (gate) {
    document.getElementById("gateGo").addEventListener("click", function () { openSite(true); });
    document.getElementById("gateQuiet").addEventListener("click", function () { openSite(false); });
    gate.addEventListener("keydown", function (e) { if (e.key === "Escape") openSite(false); });
  }
  audio.addEventListener("play", function () { musicUI(true); });
  audio.addEventListener("pause", function () { musicUI(false); });

  /* ---------- live ticker of registered players ---------- */
  var run = document.getElementById("tickerRun");
  var rail = document.getElementById("rail"), railRun = document.getElementById("railRun");
  // "Rahul Patil" -> "Rahul P" (fits under a jersey)
  function shortName(n) {
    var w = String(n || "").trim().split(/\s+/);
    return w.length > 1 ? w[0] + " " + w[w.length - 1].charAt(0).toUpperCase() : w[0];
  }
  function renderRail(list) {
    if (!list.length) { rail.hidden = true; return; }
    var one = list.map(function (p) {
      var no = String(p.j == null ? "" : p.j).trim();
      return "<figure class=\"kit\"><svg viewBox=\"0 0 100 118\"><use href=\"#jersey\"/></svg>" +
        "<span class=\"kit-no\">" + esc(no) + "</span><figcaption>" + esc(shortName(p.n)) + "</figcaption></figure>";
    }).join("");
    // repeat short lists so the rail is always wider than the screen, then double it for a seamless loop
    var reps = Math.max(1, Math.ceil(16 / list.length));
    var block = new Array(reps + 1).join(one);
    railRun.innerHTML = "<div>" + block + "</div><div aria-hidden=\"true\">" + block + "</div>";
    rail.hidden = false;
    railRun.style.animationDuration = Math.max(20, railRun.firstChild.scrollWidth / 45) + "s";
  }
  var countEl = document.getElementById("regCount");
  var players = [];          // [{n: name, j: jersey no, r: role, p: Playing/Non-playing}]
  var SAMPLES = (CFG.SAMPLE_PLAYERS || []).map(function (x) { return { n: x.name, j: x.no, r: x.role, p: x.playing }; });
  var HIDE_SAMPLES_AFTER = CFG.HIDE_SAMPLES_AFTER == null ? 10 : CFG.HIDE_SAMPLES_AFTER;
  var total = null;
  var mine = [];             // registered from this page, shown before the server catches up

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var ROLE_ICO = { "Batter": "🏏", "Bowler": "🎯", "All-rounder": "⚡", "Wicket-keeper": "🧤" };

  function renderTicker() {
    var seen = {}, list = [];
    mine.concat(players).forEach(function (p) {
      var k = (p.n || "").toLowerCase();
      if (k && !seen[k]) { seen[k] = 1; list.push(p); }
    });
    var n = Math.max(total || 0, list.length); // real registrations only (samples are not counted)
    if (n < HIDE_SAMPLES_AFTER) {
      SAMPLES.forEach(function (p) {
        var k = (p.n || "").toLowerCase();
        if (k && !seen[k]) { seen[k] = 1; list.push(p); }
      });
    }
    var items = ["Majestique Colours Cricket League 2027", "6th & 7th Feb 2027 · Player auction"];
    if ((SP.NAME || "").trim()) items.push("Title sponsor · " + SP.NAME.trim());
    if (n) items.push(n + (n === 1 ? " player" : " players") + " registered");
    else items.push("Registrations open");
    var html = items.map(function (t) { return "<span class=\"tk-msg\">" + esc(t) + "</span>"; });
    if (list.length) {
      html.push("<span class=\"tk-msg\">Welcome to the auction pool</span>");
      list.forEach(function (p) {
        var ico = p.p === "Non-playing" ? "🙌" : (ROLE_ICO[p.r] || "🏏");
        var tag = p.p === "Non-playing" ? "Non-playing" : (p.r || "");
        var no = String(p.j == null ? "" : p.j).trim();
        html.push("<span class=\"tk-name\">" + ico + " " + esc(p.n) + (no ? " <b class=\"tk-no\">#" + esc(no) + "</b>" : "") + (tag ? " <small>" + esc(tag) + "</small>" : "") + "</span>");
      });
    }
    renderRail(list);
    var one = html.join("<em>●</em>") + "<em>●</em>";
    run.innerHTML = "<div>" + one + "</div><div aria-hidden=\"true\">" + one + "</div>";
    // constant speed (~70px/s) however long the list gets
    var w = run.firstChild.scrollWidth;
    run.style.animationDuration = Math.max(20, w / 70) + "s";
    if (n) {
      countEl.textContent = n + (n === 1 ? " Player" : " Players");
      document.getElementById("regCountSub").textContent = "registered so far";
    }
  }

  function loadPlayers() {
    if (!CFG.SCRIPT_URL || document.hidden) return;
    fetch(CFG.SCRIPT_URL + "?action=list", { method: "GET" })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res || !res.ok || !Array.isArray(res.players)) return;
        players = res.players;
        total = res.count;
        // drop local entries once the server list includes them
        mine = mine.filter(function (m) { return !players.some(function (p) { return (p.n || "").toLowerCase() === m.n.toLowerCase(); }); });
        renderTicker();
      })
      .catch(function () { /* keep showing what we have */ });
  }
  renderTicker();
  loadPlayers();
  setInterval(loadPlayers, Math.max(10, CFG.TICKER_REFRESH || 30) * 1000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) loadPlayers(); });

  /* ---------- jersey preview ---------- */
  var pvName = document.getElementById("pvName"), pvNo = document.getElementById("pvNo");
  // shrink long names so they always fit across the back of the shirt
  function fit(el, max) {
    el.removeAttribute("textLength"); el.removeAttribute("lengthAdjust");
    try {
      if (el.getComputedTextLength() > max) {
        el.setAttribute("textLength", max); el.setAttribute("lengthAdjust", "spacingAndGlyphs");
      }
    } catch (e) {}
  }
  function preview() {
    pvName.textContent = (form.jerseyName.value.trim() || "YOUR NAME").toUpperCase();
    pvNo.textContent = form.jerseyNo.value.trim() || "00";
    fit(pvName, 104);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { preview(); });

  /* ---------- size chart: highlight the chosen size, tap a row to choose ---------- */
  var sizeRows = Array.prototype.slice.call(document.querySelectorAll(".sc-table tbody tr"));
  function markSize() {
    var v = form.elements.tshirt.value;
    sizeRows.forEach(function (r) { r.classList.toggle("on", r.getAttribute("data-size") === v); });
  }
  sizeRows.forEach(function (r) {
    r.addEventListener("click", function () {
      form.elements.tshirt.value = r.getAttribute("data-size");
      form.elements.tshirt[0].dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
  form.addEventListener("change", markSize);

  /* ---------- playing / non-playing ---------- */
  var playOnly = document.getElementById("playOnly");
  function isPlaying() { return val("playing") !== "Non-playing"; }
  function syncPlaying() {
    playOnly.hidden = !isPlaying();
    if (!isPlaying()) { setError("role", ""); setError("batHand", ""); }
  }
  Array.prototype.forEach.call(form.elements.playing, function (r) { r.addEventListener("change", syncPlaying); });

  /* ---------- photo (resized in the browser to a 480px square JPEG) ---------- */
  var photoData = "";
  var phImg = document.getElementById("phImg"), phPh = document.getElementById("phPh"), phClear = document.getElementById("phClear");
  var PHOTO_MAX_MB = 15;

  function setPhoto(dataUrl) {
    photoData = dataUrl || "";
    phImg.hidden = !photoData; phPh.hidden = !!photoData; phClear.hidden = !photoData;
    if (photoData) phImg.src = photoData; else phImg.removeAttribute("src");
    setError("photo", "");
  }
  function onPhoto(ev) {
    var file = ev.target.files && ev.target.files[0];
    ev.target.value = "";
    if (!file) return;
    if (!/^image\//.test(file.type)) { setError("photo", "Please pick an image file"); return; }
    if (file.size > PHOTO_MAX_MB * 1048576) { setError("photo", "That photo is too large (max " + PHOTO_MAX_MB + " MB)"); return; }
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      var S = 480, side = Math.min(img.naturalWidth, img.naturalHeight);
      var sx = (img.naturalWidth - side) / 2;
      var sy = Math.max(0, (img.naturalHeight - side) / 2 - side * 0.12); // keep the head in frame for portraits
      var c = document.createElement("canvas"); c.width = S; c.height = S;
      var g = c.getContext("2d");
      g.fillStyle = "#fff"; g.fillRect(0, 0, S, S);
      g.drawImage(img, sx, sy, side, side, 0, 0, S, S);
      URL.revokeObjectURL(url);
      setPhoto(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = function () { URL.revokeObjectURL(url); setError("photo", "Couldn't read that photo. Try another one."); };
    img.src = url;
  }
  document.getElementById("photo").addEventListener("change", onPhoto);
  document.getElementById("photoCam").addEventListener("change", onPhoto);
  phClear.addEventListener("click", function () { setPhoto(""); });

  /* ---------- input clean-up ---------- */
  form.mobile.addEventListener("input", function () { this.value = this.value.replace(/\D/g, "").slice(0, 10); });
  form.jerseyNo.addEventListener("input", function () { this.value = this.value.replace(/\D/g, "").slice(0, 2); });
  form.jerseyName.addEventListener("input", function () {
    var p = this.selectionStart;
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9 .'-]/g, "");
    this.setSelectionRange(p, p);
  });

  /* ---------- validation ---------- */
  var RULES = {
    name: function (v) { return v.length >= 2 || "Please enter your full name"; },
    mobile: function (v) { return /^[6-9]\d{9}$/.test(v) || "Enter a valid 10-digit mobile number"; },
    email: function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email or leave it blank"; },
    playing: function (v) { return !!v || "Please select"; },
    practice: function (v) { return !!v || "Please select"; },
    role: function (v) { return !isPlaying() || !!v || "Please pick your playing role"; },
    batHand: function (v) { return !isPlaying() || !!v || "Please select"; },
    jerseyName: function (v) { return v.length >= 1 || "Enter the name for your jersey"; },
    jerseyNo: function (v) { return /^\d{1,2}$/.test(v) || "Enter a number from 0 to 99"; },
    tshirt: function (v) { return !!v || "Please pick your T-shirt size (see the size chart below)"; },
    agree: function (v) { return v === "Yes" || "Please accept the declaration"; }
  };

  function val(name) {
    var el = form.elements[name];
    if (!el) return "";
    if (el instanceof RadioNodeList) return el.value || "";
    if (el.type === "checkbox") return el.checked ? el.value : "";
    return (el.value || "").trim();
  }
  function wrapperOf(name) {
    if (name === "photo") return document.querySelector(".photo-field");
    var el = form.elements[name];
    var first = el instanceof RadioNodeList ? el[0] : el;
    return first.closest(".field") || first.closest(".agree") || first.parentElement;
  }
  function setError(name, msg) {
    var w = wrapperOf(name);
    var m = w.querySelector(":scope > .msg");
    if (msg) {
      w.classList.add("invalid");
      if (!m) { m = document.createElement("span"); m.className = "msg"; w.appendChild(m); }
      m.textContent = msg;
    } else {
      w.classList.remove("invalid");
      if (m) m.remove();
    }
  }
  function check(name) {
    var r = RULES[name](val(name));
    setError(name, r === true ? "" : r);
    return r === true;
  }

  Object.keys(RULES).forEach(function (name) {
    var el = form.elements[name];
    var list = el instanceof RadioNodeList ? Array.prototype.slice.call(el) : [el];
    list.forEach(function (e) {
      // re-check only while a field is already marked invalid, so errors clear as you type
      // (no checks on blur: a message vanishing mid-tap shifts the layout and the tap misses)
      function recheck() { if (wrapperOf(name).classList.contains("invalid")) check(name); }
      e.addEventListener("input", recheck);
      e.addEventListener("change", recheck);
    });
  });

  /* ---------- draft (so a refresh doesn't lose typing; the photo is not kept) ---------- */
  var FIELDS = ["name", "mobile", "email", "playing", "practice", "role", "batHand", "jerseyName", "jerseyNo", "tshirt", "comments"];
  function saveDraft() {
    var d = {}; FIELDS.forEach(function (f) { d[f] = val(f); });
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch (e) {}
  }
  function loadDraft() {
    var d; try { d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch (e) {}
    if (!d) return;
    FIELDS.forEach(function (f) { if (d[f] && form.elements[f]) form.elements[f].value = d[f]; });
  }
  function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} }
  // clears the form; with loadSaved, brings back this category's unsent draft
  function resetForm(loadSaved) {
    form.reset(); setPhoto(""); showError("");
    Object.keys(RULES).forEach(function (n) { setError(n, ""); });
    if (loadSaved && CAT) loadDraft();
    preview(); syncPlaying(); markSize();
  }
  if (CAT) loadDraft();
  preview(); syncPlaying(); markSize();
  formReady = true;
  form.addEventListener("input", function () { preview(); saveDraft(); });
  form.addEventListener("change", saveDraft);

  /* ---------- submit ---------- */
  function showError(msg) { errBox.textContent = msg; errBox.hidden = !msg; }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    showError("");
    var bad = Object.keys(RULES).filter(function (n) { return !check(n); });
    if (bad.length) {
      var w = wrapperOf(bad[0]);
      w.scrollIntoView({ behavior: "smooth", block: "center" });
      var f = w.querySelector("input, select, textarea"); if (f) f.focus({ preventScroll: true });
      showError("Please fix the highlighted fields.");
      return;
    }
    if (form.website.value) return; // bot

    var data = { website: "" };
    FIELDS.forEach(function (f) { data[f] = val(f); });
    if (!isPlaying()) { data.role = ""; data.batHand = ""; }
    data.photo = photoData;
    data.agree = "Yes";
    data.category = CAT;

    btn.disabled = true; btn.textContent = photoData ? "Uploading photo…" : "Submitting…";

    send(data).then(function (res) {
      if (!res || !res.ok) throw new Error((res && res.error) || "Something went wrong. Please try again.");
      clearDraft();
      mine.unshift({ n: data.name, j: data.jerseyNo, r: data.role, p: data.playing });
      if (total !== null) total++;
      renderTicker();
      setTimeout(loadPlayers, 3000);
      done(data.name, res.id);
    }).catch(function (e) {
      showError(e.message || "Network problem. Please check your internet and try again.");
    }).then(function () {
      btn.disabled = false; btn.textContent = "Submit registration";
    });
  });

  function send(data) {
    if (!CFG.SCRIPT_URL) {
      console.warn("DEMO mode: SCRIPT_URL is empty in config.js, nothing was saved.", data);
      return new Promise(function (r) { setTimeout(function () { r({ ok: true, id: "CCL27-" + CAT.charAt(0) + "-DEMO" }); }, 600); });
    }
    // text/plain keeps this a "simple" request so Google Apps Script accepts it without a CORS preflight
    return fetch(CFG.SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); });
  }

  function done(name, id) {
    document.getElementById("formCard").hidden = true;
    var card = document.getElementById("doneCard");
    document.getElementById("doneName").textContent = name;
    document.getElementById("doneId").textContent = id;
    card.hidden = false;
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    card.focus({ preventScroll: true });
  }

  document.getElementById("againBtn").addEventListener("click", function () {
    resetForm(false);
    document.getElementById("doneCard").hidden = true;
    document.getElementById("formCard").hidden = false;
    document.getElementById("formCard").scrollIntoView({ behavior: "smooth" });
  });
})();
