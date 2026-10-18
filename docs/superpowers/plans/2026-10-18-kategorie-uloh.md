# Kategorie úloh s obtížnostmi – plán stavby

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nahradit typy + společné stupně 1–4 šesti kategoriemi úloh s obtížnostmi lehké/střední/těžké,
přidat slovní úlohy, obtížnost zvlášť pro každou kategorii, sledování úspěšnosti a doporučení pro
rodiče v novém Kroku 1 po zadání PINu.

**Architecture:** Nové čisté moduly (`topics`, `wordProblems`, `practice`, `stopwatch`) se přidají
vedle stávajících, pak se datový model přepne na `saveVersion: 2` s převodem v1 → v2 a nakonec se
přepojí UI (Krok 1, rodičovský panel, Akademie). Logika je v `src/lib`, testy ve `src/tests`.

**Tech Stack:** Vite 8, React 19, TypeScript 7, Tailwind 4, Vitest 5.

**Spec:** `docs/superpowers/specs/2026-10-18-kategorie-uloh-design.md`

## Global Constraints

- V kódu se kategorie úloh jmenuje **topic** (`TopicId`) – `Category` už znamená druh oblečení.
- Obtížnosti v kódu `'easy' | 'medium' | 'hard'`, v UI vždy slovy **lehké / střední / těžké**.
- Pořadí kategorií: `add20`, `add100`, `multiplication`, `missingNumber`, `comparison`, `wordProblems`.
- Násobení „×“, minus „−“, výsledky nikdy záporné, žádný stejný příklad dvakrát po sobě, nápověda neprozradí výsledek.
- Odměna: lehké a střední **10**, těžké **15** zlaťáků (podle obtížnosti, na které příklad vznikl).
- Úspěch = správně napoprvé a v limitu; limit **30 000 ms**, pro `wordProblems` **90 000 ms**.
- Okno úspěšnosti **20** výsledků, doporučení od **10**; prahy **≥ 0,95** a **< 0,25**; „Teď ne“ = znovu po **20** dalších výsledcích.
- Dítě nikde nevidí úspěšnost ani čas; pomalá správná odpověď nemění zlaťáky ani obtížnost.
- Žádné síťové požadavky; všechna data v localStorage přes `storage.ts`.
- Každý task: testy napřed, `npm test` zelené, commit (zpráva česky, končí `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).
- `npm run build` (typová kontrola) musí být zelené na konci Tasku 1 a pak až od konce Tasku 8 – Tasky 2–7 dočasně rozbijí komponenty/hooky, které přepojí Task 8. Chyby typů v mezikrocích smějí být jen v `src/components`, `src/hooks` a `src/App.tsx`, nikdy v `src/lib`.

## Review Focus

1. **Aktualizace na telefonu:** skutečný v1 save (PIN, zlaťáky, korunka na sobě, odznaky) se načte do v2 bez ztráty – Task 6, test „převod reálného v1 save“.
2. **Rodič odškrtne právě hranou obtížnost / celou kategorii:** aktuální obtížnost se srovná, generátor nikdy nevybere vypnutou kategorii ani nezaškrtnutou obtížnost – Task 7 (`updateTopics`) a Task 2 (`pickTopic`).
3. **Slovní úloha neprozradí výsledek a skloňuje správně** (1 / 2–4 / 5+) – Task 3.
4. **Měření času se zastaví** při skryté aplikaci a mimo záložku Akademie – Task 5 (`ActiveStopwatch`).
5. **Mezery v obtížnostech** (lehké + těžké) a poslední zaškrtnutá obtížnost nejde odškrtnout – Task 1 (`toggleTier`) a Task 4 (`stepTier`).

---

### Task 1: Kategorie a obtížnosti – typy a pomocné funkce

**Files:**
- Modify: `src/types/index.ts` (přidat, nic nemazat)
- Create: `src/lib/topics.ts`
- Test: `src/tests/topics.test.ts`

**Interfaces:**
- Produces (types): `TOPIC_IDS`, `type TopicId`, `TIERS = ['easy','medium','hard'] as const`, `type Tier`,
  `type TopicSettings = Record<TopicId, Tier[]>`, `type PracticeKey = \`${TopicId}:${Tier}\``,
  `interface PracticeRecord { recent: boolean[]; total: number; snoozedAtTotal: number | null }`,
  `type Practice = Partial<Record<PracticeKey, PracticeRecord>>`.
- Produces (`topics.ts`): `TOPIC_LABELS: Record<TopicId, string>` (texty z tabulky spec),
  `TIER_LABELS: Record<Tier, string>` (`lehké`/`střední`/`těžké`), `practiceKey(topic, tier): PracticeKey`,
  `allTiersOn(): TopicSettings`, `enabledTopics(s: TopicSettings): TopicId[]`,
  `sortTiers(tiers: Tier[]): Tier[]`, `toggleTier(s: TopicSettings, topic, tier): TopicSettings`.

- [ ] **Step 1: Testy**
  - `toggleTier` zapne/vypne obtížnost, výsledek seřazený a bez duplicit.
  - `toggleTier` nevypne poslední zaškrtnutou obtížnost v celé hře (vrátí stejný objekt).
  - Mezery povolené: `easy` + `hard` bez `medium` projde.
  - `enabledTopics` vrací jen kategorie s aspoň jednou obtížností, v pořadí `TOPIC_IDS`.
  - `TIER_LABELS` = `{ easy: 'lehké', medium: 'střední', hard: 'těžké' }`.
- [ ] **Step 2:** `npx vitest run src/tests/topics.test.ts` → FAIL (modul chybí).
- [ ] **Step 3:** Implementace podle Interfaces.
- [ ] **Step 4:** `npm test` → vše PASS.
- [ ] **Step 5:** Commit „Kategorie úloh a obtížnosti: typy a pomocné funkce“.

### Task 2: Generátor podle kategorie a obtížnosti

**Files:**
- Modify: `src/lib/mathGenerator.ts`
- Test: `src/tests/mathGenerator.test.ts` (přepsat na kategorie × obtížnosti)

**Interfaces:**
- Consumes: Task 1 typy.
- Produces: `Problem` = `{ topic: TopicId; tier: Tier; prompt: string; hint: string; key: string; story?: string } & ({ kind: 'number'; answer: number } | { kind: 'compare'; answer: CompareSign })`.
  `generateProblem({ topic, tier, previousKey?, rng? }): Problem`, `pickTopic(enabled: TopicId[], rng): TopicId`,
  `isCorrectAnswer(problem, given)`. Stávající `generateProblem({types, level})`, `ADD_SUB_RULES`
  a `MULTIPLICATION_ROWS` podle `Level` se odstraní; nápovědy (`addHint`, `subHint`, `multiplicationHint`) zůstávají.
- Pravidla (rozsahy):
  - `add20.easy`: vše ≤ 10 (sčítance 1–9, menšenec 2–10), přechod nehlídat; `add20.medium` = dnešní stupeň 1; `add20.hard` = dnešní stupeň 2.
  - `add100.easy`: celé desítky (krok 10, sčítance 10–90, menšenec 20–100), výsledek ≤ 100; `add100.medium` = stupeň 3; `add100.hard` = stupeň 4.
  - `multiplication`: řady easy `[2,5,10]`, medium `[2,3,4,5,10]`, hard `[2..10]`; činitel 1–10.
  - `missingNumber` a `comparison`: rovnice z easy → `add20.easy`; medium → náhodně `add20.medium`/`add20.hard`; hard → náhodně `add100.medium`/`add100.hard`. Mez porovnávaného čísla 10 / 20 / 100.
  - `wordProblems` se v tomto tasku jen přesměruje na `generateWordProblem` z Tasku 3 (do té doby test kategorie přeskočit `test.todo`).

- [ ] **Step 1: Testy** (stávající nezávislý „oracle“ z textu příkladu zachovat): pro každou kategorii kromě `wordProblems` × každou obtížnost 2000 příkladů – výsledek sedí, čísla v mezích (10/20/100), přechod odpovídá (`add20.medium` bez, `add20.hard` s, `add100.medium` bez, `add100.hard` s), `add100.easy` jen násobky 10, řady násobilky odpovídají, žádné dva stejné `key` po sobě, `problem.topic`/`tier` odpovídají zadání. `pickTopic` vrací jen povolené kategorie a všechny z nich.
- [ ] **Step 2:** `npx vitest run src/tests/mathGenerator.test.ts` → FAIL.
- [ ] **Step 3:** Implementace. Tabulka pravidel `EQUATION_RULES: Record<'add20' | 'add100', Record<Tier, AddSubRule>>`, kde `AddSubRule` dostane `crossing: boolean | null` a `step?: 10`.
- [ ] **Step 4:** `npm test` → PASS; `npx tsc -p tsconfig.app.json --noEmit` smí hlásit chyby jen mimo `src/lib` (viz Global Constraints).
- [ ] **Step 5:** Commit „Generátor příkladů podle kategorie a obtížnosti“.

### Task 3: Slovní úlohy

**Files:**
- Create: `src/lib/wordProblems.ts`
- Modify: `src/lib/mathGenerator.ts` (napojení `wordProblems`)
- Test: `src/tests/wordProblems.test.ts`

**Interfaces:**
- Consumes: `plural` z `lib/czech.ts`, rovnice z Tasku 2.
- Produces: `WORD_TEMPLATES: Record<Tier, readonly WordTemplate[]>`, `WordTemplate = { op: '+' | '−' | '×'; render: (a: number, b: number, name: string) => string }`,
  `generateWordProblem(tier, rng): Problem` – `kind: 'number'`, `story` = text úlohy, `prompt = '?'`, `hint = "Spočítej {a} {op} {b}."`.
  Obtížnosti: easy → rovnice `add20.medium`/`add20.hard`, medium → `add100.medium`/`add100.hard`, hard → násobilka řady 2–10, činitel 2–10.

- [ ] **Step 1: Testy:** ≥ 8 šablon na obtížnost; pro 500 úloh na obtížnost: odpověď = výpočet z nápovědy, příběh obsahuje čísla `a` i `b`, **neobsahuje výsledek** (pokud se nerovná `a` ani `b`), neobsahuje `undefined`/`NaN`/`?`, končí otazníkem; skloňování: pro šablonu s podstatným jménem vyrenderovat `a` = 1, 3, 5 a ověřit tvary (`1 mašle`, `3 mašle`, `5 mašlí` apod. dle zvolených slov).
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Šablony: krátké věty, téma hry (panenka, mašle, šaty, korálky, zlaťáky, kamarádky), jména z pevného seznamu (Ema, Anička, Klárka, Terka, Bára). Vybrat a vyladit text sám.
- [ ] **Step 4:** `npm test` → PASS; vypsat po 5 ukázkách z každé obtížnosti do scratchpadu a přečíst je očima (gramatika).
- [ ] **Step 5:** Commit „Slovní úlohy“.

### Task 4: Obtížnost zvlášť pro každou kategorii, truhla a odměny

**Files:**
- Modify: `src/lib/difficulty.ts`, `src/lib/economy.ts`
- Test: `src/tests/difficulty.test.ts`, `src/tests/economy.test.ts`

**Interfaces:**
- Produces: `interface TopicProgress { tier: Tier; correctStreak: number; mistakeStreak: number }`,
  `stepTier(tier, allowed: readonly Tier[], direction: 1 | -1): Tier` (nejbližší zaškrtnutá v daném směru, jinak beze změny),
  `clampTier(tier, allowed): Tier` (je-li zaškrtnutá, zůstane; jinak nejbližší, při shodě lehčí),
  `updateTopicProgress(p, correct: boolean, allowed): { progress: TopicProgress; tierChange: -1 | 0 | 1 }` (5 správně → výš, 2 chyby → níž, posun nuluje řady),
  `skipTopicProgress(p, allowed): { progress; tierChange }` (hned níž, řady 0),
  `updateChestStreak(streak: number, correct: boolean): { streak: number; chest: boolean }` (5 správně → `chest: true`, streak 0; chyba/přeskočení → 0),
  `rewardForCorrect(tier: Tier): number`. Staré `updateDifficulty`/`skipProblem`/`clampLevel` a `rewardForCorrect(level)` odstranit.

- [ ] **Step 1: Testy:** posun nahoru/dolů jen mezi zaškrtnutými, mezera `['easy','hard']` skočí `easy → hard` i zpět, na kraji zůstane, přeskočení sníží a vynuluje, chyba nuluje řadu správných, truhla po každých 5 správných, odměny `10/10/15`.
- [ ] **Step 2:** FAIL. **Step 3:** Implementace. **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit „Obtížnost zvlášť pro každou kategorii“.

### Task 5: Úspěšnost, doporučení a měření času

**Files:**
- Create: `src/lib/practice.ts`, `src/lib/stopwatch.ts`
- Test: `src/tests/practice.test.ts`, `src/tests/stopwatch.test.ts`

**Interfaces:**
- Produces (`practice.ts`): `RECENT_WINDOW = 20`, `MIN_RESULTS = 10`, `HIGH_RATE = 0.95`, `LOW_RATE = 0.25`,
  `TIME_LIMIT_MS: Record<TopicId, number>` (30 000, `wordProblems` 90 000),
  `isSuccess(topic, firstTryCorrect: boolean, activeMs: number): boolean`,
  `recordResult(practice, key, success): Practice` (připojí, drží max 20, `total + 1`),
  `successRate(record?: PracticeRecord): number | null` (null pod 10 výsledků),
  `interface Recommendation { topic: TopicId; tier: Tier; rate: number; action: 'add' | 'remove'; targetTier: Tier }`,
  `recommendations(topics: TopicSettings, practice: Practice): Recommendation[]` (pravidla z tabulky spec; jen zaškrtnuté obtížnosti; přeskočit, když `snoozedAtTotal !== null && total - snoozedAtTotal < 20`; nejvýš jedno na kategorii – to s nejnižší úspěšností; pořadí podle `TOPIC_IDS`),
  `snooze(practice, key): Practice`, `clearTiers(practice, topic, tiers: Tier[]): Practice`.
- Produces (`stopwatch.ts`): `class ActiveStopwatch { constructor(now: () => number); setRunning(running: boolean): void; reset(): void; elapsedMs(): number }` – čas běží jen při `running = true`.

- [ ] **Step 1: Testy:** každý řádek tabulky doporučení (4 případy) + „nejtěžší s ≥95 % → nic“ + „jediná lehká < 25 % → nic“ + méně než 10 výsledků → nic + jen zaškrtnuté + priorita nízké úspěšnosti + „Teď ne“ do 20 dalších výsledků; okno drží 20; `isSuccess` hranice 30 000 / 90 000 ms; stopky: pauza nepočítá, opakované `setRunning(true)` nezdvojí čas, `reset` nuluje.
- [ ] **Step 2:** FAIL. **Step 3:** Implementace. **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit „Úspěšnost, doporučení a měření času“.

### Task 6: Uložený stav v2 a převod z v1

**Files:**
- Modify: `src/types/index.ts` (SaveData v2, Settings v2; `Level`, `LEVELS`, `PROBLEM_TYPES`, `ProblemType` přesunout do `storage.ts` jako interní typy v1)
- Modify: `src/lib/storage.ts`
- Test: `src/tests/storage.test.ts`

**Interfaces:**
- Produces: `Settings = { soundOn: boolean; topics: TopicSettings }`;
  `SaveData = { saveVersion: 2; gold; owned; equipped; badges; stats: { totalCorrect; multiplicationStreak }; currentTier: Record<TopicId, Tier>; practice: Practice; settings: Settings; parentPinHash: string | null }`;
  `SAVE_VERSION = 2`; `createDefaultSave()` (všechny obtížnosti zaškrtnuté, `currentTier` vše `easy`, `practice: {}`);
  `parseSave(raw): SaveData | null` přijme v1 i v2; `migrateTopicsFromV1(enabledTypes, minLevel, maxLevel): TopicSettings` (mapování přesně podle spec, `wordProblems` prázdné);
  `currentTier` po převodu = nejnižší zaškrtnutá obtížnost (u vypnuté kategorie `easy`).
- Validace v2: neznámé obtížnosti zahodit, duplicity odstranit; žádná zaškrtnutá obtížnost nikde → `allTiersOn()`; `currentTier` srovnat `clampTier`; neplatné záznamy `practice` zahodit (recent jen boolean, max 20, `total ≥ recent.length`, `snoozedAtTotal` null nebo 0…total).

- [ ] **Step 1: Testy:** výchozí stav projde vlastní validací; převod **reálného v1 save** (fixture: PIN `fnv1a:39e21db5`, 131 zlaťáků, `owned` s korunkou, korunka na sobě, odznaky `first-step` a `times-table-star`, `enabledTypes` všechny, stupně 2–3, zvuk vypnutý) zachová vše a vytvoří `topics` dle mapování; v1 jen s `multiplication` 1–1 → jen `multiplication: ['easy']`; poškozená data dál vrací výchozí stav a záloha `panenka_save_corrupt` funguje; neplatné `practice` záznamy zahozeny; ukládání v2 + načtení = totéž.
- [ ] **Step 2:** FAIL. **Step 3:** Implementace. **Step 4:** `npm test` → PASS (testy ostatních modulů, které používají staré pole, opravit v Tasku 7; pokud padají už teď, opravit je tady minimálně).
- [ ] **Step 5:** Commit „Uložený stav v2 s převodem z v1“.

### Task 7: Operace nad stavem (Akademie, rodič, odznaky)

**Files:**
- Modify: `src/lib/academy.ts`, `src/lib/parent.ts`
- Test: `src/tests/academy.test.ts`, `src/tests/parent.test.ts`, `src/tests/badges.test.ts`

**Interfaces:**
- Consumes: Tasky 1, 4, 5, 6.
- Produces (`academy.ts`): `applyCorrectAnswer(save, problem, nextTier, success): { save; reward }` (zlaťáky dle `problem.tier`, `totalCorrect + 1`, řada násobilky když `problem.topic === 'multiplication'`, `currentTier[topic] = nextTier`, `practice` záznam `success` u `practiceKey(problem.topic, problem.tier)`),
  `applyWrongAnswer(save, problem, nextTier)` (bez záznamu úspěšnosti), `applySkippedProblem(save, problem, nextTier)` (jako chyba + záznam `false`), `addGold` beze změny.
- Produces (`parent.ts`): `updateTopics(save, topics): SaveData` (nastaví, srovná `currentTier`, smaže `practice` odškrtnutých obtížností), `acceptRecommendation(save, rec): SaveData` (přidá/odebere `targetTier` přes `updateTopics`), `snoozeRecommendation(save, rec): SaveData`,
  `resetProgress` (nově maže i `practice` a vrací `currentTier` na nejnižší zaškrtnutou), `importProgress` přes `parseSave` (v1 i v2). `updateSettings` a `toggleLevelRange` odstranit.

- [ ] **Step 1: Testy:** odměny 10/15 dle obtížnosti příkladu; záznam úspěšnosti jen při dokončení (správně/přeskočeno), ne při chybě; řada násobilky jen pro `multiplication`; `updateTopics` – odškrtnutí právě hrané obtížnosti srovná `currentTier` a smaže její historii; přijetí doporučení „add“/„remove“; „Teď ne“; reset maže `practice`, nechává `topics`, PIN, zvuk; import v1 zálohy projde a doplní odznaky/korunku; stávající testy odznaků upravit na v2.
- [ ] **Step 2:** FAIL. **Step 3:** Implementace. **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit „Operace nad stavem pro kategorie a úspěšnost“.

### Task 8: UI – Krok 1, editor kategorií, rodičovský panel, Akademie

**Files:**
- Create: `src/components/practice/TopicEditor.tsx`, `src/components/lock/PracticePicker.tsx`
- Modify: `src/components/lock/TimePicker.tsx` (popisek „Krok 2 ze 2“, tlačítko „Zpět“, prop `onBack`),
  `src/App.tsx` (stav odemykání `'none' | 'pin' | 'practice' | 'time'`; po PINu i po prvním nastavení PINu → `practice`; `academyKey` = generace + `JSON.stringify(settings.topics)`),
  `src/hooks/useGameState.ts` (`changeTopics`, `acceptRecommendation`, `snoozeRecommendation`, nové signatury odpovědí),
  `src/components/parent/ParentPanel.tsx` (sekce „Typy příkladů“ a „Obtížnost“ → `TopicEditor` s procenty; řádek „Současný stupeň“ pryč),
  `src/components/screens/AcademyScreen.tsx`, `src/components/math/ProblemCard.tsx` (zobrazí `story` nad okénkem odpovědi).

**Interfaces:**
- `TopicEditor({ topics, onToggle(topic, tier), rates?: Partial<Record<PracticeKey, number | null>> })` – řádek na kategorii, tři tlačítka se slovy, vypnutá kategorie šedá, tlačítka min. 48 px (rodičovská obrazovka).
- `PracticePicker({ save, onToggle, onAccept(rec), onSnooze(rec), onNext })` – „Krok 1 ze 2“, „Co dnes procvičíme?“, karty doporučení („{Kategorie} – {obtížnost}: {N} % správně“, „Přidat {obtížnost}?“/„Odebrat {obtížnost}?“, tlačítka „Přidat“/„Odebrat“ a „Teď ne“), pod nimi `TopicEditor`, tlačítko „Dál“.
- Akademie: stav `Record<TopicId, TopicProgress>` z `save.currentTier`; výběr `pickTopic(enabledTopics(...))`; hvězdičky = `chestStreak`; `ActiveStopwatch` běží jen když `active` prop (`tab === 'academy'`) a `document.visibilityState === 'visible'`, reset při novém příkladu; `firstTryCorrect` = žádná chyba v tomto příkladu; při správné odpovědi `success = isSuccess(topic, firstTryCorrect, elapsed)`. Zamykání (`lockRequested`, `onBusyChange`) a přeskočení zůstávají.

- [ ] **Step 1:** `npm run build` → zelené (typy všude sedí).
- [ ] **Step 2:** `npm test` → PASS.
- [ ] **Step 3: Prohlížeč (dev server, mobilní 375 × 812, PIN testovací 1234):**
  - Nová hra: PIN → Krok 1 (vše zaškrtnuté) → odškrtnout → „Dál“ → Krok 2 → „Zpět“ vrátí na Krok 1 se zachovaným výběrem → hra.
  - Poslední zaškrtnutá obtížnost nejde odškrtnout; mezera lehké + těžké jde.
  - Do localStorage vložit `practice` s 12 výsledky 100 % na `multiplication:easy` → Krok 1 ukáže „Malá násobilka – lehké: 100 % správně / Přidat střední?“; „Přidat“ zaškrtne střední; „Teď ne“ kartu skryje a po obnovení se neukáže.
  - Akademie: slovní úloha se zobrazí jako text + okénko; kategorie mimo zaškrtnuté se nikdy neobjeví (20 příkladů); po správné odpovědi se zapíše výsledek do `practice`; čas v Šatníku se nezapočítá.
  - Převod: vložit v1 save z Review Focus 1 → po načtení vše zachováno, Krok 1 ukazuje přeložené kategorie.
  - Rodičovský panel: editor s procenty, reset a import fungují.
- [ ] **Step 4:** Commit „Kategorie úloh v UI: Krok 1, editor a Akademie“.

### Task 9: Dokumentace a nasazení

**Files:** Modify `CLAUDE.md` (sekce Akademie, stupně → kategorie, rodičovský panel, data v2).

- [ ] **Step 1:** Přepsat tabulku stupňů na tabulku kategorií, doplnit úspěšnost, doporučení, Krok 1/2 a `saveVersion: 2`.
- [ ] **Step 2:** `npm test` a `npm run build` → zelené.
- [ ] **Step 3:** Commit „CLAUDE.md: kategorie úloh“.
- [ ] **Step 4:** Zeptat se rodiče na odeslání na GitHub (push = nasazení).
