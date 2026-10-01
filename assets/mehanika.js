/* mehanika.js - jezgro proracuna (statika, geometrija preseka, Evrokod provere).
   Bez zavisnosti. Radi i u browseru i u node-u.

   KONVENCIJE (napisane jer je greska u znaku najcesca greska studenata):
   - x raste s leva na desno, u metrima od levog kraja nosaca.
   - Vertikalno opterecenje: NADOLE je pozitivno (P, q). Reakcija se vraca kao F (NAGORE pozitivno).
   - Koncentrisani spoljni moment: u smeru KAZALJKE NA SATU je pozitivno.
   - Unutrasnje sile: V(x) = suma vertikalnih sila nagore LEVO od reza.
     M(x) = suma momenata levo od reza; zatezanje DONJEG vlakna = POZITIVNO.
   - Momentni dijagram se crta na zategnutoj strani: pozitivno M ide ISPOD ose.
*/
(function (root) {
  'use strict';

  var EPS = 1e-9;

  /* ---------- 1. STATIKA ---------- */

  function razlozi(loads) {
    var sile = [];   // {F, x}  F nagore pozitivno
    var mom = [];    // {M, x}  CW pozitivno
    (loads || []).forEach(function (l) {
      if (l.type === 'point') {
        sile.push({ F: -Number(l.P), x: Number(l.x) });
      } else if (l.type === 'udl') {
        var a = Number(l.x1), b = Number(l.x2), q = Number(l.q);
        if (b - a > EPS) sile.push({ F: -q * (b - a), x: (a + b) / 2 });
      } else if (l.type === 'moment') {
        mom.push({ M: Number(l.M), x: Number(l.x) });
      } else {
        throw new Error('nepoznato opterecenje: ' + l.type);
      }
    });
    return { sile: sile, mom: mom };
  }

  // Moment u smeru kazaljke oko tacke p, od vertikalne sile F (nagore pozitivno) u x.
  function momCW(F, x, p) { return F * (p - x); }

  function reakcije(beam) {
    var r = razlozi(beam.loads);
    var sumF = r.sile.reduce(function (s, f) { return s + f.F; }, 0);
    var sup = (beam.supports || []).slice().sort(function (a, b) { return a.x - b.x; });
    var fixed = sup.filter(function (s) { return s.type === 'fixed'; });
    var simple = sup.filter(function (s) { return s.type === 'pin' || s.type === 'roller'; });

    if (fixed.length === 1 && simple.length === 0) {
      var a = fixed[0].x;
      var sumM = r.sile.reduce(function (s, f) { return s + momCW(f.F, f.x, a); }, 0) +
                 r.mom.reduce(function (s, m) { return s + m.M; }, 0);
      return {
        tip: 'konzola',
        reakcije: [{ x: a, F: -sumF, M: -sumM, type: 'fixed' }],
        odredjen: true
      };
    }
    if (simple.length === 2 && fixed.length === 0) {
      var xa = simple[0].x, xb = simple[1].x;
      if (Math.abs(xb - xa) < EPS) throw new Error('oslonci se poklapaju');
      var sumMa = r.sile.reduce(function (s, f) { return s + momCW(f.F, f.x, xa); }, 0) +
                  r.mom.reduce(function (s, m) { return s + m.M; }, 0);
      var Rb = sumMa / (xb - xa);
      var Ra = -(sumF + Rb);
      return {
        tip: 'prosta greda',
        reakcije: [{ x: xa, F: Ra, M: 0, type: simple[0].type },
                   { x: xb, F: Rb, M: 0, type: simple[1].type }],
        odredjen: true
      };
    }
    return {
      tip: 'van domasaja resavaca', reakcije: [], odredjen: false,
      zasto: 'ovaj resavac pokriva dva prosta oslonca ILI jedno ukljestenje'
    };
  }

  // Unutrasnje sile u x. strana: -1 = tek levo od reza, +1 = tek desno (zbog skokova).
  function unutrasnje(beam, x, strana) {
    var sol = beam.__sol || reakcije(beam);
    if (!sol.odredjen) throw new Error(sol.zasto);
    var ukljuci = function (xf) {
      return strana === -1 ? xf < x - EPS : xf <= x + EPS;
    };
    var V = 0, M = 0;

    sol.reakcije.forEach(function (R) {
      if (ukljuci(R.x)) { V += R.F; M += R.F * (x - R.x) + (R.M || 0); }
    });
    (beam.loads || []).forEach(function (l) {
      if (l.type === 'point') {
        if (ukljuci(Number(l.x))) {
          var F = -Number(l.P);
          V += F; M += F * (x - Number(l.x));
        }
      } else if (l.type === 'udl') {
        var a = Number(l.x1), b = Math.min(Number(l.x2), x);
        if (b > a + EPS) {
          var F2 = -Number(l.q) * (b - a), xc = (a + b) / 2;
          V += F2; M += F2 * (x - xc);
        }
      } else if (l.type === 'moment') {
        if (ukljuci(Number(l.x))) M += Number(l.M);
      }
    });
    return { x: x, V: V, M: M };
  }

  // Uzorkovanje dijagrama: gusta mreza + obavezne tacke (oslonci, sile, granice udl).
  function dijagrami(beam, n) {
    n = n || 400;
    var L = Number(beam.L);
    var sol = reakcije(beam);
    var b2 = { L: L, supports: beam.supports, loads: beam.loads, __sol: sol };
    var kljucne = [0, L];
    (beam.supports || []).forEach(function (s) { kljucne.push(Number(s.x)); });
    (beam.loads || []).forEach(function (l) {
      if (l.type === 'point' || l.type === 'moment') kljucne.push(Number(l.x));
      else { kljucne.push(Number(l.x1)); kljucne.push(Number(l.x2)); }
    });
    var tacke = [];
    for (var i = 0; i <= n; i++) tacke.push(L * i / n);
    kljucne.forEach(function (k) { if (k >= 0 && k <= L) tacke.push(k); });
    tacke.sort(function (a, b) { return a - b; });

    var V = [], M = [];
    tacke.forEach(function (t) {
      var skok = kljucne.some(function (k) { return Math.abs(k - t) < 1e-7; });
      if (skok && t > EPS) {
        var levo = unutrasnje(b2, t, -1);
        V.push(levo); M.push(levo);
      }
      var desno = unutrasnje(b2, t, +1);
      V.push(desno); M.push(desno);
    });
    var Mmax = M.reduce(function (a, p) { return Math.abs(p.M) > Math.abs(a.M) ? p : a; }, M[0]);
    var Vmax = V.reduce(function (a, p) { return Math.abs(p.V) > Math.abs(a.V) ? p : a; }, V[0]);
    return { V: V, M: M, Mmax: Mmax, Vmax: Vmax, reakcije: sol };
  }

  /* ---------- 2. GEOMETRIJA PRESEKA (mm) ---------- */

  function pravougaonik(b, h) {
    return {
      ime: 'pravougaonik ' + b + '/' + h, A: b * h, Iy: b * h * h * h / 12,
      Wy: b * h * h / 6, h: h, b: b, zg: h / 2, Av: (2 / 3) * b * h
    };
  }
  function krug(d) {
    var r = d / 2;
    return {
      ime: 'krug d' + d, A: Math.PI * r * r, Iy: Math.PI * Math.pow(d, 4) / 64,
      Wy: Math.PI * Math.pow(d, 3) / 32, h: d, b: d, zg: r, Av: Math.PI * r * r * 0.9
    };
  }
  // I-presek iz cistih pravougaonika, BEZ zaobljenja r.
  // Namerno: razlika prema tablici profila se meri i pokazuje, ne krije.
  function iPresek(h, b, tw, tf) {
    var hw = h - 2 * tf;
    var A = 2 * b * tf + tw * hw;
    var Iy = (b * Math.pow(h, 3) - (b - tw) * Math.pow(hw, 3)) / 12;
    return {
      ime: 'I ' + h + '/' + b, A: A, Iy: Iy, Wy: 2 * Iy / h, h: h, b: b,
      tw: tw, tf: tf, zg: h / 2, Av: A - 2 * b * tf + (tw + 2 * 0) * tf,
      napomena: 'bez zaobljenja prelaza (r); tablicno Iy je vece'
    };
  }
  // Slozen presek iz pravougaonika: delovi = [{b, h, yc}], yc = teziste dela od gornje ivice.
  function slozen(delovi) {
    var A = 0, Sy = 0;
    delovi.forEach(function (d) { A += d.b * d.h; Sy += d.b * d.h * d.yc; });
    var zg = Sy / A, Iy = 0;
    delovi.forEach(function (d) {
      Iy += d.b * Math.pow(d.h, 3) / 12 + d.b * d.h * Math.pow(d.yc - zg, 2);
    });
    var hTot = Math.max.apply(null, delovi.map(function (d) { return d.yc + d.h / 2; }));
    var eMax = Math.max(zg, hTot - zg);
    return { ime: 'slozen', A: A, Iy: Iy, zg: zg, Wy: Iy / eMax, h: hTot, b: 0, Av: 0 };
  }

  /* ---------- 3. MATERIJALI ---------- */

  // EN 1992-1-1, tabela 3.1 (MPa)
  var BETON = {
    'C16/20': { fck: 16, fctm: 1.9, Ecm: 29000 },
    'C20/25': { fck: 20, fctm: 2.2, Ecm: 30000 },
    'C25/30': { fck: 25, fctm: 2.6, Ecm: 31000 },
    'C30/37': { fck: 30, fctm: 2.9, Ecm: 33000 },
    'C35/45': { fck: 35, fctm: 3.2, Ecm: 34000 },
    'C40/50': { fck: 40, fctm: 3.5, Ecm: 35000 }
  };
  var ARMATURA = { 'B500B': { fyk: 500, Es: 200000 } };
  // EN 1993-1-1, tabela 3.1 (t <= 40 mm)
  var CELIK = {
    'S235': { fy: 235, fu: 360, E: 210000 },
    'S275': { fy: 275, fu: 430, E: 210000 },
    'S355': { fy: 355, fu: 490, E: 210000 }
  };
  // EN 338 (karakteristicne vrednosti, MPa; rhok u kg/m3)
  var DRVO = {
    'C16': { fmk: 16, fvk: 3.2, fc0k: 17, ft0k: 10, E0mean: 8000, rhok: 310, lamelirano: false },
    'C24': { fmk: 24, fvk: 4.0, fc0k: 21, ft0k: 14, E0mean: 11000, rhok: 350, lamelirano: false },
    'C30': { fmk: 30, fvk: 4.0, fc0k: 23, ft0k: 18, E0mean: 12000, rhok: 380, lamelirano: false },
    'GL24h': { fmk: 24, fvk: 3.5, fc0k: 24, ft0k: 19.2, E0mean: 11500, rhok: 385, lamelirano: true }
  };
  // EN 1995-1-1, tabela 3.1 (puno drvo i lamelirano)
  var KMOD = {
    1: { trajno: 0.60, dugotrajno: 0.70, srednje: 0.80, kratkotrajno: 0.90, trenutno: 1.10 },
    2: { trajno: 0.60, dugotrajno: 0.70, srednje: 0.80, kratkotrajno: 0.90, trenutno: 1.10 },
    3: { trajno: 0.50, dugotrajno: 0.55, srednje: 0.65, kratkotrajno: 0.70, trenutno: 0.90 }
  };

  /* ---------- 4. EVROKOD PROVERE ---------- */

  // EN 1990, izraz (6.10): osnovna kombinacija za granicno stanje nosivosti.
  function kombinacija(g, q) { return { Ed: 1.35 * g + 1.5 * q, gG: 1.35, gQ: 1.5 }; }

  // EN 1992-1-1 par. 6.1: pravougaoni presek, jednostruko armiran, lambda = 0.8, eta = 1.0.
  function ec2Savijanje(o) {
    var c = BETON[o.beton];
    if (!c) throw new Error('nepoznata klasa betona: ' + o.beton);
    var s = ARMATURA[o.armatura || 'B500B'];
    var acc = o.alfaCC == null ? 0.85 : o.alfaCC;
    var gc = o.gammaC || 1.5, gs = o.gammaS || 1.15;
    var fcd = acc * c.fck / gc, fyd = s.fyk / gs;
    var b = o.b, d = o.d, MEd = o.MEd * 1e6;   // kNm -> Nmm
    var mu = MEd / (b * d * d * fcd);
    var ksiLim = 0.45;
    var muLim = 0.8 * ksiLim * (1 - 0.4 * ksiLim);
    var pod = 1 - 2 * mu;
    if (pod < 0) {
      return {
        ok: false, mu: mu, fcd: fcd, fyd: fyd, muLim: muLim,
        MRdLim: muLim * b * d * d * fcd / 1e6,
        zasto: 'mu > 0.5 - presek je premali za ovaj moment (jednostruka armatura ne pomaze)'
      };
    }
    var ksi = 1.25 * (1 - Math.sqrt(pod));
    var z = d * (1 - 0.4 * ksi);
    var As = MEd / (fyd * z);
    var AsMin = Math.max(0.26 * c.fctm / s.fyk * b * d, 0.0013 * b * d); // par. 9.2.1.1
    return {
      ok: ksi <= ksiLim, mu: mu, muLim: muLim, ksi: ksi, x: ksi * d, z: z,
      fcd: fcd, fyd: fyd, As: As, AsMin: AsMin, AsReq: Math.max(As, AsMin),
      MRdLim: muLim * b * d * d * fcd / 1e6,
      zasto: ksi <= ksiLim ? 'duktilno: ksi <= 0.45'
                           : 'ksi > 0.45 - povecaj presek ili uvedi pritisnutu armaturu'
    };
  }

  // EN 1993-1-1 par. 6.2.5 i 6.2.6: savijanje i smicanje, presek klase 1 ili 2.
  function ec3Greda(o) {
    var m = CELIK[o.celik];
    if (!m) throw new Error('nepoznata klasa celika: ' + o.celik);
    var gM0 = o.gammaM0 || 1.0;
    var pretpostavljen = o.Wpl == null;
    var Wpl = pretpostavljen ? 1.15 * o.Wel : o.Wpl;
    var MRd = Wpl * m.fy / gM0 / 1e6;                                     // kNm
    var VRd = o.Av ? o.Av * m.fy / (Math.sqrt(3) * gM0) / 1e3 : null;      // kN
    var iskM = o.MEd / MRd;
    var iskV = (VRd != null && o.VEd != null) ? o.VEd / VRd : null;
    return {
      fy: m.fy, Wpl: Wpl, MRd: MRd, VRd: VRd,
      iskoriscenje: iskM, iskoriscenjeV: iskV,
      ok: iskM <= 1 && (iskV == null || iskV <= 1),
      WplPretpostavljen: pretpostavljen
    };
  }

  // EN 1995-1-1 par. 6.1.6 i 2.4.1: savijanje i smicanje pravougaone drvene grede.
  function ec5Greda(o) {
    var m = DRVO[o.drvo];
    if (!m) throw new Error('nepoznata klasa drveta: ' + o.drvo);
    var gM = o.gammaM || (m.lamelirano ? 1.25 : 1.3);
    var kmod = KMOD[o.klasa || 1][o.trajanje || 'srednje'];
    var h = o.h, b = o.b;
    var kh = (!m.lamelirano && h < 150) ? Math.min(Math.pow(150 / h, 0.2), 1.3) : 1.0;
    var fmd = kmod * kh * m.fmk / gM;
    var fvd = kmod * m.fvk / gM;
    var W = b * h * h / 6;
    var sigma = o.MEd * 1e6 / W;
    var tau = o.VEd != null ? 1.5 * o.VEd * 1e3 / (b * h) : null;
    return {
      kmod: kmod, kh: kh, gammaM: gM, fmd: fmd, fvd: fvd, W: W,
      sigma: sigma, tau: tau,
      iskoriscenje: sigma / fmd,
      iskoriscenjeV: tau == null ? null : tau / fvd,
      ok: sigma <= fmd && (tau == null || tau <= fvd),
      E0mean: m.E0mean
    };
  }

  // Ugib proste grede, ravnomerno opterecenje: 5qL^4/(384EI). q u kN/m, L u m, rezultat u mm.
  function ugibUDL(q_kNm, L_m, E_MPa, I_mm4) {
    var q = q_kNm;           // kN/m == N/mm
    var L = L_m * 1000;
    return 5 * q * Math.pow(L, 4) / (384 * E_MPa * I_mm4);
  }

  var API = {
    reakcije: reakcije, unutrasnje: unutrasnje, dijagrami: dijagrami, razlozi: razlozi,
    pravougaonik: pravougaonik, krug: krug, iPresek: iPresek, slozen: slozen,
    BETON: BETON, CELIK: CELIK, DRVO: DRVO, ARMATURA: ARMATURA, KMOD: KMOD,
    kombinacija: kombinacija, ec2Savijanje: ec2Savijanje, ec3Greda: ec3Greda,
    ec5Greda: ec5Greda, ugibUDL: ugibUDL
  };
  root.Mehanika = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
