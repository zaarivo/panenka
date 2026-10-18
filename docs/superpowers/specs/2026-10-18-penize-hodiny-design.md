# Peníze a hodiny – návrh

Schváleno rodičem v rozhovoru 18. 10. 2026. Podobu úloh odsouhlasil podle ukázky (3 obrazovky: peníze,
ručičkové hodiny, čas slovy).

## Proč

Dcera (8 let, 2.–3. třída) se ve škole učí počítat s penězi a určovat čas. Rodič chce, aby si to
procvičila v Akademii stejně jako ostatní příklady: s obtížnostmi, úspěšností pro rodiče a medailemi.

## Cíle

Přibudou dvě nové kategorie úloh (`TopicId`), které se chovají jako dosavadní šest kategorií. Mají
obtížnosti lehké/střední/těžké, zaškrtávají se ve výběru „Co dnes procvičíme?“ a v rodičovském panelu,
mají adaptivní obtížnost, úspěšnost a doporučení, zlaťáky, nápovědu, přeskočení a medaile:

1. **Peníze** (`money`), název v UI „Peníze“. Dva druhy úloh, obě jako krátký nákup v obchodě
   s věcmi z hry (mašle, sponky, korálky, šatičky…):
   - **Kolik to stojí:** „Mašle stojí 4 Kč a sponka 7 Kč. Panenka si koupí 3 mašle a 2 sponky.
     Kolik zaplatí?“ → 26.
   - **Kolik zbyde:** „Panenka má 20 Kč. Koupí si mašli za 4 Kč a sponku za 7 Kč. Kolik jí zbyde?“ → 9.
2. **Hodiny** (`clock`), název v UI „Hodiny“. Dva druhy úloh:
   - **Čas slovy → digitální:** „půl 6“ → 5:30, „čtvrt na 3“ → 2:15, „třičtvrtě na 5“ → 4:45,
     „5 hodin“ → 5:00. Hodiny se píšou číslicí, jak to napsal rodič („půl 6“, ne „půl šesté“).
   - **Ručičkové hodiny → digitální:** obrázek ciferníku, otázka „Kolik je hodin?“.

## Obtížnosti (schváleno)

| | Lehké | Střední | Těžké |
|---|---|---|---|
| Peníze | ceny 1–10 Kč, nejvýš 2 kusy od jedné věci, celkem do 20 Kč; „zbyde“ ze 20 Kč | 2–3 různé věci po jednom kuse, ceny do 50 Kč, celkem do 100 Kč; „zbyde“ ze 100 Kč | ceny 1–10 Kč, 2–5 kusů od každé věci (násobení v malé násobilce), celkem do 100 Kč; „zbyde“ ze 100 Kč, také s násobením kusů |
| Hodiny | celé hodiny a půl | navíc čtvrt a třičtvrtě | ručičkové hodiny po 5 minutách (např. 7:25) |

- Peníze těžké, „kolik zbyde“, např.: „Panenka má 100 Kč. Koupí 3 mašle po 6 Kč a 4 sponky po 5 Kč.
  Kolik jí zbyde?“ → 62. *(rozdělení střední/těžké schváleno rodičem po kontrole návrhu)*
- Peníze: vždy celé koruny. Výsledek nikdy není záporný (nákup se vejde do peněz) a je vždy nejméně 1.
- Hodiny lehké a střední: oba druhy (slovy i ručičkové hodiny) s danými časy. Hodiny těžké: jen ručičkové
  hodiny, minuty po 5. *(rozhodnutí Clauda: „7:25“ se slovy v češtině běžně neříká)*
- Hodiny jsou 1–12, bez rozlišení dopoledne/odpoledne. Pozor na 12: „půl 1“ = 12:30, „čtvrt na 1“ =
  12:15, „třičtvrtě na 1“ = 12:45, „12 hodin“ = 12:00.

## Odpověď u hodin

- Stejná číselná klávesnice jako dnes, jen pro hodiny až 4 číslice.
- **Dvojtečka se vloží sama před poslední dvě číslice**: napíše 4 4 5 → zobrazí se „4:45“, 1 2 3 0 →
  „12:30“. Dokud jsou napsané nejvýš 2 číslice, zobrazí se bez dvojtečky. *(schváleno podle ukázky)*
