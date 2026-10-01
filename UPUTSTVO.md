# !Projekti/mechanics-lab — Uputstvo za izradu

Ovo je projektni rails: kako se TAČNO ovaj projekat pravi i kako novi agent nastavlja bez nagađanja. Gradi se kroz rad: svaka nova tehnika ili pravilo izrade ide ovde.

## Kako agent ulazi

1. Pročitaj `README.md` za smisao i status.
2. Pročitaj ovaj `UPUTSTVO.md` za pravila izrade.
3. Pročitaj poslednje redove `LOG.md` za tok rada.
4. Pročitaj `RECNIK.jsonl` za pojmove i komentare.
5. Pročitaj `KNOWLEDGE.md` za greške, iskustva, izvore, veštine i odluke.

## Kako se popunjava LOG.md

- Upisuje se svaka stvarna promena ili provera: vreme · um · radnja · rezultat.
- Ne prepravljaj stare redove; korekcija je novi red.
- Rezultat treba da kaže `ok`, `fail` ili `partial`, uz kratak razlog kad nije jasno.
- Ako je nešto provereno testom, napiši koji test.

## Kako se popunjava RECNIK.jsonl

- Jedan red je jedan JSON objekat.
- Koristi pojmove koje projekat stvarno ponavlja: keyword, lokalno značenje, komentar i izvor.
- Minimalno: `{"term":"pojam","definition":"značenje u ovom projektu","source":"README.md","at":"ISO vreme"}`.
- Ako je pojam komentar, ne odluka, stavi to u `definition` jasno: `komentar: ...`.
- Ne dupliraj isti pojam; ako se značenje promeni, dodaj novo objašnjenje u `KNOWLEDGE.md` ili odluku.

## Kako se popunjava KNOWLEDGE.md

- Greška ide u `# Greske`: uzrok i lek u jednoj ili dve rečenice.
- Iskustvo ide u `# Iskustva`: šta bi sledeći agent inače morao ponovo da otkrije.
- Izvor ide u `# Izvori`: link, fajl ili merenje iz kog tvrdnja dolazi.
- Odluka ide u `# Odluke`: šta je izabrano i zašto.

## Pravila izrade

- (još nema — dodavati kroz rad)

## Faze

- (definisati kroz `phase next`)
