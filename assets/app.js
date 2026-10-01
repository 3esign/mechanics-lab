/* app.js — zajednicki sloj: jezik, navigacija, pomocne funkcije za crtanje. */
(function () {
  'use strict';

  /* ---- jezik ---- */
  var KLJUC = 'mechlab.lang';
  function postavi(lang) {
    document.body.className = document.body.className
      .replace(/\blang-(sr|en)\b/g, '').trim() + ' lang-' + lang;
    document.documentElement.lang = lang === 'en' ? 'en' : 'sr-Latn';
    var b = document.getElementById('langToggle');
    if (b) {
      b.textContent = lang === 'sr' ? 'English' : 'Srpski';
      b.lang = lang === 'sr' ? 'en' : 'sr-Latn';
      b.setAttribute('aria-label', lang === 'sr' ? 'Switch to English' : 'Prebaci na srpski');
    }
    try { localStorage.setItem(KLJUC, lang); } catch (e) { /* privatni rezim */ }
  }
  function tekuci() {
    try { return localStorage.getItem(KLJUC) || 'sr'; } catch (e) { return 'sr'; }
  }
  document.addEventListener('DOMContentLoaded', function () {
    postavi(tekuci());
    var b = document.getElementById('langToggle');
    if (b) b.addEventListener('click', function () {
      postavi(document.body.classList.contains('lang-en') ? 'sr' : 'en');
      window.dispatchEvent(new Event('mechlab:lang'));
    });
    // tekuca strana u navigaciji
    var put = location.pathname.split('/').pop() || 'index.html';
    Array.prototype.forEach.call(document.querySelectorAll('header nav a'), function (a) {
      if (a.getAttribute('href') === put) a.setAttribute('aria-current', 'page');
    });
  });

  /* ---- crtanje ---- */
  function boja(ime) {
    return getComputedStyle(document.documentElement).getPropertyValue('--' + ime).trim();
  }
  // Priprema canvas za ostar prikaz; vraca kontekst i logicke dimenzije.
  function platno(cv, hLogicko) {
    var dpr = window.devicePixelRatio || 1;
    var w = cv.clientWidth || 600;
    var h = hLogicko;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    cv.style.height = h + 'px';
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }
  function tekst(ctx, s, x, y, opt) {
    opt = opt || {};
    ctx.save();
    ctx.fillStyle = opt.boja || boja('mastilo');
    ctx.font = (opt.font || '11px ui-monospace, Consolas, monospace');
    ctx.textAlign = opt.align || 'left';
    ctx.textBaseline = opt.base || 'alphabetic';
    ctx.fillText(s, x, y);
    ctx.restore();
  }
  function strelica(ctx, x1, y1, x2, y2, glava) {
    glava = glava || 5;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    var a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - glava * Math.cos(a - 0.4), y2 - glava * Math.sin(a - 0.4));
    ctx.lineTo(x2 - glava * Math.cos(a + 0.4), y2 - glava * Math.sin(a + 0.4));
    ctx.closePath(); ctx.fill();
  }
  function broj(v, dec) {
    if (v == null || !isFinite(v)) return '—';
    dec = dec == null ? 2 : dec;
    var s = Math.abs(v) >= 1e5 ? v.toExponential(2) : v.toFixed(dec);
    return s.replace(/\.?0+$/, function (m) { return m.indexOf('.') === 0 ? '' : m; });
  }

  window.Lab = { boja: boja, platno: platno, tekst: tekst, strelica: strelica, broj: broj,
                 jezik: function () { return document.body.classList.contains('lang-en') ? 'en' : 'sr'; } };
})();
