/* VanCity Dreamworlds: the show.
   Scroll, swipe, tap or key = intent. Each intent plays one transition film at
   its native frame rate through the hardware decoder, then lands on a living
   hold (poster + ambient loop). Nothing is scrubbed, so nothing can judder. */
(function () {
  'use strict';

  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PORTRAIT = matchMedia('(max-aspect-ratio: 4/5)');

  var HOLDS = {
    harbor: { poster: 'assets/w1-hero.webp',            amb: 'assets/amb-city.mp4',   world: 'harbor', fx: 'harbor', pos: '62% 50%', dwell: 5200 },
    bud:    { poster: 'assets/w2d-grove-bud.webp',      amb: 'assets/amb-bud.mp4',    world: 'grove',  fx: 'groveB', pos: '58% 45%', dwell: 5200 },
    grove:  { poster: 'assets/w2-grove.webp',           amb: 'assets/amb-trees.mp4',  world: 'grove',  fx: 'grove',  pos: '50% 50%', auto: 2400 },
    spoon:  { poster: 'assets/w3b-river-product.webp',  amb: 'assets/amb-spoon.mp4',  world: 'river',  fx: 'riverB', pos: '60% 40%', dwell: 5200 },
    cavern: { poster: 'assets/w4-cavern.webp',          amb: 'assets/amb-cavern.mp4', world: 'cavern', fx: 'cavern', pos: '50% 50%', auto: 2400 },
    altar:  { poster: 'assets/w4b-cavern-product.webp', amb: 'assets/amb-altar.mp4',  world: 'cavern', fx: 'altar',  pos: '58% 45%', dwell: 5200 },
    void:   { poster: 'assets/w5-void.webp',            amb: null,                    world: 'void',   fx: 'void',   pos: '50% 50%', auto: 350 },
    nova:   { poster: 'assets/w5b-nova.webp',           amb: 'assets/amb-nova.mp4',   world: 'nova',   fx: 'nova',   pos: '50% 50%', dwell: 5200 },
    market: { poster: 'assets/w6-market.webp',          amb: 'assets/amb-market.mp4', world: 'market', fx: 'market', pos: '55% 50%', dwell: 7000 },
    wake:   { poster: 'assets/w7-wake.webp',            amb: 'assets/amb-dawn.mp4',   world: 'wake',   fx: 'wake',   pos: '50% 50%' }
  };
  /* films are named by the hold they land on; the void plays two in a row */
  var SEQ = ['harbor', 'b1', 'bud', 'g1', 'grove', 'b2', 'spoon', 'b3', 'cavern', 'c1',
             'altar', 'b4', 'void', 'v1', 's1', 'nova', 'b5', 'market', 'b6', 'wake'];
  var FILM_POS = { b1: '58% 45%', g1: '50% 50%', b2: '60% 40%', b3: '50% 50%', c1: '58% 45%',
                   b4: '50% 50%', v1: '50% 50%', s1: '50% 50%', b5: '55% 50%', b6: '50% 50%' };
  var isFilm = function (k) { return !HOLDS[k]; };
  var filmSrc = function (k) { return 'assets/f/' + k + (PORTRAIT.matches ? '-p' : '') + '.mp4'; };

  var root = document.documentElement;
  var stage = document.getElementById('stage');
  var layers = [stage.querySelector('[data-layer="a"]'), stage.querySelector('[data-layer="b"]')];
  var slots = Array.prototype.slice.call(stage.querySelectorAll('.film'));
  var beats = Array.prototype.slice.call(document.querySelectorAll('[data-beat]'));
  var hud = document.getElementById('hud');
  var hint = document.getElementById('hint');
  var loader = document.getElementById('loader');
  var playBtn = document.getElementById('playShow');
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-jump]'));

  var cur = 0;            /* index into SEQ, always a hold when idle */
  var live = 0;           /* which scene layer is on top */
  var busy = false;
  var autoplay = false;
  var timer = null;
  var filming = false;
  var interacted = false;
  if (!matchMedia('(hover: hover)').matches) hint.textContent = 'Tap or swipe to begin';

  /* ---------------------------------------------------------------- films */
  var cache = {};
  function fetchFilm(k) {
    if (cache[k]) return cache[k];
    var src = filmSrc(k);
    cache[k] = fetch(src).then(function (r) { if (!r.ok) throw new Error(src + ' ' + r.status); return r.blob(); })
      .then(function (b) { return URL.createObjectURL(b); })
      .catch(function () { delete cache[k]; return src; });
    return cache[k];
  }
  /* one film at a time, in show order, so the next beat is always the first
     thing on the wire and nothing competes with what the viewer is watching */
  (function warm(i) {
    if (REDUCED || i >= SEQ.length) return;
    var k = SEQ[i];
    if (!isFilm(k)) return warm(i + 1);
    fetchFilm(k).then(function () { warm(i + 1); });
  })(0);

  var slotFor = {};
  var activeSlot = null;
  function armFilm(k) {
    /* park the upcoming film in a free slot, decoded to its first frame */
    if (slotFor[k]) return Promise.resolve(slotFor[k]);
    var v = slots[0] === activeSlot ? slots[1] : slots[0];
    if (v.dataset.film === k) return Promise.resolve(v);
    return fetchFilm(k).then(function (url) {
      Object.keys(slotFor).forEach(function (kk) { if (slotFor[kk] === v) delete slotFor[kk]; });
      v.dataset.film = k; slotFor[k] = v;
      v.style.objectPosition = FILM_POS[k] || '50% 50%';
      v.src = url; v.load();
      return new Promise(function (res) {
        if (v.readyState >= 2) return res(v);
        var done = function () { v.removeEventListener('loadeddata', done); res(v); };
        v.addEventListener('loadeddata', done);
        setTimeout(function () { res(v); }, 4000);
      });
    });
  }

  /* --------------------------------------------------------------- scenes */
  function paintLayer(L, hold) {
    var img = L.querySelector('img'), amb = L.querySelector('video'), fx = L.querySelector('.wfx');
    if (img.dataset.hold !== hold) {
      var h = HOLDS[hold];
      img.src = h.poster; img.dataset.hold = hold;
      img.style.objectPosition = h.pos; amb.style.objectPosition = h.pos;
      fx.className = 'wfx wfx--' + h.fx;
      if (h.amb && !REDUCED) { amb.src = h.amb; amb.load(); amb.style.display = ''; }
      else { amb.removeAttribute('src'); amb.style.display = 'none'; }
    }
  }
  function startAmb(L) {
    var amb = L.querySelector('video');
    if (!amb.src || REDUCED) return;
    try { amb.currentTime = 0; } catch (e) {}
    var p = amb.play(); if (p && p.catch) p.catch(function () {});
  }
  function stopAmb(L) { var amb = L.querySelector('video'); if (amb.src && !amb.paused) amb.pause(); }

  function showHold(hold, mode) {
    /* mode: 'instant' (under a film that is about to fade) | 'fade' */
    var next = 1 - live, N = layers[next], C = layers[live];
    paintLayer(N, hold);
    N.style.transition = mode === 'fade' ? 'opacity 700ms cubic-bezier(0.23,1,0.32,1)' : 'none';
    N.style.zIndex = 2; C.style.zIndex = 1;
    startAmb(N);
    N.style.opacity = 1;
    live = next;
    var settle = mode === 'fade' ? 720 : 0;
    setTimeout(function () { C.style.opacity = 0; stopAmb(C); }, settle);
  }

  /* --------------------------------------------------------------- copy */
  function setBeat(hold, on) {
    beats.forEach(function (el) {
      var mine = el.dataset.beat.split(' ').indexOf(hold) >= 0;
      el.classList.toggle('on', on && mine);
    });
    var h = HOLDS[hold];
    root.style.setProperty('--bloomp', on && hold === 'nova' ? '1' : '0');
    root.style.setProperty('--shelfp', on && hold === 'market' ? '1' : '0');
    root.dataset.world = h ? h.world : '';
    root.dataset.hold = hold;
    var worlds = ['harbor', 'bud', 'spoon', 'altar', 'nova', 'market', 'wake'];
    var wi = 0; for (var i = 0; i < SEQ.length && i <= SEQ.indexOf(hold); i++) if (worlds.indexOf(SEQ[i]) >= 0) wi = worlds.indexOf(SEQ[i]);
    dots.forEach(function (d, i) { d.setAttribute('aria-current', i % worlds.length === wi ? 'true' : 'false'); });
    hud.classList.toggle('at-end', hold === 'wake');
  }

  /* --------------------------------------------------------------- flow */
  function land(i) {
    cur = i; busy = false;
    var hold = SEQ[i], h = HOLDS[hold];
    setBeat(hold, true);
    if (i + 1 < SEQ.length && isFilm(SEQ[i + 1])) armFilm(SEQ[i + 1]);
    clearTimeout(timer);
    if (h.auto) timer = setTimeout(function () { advance(true); }, h.auto);
    else if (autoplay && h.dwell) timer = setTimeout(function () { advance(true); }, h.dwell);
    else if (autoplay && !h.dwell) setAutoplay(false);
  }

  function playFilm(i, done) {
    var k = SEQ[i];
    filming = true;
    loader.classList.add('on');
    armFilm(k).then(function (v) {
      loader.classList.remove('on');
      activeSlot = v;
      /* a chained film (meteor -> crash) is armed in the other slot now */
      if (isFilm(SEQ[i + 1])) armFilm(SEQ[i + 1]);
      v.style.zIndex = 5;
      v.style.opacity = 1;
      try { v.currentTime = 0; } catch (e) {}
      var finished = false;
      var finish = function () {
        if (finished) return; finished = true;
        v.removeEventListener('ended', finish);
        filming = false;
        done(v);
      };
      v.addEventListener('ended', finish);
      var p = v.play();
      if (p && p.catch) p.catch(function () { finish(); });
      /* belt and braces: some mobile decoders never fire ended on blob srcs */
      setTimeout(function () { if (!finished && v.duration && v.currentTime >= v.duration - 0.05) finish(); }, (v.duration || 5) * 1000 + 400);
    });
  }

  function advance(fromAuto) {
    if (busy) return;
    if (cur + 1 >= SEQ.length) return;
    busy = true; clearTimeout(timer);
    var hold = SEQ[cur];
    setBeat(hold, false);
    if (!fromAuto) autoplayTouch();

    var i = cur + 1;
    if (REDUCED) {
      while (i < SEQ.length && isFilm(SEQ[i])) i++;
      showHold(SEQ[i], 'fade');
      setTimeout(function () { land(i); }, 720);
      return;
    }
    var step = function (j) {
      /* j is a film; play it, then either chain the next film or land */
      playFilm(j, function (v) {
        var n = j + 1;
        if (isFilm(SEQ[n])) {
          /* frame-locked chain (void -> meteor -> crash): keep the last frame
             up while the next slot takes over */
          var prev = v;
          step(n);
          setTimeout(function () { prev.style.opacity = 0; prev.style.zIndex = 4; }, 120);
        } else {
          showHold(SEQ[n], 'instant');
          v.style.transition = 'opacity 320ms ease-out';
          requestAnimationFrame(function () { v.style.opacity = 0; });
          setTimeout(function () { v.style.transition = ''; v.style.zIndex = 4; land(n); }, 340);
        }
      });
    };
    step(i);
  }

  function back() {
    if (busy) return;
    var i = cur - 1;
    while (i > 0 && (isFilm(SEQ[i]) || HOLDS[SEQ[i]].auto)) i--;
    if (i < 0) return;
    jump(i);
  }

  function jump(i) {
    if (busy || i === cur) return;
    busy = true; clearTimeout(timer); setAutoplay(false);
    setBeat(SEQ[cur], false);
    slots.forEach(function (v) { if (!v.paused) v.pause(); v.style.opacity = 0; });
    showHold(SEQ[i], 'fade');
    setTimeout(function () { land(i); }, 720);
  }

  function setAutoplay(on) {
    autoplay = on;
    playBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    playBtn.textContent = on ? 'Pause the show' : 'Play the show';
    clearTimeout(timer);
    if (on && !busy) { var h = HOLDS[SEQ[cur]]; timer = setTimeout(function () { advance(true); }, Math.min(h.dwell || h.auto || 1200, 2600)); }
  }
  function autoplayTouch() { if (autoplay) setAutoplay(false); }

  /* --------------------------------------------------------------- input */
  function touched() {
    if (interacted) return; interacted = true;
    hint.classList.add('gone');
  }
  var acc = 0, lastIntent = 0;
  function intent(dir) {
    var now = performance.now();
    if (now - lastIntent < 650) return;
    lastIntent = now; touched();
    if (dir > 0) advance(); else back();
  }
  addEventListener('wheel', function (e) {
    if (e.target.closest && e.target.closest('.shelf__rail')) return;
    e.preventDefault();
    acc += e.deltaY;
    if (Math.abs(acc) > 40) { intent(acc > 0 ? 1 : -1); acc = 0; }
    clearTimeout(intent.t); intent.t = setTimeout(function () { acc = 0; }, 180);
  }, { passive: false });
  var ty = null, tx = null;
  addEventListener('touchstart', function (e) { ty = e.touches[0].clientY; tx = e.touches[0].clientX; }, { passive: true });
  addEventListener('touchend', function (e) {
    if (ty === null) return;
    var dy = ty - e.changedTouches[0].clientY, dx = tx - e.changedTouches[0].clientX;
    ty = null;
    if (e.target.closest && e.target.closest('.shelf__rail, a, button')) return;
    if (Math.abs(dy) > 36 && Math.abs(dy) > Math.abs(dx)) intent(dy > 0 ? 1 : -1);
    else if (Math.abs(dy) < 10 && Math.abs(dx) < 10) intent(1);
  }, { passive: true });
  addEventListener('keydown', function (e) {
    if (['ArrowDown', 'PageDown', ' ', 'Enter', 'ArrowRight'].indexOf(e.key) >= 0) { e.preventDefault(); intent(1); }
    else if (['ArrowUp', 'PageUp', 'ArrowLeft'].indexOf(e.key) >= 0) { e.preventDefault(); intent(-1); }
  });
  document.addEventListener('click', function (e) {
    var d = e.target.closest && e.target.closest('[data-jump]');
    if (d) { touched(); jump(SEQ.indexOf(d.dataset.jump)); }
  });
  playBtn.addEventListener('click', function () { touched(); setAutoplay(!autoplay); if (autoplay && !busy && SEQ[cur] === 'wake') jump(0); });
  hint.addEventListener('click', function () { touched(); advance(); });
  PORTRAIT.addEventListener && PORTRAIT.addEventListener('change', function () {
    cache = {}; slotFor = {}; slots.forEach(function (v) { delete v.dataset.film; });
    if (cur + 1 < SEQ.length && isFilm(SEQ[cur + 1])) armFilm(SEQ[cur + 1]);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { clearTimeout(timer); stopAmb(layers[live]); }
    else if (!busy) { startAmb(layers[live]); land(cur); }
  });

  /* --------------------------------------------------------------- start */
  paintLayer(layers[0], 'harbor');
  layers[0].style.opacity = 1; layers[0].style.zIndex = 2;
  startAmb(layers[0]);
  land(0);

  window.Show = { advance: advance, back: back, jump: jump, state: function () { return { cur: cur, hold: SEQ[cur], busy: busy, filming: filming, autoplay: autoplay }; } };

  /* --------------------------------------------------------------- weather */
  if (REDUCED) return;
  var WCFG = {
    harbor: { style: 'streak', n: 55, vy: [180, 300], vx: 26, sway: 0, len: 13, colors: ['rgba(178,198,255,0.45)', 'rgba(150,222,255,0.38)'] },
    grove:  { style: 'dot', n: 80, vy: [-26, -8], vx: 0, sway: 22, size: [1.4, 3.4], tw: 0.6, colors: ['#CBA1FF', '#9BE8C4', '#EBD9FF'] },
    river:  { style: 'dot', n: 70, vy: [-60, -28], vx: 4, sway: 10, size: [1, 3], tw: 0.45, colors: ['#FFC96A', '#FF9A3C', '#FFE9B0'] },
    cavern: { style: 'dot', n: 75, vy: [14, 34], vx: 0, sway: 8, size: [1, 2.6], tw: 0.8, colors: ['#BFEFFF', '#DFF6FF', '#9BD8FF'] },
    void:   { style: 'dot', n: 26, vy: [2, 7], vx: 0, sway: 3, size: [0.7, 1.8], tw: 1, colors: ['#C9D4FF', '#E8ECFF'] },
    nova:   { style: 'dot', n: 150, vy: [45, 110], vx: 0, sway: 32, size: [1, 3.8], tw: 0.5, colors: ['#FFFFFF', '#E7F0FF', '#DFE8FF'] },
    market: { style: 'dot', n: 130, vy: [-30, 14], vx: 8, sway: 24, size: [1.2, 3.4], tw: 0.9, colors: ['#FF9AD5', '#8AF0D2', '#FFE08A', '#C5A8FF'] },
    wake:   { style: 'dot', n: 75, vy: [-20, -6], vx: 4, sway: 10, size: [1, 3], tw: 0.5, colors: ['#FFD9A0', '#FFEECB', '#FFC9B0'] }
  };
  var canvas = document.querySelector('.dream-dust');
  var ctx = canvas.getContext('2d');
  var DPR = Math.min(devicePixelRatio || 1, 1.5);
  var sprites = {};
  function sprite(c) {
    if (sprites[c]) return sprites[c];
    var s = document.createElement('canvas'); s.width = s.height = 32;
    var g = s.getContext('2d');
    var grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, '#fff'); grad.addColorStop(0.25, c); grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 32, 32);
    return (sprites[c] = s);
  }
  var P = [];
  function respawn(p, cfg, anywhere) {
    p.cfg = cfg;
    p.x = Math.random() * canvas.width;
    p.y = anywhere ? Math.random() * canvas.height : (cfg.vy[0] + cfg.vy[1] < 0 ? canvas.height + 20 : -20);
    p.vy = cfg.vy[0] + Math.random() * (cfg.vy[1] - cfg.vy[0]);
    p.size = cfg.size ? cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]) : 1;
    p.color = cfg.colors[(Math.random() * cfg.colors.length) | 0];
    p.ph = Math.random() * 6.28;
    p.twf = 0.5 + Math.random() * 1.6;
  }
  function sizeCanvas() { canvas.width = innerWidth; canvas.height = innerHeight; }
  sizeCanvas(); addEventListener('resize', sizeCanvas);
  for (var pi = 0; pi < 110; pi++) { var p0 = {}; respawn(p0, WCFG.harbor, true); P.push(p0); }

  var lastT = performance.now(), vel = 0, phase = 0;
  function tick(t) {
    var dt = Math.min(48, t - lastT) || 16; lastT = t;
    var target = filming ? 1 : 0;
    vel += (target - vel) * (target > vel ? 0.08 : 0.03);
    phase += (dt / 6000) * Math.PI * 2;
    var br = (Math.sin(phase) + 1) / 2;
    root.style.setProperty('--vel', vel.toFixed(3));
    root.style.setProperty('--breath', br.toFixed(3));
    var s = 1.015 + br * 0.012;
    var cap = Math.min(innerWidth, innerHeight) * 0.006;
    var dx = Math.sin(phase * 0.7) * cap, dy = Math.cos(phase * 0.5) * cap * 0.7;
    stage.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';

    var cfg = WCFG[root.dataset.world] || WCFG.harbor;
    var dts = dt / 1000, boost = 1 + vel * 1.6, ts = t / 1000;
    var quota = cfg.n * (innerWidth < 700 ? 0.5 : 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var k = 0; k < P.length; k++) {
      var p = P[k];
      if (p.dormant) { if (k < quota) { p.dormant = false; respawn(p, cfg, false); } continue; }
      p.y += p.vy * dts * boost;
      p.x += ((p.cfg.vx || 0) + Math.sin(ts * p.twf + p.ph) * (p.cfg.sway || 0)) * dts * boost;
      if (p.y < -30 || p.y > canvas.height + 30 || p.x < -30 || p.x > canvas.width + 30) {
        if (k < quota) respawn(p, cfg, false); else p.dormant = true;
        continue;
      }
      var a = 0.5 + Math.sin(ts * p.twf * 2 + p.ph) * (p.cfg.tw || 0.3) * 0.5;
      ctx.globalAlpha = Math.max(0.08, Math.min(1, a));
      if (p.cfg.style === 'streak') {
        ctx.strokeStyle = p.color; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - (p.cfg.vx || 0) * 0.05, p.y - (p.cfg.len || 12)); ctx.stroke();
      } else {
        var d = p.size * 6;
        ctx.drawImage(sprite(p.color), p.x - d / 2, p.y - d / 2, d, d);
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
