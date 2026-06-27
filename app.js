/* ===========================================================
   Renderer — reads window.CONFIG (config.js) and builds the page.
   No frameworks, no build step.
   =========================================================== */
(function () {
  "use strict";

  var cfg = window.CONFIG || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // work categories split between the two columns: a category flagged
  // `rail: true` — and every category after it — renders in the left rail
  // (below the snippets) instead of the main content column.
  var allWork = (cfg.work || []).filter(Boolean);
  var railStart = allWork.findIndex(function (g) { return g && g.rail; });
  var contentWork = railStart < 0 ? allWork : allWork.slice(0, railStart);
  var railWork    = railStart < 0 ? []      : allWork.slice(railStart);

  var $rail    = document.getElementById("rail");
  var $content = document.getElementById("content");
  var $topId   = document.getElementById("topbar-id");
  var $clock   = document.getElementById("clock");
  var $tz      = document.getElementById("tz");

  /* ---- helpers ----------------------------------------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function external(url) { return url && !/^(mailto:|tel:|#)/.test(url); }

  // compact number: 145083 -> "145k", 73728423 -> "73.7m"
  function compact(n) {
    n = Number(n) || 0;
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "b";
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "m";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
    return String(n);
  }

  /* ---- brand icons (inline SVG paths, 24x24 viewBox) --- */
  var ICONS = {
    telegram: "M21.95 4.3 18.7 19.6c-.24 1.08-.88 1.35-1.78.84l-4.92-3.63-2.37 2.28c-.26.26-.48.48-.99.48l.35-5.02 9.13-8.25c.4-.35-.09-.55-.61-.2L6.63 13.2 1.78 11.7c-1.05-.33-1.07-1.05.22-1.56l18.96-7.3c.88-.32 1.65.2 1.36 1.46z",
    x:        "M18.24 2.25h3.31l-7.23 8.26L22.83 21.75h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z",
    twitter:  "M18.24 2.25h3.31l-7.23 8.26L22.83 21.75h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z",
    roblox:   "M18.93 24 0 18.89 5.07 0 24 5.11 18.93 24zM15.35 10.5l-4.46-1.2-1.19 4.45 4.46 1.2 1.19-4.45z",
    github:   "M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z",
    discord:  "M20.32 4.37A19.8 19.8 0 0 0 15.4 2.8a.07.07 0 0 0-.08.04c-.21.38-.45.88-.62 1.27a18.3 18.3 0 0 0-5.4 0 12.6 12.6 0 0 0-.63-1.27.08.08 0 0 0-.08-.04c-1.71.3-3.35.81-4.88 1.57a.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.05 19.9 19.9 0 0 0 6 3.03.08.08 0 0 0 .09-.03c.46-.63.87-1.3 1.23-2a.08.08 0 0 0-.04-.11c-.65-.25-1.27-.55-1.87-.9a.08.08 0 0 1-.01-.13l.37-.29a.07.07 0 0 1 .08-.01 14.2 14.2 0 0 0 12.06 0 .07.07 0 0 1 .08.01l.37.29a.08.08 0 0 1-.01.13c-.6.35-1.22.65-1.87.9a.08.08 0 0 0-.04.11c.36.7.78 1.36 1.23 1.99a.08.08 0 0 0 .09.04 19.8 19.8 0 0 0 6.02-3.03.08.08 0 0 0 .03-.05c.5-5.18-.84-9.67-3.54-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42z",
    youtube:  "M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z",
    email:    "M2 4h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm10 7L2.2 5.4 12 11l9.8-5.6L12 11z",
  };
  // Official Roblox verified badge (exact SVG from Roblox Corp via Wikimedia Commons)
  var VERIFIED_BADGE =
    "<svg class='verified' viewBox='0 0 28 28' fill='none' role='img' aria-label='Verified'>" +
    "<g clip-path='url(#rbxvb)'>" +
    "<rect x='5.88818' width='22.89' height='22.89' transform='rotate(15 5.88818 0)' fill='#0066FF'/>" +
    "<path fill-rule='evenodd' clip-rule='evenodd' d='M20.543 8.7508L20.549 8.7568C21.15 9.3578 21.15 10.3318 20.549 10.9328L11.817 19.6648L7.45 15.2968C6.85 14.6958 6.85 13.7218 7.45 13.1218L7.457 13.1148C8.058 12.5138 9.031 12.5138 9.633 13.1148L11.817 15.2998L18.367 8.7508C18.968 8.1498 19.942 8.1498 20.543 8.7508Z' fill='white'/>" +
    "</g>" +
    "<defs><clipPath id='rbxvb'><rect width='28' height='28' fill='white'/></clipPath></defs>" +
    "</svg>";

  function iconSvg(label) {
    var key = String(label || "").toLowerCase().trim();
    var path = ICONS[key];
    if (!path) return "";
    return "<svg class='c-icon' viewBox='0 0 24 24' aria-hidden='true'><path d='" + path + "'/></svg>";
  }

  /* ---- accent override --------------------------------- */
  if (cfg.accent) document.documentElement.style.setProperty("--accent", cfg.accent);

  /* ---- top bar: brand + live clock for a fixed place --- */
  $topId.textContent = cfg.brand || cfg.name || "Portfolio";

  var TZ = cfg.timezone || "Asia/Almaty";

  // build the timezone label with its GMT offset, e.g. "Almaty, Kazakhstan (GMT+5)"
  (function () {
    var label = cfg.timeLabel || "";
    try {
      var off = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "shortOffset" })
        .formatToParts(new Date()).find(function (p) { return p.type === "timeZoneName"; });
      if (off) label += (label ? " " : "") + off.value;
    } catch (e) {}
    $tz.textContent = label;
  })();

  function tick() {
    try {
      $clock.textContent = new Date().toLocaleTimeString("en-US", {
        timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true,
      }).replace(/\s/g, "").toUpperCase();
    } catch (e) {
      var d = new Date();
      var h = d.getHours(), ap = h < 12 ? "AM" : "PM";
      h = h % 12 || 12;
      $clock.textContent = h + ":" + String(d.getMinutes()).padStart(2, "0") + ap;
    }
  }
  tick(); setInterval(tick, 1000);

  /* ---- announcements tab ------------------------------- */
  (function announcements() {
    var items = (cfg.announcements || []).filter(Boolean);
    var wrap = document.getElementById("announce");
    if (!wrap) return;

    var btn = document.getElementById("announce-btn");
    var pop = document.getElementById("announce-pop");

    var empty = !items.length;
    var list = empty ? ["nothing so far"] : items;
    list.forEach(function (a) {
      var line = document.createElement("div");
      line.className = empty ? "announce-item announce-empty" : "announce-item";
      line.setAttribute("role", "menuitem");
      line.textContent = a;
      pop.appendChild(line);
    });
    wrap.hidden = false;

    function open()  { pop.hidden = false; btn.setAttribute("aria-expanded", "true"); }
    function close() { pop.hidden = true;  btn.setAttribute("aria-expanded", "false"); }
    btn.addEventListener("click", function (e) { e.stopPropagation(); pop.hidden ? open() : close(); });
    document.addEventListener("click", function (e) { if (!wrap.contains(e.target)) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  })();

  /* ---- left rail: identity + contact ------------------- */
  function buildRail() {
    var f = document.createDocumentFragment();

    // heading: the name if set, otherwise the role acts as the heading
    var heading = cfg.name || cfg.role;
    if (heading) f.appendChild(el("h1", "name reveal", esc(heading)));
    // only show role as a separate line when there's also a name above it
    if (cfg.name && (cfg.role || cfg.tagline)) {
      f.appendChild(el("p", "role reveal", esc(cfg.role || cfg.tagline)));
    }
    if (cfg.now) {
      var now = el("div", "now reveal");
      now.appendChild(el("span", "now-dot"));
      now.appendChild(document.createTextNode(cfg.now));
      f.appendChild(now);
    }

    var contact = el("nav", "contact reveal");
    (cfg.socials || []).forEach(function (s) {
      var a = el("a");
      a.href = s.url || "#";
      if (external(s.url)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
      a.innerHTML =
        iconSvg(s.label) +
        "<span class='c-label'>" + esc(s.label) + "</span>" +
        "<span class='c-handle'>" + esc(s.handle || s.url || "") + "</span>" +
        "<span class='c-arrow' aria-hidden='true'>" + (external(s.url) ? "↗" : "→") + "</span>";
      contact.appendChild(a);
    });
    f.appendChild(contact);

    var form = buildContactForm();
    if (form) f.appendChild(form);

    // code snippets fill the rail below the contact form
    var snips = (cfg.snippets || []).filter(Boolean);
    if (snips.length) {
      var sb = el("div", "rail-snippets");
      sb.appendChild(el("div", "eyebrow", snips.length > 1 ? "Code snippets" : "Code snippet"));
      var swrap = el("div", "snippets");
      snips.forEach(function (s) { swrap.appendChild(buildSnippet(s)); });
      sb.appendChild(swrap);
      f.appendChild(sb);
    }

    // work categories flagged for the rail (e.g. websites) live below snippets
    if (railWork.length) {
      var rw = el("div", "rail-work");
      railWork.forEach(function (group) {
        var wk = buildWorkSection(group);
        if (wk) rw.appendChild(wk);
      });
      if (rw.firstChild) f.appendChild(rw);
    }

    $rail.appendChild(f);
  }

  /* ---- contact form (emails via Web3Forms, no backend) -- */
  function buildContactForm() {
    var c = cfg.contact || {};
    if (!c) return null;
    var key = (c.accessKey || "").trim();
    var keyReady = key && !/PASTE/i.test(key);

    var form = el("form", "cform reveal");
    form.setAttribute("novalidate", "");

    var ta = document.createElement("textarea");
    ta.name = "message"; ta.rows = 4; ta.required = true;
    ta.placeholder = "your message";
    form.appendChild(ta);

    var soc = document.createElement("input");
    soc.type = "text"; soc.name = "socials";
    soc.placeholder = "your socials so i can add you back";
    form.appendChild(soc);

    // honeypot — bots fill this, humans never see it
    var honey = document.createElement("input");
    honey.type = "text"; honey.name = "_honey"; honey.tabIndex = -1;
    honey.autocomplete = "off"; honey.setAttribute("aria-hidden", "true");
    honey.className = "cform-honey";
    form.appendChild(honey);

    var btn = el("button", "cform-btn", esc(c.button || "send message"));
    btn.type = "submit";
    form.appendChild(btn);

    if (c.note) form.appendChild(el("p", "cform-note", esc(c.note)));
    var status = el("p", "cform-status"); status.hidden = true;
    form.appendChild(status);

    function setStatus(msg, kind) {
      status.textContent = msg; status.hidden = false;
      status.className = "cform-status " + (kind === "ok" ? "ok" : "err");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (honey.value) return;                       // silently drop bots
      if (!keyReady) { setStatus("form isnt set up yet add your web3forms key in config", "err"); return; }
      if (!ta.value.trim()) { setStatus("please write a message first", "err"); ta.focus(); return; }

      var orig = btn.textContent;
      btn.disabled = true; btn.textContent = "sending";

      var data = new FormData();
      data.append("access_key", key);
      data.append("subject", "New message from your portfolio");
      data.append("from_name", "Portfolio contact");
      data.append("message", ta.value.trim());
      if (soc.value.trim()) data.append("socials", soc.value.trim());

      fetch("https://api.web3forms.com/submit", {
        method: "POST", headers: { "Accept": "application/json" }, body: data,
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && res.success) {
            form.reset(); setStatus("thanks your message was sent", "ok");
          } else {
            setStatus("couldnt send try again or reach me on a social", "err");
          }
        })
        .catch(function () {
          setStatus("couldnt send right now try a social instead", "err");
        })
        .then(function () { btn.disabled = false; btn.textContent = orig; });
    });

    return form;
  }

  /* ---- enriched Roblox game card ----------------------- */
  function placeIdFromUrl(url) {
    var m = String(url || "").match(/roblox\.com\/games\/(\d+)/);
    return m ? m[1] : null;
  }
  function buildGameCard(p, g) {
    var card = el("a", "proj game");
    card.href = p.url;
    card.target = "_blank"; card.rel = "noopener noreferrer";

    if (g.thumb) {
      var img = el("img", "game-thumb");
      img.src = g.thumb; img.loading = "lazy"; img.alt = "";
      card.appendChild(img);
    } else {
      card.appendChild(el("span", "game-thumb game-thumb--empty"));
    }

    var body = el("div", "game-body");
    var top = el("div", "proj-top");
    top.appendChild(el("span", "proj-title", esc(p.title || g.name)));
    top.appendChild(el("span", "proj-arrow", "↗"));
    body.appendChild(top);

    if (g.creator && g.creator.name) {
      var by = el("div", "game-by");
      by.innerHTML = "by " + esc(g.creator.name) +
        (g.creator.verified ? " " + VERIFIED_BADGE : "") +
        (g.creator.type === "Group" ? " <span class='grp'>group</span>" : "");
      body.appendChild(by);
    }

    if (g.visits != null || g.playing != null) {
      var stats = el("div", "game-stats");
      if (g.visits != null) stats.appendChild(el("span", null, compact(g.visits) + " visits"));
      if (g.playing != null) stats.appendChild(el("span", null, compact(g.playing) + " ccu"));
      body.appendChild(stats);
    }

    if (g.desc) body.appendChild(el("p", "game-desc", esc(g.desc)));
    if (p.description) body.appendChild(el("p", "game-note", esc(p.description)));

    card.appendChild(body);
    return card;
  }

  /* ---- enriched Roblox group/community card ------------ */
  function groupIdFromUrl(url) {
    var m = String(url || "").match(/roblox\.com\/communities\/(\d+)/);
    return m ? m[1] : null;
  }
  function buildGroupCard(p, g) {
    var card = el("article", "proj game group");

    if (g.thumb) {
      var img = el("img", "game-thumb");
      img.src = g.thumb; img.loading = "lazy"; img.alt = "";
      card.appendChild(img);
    } else {
      card.appendChild(el("span", "game-thumb game-thumb--empty"));
    }

    var body = el("div", "game-body");
    var top = el("div", "proj-top");
    var title = el("span", "proj-title");
    var a = el("a", null, esc(p.title || g.name || "Group"));
    a.href = p.url; a.target = "_blank"; a.rel = "noopener noreferrer";
    title.appendChild(a);
    if (g.verified) title.insertAdjacentHTML("beforeend", " " + VERIFIED_BADGE);
    top.appendChild(title);
    top.appendChild(el("span", "proj-arrow", "↗"));
    body.appendChild(top);

    if (g.members) body.appendChild(el("div", "game-by", Number(g.members).toLocaleString() + " members"));
    if (g.desc) body.appendChild(el("p", "game-desc", esc(g.desc)));
    if (g.proof) {
      var pf = el("a", "proof-link", "view proof ↗");
      pf.href = g.proof; pf.target = "_blank"; pf.rel = "noopener noreferrer";
      body.appendChild(pf);
    }

    card.appendChild(body);
    return card;
  }

  /* ---- enriched website card (screenshot preview) ------ */
  function siteData(url) {
    var w = window.WEBSITES_DATA || {};
    if (w[url]) return w[url];
    var alt = url && (url.charAt(url.length - 1) === "/" ? url.slice(0, -1) : url + "/");
    return (alt && w[alt]) || null;
  }
  function buildWebsiteCard(p, s) {
    var card = el("a", "proj site");
    card.href = p.url; card.target = "_blank"; card.rel = "noopener noreferrer";

    if (s.image) {
      var img = el("img", "site-shot");
      img.src = s.image; img.loading = "lazy"; img.alt = "";
      card.appendChild(img);
    }
    var meta = el("div", "site-meta");
    var top = el("div", "proj-top");
    top.appendChild(el("span", "proj-title", esc(p.title || s.title || s.domain)));
    top.appendChild(el("span", "proj-arrow", "↗"));
    meta.appendChild(top);
    if (s.domain) meta.appendChild(el("div", "site-domain", esc(s.domain)));
    var d = p.description || s.desc;
    if (d) meta.appendChild(el("p", "game-desc", esc(d)));
    card.appendChild(meta);
    return card;
  }

  /* ---- a single project row ---------------------------- */
  function buildProject(p) {
    // Roblox game with fetched data? render a rich card
    var pid = placeIdFromUrl(p.url);
    if (pid && (window.GAMES_DATA || {})[pid]) return buildGameCard(p, window.GAMES_DATA[pid]);

    // Roblox group/community with fetched data?
    var gid = groupIdFromUrl(p.url);
    if (gid && (window.GROUPS_DATA || {})[gid]) return buildGroupCard(p, window.GROUPS_DATA[gid]);

    // website with a screenshot preview?
    var sd = siteData(p.url);
    if (sd) return buildWebsiteCard(p, sd);

    var item = el("article", "proj");

    var top = el("div", "proj-top");
    var title = el("span", "proj-title");
    if (p.url) {
      var a = el("a", null, esc(p.title || "Untitled"));
      a.href = p.url;
      if (external(p.url)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
      title.appendChild(a);
      title.appendChild(el("span", "proj-arrow", external(p.url) ? " ↗" : " →"));
    } else {
      title.textContent = p.title || "Untitled";
    }
    top.appendChild(title);
    if (p.year) top.appendChild(el("span", "proj-year", esc(p.year)));
    item.appendChild(top);

    if (p.description) item.appendChild(el("p", "proj-desc", esc(p.description)));

    if (p.video) item.appendChild(buildVideo(p));

    if (p.tags && p.tags.length) {
      var tags = el("div", "proj-tags");
      p.tags.forEach(function (t) { tags.appendChild(el("span", null, esc(t))); });
      item.appendChild(tags);
    }
    return item;
  }

  /* ---- a code snippet card ----------------------------- */
  function buildSnippet(s) {
    var code = (window.SNIPPETS || {})[s.file] || s.code || "";
    var card = el("figure", "snippet");

    var bar = el("div", "snippet-bar");
    bar.appendChild(el("span", "snippet-lang", esc(s.lang || "code")));
    var copy = el("button", "snippet-copy", "copy");
    copy.type = "button";
    bar.appendChild(copy);
    card.appendChild(bar);

    if (s.description) card.appendChild(el("figcaption", "snippet-desc", esc(s.description)));

    var pre = el("pre", "snippet-pre");
    var codeEl = document.createElement("code");
    codeEl.className = "language-" + (s.lang || "plaintext");
    codeEl.textContent = code;            // safe: set as text, then highlight
    pre.appendChild(codeEl);
    card.appendChild(pre);

    if (window.hljs) { try { window.hljs.highlightElement(codeEl); } catch (e) {} }

    copy.addEventListener("click", function () {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(code).then(function () {
        copy.textContent = "copied"; copy.classList.add("done");
        setTimeout(function () { copy.textContent = "copy"; copy.classList.remove("done"); }, 1400);
      });
    });

    return card;
  }

  /* ---- a labelled video gallery (grid) ----------------- */
  function buildGallery(g) {
    var sec = el("div", "gallery");
    if (g.label) sec.appendChild(el("div", "subhead", esc(g.label)));
    var grid = el("div", "video-grid");
    (g.videos || []).filter(Boolean).forEach(function (item, i) {
      // item can be a "path" string or { video, poster, caption }
      var p = (typeof item === "string") ? { video: item } : item;
      var cell = buildVideo({
        video: p.video, poster: p.poster,
        title: (g.label ? g.label + " " : "") + (i + 1),
        caption: p.caption,
      });
      grid.appendChild(cell);
    });
    sec.appendChild(grid);
    return sec;
  }

  /* ---- lazy loader: only fetch a video once near view --- */
  var lazyIO = ("IntersectionObserver" in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var v = e.target;
          v.preload = "metadata";   // pull just enough to paint a thumbnail
          v.load();
          lazyIO.unobserve(v);
        });
      }, { rootMargin: "300px 0px" })
    : null;

  /* ---- click-to-play video ----------------------------- */
  function buildVideo(p) {
    var wrap = el("figure", "proj-video");
    var v = document.createElement("video");
    // no poster? nudge to 0.1s so the browser paints a first-frame thumbnail
    v.src = p.poster ? p.video : p.video + "#t=0.1";
    v.controls = true;
    v.preload = "none";          // deferred — load() fires when scrolled near
    v.playsInline = true;
    v.setAttribute("controlslist", "nodownload");
    if (p.poster) v.poster = p.poster;
    var label = (p.title ? p.title + " — " : "") + "demo video";
    v.setAttribute("aria-label", label);

    // graceful fallback if the file is missing / unsupported
    v.addEventListener("error", function () {
      wrap.classList.add("proj-video--missing");
      wrap.innerHTML = "<span class='video-missing'>video unavailable — " +
        esc(p.video) + "</span>";
    });

    wrap.appendChild(v);
    if (p.caption) wrap.appendChild(el("figcaption", "video-cap", esc(p.caption)));

    if (lazyIO) lazyIO.observe(v); else { v.preload = "metadata"; }
    return wrap;
  }

  /* ---- one work category section (used by both columns) - */
  function buildWorkSection(group) {
    var galleries = (group.galleries || []).filter(function (g) {
      return g && (g.videos || []).filter(Boolean).length;
    });
    var projects = (group.projects || []).filter(Boolean);
    var snippets = (group.snippets || []).filter(Boolean);
    if (!galleries.length && !projects.length && !snippets.length) return null;

    var wk = el("section", "block reveal");
    wk.appendChild(el("div", "category", esc(group.category || "Work")));

    // labelled video sub-galleries (e.g. "Work", "Extra")
    galleries.forEach(function (g) { wk.appendChild(buildGallery(g)); });

    // code snippets
    if (snippets.length) {
      var swrap = el("div", "snippets");
      snippets.forEach(function (s) { swrap.appendChild(buildSnippet(s)); });
      wk.appendChild(swrap);
    }

    // titled projects ledger
    if (projects.length) {
      var list = el("div", "work");
      projects.forEach(function (p) { list.appendChild(buildProject(p)); });
      wk.appendChild(list);
    }

    return wk;
  }

  /* ---- right column: about + work ---------------------- */
  function buildContent() {
    var f = document.createDocumentFragment();

    // about
    var about = (cfg.about || []).filter(Boolean);
    if (about.length) {
      var ab = el("section", "block about reveal");
      ab.appendChild(el("div", "eyebrow", "About"));
      about.forEach(function (line, i) {
        ab.appendChild(el("p", i === 0 ? "lede" : "dim", esc(line)));
      });
      f.appendChild(ab);
    }

    // work, grouped into categories (rail-flagged categories render elsewhere)
    contentWork.forEach(function (group) {
      var wk = buildWorkSection(group);
      if (wk) f.appendChild(wk);
    });

    // footer
    var foot = el("footer", "foot reveal");
    foot.appendChild(el("span", null, esc(cfg.footer || "")));
    var top = el("a", null, "Back to top ↑");
    top.href = "#";
    top.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    foot.appendChild(top);
    f.appendChild(foot);

    $content.appendChild(f);
  }

  /* ---- staggered load reveal --------------------------- */
  function reveal() {
    var items = document.querySelectorAll(".reveal");
    if (reduce) { items.forEach(function (n) { n.classList.add("in"); }); return; }
    items.forEach(function (n, i) {
      setTimeout(function () { n.classList.add("in"); }, 80 + i * 90);
    });
  }

  /* ---- start ------------------------------------------- */
  buildRail();
  buildContent();
  document.title = cfg.brand || cfg.name || "Portfolio";
  requestAnimationFrame(reveal);
})();
