# Levnější odměny, velký obchod a doplňky podle místa – plán stavby

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Snížit odměny na polovinu, rozšířit obchod na aspoň 10 kousků v každé kategorii oblečení
a ~19 doplňků a dovolit nasadit víc doplňků najednou, každý na své místo na těle.

**Architecture:** Doplňky dostanou `slot`, nasazení se klíčuje „místem“ (`EquipSlot`) místo kategorie;
uložený stav přejde na `saveVersion: 3` s převodem (nasazení se z hodnot znovu rozmístí podle kousků,
takže v1/v2/v3 projdou stejnou cestou). Nová grafika vzniká jako parametrizované SVG komponenty
(barevné varianty) v `src/graphics/`.

**Tech Stack:** Vite 8, React 19, TypeScript 7, Tailwind 4, Vitest 5.

**Spec:** `docs/superpowers/specs/2026-10-18-obchod-zlataky-doplnky-design.md`

## Global Constraints

- Odměna za správnou odpověď: lehké a střední **5**, těžké **8**; truhla **10–20**.
- Aspoň **10 kousků s cenou > 0** ve vlasech, šatech i botách; doplňků s cenou > 0 aspoň **16**.
- Ceny v rozmezí: vlasy 30–120, šaty 40–150, boty 20–110, doplňky 15–80; součet všech koupitelných **2500–3500**.
- Místa doplňků (`AccessorySlot`): `head`, `face`, `neck`, `hand`, `ears`; na každém nejvýš 1 kousek.
- Stávající id kousků, ceny stávajících kousků a startovní kousky (`price: 0`) se nemění; korunka zůstává `price: null`, `unlockBadge: 'times-table-star'`, `slot: 'head'`.
- Grafika: SVG ve společném plátně 300 × 600 (`src/graphics/`), styl jako dosud; nové názvy česky v 1. pádě.
- Vlasy jdou jen vyměnit, ne sundat (`ALWAYS_WORN = ['hair']`).
- Každý task: testy napřed, `npm test` zelené, commit česky zakončený `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; `npm run build` zelené na konci Tasků 1, 3 a 8 (mezi nimi smí padat typy jen v `src/components`).

## Review Focus

1. **Telefon s uloženým stavem v2 a korunkou na hlavě** → po převodu korunka na místě `accessory:head`, zlaťáky, kousky, odznaky, PIN beze změny – Task 3 test.
2. **Druhý doplněk na stejné místo** vymění první; doplněk na jiné místo přibude; klepnutí na nasazený ho sundá – Task 2 test.
3. **Import staré zálohy v1/v2** projde a nasazení se rozmístí – Task 3 test přes `importProgress`.
4. **Nová grafika nezakrývá obličej ani jiné vrstvy nesmyslně** – Task 8 galerie všech kousků v prohlížeči.
5. **Obchod s ~60 kousky na telefonu 375 × 812** – bez přetékání do šířky, seřazeno podle ceny, nákup funguje – Task 8 prohlížeč.

---

### Task 1: Odměny na polovinu

**Files:** Modify `src/lib/economy.ts`; Test `src/tests/economy.test.ts`, `src/tests/academy.test.ts`

**Interfaces:** Produces `rewardForCorrect(tier): number` (5/5/8), `CHEST_MIN = 10`, `CHEST_MAX = 20`.

- [ ] **Step 1:** Upravit testy: `rewardForCorrect` → `[5, 5, 8]`; truhla min 10, max 20, `values.size === 11`, `rollChestReward(() => 0) === 10`, `(() => 0.999999) === 20`; academy: odměny `{ reward: 5, gold: 5 }` a `{ reward: 8, gold: 8 }`.
- [ ] **Step 2:** `npx vitest run src/tests/economy.test.ts src/tests/academy.test.ts` → FAIL.
- [ ] **Step 3:** Změnit hodnoty v `economy.ts`.
- [ ] **Step 4:** `npm test` a `npm run build` → zelené.
- [ ] **Step 5:** Commit „Odměny za příklady na polovinu“.

### Task 2: Místa doplňků a nasazování

**Files:** Modify `src/types/index.ts`, `src/data/items.json` (jen pole `slot` u 5 stávajících doplňků), `src/lib/wardrobe.ts`; Test `src/tests/wardrobe.test.ts`, `src/tests/items.test.ts`

**Interfaces:**
- Produces (types): `ACCESSORY_SLOTS = ['head','face','neck','hand','ears'] as const`, `type AccessorySlot`,
  `type EquipSlot = Exclude<Category, 'accessory'> | \`accessory:${AccessorySlot}\``, `type Equipped = Partial<Record<EquipSlot, string>>`,
  `Item.slot?: AccessorySlot` (povinné u `category === 'accessory'`, jinak chybí). `SaveData.equipped: Equipped`.
