# Levnější odměny, velký obchod a doplňky podle místa na těle

Datum: 2026-10-18 · Stav: **schváleno rodičem, zatím nepostaveno** · Projekt: Panenka (`D:\Claude\panenka`)

## Proč

Po 15 minutách hraní si dcera koupí celý obchod (12 kousků za 480 zlaťáků) – chybí dlouhodobý cíl.
Doplňky se navzájem vylučují, i když se na panence nepřekrývají (brýle sundají náhrdelník), což
působí nelogicky.

## Cíle (schváleno)

1. **Odměny na polovinu**
   - Za správnou odpověď: lehké a střední **5** (dnes 10), těžké **8** (dnes 15).
   - Bonusová truhla: **10–20** (dnes 20–40).
   - Kolo (10 příkladů) tak vynese zhruba 50–80 zlaťáků.
2. **Mnohem víc věcí v obchodě**
   - **Aspoň 10 kousků v každé kategorii** vlasy, šaty, boty (dnes 3 + 1 startovní); doplňků
     zhruba **16**, rozdělených podle místa na těle (bod 3).
   - Barevné varianty i nové tvary, např. vlasy: culík, drdol, kudrny, copánky, mikádo…;
     šaty: kalhoty s tričkem, sportovní, plavky, princeznovské…; boty: gumáky, brusle, kozačky…;
     doplňky: čelenka, klobouček, šála, deštník, náušnice…
   - Ceny roztažené zhruba **20–150 zlaťáků** (levné ~20–40, hezčí ~50–80, nejkrásnější ~100–150;
     doplňky spíš levnější), celý obchod kolem **3000 zlaťáků** ≈ 2–3 týdny hraní po 15 minutách.
   - Grafika: SVG ve stejném stylu a společném plátně 300 × 600 jako dosud.
3. **Doplňky podle místa na těle**
   - Místa: **hlava** (mašle, korunka, čelenka, klobouček), **obličej** (brýle), **krk** (náhrdelník,
     šála), **ruka** (kabelka, deštník), případně **uši** (náušnice).
   - Na každém místě nejvýš jedna věc; různá místa najednou (brýle + náhrdelník + kabelka).
     Další věc na stejné místo tu předchozí vymění. Doplňky jde sundat jako dosud.

## Ne-cíle

- Nové obrazovky, nové měny, nákup za skutečné peníze, nový způsob vydělávání.
- Změna kategorií úloh, časového zámku nebo odznaků (korunka zůstává odměnou za Násobilkovou
  hvězdu, patří na místo „hlava“).

## Anti-cíle

- Aktualizace na telefonu nesmí sebrat zlaťáky, koupené ani nasazené věci (nasazené doplňky se
  převedou na svá místa).
- Obchod nesmí být nepřehledný: na telefonu (375 × 812) musí jít v obchodě i šatníku pohodlně listovat.

## Dopady na data (návrh pro stavitele)

- `items.json`: nové kousky; doplňky dostanou pole `slot` (`head` | `face` | `neck` | `hand` | `ears`).
  Stávající id zůstávají beze změny.
- `equipped`: místo jednoho `accessory` nasazení po místech (např. `accessory:head`,
  `accessory:neck`…). To mění uložený formát → `saveVersion: 3` s převodem z v2 (a v1 přes v2):
  dosavadní `equipped.accessory` se přesune na místo daného kousku.
- `economy.ts`: `rewardForCorrect` 5/5/8, truhla 10–20; upravit testy v `economy.test.ts`,
  `academy.test.ts` a texty, které zmiňují „+10“.
- Šatník: u doplňků vidět, co je nasazené na kterém místě; náhledy (`thumbnailViewBox`) pro nové kousky.
- Obchod: víc položek – zvážit řazení podle ceny v rámci kategorie.

## Na stavitelovi

- Přesný seznam kousků, názvy (česky, 1. pád), barvy, tvary a ceny v rámci rozsahů výše.
- Zda „uši“ jako místo vůbec zařadit (podle toho, jestli náušnice budou na panence vidět).
- Jak v šatníku přehledně ukázat více nasazených doplňků.
- Rozdělení práce do commitů; testy napřed (ekonomika, převod dat v2 → v3, nasazování po místech,
  validace katalogu – aspoň 10 kousků na kategorii, ceny v rozsahu, každý doplněk má `slot`).

## Další krok

Je to projekt s psaným návrhem → podle postupu **superpowers:writing-plans** sepsat plán stavby,
nechat ho rodiči schválit a postavit (rodič dosud volil „postav to sám v tomto rozhovoru
a na konci nech vše zkontrolovat“).
