# KNOWLEDGE — Mechanics Lab

Lekcija se upisuje u minutu kad je otkrivena, dok se još zna zašto je bila iznenađenje.

## Greske

**G-ML-01 · `hidden` atribut ne radi kad CSS postavi `display` na isti element.**
Polja preseka (I, T, krug) su ostala na ekranu iako nose `hidden` u HTML-u.
*Uzrok:* UA pravilo `[hidden] { display: none }` ima nižu specifičnost od `.ctl label { display: block }`,
pa ga naše pravilo nadjača. Atribut je bio tu, samo nije imao snagu.
*Lek:* `[hidden] { display: none !important; }` kao prvo pravilo sopstvenog lista.
*Kako je uhvaćeno:* snimkom strane, ne testom. Test je proveravao da id postoji, ne da li se vidi.

**G-ML-02 · `text-transform: uppercase` uništava inženjersku notaciju.**
Na ekranu je pisalo `FCD`, `Ξ = X/D`, `AS,MIN` i `I = √(I/A)` umesto `fcd`, `ξ = x/d`, `As,min`, `i`.
*Uzrok:* tipografsko pravilo za oznake primenjeno na mesto gde malo i veliko slovo nisu isti pojam
(`i` je poluprečnik inercije, `I` je moment inercije; `fcd` je čvrstoća, `Fcd` bi bila sila).
*Lek:* nikad `uppercase` na nizu koji nosi notaciju. Tipografija se podređuje značenju, ne obrnuto.

**G-ML-03 · `--window-size` u Chrome headless nije širina viewporta.**
Snimak na `--window-size=420` izgledao je kao da strana prelivа ekran telefona.
*Uzrok:* novi headless režim je dao `clientWidth = 469` (pa i 484 uz `--force-device-scale-factor=1`);
snimak je isekao stranu širu od zadate slike i to je ličilo na grešku rasporeda.
*Lek:* ne zaključuj o prelivanju iz isečene slike. Izmeri u samoj strani
(`document.documentElement.clientWidth` i `scrollWidth`), ili renderuj stranu u `iframe`-u tačne
širine i snimi okvir. Ovde je `scrollWidth === clientWidth`, dakle prelivanja nije ni bilo.

**G-ML-04 · heredoc sa `cat > fajl <<'EOF'` je pukao na dugom JS sadržaju.**
*Uzrok:* nije utvrđen u trenutku; shell je prijavio nezatvoren navodnik iako je blok bio citiran.
*Lek:* izvorne fajlove piši alatom za pisanje fajlova, ne kroz shell heredoc. Heredoc ostaje za
kratke tekstualne fajlove.

## Iskustva

**Tačan odgovor zadatka mora da računa isto jezgro, a ne sopstvena formula.**
U `assets/zadaci.js` svaki generator poziva `Mehanika.*` i za tekst i za rešenje. Posledica: ako se
jezgro pokvari, padaju i test i zadatak. Dva izvora istine za istu formulu je najtiši način da
nastavni materijal počne da laže.

**Invarijanta hvata ono što rešen primer ne hvata.**
Poznati primeri (qL²/8, PL/4) proveravaju samo ono što već znaš. Provera da je ΣF = 0, ΣM = 0 i
dM/dx = V na 200 nasumičnih greda u 1.800 tačaka ne zna odgovor — zna samo šta mora da važi, pa
pokriva i kombinacije koje nikad nisi ručno rešio. Mutacija znaka u jednom sabirku
(`F2 * (x - xc)` → `F2 * (xc - x)`) oborila je 9 provera.

**Test treba proveriti mutacijom pre nego što mu se veruje.**
Tri mutacije, sve uhvaćene: preimenovan id (`izlazGreda` → `izlazGredaX`) oborio test sajta;
izmenjen broj provera u tekstu strane oborio test sajta; izmenjen znak u jezgru oborio 9 provera.
Test koji nikad nije pao je nepoznata veličina, ne garancija.

**Nezavisna provera je bolja od zapamćenog broja.**
`Iy` T preseka se poredi sa numeričkim integraljenjem u 400.000 traka, a rezultat po EN 1992 sa
ravnotežom preseka (`Fc = Fs`, `Fc·z = MEd`), a ne sa brojem iz knjige. Broj iz knjige proverava
prepisivanje; fizika proverava proračun.

**Tvrdnja na ekranu mora biti merljiva.**
Strana piše „77 provera". Test sajta pokreće test jezgra, pročita stvaran broj i obori se ako se
tekst i stvarnost raziđu. Tvrdnja koju niko ne meri zastareva tiho.

