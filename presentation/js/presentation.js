/* Mastering Java Streams API: presentation engine.
   No dependencies, no build step, works from file://. */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ------------------------------------------------------------------ */
  /* Java syntax highlighting                                           */
  /* ------------------------------------------------------------------ */

  const KEYWORDS = new Set((
    "abstract assert boolean break byte case catch char class continue default do double else enum extends final " +
    "finally float for if implements import instanceof int interface long new null package private protected public " +
    "record return short static super switch synchronized this throw throws true false try var void while yield"
  ).split(" "));

  const TOKEN = new RegExp(
    [
      "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)",                              // 1 comment
      "(\"\"\"[\\s\\S]*?\"\"\"|\"(?:\\\\.|[^\"\\\\\\n])*\"|'(?:\\\\.|[^'\\\\\\n])')", // 2 string
      "(@\\w+)",                                                            // 3 annotation
      "\\b(\\d[\\d_]*(?:\\.\\d+)?[dDfFlL]?)\\b",                            // 4 number
      "\\b([A-Za-z_]\\w*)\\b(\\s*\\()?"                                     // 5 identifier, 6 call paren
    ].join("|"), "g");

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /** Wrap text in a span, closing and reopening it at every newline so lines can be split later. */
  function span(cls, text) {
    const body = text.split("\n").map(esc).join("</span>\n<span class=\"" + cls + "\">");
    return "<span class=\"" + cls + "\">" + body + "</span>";
  }

  function highlightJava(src) {
    let out = "";
    let last = 0;
    let m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(src))) {
      out += esc(src.slice(last, m.index));
      last = TOKEN.lastIndex;
      if (m[1]) out += span("c", m[1]);
      else if (m[2]) out += span("s", m[2]);
      else if (m[3]) out += span("a", m[3]);
      else if (m[4]) out += span("n", m[4]);
      else {
        const id = m[5];
        const paren = m[6] || "";
        if (KEYWORDS.has(id)) out += span("k", id) + esc(paren);
        else if (/^[A-Z][a-z0-9]/.test(id) || /^[A-Z]$/.test(id)) out += span("t", id) + esc(paren);
        else if (paren) out += span("f", id) + esc(paren);
        else out += esc(id);
      }
    }
    return out + esc(src.slice(last));
  }

  /** Replace every <script type="text/x-java"> with a highlighted <pre>. A trailing "//>" marks a line. */
  function renderCode() {
    $$("script[type='text/x-java'], script[type='text/x-output']").forEach((node) => {
      const isOut = node.type === "text/x-output";
      const lines = node.textContent.replace(/^\n+|\s+$/g, "").split("\n");
      // remove common indentation
      const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
      const marks = [];
      const clean = lines.map((l, i) => {
        l = l.slice(indent);
        if (/\s*\/\/>\s*$/.test(l)) { marks.push(i); l = l.replace(/\s*\/\/>\s*$/, ""); }
        return l;
      });
      const html = (isOut ? esc(clean.join("\n")) : highlightJava(clean.join("\n"))).split("\n");
      const pre = document.createElement("pre");
      pre.className = "code" + (isOut ? " out" : "") + (node.dataset.size ? " " + node.dataset.size : "");
      pre.innerHTML = html.map((h, i) => "<span class=\"ln" + (marks.includes(i) ? " mark" : "") + "\">" + (h || " ") + "</span>").join("");
      if (node.dataset.frag !== undefined) pre.classList.add("frag");
      node.replaceWith(pre);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Value boxes (limit/skip demo, ranges)                              */
  /* ------------------------------------------------------------------ */

  /** <div class="boxes" data-from="0" data-to="14" data-keep="5-9" data-drop="0-4" data-gone="10-14"> */
  function parseRange(spec) {
    const set = new Set();
    (spec || "").split(",").filter(Boolean).forEach((part) => {
      const [a, b] = part.split("-").map(Number);
      for (let i = a; i <= (isNaN(b) ? a : b); i++) set.add(i);
    });
    return set;
  }
  function renderBoxes() {
    $$(".boxes[data-from]").forEach((el) => {
      const keep = parseRange(el.dataset.keep), drop = parseRange(el.dataset.drop), gone = parseRange(el.dataset.gone);
      for (let i = +el.dataset.from; i <= +el.dataset.to; i++) {
        const b = document.createElement("div");
        b.className = "box" + (keep.has(i) ? " keep" : "") + (drop.has(i) ? " drop" : "") + (gone.has(i) ? " gone" : "");
        b.textContent = i;
        el.appendChild(b);
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Deck                                                               */
  /* ------------------------------------------------------------------ */

  const stage = $("#stage");
  const slides = $$("#stage > .slide");
  const progress = $("#progress");
  const counter = $("#counter");
  const crumb = $("#crumb");
  const notesBox = $("#notes");
  const overview = $("#overview");
  const help = $("#help");

  let current = 0;
  let step = 0; // number of revealed fragments on the current slide

  const fragsOf = (slide) => $$(".frag", slide).sort((a, b) => (+a.dataset.order || 0) - (+b.dataset.order || 0));

  function show(index, revealAll) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((s, i) => s.classList.toggle("active", i === current));
    const frags = fragsOf(slides[current]);
    step = revealAll ? frags.length : 0;
    frags.forEach((f, i) => f.classList.toggle("visible", i < step));
    update();
  }

  function next() {
    const frags = fragsOf(slides[current]);
    if (step < frags.length) {
      frags[step].classList.add("visible");
      step++;
      update(true);
    } else if (current < slides.length - 1) show(current + 1, false);
  }

  function prev() {
    const frags = fragsOf(slides[current]);
    if (step > 0) {
      step--;
      frags[step].classList.remove("visible");
      update(true);
    } else if (current > 0) show(current - 1, true);
  }

  function update(fragOnly) {
    if (!fragOnly) {
      try { history.replaceState(null, "", "#" + (current + 1)); } catch (e) { /* file:// in some browsers */ }
    }
    progress.style.width = ((current + 1) / slides.length * 100) + "%";
    counter.textContent = (current + 1) + " / " + slides.length;
    const slide = slides[current];
    crumb.textContent = slide.dataset.section || "";
    const note = $("aside.notes", slide);
    $("#notes .body").innerHTML = note ? note.innerHTML : "<em>No notes for this slide.</em>";
    document.title = (slide.dataset.title || "Presentation") + " · Mastering Java Streams API";
  }

  /* scale the 1280x720 stage to the window */
  function fit() {
    const s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    stage.style.transform = "translate(-50%, -50%) scale(" + s + ")";
  }

  /* ---------------- overview + help ---------------- */

  function buildOverview() {
    const wrap = $("#overview .list");
    wrap.innerHTML = "";
    let sec = null, items = null, lastSection = null;
    slides.forEach((s, i) => {
      const name = s.dataset.section || "Start";
      if (name !== lastSection) {
        sec = document.createElement("div");
        sec.className = "sec";
        sec.innerHTML = "<h3></h3><div class=\"items\"></div>";
        $("h3", sec).textContent = name;
        items = $(".items", sec);
        wrap.appendChild(sec);
        lastSection = name;
      }
      const b = document.createElement("button");
      b.innerHTML = "<span class=\"i\">" + (i + 1) + "</span>";
      b.appendChild(document.createTextNode(s.dataset.title || "Slide " + (i + 1)));
      if (i === current) b.className = "cur";
      b.addEventListener("click", () => { toggle(overview, false); show(i, false); });
      items.appendChild(b);
    });
  }

  function toggle(panel, on) {
    const state = on === undefined ? !panel.classList.contains("on") : on;
    if (state && panel === overview) buildOverview();
    if (state) { overview.classList.toggle("on", panel === overview); help.classList.toggle("on", panel === help); }
    else panel.classList.remove("on");
  }

  function fullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }

  function theme() {
    const root = document.documentElement;
    const light = root.dataset.theme !== "light";
    root.dataset.theme = light ? "light" : "dark";
    try { localStorage.setItem("streams-theme", root.dataset.theme); } catch (e) { /* ignore */ }
  }

  /* ---------------- input ---------------- */

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const overlayOpen = overview.classList.contains("on") || help.classList.contains("on");
    switch (e.key) {
      case "Escape": toggle(overview, false); toggle(help, false); return;
      case "o": case "O": toggle(overview); return;
      case "?": case "h": case "H": toggle(help); return;
      case "n": case "N": notesBox.classList.toggle("on"); return;
      case "f": case "F": fullscreen(); return;
      case "t": case "T": theme(); return;
    }
    if (overlayOpen) return;
    switch (e.key) {
      case "ArrowRight": case "ArrowDown": case "PageDown": case " ": case "Enter": e.preventDefault(); next(); break;
      case "ArrowLeft": case "ArrowUp": case "PageUp": case "Backspace": e.preventDefault(); prev(); break;
      case "Home": show(0, false); break;
      case "End": show(slides.length - 1, true); break;
    }
  });

  // click on the right/left edge of the stage to move; ignore clicks on links and buttons
  document.addEventListener("click", (e) => {
    if (e.target.closest("a, button, #overview, #help, #notes")) return;
    if (e.clientX > window.innerWidth * 0.5) next(); else prev();
  });

  // touch swipe
  let touchX = null;
  document.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    touchX = null;
  });

  window.addEventListener("resize", fit);
  window.addEventListener("hashchange", () => {
    const n = parseInt(location.hash.slice(1), 10);
    if (!isNaN(n) && n - 1 !== current) show(n - 1, false);
  });

  /* ---------------- start ---------------- */

  try {
    const saved = localStorage.getItem("streams-theme");
    if (saved) document.documentElement.dataset.theme = saved;
  } catch (e) { /* ignore */ }

  renderCode();
  renderBoxes();
  fit();
  const start = parseInt(location.hash.slice(1), 10);
  show(isNaN(start) ? 0 : start - 1, false);
})();
