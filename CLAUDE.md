# Panenka — Matematická módní hra

PWA webová hra v češtině pro 8letou holčičku. Oblékání panenky, kde se oblečení kupuje za zlaťáky
vydělané řešením matematických příkladů.

---

## Technologie (rozhodnutí)

- **Vite + React + TypeScript + Tailwind CSS** — bez backendu, bez účtu, bez reklam
- **TypeScript** — rozhodnutí Clauda (zadání jazyk neurčilo)
- **vite-plugin-pwa** — manifest, ikony (PNG 192/512 + maskable, generované jednorázovým skriptem ze SVG), service worker (offline funguje)
- **base** — výchozí `'/panenka/'` pro GitHub Pages, přepsatelné proměnnou `BASE_PATH` při buildu
- **Ikony PWA** se generují z `public/icon.svg` příkazem `npm run generate-pwa-assets`
  (`pwa-assets.config.ts`, @vite-pwa/assets-generator): pwa-64/192/512, maskable-512, apple-touch-180,
  favicon.ico. Vygenerované PNG jsou v gitu; po změně icon.svg je přegenerovat.
- **Offline** ověřeno: po prvním načtení service worker uloží 12 souborů (HTML, JS, CSS, ikony,
  manifest) a hra se načte i s vypnutým serverem. Service worker funguje jen na HTTPS nebo localhost.
- `npm run preview` = produkční build na http://localhost:4173/panenka/ (test PWA a offline).
- **Nasazení**: `.github/workflows/deploy.yml` — při každém push do `main` spustí testy, build
  s `BASE_PATH=/<název-repozitáře>/` a nasadí na GitHub Pages. V repozitáři musí být
  Settings → Pages → Source: „GitHub Actions“. Adresa: https://<uživatel>.github.io/<repozitář>/
- **Vitest** — testy pro mathGenerator a ekonomiku
- **Web Audio API** — zvuky generovány kódem, žádné externí soubory
- **Zero network requests** — vše funguje offline

## Stav a uložení

- `localStorage` s klíčem `panenka_save`, verze je uvnitř dat (`saveVersion: 4`); verze 1 (typy + stupně
  1–4) se při načtení i importu převede (`migrateTopicsFromV1`), postup a PIN zůstanou
- Verze 1 a 2 měly `equipped` po kategoriích; při načtení se nasazené kousky přeřadí podle
  `equipSlot(item)` (doplňky na své místo na těle), při kolizi vyhraje první
- Verze 4 přidala `stats.correctByTopic` a `medals`; starší verze začnou s nulami. Při převodu z verze
  1–3 se odebere (i sundá) Zlatá korunka, pokud dítě nemá aspoň 300 správných celkem (`ROYAL_TARGET`)
- Veškeré čtení/zápis v `try/catch`; při poškozených datech výchozí stav (bez pádu)
  a původní text se schová pod `panenka_save_corrupt` pro ruční záchranu
- `parseSave()` validuje a čistí data (neznámé kousky/odznaky zahodí, startovní kousky doplní,
  úroveň srovná do mezí rodiče) — použije se i při importu JSON v rodičovském panelu

## Grafika

- Panenka jako SVG vrstvy ve viewBox `0 0 300 600`, originální postava
- Pořadí vrstev: pozadí → tělo → boty → šaty → vlasy → doplňky
- Každá položka v `src/data/items.json`: `{ id, name, category, price, layer, asset, slot?, unlockBadge? }`
- Komponenta vrstvy umí SVG i PNG (pro pozdější výměnu grafiky bez změny logiky)
  - `asset` = klíč vestavěné SVG grafiky (`src/graphics/`), nebo cesta k obrázku v `public/`
    končící `.png/.webp/.jpg` (např. `doll/dress-pink.png`). Obrázek musí mít plátno 300 × 600
    s průhledným pozadím, aby lícoval s panenkou. Pozadí a tělo jdou vyměnit stejně (`BASE_ASSETS`).
  - `resolveAsset()` v `src/graphics/index.ts` rozhoduje SVG vs. obrázek; `DollViewer` skládá vrstvy
    podle `LAYER_ORDER`, `LayerAsset` vykreslí jednu vrstvu.
  - Geometrie postavy: hlava střed (150,125), ramena y≈212, pas y≈300, ruce (83,356)/(217,356),
    chodidla (131,547)/(169,547). Pravá strana se kreslí zrcadlením (`Mirrored`).
