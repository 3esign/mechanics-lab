/* Provera jezgra. Pokretanje: node tests/mehanika.test.js
   Pravilo: ne proveravamo samo zapamcene brojeve, nego i invarijante
   (ravnoteza, dM/dx = V, ravnoteza preseka u EC2). */
'use strict';
var M = require('../assets/mehanika.js');

var pao = 0, prosao = 0;
function blizu(a, b, tol, sta) {
  tol = tol == null ? 1e-6 : tol;
  if (Math.abs(a - b) <= tol) { prosao++; return; }
  pao++;
  console.log('  PAO  ' + sta + ': dobijeno ' + a + ', ocekivano ' + b + ' (tol ' + tol + ')');
}
function istina(c, sta) {
  if (c) { prosao++; return; }
  pao++;
  console.log('  PAO  ' + sta);
}
function grupa(ime) { console.log('\n' + ime); }

/* ---- 1. prosta greda, sila u sredini ---- */
grupa('1. prosta greda L=6, P=12 kN u sredini');
var b1 = { L: 6, supports: [{ x: 0, type: 'pin' }, { x: 6, type: 'roller' }],
           loads: [{ type: 'point', x: 3, P: 12 }] };
var r1 = M.reakcije(b1);
blizu(r1.reakcije[0].F, 6, 1e-9, 'Ra = P/2');
blizu(r1.reakcije[1].F, 6, 1e-9, 'Rb = P/2');
blizu(M.unutrasnje(b1, 3, +1).M, 18, 1e-9, 'Mmax = PL/4');
blizu(M.unutrasnje(b1, 3, -1).V, 6, 1e-9, 'V levo od sile = +P/2');
blizu(M.unutrasnje(b1, 3, +1).V, -6, 1e-9, 'V desno od sile = -P/2');
blizu(M.unutrasnje(b1, 0, +1).M, 0, 1e-9, 'M(0) = 0');
blizu(M.unutrasnje(b1, 6, +1).M, 0, 1e-9, 'M(L) = 0');

/* ---- 2. prosta greda, ravnomerno opterecenje ---- */
grupa('2. prosta greda L=6, q=10 kN/m');
var b2 = { L: 6, supports: [{ x: 0, type: 'pin' }, { x: 6, type: 'roller' }],
           loads: [{ type: 'udl', x1: 0, x2: 6, q: 10 }] };
var r2 = M.reakcije(b2);
blizu(r2.reakcije[0].F, 30, 1e-9, 'Ra = qL/2');
blizu(M.unutrasnje(b2, 3, +1).M, 45, 1e-9, 'Mmax = qL^2/8');
blizu(M.unutrasnje(b2, 3, +1).V, 0, 1e-9, 'V(L/2) = 0');
blizu(M.unutrasnje(b2, 1.5, +1).M, 33.75, 1e-9, 'M(L/4) = 3qL^2/32');

/* ---- 3. prosta greda, sila van sredine: M = Pab/L ---- */
grupa('3. prosta greda L=8, P=20 kN na a=3');
var a = 3, bb = 5, P = 20, L = 8;
var b3 = { L: L, supports: [{ x: 0, type: 'pin' }, { x: L, type: 'roller' }],
           loads: [{ type: 'point', x: a, P: P }] };
var r3 = M.reakcije(b3);
blizu(r3.reakcije[0].F, P * bb / L, 1e-9, 'Ra = Pb/L');
blizu(r3.reakcije[1].F, P * a / L, 1e-9, 'Rb = Pa/L');
blizu(M.unutrasnje(b3, a, +1).M, P * a * bb / L, 1e-9, 'M(a) = Pab/L');

