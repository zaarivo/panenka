# Peníze a hodiny – plán stavby

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Do Akademie přibudou dvě nové kategorie úloh, Peníze (`money`) a Hodiny (`clock`), se třemi obtížnostmi, odpovědí času s automatickou dvojtečkou a ručičkovými hodinami.

**Architecture:**
- Čistá logika úloh je v `lib/money.ts` a `lib/clock.ts`. Vrací data úlohy nezávislá na `TopicId`.
- `mathGenerator.ts` je zabalí do příkladů. Čas je nový druh příkladu `kind: 'time'` s číselnou odpovědí `hodiny × 100 + minuty` (4:45 → 445), takže porovnání odpovědi zůstává číselné.
- UI rozšíří `ProblemCard` (štítky cen, ciferník, zobrazení času) a `NumericKeyboard` (`minDigits`).

**Tech Stack:** Vite + React 19 + TypeScript, Tailwind 4, Vitest (prostředí `node`).

**Spec:** `docs/superpowers/specs/2026-10-18-penize-hodiny-design.md`

## Global Constraints

- Nové `TopicId`: `money` („Peníze“), `clock` („Hodiny“), v `TOPIC_IDS` na konci za `wordProblems`.
- Obtížnosti Peněz:
  - lehké: ceny 1–10 Kč, nejvýš 2 kusy od věci, celkem do 20 Kč; „zbyde“ ze 20 Kč;
  - střední: 2–3 různé věci po 1 kuse, ceny do 50 Kč, celkem do 100 Kč; „zbyde“ ze 100 Kč;
  - těžké: ceny 1–10 Kč, 2–5 kusů od každé věci, celkem do 100 Kč; „zbyde“ ze 100 Kč, také s kusy.
- U Peněz je výsledek vždy celé číslo ≥ 1. U „zbyde“ se nákup vejde do peněz a zbyde aspoň 1 Kč.
- Obtížnosti Hodin:
  - lehké: celé hodiny a půl;
  - střední: navíc čtvrt a třičtvrtě;
  - lehké i střední jsou slovy i na ciferníku;
  - těžké: jen ciferník, minuty po 5.
- Hodiny jsou 1–12. Platí: „půl 1“ = 12:30, „čtvrt na 1“ = 12:15, „třičtvrtě na 1“ = 12:45, „12 hodin“ = 12:00. Čísla hodin se píšou číslicí („půl 6“).
- Čas slovy: „N hodin“ (1 hodina, 2–4 hodiny, 5–12 hodin), „půl N+1“, „čtvrt na N+1“, „třičtvrtě na N+1“.
- Odpověď času:
  - až 4 číslice, dvojtečka se zobrazí před posledními dvěma (445 → „4:45“);
  - 1–2 číslice se zobrazí bez dvojtečky;
  - „Hotovo“ je aktivní až od 3 číslic;
  - při 1–2 číslicích je pod okénkem text „Napiš i minuty, třeba 5:00.“
- Texty:
  - otázky: ciferník „Kolik je hodin?“, slovy „Kolik je to na digitálních hodinách?“;
  - za okénkem odpovědi u peněz „Kč“;
  - přeskočení: „Nevadí! Správně je 4:45.“ / „… 26 Kč.“
- Nápovědy (nikdy neprozradí výsledek):
  - Peníze kolik stojí: „Spočítej 3 × 4 Kč a 2 × 7 Kč a sečti.“ (u 1 kusu jen „4 Kč“);
  - Peníze zbyde: „Od 20 Kč odečti 4 Kč a pak 7 Kč.“ (s kusy „Od 100 Kč odečti 3 × 6 Kč a pak 4 × 5 Kč.“);
  - Hodiny slovy:
    - půl: „Půl 6 je půl hodiny před 6. hodinou.“
    - čtvrt: „Čtvrt na 3 je čtvrt hodiny po 2. hodině.“
    - třičtvrtě: „Třičtvrtě na 5 je čtvrt hodiny před 5. hodinou.“
    - celá: „Celá hodina má 0 minut, napiš :00.“
  - Ciferník: „Krátká ručička ukazuje hodiny, dlouhá minuty. Každé číslo na ciferníku je 5 minut.“
- Ciferník (SVG): bílý, fialový okraj, čísla 1–12. Krátká růžová ručička hodin se posouvá plynule podle minut, dlouhá fialová ručička minut.
- Vnitřní limit úspěchu: `money` a `clock` mají 60 000 ms.
- Výchozí stav: `money` a `clock` jsou vypnuté (`[]`) při první instalaci i v uložení, kde chybí. Ostatních 6 kategorií zůstává výchozí zapnutých.
- Bez nové verze uložení (chybějící klíče už dnes znamenají vypnuto, 0 a výchozí obtížnost). Bez nových závislostí.

