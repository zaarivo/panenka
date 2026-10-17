# Panenka — Matematická módní hra

PWA webová hra v češtině pro 8letou holčičku. Oblékání panenky, kde se oblečení kupuje za zlaťáky
vydělané řešením matematických příkladů.

---

## Technologie (rozhodnutí)

- **Vite + React + TypeScript + Tailwind CSS** — bez backendu, bez účtu, bez reklam
- **TypeScript** — rozhodnutí Clauda (zadání jazyk neurčilo)
- **vite-plugin-pwa** — manifest, ikony (PNG 192/512 + maskable, generované jednorázovým skriptem ze SVG), service worker (offline funguje)
- **base** — výchozí `'/panenka/'` pro GitHub Pages, přepsatelné proměnnou `BASE_PATH` při buildu
- **Vitest** — testy pro mathGenerator a ekonomiku
- **Web Audio API** — zvuky generovány kódem, žádné externí soubory
- **Zero network requests** — vše funguje offline

## Stav a uložení

- `localStorage` s klíčem `panenka_save`, verze je uvnitř dat (`saveVersion: 1`)
- Veškeré čtení/zápis v `try/catch`; při poškozených datech výchozí stav (bez pádu)
  a původní text se schová pod `panenka_save_corrupt` pro ruční záchranu
- `parseSave()` validuje a čistí data (neznámé kousky/odznaky zahodí, startovní kousky doplní,
  úroveň srovná do mezí rodiče) — použije se i při importu JSON v rodičovském panelu

## Grafika

- Panenka jako SVG vrstvy ve viewBox `0 0 300 600`, originální postava
- Pořadí vrstev: pozadí → tělo → boty → šaty → vlasy → doplňky
- Každá položka v `src/data/items.json`: `{ id, name, category, price, layer, asset }`
- Komponenta vrstvy umí SVG i PNG (pro pozdější výměnu grafiky bez změny logiky)
  - `asset` = klíč vestavěné SVG grafiky (`src/graphics/`), nebo cesta k obrázku v `public/`
    končící `.png/.webp/.jpg` (např. `doll/dress-pink.png`). Obrázek musí mít plátno 300 × 600
    s průhledným pozadím, aby lícoval s panenkou. Pozadí a tělo jdou vyměnit stejně (`BASE_ASSETS`).
  - `resolveAsset()` v `src/graphics/index.ts` rozhoduje SVG vs. obrázek; `DollViewer` skládá vrstvy
    podle `LAYER_ORDER`, `LayerAsset` vykreslí jednu vrstvu.
  - Geometrie postavy: hlava střed (150,125), ramena y≈212, pas y≈300, ruce (83,356)/(217,356),
    chodidla (131,547)/(169,547). Pravá strana se kreslí zrcadlením (`Mirrored`).
- 4 kategorie × 4 kusy = 16 položek celkem
- Na startu 1 kousek z každé kategorie zdarma (default outfit) — v items.json `price: 0`
- Korunka je 17. položka s `price: null` a `unlockBadge` — nedá se koupit, odemyká ji odznak
- Na sobě vždy nejvýš 1 kousek z každé kategorie (i u doplňků) — rozhodnutí Clauda pro MVP

## Obrazovky (spodní lišta, 4 záložky)

### 1. Šatník
- Oblékání z vlastněných věcí (klepnutím nasadit/sundat)
- Vlasy jdou jen vyměnit, ne sundat (schváleno) — `ALWAYS_WORN` v `lib/wardrobe.ts`
- Bez šatů má panenka bílé tílko a kraťásky (součást těla)
- Tlačítko „Vyfotit": canvas render → PNG → Web Share API nebo ke stažení
  - `lib/photo.ts`: PNG 600 × 1200 (2×), PNG vrstvy se před vykreslením vloží jako data URL
  - Sdílení přes Web Share API ověřit na telefonu (v prohlížeči na PC jde stažení)