/* ---- 4. konzola, sila na kraju ---- */
grupa('4. konzola L=3 ukljestena u x=0, P=5 kN na kraju');
var b4 = { L: 3, supports: [{ x: 0, type: 'fixed' }], loads: [{ type: 'point', x: 3, P: 5 }] };
var r4 = M.reakcije(b4);
blizu(r4.reakcije[0].F, 5, 1e-9, 'R = P');
blizu(M.unutrasnje(b4, 0, +1).M, -15, 1e-9, 'M(0) = -PL (zatezanje gornjeg vlakna)');
blizu(M.unutrasnje(b4, 1.5, +1).M, -7.5, 1e-9, 'M(L/2) = -P*L/2');
blizu(M.unutrasnje(b4, 3, +1).M, 0, 1e-9, 'M(L) = 0');
blizu(M.unutrasnje(b4, 1, +1).V, 5, 1e-9, 'V = +P svuda');

/* ---- 5. konzola, ravnomerno opterecenje ---- */
grupa('5. konzola L=4, q=6 kN/m');
var b5 = { L: 4, supports: [{ x: 0, type: 'fixed' }], loads: [{ type: 'udl', x1: 0, x2: 4, q: 6 }] };
blizu(M.reakcije(b5).reakcije[0].F, 24, 1e-9, 'R = qL');
blizu(M.unutrasnje(b5, 0, +1).M, -48, 1e-9, 'M(0) = -qL^2/2');
blizu(M.unutrasnje(b5, 4, +1).M, 0, 1e-9, 'M(L) = 0');

/* ---- 6. greda sa prepustima ---- */
grupa('6. greda L=8 sa prepustima, oslonci na 1 i 6, q=10 kN/m po celoj duzini');
var b6 = { L: 8, supports: [{ x: 1, type: 'pin' }, { x: 6, type: 'roller' }],
           loads: [{ type: 'udl', x1: 0, x2: 8, q: 10 }] };
var r6 = M.reakcije(b6);
blizu(r6.reakcije[0].F + r6.reakcije[1].F, 80, 1e-9, 'suma reakcija = qL');
blizu(M.unutrasnje(b6, 0, +1).M, 0, 1e-9, 'M na slobodnom levom kraju = 0');
blizu(M.unutrasnje(b6, 8, +1).M, 0, 1e-9, 'M na slobodnom desnom kraju = 0');
blizu(M.unutrasnje(b6, 1, +1).M, -5, 1e-9, 'M nad levim osloncem = -q*1^2/2');
blizu(M.unutrasnje(b6, 6, +1).M, -20, 1e-9, 'M nad desnim osloncem = -q*2^2/2');

/* ---- 7. koncentrisan moment: skok u dijagramu M ---- */
grupa('7. prosta greda L=6, moment M0=30 kNm (u smeru kazaljke) u sredini');
var b7 = { L: 6, supports: [{ x: 0, type: 'pin' }, { x: 6, type: 'roller' }],
           loads: [{ type: 'moment', x: 3, M: 30 }] };
var r7 = M.reakcije(b7);
blizu(r7.reakcije[0].F, -5, 1e-9, 'Ra = -M0/L');
blizu(r7.reakcije[1].F, 5, 1e-9, 'Rb = +M0/L');
var skok = M.unutrasnje(b7, 3, +1).M - M.unutrasnje(b7, 3, -1).M;
blizu(skok, 30, 1e-9, 'skok momenta = M0');
blizu(M.unutrasnje(b7, 0, +1).M, 0, 1e-9, 'M(0) = 0');
blizu(M.unutrasnje(b7, 6, +1).M, 0, 1e-9, 'M(L) = 0');