**Aproksimacija se meri, ne skriva.**
I presek se gradi bez zaobljenja prelaza i daje 95.0% tabličnog `Iy` za IPE 200. Umesto da se
tablične vrednosti unesu napamet (i tako unesu greške prepisivanja), odnos je izmeren, upisan u
test kao opseg 93–97% i ispisan korisniku kao napomena.

## Izvori

- `engineeringstatics.org` (Baker & Haynes, CC BY-NC-SA) — uzor otvorenog interaktivnog udžbenika;
  nasumični zadaci u pregledaču su ustaljena praksa, ne eksperiment. Provereno 01.10.2026.
- `learnaboutstructures.com` (Erochko, Carleton) — luk kursa analize konstrukcija i kviz na dnu
  poglavlja; određenost kao zasebna nastavna tema. Provereno 01.10.2026.
- Statics Concept Inventory (2002) i Statics Skills Inventory (2003); radovi o greškama u dijagramu
  oslobođenog tela (ASEE PEER) — osnov odluke da dijagram dobije celu nedelju. Provereno 01.10.2026.
- Arhitektonski fakultet u Beogradu, kurs 5.1 Mehanika i otpornost materijala — domaći format:
  15 radnih nedelja, kolokvijumi, raspodela poena 30–70. Provereno 01.10.2026.
- Građevinski fakultet u Beogradu, Katedra za tehničku mehaniku i teoriju konstrukcija — redosled
  predmeta: tehnička mehanika → otpornost materijala → statika konstrukcija → stabilnost i dinamika.
  Provereno 01.10.2026.
- Pravilnik za građevinske konstrukcije (Sl. glasnik RS 89/2019, 52/2020, 122/2020) i SRPS EN
  1992-1-1:2015 — u Srbiji se projektuje po SRPS EN sa nacionalnim prilozima. Provereno 01.10.2026.
- Eurocode 2 Worked Examples (CEN TC250/SC2), SCI P387, Goleš „Betonske konstrukcije 1" (GF Subotica,
  otvoren e-udžbenik) — redosled koraka i domaća terminologija. Provereno 01.10.2026.
- `github.com/rasimtemur/vetin-beam` (MIT) — dokaz da rešavač greda radi u pregledaču bez servera.
  Kod nije uzet. Provereno 01.10.2026.

**Granica istraživanja:** zvanični nacionalni prilozi (plaćen pristup preko ISS) nisu otvoreni, pa
tačne vrednosti `αcc` i `ψ` za Srbiju nisu potvrđene iz primarnog izvora; uzeto je `αcc = 0.85` uz
ispisano upozorenje. Zvanični akreditovani silabus predmeta prof. Darinke nije pribavljen — program
od 15 nedelja je sastavljen po domaćem formatu dva javna fakulteta, i to je zaključak, ne usklađenost.

## Vestine

- Statika određenih nosača, geometrija preseka i dimenzionisanje po EN 1992/1993/1995 — jezgro je
  prenosivo (`assets/mehanika.js`, MIT, bez zavisnosti) i može se uzeti u drugi predmet ili alat.
- Renderovanje strane u `iframe`-u fiksne širine kao pouzdan način snimanja mobilnog prikaza iz
  Chrome headless režima.
- Test sajta bez pregledača: id-jevi koje skripta traži, mrtve veze, spoljni resursi, jezički parovi,
  i poklapanje tvrdnji u tekstu sa izmerenim brojem.

## Odluke

**Jezgro napisano od nule iako postoji MIT rešavač (`vetin-beam`).**
Razlog: konvencija znaka i testovi moraju biti naši da bi se svaki red mogao braniti pred studentom,
i da bi granica rešavača bila ispisana rečenicom koju mi stojimo iza. Tuđi kod bi uštedeo dan i
oduzeo mogućnost da se u nastavi kaže „evo zašto ovde piše minus".

**Rešavač pokriva samo statički određene sisteme i to kaže naglas.**
Treći oslonac vraća `odredjen: false` sa razlogom, a `unutrasnje()` baca grešku. Alternativa — tiho
vratiti približan broj — bila bi brža za korisnika i pogubna za nastavu, jer šesti ishod učenja
traži da student zna gde njegov proračun prestaje da važi.

**Dvojezično (sr + en) na svakoj strani, ne odvojeni sajtovi.**
Jedan HTML, dva `<span>`-a, prekidač koji pamti izbor u `localStorage`. Razlog: materijal mora da
radi i za domaću grupu i za Erasmus razmenu bez održavanja dve kopije koje se raziđu.

**Brojač tačnih odgovora ostaje u pregledaču.**
Nema servera, nema naloga, nema izveštaja nastavniku. Alat za učenje koji meri studenta prestaje
da bude alat za učenje.