- Náhledy kousků: tělo + kousek, výřez podle kategorie / konkrétního doplňku (`thumbnailViewBox`)

### 2. Obchod
- Ceny z items.json: doplňky 20–30, boty/vlasy 40, šaty 50–60 zlaťáků
- Zamčené věci šedě s cenou; kousky, na které už zlaťáky stačí, jsou barevné s růžovým rámečkem
  (schváleno), koupené mají zelený rámeček a „Už máš“
- Potvrzovací dialog před nákupem
- V obchodě jen 12 kousků s cenou > 0 (startovní kousky a korunka tam nejsou) — rozhodnutí Clauda
- Když zlaťáky nestačí: dialog s chybějící částkou a tlačítkem „Jít počítat“ do Akademie
- Texty neskloňují názvy kousků (název je vždy v 1. pádě), počty zlaťáků přes `formatGold()`

### 3. Matematická akademie
- Generátor příkladů kódem (ne pevný seznam), výsledky počítá kód, vždy ≥ 0
- Bez opakování stejného příkladu po sobě
- Typy: sčítání/odčítání do 20 a do 100 (přes desítku), násobilka po řadách,
  chybějící číslo (7 + ? = 15), porovnávání (<, >, =)
- Adaptivní obtížnost: po 5 správných v řadě → o stupeň těžší; po 2 chybách v řadě → o stupeň lehčí
  (v mezích nastavených rodičem)
- Odměna: +10 zlaťáků (lehčí), +15 (těžší stupeň)
- Chyba: nápověda podle typu (rozklad přes desítku, násobilka jako opakované sčítání), další pokus
- Vlastní velká číselná klávesnice (ne systémová)
- Po 5 správných v řadě: bonusová truhla, náhodná odměna 20–40 zlaťáků

#### Stupně obtížnosti (schváleno)
| Stupeň | Sčítání/odčítání, chybějící číslo, porovnávání | Násobilka (řady) |
|---|---|---|
| 1 | do 20 bez přechodu přes desítku | 2, 5, 10 |
| 2 | do 20 s přechodem | + 3, 4 |
| 3 | do 100 bez přechodu | + 6, 7 |
| 4 | do 100 s přechodem | + 8, 9 |

- Přechod: sčítání = jednotky dají víc než 10; odčítání = jednotky menšence nestačí.
- Násobilka: činitel 1–10, zápis `k · řada` (české „·“, minus jako „−“).
- Odměna 10 zlaťáků na stupních 1–2, 15 na stupních 3–4 (podle stupně, na kterém příklad vznikl).
- Chybějící číslo skrývá první nebo druhý člen; porovnávání = výraz vs. číslo, ~1/3 rovnost.
- Každý pokus se počítá: chyba nuluje řadu správných, správná odpověď nuluje řadu chyb.
  Po povýšení/snížení se řada nuluje. Truhla po každých 5 správných v řadě i na maximálním stupni.
- Nápověda nikdy neukazuje výsledek posledního kroku („8 + 2 = 10, a ještě + 5.“).
- Kód: `lib/mathGenerator.ts` (příklady, nápovědy), `lib/difficulty.ts` (adaptivita),
  `lib/economy.ts` (odměny, truhla, nákup). Testy používají deterministické RNG.

### 4. Síň slávy
- Odznaky za úspěchy; některé odemykají nekoupitelné kousky
- MVP odznaky:
  - „První krok": 10 správných celkem
  - „Násobilková hvězda": 10 správných z násobilky v řadě → odemkne korunku
  - „Pilná školačka": 100 správných celkem

## Rodičovský panel

- Ikona ozubeného kola (malá, nenápadná)
- PIN nastavení při prvním spuštění (žádný výchozí PIN)
- Volba povolených typů příkladů a rozsahu obtížnosti (zaškrtávátka)
- Export/import postupu jako JSON (s validací při importu)
- Reset hry s potvrzením

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