/* ---- 8. invarijante na nasumicnim gredama: ravnoteza i dM/dx = V ---- */
grupa('8. invarijante na 200 nasumicnih greda (seed-ovan generator)');
var seed = 20261001;
function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
var greskaRavnoteze = 0, greskaIzvoda = 0, ispitano = 0;
for (var t = 0; t < 200; t++) {
  var Lr = 3 + rnd() * 9;
  var x1 = rnd() * Lr * 0.4, x2 = Lr * (0.6 + rnd() * 0.4);
  var beam = { L: Lr, supports: [{ x: x1, type: 'pin' }, { x: x2, type: 'roller' }], loads: [] };
  var nl = 1 + Math.floor(rnd() * 3);
  var gsum = 0, gmom = 0;
  for (var k = 0; k < nl; k++) {
    var kind = rnd();
    if (kind < 0.45) {
      var Pp = 2 + rnd() * 30, xp = rnd() * Lr;
      beam.loads.push({ type: 'point', x: xp, P: Pp });
      gsum += -Pp; gmom += -Pp * (0 - xp);
    } else if (kind < 0.85) {
      var qa = rnd() * Lr * 0.5, qb = qa + rnd() * (Lr - qa);
      var qq = 1 + rnd() * 15;
      beam.loads.push({ type: 'udl', x1: qa, x2: qb, q: qq });
      var F = -qq * (qb - qa), xc = (qa + qb) / 2;
      gsum += F; gmom += F * (0 - xc);
    } else {
      var M0 = (rnd() - 0.5) * 60, xm = rnd() * Lr;
      beam.loads.push({ type: 'moment', x: xm, M: M0 });
      gmom += M0;
    }
  }
  var sol = M.reakcije(beam);
  var sF = sol.reakcije.reduce(function (s, R) { return s + R.F; }, 0) + gsum;
  var sM = sol.reakcije.reduce(function (s, R) { return s + R.F * (0 - R.x); }, 0) + gmom;
  if (Math.abs(sF) > 1e-7 * (1 + Math.abs(gsum))) greskaRavnoteze++;
  if (Math.abs(sM) > 1e-6 * (1 + Math.abs(gmom))) greskaRavnoteze++;

  // dM/dx = V u tackama bez skokova
  for (var j = 0; j < 12; j++) {
    var xq = Lr * (j + 0.5) / 12;
    var h = 1e-5;
    var blizuSkoka = beam.loads.some(function (l) {
      var xs = l.type === 'udl' ? [l.x1, l.x2] : [l.x];
      return xs.some(function (v) { return Math.abs(v - xq) < 1e-3; });
    }) || [x1, x2, 0, Lr].some(function (v) { return Math.abs(v - xq) < 1e-3; });
    if (blizuSkoka) continue;
    var dM = (M.unutrasnje(beam, xq + h, +1).M - M.unutrasnje(beam, xq - h, +1).M) / (2 * h);
    var Vv = M.unutrasnje(beam, xq, +1).V;
    ispitano++;
    if (Math.abs(dM - Vv) > 1e-3 * (1 + Math.abs(Vv))) greskaIzvoda++;
  }
}
istina(greskaRavnoteze === 0, 'ravnoteza na 200 greda (gresaka: ' + greskaRavnoteze + ')');
istina(greskaIzvoda === 0, 'dM/dx = V u ' + ispitano + ' tacaka (gresaka: ' + greskaIzvoda + ')');

/* ---- 9. geometrija preseka ---- */
grupa('9. geometrija preseka');
var p = M.pravougaonik(200, 400);
blizu(p.A, 80000, 1e-9, 'A = b*h');
blizu(p.Iy, 200 * Math.pow(400, 3) / 12, 1e-3, 'Iy = bh^3/12');
blizu(p.Wy, 200 * 400 * 400 / 6, 1e-3, 'Wy = bh^2/6');
blizu(p.Iy / (p.h / 2), p.Wy, 1e-6, 'Wy = Iy/(h/2)');
var kr = M.krug(300);
blizu(kr.Iy / (150), kr.Wy, 1e-6, 'krug: Wy = Iy/r');
// T presek: ploca 400/100 na vrhu, rebro 150/300 ispod. Rucno: A=40000+45000=85000
var T = M.slozen([{ b: 400, h: 100, yc: 50 }, { b: 150, h: 300, yc: 250 }]);
blizu(T.A, 85000, 1e-9, 'T presek: A');
blizu(T.zg, (40000 * 50 + 45000 * 250) / 85000, 1e-9, 'T presek: teziste');
// Nezavisna provera Iy preko numerickog integraljenja po visini
var h0 = 400, n0 = 400000, Inum = 0;
for (var i0 = 0; i0 < n0; i0++) {
  var y = (i0 + 0.5) * h0 / n0;
  var sirina = y < 100 ? 400 : 150;
  Inum += sirina * Math.pow(y - T.zg, 2) * (h0 / n0);
}
blizu(T.Iy, Inum, Math.abs(Inum) * 1e-6, 'T presek: Iy prema numerickoj integraciji');

