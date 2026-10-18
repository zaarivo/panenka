# Medaile – návrh

Schváleno rodičem v rozhovoru 18. 10. 2026 (podoba obrazovky: varianta A z náhledu).

## Proč

Dcera (8 let) potřebuje víc cílů, na které může dlouhodobě dosáhnout. Dosavadní Síň slávy má jen 3 odznaky.
Medaile po kategoriích příkladů ji mají motivovat procvičovat i kategorie, kterým se zatím vyhýbá. Korunky
odstupňované podle celkového počtu příkladů jí dávají viditelnou odměnu do šatníku.

## Cíle

1. Záložka **Síň slávy se přejmenuje na „Medaile“** (spodní lišta i nadpis obrazovky), na stejném místě.
2. **Medaile po kategoriích příkladů:** pro každou ze 6 kategorií (`TopicId`: add20, add100, multiplication,
   missingNumber, comparison, wordProblems) tři medaile:
   - bronzová za **10** správně vyřešených příkladů v dané kategorii,
   - stříbrná za **100**,
   - zlatá za **200**.

   Celkem je to 18 medailí.
3. **Korunky za celkový počet správných příkladů** (odznaky):
   - „Pilná školačka“ (100 správně, už existuje) odemkne **novou Bronzovou korunku**.
   - Nový odznak za **200** správně odemkne **novou Stříbrnou korunku**.
   - Nový odznak za **300** správně odemkne **dosavadní Zlatou korunku** (`acc-crown`).
   - „Násobilková hvězda“ (10 z násobilky v řadě) zůstává jako odznak, ale **už nic neodemyká**.
   - „První krok“ zůstává beze změny.
4. **Oslava nové medaile:** celoobrazovková, hezká a animovaná. Medaile spadne shora a zhoupne se, za ní se
   točí světelné paprsky, padají konfety, zazní fanfára. Zobrazí se text „Zlatá medaile!“ (podle stupně)
   a pod ním „Malá násobilka · 200 příkladů správně“. Tlačítko „Hurá!“ oslavu zavře. Předlohou je odsouhlasená
   ukázka (viz Podoba obrazovky).
5. **Medaile nedávají zlaťáky** ani kousky. Jsou jen radost a sbírka.

## Mimo rozsah

- Žádné zlaťáky za medaile ani odznaky.
- Žádné další druhy úspěchů (série dnů, rychlost apod.).
- Rodičovský panel se nemění.

## Čeho se vyvarovat

- Dítě nesmí přijít o nic, co si koupilo za zlaťáky. Zamyká se jen Zlatá korunka, která nebyla na prodej.
- Oslava nesmí přerušit rozdělaný příklad tak, že by se ztratil. Musí fungovat stejně spolehlivě jako dnešní
  oslava odznaku (fronta, zobrazení nad čímkoli).
- Nic nesmí vyžadovat síť; zvuk se generuje kódem (Web Audio) jako ostatní zvuky.

## Pravidla počítání

- Do medaile v kategorii se počítá **každý správně vyřešený příklad dané kategorie**, i když se povedl až na
  další pokus, stejně jako dnešní `stats.totalCorrect`. **Přeskočený příklad se nepočítá.** *(rozhodnutí Clauda)*
- Obtížnost (lehké/střední/těžké) nehraje roli; počítá se kategorie jako celek.
- Počty po kategoriích hra dosud neukládala, proto **začínají od nuly po aktualizaci**. Odsouhlaseno rodičem.
- Odznaky za 100/200/300 se řídí celkovým `stats.totalCorrect`, takže platí i zpětně.
- Získaná medaile i odznak už nezmizí, ani kdyby se počty nějak změnily (stejně jako dnešní odznaky).
- Reset hry v rodičovském panelu smaže i medaile a počty po kategoriích (jako ostatní postup).

## Zlatá korunka po aktualizaci

- Kdo dosud vlastnil Zlatou korunku (za Násobilkovou hvězdu), tomu se při načtení uložené hry **odebere**
  z vlastněných kousků. Pokud ji měl na sobě, sundá se. Odsouhlaseno rodičem.
- Kdo už má 300 a víc správně celkem, tomu se korunka vůbec neodebere (ani nesundá) a dostane rovnou nový
  odznak. *(rozhodnutí Clauda)*
- Odebrání je jednorázový krok převodu ze starší verze, ne trvalé pravidlo. *(rozhodnutí Clauda)*
- Totéž platí pro import staré zálohy v rodičovském panelu.

## Podoba obrazovky „Medaile“ (varianta A)