- Produces (`wardrobe.ts`): `equipSlot(item: Item): EquipSlot`, `toggleEquip(save, itemId)` klíčuje podle `equipSlot`.
- Sloty stávajících: `acc-bow-pink` head, `acc-crown` head, `acc-glasses` face, `acc-necklace` neck, `acc-bag` hand.

- [ ] **Step 1: Testy:** brýle + náhrdelník + kabelka nasazené zároveň; mašle a korunka se na hlavě vymění; klepnutí na nasazený doplněk ho sundá; vlasy dál nejdou sundat; `equipSlot` vrací `'accessory:face'` pro brýle a `'dress'` pro šaty; katalog: každý doplněk má platný `slot`, žádný jiný kousek `slot` nemá.
- [ ] **Step 2:** FAIL. **Step 3:** Implementace. **Step 4:** `npm test` (storage testy smí padat do Tasku 3 – zapsat ruling).
- [ ] **Step 5:** Commit „Doplňky podle místa na těle“.

### Task 3: Uložený stav v3 a převod

**Files:** Modify `src/lib/storage.ts`, `src/components/doll/DollViewer.tsx`, `src/components/screens/WardrobeScreen.tsx` (jen typy, aby build prošel); Test `src/tests/storage.test.ts`, `src/tests/parent.test.ts`

**Interfaces:** `SAVE_VERSION = 3`; `parseSave` přijme 1, 2 i 3. Nasazení se čistí **podle hodnot**: z `equipped` se vezmou všechny řetězcové hodnoty (bez ohledu na klíč), nechají se jen existující a vlastněné kousky a uloží se pod `equipSlot(item)`; při kolizi vyhrává první. `createDefaultSave` nasadí startovní kousky pod jejich `equipSlot`.

- [ ] **Step 1: Testy:** převod v2 (fixture: korunka a šaty nasazené, PIN, 131 zlaťáků) → `equipped['accessory:head'] === 'acc-crown'`, ostatní pole beze změny, `saveVersion === 3`; v1 fixture z minulých testů projde a nasazení se rozmístí; v3 se dvěma doplňky na různých místech se načte beze změny; dva kousky na stejném místě → zůstane první; import v2 zálohy přes `importProgress` projde; stávající testy přepnout na v3.
- [ ] **Step 2:** FAIL. **Step 3:** Implementace + typové úpravy `DollViewer`/`WardrobeScreen` (`Equipped`). **Step 4:** `npm test` a `npm run build` → zelené.
- [ ] **Step 5:** Commit „Uložený stav v3: nasazení po místech“.

### Task 4: Nové vlasy (aspoň 10 koupitelných)

**Files:** Modify `src/graphics/hair.tsx` (parametrizovat tvary: `Ponytail`, `Long`, `Braids`, `Bob` + nové `Bun`, `Pigtails`, `Curly` s props `{ fill, line }`), `src/graphics/index.ts` (registr), `src/data/items.json`; Test `src/tests/items.test.ts`

**Interfaces:** Stávající 4 id zůstávají. Nové (návrh, název/barvu smí stavitel doladit): `hair-ponytail-blonde`, `hair-long-black`, `hair-braids-brown`, `hair-bob-pink`, `hair-bun-brown`, `hair-pigtails-blonde`, `hair-curly-red` → celkem 10 koupitelných + startovní.

- [ ] **Step 1: Testy (items.test):** vlasy mají ≥ 10 kousků s cenou > 0, ceny v 30–120; registr grafiky (stávající test „každý kousek má grafiku“) pokryje nové.
- [ ] **Step 2:** FAIL. **Step 3:** Kreslení + data. **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit „Obchod: nové vlasy“.

### Task 5: Nové šaty (aspoň 10 koupitelných)