## Review Focus

1. **Generátory Peněz nikdy nevyrobí záporný nebo nulový výsledek ani nákup přes limit.** Test na stovkách náhodných semínek pro každou obtížnost (Task 1).
2. **Přechod přes 12:** „půl 1“ = 12:30, „čtvrt na 1“ = 12:15, „třičtvrtě na 1“ = 12:45. Tvary „1 hodina“, „3 hodiny“, „5 hodin“ (Task 2).
3. **Stejný ciferník dvakrát po sobě nepřijde a generátor se nezacyklí.** Klíč příkladu musí obsahovat čas (Task 3).
4. **Uložení v4 bez `money`/`clock`:** načte se, obě kategorie jsou vypnuté, počty 0 a nic nespadne. Obrazovka Medaile má 8 karet (Task 3 test, Task 4 prohlížeč).
5. **Odpověď s nulou v minutách** (1:05 napsané jako 1 0 5) se vyhodnotí správně. Odpověď 4:75 je jen špatná, nespadne (Task 3).

---

### Task 1: Úlohy na peníze (`lib/money.ts`)

**Files:**
- Create: `src/lib/money.ts`
- Test: `src/tests/money.test.ts`

**Interfaces:**
- Produces:
  - `interface MoneyTask { story: string; tags: string[]; answer: number; hint: string; kind: 'total' | 'change' }`;
  - `buildMoneyTask(tier: Tier, rng: Rng): MoneyTask`, kde `tags` jsou štítky cen ve tvaru „🎀 4 Kč“, jeden na každou věc.

- [ ] **Step 1: Testy** `money.test.ts` (deterministické RNG ze `src/tests/seededRng.ts`, 300 semínek na obtížnost):
  - `'lehké: ceny 1–10, nejvýš 2 kusy, celkem do 20, zbyde ze 20'`;
  - `'střední: 2–3 věci po kusu, ceny do 50, celkem do 100'`;
  - `'těžké: ceny 1–10, 2–5 kusů, celkem do 100'`;
  - `'výsledek je vždy celé číslo ≥ 1'`;
  - `'objeví se oba druhy úloh'` (`total` i `change`);
  - `'počet štítků odpovídá počtu věcí'`;
  - `'nápověda neobsahuje výsledek'` (`hint` neobsahuje `String(answer) + ' Kč'`).

  Ověřovat přes čísla, která `buildMoneyTask` použila. Vrací je i interní `buildMoneyParts(tier, rng): { items: { price: number; count: number }[]; budget: number | null }`, které je exportované jen pro testy. `MoneyTask` je z nich odvozený.

- [ ] **Step 2: Spustit testy.** Run: `npx vitest run src/tests/money.test.ts`. Expected: FAIL (modul neexistuje).

- [ ] **Step 3: Implementovat**
  - Věci jsou z prostředí hry, každá má 1. pád jednotného čísla, tvary 4. pádu (`noun` jako v `wordProblems.ts`) a emoji. Asi 6 věcí: mašle 🎀, sponka 📎, korálky 📿, nálepka ⭐, bonbon 🍬, kytička 🌸.
  - Úlohy se generují opakovaným losováním, dokud nesplní limity obtížnosti.
  - Texty:
    - kolik stojí: „Mašle stojí 4 Kč a sponka 7 Kč. {Jméno} si koupí 3 mašle a 2 sponky. Kolik zaplatí?“ (u 1 kusu „1 mašli“);
    - zbyde: „{Jméno} má 20 Kč. Koupí si mašli za 4 Kč a sponku za 7 Kč. Kolik jí zbyde?“ (s kusy „3 mašle po 6 Kč“).
  - Jména jsou `NAMES` z `wordProblems.ts` (exportovat).

- [ ] **Step 4: Spustit testy.** Run: `npm test`. Expected: PASS.

- [ ] **Step 5: Commit** „Úlohy na peníze“

### Task 2: Úlohy na hodiny (`lib/clock.ts`)

**Files:**
- Create: `src/lib/clock.ts`
- Test: `src/tests/clock.test.ts`

**Interfaces:**
- Produces:
  - `interface ClockTask { hours: number; minutes: number; mode: 'words' | 'face'; words: string | null; hint: string }`;
  - `buildClockTask(tier: Tier, rng: Rng): ClockTask`;
  - `timeInWords(hours: number, minutes: 0 | 15 | 30 | 45): string`;
  - `timeAnswer(hours: number, minutes: number): number` (= `hours * 100 + minutes`);
  - `formatTimeDigits(digits: string): string` (vloží dvojtečku před poslední 2 číslice, když jich je ≥ 3).