- Grafika je parametrická (komponenty s barvou jako parametrem) v `graphics/hair|dress|shoes|accessories.tsx`,
  každý soubor vyváží mapu `*_ASSETS` (klíč `asset` → komponenta), `graphics/index.ts` je spojí
- 4 kategorie: vlasy, šaty, boty po 11 kouscích (1 startovní + 10 v obchodě), doplňky 21
  (1 startovní, korunka za odznak, 19 v obchodě) — kontroluje `src/tests/items.test.ts`
- Na startu 1 kousek z každé kategorie zdarma (default outfit) — v items.json `price: 0`
- Tři korunky mají `price: null` a `unlockBadge` — nedají se koupit, odemyká je odznak (viz Medaile)
- Na sobě nejvýš 1 kousek vlasů, šatů a bot; doplňky mají `slot` (místo na těle: `head`, `face`,
  `neck`, `hand`, `ears`) a nasadit jde jeden doplněk na každé místo, tedy víc najednou (schváleno)
  — klíč nasazení `equipSlot()` v `lib/wardrobe.ts` (`hair`, `dress`, `shoes`, `accessory:<slot>`)

## Obrazovky (spodní lišta, 4 záložky)

### 1. Šatník
- Oblékání z vlastněných věcí (klepnutím nasadit/sundat)
- Vlasy jdou jen vyměnit, ne sundat (schváleno) — `ALWAYS_WORN` v `lib/wardrobe.ts`
- Bez šatů má panenka bílé tílko a kraťásky (součást těla)
- Tlačítko „Vyfotit": canvas render → PNG → Web Share API nebo ke stažení
  - `lib/photo.ts`: PNG 600 × 1200 (2×), PNG vrstvy se před vykreslením vloží jako data URL
  - Sdílení přes Web Share API ověřit na telefonu (v prohlížeči na PC jde stažení)
- Náhledy kousků: tělo + kousek, výřez podle konkrétního kousku → místa doplňku → kategorie
  (`thumbnailViewBox`)
- U doplňků je pod náhledem malý popisek místa (hlava, obličej, krk, ruka, uši)

### 2. Obchod
- Ceny z items.json: vlasy 40–110, šaty 45–150, boty 25–110, doplňky 20–80 zlaťáků; celý obchod
  2670 (testy hlídají rozsahy i součet 2500–3500). V každé kategorii seřazeno od nejlevnějšího.
- Zamčené věci šedě s cenou; kousky, na které už zlaťáky stačí, jsou barevné s růžovým rámečkem
  (schváleno), koupené mají zelený rámeček a „Už máš“
- Potvrzovací dialog před nákupem
- V obchodě jen kousky s cenou > 0 (startovní kousky a korunka tam nejsou) — rozhodnutí Clauda
- Když zlaťáky nestačí: dialog s chybějící částkou a tlačítkem „Jít počítat“ do Akademie
- Texty neskloňují názvy kousků (název je vždy v 1. pádě), počty zlaťáků přes `formatGold()`

### 3. Matematická akademie
- Generátor příkladů kódem (ne pevný seznam), výsledky počítá kód, vždy ≥ 0
- Bez opakování stejného příkladu po sobě
- 8 kategorií úloh, každá s obtížnostmi lehké / střední / těžké (viz tabulka níže, včetně slovních úloh)
- Adaptivní obtížnost zvlášť pro každou kategorii: po 5 správných v řadě → těžší, po 2 chybách → lehčí,
  jen mezi obtížnostmi, které rodič zaškrtl
