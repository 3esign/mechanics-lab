/* Provera sajta bez pregledaca i bez zavisnosti: node tests/sajt.test.js
   Hvata ono sto se ne vidi dok se ne otvori strana: id koji skripta trazi a HTML ga nema,
   vezu na fajl koji ne postoji, spoljni resurs koji bi probio pravilo nula zavisnosti,
   i nesparen jezicki par. */
'use strict';
var fs = require('fs');
var path = require('path');
var cp = require('child_process');

var ROOT = path.join(__dirname, '..');
var pao = 0, prosao = 0;
function ok(c, sta) { if (c) { prosao++; } else { pao++; console.log('  PAO  ' + sta); } }
function grupa(s) { console.log('\n' + s); }
function citaj(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }

var STRANE = ['index.html', 'lab.html', 'zadaci.html', 'program.html', 'metod.html', 'ucestvuj.html'];
var SKRIPTE = ['assets/mehanika.js', 'assets/app.js', 'assets/lab.js', 'assets/zadaci.js'];

/* ---- 1. sintaksa svih skripti ---- */
grupa('1. sintaksa skripti');
SKRIPTE.concat(['tests/mehanika.test.js']).forEach(function (f) {
  var r = cp.spawnSync(process.execPath, ['--check', path.join(ROOT, f)], { encoding: 'utf8' });
  ok(r.status === 0, f + ' se parsira (' + (r.stderr || '').split('\n')[0] + ')');
});

/* ---- 2. svi fajlovi postoje ---- */
grupa('2. fajlovi postoje');
STRANE.concat(SKRIPTE).concat(['assets/style.css', 'README.md', 'LICENSE']).forEach(function (f) {
  ok(fs.existsSync(path.join(ROOT, f)), f + ' postoji');
});

/* ---- 3. nema spoljnih resursa (nula zavisnosti, nula pratilaca) ---- */
grupa('3. nema spoljnih resursa u <script>, <link>, <img>');
STRANE.forEach(function (f) {
  var h = citaj(f);
  var spoljni = (h.match(/<(?:script|link|img)[^>]*(?:src|href)\s*=\s*"(https?:)?\/\/[^"]*"/gi) || []);
  ok(spoljni.length === 0, f + ' bez spoljnih resursa: ' + spoljni.join(' | '));
  ok(!/<script[^>]*>\s*[^<\s]/.test(h.replace(/<script[^>]*src=[^>]*><\/script>/g, '')),
     f + ' bez ugradjene skripte u telu strane');
});

/* ---- 4. unutrasnje veze vode na postojeci fajl ---- */
grupa('4. unutrasnje veze');
STRANE.forEach(function (f) {
  var h = citaj(f);
  var veze = (h.match(/href="([^"#:]+\.html)"/g) || []).map(function (m) {
    return m.replace(/href="|"/g, '');
  });
  var lose = veze.filter(function (v) { return !fs.existsSync(path.join(ROOT, v)); });
  ok(lose.length === 0, f + ' sve .html veze postoje (lose: ' + lose.join(', ') + ')');
  var res = (h.match(/(?:src|href)="(assets\/[^"]+)"/g) || []).map(function (m) {
    return m.replace(/(?:src|href)="|"/g, '');
  });
  var loseRes = res.filter(function (v) { return !fs.existsSync(path.join(ROOT, v)); });
  ok(loseRes.length === 0, f + ' svi assets postoje (lose: ' + loseRes.join(', ') + ')');
});

/* ---- 5. id koje skripta trazi mora postojati na svojoj strani ---- */
grupa('5. id-jevi koje skripte traze');
function idoviUFajlu(html) {
  var set = {};
  (html.match(/\sid="([^"]+)"/g) || []).forEach(function (m) {
    set[m.replace(/\sid="|"/g, '')] = true;
  });
  return set;
}
function traziID(js) {
  var set = {};
  var re = /el\('([^']+)'\)|getElementById\('([^']+)'\)/g, m;
  while ((m = re.exec(js))) set[m[1] || m[2]] = true;
  return Object.keys(set);
}
function veziIds(js) {
  // veziSve([...]) nizovi
  var out = [];
  var re = /veziSve\(\[([^\]]+)\]/g, m;
  while ((m = re.exec(js))) {
    (m[1].match(/'([^']+)'/g) || []).forEach(function (s) { out.push(s.replace(/'/g, '')); });
  }
  return out;
}
var idLab = idoviUFajlu(citaj('lab.html'));
var labJs = citaj('assets/lab.js');
var trebaLab = traziID(labJs).concat(veziIds(labJs));
var nemaLab = trebaLab.filter(function (id) { return !idLab[id]; });
ok(nemaLab.length === 0, 'lab.js: svaki id postoji u lab.html (nema: ' + nemaLab.join(', ') + ')');

var idZad = idoviUFajlu(citaj('zadaci.html'));
var nemaZad = traziID(citaj('assets/zadaci.js')).filter(function (id) { return !idZad[id]; });
ok(nemaZad.length === 0, 'zadaci.js: svaki id postoji u zadaci.html (nema: ' + nemaZad.join(', ') + ')');

STRANE.forEach(function (f) {
  var nema = traziID(citaj('assets/app.js')).filter(function (id) { return !idoviUFajlu(citaj(f))[id]; });
  ok(nema.length === 0, f + ': app.js nalazi langToggle (nema: ' + nema.join(', ') + ')');
});