- [ ] **Step 1: Testy** `clock.test.ts`:
  - `'čas slovy'`:
    - `timeInWords(5, 30)` je „půl 6“, `(2, 15)` je „čtvrt na 3“, `(4, 45)` je „třičtvrtě na 5“;
    - celé hodiny: `(1, 0)` „1 hodina“, `(3, 0)` „3 hodiny“, `(5, 0)` „5 hodin“, `(12, 0)` „12 hodin“.
  - `'přechod přes 12'`: `(12, 30)` „půl 1“, `(12, 15)` „čtvrt na 1“, `(12, 45)` „třičtvrtě na 1“.
  - `'odpověď jako číslo'`: `timeAnswer(4, 45)` = 445, `timeAnswer(12, 30)` = 1230, `timeAnswer(1, 5)` = 105.
  - `'zobrazení číslic'`: `formatTimeDigits` dává `'4'` → `'4'`, `'44'` → `'44'`, `'445'` → `'4:45'`, `'1230'` → `'12:30'`.
  - `'obtížnosti'` (300 semínek):
    - lehké: minuty ∈ {0, 30};
    - střední: minuty ∈ {0, 15, 30, 45};
    - těžké: `mode === 'face'` a minuty jsou násobek 5;
    - hodiny vždy 1–12;
    - u lehké a střední se objeví oba režimy;
    - u `'words'` platí `words === timeInWords(...)`.
  - `'nápověda neprozradí čas'`: `hint` neobsahuje `${hours}:${mm}`.