- Odměna: +5 zlaťáků (lehké, střední), +8 (těžké) (schváleno, dřív 10/15)
- Chyba: nápověda podle typu (rozklad přes desítku, násobilka jako opakované sčítání), další pokus
- Vlastní velká číselná klávesnice (ne systémová)
- Po 5 správných v řadě: bonusová truhla, náhodná odměna 10–20 zlaťáků

#### Průběh v Akademii (rozhodnutí Clauda)
- Kola po 10 vyřešených příkladech (`ROUND_SIZE`), pak shrnutí „Kolo hotové!“ s vydělanými
  zlaťáky a volbou „Ještě kolo“ / „Do obchodu“ — podporuje krátké hraní bez časomíry.
- Po správné odpovědi pochvala + „+5“ vyletí nad počítadlo, zvuk mince; další příklad sám po 1,2 s.
- Po chybě se ukáže nápověda a zůstává vidět až do vyřešení; zadání zůstává stejné.
- 5 hvězdiček ukazuje řadu správných odpovědí; při páté se otevře truhla (klepnutím).
- Porovnávání se odpovídá třemi velkými tlačítky `<` `=` `>`, ostatní typy vlastní klávesnicí (max 3 číslice).
- Přepínač zvuku je v hlavičce Akademie (`settings.soundOn`). Zvuky: `lib/sound.ts` (Web Audio).
- Akademie zůstává v DOM i při jiné záložce, aby se rozdělané kolo neztratilo.
- Řady (správně/chyby) se drží jen v rámci sezení; aktuální obtížnost kategorií a statistiky se ukládají.

#### Kategorie a obtížnosti (schváleno, návrh `docs/superpowers/specs/2026-10-18-kategorie-uloh-design.md`)
| Kategorie (`TopicId`) | Lehké | Střední | Těžké |
|---|---|---|---|
| Sčítání a odčítání do 20 (`add20`) | vše do 10 | do 20 bez přechodu | do 20 s přechodem |
| Sčítání a odčítání do 100 (`add100`) | celé desítky | bez přechodu | s přechodem |
| Malá násobilka (`multiplication`) | řady 2, 5, 10 | 2, 3, 4, 5, 10 | 2–10 |
| Chybějící číslo (`missingNumber`) | do 10 | do 20 | do 100 |
| Porovnávání (`comparison`) | do 10 | do 20 | do 100 |
| Slovní úlohy (`wordProblems`) | ± do 20 | ± do 100 | násobilka |
| Peníze (`money`) | ceny 1–10 Kč, ≤ 2 kusy, do 20 Kč; zbyde z 20 | 2–3 věci po kusu, ceny do 50, do 100 Kč; zbyde ze 100 | ceny 1–10 Kč × 2–5 kusů, do 100 Kč; zbyde ze 100 |
| Hodiny (`clock`) | celé a půl (slovy i ciferník) | + čtvrt a třičtvrtě | ciferník po 5 minutách |

- V kódu `topic` (ne `category` — to je druh oblečení), obtížnosti `easy/medium/hard`, v UI slovy.
- Peníze a Hodiny (schváleno, návrh `docs/superpowers/specs/2026-10-18-penize-hodiny-design.md`) jsou
  výchozí vypnuté (`defaultTopics`), i v uložení, kde chybí. Logika `lib/money.ts` (kolik stojí / kolik
  zbyde, štítky cen) a `lib/clock.ts` (čas slovy „půl 6“, „čtvrt na 3“, „třičtvrtě na 5“, hodiny 1–12).
- Čas je příklad `kind: 'time'` s odpovědí `hodiny × 100 + minuty` (4:45 → 445); dítě píše číslice,
  dvojtečka se zobrazí před posledními dvěma, „Hotovo“ až od 3 číslic. Ciferník `ClockFace`.
