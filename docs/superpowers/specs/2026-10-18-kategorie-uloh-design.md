# Kategorie úloh s obtížnostmi a doporučení pro rodiče

Datum: 2026-10-18 · Projekt: Panenka (`D:\Claude\panenka`, nasazeno na https://zaarivo.github.io/panenka/)

## Proč

Dcera (8 let) se učí postupně: na začátku je pro ni násobilka ještě těžká, později je jednoduché
sčítání zbytečně snadné. Rodič chce při každém zapnutí hry snadno vybrat, **co se bude
procvičovat a v jaké obtížnosti**, a chce, aby mu hra sama **navrhla úpravu**, když je něco moc
snadné nebo moc těžké. Dítě o žádném sledování neví.

Dnes hra nabízí 4 typy příkladů (`addSub`, `multiplication`, `missingNumber`, `comparison`) a
společné stupně 1–4 s automatickým posunem; nastavení je schované v rodičovském panelu.

## Cíle

1. Úlohy rozdělené do **6 kategorií**, každá se třemi obtížnostmi **lehké / střední / těžké**
   (v UI vždy slovy, nikdy zkratkami).
2. Po zadání PINu (při každém odemykání) **Krok 1 ze 2: „Co dnes procvičíme?“** – rodič
   zaškrtává obtížnosti v kategoriích; nahoře doporučení. Pak **Krok 2 ze 2: „Jak dlouho dnes?“**
   (stávající výběr času). Zvolená varianta B z náhledu.
3. Hra se **dál sama posouvá** nahoru a dolů, ale jen mezi zaškrtnutými obtížnostmi, a to
   **zvlášť pro každou kategorii**.
4. Hra sleduje **úspěšnost** pro každou kategorii a obtížnost a při odemykání nabídne rodiči
   přidání nebo odebrání obtížnosti.
5. Nová kategorie **Slovní úlohy**.

## Ne-cíle

- Dělení, jednotky (Kč, hodiny, délky), zlomky.
- Ukazovat dítěti úspěšnost, čas řešení nebo to, že bylo „pomalé“.
- Více profilů dětí, synchronizace mezi zařízeními.

## Anti-cíle (selhání, i kdyby to technicky fungovalo)

- Dítě pozná, že se mu měří čas, nebo je za pomalost jakkoli „potrestáno“ (méně zlaťáků,
  hláška, změna obtížnosti uprostřed příkladu kvůli času).
- Při aktualizaci na telefonu se ztratí zlaťáky, oblečení, odznaky nebo PIN.
- Rodič musí při každém zapnutí znovu vše naklikávat (výběr se pamatuje z minula).

## Kategorie a obtížnosti (schváleno)

| Kategorie (id) | Lehké | Střední | Těžké |
|---|---|---|---|
| Sčítání a odčítání do 20 (`add20`) | vše do 10 | do 20 bez přechodu přes desítku | do 20 s přechodem |
| Sčítání a odčítání do 100 (`add100`) | celé desítky (30 + 40, 90 − 50) | bez přechodu (34 + 25) | s přechodem (38 + 27) |
| Malá násobilka (`multiplication`) | řady 2, 5, 10 | řady 2, 3, 4, 5, 10 | všechny řady 2–10 |
| Chybějící číslo (`missingNumber`) | do 10 | do 20 | do 100 |
| Porovnávání (`comparison`) | do 10 | do 20 | do 100 |
| Slovní úlohy (`wordProblems`, nové) | sčítání/odčítání do 20 | sčítání/odčítání do 100 | násobilka |

Platí stávající pravidla generátoru: výsledky počítá kód, nic záporného, žádný stejný příklad
dvakrát po sobě, nápověda neprozradí výsledek, násobení se píše „×“, minus „−“, činitel 1–10.
„Přechod“ = stávající definice (`addCrossesTen` / `subCrossesTen`).

## Slovní úlohy

- Krátké věty pro 8leté dítě, česky, s tématem hry (panenka, mašle, šaty, korálky, zlaťáky,
  kamarádky). Odpověď je vždy číslo zadané stávající klávesnicí.
- Text skládá kód ze šablon; čísla i výsledek počítá kód. Skloňování podle počtu musí sedět
  („1 mašle / 2 mašle / 5 mašlí“), proto každá šablona nese tvary podstatného jména.
- Nápověda = skrytý výpočet („Spočítej 12 + 5.“, „Spočítej 4 × 3.“).
- Přesné šablony, jména a předměty jsou na stavitelovi (viz níže); aspoň ~8 šablon na
  obtížnost, aby se neopakovaly.

## Průběh odemknutí (schváleno, varianta B)

```
zamčeno → „Pro rodiče: odemknout PINem“ → PIN
  → Krok 1 ze 2 „Co dnes procvičíme?“ (doporučení + kategorie)  [Dál]
  → Krok 2 ze 2 „Jak dlouho dnes?“ (stávající TimePicker)        [Pokračovat do hry]
  → hra
```

- Při úplně prvním spuštění: nastavení PINu → Krok 1 → Krok 2.
- Zaškrtnutí se pamatují z minula; většinou stačí „Dál“.
- Kategorie bez zaškrtnuté obtížnosti je vypnutá (šedá). Aspoň jedna obtížnost v celé hře musí
  zůstat zaškrtnutá (poslední nejde odškrtnout).
- V Kroku 2 je tlačítko „Zpět“ na Krok 1 (rozhodnutí Clauda).
- Rodičovský panel (kolečko v Síni slávy) dostane stejný editor kategorií místo dnešních
  sekcí „Typy příkladů“ a „Obtížnost“ (rozhodnutí Clauda).

## Obtížnost během hry (rozhodnutí Clauda v rámci schváleného „hra se dál posouvá sama“)

- Každá kategorie má **vlastní aktuální obtížnost** (uloženou) a **vlastní řady**
  správně/chyb (jen v rámci sezení). Řada kategorie se počítá jen z jejích příkladů; příklady
  jiných kategorií mezi tím ji nepřeruší.
- Příklad se vybírá: náhodná zapnutá kategorie → její aktuální obtížnost.
- V dané kategorii: 5 správně v řadě → o obtížnost výš; 2 chyby v řadě → o obtížnost níž;
  přeskočení → hned o obtížnost níž. Vždy jen mezi zaškrtnutými obtížnostmi té kategorie.
- **Zaškrtnutí smí mít mezery** (např. lehké + těžké bez střední) – rozhodnutí Clauda, protože
  je mohou vytvořit i doporučení „Odebrat“. „Výš/níž“ = na nejbližší zaškrtnutou obtížnost.
  Dnešní pravidlo souvislého rozsahu (`toggleLevelRange`) se ruší.
- Truhla zůstává **společná**: 5 správně v řadě napříč kategoriemi.
- Odměna: lehké a střední **10**, těžké **15** zlaťáků (podle obtížnosti, na které příklad vznikl).
- Změní-li rodič zaškrtnutí, aktuální obtížnost kategorie se srovná do nových mezí.

## Úspěšnost (schváleno)

- Počítá se **zvlášť pro každou dvojici kategorie × obtížnost**.
- **Úspěch** = správně napoprvé **a** v časovém limitu. **Neúspěch** = první odpověď chybná
  (i když pak vyřeší), přeskočení, nebo řešení delší než limit.
- **Limit**: 30 s pro všechny kategorie, **90 s pro Slovní úlohy** (schváleno; čtení věty trvá).
- Čas = jen doba, kdy je hra viditelná na obrazovce (`document.visibilityState === 'visible'`)
  **a zároveň je otevřená záložka Akademie**; skrytá aplikace, zhasnutý displej ani chvíle
  v Šatníku/Obchodě/Síni slávy či za zamčenou obrazovkou se nepočítá (rozhodnutí Clauda).
- Výsledek se zapíše jednou za příklad, když skončí (vyřešen nebo přeskočen).
- Okno = posledních **20** výsledků; doporučení až od **10** výsledků v okně.
- Dítě o tom nic neví: zlaťáky, pochvala i chování hry jsou stejné bez ohledu na čas.
  Pomalá správná odpověď nijak nemění obtížnost během hry.

## Doporučení pro rodiče (pravidla z náhledu, rodič je nerozporoval)

V Kroku 1, pro každou dvojici kategorie × obtížnost s aspoň 10 výsledky:

| Úspěšnost | Situace | Nabídka |
|---|---|---|
| ≥ 95 % | je to nejtěžší zaškrtnutá obtížnost kategorie a existuje těžší nezaškrtnutá | „Přidat {těžší}?“ |
| ≥ 95 % | v kategorii je zaškrtnutá i těžší obtížnost | „Odebrat {tuto}?“ |
| < 25 % | v kategorii je zaškrtnutá i jiná obtížnost | „Odebrat {tuto}?“ |
| < 25 % | je to jediná zaškrtnutá obtížnost a existuje lehčí | „Přidat {lehčí}?“ |

- Text karty: „{Kategorie} – {obtížnost}: {N} % správně“ + otázka + tlačítka **Přidat/Odebrat**
  a **Teď ne**.
- **Teď ne** = stejné doporučení se znovu ukáže až po dalších 20 výsledcích v té dvojici.
- Nejvýš jedno doporučení na kategorii (přednost má to pod 25 %).
- Na nejtěžší obtížnosti s ≥ 95 % a na jediné lehké s < 25 % se nic nenabízí.
- Posuzují se **jen zaškrtnuté** obtížnosti zapnutých kategorií (rozhodnutí Clauda).
- Když se obtížnost odškrtne (ručně nebo přes doporučení), její historie úspěšnosti se smaže;
  po znovuzaškrtnutí se sbírá od nuly, aby doporučení nestála na starých datech
  (rozhodnutí Clauda).

## Data a převod stávajícího postupu

- `saveVersion: 2`. Nová data (návrh struktury, detaily na stavitelovi):
  - `settings.categories`: pro každou kategorii seznam zaškrtnutých obtížností
    (nahrazuje `enabledTypes`, `minLevel`, `maxLevel`).
  - `currentTier`: aktuální obtížnost každé kategorie (nahrazuje `level`).
  - `practice`: pro každou dvojici kategorie × obtížnost posledních ≤ 20 výsledků, celkový
    počet výsledků a případný „Teď ne“ (počet výsledků v době odložení).
- **Převod v1 → v2** při načtení i při importu zálohy: zlaťáky, oblečení, odznaky, statistiky,
  PIN a zvuk zůstanou. Staré typy a stupně se přeloží: `addSub` stupeň 1 → `add20` střední,
  2 → `add20` těžké, 3 → `add100` střední, 4 → `add100` těžké; `multiplication` 1 → lehké,
  2 → střední, 3–4 → těžké; `missingNumber` a `comparison` 1–2 → střední, 3–4 → těžké.
  Slovní úlohy po převodu vypnuté (rodič je zapne v Kroku 1). Aktuální obtížnost = nejnižší
  zaškrtnutá.
- **Nová hra** (bez uložených dat): zaškrtnuté všechny obtížnosti všech kategorií; rodič je
  upraví v Kroku 1 hned po nastavení PINu.
- Export záloh ukládá v2; import přijímá v1 i v2.
- **Reset hry** smaže i úspěšnost, „Teď ne“ a aktuální obtížnosti (začíná se na nejnižší
  zaškrtnuté); zaškrtnutí kategorií zůstanou jako ostatní nastavení. **Import** nahradí vše
  včetně úspěšnosti; záloha v1 ji nemá, takže začne prázdná (rozhodnutí Clauda).

## Co zůstává beze změny

Šatník, obchod, Síň slávy a odznaky (Násobilková hvězda počítá jen kategorii Malá násobilka),
časový zámek, přeskočení příkladu, kola po 10 příkladech, truhla, zvuky, PWA a nasazení.

## Na stavitelovi

- Přesné šablony slovních úloh, jména, předměty a jejich tvary.
- Přesné rozsahy čísel uvnitř definic obtížností (např. jak často ± v „do 10“).
- Vzhled Kroku 1 a editoru kategorií v souladu s náhledem B a stávajícím stylem.
- Kam v rodičovském panelu zobrazit úspěšnost (pokud vůbec) – rodiči může pomoci vidět
  procenta u každé obtížnosti.
- Rozdělení práce do commitů; testy napřed (generátor, převod dat, úspěšnost, doporučení).
