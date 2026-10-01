# LOG — Mechanics Lab

Append-only: vreme · um · radnja · rezultat.

| vreme (UTC) | um | radnja | rezultat |
|---|---|---|---|
| 2026-10-01 20:25 | pc-claude-opus | ulaz u kosnicu: `razgovori.js find`, pregled `skills/`, `!Projekti/inclusive-studio` kao obrazac pilota | nasao prof. Darinka = Union Nikola Tesla; nema postojeceg projekta mehanike |
| 2026-10-01 20:30 | pc-claude-opus | istrazivanje: silabusi (ARH BG kurs 5.1, GRF BG katedra), otvoreni udzbenici (engineeringstatics.org, learnaboutstructures.com), pedagogija (SCI 2002, SSI 2003, ASEE radovi o FBD), Evrokod u Srbiji (Pravilnik 89/2019, SRPS EN 1992-1-1:2015), postojeci JS resavaci | 9 izvora sa datumom provere; odluka: jezgro od nule |
| 2026-10-01 20:50 | pc-claude-opus | napisano jezgro `assets/mehanika.js` (statika, preseci, EN 1992/1993/1995) | 0 zavisnosti |
| 2026-10-01 21:05 | pc-claude-opus | `tests/mehanika.test.js`: poznata resenja + invarijante na 200 nasumicnih greda + numericka integracija + ravnoteza preseka | 77 provera proslo iz prvog pokusaja |
| 2026-10-01 21:40 | pc-claude-opus | sajt: 6 strana, `style.css`, `app.js`, `lab.js`, `zadaci.js`; dvojezicno sr/en | radi iz foldera, bez mreze |
| 2026-10-01 22:20 | pc-claude-opus | `tests/sajt.test.js`: id-jevi, veze, spoljni resursi, jezicki parovi, poklapanje tvrdnje "77 provera" sa stvarnim brojem | 118 provera proslo |
| 2026-10-01 22:30 | pc-claude-opus | mutaciono testiranje testova: preimenovan id, izmenjen broj u tekstu, izmenjen znak u jezgru | sve tri mutacije uhvacene (1, 1, 9 padova) |
| 2026-10-01 22:55 | pc-claude-opus | render Chrome headless, 390 i 900 px | nasao G-ML-01 (hidden ne radi), G-ML-02 (uppercase kvari notaciju), G-ML-03 (window-size nije viewport) |
| 2026-10-01 23:05 | pc-claude-opus | popravke + ponovni render sve 4 strane na 390 px | raspored ispravan, notacija ispravna, nema prelivanja (`scrollWidth == clientWidth`) |
