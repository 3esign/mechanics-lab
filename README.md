# Mechanics Lab

An open, interactive mechanics course for civil engineering and architecture students:
statics, strength of materials, and design of concrete, timber and steel to the Eurocodes.

**Live: https://3esign.github.io/mechanics-lab/** · [Srpski](README.sr.md)

Zero dependencies, zero trackers, zero accounts. Plain HTML, CSS and JavaScript — clone the
folder, open `index.html`, and everything works offline, including on a phone.

## What is in it

| Page | What it does |
|---|---|
| `index.html` | What the pilot is, and — on the front page, not in a footnote — what it is **not** |
| `program.html` | A 15-week syllabus: goals, learning outcomes, weekly content, assessment |
| `lab.html` | Three live instruments: beam reactions and V/M diagrams · section properties · Eurocode design checks |
| `zadaci.html` | Randomised tasks with 2% tolerance, instant checking and worked steps |
| `metod.html` | The teaching method, the sources with check dates, and the limits of every calculation |
| `ucestvuj.html` | How to contribute, and what will not be accepted |

## The calculation core

`assets/mehanika.js` is a single dependency-free module that runs identically in the browser
and in Node:

- **Statics** — reactions and internal forces for simply supported beams, cantilevers and
  overhangs under point loads, uniform loads and applied moments; V and M diagrams with jumps.
- **Sections** — rectangle, circle, I and T built from geometry: A, I<sub>y</sub>, W<sub>y</sub>, centroid.
- **Materials** — EN 1992 Tab. 3.1 concrete classes, EN 1993 Tab. 3.1 steel grades,
  EN 338 timber classes, EN 1995 Tab. 3.1 k<sub>mod</sub>.
- **Design** — EN 1992 §6.1 bending (rectangular stress block, μ → ξ → z → A<sub>s</sub>, A<sub>s,min</sub>,
  ductility limit), EN 1993 §6.2.5/6.2.6 (M<sub>c,Rd</sub>, V<sub>pl,Rd</sub>), EN 1995 §6.1.6/§2.4.1
  (k<sub>mod</sub>, k<sub>h</sub>, bending and shear), EN 1990 (6.10) load combination, UDL deflection.

Sign convention, written at the top of the file because sign errors are the most common student
error: x runs left to right in metres; downward load positive; upward reaction positive; applied
moment clockwise-positive; **V** is the sum of upward forces left of the cut; **M** is positive
when the bottom fibre is in tension, and is plotted on the tension side.

## Tests

```sh
node tests/mehanika.test.js   # 77 checks on the calculation core
node tests/sajt.test.js       # 118 checks on the site
```

No test runner, no `npm install`. The core suite does not only compare against remembered
numbers:

- closed-form checks (qL²/8, PL/4, Pab/L, qL²/2, 3qL²/32, moment jump = applied moment);
- **invariants on 200 seeded random beams**: ΣF = 0, ΣM = 0, and dM/dx = V verified numerically
  at 1,800 points — these catch errors a worked example cannot, because they do not know the
  answer, only what must hold;
- the I<sub>y</sub> of a T-section checked against **numerical integration** over 400,000 strips,
  not against another formula;
- **section equilibrium** after the EN 1992 calculation: F<sub>c</sub> = F<sub>s</sub> and
  F<sub>c</sub>·z = M<sub>Ed</sub> — physics, not a book value;
- **limits**: three supports must return `odredjen: false` and asking for internal forces on such
  a system must throw; an assumed W<sub>pl</sub> must be flagged.

The site suite checks what only shows up when a page is opened: an id a script looks for but the
HTML lacks, a dead internal link, an external resource that would break the zero-dependency rule,
an unpaired Serbian/English block, a material class offered in a `<select>` that the core does not
know, and whether the "77 checks" claim in the page text still matches the real count.

## Limits — read before using in class

This is a **teaching** tool, not design software. It does not solve statically indeterminate
systems, trusses or frames; it does not do EN 1992 shear, lateral-torsional buckling, section
classification, serviceability cracking, connections or fire. The I-section is built without root
fillets and yields 93–97% of the tabulated I<sub>y</sub>; that ratio is asserted by a test and
printed next to the result. Partial factors used are stated on the page; a national annex may
prescribe others. In Serbia, design follows SRPS EN 1990/1991/1992/1997/1998 with national annexes
under the Regulation on Building Structures — a real project is signed by a licensed engineer.

Full list of what the core does and does not do, with sources and check dates: `metod.html`.

## Licence

Code (`assets/*.js`, `tests/*`): MIT. Text, syllabus and tasks: CC BY-SA 4.0. The EN / SRPS EN
standards are not included here and remain the copyrighted work of their publishers.
