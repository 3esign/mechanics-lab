# Mechanics Lab

Otvoren interaktivni kurs mehanike za studente građevine i arhitekture: statika, otpornost
materijala i dimenzionisanje betona, drveta i čelika po Evrokodu.

**Uživo: https://3esign.github.io/mechanics-lab/** · [English](README.md)

Bez ijedne zavisnosti, bez pratilaca, bez naloga. Čist HTML, CSS i JavaScript — kloniraj folder,
otvori `index.html`, i sve radi bez mreže, i na telefonu.

## Šta ima unutra

| Strana | Šta radi |
|---|---|
| `index.html` | Šta pilot jeste i — na prvoj strani, ne u fusnoti — šta **nije** |
| `program.html` | Program od 15 nedelja: cilj, ishodi učenja, sadržaj po nedeljama, ocenjivanje |
| `lab.html` | Tri živa instrumenta: reakcije i dijagrami V i M · karakteristike preseka · provere po Evrokodu |
| `zadaci.html` | Zadaci sa nasumičnim brojevima, tolerancija 2%, trenutna provera i ispisani koraci |
| `metod.html` | Metod nastave, izvori sa datumom provere i granica svakog proračuna |
| `ucestvuj.html` | Kako se učestvuje i šta se neće prihvatiti |

## Jezgro proračuna

`assets/mehanika.js` je jedan modul bez zavisnosti koji radi isto u pregledaču i u Node-u:

- **Statika** — reakcije i unutrašnje sile za prostu gredu, konzolu i gredu sa prepustima, pod
  koncentrisanom silom, ravnomernim opterećenjem i koncentrisanim momentom; dijagrami V i M sa skokovima.
- **Preseci** — pravougaonik, krug, I i T iz geometrije: A, I<sub>y</sub>, W<sub>y</sub>, težište.
- **Materijali** — EN 1992 tab. 3.1 klase betona, EN 1993 tab. 3.1 klase čelika, EN 338 klase
  drveta, EN 1995 tab. 3.1 k<sub>mod</sub>.
- **Dimenzionisanje** — EN 1992 §6.1 savijanje (blok napona, μ → ξ → z → A<sub>s</sub>,
  A<sub>s,min</sub>, granica duktilnosti), EN 1993 §6.2.5/6.2.6, EN 1995 §6.1.6/§2.4.1,
  kombinacija po EN 1990 (6.10), ugib pod ravnomernim opterećenjem.

Konvencija znaka stoji na vrhu fajla, jer je greška u znaku najčešća studentska greška: x raste
s leva na desno u metrima; opterećenje nadole pozitivno; reakcija nagore pozitivna; spoljni moment
u smeru kazaljke pozitivan; **V** je zbir sila nagore levo od reza; **M** je pozitivno kad je
zategnuto donje vlakno i crta se na zategnutoj strani.

## Testovi

```sh
node tests/mehanika.test.js   # 77 provera jezgra
node tests/sajt.test.js       # 118 provera sajta
```

Bez pokretača testova, bez `npm install`. Jezgro se ne proverava samo zapamćenim brojevima:

- poznata rešenja (qL²/8, PL/4, Pab/L, qL²/2, 3qL²/32, skok momenta = primenjeni moment);
- **invarijante na 200 nasumičnih greda**: ΣF = 0, ΣM = 0 i dM/dx = V numerički u 1.800 tačaka —
  one hvataju greške koje rešen primer ne hvata, jer ne znaju odgovor, nego samo šta mora da važi;
- I<sub>y</sub> T preseka prema **numeričkom integraljenju** u 400.000 traka, a ne prema drugoj formuli;
- **ravnoteža preseka** posle proračuna po EN 1992: F<sub>c</sub> = F<sub>s</sub> i
  F<sub>c</sub>·z = M<sub>Ed</sub> — fizika, ne broj iz knjige;
- **granice**: tri oslonca moraju da vrate `odredjen: false`, a poziv unutrašnjih sila na takvom
  sistemu mora da baci grešku; pretpostavljen W<sub>pl</sub> mora da bude označen.

Test sajta hvata ono što se vidi tek kad se strana otvori: id koji skripta traži a HTML ga nema,
mrtvu unutrašnju vezu, spoljni resurs koji bi probio pravilo nula zavisnosti, nesparen jezički
par, klasu materijala ponuđenu u selektoru koju jezgro ne poznaje, i da li tvrdnja „77 provera"
u tekstu i dalje odgovara stvarnom broju.

## Granice — pročitaj pre upotrebe u nastavi

Ovo je **nastavni** alat, nije softver za projektovanje. Ne rešava statički neodređene sisteme,
rešetke ni okvire; nema smicanje po EN 1992, bočno-torziono izvijanje, klasifikaciju preseka,
prslinu i ugib po GSU, veze ni požar. I presek se gradi bez zaobljenja i daje 93–97% tabličnog
I<sub>y</sub>; taj odnos drži test i ispisuje se uz rezultat. Korišćeni parcijalni koeficijenti
pišu na strani; nacionalni prilog može propisati druge. U Srbiji se projektuje po SRPS EN
1990/1991/1992/1997/1998 sa nacionalnim prilozima, prema Pravilniku za građevinske konstrukcije —
stvaran projekat potpisuje ovlašćeni inženjer.

Pun spisak šta jezgro radi i šta ne radi, sa izvorima i datumima provere: `metod.html`.

## Licenca

Kod (`assets/*.js`, `tests/*`): MIT. Tekst, program i zadaci: CC BY-SA 4.0. Standardi EN i SRPS EN
nisu ovde priloženi i ostaju autorsko delo svojih izdavača.