- **„Hotovo“ jde zmáčknout až po napsání aspoň 3 číslic.** Při 1–2 číslicích se pod okénkem ukáže
  „Napiš i minuty, třeba 5:00.“ Neúplná odpověď se tak nepočítá jako chyba. *(rozhodnutí Clauda)*
- Platná odpověď má minuty 00–59 a hodiny 1–12. Jinak je to prostě špatná odpověď (běžná nápověda,
  další pokus), ne chyba aplikace.
- U peněz je za okénkem odpovědi „Kč“ (podle ukázky).

## Vzhled (podle odsouhlasené ukázky)

- **Peníze:** text úlohy jako u slovních úloh. Pod ním štítky s cenami věcí (např. „🎀 4 Kč“,
  „📎 7 Kč“) a okénko odpovědi s „Kč“.
- **Ručičkové hodiny:** otázka „Kolik je hodin?“ a velký ciferník (bílý, fialový okraj, čísla 1–12).
  Krátká růžová ručička ukazuje hodiny a posouvá se plynule podle minut (v 7:25 je mezi 7 a 8). Dlouhá
  fialová ručička ukazuje minuty. Pod ciferníkem je okénko odpovědi.
- **Čas slovy:** otázka „Kolik je to na digitálních hodinách?“, velký text času slovy, pod ním
  „= [okénko]“.
- Grafika je vlastní SVG, bez sítě a bez nových závislostí.

## Úspěšnost pro rodiče (schváleno)

- Vnitřní časový limit pro úspěch je u Peněz i Hodin **60 sekund** (`TIME_LIMIT_MS`). Dítě o něm neví,
  jako u ostatních kategorií.

## Zapnutí po aktualizaci (schváleno)

- Peníze a Hodiny jsou **po aktualizaci vypnuté**. Rodič je zapne ve výběru „Co dnes procvičíme?“ nebo
  v rodičovském panelu.
- Vypnuté jsou i při **úplně první instalaci** (výchozí stav). *(rozhodnutí Clauda; odsouhlaseno
  společně s ukázkou)* Ostatních šest kategorií zůstává výchozí zapnutých jako dnes.
- Uložení: chybějící nové kategorie v uložených datech znamenají „vypnuto“. Počty pro medaile začínají
  na 0. Postup, PIN, medaile ani nic jiného se nemění.

## Medaile, zlaťáky a ostatní

- Medaile: obě kategorie dostanou bronzovou, stříbrnou a zlatou za 10/100/200 správně (celkem 24
  medailí). Obrazovka Medaile ukáže 8 karet.
- Zlaťáky: stejně jako ostatní kategorie (5 / 5 / 8, truhla).
- Nápověda po chybě nikdy neukazuje výsledek posledního kroku (pravidlo z `CLAUDE.md`). *(texty
  rozhodnutí Clauda)*
  - Peníze: „Spočítej 3 × 4 Kč a 2 × 7 Kč a sečti.“ / „Od 20 Kč odečti 4 Kč a pak 7 Kč.“
  - Hodiny slovy: „Půl 6 je půl hodiny před 6. hodinou.“ / „Čtvrt na 3 je čtvrt hodiny po 2. hodině.“ /
    „Třičtvrtě na 5 je čtvrt hodiny před 5. hodinou.“
  - Ručičkové hodiny: „Krátká ručička ukazuje hodiny, dlouhá minuty. Každé číslo na ciferníku je 5 minut.“
- Přeskočení: „Nevadí! Správně je 4:45.“ (u peněz „26 Kč“).
- Nepočítá se do odznaku Násobilková hvězda (ta je jen pro násobilku), ale do celkového počtu správných ano.

## Mimo rozsah

- Desetníky, haléře, bankovky a mince jako obrázky.
- 24hodinový čas, rozlišení dopoledne/odpoledne.
- Nastavování ručiček tahem (dítě vždy jen píše odpověď).
- Převody jednotek (minuty na hodiny apod.).

## Na stavbě

- Pojmenování v kódu, rozdělení do souborů, šablony textů úloh (téma hry, správné skloňování).
- Přesný vzhled ciferníku v duchu ukázky.
- Kde se mění výchozí zapnutí kategorií a podoba nového druhu odpovědi „čas“ (`Problem`).
- Aktualizace `CLAUDE.md` (tabulka kategorií, limity, výchozí stav).