- Zaškrtnutí smí mít mezery (lehké + těžké); posun skočí na nejbližší zaškrtnutou (`stepTier`).
- Truhla je společná: 5 správně v řadě napříč kategoriemi (`updateChestStreak`).
- Přechod: sčítání = jednotky dají víc než 10; odčítání = jednotky menšence nestačí.
- Násobilka: činitel 1–10, zápis `k × řada` (schváleno „×“ místo „·“; minus jako „−“).
- Chybějící číslo skrývá první nebo druhý člen; porovnávání = výraz vs. číslo, ~1/3 rovnost.
- Slovní úlohy: šablony v `lib/wordProblems.ts` (téma hry, skloňování ve 4. pádě), nápověda
  „Spočítej a op b.“, text úlohy v `problem.story`, odpověď do okénka pod textem.
- Nápověda nikdy neukazuje výsledek posledního kroku („8 + 2 = 10, a ještě + 5.“).
- Kód: `lib/equations.ts` (rovnice), `lib/mathGenerator.ts` (příklady, nápovědy),
  `lib/difficulty.ts` (obtížnost kategorií, truhla), `lib/economy.ts`, `lib/topics.ts`.
  Testy používají deterministické RNG.

#### Úspěšnost a doporučení pro rodiče (schváleno)
- Úspěch = správně napoprvé a v limitu (30 s, slovní úlohy 90 s, peníze a hodiny 60 s); čas jen při otevřené Akademii
  a viditelné hře (`ActiveStopwatch`). Dítě o tom neví — zlaťáky i pochvala beze změny.
- Pro každou kategorii × obtížnost posledních 20 výsledků (`save.practice`), doporučení od 10.
- ≥ 95 %: na nejtěžší zaškrtnuté nabídne přidat těžší, jinak odebrat tuto; < 25 %: odebrat tuto,
  nebo (je-li jediná) přidat lehčí. Nejvýš jedno na kategorii. „Teď ne“ = znovu po 20 výsledcích.
- Odškrtnutím obtížnosti se smaže její historie. Logika `lib/practice.ts`, UI `PracticePicker`.

### 4. Medaile (dřív Síň slávy, schváleno, návrh `docs/superpowers/specs/2026-10-18-medaile-design.md`)
- Pro každou z 8 kategorií úloh bronzová / stříbrná / zlatá medaile za 10 / 100 / 200 správných
  v kategorii (`stats.correctByTopic`, počítá se i správně na další pokus, přeskočený ne). Medaile nedávají
  zlaťáky. Logika `lib/medals.ts` (`MEDALS`, `awardMedals`, `nextMedal`).
- Obrazovka: karta pro každou kategorii (3 medaile + „do stříbrné 42/100“, po všech „Všechny medaile!“),
  pod ní oddíl „Odznaky“. UI `MedalsScreen`, `MedalIcon`.
- Odznaky:
  - „První krok": 10 správných celkem
  - „Násobilková hvězda": 10 správných z násobilky v řadě (nic neodemyká)
  - „Pilná školačka": 100 správných celkem → Bronzová korunka
  - „Šikovná počtářka": 200 správných celkem → Stříbrná korunka
  - „Královna počítání": 300 správných celkem → Zlatá korunka
- Oslavy: společná fronta (`lib/celebrations.ts`), medaile před odznakem. Nová medaile = celoobrazovková
  animace (pád medaile, paprsky, konfety, fanfára `playFanfare`), `MedalCelebration`; při omezeném pohybu
  bez animací. Během oslavy stojí stopky Akademie. Doplněné při načtení/importu/resetu se neoslavují.
- Logika v `lib/badges.ts` (`BADGES`, `awardBadges`). Odemčené kousky se berou z `unlockBadge`
  v items.json; `awardBadges` je doplní i k dříve získaným odznakům (např. po importu).
- Odznaky se kontrolují po každé správné odpovědi a při načtení hry; získaný odznak už nezmizí.
- Nový odznak = oslavné okno nad čímkoli (fronta, když jich padne víc najednou); u odznaku
  s odměnou tlačítko „Do šatníku“. U nezískaných odznaků je vidět postup (např. 9/10).

## Rodičovský panel

- Ikona ozubeného kola (malá, nenápadná)
- PIN nastavení při prvním spuštění (žádný výchozí PIN)
- Editor kategorií a obtížností (stejný jako v Kroku 1) s úspěšností u každé obtížnosti
- Export/import postupu jako JSON (s validací při importu)
- Reset hry s potvrzením

