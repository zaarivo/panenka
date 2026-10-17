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
- 4 kategorie × 4 kusy = 16 položek celkem
- Na startu 1 kousek z každé kategorie zdarma (default outfit) — v items.json `price: 0`
- Korunka je 17. položka s `price: null` a `unlockBadge` — nedá se koupit, odemyká ji odznak
- Na sobě vždy nejvýš 1 kousek z každé kategorie (i u doplňků) — rozhodnutí Clauda pro MVP

## Obrazovky (spodní lišta, 4 záložky)

### 1. Šatník
- Oblékání z vlastněných věcí (klepnutím nasadit/sundat)
- Tlačítko „Vyfotit": canvas render → PNG → Web Share API nebo ke stažení

### 2. Obchod
- Ceny z items.json: doplňky 20–30, boty/vlasy 40, šaty 50–60 zlaťáků
- Zamčené věci šedě s cenou
- Potvrzovací dialog před nákupem

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