- [ ] **Step 2: Spustit testy.** Run: `npx vitest run src/tests/clock.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implementovat** podle Global Constraints (texty nápověd, slova, tvary hodin přes `plural`).

- [ ] **Step 4: Spustit testy.** Run: `npm test`. Expected: PASS.

- [ ] **Step 5: Commit** „Úlohy na hodiny“

### Task 3: Nové kategorie v generátoru, nastavení a uložení

**Files:**
- Modify: `src/types/index.ts` (TOPIC_IDS)
- Modify: `src/lib/topics.ts` (TOPIC_LABELS, `defaultTopics`)
- Modify: `src/lib/practice.ts` (TIME_LIMIT_MS)
- Modify: `src/lib/mathGenerator.ts` (Problem, BUILDERS, klíč, `formatAnswer`)
- Modify: `src/lib/storage.ts` (výchozí stav)
- Test: `src/tests/mathGenerator.test.ts`, `src/tests/storage.test.ts`, `src/tests/topics.test.ts` a testy s pevným výčtem 6 kategorií (`medals.test.ts` 18 → 24, `storage.test.ts`, `practice.test.ts`, `topics.test.ts`)

**Interfaces:**
- Consumes: `buildMoneyTask` (Task 1), `buildClockTask`, `timeAnswer`, `formatTimeDigits` (Task 2).
- Produces:
  - `TOPIC_IDS = [..., 'wordProblems', 'money', 'clock']`;
  - `defaultTopics(): TopicSettings`: všechny obtížnosti, `money` a `clock` mají `[]`;
  - `ProblemBase` dostane nepovinné `tags?: string[]`, `clock?: { hours: number; minutes: number }`, `unit?: 'Kč'`;
  - `TimeProblem = ProblemBase & { kind: 'time'; answer: number }` a `Problem = NumberProblem | ComparisonProblem | TimeProblem`;
  - `formatAnswer(problem: Problem): string`, které dává „4:45“, „26 Kč“, „12“ nebo „<“.
- Tvary příkladů:
  - Peníze: `kind: 'number'`, `prompt: '?'`, `story`, `tags`, `unit: 'Kč'`.
  - Hodiny `face`: `kind: 'time'`, `story: 'Kolik je hodin?'`, `prompt: '?'`, `clock`.
  - Hodiny `words`: `kind: 'time'`, `story: 'Kolik je to na digitálních hodinách?'`, `prompt: '<slova> = ?'`.
  - Klíč příkladu obsahuje i `clock` (`…|h:m`).

- [ ] **Step 1: Testy**
  - `mathGenerator.test.ts`:
    - `'peníze a hodiny se generují pro všechny obtížnosti'`;
    - `'stejný ciferník nepřijde dvakrát po sobě'` (`previousKey` u `clock`/`hard`, 200 opakování, klíč se liší vždy, když se liší čas);
    - `'odpověď času'`: `isCorrectAnswer(timeProblem(1, 5), Number('105'))` je true a `Number('475')` je false;
    - `'formatAnswer'`: „4:45“, „26 Kč“, číslo, znaménko.
  - `storage.test.ts`:
    - `'nová hra má peníze a hodiny vypnuté'`;
    - `'uložení bez peněz a hodin: vypnuté, počty 0'`: v4 save bez klíčů `money`/`clock` v `topics`, `currentTier` a `correctByTopic` → `topics.money` je `[]`, `correctByTopic.clock` je 0.
  - `practice.test.ts`: `'limit u peněz a hodin je minuta'` (`isSuccess('money', true, 60_000)` je true, `60_001` je false).
  - Upravit testy s pevným výčtem šesti kategorií (přidat `money`/`clock`, medailí je 24).

- [ ] **Step 2: Spustit testy.** Run: `npm test`. Expected: FAIL (nové testy).

- [ ] **Step 3: Implementovat**
  - `parseV2Topics` použije pro „nic zapnutého“ `defaultTopics()` místo `allTiersOn()`.
  - `createDefaultSave` použije `defaultTopics()`.
  - `allTiersOn` zůstává jen tam, kde je potřeba dál (rodičovský panel nebo testy). Pokud už ho nic nepotřebuje, smazat.

- [ ] **Step 4: Spustit testy a typy.** Run: `npm test` a `npx tsc -b --noEmit`. Expected: PASS a 0 chyb. Chyby typů v UI (`kind: 'time'`) vyřešit minimálně, správné zobrazení přijde v Task 4.

- [ ] **Step 5: Commit** „Kategorie Peníze a Hodiny v Akademii“

### Task 4: Zobrazení úloh, ciferník a klávesnice pro čas

**Files:**
- Create: `src/components/math/ClockFace.tsx`
- Modify: `src/components/math/ProblemCard.tsx`
- Modify: `src/components/math/NumericKeyboard.tsx` (`minDigits`)
- Modify: `src/components/screens/AcademyScreen.tsx`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: `formatTimeDigits` (Task 2); `formatAnswer`, `TimeProblem`, `tags`/`clock`/`unit` (Task 3).
- Produces:
  - `ClockFace({ hours, minutes, className })`;
  - `NumericKeyboard` s nepovinným `minDigits` (výchozí 1): „Hotovo“ je neaktivní, dokud `value.length < minDigits`.

- [ ] **Step 1: Implementovat**
  - `ProblemCard`:
    - štítky `tags` pod textem úlohy (`bg-amber-100 text-amber-800 rounded-xl`);
    - `ClockFace` asi 160 px, když je `clock`;
    - okénko u `kind: 'time'` zobrazuje `formatTimeDigits(answer)`;
    - za okénkem `unit`.
  - Ciferník: úhel hodinové ručičky je `(hours % 12) * 30 + minutes * 0.5`, minutové `minutes * 6`. Barvy podle Global Constraints.
  - `AcademyScreen`:
    - u `kind: 'time'` klávesnice `maxDigits={4}` a `minDigits={3}`;
    - při 1–2 číslicích text „Napiš i minuty, třeba 5:00.“ místo „Spočítej a klepni na Hotovo.“;
    - přeskočení zobrazí `formatAnswer(problem)` a do okénka dá číslice odpovědi.

- [ ] **Step 2: Ověřit v prohlížeči** (dev server `panenka-dev`, 375 × 812, zapnuté jen `money` a `clock`)
  - Projít aspoň 10 příkladů z každé obtížnosti:
    - text a štítky se vejdou;
    - ciferník ukazuje správně;
    - 4 4 5 → „4:45“ a správně;
    - 1 0 5 u 1:05 je správně;
    - při 2 číslicích je „Hotovo“ šedé s připomínkou;
    - přeskočení ukáže „Správně je 4:45.“
  - Obrazovka Medaile má 8 karet.
  - Ve výběru „Co dnes procvičíme?“ jsou Peníze a Hodiny vypnuté a dají se zapnout.
  - Nic nepřetéká do šířky, konzole je bez chyb.

- [ ] **Step 3: Aktualizovat `CLAUDE.md`:** tabulka kategorií (2 nové řádky), limity 60 s, výchozí vypnuto, odpověď času.

- [ ] **Step 4: Testy a build.** Run: `npm test` a `npm run build`. Expected: PASS.

- [ ] **Step 5: Commit** „Zobrazení peněz a hodin v Akademii“