#### Rozhodnutí ke kroku 9 (Claude)
- PIN (4 číslice, 2× pro kontrolu) se nastavuje na úvodní obrazovce při prvním spuštění, dokud
  není nastaven, hra se neukáže. Ozubené kolečko je v hlavičce Síně slávy.
- PIN je jen dětský zámek: ukládá se jako otisk FNV-1a (`hashPin`), ne jako text. Funguje i bez
  HTTPS (test na telefonu v síti). Zapomenutý PIN = smazat data stránky v prohlížeči.
- Poslední zaškrtnutou obtížnost v celé hře nejde odškrtnout (`toggleTier`).
- Reset smaže postup (zlaťáky, oblečení, odznaky, statistiky, úspěšnost, obtížnosti kategorií),
  PIN a zaškrtnuté kategorie zůstanou.
- Export = JSON celého stavu `panenka-postup-RRRR-MM-DD.json`. Import: max 100 kB, validace přes
  `parseSave`, potvrzení s přehledem; když záloha nemá PIN, zůstane současný. Odznaky z importu
  se neoslavují.
- Změna kategorií, reset i import začnou v Akademii nové kolo (React `key`).
- Logika: `lib/parent.ts`, UI: `components/parent/`.

## Časový zámek (schváleno po MVP)

- Při každém zapnutí hra chce PIN, pokud neběží odemknutí: buď odpočet z minula (přežije
  zavření), nebo „Bez omezení“ v tomto spuštění (sessionStorage, platí do zavření hry).
- Po PINu Krok 1 ze 2 „Co dnes procvičíme?“ (doporučení + editor kategorií, „Dál“), pak Krok 2 ze 2
  „Jak dlouho dnes?“: předvolby 10/15/20/30 min (výchozí 15), vlastní čas po 5 min (5–120),
  „Bez omezení“, tlačítko „Zpět“. Při prvním spuštění oba kroky hned po nastavení PINu.
- Odpočet nahoře na všech obrazovkách (`TimerBar`), běží podle hodin i při zavřené hře.
  Poslední minutu „Ještě minutka!“. U „Bez omezení“ se neukazuje.
- Konec času: v Akademii se rozdělaný příklad (vč. pochvaly, truhly, ukázaného řešení) dokončí,
  další už nepřijde (`lockRequested` → fáze `paused`); jinde se zamkne hned.
- Zamčená obrazovka „Čas na pauzu!“ s vydělanými zlaťáky za odemknutí + „Pro rodiče: odemknout
  PINem“ → PIN → výběr času. Bez vypršeného záznamu ukazuje „Ahoj! Hru odemkne rodič.“
- Logika `lib/playTime.ts` (`panenka_unlock` v localStorage, `panenka_unlock_session`
  v sessionStorage, validace — konec dál než 120 min = neplatné), hook `usePlayTime`,
  UI `components/lock/`.

## Přeskočení příkladu (schváleno po MVP)

- U každého příkladu tlačítko „Je to moc těžké, přeskočit“: ukáže správný výsledek
  („Nevadí! Správně je X.“) a „Další příklad“. Bez zlaťáků, nepočítá se do kola ani do správných
  odpovědí, v úspěšnosti pro rodiče se zapíše jako neúspěch, vynuluje řadu hvězdiček i řadu
  násobilky, obtížnost kategorie o jednu níž (jen mezi zaškrtnutými).

## UI

- Mobil na výšku, min. 56 px dotyková tlačítka
- Pastelové barvy, krátké texty, žádný stres ani časomíra
- Cíl: 5–10 minut hraní najednou
- Jemné animace (CSS), zvuk při získání zlaťáků (Web Audio), možnost zvuk vypnout

---

## Pravidla vývoje

- MVP: pouze výše popsané funkce. Žádné přidávání navíc bez schválení.
- Každý krok commitnout do gitu s popisným message.
- Testy pro mathGenerator.ts a ekonomiku (vitest).
- Kód v TypeScript, Tailwind pro styly.