Shora dolů:

1. Hlavička: nadpis „Medaile“, pod ním „Zatím jsi správně vyřešila X příkladů.“ (jako dnes) a vpravo ozubené
   kolečko pro rodiče (jako dnes).
2. Pro každou kategorii **jedna bílá karta**:
   - nadpis kategorie (český název z `lib/topics.ts`),
   - tři medaile vedle sebe (bronzová, stříbrná, zlatá); nezískané jsou šedé a průhledné,
   - vedle medailí ukazatel postupu k další medaili, např. „do stříbrné 42/100“ s pruhem,
   - když jsou všechny tři získané, místo ukazatele krátká pochvala, např. „Všechny medaile!“ *(rozhodnutí Clauda)*.

   Pořadí kategorií je stejné jako v editoru kategorií. Zobrazují se **všechny kategorie**, i ty, které rodič
   zrovna nezaškrtl. *(rozhodnutí Clauda)*
3. Nadpis oddílu „Odznaky“ a pod ním dosavadní karty odznaků (vzhled jako dnes, včetně ukazatele postupu
   a řádku s odměnou). Pořadí: První krok, Násobilková hvězda, Pilná školačka, odznak za 200, odznak za 300.

Názvy nových odznaků *(návrh Clauda, rodič je může změnit)*:

| Odznak | Podmínka | Odměna |
|---|---|---|
| Šikovná počtářka | 200 správně celkem | Stříbrná korunka |
| Královna počítání | 300 správně celkem | Zlatá korunka |

Medaile vypadá jako kulatá mince na stuze (modro-růžová stuha, uprostřed hvězda), barvy:

| Stupeň | Barva |
|---|---|
| Bronz | #d97706 |
| Stříbro | #cbd5e1 |
| Zlato | #facc15 |

Ukázka obrazovky a oslavy je v `.superpowers/brainstorm/` (soubor `medaile.html`, není v gitu). Tento popis
je ale úplný sám o sobě.

## Oslavy

- Nová medaile i nový odznak jdou do **společné fronty oslav** (dnešní `celebrations`). Když jich padne víc
  najednou (např. bronzová medaile a odznak), ukážou se postupně, medaile před odznakem. *(rozhodnutí Clauda)*
- Během oslavy se nepočítá čas příkladu pro úspěšnost (stopky Akademie stojí), aby dlouhá animace nezapsala
  dalšímu příkladu neúspěch. *(rozhodnutí Clauda)*
- Medaile: celoobrazovková animovaná oslava podle cíle 4, tlačítko „Hurá!“.
- Odznak: zůstává dnešní dialog „Nový odznak!“. U odznaku s korunkou zůstávají tlačítka „Později“
  a „Do šatníku“.
- Odznaky a medaile, které se doplní při načtení hry nebo při importu, se **neoslavují** (jako dnes).
  *(rozhodnutí Clauda; dítě je uvidí na obrazovce Medaile)*
- Fanfára je nový krátký zvuk v `lib/sound.ts`. Respektuje přepínač zvuku `settings.soundOn`.
- Animace respektuje `prefers-reduced-motion`: bez pádu a točení, jen se zobrazí. *(rozhodnutí Clauda)*

## Data

- `saveVersion` se zvedne na **4**. Do uložení přibude:
  - počet správných příkladů pro každou kategorii,
  - seznam získaných medailí (kategorie × stupeň).

  Přesný tvar je na stavbě.
- Převod ze starších verzí 1–3: počty po kategoriích jsou 0 a medaile žádné. Zlatá korunka se odebere podle
  oddílu „Zlatá korunka po aktualizaci“. Postup, zlaťáky, ostatní kousky, odznaky a PIN zůstanou.
- Validace (`parseSave`) musí zvládnout poškozená data stejně jako dnes: neznámé kategorie a stupně zahodit,
  počty musí být nezáporná celá čísla.
- Startovní kousky ani kousky z obchodu se nemění. Přibudou dva nekoupitelné kousky (`price: null`,
  `slot: "head"`, `unlockBadge`): Bronzová korunka a Stříbrná korunka. Mají grafiku ve stylu dosavadní
  Zlaté korunky, jen v bronzové a stříbrné barvě.

## Na stavbě

- Pojmenování v kódu (např. `MedalTier`, `correctByTopic`), rozdělení do souborů, komponenty.
- Přesná animace a fanfára v duchu ukázky.
- Ikona záložky „Medaile“ ve spodní liště.
- Aktualizace `CLAUDE.md` (oddíl Síň slávy → Medaile, data, odznaky).
