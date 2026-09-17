(function () {
  "use strict";

  var COUNT = 260;
  var DEPTH = 1400;
  var SPEED = 300;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var cv = document.createElement("canvas");
  cv.className = "stars";
  cv.setAttribute("aria-hidden", "true");
  document.body.appendChild(cv);

  var ctx = cv.getContext("2d");
  var stars = [];
  var w = 0, h = 0, cx = 0, cy = 0, fl = 0;
  var last = 0;
  var running = false;

  function spawn(s, anywhere) {
    s.x = (Math.random() * 2 - 1) * (w || 1200);
    s.y = (Math.random() * 2 - 1) * (h || 800);
    s.z = anywhere ? 40 + Math.random() * (DEPTH - 40) : DEPTH;
    s.pz = s.z;
    s.tint = Math.random() < 0.16;
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    cx = w / 2;
    cy = h / 2;
    fl = w * 0.5;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    cv.style.width = w + "px";
    cv.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
  }

  function render(dt) {
    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.pz = s.z;
      s.z -= SPEED * dt;
      if (s.z < 20) { spawn(s, false); continue; }

      var k = fl / s.z;
      var x = s.x * k + cx;
      var y = s.y * k + cy;
      if (x < -60 || x > w + 60 || y < -60 || y > h + 60) { spawn(s, false); continue; }

      var t = 1 - s.z / DEPTH;
      var pk = fl / s.pz;
      var px = s.x * pk + cx;
      var py = s.y * pk + cy;

      ctx.globalAlpha = Math.min(1, t * 1.6) * 0.85;
      ctx.strokeStyle = s.tint ? "#b9a7ff" : "#ffffff";
      ctx.lineWidth = 0.5 + t * 1.7;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  function frame(now) {
    if (!running) return;
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;
    render(dt);
    requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    last = 0;
    requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
  }

  for (var i = 0; i < COUNT; i++) {
    stars.push({});
  }

  resize();
  stars.forEach(function (s) { spawn(s, true); });

  window.addEventListener("resize", function () {
    resize();
    if (reduce) render(0);
  });

  if (reduce) {
    render(0);
    return;
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });

  start();
})();