/* ---- 6. grupe polja u lab.html imaju par u selektoru ---- */
grupa('6. grupe polja i vrednosti u selektorima');
var labHtml = citaj('lab.html');
function vrednostiSelekta(html, id) {
  var re = new RegExp('<select id="' + id + '"[\\s\\S]*?<\\/select>');
  var blok = (html.match(re) || [''])[0];
  var out = [];
  (blok.match(/<option[^>]*>/g) || []).forEach(function (o) {
    var m = o.match(/value="([^"]+)"/);
    out.push(m ? m[1] : null);
  });
  var tekst = (blok.match(/<option[^>]*>([^<]*)</g) || []).map(function (o) {
    return o.replace(/<option[^>]*>|</g, '').trim();
  });
  return out.map(function (v, i) { return v == null ? tekst[i] : v; });
}
function grupeAtributa(html, attr) {
  var set = {};
  var re = new RegExp('data-' + attr + '="([^"]+)"', 'g'), m;
  while ((m = re.exec(html))) set[m[1]] = true;
  return Object.keys(set);
}
[['materijal', 'mat'], ['tipPreseka', 'pres'], ['tipOpterecenja', 'opt']].forEach(function (par) {
  var vals = vrednostiSelekta(labHtml, par[0]);
  var grupe = grupeAtributa(labHtml, par[1]);
  var siroci = grupe.filter(function (g) { return vals.indexOf(g) === -1; });
  ok(siroci.length === 0, 'data-' + par[1] + ' grupe su sve u selektoru ' + par[0] +
     ' (visak: ' + siroci.join(', ') + ')');
  ok(vals.length > 0, 'selektor ' + par[0] + ' ima opcije');
});

// klase materijala u HTML selektorima moraju postojati u jezgru
var M = require('../assets/mehanika.js');
['klasaBetona', 'klasaDrveta', 'klasaCelika'].forEach(function (id) {
  var mapa = { klasaBetona: M.BETON, klasaDrveta: M.DRVO, klasaCelika: M.CELIK };
  var vals = vrednostiSelekta(labHtml, id).filter(Boolean);
  var nema = vals.filter(function (v) { return !mapa[id][v]; });
  ok(vals.length > 0 && nema.length === 0,
     id + ': sve klase postoje u jezgru (nema: ' + nema.join(', ') + ')');
});
// trajanja iz HTML-a moraju postojati u KMOD
var traj = vrednostiSelekta(labHtml, 'trajanje');
var nemaTraj = traj.filter(function (t) { return M.KMOD[1][t] == null; });
ok(nemaTraj.length === 0, 'trajanje: sve vrednosti postoje u KMOD (nema: ' + nemaTraj.join(', ') + ')');

/* ---- 7. jezicki parovi ---- */
grupa('7. srpski i engleski su spareni');
STRANE.forEach(function (f) {
  var h = citaj(f);
  var sr = (h.match(/class="sr"/g) || []).length;
  var en = (h.match(/class="en"/g) || []).length;
  ok(sr === en, f + ': ' + sr + ' sr naprema ' + en + ' en');
  ok(/id="langToggle"/.test(h), f + ' ima prekidac jezika');
  ok(/<html lang="sr-Latn">/.test(h), f + ' pocinje na srpskom');
});

/* ---- 8. osnovna pristupacnost ---- */
grupa('8. osnovna pristupacnost');
STRANE.forEach(function (f) {
  var h = citaj(f);
  ok(/class="skip" href="#main"/.test(h), f + ' ima preskakanje na sadrzaj');
  ok(/id="main"/.test(h), f + ' ima #main');
  ok(/<h1[ >]/.test(h), f + ' ima jedan h1');
  ok((h.match(/<h1[ >]/g) || []).length === 1, f + ' ima tacno jedan h1');
  ok(/viewport/.test(h), f + ' ima viewport za mobilni');
  ok(/<meta name="description"/.test(h), f + ' ima opis');
});
var sveCanvas = (labHtml.match(/<canvas[^>]*>/g) || []);
ok(sveCanvas.length > 0 && sveCanvas.every(function (c) { return /aria-label/.test(c); }),
   'svaki canvas ima aria-label');

/* ---- 9. tvrdnje na sajtu se poklapaju sa stvarnim brojem provera ---- */
grupa('9. broj provera u tekstu nije izmisljen');
var r = cp.spawnSync(process.execPath, [path.join(ROOT, 'tests', 'mehanika.test.js')],
  { encoding: 'utf8' });
var m = (r.stdout || '').match(/(\d+) provera proslo/);
var stvarno = m ? parseInt(m[1], 10) : -1;
ok(stvarno > 0, 'test jezgra se pokrece i broji (' + stvarno + ')');
['index.html', 'metod.html'].forEach(function (f) {
  var h = citaj(f);
  var pomenuti = (h.match(/(\d+)\s*(?:provera|checks)/g) || []).map(function (s) {
    return parseInt(s, 10);
  });
  var lose = pomenuti.filter(function (n) { return n !== stvarno; });
  ok(pomenuti.length > 0 && lose.length === 0,
     f + ' pominje tacan broj provera (' + stvarno + '); pogresno: ' + lose.join(', '));
});

console.log('\n==== ' + prosao + ' provera proslo, ' + pao + ' palo ====');
process.exit(pao === 0 ? 0 : 1);
