/* zadaci.js — generator zadataka sa proverom. Tacan odgovor UVEK racuna assets/mehanika.js,
   nikad zasebna formula: tako se zadatak i jezgro ne mogu raziCi. */
(function () {
  'use strict';
  var M = window.Mehanika, L = window.Lab;

  function el(id) { return document.getElementById(id); }
  function sr() { return L.jezik() === 'sr'; }
  function r(a, b, korak) {
    korak = korak || 1;
    var n = Math.floor(Math.random() * ((b - a) / korak + 1));
    return +(a + n * korak).toFixed(6);
  }
  function izbor(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---- generatori ---- */
  var G = {};

  G.reakcije_udl = function () {
    var Ln = r(4, 10, 0.5), q = r(4, 20, 1);
    var beam = { L: Ln, supports: [{ x: 0, type: 'pin' }, { x: Ln, type: 'roller' }],
                 loads: [{ type: 'udl', x1: 0, x2: Ln, q: q }] };
    var R = M.reakcije(beam).reakcije[0].F;
    return {
      nivo: 1, jed: 'kN',
      sr: 'Prosta greda raspona L = ' + Ln + ' m nosi ravnomerno opterećenje q = ' + q +
          ' kN/m po celoj dužini. Kolika je reakcija u levom osloncu?',
      en: 'A simply supported beam of span L = ' + Ln + ' m carries a uniform load q = ' + q +
          ' kN/m over its full length. What is the reaction at the left support?',
      odgovor: R,
      koraciSr: ['Ukupno opterećenje: Q = q·L = ' + q + '·' + Ln + ' = ' + (q * Ln).toFixed(1) + ' kN.',
        'Opterećenje je simetrično, pa se deli na dva jednaka dela.',
        'Ra = Rb = Q/2 = ' + R.toFixed(2) + ' kN.'],
      koraciEn: ['Total load: Q = q·L = ' + (q * Ln).toFixed(1) + ' kN.',
        'The load is symmetric, so it splits equally.',
        'Ra = Rb = Q/2 = ' + R.toFixed(2) + ' kN.']
    };
  };

  G.mmax_udl = function () {
    var Ln = r(4, 10, 0.5), q = r(4, 20, 1);
    var beam = { L: Ln, supports: [{ x: 0, type: 'pin' }, { x: Ln, type: 'roller' }],
                 loads: [{ type: 'udl', x1: 0, x2: Ln, q: q }] };
    var Mm = M.dijagrami(beam, 400).Mmax.M;
    return {
      nivo: 1, jed: 'kNm',
      sr: 'Prosta greda L = ' + Ln + ' m, q = ' + q + ' kN/m po celoj dužini. ' +
          'Koliki je maksimalni moment savijanja?',
      en: 'Simply supported beam L = ' + Ln + ' m, q = ' + q + ' kN/m full length. ' +
          'What is the maximum bending moment?',
      odgovor: Mm,
      koraciSr: ['Maksimum je u sredini, gde je V = 0.',
        'M = q·L²/8 = ' + q + '·' + Ln + '²/8.',
        'M = ' + Mm.toFixed(2) + ' kNm, zategnuto je donje vlakno.'],
      koraciEn: ['The maximum is at midspan, where V = 0.',
        'M = q·L²/8 = ' + Mm.toFixed(2) + ' kNm (bottom fibre in tension).']
    };
  };

  G.reakcija_tacka = function () {
    var Ln = r(5, 10, 0.5), a = r(1, Ln - 1, 0.5), Pv = r(10, 60, 5);
    var beam = { L: Ln, supports: [{ x: 0, type: 'pin' }, { x: Ln, type: 'roller' }],
                 loads: [{ type: 'point', x: a, P: Pv }] };
    var R = M.reakcije(beam).reakcije[1].F;
    return {
      nivo: 1, jed: 'kN',
      sr: 'Prosta greda L = ' + Ln + ' m nosi silu P = ' + Pv + ' kN na udaljenosti a = ' + a +
          ' m od levog oslonca. Kolika je reakcija u DESNOM osloncu?',
      en: 'Simply supported beam L = ' + Ln + ' m with a force P = ' + Pv + ' kN at a = ' + a +
          ' m from the left support. What is the reaction at the RIGHT support?',
      odgovor: R,
      koraciSr: ['Zbir momenata oko levog oslonca je nula: Rb·L = P·a.',
        'Rb = P·a/L = ' + Pv + '·' + a + '/' + Ln + '.',
        'Rb = ' + R.toFixed(2) + ' kN.'],
      koraciEn: ['Sum of moments about the left support: Rb·L = P·a.',
        'Rb = P·a/L = ' + R.toFixed(2) + ' kN.']
    };
  };

  G.konzola = function () {
    var Ln = r(1.5, 4, 0.25), q = r(3, 15, 1);
    var beam = { L: Ln, supports: [{ x: 0, type: 'fixed' }],
                 loads: [{ type: 'udl', x1: 0, x2: Ln, q: q }] };
    var Mu = M.unutrasnje(beam, 0, +1).M;
    return {
      nivo: 1, jed: 'kNm',
      sr: 'Konzola dužine L = ' + Ln + ' m nosi q = ' + q + ' kN/m. ' +
          'Koliki je moment u ukleštenju po apsolutnoj vrednosti?',
      en: 'A cantilever of length L = ' + Ln + ' m carries q = ' + q + ' kN/m. ' +
          'What is the magnitude of the moment at the fixed end?',
      odgovor: Math.abs(Mu),
      koraciSr: ['Rezultanta Q = q·L = ' + (q * Ln).toFixed(2) + ' kN deluje u sredini konzole.',
        'Krak do ukleštenja je L/2.',
        '|M| = q·L²/2 = ' + Math.abs(Mu).toFixed(2) + ' kNm; zategnuto je GORNJE vlakno.'],
      koraciEn: ['Resultant Q = q·L acts at mid-length; lever arm L/2.',
        '|M| = q·L²/2 = ' + Math.abs(Mu).toFixed(2) + ' kNm; TOP fibre in tension.']
    };
  };

  G.wy = function () {
    var b = r(100, 300, 20), h = r(200, 600, 20);
    var g = M.pravougaonik(b, h);
    return {
      nivo: 2, jed: 'cm³',
      sr: 'Pravougaoni presek b/h = ' + b + '/' + h + ' mm. Koliki je otporni moment Wy u cm³?',
      en: 'Rectangular section b/h = ' + b + '/' + h + ' mm. What is the section modulus Wy in cm³?',
      odgovor: g.Wy / 1e3,
      koraciSr: ['Wy = b·h²/6 = ' + b + '·' + h + '²/6 = ' + g.Wy.toExponential(3) + ' mm³.',
        '1 cm³ = 1000 mm³, pa je Wy = ' + (g.Wy / 1e3).toFixed(1) + ' cm³.',
        'Visina ulazi na kvadrat: dvostruko viši presek ima četiri puta veći Wy.'],
      koraciEn: ['Wy = b·h²/6 = ' + (g.Wy / 1e3).toFixed(1) + ' cm³.',
        'Depth enters squared: doubling h gives four times the Wy.']
    };
  };

  G.napon = function () {
    var b = r(100, 240, 20), h = r(200, 500, 20), Mm = r(10, 90, 5);
    var g = M.pravougaonik(b, h);
    var sig = Mm * 1e6 / g.Wy;
    return {
      nivo: 2, jed: 'MPa',
      sr: 'Greda preseka ' + b + '/' + h + ' mm nosi moment M = ' + Mm +
          ' kNm. Koliki je najveći normalni napon od savijanja?',
      en: 'A beam with section ' + b + '/' + h + ' mm carries M = ' + Mm +
          ' kNm. What is the maximum bending stress?',
      odgovor: sig,
      koraciSr: ['Wy = b·h²/6 = ' + (g.Wy / 1e3).toFixed(1) + ' cm³ = ' + g.Wy.toExponential(3) + ' mm³.',
        'M = ' + Mm + ' kNm = ' + (Mm * 1e6).toExponential(3) + ' Nmm.',
        'σ = M/Wy = ' + sig.toFixed(2) + ' N/mm² = ' + sig.toFixed(2) + ' MPa.'],
      koraciEn: ['Wy = b·h²/6 = ' + g.Wy.toExponential(3) + ' mm³.',
        'σ = M/Wy = ' + sig.toFixed(2) + ' MPa.']
    };
  };

  G.kombinacija = function () {
    var g = r(3, 12, 0.5), q = r(2, 8, 0.5);
    var k = M.kombinacija(g, q);
    return {
      nivo: 2, jed: 'kN/m',
      sr: 'Na međuspratnu konstrukciju deluje sopstvena težina g = ' + g +
          ' kN/m i korisno opterećenje q = ' + q + ' kN/m. Koliko je proračunsko opterećenje ' +
          'za granično stanje nosivosti (EN 1990, izraz 6.10)?',
      en: 'A floor carries permanent load g = ' + g + ' kN/m and imposed load q = ' + q +
          ' kN/m. What is the design load for the ultimate limit state (EN 1990, eq. 6.10)?',
      odgovor: k.Ed,
      koraciSr: ['Parcijalni koeficijenti: γG = 1.35 za stalno, γQ = 1.50 za promenljivo.',
        'Ed = 1.35·' + g + ' + 1.50·' + q + '.',
        'Ed = ' + k.Ed.toFixed(2) + ' kN/m.'],
      koraciEn: ['γG = 1.35 permanent, γQ = 1.50 imposed.',
        'Ed = 1.35·g + 1.50·q = ' + k.Ed.toFixed(2) + ' kN/m.']
    };
  };

  G.ec2 = function () {
    var b = izbor([250, 300, 350]), d = izbor([400, 450, 500, 550]);
    var klasa = izbor(['C25/30', 'C30/37']);
    var Mm = r(80, 220, 10);
    var res = M.ec2Savijanje({ b: b, d: d, beton: klasa, MEd: Mm });
    if (!res.ok) return G.ec2();
    return {
      nivo: 3, jed: 'cm²',
      sr: 'Pravougaona greda b = ' + b + ' mm, d = ' + d + ' mm, beton ' + klasa +
          ', armatura B500B. Proračunski moment MEd = ' + Mm +
          ' kNm. Kolika je potrebna površina zategnute armature As?',
      en: 'Rectangular beam b = ' + b + ' mm, d = ' + d + ' mm, concrete ' + klasa +
          ', rebar B500B. MEd = ' + Mm + ' kNm. What tensile reinforcement area As is required?',
      odgovor: res.AsReq / 100,
      koraciSr: ['fcd = 0.85·fck/1.5 = ' + res.fcd.toFixed(2) + ' MPa; fyd = 500/1.15 = ' +
          res.fyd.toFixed(1) + ' MPa.',
        'μ = MEd/(b·d²·fcd) = ' + res.mu.toFixed(3) + '.',
        'ξ = 1.25·(1 − √(1 − 2μ)) = ' + res.ksi.toFixed(3) + ' ≤ 0.45, presek je duktilan.',
        'z = d·(1 − 0.4ξ) = ' + res.z.toFixed(1) + ' mm.',
        'As = MEd/(fyd·z) = ' + (res.As / 100).toFixed(2) + ' cm²; As,min = ' +
          (res.AsMin / 100).toFixed(2) + ' cm² → usvojeno ' + (res.AsReq / 100).toFixed(2) + ' cm².'],
      koraciEn: ['fcd = ' + res.fcd.toFixed(2) + ' MPa, fyd = ' + res.fyd.toFixed(1) + ' MPa.',
        'μ = MEd/(b·d²·fcd) = ' + res.mu.toFixed(3) + '; ξ = ' + res.ksi.toFixed(3) + '.',
        'z = d(1 − 0.4ξ) = ' + res.z.toFixed(1) + ' mm; As = MEd/(fyd·z) = ' +
          (res.AsReq / 100).toFixed(2) + ' cm².']
    };
  };

  G.ec5 = function () {
    var klasa = izbor(['C16', 'C24', 'C30']);
    var traj = izbor(['trajno', 'srednje', 'kratkotrajno']);
    var ke = izbor([1, 2]);
    var res = M.ec5Greda({ drvo: klasa, b: 100, h: 200, MEd: 5, klasa: ke, trajanje: traj });
    var imena = { trajno: ['trajno', 'permanent'], srednje: ['srednje', 'medium-term'],
                  kratkotrajno: ['kratkotrajno', 'short-term'] };
    return {
      nivo: 3, jed: 'MPa',
      sr: 'Puna drvena greda, klasa ' + klasa + ', klasa eksploatacije ' + ke +
          ', trajanje opterećenja ' + imena[traj][0] + ', presek 100/200 mm. ' +
          'Kolika je proračunska čvrstoća na savijanje fm,d?',
      en: 'Solid timber beam, class ' + klasa + ', service class ' + ke + ', ' +
          imena[traj][1] + ' load duration, section 100/200 mm. ' +
          'What is the design bending strength fm,d?',
      odgovor: res.fmd,
      koraciSr: ['Iz EN 338: fm,k = ' + M.DRVO[klasa].fmk + ' MPa.',
        'EN 1995-1-1 tabela 3.1: kmod = ' + res.kmod.toFixed(2) + '.',
        'h = 200 ≥ 150 mm, pa je kh = 1.00. γM = 1.3 za puno drvo.',
        'fm,d = kmod·kh·fm,k/γM = ' + res.fmd.toFixed(2) + ' MPa.'],
      koraciEn: ['EN 338: fm,k = ' + M.DRVO[klasa].fmk + ' MPa; kmod = ' + res.kmod.toFixed(2) +
          '; kh = 1.00; γM = 1.3.',
        'fm,d = kmod·kh·fm,k/γM = ' + res.fmd.toFixed(2) + ' MPa.']
    };
  };

  G.ec3 = function () {
    var klasa = izbor(['S235', 'S275', 'S355']);
    var Wpl = r(200, 1200, 50);
    var res = M.ec3Greda({ celik: klasa, Wpl: Wpl * 1e3, MEd: 1 });
    return {
      nivo: 3, jed: 'kNm',
      sr: 'Čelična greda od ' + klasa + ', presek klase 1, Wpl = ' + Wpl +
          ' cm³. Kolika je proračunska momentna otpornost Mc,Rd (γM0 = 1.0)?',
      en: 'Steel beam, ' + klasa + ', class 1 section, Wpl = ' + Wpl +
          ' cm³. What is the design moment resistance Mc,Rd (γM0 = 1.0)?',
      odgovor: res.MRd,
      koraciSr: ['fy = ' + res.fy + ' MPa (EN 1993-1-1, t ≤ 40 mm).',
        'Wpl = ' + Wpl + ' cm³ = ' + (Wpl * 1e3).toExponential(3) + ' mm³.',
        'Mc,Rd = Wpl·fy/γM0 = ' + res.MRd.toFixed(1) + ' kNm.'],
      koraciEn: ['fy = ' + res.fy + ' MPa; Wpl = ' + (Wpl * 1e3).toExponential(3) + ' mm³.',
        'Mc,Rd = Wpl·fy/γM0 = ' + res.MRd.toFixed(1) + ' kNm.']
    };
  };

  G.ugib = function () {
    var Ln = r(3, 6, 0.5), q = r(2, 8, 0.5), b = 100, h = izbor([160, 180, 200, 220]);
    var I = M.pravougaonik(b, h).Iy;
    var w = M.ugibUDL(q, Ln, M.DRVO.C24.E0mean, I);
    return {
      nivo: 3, jed: 'mm',
      sr: 'Drvena greda C24 (E0,mean = 11000 MPa), presek ' + b + '/' + h + ' mm, raspon L = ' +
          Ln + ' m, q = ' + q + ' kN/m. Koliki je ugib u sredini raspona?',
      en: 'Timber beam C24 (E0,mean = 11000 MPa), section ' + b + '/' + h + ' mm, span L = ' +
          Ln + ' m, q = ' + q + ' kN/m. What is the midspan deflection?',
      odgovor: w,
      koraciSr: ['Iy = b·h³/12 = ' + I.toExponential(3) + ' mm⁴.',
        'q = ' + q + ' kN/m = ' + q + ' N/mm, L = ' + (Ln * 1000) + ' mm.',
        'w = 5qL⁴/(384·E·I) = ' + w.toFixed(1) + ' mm.',
        'Uporedi sa L/300 = ' + (Ln * 1000 / 300).toFixed(1) + ' mm: ' +
          (w <= Ln * 1000 / 300 ? 'zadovoljava.' : 'NE zadovoljava — presek je previše vitak.')],
      koraciEn: ['Iy = b·h³/12 = ' + I.toExponential(3) + ' mm⁴.',
        'w = 5qL⁴/(384EI) = ' + w.toFixed(1) + ' mm; compare to L/300 = ' +
          (Ln * 1000 / 300).toFixed(1) + ' mm.']
    };
  };

  var SVI = ['reakcije_udl', 'mmax_udl', 'reakcija_tacka', 'konzola', 'wy', 'napon',
             'kombinacija', 'ec2', 'ec5', 'ec3', 'ugib'];

  /* ---- stanje ---- */
  var KLJUC = 'mechlab.rezultat';
  function ucitaj() {
    try { return JSON.parse(localStorage.getItem(KLJUC)) || { tacno: 0, ukupno: 0 }; }
    catch (e) { return { tacno: 0, ukupno: 0 }; }
  }
  function sacuvaj(st) { try { localStorage.setItem(KLJUC, JSON.stringify(st)); } catch (e) {} }

  var tekuci = null, odgovoreno = false;

  function novi() {
    var nivo = el('nivo').value;
    var pool = SVI.filter(function (k) {
      var probni = null;
      try { probni = G[k](); } catch (e) { return false; }
      return nivo === 'svi' || String(probni.nivo) === nivo;
    });
    if (!pool.length) pool = SVI;
    tekuci = G[izbor(pool)]();
    odgovoreno = false;
    el('zadatakTekst').innerHTML =
      '<span class="sr">' + tekuci.sr + '</span><span class="en" lang="en">' + tekuci.en + '</span>';
    el('jedinica').textContent = tekuci.jed;
    el('polje').value = '';
    el('polje').disabled = false;
    el('koraci').hidden = true;
    el('koraci').innerHTML = '';
    var pr = el('presudaZad');
    pr.className = 'presuda'; pr.textContent = '';
    el('polje').focus();
  }

  function koraciHTML() {
    var k = sr() ? tekuci.koraciSr : tekuci.koraciEn;
    return '<ol>' + k.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>';
  }

  function proveri() {
    if (!tekuci) return;
    var unos = parseFloat(String(el('polje').value).replace(',', '.'));
    var pr = el('presudaZad');
    if (!isFinite(unos)) {
      pr.className = 'presuda';
      pr.textContent = sr() ? 'Unesi broj.' : 'Enter a number.';
      return;
    }
    var tacan = tekuci.odgovor;
    var tol = Math.max(Math.abs(tacan) * 0.02, 0.01);
    var ok = Math.abs(unos - tacan) <= tol;
    if (!odgovoreno) {
      var st = ucitaj();
      st.ukupno++; if (ok) st.tacno++;
      sacuvaj(st); prikaziBrojac();
      odgovoreno = true;
    }
    pr.className = 'presuda ' + (ok ? 'good' : 'bad');
    pr.textContent = ok
      ? (sr() ? 'Tačno. ' : 'Correct. ') +
        (sr() ? 'Tačan odgovor: ' : 'Exact answer: ') + tacan.toFixed(2) + ' ' + tekuci.jed
      : (sr() ? 'Nije tačno. Tačan odgovor je ' : 'Not correct. The answer is ') +
        tacan.toFixed(2) + ' ' + tekuci.jed +
        (sr() ? '. Prođi korake pa probaj sličan zadatak.' : '. Read the steps and try a similar task.');
    el('koraci').innerHTML = koraciHTML();
    el('koraci').hidden = false;
  }

  function prikaziBrojac() {
    var st = ucitaj();
    el('brojac').textContent = st.ukupno
      ? (sr() ? 'Tačno ' : 'Correct ') + st.tacno + '/' + st.ukupno +
        ' (' + Math.round(st.tacno / st.ukupno * 100) + '%)'
      : (sr() ? 'Još nema odgovora.' : 'No answers yet.');
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!el('zadatakTekst')) return;
    el('novi').addEventListener('click', novi);
    el('proveri').addEventListener('click', proveri);
    el('pokaziKorake').addEventListener('click', function () {
      if (!tekuci) return;
      el('koraci').innerHTML = koraciHTML();
      el('koraci').hidden = false;
    });
    el('nivo').addEventListener('change', novi);
    el('polje').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); proveri(); }
    });
    el('resetuj').addEventListener('click', function () {
      sacuvaj({ tacno: 0, ukupno: 0 }); prikaziBrojac();
    });
    window.addEventListener('mechlab:lang', function () {
      if (!tekuci) return;
      prikaziBrojac();
      if (!el('koraci').hidden) el('koraci').innerHTML = koraciHTML();
    });
    prikaziBrojac();
    novi();
  });
})();