/* ---- 10. I presek bez zaobljenja: izmerena razlika prema tablici IPE 200 ---- */
grupa('10. IPE 200 iz geometrije (h=200 b=100 tw=5.6 tf=8.5)');
var ipe = M.iPresek(200, 100, 5.6, 8.5);
var IyTablica = 1943e4;  // mm^4, tablica profila (sa zaobljenjima r=12)
var odnos = ipe.Iy / IyTablica;
istina(odnos > 0.93 && odnos < 0.97,
  'Iy bez zaobljenja je 93-97% tablicnog (izmereno ' + (odnos * 100).toFixed(1) + '%)');
istina(/zaobljenja/.test(ipe.napomena || ''), 'presek nosi napomenu o zaobljenjima');

/* ---- 11. EC2: savijanje, uz nezavisnu proveru ravnoteze preseka ---- */
grupa('11. EC2 savijanje: b=300 d=450 C25/30 B500B MEd=200 kNm');
var e2 = M.ec2Savijanje({ b: 300, d: 450, beton: 'C25/30', MEd: 200 });
blizu(e2.fcd, 0.85 * 25 / 1.5, 1e-9, 'fcd = 0.85*fck/1.5');
blizu(e2.fyd, 500 / 1.15, 1e-9, 'fyd = fyk/1.15');
istina(e2.ok, 'duktilno resenje (ksi = ' + e2.ksi.toFixed(3) + ')');
// nezavisno: Fc = fcd*b*0.8x mora biti jednako Fs = As*fyd, i Fc*z mora dati MEd
var Fc = e2.fcd * 300 * 0.8 * e2.x;
var Fs = e2.As * e2.fyd;
blizu(Fc, Fs, Math.abs(Fs) * 1e-9, 'ravnoteza sila u preseku: Fc = Fs');
blizu(Fc * e2.z / 1e6, 200, 1e-6, 'ravnoteza momenata: Fc*z = MEd');
istina(e2.As > 1150 && e2.As < 1210, 'As oko 1181 mm2 (dobijeno ' + e2.As.toFixed(0) + ')');
blizu(e2.AsMin, Math.max(0.26 * 2.6 / 500 * 300 * 450, 0.0013 * 300 * 450), 1e-6, 'As,min po 9.2.1.1');
// prevelik moment mora biti odbijen, ne precutan
var e2b = M.ec2Savijanje({ b: 200, d: 200, beton: 'C20/25', MEd: 200 });
istina(e2b.ok === false, 'premali presek se odbija sa objasnjenjem');
istina(typeof e2b.zasto === 'string' && e2b.zasto.length > 10, 'odbijanje nosi razlog');

/* ---- 12. EC3 ---- */
grupa('12. EC3 greda: S235, Wpl = 220000 mm3');
var e3 = M.ec3Greda({ celik: 'S235', Wpl: 220e3, MEd: 40, Av: 1400, VEd: 100 });
blizu(e3.MRd, 220e3 * 235 / 1e6, 1e-9, 'MRd = Wpl*fy/gM0');
blizu(e3.VRd, 1400 * 235 / Math.sqrt(3) / 1e3, 1e-9, 'VRd = Av*fy/(sqrt(3)*gM0)');
istina(e3.ok, 'presek prolazi');
istina(e3.WplPretpostavljen === false, 'Wpl nije pretpostavljen kad je dat');
var e3b = M.ec3Greda({ celik: 'S235', Wel: 100e3, MEd: 10 });
istina(e3b.WplPretpostavljen === true, 'bez Wpl se oznacava pretpostavka');

