/* lab.js — tri instrumenta: greda (R, V, M), presek (A, Iy, Wy), dimenzionisanje (EC2/EC3/EC5).
   Sve racuna assets/mehanika.js. Ovde je samo ulaz, crtanje i presuda. */
(function () {
  'use strict';
  var M = window.Mehanika, L = window.Lab;
  var P = {}; // poslednji rezultat grede, da ga dimenzionisanje moze uzeti

  function el(id) { return document.getElementById(id); }
  function v(id) { var e = el(id); return e ? parseFloat(e.value) : NaN; }
  function s(id) { var e = el(id); return e ? e.value : ''; }
  function sr() { return L.jezik() === 'sr'; }

  /* =========================================================
     INSTRUMENT 1 — GREDA
     ========================================================= */
  function sastaviGredu() {
    var sistem = s('sistem'), Ln = v('L');
    var beam = { L: Ln, supports: [], loads: [] };
    if (sistem === 'konzola') {
      beam.supports = [{ x: 0, type: 'fixed' }];
    } else if (sistem === 'prepust') {
      var a = Math.min(Ln * 0.2, Ln / 3);
      beam.supports = [{ x: a, type: 'pin' }, { x: Ln - a, type: 'roller' }];
    } else {
      beam.supports = [{ x: 0, type: 'pin' }, { x: Ln, type: 'roller' }];
    }
    var tip = s('tipOpterecenja');
    if (tip === 'udl' || tip === 'oba') {
      var q = v('q');
      if (q > 0) beam.loads.push({ type: 'udl', x1: 0, x2: Ln, q: q });
    }
    if (tip === 'point' || tip === 'oba') {
      var Pv = v('P'), xp = Math.max(0, Math.min(Ln, v('xP')));
      if (Pv > 0) beam.loads.push({ type: 'point', x: xp, P: Pv });
    }
    if (!beam.loads.length) beam.loads.push({ type: 'udl', x1: 0, x2: Ln, q: 1 });
    return beam;
  }

  function osloncZnak(ctx, x, y, tip) {
    ctx.save();
    ctx.strokeStyle = L.boja('mastilo'); ctx.fillStyle = L.boja('mastilo'); ctx.lineWidth = 1.2;
    if (tip === 'fixed') {
      ctx.beginPath(); ctx.moveTo(x, y - 16); ctx.lineTo(x, y + 16); ctx.stroke();
      for (var i = -16; i <= 12; i += 5) {
        ctx.beginPath(); ctx.moveTo(x, y + i); ctx.lineTo(x - 7, y + i + 6); ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 13); ctx.lineTo(x + 8, y + 13); ctx.closePath();
      ctx.stroke();
      if (tip === 'roller') {
        ctx.beginPath(); ctx.arc(x - 4, y + 16.5, 2.6, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 4, y + 16.5, 2.6, 0, 7); ctx.stroke();
      } else {
        for (var j = -9; j <= 7; j += 4) {
          ctx.beginPath(); ctx.moveTo(x + j, y + 14); ctx.lineTo(x + j - 4, y + 19); ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  function panelDijagram(ctx, X, y0, hh, tacke, polje, bojaIme, naslov, jed) {
    var maxV = 0;
    tacke.forEach(function (p) { maxV = Math.max(maxV, Math.abs(p[polje])); });
    if (maxV < 1e-9) maxV = 1;
    var sk = (hh / 2 - 12) / maxV;
    var cy = y0 + hh / 2;
    var pozDole = polje === 'M'; // moment se crta na zategnutoj strani

    ctx.save();
    ctx.strokeStyle = L.boja('linija');
    ctx.beginPath(); ctx.moveTo(X(0), cy); ctx.lineTo(X(1e9), cy); ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(X(tacke[0].x), cy);
    tacke.forEach(function (p) {
      var val = p[polje] * sk;
      ctx.lineTo(X(p.x), pozDole ? cy + val : cy - val);
    });
    ctx.lineTo(X(tacke[tacke.length - 1].x), cy);
    ctx.closePath();
    ctx.globalAlpha = 0.22; ctx.fillStyle = L.boja(bojaIme); ctx.fill();
    ctx.globalAlpha = 1; ctx.strokeStyle = L.boja(bojaIme); ctx.lineWidth = 1.6; ctx.stroke();
    ctx.restore();

    L.tekst(ctx, naslov, X(0), y0 + 11, { font: 'bold 11px ui-monospace, monospace',
      boja: L.boja(bojaIme) });
    var ex = tacke.reduce(function (a, p) {
      return Math.abs(p[polje]) > Math.abs(a[polje]) ? p : a;
    }, tacke[0]);
    var ey = pozDole ? cy + ex[polje] * sk : cy - ex[polje] * sk;
    ctx.save(); ctx.fillStyle = L.boja(bojaIme);
    ctx.beginPath(); ctx.arc(X(ex.x), ey, 3, 0, 7); ctx.fill(); ctx.restore();
    // Oznaka ekstrema ne sme da padne na naslov panela (uhvaceno snimkom, 01.10.2026).
    var ty = Math.min(Math.max(ey + (ey > cy ? 12 : -5), y0 + 30), y0 + hh - 4);
    L.tekst(ctx, L.broj(ex[polje], 1) + ' ' + jed, X(ex.x) + 6, ty, { boja: L.boja(bojaIme) });
    return ex;
  }

  function crtajGredu(beam, d) {
    var cv = el('cGreda'); if (!cv) return;
    var pl = L.platno(cv, 420);
    var ctx = pl.ctx, w = pl.w;
    var mL = 34, mR = 46;
    var X = function (x) { return mL + Math.min(x, beam.L) / beam.L * (w - mL - mR); };

    // --- skica ---
    var y = 62;
    ctx.save();
    ctx.strokeStyle = L.boja('mastilo'); ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(X(0), y); ctx.lineTo(X(beam.L), y); ctx.stroke();
    ctx.restore();

    beam.loads.forEach(function (l) {
      ctx.save();
      ctx.strokeStyle = L.boja('akcent'); ctx.fillStyle = L.boja('akcent'); ctx.lineWidth = 1.2;
      if (l.type === 'udl') {
        var x1 = X(l.x1), x2 = X(l.x2);
        ctx.beginPath(); ctx.moveTo(x1, y - 26); ctx.lineTo(x2, y - 26); ctx.stroke();
        var n = Math.max(4, Math.round((x2 - x1) / 26));
        for (var i = 0; i <= n; i++) {
          var xx = x1 + (x2 - x1) * i / n;
          L.strelica(ctx, xx, y - 26, xx, y - 4, 4);
        }
        L.tekst(ctx, 'q = ' + L.broj(l.q, 1) + ' kN/m', (x1 + x2) / 2, y - 31,
          { align: 'center', boja: L.boja('akcent') });
      } else if (l.type === 'point') {
        var xp = X(l.x);
        L.strelica(ctx, xp, y - 40, xp, y - 4, 6);
        L.tekst(ctx, 'P = ' + L.broj(l.P, 1) + ' kN', xp, y - 45,
          { align: 'center', boja: L.boja('akcent') });
      }
      ctx.restore();
    });

    d.reakcije.reakcije.forEach(function (R) {
      osloncZnak(ctx, X(R.x), y, R.type);
      L.tekst(ctx, L.broj(R.F, 1), X(R.x), y + 33, { align: 'center', boja: L.boja('akcent-2') });
      if (R.M) L.tekst(ctx, 'M ' + L.broj(R.M, 1), X(R.x) + 10, y + 46,
        { boja: L.boja('akcent-2') });
    });
    L.tekst(ctx, 'L = ' + L.broj(beam.L, 2) + ' m', X(beam.L), 18,
      { align: 'right', boja: L.boja('mastilo-2') });

    // --- V i M ---
    panelDijagram(ctx, X, 128, 130, d.V, 'V', 'akcent-2', 'V [kN]', 'kN');
    panelDijagram(ctx, X, 272, 140, d.M, 'M', 'akcent', 'M [kNm]  (+ = zategnuto donje vlakno)', 'kNm');
  }

  function osveziGredu() {
    var beam, d;
    try {
      beam = sastaviGredu();
      d = M.dijagrami(beam, 300);
    } catch (e) {
      el('izlazGreda').innerHTML = '<li class="bad">' + e.message + '</li>';
      return;
    }
    crtajGredu(beam, d);
    var R = d.reakcije.reakcije;
    var red = [];
    R.forEach(function (r, i) {
      red.push(['R' + (i + 1) + ' (x=' + L.broj(r.x, 2) + ' m)', L.broj(r.F, 2) + ' kN']);
      if (r.M) red.push(['M' + (i + 1) + ' (ukljestenje)', L.broj(r.M, 2) + ' kNm']);
    });
    red.push(['M max', L.broj(d.Mmax.M, 2) + ' kNm @ x=' + L.broj(d.Mmax.x, 2) + ' m']);
    red.push(['V max', L.broj(d.Vmax.V, 2) + ' kN']);
    el('izlazGreda').innerHTML = red.map(function (r) {
      return '<li><b>' + r[0] + '</b>' + r[1] + '</li>';
    }).join('');
    P.M = Math.abs(d.Mmax.M);
    P.V = Math.abs(d.Vmax.V);
    P.L = beam.L;
    var u = el('uzmiM');
    if (u) u.disabled = false;
  }

  /* =========================================================
     INSTRUMENT 2 — PRESEK
     ========================================================= */
  function sastaviPresek() {
    var t = s('tipPreseka');
    if (t === 'pravougaonik') return { geo: M.pravougaonik(v('pb'), v('ph')), tip: t };
    if (t === 'krug') return { geo: M.krug(v('pd')), tip: t };
    if (t === 'I') return { geo: M.iPresek(v('ih'), v('ib'), v('itw'), v('itf')), tip: t,
      dim: { h: v('ih'), b: v('ib'), tw: v('itw'), tf: v('itf') } };
    // T presek: ploca bf/hf gore, rebro bw/hw ispod
    var bf = v('tbf'), hf = v('thf'), bw = v('tbw'), hw = v('thw');
    return {
      geo: M.slozen([{ b: bf, h: hf, yc: hf / 2 }, { b: bw, h: hw, yc: hf + hw / 2 }]),
      tip: 'T', dim: { bf: bf, hf: hf, bw: bw, hw: hw }
    };
  }

  function crtajPresek(o) {
    var cv = el('cPresek'); if (!cv) return;
    var pl = L.platno(cv, 260), ctx = pl.ctx, w = pl.w, h = pl.h;
    var g = o.geo;
    var sirina = o.tip === 'T' ? o.dim.bf : (o.tip === 'I' ? o.dim.b : g.b);
    var visina = g.h;
    var sk = Math.min((w - 140) / Math.max(sirina, 1), (h - 50) / Math.max(visina, 1));
    var cx = (w - 110) / 2 + 20, top = (h - visina * sk) / 2;
    ctx.save();
    ctx.fillStyle = L.boja('akcent-2'); ctx.globalAlpha = 0.16;
    ctx.strokeStyle = L.boja('akcent-2'); ctx.lineWidth = 1.5;
    function pr(x, yy, bw2, hh2) {
      ctx.beginPath();
      ctx.rect(cx - bw2 * sk / 2 + x * sk, top + yy * sk, bw2 * sk, hh2 * sk);
      ctx.globalAlpha = 0.16; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();
    }
    if (o.tip === 'pravougaonik') pr(0, 0, g.b, g.h);
    else if (o.tip === 'krug') {
      ctx.beginPath(); ctx.arc(cx, top + visina * sk / 2, visina * sk / 2, 0, 7);
      ctx.globalAlpha = 0.16; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();
    } else if (o.tip === 'I') {
      pr(0, 0, o.dim.b, o.dim.tf);
      pr(0, o.dim.tf, o.dim.tw, o.dim.h - 2 * o.dim.tf);
      pr(0, o.dim.h - o.dim.tf, o.dim.b, o.dim.tf);
    } else {
      pr(0, 0, o.dim.bf, o.dim.hf);
      pr(0, o.dim.hf, o.dim.bw, o.dim.hw);
    }
    ctx.restore();
    // teziste
    var yg = top + g.zg * sk;
    ctx.save();
    ctx.strokeStyle = L.boja('akcent'); ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(cx - sirina * sk / 2 - 14, yg);
    ctx.lineTo(cx + sirina * sk / 2 + 14, yg); ctx.stroke();
    ctx.restore();
    L.tekst(ctx, 'y–y  (zg = ' + L.broj(g.zg, 1) + ' mm)', cx + sirina * sk / 2 + 18, yg + 4,
      { boja: L.boja('akcent') });
    L.tekst(ctx, L.broj(sirina, 0) + ' mm', cx, top - 8, { align: 'center', boja: L.boja('mastilo-2') });
    L.tekst(ctx, L.broj(visina, 0) + ' mm', cx - sirina * sk / 2 - 6, top + visina * sk / 2,
      { align: 'right', boja: L.boja('mastilo-2') });
  }

  function osveziPresek() {
    var o;
    try { o = sastaviPresek(); } catch (e) {
      el('izlazPresek').innerHTML = '<li class="bad">' + e.message + '</li>'; return;
    }
    var g = o.geo;
    if (!isFinite(g.A) || g.A <= 0) {
      el('izlazPresek').innerHTML = '<li class="bad">' +
        (sr() ? 'Unesi pozitivne dimenzije.' : 'Enter positive dimensions.') + '</li>';
      return;
    }
    crtajPresek(o);
    var red = [
      ['A', L.broj(g.A / 100, 1) + ' cm²'],
      ['Iy', L.broj(g.Iy / 1e4, 0) + ' cm⁴'],
      ['Wy', L.broj(g.Wy / 1e3, 1) + ' cm³'],
      ['i = √(I/A)', L.broj(Math.sqrt(g.Iy / g.A), 1) + ' mm']
    ];
    el('izlazPresek').innerHTML = red.map(function (r) {
      return '<li><b>' + r[0] + '</b>' + r[1] + '</li>';
    }).join('');
    var nap = el('napomenaPresek');
    if (nap) nap.textContent = g.napomena
      ? (sr() ? 'Napomena: ' + g.napomena + '. Tablični profil ima veći Iy.'
              : 'Note: ' + g.napomena + '. A rolled profile has a larger Iy.')
      : '';
    P.Wy = g.Wy; P.Iy = g.Iy; P.h = g.h; P.A = g.A;
    var u = el('uzmiW'); if (u) u.disabled = false;
  }

  /* =========================================================
     INSTRUMENT 3 — DIMENZIONISANJE
     ========================================================= */
  function prikaziPolja() {
    var mat = s('materijal');
    Array.prototype.forEach.call(document.querySelectorAll('[data-mat]'), function (e) {
      e.hidden = e.getAttribute('data-mat') !== mat;
    });
  }

  function osveziDim() {
    var mat = s('materijal'), MEd = v('MEd'), VEd = v('VEd');
    var red = [], presuda = '', klasa = '';
    try {
      if (mat === 'beton') {
        var r = M.ec2Savijanje({ b: v('cb'), d: v('cd'), beton: s('klasaBetona'), MEd: MEd });
        red.push(['fcd', L.broj(r.fcd, 2) + ' MPa'], ['fyd', L.broj(r.fyd, 1) + ' MPa'],
                 ['μ', L.broj(r.mu, 3)], ['ξ = x/d', r.ksi == null ? '—' : L.broj(r.ksi, 3)],
                 ['z', r.z == null ? '—' : L.broj(r.z, 1) + ' mm'],
                 ['As,min', L.broj(r.AsMin / 100, 2) + ' cm²'],
                 ['As potrebno', r.AsReq == null ? '—' : L.broj(r.AsReq / 100, 2) + ' cm²']);
        klasa = r.ok ? 'good' : 'bad';
        presuda = (r.ok
          ? (sr() ? 'Presek zadovoljava. ' : 'Section is adequate. ')
          : (sr() ? 'Presek NE zadovoljava. ' : 'Section is NOT adequate. ')) + r.zasto +
          (r.MRdLim ? (sr() ? ' Granica duktilnosti ovog preseka: M ≈ ' : ' Ductility limit of this section: M ≈ ')
            + L.broj(r.MRdLim, 1) + ' kNm.' : '');
      } else if (mat === 'drvo') {
        var r5 = M.ec5Greda({ drvo: s('klasaDrveta'), b: v('db'), h: v('dh'), MEd: MEd,
          VEd: isFinite(VEd) ? VEd : null, klasa: parseInt(s('klasaEksp'), 10),
          trajanje: s('trajanje') });
        red.push(['kmod', L.broj(r5.kmod, 2)], ['kh', L.broj(r5.kh, 3)],
                 ['γM', L.broj(r5.gammaM, 2)],
                 ['fm,d', L.broj(r5.fmd, 2) + ' MPa'], ['σm,d', L.broj(r5.sigma, 2) + ' MPa'],
                 ['W', L.broj(r5.W / 1e3, 1) + ' cm³'],
                 ['iskorišćenje', L.broj(r5.iskoriscenje * 100, 0) + ' %']);
        if (r5.tau != null) red.push(['τd / fv,d',
          L.broj(r5.tau, 2) + ' / ' + L.broj(r5.fvd, 2) + ' MPa']);
        klasa = r5.ok ? 'good' : 'bad';
        presuda = r5.ok
          ? (sr() ? 'σm,d ≤ fm,d — savijanje prolazi.' : 'σm,d ≤ fm,d — bending passes.')
          : (sr() ? 'Napon prelazi otpornost. Povećaj h (W raste s h²) ili promeni klasu.'
                  : 'Stress exceeds resistance. Increase h (W grows with h²) or change the class.');
      } else {
        var Wpl = v('Wpl');
        var r3 = M.ec3Greda({ celik: s('klasaCelika'), Wpl: isFinite(Wpl) ? Wpl * 1e3 : null,
          Wel: isFinite(Wpl) ? null : (P.Wy || 1e5), MEd: MEd, Av: v('Av') * 100 || null,
          VEd: isFinite(VEd) ? VEd : null });
        red.push(['fy', L.broj(r3.fy, 0) + ' MPa'],
                 ['Wpl', L.broj(r3.Wpl / 1e3, 1) + ' cm³' + (r3.WplPretpostavljen ? ' *' : '')],
                 ['Mc,Rd', L.broj(r3.MRd, 1) + ' kNm'],
                 ['iskorišćenje M', L.broj(r3.iskoriscenje * 100, 0) + ' %']);
        if (r3.VRd != null) red.push(['Vpl,Rd', L.broj(r3.VRd, 1) + ' kN']);
        klasa = r3.ok ? 'good' : 'bad';
        presuda = (r3.ok
          ? (sr() ? 'MEd ≤ Mc,Rd — presek prolazi.' : 'MEd ≤ Mc,Rd — section passes.')
          : (sr() ? 'MEd > Mc,Rd — uzmi veći profil.' : 'MEd > Mc,Rd — take a larger profile.')) +
          (r3.WplPretpostavljen
            ? (sr() ? ' * Wpl nije unet: procenjen kao 1.15·Wel — to je gruba pretpostavka, ne tablica.'
                    : ' * Wpl not entered: estimated as 1.15·Wel — a rough assumption, not a table value.')
            : '');
      }
    } catch (e) {
      el('izlazDim').innerHTML = '<li class="bad">' + e.message + '</li>';
      el('presudaDim').textContent = '';
      return;
    }
    el('izlazDim').innerHTML = red.map(function (r) {
      return '<li><b>' + r[0] + '</b>' + r[1] + '</li>';
    }).join('');
    var pd = el('presudaDim');
    pd.className = 'presuda ' + klasa;
    pd.textContent = presuda;
  }

  /* =========================================================
     POVEZIVANJE
     ========================================================= */
  function veziSve(ids, fn) {
    ids.forEach(function (id) {
      var e = el(id);
      if (!e) return;
      e.addEventListener('input', fn);
      e.addEventListener('change', fn);
    });
  }

  // Pokazi samo polja koja pripadaju izabranoj vrednosti selektora.
  function grupe(selektorId, attr) {
    var val = s(selektorId);
    Array.prototype.forEach.call(document.querySelectorAll('[data-' + attr + ']'), function (e) {
      var k = e.getAttribute('data-' + attr);
      e.hidden = attr === 'opt' ? !(k === val || val === 'oba') : k !== val;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!el('cGreda')) return; // nije lab strana
    veziSve(['sistem', 'L', 'tipOpterecenja', 'q', 'P', 'xP'], function () {
      grupe('tipOpterecenja', 'opt');
      var xpE = el('xP');
      if (xpE) xpE.max = String(v('L'));
      osveziGredu();
    });
    veziSve(['tipPreseka', 'pb', 'ph', 'pd', 'ih', 'ib', 'itw', 'itf',
             'tbf', 'thf', 'tbw', 'thw'], function () {
      grupe('tipPreseka', 'pres');
      osveziPresek();
    });
    veziSve(['materijal', 'MEd', 'VEd', 'cb', 'cd', 'klasaBetona', 'db', 'dh',
             'klasaDrveta', 'klasaEksp', 'trajanje', 'klasaCelika', 'Wpl', 'Av'], function () {
      prikaziPolja(); osveziDim();
    });
    var uM = el('uzmiM');
    if (uM) uM.addEventListener('click', function () {
      if (P.M == null) return;
      el('MEd').value = P.M.toFixed(2);
      if (P.V != null) el('VEd').value = P.V.toFixed(2);
      osveziDim();
      el('MEd').focus();
    });
    var uW = el('uzmiW');
    if (uW) uW.addEventListener('click', function () {
      if (P.Wy == null) return;
      el('materijal').value = 'celik';
      prikaziPolja();
      el('Wpl').value = (P.Wy / 1e3).toFixed(1);
      osveziDim();
    });
    window.addEventListener('resize', function () {
      osveziGredu(); osveziPresek();
    });
    window.addEventListener('mechlab:lang', function () { osveziPresek(); osveziDim(); });
    // Pocetno stanje mora da sakrije nebitna polja i bez ijedne interakcije.
    grupe('tipOpterecenja', 'opt');
    grupe('tipPreseka', 'pres');
    prikaziPolja();
    osveziGredu(); osveziPresek(); osveziDim();
  });
})();
