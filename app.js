(function () {
  "use strict";

  var cfg = window.CONFIG || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var $hero = document.getElementById("hero");
  var $main = document.getElementById("main");
  var $foot = document.getElementById("foot");

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
  function compact(n) {
    n = Number(n) || 0;
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "b";
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "m";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
    return String(n);
  }
  function pad2(n) { return String(n).padStart(2, "0"); }

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
  var VERIFIED_BADGE =
    "<svg class='verified' viewBox='0 0 28 28' fill='none' role='img' aria-label='Verified'>" +
    "<g clip-path='url(#rbxvb)'>" +
    "<rect x='5.88818' width='22.89' height='22.89' transform='rotate(15 5.88818 0)' fill='#0066FF'/>" +
    "<path fill-rule='evenodd' clip-rule='evenodd' d='M20.543 8.7508L20.549 8.7568C21.15 9.3578 21.15 10.3318 20.549 10.9328L11.817 19.6648L7.45 15.2968C6.85 14.6958 6.85 13.7218 7.45 13.1218L7.457 13.1148C8.058 12.5138 9.031 12.5138 9.633 13.1148L11.817 15.2998L18.367 8.7508C18.968 8.1498 19.942 8.1498 20.543 8.7508Z' fill='white'/>" +
    "</g>" +
    "<defs><clipPath id='rbxvb'><rect width='28' height='28' fill='white'/></clipPath></defs>" +
    "</svg>";

  function iconSvg(label) {
    var path = ICONS[String(label || "").toLowerCase().trim()];
    if (!path) return "";
    return "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='" + path + "'/></svg>";
  }

  document.title = cfg.brand || cfg.name || "portfolio";

  function placeIdFromUrl(url) {
    var m = String(url || "").match(/roblox\.com\/games\/(\d+)/);
    return m ? m[1] : null;
  }
  function groupIdFromUrl(url) {
    var m = String(url || "").match(/roblox\.com\/communities\/(\d+)/);
    return m ? m[1] : null;
  }
  function siteData(url) {
    var w = window.WEBSITES_DATA || {};
    if (w[url]) return w[url];
    var alt = url && (url.charAt(url.length - 1) === "/" ? url.slice(0, -1) : url + "/");
    return (alt && w[alt]) || null;
  }

  var work = (cfg.work || []).filter(Boolean);

  function tally() {
    var clips = 0, games = 0, groups = 0, visits = 0;
    work.forEach(function (g) {
      (g.galleries || []).forEach(function (gal) {
        clips += (gal.videos || []).filter(Boolean).length;
      });
      (g.projects || []).filter(Boolean).forEach(function (p) {
        var pid = placeIdFromUrl(p.url);
        if (pid) {
          games++;
          var d = (window.GAMES_DATA || {})[pid];
          if (d && d.visits) visits += Number(d.visits) || 0;
          return;
        }
        if (groupIdFromUrl(p.url)) groups++;
      });
    });
    return { clips: clips, games: games, groups: groups, visits: visits };
  }

  function buildHero() {
    var f = document.createDocumentFragment();
    if (cfg.name) f.appendChild(el("h1", "name", esc(cfg.name)));
    if (cfg.role) f.appendChild(el("p", "role", esc(cfg.role)));
    (cfg.about || []).filter(Boolean).forEach(function (line) {
      f.appendChild(el("p", "intro", esc(line)));
    });

    var t = tally();
    var bits = [];
    if (t.clips)  bits.push("<b>" + t.clips + "</b> clips");
    if (t.games)  bits.push("<b>" + t.games + "</b> games");
    if (t.visits) bits.push("<b>" + compact(t.visits) + "+</b> combined visits");
    if (t.groups) bits.push("<b>" + t.groups + "</b> studios");
    if (bits.length) {
      f.appendChild(el("div", "stats", bits.join("<span class='sep'>/</span>")));
    }

    var socials = (cfg.socials || []).filter(Boolean);
    if (socials.length) {
      var chips = el("nav", "chips");
      socials.forEach(function (s) {
        var a = el("a", "chip");
        a.href = s.url || "#";
        if (external(s.url)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
        a.innerHTML = iconSvg(s.label) + "<span>" + esc(s.handle || s.label) + "</span>";
        chips.appendChild(a);
      });
      f.appendChild(chips);
    }
    $hero.appendChild(f);
  }

  var lazyIO = ("IntersectionObserver" in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var v = e.target;
          v.preload = "metadata";
          v.load();
          lazyIO.unobserve(v);
        });
      }, { rootMargin: "300px 0px" })
    : null;

  function buildCell(src, caption, label) {
    var cell = el("figure", "cell");
    var v = document.createElement("video");
    v.src = src + "#t=0.1";
    if (/\.mp4$/i.test(src)) v.poster = src.replace(/\.mp4$/i, ".jpg");
    v.controls = true;
    v.preload = "none";
    v.playsInline = true;
    v.setAttribute("controlslist", "nodownload");
    v.setAttribute("aria-label", (label ? label + " — " : "") + "demo video");

    v.addEventListener("error", function () {
      cell.innerHTML = "<span class='cell-missing'>video unavailable — " + esc(src) + "</span>";
    });

    var byHover = false;
    v.addEventListener("play", function () {
      if (!byHover) v.dataset.user = "1";
      document.querySelectorAll("video").forEach(function (o) { if (o !== v) o.pause(); });
    });
    v.addEventListener("volumechange", function () { v.dataset.user = "1"; });
    cell.addEventListener("mouseenter", function () {
      document.querySelectorAll("video").forEach(function (o) { if (o !== v) o.pause(); });
      if (v.dataset.user || reduce) return;
      byHover = true;
      v.muted = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    });
    cell.addEventListener("mouseleave", function () {
      byHover = false;
      if (v.dataset.user) return;
      v.pause();
    });

    cell.appendChild(v);
    if (caption) cell.appendChild(el("figcaption", "cell-cap", esc(caption)));
    if (lazyIO) lazyIO.observe(v); else v.preload = "metadata";
    return cell;
  }

  function buildGallery(g) {
    var vids = (g.videos || []).filter(Boolean);
    var sec = el("div", "gallery");
    if (g.label) sec.appendChild(el("div", "sublabel", "<b>" + esc(g.label) + "</b>"));
    var grid = el("div", "reel");
    vids.forEach(function (item, i) {
      var p = (typeof item === "string") ? { video: item } : item;
      grid.appendChild(buildCell(p.video, p.caption, (g.label || "clip") + " " + (i + 1)));
    });
    sec.appendChild(grid);
    return sec;
  }

  function buildGameRow(p, g) {
    var row = el("a", "row");
    row.href = p.url;
    row.target = "_blank"; row.rel = "noopener noreferrer";

    if (g.thumb) {
      var img = el("img", "row-thumb");
      img.src = g.thumb; img.loading = "lazy"; img.alt = "";
      row.appendChild(img);
    } else {
      row.appendChild(el("span", "row-thumb"));
    }

    var body = el("div", "row-body");
    var top = el("div", "row-top");
    top.appendChild(el("span", "row-title", esc(p.title || g.name)));
    top.appendChild(el("span", "row-arrow", "↗"));
    body.appendChild(top);

    if (g.creator && g.creator.name) {
      body.appendChild(el("div", "row-by",
        "by " + esc(g.creator.name) +
        (g.creator.verified ? " " + VERIFIED_BADGE : "") +
        (g.creator.type === "Group" ? " <span class='grp'>group</span>" : "")));
    }
    if (g.visits != null || g.playing != null) {
      var stats = el("div", "row-stats");
      if (g.visits != null) stats.appendChild(el("span", null, "<b>" + compact(g.visits) + "</b> visits"));
      if (g.playing != null) stats.appendChild(el("span", null, "<b>" + compact(g.playing) + "</b> ccu"));
      body.appendChild(stats);
    }
    if (g.desc) body.appendChild(el("p", "row-desc", esc(g.desc)));
    if (p.description) body.appendChild(el("p", "row-note", esc(p.description)));

    row.appendChild(body);
    return row;
  }

  function buildGroupRow(p, g) {
    var row = el("article", "row");

    if (g.thumb) {
      var img = el("img", "row-thumb");
      img.src = g.thumb; img.loading = "lazy"; img.alt = "";
      row.appendChild(img);
    } else {
      row.appendChild(el("span", "row-thumb"));
    }

    var body = el("div", "row-body");
    var top = el("div", "row-top");
    var title = el("span", "row-title");
    var a = el("a", null, esc(p.title || g.name || "group"));
    a.href = p.url; a.target = "_blank"; a.rel = "noopener noreferrer";
    title.appendChild(a);
    if (g.verified) title.insertAdjacentHTML("beforeend", " " + VERIFIED_BADGE);
    top.appendChild(title);
    top.appendChild(el("span", "row-arrow", "↗"));
    body.appendChild(top);

    if (g.members) body.appendChild(el("div", "row-stats", "<span><b>" + compact(g.members) + "</b> members</span>"));
    if (g.desc) body.appendChild(el("p", "row-desc", esc(g.desc)));
    if (g.proof) {
      var pf = el("a", "proof-link", "view proof ↗");
      pf.href = g.proof; pf.target = "_blank"; pf.rel = "noopener noreferrer";
      body.appendChild(pf);
    }

    row.appendChild(body);
    return row;
  }

  function buildSiteCard(p, s) {
    var card = el("a", "site-card");
    card.href = p.url; card.target = "_blank"; card.rel = "noopener noreferrer";
    if (s.image) {
      var img = el("img", "site-shot");
      img.src = s.image; img.loading = "lazy"; img.alt = "";
      card.appendChild(img);
    }
    var meta = el("div", "site-meta");
    var top = el("div", "row-top");
    top.appendChild(el("span", "row-title", esc(p.title || s.title || s.domain)));
    top.appendChild(el("span", "row-arrow", "↗"));
    meta.appendChild(top);
    if (s.domain) meta.appendChild(el("div", "site-domain", esc(s.domain)));
    var d = p.description || s.desc;
    if (d) meta.appendChild(el("p", "row-desc", esc(d)));
    card.appendChild(meta);
    return card;
  }

  function buildPlainRow(p) {
    var row = el("article", "row");
    var body = el("div", "row-body");
    var top = el("div", "row-top");
    var title = el("span", "row-title");
    if (p.url) {
      var a = el("a", null, esc(p.title || "untitled"));
      a.href = p.url;
      if (external(p.url)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
      title.appendChild(a);
      top.appendChild(title);
      top.appendChild(el("span", "row-arrow", external(p.url) ? "↗" : "→"));
    } else {
      title.textContent = p.title || "untitled";
      top.appendChild(title);
    }
    body.appendChild(top);
    if (p.description) body.appendChild(el("p", "row-desc", esc(p.description)));
    row.appendChild(body);
    return row;
  }

  function buildProject(p) {
    var pid = placeIdFromUrl(p.url);
    if (pid && (window.GAMES_DATA || {})[pid]) return buildGameRow(p, window.GAMES_DATA[pid]);
    var gid = groupIdFromUrl(p.url);
    if (gid && (window.GROUPS_DATA || {})[gid]) return buildGroupRow(p, window.GROUPS_DATA[gid]);
    var sd = siteData(p.url);
    if (sd) return buildSiteCard(p, sd);
    return buildPlainRow(p);
  }

  function section(title, count) {
    var sec = el("section", "sec");
    sec.id = String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    var head = el("header", "sec-head");
    head.appendChild(el("h2", null, esc(title)));
    if (count != null) head.appendChild(el("span", "sec-n", pad2(count)));
    sec.appendChild(head);
    return sec;
  }

  function buildWorkSection(group) {
    var galleries = (group.galleries || []).filter(function (g) {
      return g && (g.videos || []).filter(Boolean).length;
    });
    var projects = (group.projects || []).filter(Boolean);
    if (!galleries.length && !projects.length) return null;

    var count = projects.length;
    galleries.forEach(function (g) { count += (g.videos || []).filter(Boolean).length; });

    var sec = section(group.category || "work", count);
    galleries.forEach(function (g) { sec.appendChild(buildGallery(g)); });

    if (projects.length) {
      var allGroups = projects.every(function (p) { return groupIdFromUrl(p.url); });
      var list = el("div", allGroups ? "rows duo" : "rows");
      projects.forEach(function (p) { list.appendChild(buildProject(p)); });
      sec.appendChild(list);
    }
    return sec;
  }

  function buildSnippets() {
    var snips = (cfg.snippets || []).filter(Boolean);
    if (!snips.length) return null;

    var sec = section("snippets", snips.length);
    var tabs = el("div", "tabs");
    tabs.setAttribute("role", "tablist");
    sec.appendChild(tabs);

    var panels = [];
    snips.forEach(function (s, i) {
      var tab = el("button", "tab", esc(s.lang || "code"));
      tab.type = "button";
      tab.setAttribute("role", "tab");
      tabs.appendChild(tab);

      var code = (window.SNIPPETS || {})[s.file] || s.code || "";
      var panel = el("figure", "snip");
      panel.hidden = i !== 0;
      if (i === 0) tab.classList.add("is-on");

      var bar = el("div", "snip-bar");
      if (s.description) bar.appendChild(el("figcaption", "snip-desc", esc(s.description)));
      var copy = el("button", "snip-copy", "copy");
      copy.type = "button";
      bar.appendChild(copy);
      panel.appendChild(bar);

      var pre = el("pre", "snip-pre");
      var codeEl = document.createElement("code");
      codeEl.className = "language-" + (s.lang || "plaintext");
      codeEl.textContent = code;
      pre.appendChild(codeEl);
      panel.appendChild(pre);
      if (window.hljs) { try { window.hljs.highlightElement(codeEl); } catch (e) {} }

      copy.addEventListener("click", function () {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(code).then(function () {
          copy.textContent = "copied"; copy.classList.add("done");
          setTimeout(function () { copy.textContent = "copy"; copy.classList.remove("done"); }, 1400);
        });
      });

      tab.addEventListener("click", function () {
        tabs.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("is-on"); });
        panels.forEach(function (p) { p.hidden = true; });
        tab.classList.add("is-on");
        panel.hidden = false;
      });

      panels.push(panel);
      sec.appendChild(panel);
    });
    return sec;
  }

  function buildContactForm() {
    var c = cfg.contact || {};
    var key = (c.accessKey || "").trim();
    var keyReady = key && !/PASTE/i.test(key);

    var form = el("form", "cform");
    form.setAttribute("novalidate", "");

    var ta = document.createElement("textarea");
    ta.name = "message"; ta.rows = 4; ta.required = true;
    ta.placeholder = "your message";
    form.appendChild(ta);

    var soc = document.createElement("input");
    soc.type = "text"; soc.name = "socials";
    soc.placeholder = "your socials so i can add you back";
    form.appendChild(soc);

    var honey = document.createElement("input");
    honey.type = "text"; honey.name = "_honey"; honey.tabIndex = -1;
    honey.autocomplete = "off"; honey.setAttribute("aria-hidden", "true");
    honey.className = "cform-honey";
    form.appendChild(honey);

    var btn = el("button", "cform-btn", esc(c.button || "send"));
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
      if (honey.value) return;
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

  function buildContact() {
    var socials = (cfg.socials || []).filter(Boolean);
    var sec = section("contact", null);
    var grid = el("div", "contact-grid");

    if (socials.length) {
      var list = el("nav", "contact-list");
      socials.forEach(function (s) {
        var a = el("a");
        a.href = s.url || "#";
        if (external(s.url)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
        a.innerHTML = iconSvg(s.label) +
          "<span class='c-label'>" + esc(s.label) + "</span>" +
          "<span class='c-handle'>" + esc(s.handle || s.url || "") + "</span>";
        list.appendChild(a);
      });
      grid.appendChild(list);
    }
    grid.appendChild(buildContactForm());
    sec.appendChild(grid);
    return sec;
  }

  function buildMain() {
    var f = document.createDocumentFragment();
    work.forEach(function (group) {
      var sec = buildWorkSection(group);
      if (sec) f.appendChild(sec);
    });
    var sn = buildSnippets();
    if (sn) f.appendChild(sn);
    f.appendChild(buildContact());
    $main.appendChild(f);
  }

  function buildFoot() {
    $foot.appendChild(el("span", null, esc(cfg.footer || cfg.brand || "")));
    var top = el("a", null, "back to top ↑");
    top.href = "#";
    top.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    $foot.appendChild(top);
  }

  function buildNav() {
    var nav = document.getElementById("secnav");
    var secs = $main.querySelectorAll(".sec[id]");
    if (!nav || !secs.length) return;

    var links = {};
    secs.forEach(function (s) {
      var h = s.querySelector("h2");
      var a = el("a", null, esc((h ? h.textContent : s.id).split(" ")[0]));
      a.href = "#" + s.id;
      links[s.id] = a;
      nav.appendChild(a);
    });
    nav.hidden = false;

    if ("IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          nav.querySelectorAll("a").forEach(function (a) { a.classList.remove("is-on"); });
          links[e.target.id].classList.add("is-on");
        });
      }, { rootMargin: "-30% 0px -60% 0px" });
      secs.forEach(function (s) { spy.observe(s); });
    }
  }

  function intro() {
    var veil = document.getElementById("veil");
    if (reduce) { if (veil) veil.remove(); return; }

    if (veil) {
      setTimeout(function () { veil.classList.add("is-up"); }, 150);
      setTimeout(function () { veil.remove(); }, 1000);
    }

    var role = $hero.querySelector(".role");
    if (!role) return;
    var text = role.textContent;
    var glyphs = "abcdefghijklmnopqrstuvwxyz<>/{}[]#&*";
    var frames = 22, frame = 0;
    setTimeout(function () {
      var iv = setInterval(function () {
        frame++;
        var settled = Math.floor(text.length * frame / frames);
        if (settled >= text.length) { clearInterval(iv); role.textContent = text; return; }
        var out = "";
        for (var i = 0; i < text.length; i++) {
          out += (i < settled || text[i] === " ") ? text[i]
               : glyphs[Math.floor(Math.random() * glyphs.length)];
        }
        role.textContent = out;
      }, 40);
    }, 300);
  }

  buildHero();
  buildMain();
  buildNav();
  buildFoot();
  intro();
})();