/* ---- 13. EC5 ---- */
grupa('13. EC5 greda: C24, klasa 1, srednje trajanje, 100/200, MEd=8 kNm');
var e5 = M.ec5Greda({ drvo: 'C24', b: 100, h: 200, MEd: 8, VEd: 10 });
blizu(e5.kmod, 0.8, 1e-9, 'kmod = 0.80');
blizu(e5.kh, 1.0, 1e-9, 'kh = 1 za h >= 150');
blizu(e5.fmd, 0.8 * 24 / 1.3, 1e-9, 'fmd = kmod*fmk/1.3');
blizu(e5.sigma, 8e6 / (100 * 200 * 200 / 6), 1e-6, 'sigma = M/W');
istina(e5.ok, 'presek prolazi (iskoriscenje ' + e5.iskoriscenje.toFixed(2) + ')');
var e5b = M.ec5Greda({ drvo: 'C24', b: 80, h: 120, MEd: 2 });
istina(e5b.kh > 1 && e5b.kh <= 1.3, 'kh > 1 za h < 150 mm (dobijeno ' + e5b.kh.toFixed(3) + ')');
var e5c = M.ec5Greda({ drvo: 'GL24h', b: 100, h: 300, MEd: 10 });
blizu(e5c.gammaM, 1.25, 1e-9, 'gammaM = 1.25 za lamelirano');

/* ---- 14. kombinacija i ugib ---- */
grupa('14. kombinacija opterecenja i ugib');
blizu(M.kombinacija(4, 3).Ed, 1.35 * 4 + 1.5 * 3, 1e-9, '1.35G + 1.5Q');
var Irect = 100 * Math.pow(200, 3) / 12;
var w = M.ugibUDL(5, 5, 11000, Irect);
blizu(w, 5 * 5 * Math.pow(5000, 4) / (384 * 11000 * Irect), 1e-9, 'ugib 5qL^4/384EI');
istina(w > 50 && w < 60, 'ugib oko 55 mm (dobijeno ' + w.toFixed(1) + ')');

/* ---- 15. dijagrami: ekstremi i kljucne tacke ---- */
grupa('15. uzorkovanje dijagrama');
var d2 = M.dijagrami(b2, 200);
blizu(Math.abs(d2.Mmax.M), 45, 1e-6, 'Mmax iz uzorkovanja = qL^2/8');
blizu(Math.abs(d2.Vmax.V), 30, 1e-9, 'Vmax iz uzorkovanja = qL/2');
var d1 = M.dijagrami(b1, 200);
blizu(Math.abs(d1.Vmax.V), 6, 1e-9, 'skok sile je uhvacen u uzorkovanju');
blizu(Math.abs(d1.Mmax.M), 18, 1e-6, 'vrh momenta pod silom je uhvacen');
var d6 = M.dijagrami(b6, 300);
istina(d6.M.some(function (pt) { return pt.M < -19.9; }), 'negativan moment nad prepustom postoji');
istina(d6.M.some(function (pt) { return pt.M > 0; }), 'pozitivan moment u polju postoji');

/* ---- 16. staticki neodredjeno se ne resava tiho ---- */
grupa('16. granica resavaca');
var b8 = { L: 6, supports: [{ x: 0, type: 'pin' }, { x: 3, type: 'roller' }, { x: 6, type: 'roller' }],
           loads: [{ type: 'udl', x1: 0, x2: 6, q: 10 }] };
var r8 = M.reakcije(b8);
istina(r8.odredjen === false, 'tri oslonca: resavac kaze da ne ume');
istina(typeof r8.zasto === 'string', 'granica nosi objasnjenje');
var pukao = false;
try { M.unutrasnje(b8, 2, +1); } catch (e) { pukao = true; }
istina(pukao, 'poziv unutrasnjih sila na neodredjenom sistemu baca gresku, ne vraca broj');

console.log('\n==== ' + prosao + ' provera proslo, ' + pao + ' palo ====');
process.exit(pao === 0 ? 0 : 1);