**Files:** `src/graphics/dress.tsx` (parametrizovat + nové tvary `Swimsuit`, `Tracksuit`, `Princess`), `src/graphics/index.ts`, `src/data/items.json`; Test `src/tests/items.test.ts`

**Interfaces:** Nové (návrh): `dress-tshirt-green`, `dress-blue`, `dress-flowers`, `dress-swimsuit`, `dress-tracksuit`, `dress-princess-pink`, `dress-jeans-top` → 10 koupitelných + startovní.

- [ ] **Step 1: Test:** šaty ≥ 10 s cenou > 0, ceny 40–150. **Step 2:** FAIL. **Step 3:** Kreslení + data. **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit „Obchod: nové šaty“.

### Task 6: Nové boty (aspoň 10 koupitelných)

**Files:** `src/graphics/shoes.tsx` (parametrizovat + nové `RainBoots`, `Skates`, `Slippers`), `src/graphics/index.ts`, `src/data/items.json`; Test `src/tests/items.test.ts`

**Interfaces:** Nové (návrh): `shoes-sneakers-pink`, `shoes-flats-gold`, `shoes-boots-white`, `shoes-rainboots-yellow`, `shoes-skates`, `shoes-slippers-pink`, `shoes-sneakers-blue` → 10 koupitelných + startovní.

- [ ] **Step 1: Test:** boty ≥ 10 s cenou > 0, ceny 20–110. **Step 2:** FAIL. **Step 3:** Kreslení + data. **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit „Obchod: nové boty“.

### Task 7: Nové doplňky (aspoň 16 koupitelných)

**Files:** `src/graphics/accessories.tsx`, `src/graphics/index.ts` (+ výchozí výřez náhledu podle místa), `src/data/items.json`; Test `src/tests/items.test.ts`, `src/tests/graphics.test.ts`

**Interfaces:** `thumbnailViewBox(item: Pick<Item,'category'|'asset'|'slot'>)` – pořadí: výřez konkrétního assetu → výřez podle `slot` (`head '76 22 148 148'`, `face '84 84 132 100'`, `neck '96 180 108 90'`, `hand '170 300 90 110'`, `ears '70 100 160 90'`) → podle kategorie.
Nové (návrh): hlava `acc-headband-pink`, `acc-headband-blue`, `acc-hat-straw`, `acc-beret-red`, `acc-bow-blue`, `acc-flower-clip`; obličej `acc-sunglasses`, `acc-glasses-hearts`; krk `acc-scarf-red`, `acc-scarf-stripes`, `acc-pendant-heart`; ruka `acc-umbrella`, `acc-balloon`, `acc-bouquet`; uši `acc-earrings-pearl`, `acc-earrings-heart` → 19 koupitelných.

- [ ] **Step 1: Testy:** doplňky ≥ 16 s cenou > 0, ceny 15–80, každé místo má aspoň 1 koupitelný kousek; **součet cen všech koupitelných 2500–3500**; `thumbnailViewBox` pro doplněk bez vlastního výřezu vrací výřez svého místa.
- [ ] **Step 2:** FAIL. **Step 3:** Kreslení + data. **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit „Obchod: nové doplňky na všechna místa“.

### Task 8: UI obchodu a šatníku + kontrola v prohlížeči

**Files:** Modify `src/components/screens/ShopScreen.tsx` (v každé kategorii řadit podle ceny vzestupně), `src/components/screens/WardrobeScreen.tsx` (u doplňků zvýraznit všechny nasazené; pod náhledem malý popisek místa: „hlava / obličej / krk / ruka / uši“), `CLAUDE.md` (sekce Grafika, Obchod, Šatník, odměny; přesunout položku z „Rozpracováno“)

- [ ] **Step 1:** `npm test` a `npm run build` → zelené.
- [ ] **Step 2: Prohlížeč (dev server, 375 × 812, PIN 1234):** dočasná galerie všech kousků (jako v kroku 4 MVP, necommitovat) – projít každý kousek očima; šatník: brýle + náhrdelník + kabelka + mašle najednou, korunka vymění mašli; obchod: kategorie seřazené podle ceny, žádné přetékání do šířky, nákup za vložené zlaťáky funguje; v2 save s korunkou na hlavě se po načtení převede.
- [ ] **Step 3:** Commit „Obchod a šatník pro víc kousků a doplňků“.
- [ ] **Step 4:** Zeptat se rodiče na odeslání na GitHub (push = nasazení).
