(function () {
  "use strict";
  var CFG = window.CCL_CONFIG || {};
  var form = document.getElementById("regForm");
  var btn = document.getElementById("submitBtn");
  var errBox = document.getElementById("formError");
  var DRAFT_KEY = "ccl27-draft";

  /* ---------- countdown ---------- */
  var cd = document.getElementById("countdown");
  function tick() {
    var ms = new Date(CFG.EVENT_START || "2027-02-06T08:00:00+05:30") - Date.now();
    if (ms <= 0) { cd.innerHTML = "<b>Match day is here!</b> 🏏"; return; }
    var d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24;
    cd.innerHTML = d > 0 ? "<b>" + d + " days</b> to go" : "<b>" + h + " hours</b> to go";
  }
  tick(); setInterval(tick, 60000);

  /* ---------- jersey preview ---------- */
  var pvName = document.getElementById("pvName"), pvNo = document.getElementById("pvNo");
  function preview() {
    pvName.textContent = (form.jerseyName.value.trim() || "YOUR NAME").toUpperCase();
    pvNo.textContent = form.jerseyNo.value.trim() || "00";
  }

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
    gender: function (v) { return !!v || "Please select"; },
    dob: function (v) { return !!v || "Please enter your date of birth"; },
    area: function (v) { return v.length >= 2 || "Please enter your area"; },
    role: function (v) { return !!v || "Please pick your playing role"; },
    batHand: function (v) { return !!v || "Please select"; },
    jerseyName: function (v) { return v.length >= 1 || "Enter the name for your jersey"; },
    jerseyNo: function (v) { return /^\d{1,2}$/.test(v) || "Enter a number from 0 to 99"; },
    tshirt: function (v) { return !!v || "Please select your size"; },
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

  /* ---------- draft (so a refresh doesn't lose typing) ---------- */
  var FIELDS = ["name", "mobile", "email", "gender", "dob", "area", "role", "batHand", "bowlStyle", "jerseyName", "jerseyNo", "tshirt"];
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
  loadDraft(); preview();
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
      var f = w.querySelector("input, select"); if (f) f.focus({ preventScroll: true });
      showError("Please fix the highlighted fields.");
      return;
    }
    if (form.website.value) return; // bot

    var data = { website: "" };
    FIELDS.forEach(function (f) { data[f] = val(f); });
    data.agree = "Yes";

    btn.disabled = true; btn.textContent = "Submitting…";

    send(data).then(function (res) {
      if (!res || !res.ok) throw new Error((res && res.error) || "Something went wrong. Please try again.");
      clearDraft();
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
      return new Promise(function (r) { setTimeout(function () { r({ ok: true, id: "CCL27-DEMO" }); }, 600); });
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
    form.reset(); preview();
    Object.keys(RULES).forEach(function (n) { setError(n, ""); });
    document.getElementById("doneCard").hidden = true;
    document.getElementById("formCard").hidden = false;
    document.getElementById("formCard").scrollIntoView({ behavior: "smooth" });
  });
})();
